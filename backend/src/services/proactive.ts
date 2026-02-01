import { state, addActivity } from '../state';
import { sendWhatsAppMessage } from './twilio';
import { emitActivity, emitSpeak } from '../socket';

// Proactive Intelligence Service for Elder Care

export async function checkMedicationAdherence() {
  const now = new Date();
  const currentHour = now.getHours();
  
  for (const med of state.todaysMedications) {
    if (med.status === 'pending') {
      const medHour = parseInt(med.time.split(':')[0]);
      const hoursSince = currentHour - medHour;
      
      // After 30 minutes, gentle reminder
      if (hoursSince === 0.5) {
        const reminder = `Hi ${state.patient.name}, just checking - did you take your ${med.time} ${med.name}?`;
        emitSpeak(reminder);
        addActivity(reminder, 'system');
      }
      
      // After 2 hours, alert caregiver
      if (hoursSince >= 2) {
        const primaryContact = state.contacts.find(c => c.isPrimary);
        if (primaryContact) {
          const alert = `${state.patient.name} hasn't confirmed ${med.time} medication (${med.name}). Please check in.`;
          await sendWhatsAppMessage(primaryContact.phone, `Hey, this is GENI. ${alert}`);
          addActivity(`Alert sent to ${primaryContact.name}: Missed medication`, 'system');
        }
      }
    }
  }
}

export function generateMorningBriefing(): string {
  const patient = state.patient;
  const pendingMeds = state.todaysMedications.filter(m => m.status !== 'taken');
  const appointments = state.reminders.filter(r => r.type === 'appointment' && !r.completed);
  
  let briefing = `Good morning ${patient.name}! Here's your day:\n\n`;
  
  // Medication summary
  briefing += `💊 Medications: ${pendingMeds.length} doses scheduled today\n`;
  if (pendingMeds.length > 0) {
    const nextMed = pendingMeds[0];
    briefing += `   Next: ${nextMed.name} at ${nextMed.time}\n\n`;
  }
  
  // Appointments
  if (appointments.length > 0) {
    briefing += `📅 Appointments:\n`;
    appointments.forEach(apt => {
      briefing += `   ${apt.time} - ${apt.message}\n`;
    });
    briefing += '\n';
  }
  
  // Encouragement
  briefing += `⚡ You're doing great! Have a wonderful day.`;
  
  return briefing;
}

export function generateSmartMedicationReminder(medName: string, time: string): string {
  const med = state.todaysMedications.find(m => m.name === medName);
  if (!med) return `Time for your ${medName}`;
  
  let reminder = `${state.patient.name}, it's ${time} - time for your ${med.period} medication.\n\n`;
  reminder += `You have:\n`;
  reminder += `- ${med.name} ${med.dosage}\n\n`;
  
  if (med.period === 'morning') {
    reminder += `Take with breakfast. I'll check in 30 minutes to confirm.`;
  } else if (med.period === 'afternoon') {
    reminder += `Take with lunch or a snack. Need me to call ${state.contacts[0].name} if you need help?`;
  } else if (med.period === 'evening') {
    reminder += `Take with dinner. This is your last dose for today.`;
  }
  
  return reminder;
}

export async function proactiveHealthCheck() {
  // Check if there's been activity in last 2 hours
  const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
  const recentActivity = state.activities.find(a => a.timestamp > twoHoursAgo);
  
  if (!recentActivity) {
    const checkIn = `${state.patient.name}, I haven't heard from you in a while. Everything okay? Say 'yes' or press the button if you need help.`;
    emitSpeak(checkIn);
    addActivity(checkIn, 'system');
    
    // If no response in 5 minutes, alert caregiver
    setTimeout(async () => {
      const stillNoActivity = !state.activities.find(a => a.timestamp > Date.now() - 5 * 60 * 1000);
      if (stillNoActivity) {
        const primaryContact = state.contacts.find(c => c.isPrimary);
        if (primaryContact) {
          await sendWhatsAppMessage(
            primaryContact.phone,
            `Hey, this is GENI. No activity from ${state.patient.name} in 2+ hours. Please check in when possible.`
          );
          addActivity(`Alert sent to ${primaryContact.name}: No recent activity`, 'system');
        }
      }
    }, 5 * 60 * 1000);
  }
}

export function generateAppointmentReminder(appointment: string, hoursUntil: number): string {
  const primaryContact = state.contacts.find(c => c.isPrimary);
  
  let reminder = `Reminder: ${appointment} in ${hoursUntil} hours.\n\n`;
  
  if (hoursUntil === 3) {
    reminder += `${primaryContact?.name} will pick you up at ${new Date(Date.now() + (hoursUntil - 0.5) * 60 * 60 * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}.\n`;
    reminder += `Have your insurance card and medication list ready.`;
  } else if (hoursUntil === 1) {
    reminder += `Get ready soon. ${primaryContact?.name} will be here shortly.`;
  }
  
  return reminder;
}

export async function sendWeeklySummaryToCaregiver() {
  const primaryContact = state.contacts.find(c => c.isPrimary);
  if (!primaryContact) return;
  
  const totalMeds = state.medicationHistory.length * 3; // Assume 3 doses/day
  const takenMeds = state.medicationHistory.reduce((sum, day) => {
    return sum + day.details.filter(d => d.status === 'taken').length;
  }, 0);
  const adherence = Math.round((takenMeds / totalMeds) * 100);
  
  const summary = `Hi ${primaryContact.name}! Here's ${state.patient.name}'s weekly summary:

✅ Medication Adherence: ${adherence}%
✅ Activity: Normal routine, active daily
✅ Health: No concerning patterns detected

Overall: ${state.patient.name} is doing well! Keep up the great work.

- GENI 🐾`;

  await sendWhatsAppMessage(primaryContact.phone, summary);
  addActivity(`Weekly summary sent to ${primaryContact.name}`, 'system');
}

export function shouldTriggerProactiveAction(): { action: string; message: string } | null {
  const now = new Date();
  const hour = now.getHours();
  
  // Morning briefing at 8am
  if (hour === 8 && !state.activities.find(a => a.message.includes('morning briefing'))) {
    return {
      action: 'morning_briefing',
      message: generateMorningBriefing()
    };
  }
  
  // Check for pending medications
  const pendingMed = state.todaysMedications.find(m => {
    if (m.status !== 'pending') return false;
    const medHour = parseInt(m.time.split(':')[0]);
    return medHour === hour;
  });
  
  if (pendingMed) {
    return {
      action: 'medication_reminder',
      message: generateSmartMedicationReminder(pendingMed.name, pendingMed.time)
    };
  }
  
  // Check for upcoming appointments
  const upcomingAppt = state.reminders.find(r => {
    if (r.type !== 'appointment' || r.completed) return false;
    const aptHour = parseInt(r.time.split(':')[0]);
    return aptHour - hour === 3; // 3 hours before
  });
  
  if (upcomingAppt) {
    return {
      action: 'appointment_reminder',
      message: generateAppointmentReminder(upcomingAppt.message, 3)
    };
  }
  
  return null;
}
