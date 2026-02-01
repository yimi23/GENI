import { state, getPrimaryContact } from '../state';
import { sendWhatsAppMessage } from './twilio';
import { addActivity } from '../state';

/**
 * Alert context for generating smart messages
 */
interface AlertContext {
  event: 'missed_medication' | 'symptom_reported' | 'fall_detected' | 'no_activity' | 'general_concern';
  medication?: string;
  symptom?: string;
  timeElapsed?: number; // minutes
  additionalContext?: string;
}

/**
 * Alert urgency levels
 */
type AlertUrgency = 'low' | 'medium' | 'high' | 'critical';

interface Alert {
  urgency: AlertUrgency;
  message: string;
  shouldCall: boolean; // Should we also make a voice call?
}

/**
 * Generate context-aware alert message
 */
export function generateContextualAlert(context: AlertContext): Alert {
  const patientName = state.patient.name.split(' ')[0];
  const primaryContact = getPrimaryContact();
  const caregiverName = primaryContact?.name || 'there';
  
  switch (context.event) {
    case 'missed_medication':
      return generateMedicationAlert(patientName, caregiverName, context);
    
    case 'symptom_reported':
      return generateSymptomAlert(patientName, caregiverName, context);
    
    case 'fall_detected':
      return generateFallAlert(patientName, caregiverName);
    
    case 'no_activity':
      return generateInactivityAlert(patientName, caregiverName, context);
    
    case 'general_concern':
      return generateGeneralAlert(patientName, caregiverName, context);
    
    default:
      return {
        urgency: 'low',
        message: `Hi ${caregiverName}, just a quick heads up about ${patientName}. Everything seems okay. - GENI`,
        shouldCall: false
      };
  }
}

/**
 * Medication-related alerts
 */
function generateMedicationAlert(
  patientName: string, 
  caregiverName: string, 
  context: AlertContext
): Alert {
  const timeElapsed = context.timeElapsed || 0;
  const medName = context.medication || 'medication';
  
  if (timeElapsed < 30) {
    // Low urgency - just missed by a bit
    return {
      urgency: 'low',
      message: `Hi ${caregiverName}, ${patientName} hasn't taken ${medName} yet (due ${timeElapsed} min ago). I've reminded her. Just keeping you in the loop. - GENI`,
      shouldCall: false
    };
  } else if (timeElapsed < 120) {
    // Medium urgency - over 30 minutes late
    return {
      urgency: 'medium',
      message: `Hi ${caregiverName}, ${patientName} missed ${medName} (${Math.round(timeElapsed / 60)}h ago). I've followed up with her. Might be worth a quick check-in when you have a moment. - GENI`,
      shouldCall: false
    };
  } else {
    // High urgency - over 2 hours late
    return {
      urgency: 'high',
      message: `${caregiverName}, ${patientName} hasn't taken ${medName} yet (due ${Math.round(timeElapsed / 60)}h ago). I've reminded her multiple times. Please call when you can. - GENI`,
      shouldCall: true
    };
  }
}

/**
 * Symptom-related alerts (combines medication + symptom)
 */
function generateSymptomAlert(
  patientName: string,
  caregiverName: string,
  context: AlertContext
): Alert {
  const symptom = context.symptom || 'not feeling well';
  const medication = context.medication;
  
  if (medication) {
    // Symptom + missed medication = higher urgency
    return {
      urgency: 'high',
      message: `Hi ${caregiverName}, ${patientName} mentioned feeling ${symptom}. She also hasn't taken her ${medication} yet. I've reminded her to sit down and rest. Please check in when you can. - GENI`,
      shouldCall: true
    };
  } else {
    // Just a symptom, no medication issue
    return {
      urgency: 'medium',
      message: `Hi ${caregiverName}, ${patientName} mentioned feeling ${symptom}. She seems okay otherwise, but wanted you to know. Might be worth a call to check in. - GENI`,
      shouldCall: false
    };
  }
}

/**
 * Fall detection alerts
 */
function generateFallAlert(patientName: string, caregiverName: string): Alert {
  return {
    urgency: 'critical',
    message: `🚨 ${caregiverName} - ${patientName} has fallen. I've detected a fall and am checking on her now. Please call her IMMEDIATELY. - GENI`,
    shouldCall: true
  };
}

/**
 * Inactivity alerts
 */
function generateInactivityAlert(
  patientName: string,
  caregiverName: string,
  context: AlertContext
): Alert {
  const hours = Math.round((context.timeElapsed || 120) / 60);
  
  if (hours < 3) {
    return {
      urgency: 'low',
      message: `Hi ${caregiverName}, I haven't heard from ${patientName} in about ${hours} hours. She might be napping or relaxing. Just wanted you to know. - GENI`,
      shouldCall: false
    };
  } else {
    return {
      urgency: 'medium',
      message: `Hi ${caregiverName}, no activity from ${patientName} in ${hours}+ hours. I've tried checking in but no response. Please call when you can. - GENI`,
      shouldCall: true
    };
  }
}

/**
 * General concern alerts
 */
function generateGeneralAlert(
  patientName: string,
  caregiverName: string,
  context: AlertContext
): Alert {
  return {
    urgency: 'medium',
    message: `Hi ${caregiverName}, ${patientName} ${context.additionalContext || 'needs some assistance'}. Wanted to let you know. - GENI`,
    shouldCall: false
  };
}

/**
 * Send alert to caregiver
 */
export async function sendAlertToCaregiver(context: AlertContext): Promise<boolean> {
  const primaryContact = getPrimaryContact();
  if (!primaryContact) {
    console.log('⚠️  No primary contact found for alert');
    return false;
  }
  
  const alert = generateContextualAlert(context);
  
  // Send WhatsApp message
  const success = await sendWhatsAppMessage(primaryContact.phone, alert.message);
  
  if (success) {
    addActivity(
      `Alert sent to ${primaryContact.name}: ${context.event} (${alert.urgency} urgency)`,
      'system'
    );
    console.log(`✅ Alert sent (${alert.urgency}): ${context.event}`);
  }
  
  // TODO: If shouldCall is true, also make a voice call
  // This would use the existing makeVoiceCall function from twilio.ts
  
  return success;
}

/**
 * Quick helper: Send reassuring "all is well" message
 */
export async function sendReassuranceMessage(): Promise<boolean> {
  const primaryContact = getPrimaryContact();
  if (!primaryContact) return false;
  
  const message = `Hi! Just checking in - ${state.patient.name.split(' ')[0]} is doing great today. All medications on track, active and engaged. 😊 - GENI`;
  
  return await sendWhatsAppMessage(primaryContact.phone, message);
}
