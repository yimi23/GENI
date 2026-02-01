/**
 * GENI Conversation Memory System
 * Unified conversation tracking across text and voice
 * Persistent storage with context and metadata
 */

import fs from 'fs';
import path from 'path';

export interface ConversationMessage {
  id: string;
  sessionId: string;
  timestamp: Date;
  role: 'user' | 'geni';
  type: 'text' | 'voice' | 'system';
  content: string;
  metadata?: {
    // Voice-specific
    voiceNotePath?: string;
    voiceDuration?: number;
    transcription?: string;
    sentiment?: 'positive' | 'neutral' | 'concerned' | 'distressed';
    
    // Context snapshot
    timeOfDay?: string;
    medicationsPending?: string[];
    visionSnapshot?: string;
    
    // Follow-up tracking
    isFollowUp?: boolean;
    respondingTo?: string;
  };
}

export interface ConversationSession {
  id: string;
  patientName: string;
  startedAt: Date;
  lastMessageAt: Date;
  messageCount: number;
  voiceNoteCount: number;
  topics: string[];
  medicationsDiscussed: string[];
  concernLevel: 'none' | 'low' | 'medium' | 'high';
}

class ConversationMemory {
  private dataDir: string;
  private sessionsFile: string;
  private sessions: Map<string, ConversationSession>;
  private messages: Map<string, ConversationMessage[]>;

  constructor(dataDir: string = './data/conversations') {
    this.dataDir = dataDir;
    this.sessionsFile = path.join(dataDir, 'sessions.json');
    this.sessions = new Map();
    this.messages = new Map();
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    this.loadSessions();
  }

  /**
   * Load sessions from disk
   */
  private loadSessions() {
    try {
      if (fs.existsSync(this.sessionsFile)) {
        const data = JSON.parse(fs.readFileSync(this.sessionsFile, 'utf-8'));
        data.forEach((session: any) => {
          this.sessions.set(session.id, {
            ...session,
            startedAt: new Date(session.startedAt),
            lastMessageAt: new Date(session.lastMessageAt),
          });
        });
        console.log(`✅ Loaded ${this.sessions.size} conversation sessions`);
      }
    } catch (error) {
      console.error('❌ Failed to load sessions:', error);
    }
  }

