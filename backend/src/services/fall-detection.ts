/**
 * GENI Fall Detection Service
 * Manages the Python fall detection process and handles emergency alerts
 */

import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { state, addActivity } from '../state';
import { emitActivity, emitFallAlert } from '../socket';
import { sendWhatsAppMessage } from './twilio';

interface FallEvent {
  timestamp: number;
  level: 'info' | 'warning' | 'error' | 'emergency';
  message: string;
  patient: string;
  data?: any;
}

export class FallDetectionService {
  private pythonProcess: ChildProcess | null = null;
  private isRunning = false;
  private emergencyActive = false;
  private emergencyStartTime: number | null = null;
  private responseTimeout: NodeJS.Timeout | null = null;
  
  // Configuration
  private readonly RESPONSE_TIMEOUT_MS = 60000; // 60 seconds
  private readonly scriptPath = path.join(__dirname, '../../scripts/fall_detection.py');
  
  /**
   * Start fall detection monitoring
   */
  start(options: { patient?: string; camera?: number; headless?: boolean } = {}) {
    if (this.isRunning) {
      console.log('⚠️  Fall detection already running');
      return;
    }
    
    const args = [
      this.scriptPath,
      '--patient', options.patient || state.patient.name,
      '--camera', String(options.camera || 0),
    ];
    
    if (options.headless !== false) {
      args.push('--headless'); // Production mode (no window)
    }
    
    console.log('🚀 Starting fall detection:', args.join(' '));
    
    this.pythonProcess = spawn('python3', args);
    this.isRunning = true;
    
    // Listen to stdout (JSON events)
    this.pythonProcess.stdout?.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      
      lines.forEach(line => {
        try {
          const event: FallEvent = JSON.parse(line);
          this.handleEvent(event);
        } catch (error) {
          // Not JSON - probably debug output
          console.log('[Fall Detection]', line);
        }
      });
    });
    
    // Listen to stderr (errors)
    this.pythonProcess.stderr?.on('data', (data: Buffer) => {
      console.error('❌ Fall detection error:', data.toString());
    });
    
    // Handle process exit
    this.pythonProcess.on('exit', (code, signal) => {
      console.log(`🛑 Fall detection process exited: code=${code}, signal=${signal}`);
      this.isRunning = false;
      this.pythonProcess = null;
      
      // Auto-restart on crash (unless manually stopped)
      if (code !== 0 && code !== null) {
        console.log('🔄 Restarting fall detection in 5 seconds...');
        setTimeout(() => this.start(options), 5000);
      }
    });
  }
  
  /**
   * Stop fall detection monitoring
   */
  stop() {
    if (!this.isRunning || !this.pythonProcess) {
      console.log('⚠️  Fall detection not running');
      return;
    }
    
    console.log('🛑 Stopping fall detection...');
    this.pythonProcess.kill('SIGTERM');
    this.isRunning = false;
    this.pythonProcess = null;
    
    if (this.responseTimeout) {
      clearTimeout(this.responseTimeout);
      this.responseTimeout = null;
    }
  }
  
  /**
   * Handle events from Python script
   */
  private async handleEvent(event: FallEvent) {
    console.log(`[${event.level.toUpperCase()}] ${event.message}`, event.data || '');
    
    switch (event.level) {
      case 'info':
        this.handleInfo(event);
        break;
      
      case 'warning':
        this.handleWarning(event);
        break;
      
      case 'error':
        this.handleError(event);
        break;
      
      case 'emergency':
        await this.handleEmergency(event);
        break;
    }
  }
  
  /**
   * Handle info events (logging, state updates)
   */
  private handleInfo(event: FallEvent) {
    // Log significant state changes
    if (event.message.includes('initialized') || 
        event.message.includes('Recovery detected') ||
        event.message.includes('reset')) {
      
      const activity = addActivity(event.message, 'system');
      emitActivity(activity);
    }
  }
  
  /**
   * Handle warning events (fall primed, confirming)
   */
  private handleWarning(event: FallEvent) {
    if (event.message.includes('Impact detected')) {
      // Fall might be happening - log it
      const activity = addActivity(
        `⚠️ Possible fall detected - ${event.data?.type || 'unknown'} type`,
        'system'
      );
      emitActivity(activity);
      
      // Notify frontend to show "Confirming..." state
      emitFallAlert({
        state: 'confirming',
        message: 'Checking on you...',
        progress: 0
      });
    }
  }
  
  /**
   * Handle error events
   */
  private handleError(event: FallEvent) {
    console.error('❌ Fall detection error:', event.message, event.data);
    
    // Log error activity
    const activity = addActivity(`Fall detection error: ${event.message}`, 'system');
    emitActivity(activity);
  }
  
  /**
   * Handle EMERGENCY event (fall confirmed)
   */
  private async handleEmergency(event: FallEvent) {
    if (this.emergencyActive) {
      console.log('⚠️  Emergency already active, ignoring duplicate');
      return;
    }
    
    this.emergencyActive = true;
    this.emergencyStartTime = Date.now();
    
    console.log('🚨 FALL DETECTED - INITIATING EMERGENCY RESPONSE');
    
    // 1. Log to database
    const activity = addActivity(
      `🚨 FALL DETECTED: ${event.patient} may have fallen and is unresponsive`,
      'emergency'
    );
    emitActivity(activity);
    
    // 2. Show full-screen alert in frontend
    emitFallAlert({
      state: 'emergency',
      message: 'FALL DETECTED - Are you okay?',
      patient: event.patient,
      timestamp: event.timestamp,
      data: event.data
    });
    
    // 3. Send immediate WhatsApp alert to primary caregiver
    await this.sendCaregiverAlert(event);
    
    // 4. Start response timeout - if no "I'm OK" response in 60 seconds, escalate
    this.responseTimeout = setTimeout(() => {
      this.escalateEmergency(event);
    }, this.RESPONSE_TIMEOUT_MS);
  }
  
  /**
   * Send WhatsApp alert to caregiver
   */
  private async sendCaregiverAlert(event: FallEvent) {
    const primaryContact = state.contacts.find(c => c.isPrimary);
    
    if (!primaryContact) {
      console.error('❌ No primary contact configured');
      return;
    }
    
    const message = `🚨 EMERGENCY ALERT

${event.patient} may have fallen!

Fall detected at ${new Date(event.timestamp * 1000).toLocaleTimeString()}.

${event.patient} has not responded for ${event.data?.confirmation_time || 3} seconds.

Please check on ${event.patient} IMMEDIATELY.

If ${event.patient} is okay, they can cancel this alert in the GENI app.

- GENI Fall Detection System`;
    
    try {
      console.log('📱 Sending emergency WhatsApp to:', primaryContact.name);
      await sendWhatsAppMessage(primaryContact.phone, message);
      console.log('✅ Emergency alert sent to caregiver');
      
      // Log activity
      const activity = addActivity(
        `Emergency alert sent to ${primaryContact.name}`,
        'emergency'
      );
      emitActivity(activity);
      
    } catch (error) {
      console.error('❌ Failed to send emergency WhatsApp:', error);
      
      // Log failure
      const activity = addActivity(
        `Failed to send emergency alert: ${error}`,
        'system'
      );
      emitActivity(activity);
    }
  }
  
  /**
   * Escalate emergency if no response
   */
  private async escalateEmergency(event: FallEvent) {
    console.log('🚨 NO RESPONSE - ESCALATING EMERGENCY');
    
    // Send to ALL contacts
    const allContacts = state.contacts;
    
    const escalationMessage = `🚨🚨 URGENT EMERGENCY 🚨🚨

${event.patient} FELL AND IS NOT RESPONDING!

Fall detected ${Math.round((Date.now() - (event.timestamp * 1000)) / 1000)}s ago.

NO RESPONSE for 60+ seconds.

IMMEDIATE ASSISTANCE REQUIRED.

Consider calling emergency services (911) if you cannot reach ${event.patient}.

- GENI Fall Detection System`;
    
    for (const contact of allContacts) {
      try {
        console.log('📱 Sending escalation to:', contact.name);
        await sendWhatsAppMessage(contact.phone, escalationMessage);
      } catch (error) {
        console.error(`❌ Failed to send to ${contact.name}:`, error);
      }
    }
    
    // Log escalation
    const activity = addActivity(
      'Emergency escalated - all contacts notified',
      'emergency'
    );
    emitActivity(activity);
    
    // Emit escalation to frontend
    emitFallAlert({
      state: 'escalated',
      message: 'Help is on the way',
      patient: event.patient
    });
  }
  
  /**
   * User confirmed they're okay - cancel emergency
   */
  confirmOK() {
    if (!this.emergencyActive) {
      console.log('⚠️  No active emergency to confirm');
      return false;
    }
    
    console.log('✅ User confirmed OK - canceling emergency');
    
    const duration = this.emergencyStartTime 
      ? Math.round((Date.now() - this.emergencyStartTime) / 1000)
      : 0;
    
    // Clear timeout
    if (this.responseTimeout) {
      clearTimeout(this.responseTimeout);
      this.responseTimeout = null;
    }
    
    // Reset emergency state
    this.emergencyActive = false;
    this.emergencyStartTime = null;
    
    // Log activity
    const activity = addActivity(
      `False alarm - ${state.patient.name} confirmed OK after ${duration}s`,
      'system'
    );
    emitActivity(activity);
    
    // Notify frontend
    emitFallAlert({
      state: 'cancelled',
      message: 'Emergency cancelled - user is OK'
    });
    
    // Notify caregiver
    this.sendFalseAlarmNotification();
    
    return true;
  }
  
  /**
   * Send false alarm notification to caregiver
   */
  private async sendFalseAlarmNotification() {
    const primaryContact = state.contacts.find(c => c.isPrimary);
    
    if (!primaryContact) return;
    
    const message = `✅ FALSE ALARM

${state.patient.name} confirmed they are okay.

The fall alert has been cancelled.

- GENI Fall Detection System`;
    
    try {
      await sendWhatsAppMessage(primaryContact.phone, message);
      console.log('✅ False alarm notification sent');
    } catch (error) {
      console.error('❌ Failed to send false alarm notification:', error);
    }
  }
  
  /**
   * Get current status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      emergencyActive: this.emergencyActive,
      emergencyDuration: this.emergencyStartTime 
        ? Math.round((Date.now() - this.emergencyStartTime) / 1000)
        : null
    };
  }
}

// Singleton instance
export const fallDetectionService = new FallDetectionService();
