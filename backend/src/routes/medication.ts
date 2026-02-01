import { Router, Request, Response } from 'express';
import multer from 'multer';
import { analyzePillImage } from '../services/vision';
import { detectPillsYOLO, checkYOLOAvailability } from '../services/yolo';
import { analyzePillBox, getMedicationContext } from '../services/pillbox';
import { state, addActivity, updateMedicationStatus } from '../state';
import { emitActivity, emitMedicationUpdate } from '../socket';
import { savePillCheck, getPillCheckHistory, getLastPillCheck } from '../database/pillCheckHistory';
import { generatePillCheckResponse } from '../services/geni-brain';
import { notifyMedicationCheck, shouldNotifyCaregiver, sendCaregiverUpdate } from '../services/caregiver-updates';
import { analyzeMedicationAdherence, type CompartmentStates } from '../services/medication-adherence';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Get medication history
router.get('/medication/history', (req: Request, res: Response) => {
  res.json({
    history: state.medicationHistory,
    today: state.todaysMedications,
  });
});

// Get pill check history
router.get('/medication/pill-check-history', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const history = getPillCheckHistory(limit);
    const lastCheck = getLastPillCheck();
    
    res.json({
      history,
      lastCheck,
      count: history.length,
    });
  } catch (error) {
    console.error('❌ Get pill check history error:', error);
    res.status(500).json({ error: 'Failed to get pill check history' });
  }
});

// Manual medication confirmation
router.post('/medication/confirm', (req: Request, res: Response) => {
  try {
    const { medicationName } = req.body;
    
    if (!medicationName) {
      return res.status(400).json({ error: 'Medication name is required' });
    }
    
    const success = updateMedicationStatus(medicationName, 'taken');
    
    if (success) {
      const activity = addActivity(`Medication confirmed: ${medicationName}`, 'medication');
      emitActivity(activity);
      emitMedicationUpdate(state.todaysMedications);
      
      res.json({ success: true, medications: state.todaysMedications });
    } else {
      res.status(404).json({ error: 'Medication not found' });
    }
    
  } catch (error) {
    console.error('❌ Medication confirm error:', error);
    res.status(500).json({ error: 'Failed to confirm medication' });
  }
});

// Pill check via camera (YOLOv8 + Claude Vision fallback)
router.post('/pill-check', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }
    
    // Read image as base64
    const fs = require('fs');
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString('base64');
    
    let result;
    let method: 'vision' | 'yolo' = 'vision'; // Default to Claude Vision (YOLO disabled - needs retraining)
    
    // Use Claude Vision as primary (intelligent compartment detection)
    console.log('👁️  Using Claude Vision for pill detection...');
    result = await analyzePillImage(base64Image);
    
    // YOLO disabled - not detecting pill organizers correctly
    // Uncomment below to re-enable YOLO when retrained:
    /*
    const useYOLO = req.query.method === 'yolo'; // Only if explicitly requested
    if (useYOLO) {
      console.log('🎯 Attempting YOLOv8 detection...');
      result = await detectPillsYOLO(base64Image);
      method = 'yolo';
    }
    */
    
    // Save to database (context only, not image)
    // Vision API always returns string confidence and observations
    const confidence = result.confidence as 'high' | 'medium' | 'low';
    const observations = result.observations;
    
    const savedRecord = savePillCheck(
      result.status,
      confidence,
      observations,
      method
    );
    
    // Log activity
    let activityMessage = '';
    if (result.status === 'taken') {
      activityMessage = `Pills confirmed taken (${method} verification)`;
    } else if (result.status === 'present') {
      activityMessage = `Pills still present (${method} check)`;
    } else {
      activityMessage = `Pill check unclear (${method} review needed)`;
    }
    
    const activity = addActivity(activityMessage, 'medication');
    emitActivity(activity);
    
    // NEW: Analyze medication adherence if compartments detected
    let adherenceAnalysis = null;
    let responseText = '';
    
    // Type guard to check if result has compartments (from Vision API)
    const hasCompartments = 'compartments' in result && result.compartments !== undefined;
    
    if (hasCompartments) {
      const compartments = (result as any).compartments;
      if (compartments && Object.keys(compartments).length > 0) {
        console.log('🔍 Compartments detected - running adherence analysis...');
        
        adherenceAnalysis = analyzeMedicationAdherence(
          compartments as CompartmentStates
        );
      
        console.log('📊 Adherence Analysis:', adherenceAnalysis);
        
        // Use adherence-aware message instead of generic pill check response
        responseText = adherenceAnalysis.message;
      
        // Send WhatsApp alert to caregiver if needed
        if (adherenceAnalysis.shouldAlertCaregiver && adherenceAnalysis.caregiverAlertMessage) {
          console.log('🚨 Sending caregiver alert via WhatsApp...');
          
          // Determine priority from concern level
          const priorityMap = {
            'none': 'low' as const,
            'low': 'low' as const,
            'medium': 'medium' as const,
            'high': 'high' as const,
            'critical': 'urgent' as const,
          };
          
          const priority = priorityMap[adherenceAnalysis.concernLevel];
          
          // Check if we should notify now (time-based throttling)
          if (shouldNotifyCaregiver('medication_check', priority)) {
            sendCaregiverUpdate({
              type: 'medication_check',
              priority,
              message: adherenceAnalysis.caregiverAlertMessage,
              details: {
                adherenceAnalysis,
                visionResult: result,
                method
              }
            }).catch(error => {
              console.error('❌ Failed to send caregiver alert:', error);
              // Don't fail the request if notification fails
            });
          }
        }
      }
    } else {
      // Fallback: No compartments detected, use generic response
      console.log('🧠 Generating contextual response with GENI brain...');
      responseText = await generatePillCheckResponse({
        status: result.status as 'taken' | 'present' | 'unclear',
        observations: observations
      });
      
      // Send update to caregiver (if appropriate time/priority)
      if (shouldNotifyCaregiver('medication_check', result.status === 'unclear' ? 'medium' : 'low')) {
        console.log('📤 Sending medication check update to caregiver...');
        notifyMedicationCheck({
          status: result.status as 'taken' | 'present' | 'unclear',
          observations: observations,
          method: method as 'vision' | 'yolo'
        }).catch(error => {
          console.error('❌ Failed to send caregiver update:', error);
          // Don't fail the request if notification fails
        });
      }
    }
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    res.json({
      ...result,
      method, // Return which method was used
      recordId: savedRecord.id, // Return database record ID
      responseText, // GENI brain-generated contextual response
      adherenceAnalysis, // NEW: Include adherence analysis if available
    });
    
  } catch (error) {
    console.error('❌ Pill check error:', error);
    res.status(500).json({ error: 'Failed to analyze pill image' });
  }
});

export default router;
