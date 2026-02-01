import { Router, Request, Response } from 'express';
import multer from 'multer';
import { analyzePillImage } from '../services/vision';
import { detectPillsYOLO, checkYOLOAvailability } from '../services/yolo';
import { analyzePillBox, getMedicationContext } from '../services/pillbox';
import { state, addActivity, updateMedicationStatus } from '../state';
import { emitActivity, emitMedicationUpdate } from '../socket';
import { savePillCheck, getPillCheckHistory, getLastPillCheck } from '../database/pillCheckHistory';
import { generatePillCheckResponse } from '../services/geni-brain';
import { notifyMedicationCheck, shouldNotifyCaregiver } from '../services/caregiver-updates';

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
    let method = 'unknown';
    
    // Try YOLOv8 first (faster, more accurate if trained)
    const useYOLO = req.query.method !== 'vision'; // Default to YOLO
    
    if (useYOLO) {
      console.log('🎯 Attempting YOLOv8 detection...');
      result = await detectPillsYOLO(base64Image);
      
      // If YOLOv8 is unclear, fall back to Claude Vision
      if (result.status === 'unclear' && result.confidence < 0.5) {
        console.log('⚠️  YOLOv8 unclear, falling back to Claude Vision...');
        result = await analyzePillImage(base64Image);
        method = 'vision';
      } else {
        method = 'yolo';
        console.log(`✅ YOLOv8 detection: ${result.status} (${result.confidence.toFixed(2)})`);
      }
    } else {
      // Explicitly requested Claude Vision
      console.log('👁️  Using Claude Vision...');
      result = await analyzePillImage(base64Image);
      method = 'vision';
    }
    
    // Save to database (context only, not image)
    // Handle different result types (Vision vs YOLO)
    const confidence = typeof result.confidence === 'string' 
      ? result.confidence 
      : result.confidence > 0.7 ? 'high' : result.confidence > 0.4 ? 'medium' : 'low';
    
    const observations = 'observations' in result 
      ? result.observations 
      : ('details' in result ? result.details : 'No additional details');
    
    const savedRecord = savePillCheck(
      result.status,
      confidence as 'high' | 'medium' | 'low',
      observations,
      method as 'vision' | 'yolo'
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
    
    // Generate contextual GENI brain response
    console.log('🧠 Generating contextual response with GENI brain...');
    const responseText = await generatePillCheckResponse({
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
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    res.json({
      ...result,
      method, // Return which method was used
      recordId: savedRecord.id, // Return database record ID
      responseText, // GENI brain-generated contextual response
    });
    
  } catch (error) {
    console.error('❌ Pill check error:', error);
    res.status(500).json({ error: 'Failed to analyze pill image' });
  }
});

export default router;
