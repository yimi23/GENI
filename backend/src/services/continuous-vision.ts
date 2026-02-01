/**
 * GENI Continuous Vision Service
 * Analyzes camera frames continuously and generates contextual output
 * 
 * Learned from fall_detection.py:
 * - Continuous monitoring (never stops)
 * - Delta time tracking
 * - Change detection between frames
 * - Confirmation periods before acting
 */

import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';
import { emitVisionUpdate, emitSpeak } from '../socket';
import { state, addActivity } from '../state';
import { conversationMemory } from './conversation-memory';

const anthropic = new Anthropic({
  apiKey: config.anthropic.apiKey,
});

interface VisionAnalysis {
  timestamp: Date;
  observations: string;
  activity: string; // 'at desk' | 'walking' | 'sitting' | 'not visible'
  pillStatus: 'present' | 'taken' | 'unclear';
  concerns: string[];
  contextualMessage?: string;
}

interface VisionState {
  lastAnalysis: VisionAnalysis | null;
  pillsPresentSince: Date | null; // Track how long pills have been present
  lastActivityChange: Date | null;
  consecutiveConcerns: number;
}

class ContinuousVisionService {
  private isPaused = false;
  private state: VisionState = {
    lastAnalysis: null,
    pillsPresentSince: null,
    lastActivityChange: null,
    consecutiveConcerns: 0,
  };
  
