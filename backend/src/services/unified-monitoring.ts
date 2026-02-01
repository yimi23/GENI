/**
 * GENI Unified Monitoring System
 * Connects ALL monitoring capabilities into ONE cohesive unit
 * 
 * Produces SENTIENT, CONTEXTUAL OUTPUT that is VISIBLE and TIMELY
 */

import { buildGENIContext } from './geni-context';
import { conversationMemory } from './conversation-memory';
import { shouldInitiateConversation, generateConversationStarter } from './conversation';
import { analyzeMedicationAdherence } from './medication-adherence';
import { state, addActivity } from '../state';
import { emitActivity, emitSpeak } from '../socket';
import { notifyMedicationMissed } from './caregiver-updates';

export interface MonitoringEvent {
  timestamp: Date;
  type: 'pill-check' | 'conversation-initiated' | 'wellness-check' | 'medication-alert' | 'vision-analysis';
  summary: string;
  details: any;
  concernLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  actionTaken?: string;
  notifiedCaregiver: boolean;
}

class UnifiedMonitoring {
  private monitoringLog: MonitoringEvent[] = [];
  private lastPillCheck: Date | null = null;
  private lastConversationCheck: Date | null = null;
  private lastWellnessCheck: Date | null = null;

  /**
   * Main monitoring loop - call this every 30-60 seconds
   * Returns visible, timely output
   */
  async performMonitoringCycle(): Promise<string> {
    const context = buildGENIContext();
    const timestamp = context.timestamp.toLocaleTimeString();
    
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🔄 GENI Monitoring Cycle - ${timestamp}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    
    const outputs: string[] = [];
    
    // 1. Check if GENI should initiate conversation
    const conversationCheck = await this.checkConversation(context);
    if (conversationCheck) {
      outputs.push(conversationCheck);
    }
    
    // 2. Check medication adherence (if it's time)
    const medicationCheck = await this.checkMedication(context);
    if (medicationCheck) {
      outputs.push(medicationCheck);
    }
    
    // 3. Wellness check (if needed)
    const wellnessCheck = await this.checkWellness(context);
    if (wellnessCheck) {
      outputs.push(wellnessCheck);
    }
    
    // 4. Summary
    if (outputs.length > 0) {
      console.log(`\n✅ Monitoring cycle complete - ${outputs.length} action(s) taken\n`);
      return outputs.join('\n\n');
    } else {
      console.log(`✅ Monitoring cycle complete - All clear\n`);
      return 'MONITORING_OK';
    }
  }

  /**
   * Check if conversation should be initiated
   */
  private async checkConversation(context: any): Promise<string | null> {
    const now = Date.now();
    
    // Don't check more than once every 30 minutes
    if (this.lastConversationCheck && (now - this.lastConversationCheck.getTime()) < 30 * 60 * 1000) {
      return null;
    }
    
    this.lastConversationCheck = new Date();
    
    const { shouldStart, reason } = shouldInitiateConversation();
    
    if (!shouldStart) {
      return null;
    }
    
    console.log(`💬 Initiating conversation - Reason: ${reason}`);
    
    // Generate contextual conversation starter
    const message = await generateConversationStarter(reason);
    
    // Get or create session
    const session = conversationMemory.getOrCreateSession(state.patient.name);
    
    // Add to conversation memory
    conversationMemory.addMessage(session.id, 'geni', message, {
      timeOfDay: context.timeOfDay,
      isFollowUp: false,
    });
    
    // Track topic
    conversationMemory.trackTopic(session.id, reason);
    
    // Log activity
    const activity = addActivity(`GENI initiated: ${message}`, 'message');
    emitActivity(activity);
    
    // Speak it
    emitSpeak(message);
    
    // Log monitoring event
    this.logEvent({
      timestamp: new Date(),
      type: 'conversation-initiated',
      summary: `Proactive conversation: ${reason}`,
      details: { message, reason },
      concernLevel: 'none',
      actionTaken: 'Initiated conversation',
      notifiedCaregiver: false,
    });
    
    return `💬 CONVERSATION INITIATED (${reason}):\n"${message}"`;
  }

