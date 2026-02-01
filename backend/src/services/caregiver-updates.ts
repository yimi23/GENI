/**
 * Caregiver Update System
 * Automatically sends contextual updates to caregivers via WhatsApp/SMS
 */

import { state } from '../state';
import { sendWhatsAppMessage } from './twilio';
import { buildGENIContext } from './geni-context';

interface CaregiverUpdate {
  type: 'medication_check' | 'medication_taken' | 'medication_missed' | 'fall_detected' | 'unusual_activity' | 'daily_summary';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  message: string;
  details?: Record<string, any>;
}

/**
 * Send update to primary caregiver
 */
export async function sendCaregiverUpdate(update: CaregiverUpdate): Promise<void> {
  const primaryCaregiver = state.contacts.find(c => c.isPrimary);
  
  if (!primaryCaregiver) {
    console.warn('⚠️  No primary caregiver configured, skipping update');
    return;
  }

  console.log(`📤 Sending ${update.priority} priority update to ${primaryCaregiver.name}:`, update.type);
  
  try {
    await sendWhatsAppMessage(primaryCaregiver.phone, update.message);
    console.log('✅ Caregiver update sent successfully');
  } catch (error) {
    console.error('❌ Failed to send caregiver update:', error);
  }
}

/**
 * Generate contextual medication check update (CASUAL TONE FOR CAREGIVER)
 */
export async function notifyMedicationCheck(result: {
  status: 'present' | 'taken' | 'unclear';
  observations: string;
  method: 'vision' | 'yolo';
}): Promise<void> {
  const context = buildGENIContext();
  const now = new Date();
  
  // Real timestamp with date
  const dateStr = now.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  let message = '';
  
  // Casual, to the point messages for caregiver
  if (result.status === 'taken') {
    // Pills taken - simple confirmation
    message = `Pills taken 👍 (${dateStr})\n\n`;
    message += `${result.observations}`;
  } else if (result.status === 'present') {
    // Pills not taken - might need check-in
    message = `Pills not taken yet (${dateStr})\n\n`;
    message += `Saw: ${result.observations}\n\n`;
    
    if (context.overdueMedications.length > 0) {
      message += `Overdue:\n`;
      context.overdueMedications.forEach(med => {
        message += `  • ${med.name} (was due at ${med.time})\n`;
      });
      message += `\nMight want to check in.`;
    } else if (context.pendingMedications.length > 0) {
      message += `Pending:\n`;
      context.pendingMedications.forEach(med => {
        message += `  • ${med.name} (${med.time})\n`;
      });
    }
  } else {
    // Unclear - might need manual verification
    message = `Pill check unclear (${dateStr})\n\n`;
    message += `Couldn't tell for sure. ${result.observations}\n\n`;
    message += `Might need to check manually.`;
  }
  
  // Determine priority
  let priority: CaregiverUpdate['priority'] = 'low';
  if (result.status === 'unclear') {
    priority = 'medium';
  }
  if (context.overdueMedications.length > 0) {
    priority = 'high';
  }
  
  await sendCaregiverUpdate({
    type: 'medication_check',
    priority,
    message,
    details: { result, context },
  });
}

/**
 * Generate medication taken update (CASUAL TONE)
 */
export async function notifyMedicationTaken(medicationName: string): Promise<void> {
  const context = buildGENIContext();
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  
  let message = `${medicationName} taken 👍 (${timeStr})\n\n`;
  
  // Add remaining medications
  const remaining = context.pendingMedications.filter(m => m.name !== medicationName);
  if (remaining.length > 0) {
    message += `Still pending:\n`;
    remaining.forEach(med => {
      message += `  • ${med.name} (${med.time})\n`;
    });
  } else {
    message += `All meds for today done 🎉`;
  }
  
  await sendCaregiverUpdate({
    type: 'medication_taken',
    priority: 'low',
    message,
  });
}

/**
 * Generate medication missed alert (CASUAL TONE)
 */
export async function notifyMedicationMissed(medication: any): Promise<void> {
  const context = buildGENIContext();
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const minutesLate = Math.floor((Date.now() - new Date(medication.time).getTime()) / 60000);
  
  let message = `⚠️ ${medication.name} not taken yet (${timeStr})\n\n`;
  message += `Was due at ${medication.time} (${minutesLate} min ago)\n\n`;
  message += `Might want to check in.`;
  
  await sendCaregiverUpdate({
    type: 'medication_missed',
    priority: 'high',
    message,
  });
}

/**
 * Generate daily summary for caregiver (CASUAL TONE)
 */
export async function sendDailySummary(): Promise<void> {
  const context = buildGENIContext();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  
  let message = `Daily update - ${dateStr}\n\n`;
  
  // Medication status
  const totalMeds = context.todaysMedications.length;
  const takenMeds = context.todaysMedications.filter(m => m.status === 'taken').length;
  
  message += `Meds: ${takenMeds}/${totalMeds} taken`;
  
  if (context.overdueMedications.length > 0) {
    message += `\n\nMissed:\n`;
    context.overdueMedications.forEach(med => {
      message += `  • ${med.name}\n`;
    });
  }
  
  // Activity level - only if concerning
  if (context.activityLevel === 'concerning' || context.activityLevel === 'quiet') {
    message += `\n\nBeen pretty quiet today.`;
  }
  
  if (context.hoursSinceLastInteraction > 6) {
    message += ` Last chat was ${Math.floor(context.hoursSinceLastInteraction)} hours ago.`;
  }
  
  // Overall status (casual)
  if (takenMeds === totalMeds) {
    message += `\n\nAll meds taken 👍`;
  } else if (takenMeds >= totalMeds * 0.75) {
    message += `\n\nDoing okay overall.`;
  } else {
    message += `\n\nMight want to check in.`;
  }
  
  await sendCaregiverUpdate({
    type: 'daily_summary',
    priority: 'low',
    message,
  });
}

/**
 * Smart decision: Should we notify caregiver right now?
 */
export function shouldNotifyCaregiver(updateType: CaregiverUpdate['type'], priority: CaregiverUpdate['priority']): boolean {
  const now = new Date();
  const hour = now.getHours();
  
  // Always notify urgent events
  if (priority === 'urgent') return true;
  
  // High priority: Notify during waking hours (7 AM - 11 PM)
  if (priority === 'high' && hour >= 7 && hour < 23) return true;
  
  // Medium/Low: Only during reasonable hours (9 AM - 9 PM)
  if ((priority === 'medium' || priority === 'low') && hour >= 9 && hour < 21) return true;
  
  // Otherwise, queue for later
  console.log(`⏸️  Delaying ${priority} priority ${updateType} update (outside notification hours)`);
  return false;
}