  /**
   * Save sessions to disk
   */
  private saveSessions() {
    try {
      const data = Array.from(this.sessions.values());
      fs.writeFileSync(this.sessionsFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('❌ Failed to save sessions:', error);
    }
  }

  /**
   * Load messages for a session
   */
  private loadMessages(sessionId: string): ConversationMessage[] {
    if (this.messages.has(sessionId)) {
      return this.messages.get(sessionId)!;
    }

    const messagesFile = path.join(this.dataDir, `${sessionId}.json`);
    
    try {
      if (fs.existsSync(messagesFile)) {
        const data = JSON.parse(fs.readFileSync(messagesFile, 'utf-8'));
        const messages = data.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        this.messages.set(sessionId, messages);
        return messages;
      }
    } catch (error) {
      console.error(`❌ Failed to load messages for session ${sessionId}:`, error);
    }

    this.messages.set(sessionId, []);
    return [];
  }

  /**
   * Save messages for a session
   */
  private saveMessages(sessionId: string) {
    const messages = this.messages.get(sessionId);
    if (!messages) return;

    const messagesFile = path.join(this.dataDir, `${sessionId}.json`);
    
    try {
      fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
    } catch (error) {
      console.error(`❌ Failed to save messages for session ${sessionId}:`, error);
    }
  }

  /**
   * Get or create a session
   */
  getOrCreateSession(patientName: string, sessionId?: string): ConversationSession {
    const id = sessionId || `session-${patientName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
    if (!this.sessions.has(id)) {
      const session: ConversationSession = {
        id,
        patientName,
        startedAt: new Date(),
        lastMessageAt: new Date(),
        messageCount: 0,
        voiceNoteCount: 0,
        topics: [],
        medicationsDiscussed: [],
        concernLevel: 'none',
      };
      this.sessions.set(id, session);
      this.saveSessions();
    }

    return this.sessions.get(id)!;
  }

  /**
   * Add a message to the conversation
   */
  addMessage(
    sessionId: string,
    role: 'user' | 'geni',
    content: string,
    metadata?: ConversationMessage['metadata']
  ): ConversationMessage {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const messages = this.loadMessages(sessionId);
    
    const message: ConversationMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      timestamp: new Date(),
      role,
      type: metadata?.voiceNotePath ? 'voice' : 'text',
      content,
      metadata,
    };

    messages.push(message);
    this.messages.set(sessionId, messages);
    
    // Update session
    session.lastMessageAt = new Date();
    session.messageCount++;
    
    if (message.type === 'voice') {
      session.voiceNoteCount++;
    }

    // Track medications discussed
    if (content.toLowerCase().includes('medication') || 
        content.toLowerCase().includes('pill') ||
        content.toLowerCase().includes('metformin') ||
        content.toLowerCase().includes('lisinopril')) {
      // Extract medication names (simple approach)
      ['Metformin', 'Lisinopril', 'Vitamin D'].forEach(med => {
        if (content.includes(med) && !session.medicationsDiscussed.includes(med)) {
          session.medicationsDiscussed.push(med);
        }
      });
    }

    this.saveSessions();
    this.saveMessages(sessionId);

    console.log(`💬 [${role.toUpperCase()}] ${message.type === 'voice' ? '🎤' : '💭'} ${content.substring(0, 50)}...`);

    return message;
  }

  /**
   * Get recent conversation context (for AI prompts)
   */
  getRecentContext(sessionId: string, limit: number = 10): string {
    const messages = this.loadMessages(sessionId);
    const recent = messages.slice(-limit);

    return recent.map(msg => {
      const role = msg.role === 'user' ? 'Patient' : 'GENI';
      const type = msg.type === 'voice' ? ' (voice)' : '';
      return `${role}${type}: ${msg.content}`;
    }).join('\n');
  }

  /**
   * Get conversation history for AI (structured)
   */
  getHistory(sessionId: string, limit: number = 10): { role: 'user' | 'assistant'; text: string }[] {
    const messages = this.loadMessages(sessionId);
    const recent = messages.slice(-limit);

    return recent.map(msg => ({
      role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
      text: msg.content,
    }));
  }

  /**
   * Get session summary
   */
  getSessionSummary(sessionId: string): string {
    const session = this.sessions.get(sessionId);
    if (!session) return 'No session found';

    const messages = this.loadMessages(sessionId);
    const duration = Date.now() - session.startedAt.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    return `
Session ${sessionId}
Started: ${session.startedAt.toLocaleString()}
Messages: ${session.messageCount} (${session.voiceNoteCount} voice notes)
Duration: ${hours}h ${minutes}m
Topics: ${session.topics.join(', ') || 'General conversation'}
Medications discussed: ${session.medicationsDiscussed.join(', ') || 'None'}
Last activity: ${session.lastMessageAt.toLocaleString()}
`.trim();
  }

  /**
   * Track a topic in the session
   */
  trackTopic(sessionId: string, topic: string) {
    const session = this.sessions.get(sessionId);
    if (session && !session.topics.includes(topic)) {
      session.topics.push(topic);
      this.saveSessions();
    }
  }

  /**
   * Track medication discussion
   */
  trackMedicationDiscussion(sessionId: string, medication: string) {
    const session = this.sessions.get(sessionId);
    if (session && !session.medicationsDiscussed.includes(medication)) {
      session.medicationsDiscussed.push(medication);
      this.saveSessions();
    }
  }

  /**
   * Update concern level
   */
  updateConcernLevel(sessionId: string, level: ConversationSession['concernLevel']) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.concernLevel = level;
      this.saveSessions();
    }
  }

  /**
   * Get all active sessions (last 24 hours)
   */
  getActiveSessions(): ConversationSession[] {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    return Array.from(this.sessions.values())
      .filter(s => s.lastMessageAt.getTime() > oneDayAgo)
      .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
  }

  /**
   * Build conversation state for AI prompts
   */
  buildConversationState(sessionId: string) {
    const session = this.sessions.get(sessionId);
    const messages = this.loadMessages(sessionId);
    const recentMessages = messages.slice(-10);

    return {
      session,
      recentMessages,
      context: this.getRecentContext(sessionId, 10),
      medicationsDiscussed: session?.medicationsDiscussed || [],
      topics: session?.topics || [],
      hasVoiceNotes: (session?.voiceNoteCount || 0) > 0,
    };
  }
}

// Singleton instance
export const conversationMemory = new ConversationMemory();