  /**
   * Check medication adherence
   */
  private async checkMedication(context: any): Promise<string | null> {
    const now = Date.now();
    
    // Check medications every 30 minutes
    if (this.lastPillCheck && (now - this.lastPillCheck.getTime()) < 30 * 60 * 1000) {
      return null;
    }
    
    // Only check during reasonable hours (8 AM - 10 PM)
    const hour = context.timestamp.getHours();
    if (hour < 8 || hour > 22) {
      return null;
    }
    
    this.lastPillCheck = new Date();
    
    console.log(`💊 Checking medication adherence...`);
    
    // Check if there are overdue medications
    if (context.overdueMedications.length === 0) {
      console.log(`   ✅ No overdue medications`);
      return null;
    }
    
    const overdueMeds = context.overdueMedications.map((m: any) => `${m.name} (${m.time})`).join(', ');
    console.log(`   ⚠️  Overdue: ${overdueMeds}`);
    
    // Get or create session
    const session = conversationMemory.getOrCreateSession(state.patient.name);
    
    // Generate reminder message
    const medName = context.overdueMedications[0].name;
    const medTime = context.overdueMedications[0].time;
    const message = `${context.patientName}, I noticed you haven't taken your ${medName} yet. It was scheduled for ${medTime}. Everything okay?`;
    
    // Add to conversation memory
    conversationMemory.addMessage(session.id, 'geni', message, {
      timeOfDay: context.timeOfDay,
      medicationsPending: context.overdueMedications.map((m: any) => m.name),
    });
    
    conversationMemory.trackMedicationDiscussion(session.id, medName);
    
    // Log activity
    const activity = addActivity(`GENI reminder: ${message}`, 'medication');
    emitActivity(activity);
    
    // Speak it
    emitSpeak(message);
    
    // Determine concern level
    const minutesOverdue = context.overdueMedications.reduce((max: number, m: any) => {
      const [hour, minute] = m.time.split(':').map(Number);
      const medTime = hour * 60 + minute;
      const currentTime = context.timestamp.getHours() * 60 + context.timestamp.getMinutes();
      return Math.max(max, currentTime - medTime);
    }, 0);
    
    const concernLevel = minutesOverdue > 120 ? 'high' : minutesOverdue > 60 ? 'medium' : 'low';
    
    // Notify caregiver if high concern
    let notifiedCaregiver = false;
    if (concernLevel === 'high' && context.overdueMedications.length > 0) {
      await notifyMedicationMissed({
        name: medName,
        dosage: context.overdueMedications[0].dosage,
        time: medTime,
        status: 'missed',
        period: context.timeOfDay,
      });
      notifiedCaregiver = true;
    }
    
    // Log monitoring event
    this.logEvent({
      timestamp: new Date(),
      type: 'medication-alert',
      summary: `Overdue: ${overdueMeds}`,
      details: { medications: context.overdueMedications, minutesOverdue },
      concernLevel,
      actionTaken: 'Sent reminder to patient',
      notifiedCaregiver,
    });
    
    return `💊 MEDICATION ALERT (${concernLevel}):\n${overdueMeds}\n→ Reminded patient${notifiedCaregiver ? ' + notified caregiver' : ''}`;
  }

  /**
   * Check overall wellness
   */
  private async checkWellness(context: any): Promise<string | null> {
    const now = Date.now();
    
    // Wellness check every 2 hours
    if (this.lastWellnessCheck && (now - this.lastWellnessCheck.getTime()) < 2 * 60 * 60 * 1000) {
      return null;
    }
    
    // Only during waking hours
    const hour = context.timestamp.getHours();
    if (hour < 9 || hour > 21) {
      return null;
    }
    
    this.lastWellnessCheck = new Date();
    
    // Check activity level
    if (context.activityLevel === 'concerning') {
      console.log(`⚠️  WELLNESS CONCERN: Activity level is concerning`);
      
      const session = conversationMemory.getOrCreateSession(state.patient.name);
      const message = `${context.patientName}, I haven't heard from you in a while. How are you doing? Everything okay?`;
      
      conversationMemory.addMessage(session.id, 'geni', message, {
        timeOfDay: context.timeOfDay,
      });
      
      conversationMemory.trackTopic(session.id, 'wellness-check');
      
      const activity = addActivity(`GENI wellness check: ${message}`, 'message');
      emitActivity(activity);
      
      emitSpeak(message);
      
      this.logEvent({
        timestamp: new Date(),
        type: 'wellness-check',
        summary: 'Low activity detected',
        details: { activityLevel: context.activityLevel, hoursSinceLastInteraction: context.hoursSinceLastInteraction },
        concernLevel: 'medium',
        actionTaken: 'Initiated wellness check',
        notifiedCaregiver: false,
      });
      
      return `⚠️  WELLNESS CHECK (medium):\nLow activity detected\n→ Checked in with patient`;
    }
    
    return null;
  }

  /**
   * Log monitoring event
   */
  private logEvent(event: MonitoringEvent) {
    this.monitoringLog.push(event);
    
    // Keep only last 100 events
    if (this.monitoringLog.length > 100) {
      this.monitoringLog = this.monitoringLog.slice(-100);
    }
  }

  /**
   * Get monitoring status summary
   */
  getStatus(): string {
    const recentEvents = this.monitoringLog.slice(-5);
    
    const summary = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 GENI MONITORING STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Last Checks:
  💊 Medication: ${this.lastPillCheck?.toLocaleTimeString() || 'Never'}
  💬 Conversation: ${this.lastConversationCheck?.toLocaleTimeString() || 'Never'}
  ⚡ Wellness: ${this.lastWellnessCheck?.toLocaleTimeString() || 'Never'}

Recent Events (last 5):
${recentEvents.length === 0 ? '  No events yet' : ''}
${recentEvents.map(e => {
  const emoji = e.concernLevel === 'critical' ? '🚨' : 
                e.concernLevel === 'high' ? '⚠️' : 
                e.concernLevel === 'medium' ? '⚠️' : '✅';
  return `  ${emoji} [${e.timestamp.toLocaleTimeString()}] ${e.type}: ${e.summary}`;
}).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();
    
    return summary;
  }

  /**
   * Get recent monitoring events
   */
  getRecentEvents(limit: number = 10): MonitoringEvent[] {
    return this.monitoringLog.slice(-limit);
  }
}

// Singleton instance
export const unifiedMonitoring = new UnifiedMonitoring();
