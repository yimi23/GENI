import { addActivity, addPillCheckResult } from '../state';
import { emitActivity } from '../socket';
import { analyzePillImage } from './vision';
import { analyzeMedicationAdherence, type CompartmentStates } from './medication-adherence';
import { generatePillCheckResponse } from './geni-brain';
import { notifyMedicationCheck, shouldNotifyCaregiver, sendCaregiverUpdate } from './caregiver-updates';
import { savePillCheck } from '../database/pillCheckHistory';
import { continuousVision } from './continuous-vision';
import { conversationMemory } from './conversation-memory';
import { config } from '../config';
import { fallPoseStream } from './fall-pose-stream';
import { fallDetectionService } from './fall-detection';

type PipelineSource = 'manual' | 'continuous';

interface VisionPipelineOptions {
  source: PipelineSource;
}

export interface VisionPipelineResult {
  vision: {
    timestamp: Date;
    observations: string;
    activity: string;
    pillStatus: 'present' | 'taken' | 'unclear';
    concerns: string[];
  };
  visionMessage: string | null;
  fallPose: any | null;
  pillCheck: {
    result: any;
    method: 'vision' | 'yolo';
    recordId: string;
    responseText: string;
    adherenceAnalysis: any | null;
    suppressed: boolean;
  };
}

const getTimeOfDay = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
};

export async function runVisionPipeline(
  imageBase64: string,
  options: VisionPipelineOptions
): Promise<VisionPipelineResult> {
  const fallPose = config.fallDetection.enabled && config.fallDetection.mode === 'frame'
    ? await fallPoseStream.analyzeFrame(imageBase64)
    : null;
  
  const visionAnalysis = await continuousVision.analyzeFrame(imageBase64);
  const suppressPillResponse = !!(fallPose?.emergencyTriggered || fallPose?.fallPrimed);
  const suppressContext = suppressPillResponse;
  const actionMessage = '';
  const visionMessage = await continuousVision.processAnalysis(visionAnalysis, {
    emitUpdates: options.source === 'continuous' && !suppressContext,
    speak: options.source === 'continuous' && !suppressContext,
    recordMemory: !suppressContext,
  });
  
  if (fallPose?.keypointsDetected) {
    console.log('🧠 Fall pose:', {
      noseY: fallPose.noseY,
      hipY: fallPose.hipY,
      shoulderY: fallPose.shoulderY,
      personDown: fallPose.personDown,
      fallPrimed: fallPose.fallPrimed,
      emergencyTriggered: fallPose.emergencyTriggered,
    });
    
    fallDetectionService.updateFromFrame(fallPose, config.patient.name);
  }
  
  const pillResult = await analyzePillImage(imageBase64);
  const method: 'vision' | 'yolo' = 'vision';
  
  const confidence = pillResult.confidence as 'high' | 'medium' | 'low';
  const observations = pillResult.observations;
  
  const savedRecord = savePillCheck(
    pillResult.status,
    confidence,
    observations,
    method
  );
  
  addPillCheckResult({
    status: pillResult.status,
    observations,
    confidence,
  });
  
  let activityMessage = '';
  if (pillResult.status === 'taken') {
    activityMessage = `Pills confirmed taken (${method} verification)`;
  } else if (pillResult.status === 'present') {
    activityMessage = `Pills still present (${method} check)`;
  } else {
    activityMessage = `Pill check unclear (${method} review needed)`;
  }
  
  const activity = addActivity(activityMessage, 'medication');
  emitActivity(activity);
  
  let adherenceAnalysis: any | null = null;
  let responseText = '';
  
  const compartments = 'compartments' in pillResult ? (pillResult as any).compartments : null;
  const hasCompartments = compartments && Object.keys(compartments).length > 0;
  
  if (hasCompartments) {
    adherenceAnalysis = analyzeMedicationAdherence(
      compartments as CompartmentStates
    );
    
    if (!suppressPillResponse) {
      responseText = adherenceAnalysis.message;
    }
    
    if (adherenceAnalysis.shouldAlertCaregiver && adherenceAnalysis.caregiverAlertMessage) {
      const priorityMap = {
        none: 'low' as const,
        low: 'low' as const,
        medium: 'medium' as const,
        high: 'high' as const,
        critical: 'urgent' as const,
      };
      
      const concernLevel = adherenceAnalysis.concernLevel as keyof typeof priorityMap;
      const priority = priorityMap[concernLevel];
      
      if (!suppressPillResponse && shouldNotifyCaregiver('medication_check', priority)) {
        sendCaregiverUpdate({
          type: 'medication_check',
          priority,
          message: adherenceAnalysis.caregiverAlertMessage,
          details: {
            adherenceAnalysis,
            visionResult: pillResult,
            method,
          },
        }).catch(error => {
          console.error('❌ Failed to send caregiver alert:', error);
        });
      }
    }
  } else if (!suppressPillResponse) {
    responseText = await generatePillCheckResponse({
      status: pillResult.status as 'taken' | 'present' | 'unclear',
      observations: observations,
    });
    
    if (shouldNotifyCaregiver('medication_check', pillResult.status === 'unclear' ? 'medium' : 'low')) {
      notifyMedicationCheck({
        status: pillResult.status as 'taken' | 'present' | 'unclear',
        observations: observations,
        method,
      }).catch(error => {
        console.error('❌ Failed to send caregiver update:', error);
      });
    }
  }
  
  if (!responseText && actionMessage) {
    responseText = actionMessage;
  }
  
  if (options.source === 'manual' && responseText) {
    const session = conversationMemory.getOrCreateSession(config.patient.name);
    conversationMemory.addMessage(session.id, 'geni', responseText, {
      timeOfDay: getTimeOfDay(),
      visionSnapshot: `${visionAnalysis.observations} | activity: ${visionAnalysis.activity} | pillStatus: ${visionAnalysis.pillStatus}`,
    });
  }
  
  return {
    vision: visionAnalysis,
    visionMessage,
    fallPose,
    pillCheck: {
      result: pillResult,
      method,
      recordId: savedRecord.id,
      responseText,
      adherenceAnalysis,
      suppressed: suppressPillResponse,
    },
  };
}