  /**
   * Analyze a camera frame
   */
  async analyzeFrame(imageBase64: string): Promise<VisionAnalysis> {
    console.log('🔍 Analyzing camera frame...');
    
    try {
      const response = await anthropic.messages.create({
        model: config.anthropic.visionModel,
        max_tokens: 300,
        system: "You are a computer vision API. You MUST respond with ONLY a valid JSON object. No extra text, no markdown. Start with { and end with }.",
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: `You are GENI, an AI elder care companion monitoring ${config.patient.name}.

Analyze this camera frame and respond in JSON format:

{
  "observations": "Brief description of what you see",
  "activity": "at desk" | "walking" | "sitting" | "lying down" | "not visible",
  "pillStatus": "present" | "taken" | "unclear",
  "concerns": ["list any concerns"]
}

Current time: ${new Date().toLocaleTimeString()}
Current medications schedule: ${this.getMedicationScheduleContext()}

Focus on:
1. Is ${config.patient.name} visible and what are they doing?
2. Can you see the pill organizer? Are pills present or taken?
3. Any safety concerns (unusual position, fall risk)?
4. Any changes from typical behavior?

Be concise and factual. Only list real concerns.`,
              },
            ],
          },
        ],
      });
      
      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }
      
      // Parse JSON response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      let analysis: any = null;
      if (jsonMatch) {
        try {
          analysis = JSON.parse(jsonMatch[0]);
        } catch (error) {
          console.error('❌ Vision JSON parse failed:', error);
        }
      }
      
      if (!analysis) {
        console.error('❌ No JSON found in vision response.');
        return {
          timestamp: new Date(),
          observations: 'Vision response invalid (no JSON).',
          activity: 'unclear',
          pillStatus: 'unclear',
          concerns: [],
        };
      }
      
      const result: VisionAnalysis = {
        timestamp: new Date(),
        observations: analysis.observations || 'No clear observation',
        activity: analysis.activity || 'unclear',
        pillStatus: analysis.pillStatus || 'unclear',
        concerns: Array.isArray(analysis.concerns) ? analysis.concerns : [],
      };
      
      console.log('✅ Vision analysis:', result);
      
      return result;
      
    } catch (error) {
      console.error('❌ Vision analysis failed:', error);
      
      // Return fallback analysis
      return {
        timestamp: new Date(),
        observations: 'Analysis unavailable',
        activity: 'unclear',
        pillStatus: 'unclear',
        concerns: [],
      };
    }
  }
  
  /**
   * Process analysis and generate contextual output
   */
  async processAnalysis(
    analysis: VisionAnalysis,
    options: { emitUpdates?: boolean; speak?: boolean; recordMemory?: boolean } = {}
  ): Promise<string | null> {
    const { emitUpdates = true, speak = true, recordMemory = true } = options;
    console.log('⚙️  Processing vision analysis...');
    
    // Update state tracking
    this.updateState(analysis);
    
    // Detect significant changes
    const changes = this.detectChanges(analysis);
    
    // Generate contextual message if needed
    const message = this.generateContextualMessage(analysis, changes);
    
    if (message) {
      console.log('💬 Generated contextual message:', message);
      
      if (recordMemory) {
        const session = conversationMemory.getOrCreateSession(config.patient.name);
        conversationMemory.addMessage(session.id, 'geni', message, {
          timeOfDay: this.getTimeOfDay(),
          // Note: visionContext not currently in conversation metadata schema
          // Could be added later if needed
        });
      }
      
      // Log activity
      const activity = addActivity(`GENI vision: ${message}`, 'message');
      
      if (emitUpdates) {
        emitVisionUpdate({
          timestamp: analysis.timestamp,
          observation: analysis.observations,
          message,
          concerns: analysis.concerns,
        });
      }
      
      if (speak) {
        emitSpeak(message);
      }
    }
    
    // Store as last analysis
    this.state.lastAnalysis = analysis;
    
    return message || null;
  }
  
  /**
   * Update state tracking (delta time tracking)
   */
  private updateState(analysis: VisionAnalysis): void {
    const now = new Date();
    
    // Track how long pills have been present
    if (analysis.pillStatus === 'present') {
      if (!this.state.pillsPresentSince) {
        this.state.pillsPresentSince = now;
        console.log('📊 Pills detected as present, starting timer');
      }
    } else if (analysis.pillStatus === 'taken') {
      if (this.state.pillsPresentSince) {
        const duration = Math.round((now.getTime() - this.state.pillsPresentSince.getTime()) / 60000);
        console.log(`📊 Pills taken after ${duration} minutes`);
        this.state.pillsPresentSince = null;
      }
    }
    
    // Track activity changes
    if (this.state.lastAnalysis && this.state.lastAnalysis.activity !== analysis.activity) {
      this.state.lastActivityChange = now;
      console.log(`📊 Activity changed: ${this.state.lastAnalysis.activity} → ${analysis.activity}`);
    }
    
    // Track consecutive concerns
    if (analysis.concerns.length > 0) {
      this.state.consecutiveConcerns++;
    } else {
      this.state.consecutiveConcerns = 0;
    }
  }
  
  /**
   * Detect significant changes (velocity detection)
   */
  private detectChanges(current: VisionAnalysis): {
    pillStatusChanged: boolean;
    activityChanged: boolean;
    newConcerns: boolean;
    pillsOverdue: boolean;
  } {
    const prev = this.state.lastAnalysis;
    
    return {
      pillStatusChanged: prev ? prev.pillStatus !== current.pillStatus : false,
      activityChanged: prev ? prev.activity !== current.activity : false,
      newConcerns: current.concerns.length > 0 && this.state.consecutiveConcerns === 1,
      pillsOverdue: this.isPillsOverdue(),
    };
  }
  
  /**
   * Generate contextual message based on analysis and changes
   */
  private generateContextualMessage(
    analysis: VisionAnalysis,
    changes: ReturnType<typeof this.detectChanges>
  ): string | null {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    
    // RULE 1: Pills overdue for 30+ minutes (confirmation period)
    if (changes.pillsOverdue && analysis.pillStatus === 'present') {
      const minutesOverdue = Math.round(
        (now.getTime() - this.state.pillsPresentSince!.getTime()) / 60000
      );
      
      const nextMed = this.getNextMedication();
      if (nextMed) {
        return `${config.patient.name}, it's ${time}. I can see your ${nextMed.time} medications are still in the organizer. It's been about ${minutesOverdue} minutes. Everything okay?`;
      }
    }
    
    // RULE 2: Pills just taken (positive reinforcement)
    if (changes.pillStatusChanged && analysis.pillStatus === 'taken') {
      return `Great! I see you took your medications. Thank you for staying on track, ${config.patient.name}.`;
    }
    
    // RULE 3: New safety concern detected
    if (changes.newConcerns && analysis.concerns.length > 0) {
      const concern = analysis.concerns[0];
      return `${config.patient.name}, I noticed ${concern}. Are you okay?`;
    }
    
    // RULE 4: Person not visible for extended period (wellness check)
    if (analysis.activity === 'not visible' && this.state.lastActivityChange) {
      const minutesNotVisible = Math.round(
        (now.getTime() - this.state.lastActivityChange.getTime()) / 60000
      );
      
      if (minutesNotVisible > 60) { // 1 hour
        return `${config.patient.name}, I haven't seen you in a while. Just checking in - everything alright?`;
      }
    }
    
    // No significant event - return null (don't spam)
    return null;
  }
  
  /**
   * Check if pills are overdue (30+ minutes)
   */
  private isPillsOverdue(): boolean {
    if (!this.state.pillsPresentSince) return false;
    
    const minutesPresent = Math.round(
      (Date.now() - this.state.pillsPresentSince.getTime()) / 60000
    );
    
    return minutesPresent >= 30;
  }
  
  /**
   * Get medication schedule context
   */
  private getMedicationScheduleContext(): string {
    const now = new Date();
    const hour = now.getHours();
    
    // Find next medication from state
    const schedule = state.todaysMedications || [];
    const upcoming = schedule.filter((med: any) => {
      const [medHour] = med.time.split(':').map(Number);
      return medHour >= hour;
    });
    
    if (upcoming.length > 0) {
      return upcoming.map((m: any) => `${m.name} at ${m.time}`).join(', ');
    }
    
    return 'No upcoming medications today';
  }
  
  /**
   * Get next medication
   */
  private getNextMedication() {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentMinutes = hour * 60 + minute;
    
    const schedule = state.todaysMedications || [];
    
    // Find most recent medication (within past 2 hours)
    const recent = schedule
      .map((med: any) => {
        const [medHour, medMinute] = med.time.split(':').map(Number);
        const medMinutes = medHour * 60 + medMinute;
        return { ...med, medMinutes, diff: currentMinutes - medMinutes };
      })
      .filter((m: any) => m.diff >= 0 && m.diff <= 120) // Within 2 hours past
      .sort((a: any, b: any) => a.diff - b.diff)[0];
    
    return recent;
  }
  
  /**
   * Get time of day
   */
  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }
  
  /**
   * Pause vision monitoring (during voice interaction)
   */
  pause(): void {
    this.isPaused = true;
    console.log('⏸️  Vision monitoring paused (voice active)');
  }
  
  /**
   * Resume vision monitoring
   */
  resume(): void {
    this.isPaused = false;
    console.log('▶️  Vision monitoring resumed');
  }
  
  /**
   * Check if paused
   */
  isPausedStatus(): boolean {
    return this.isPaused;
  }
  
  /**
   * Get current state (for debugging)
   */
  getState(): VisionState {
    return this.state;
  }
}

// Singleton instance
export const continuousVision = new ContinuousVisionService();
