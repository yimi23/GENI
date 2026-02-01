import { Router, Request, Response } from 'express';
import { parseIntent, generateResponse } from '../services/intent';
import { addActivity } from '../state';
import { emitActivity, emitSpeak } from '../socket';
import { generateFollowUp } from '../services/conversation';

const router = Router();

// Store recent conversation history (in-memory for now)
// TODO: Move to proper session storage
const conversationHistory: Map<string, { role: 'user' | 'assistant'; text: string }[]> = new Map();

router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, sessionId = 'default' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Get conversation history for this session
    let history = conversationHistory.get(sessionId) || [];
    
    // Log user message
    const userActivity = addActivity(`User: ${message}`, 'message');
    emitActivity(userActivity);
    
    // Add to history
    history.push({ role: 'user', text: message });
    
    // Parse intent and generate contextual response with follow-up logic
    const intent = await parseIntent(message);
    let response: string;
    let shouldAskFollowUp = false;
    
    // Use conversational AI for follow-ups
    try {
      const followUpResult = await generateFollowUp(message, history);
      response = followUpResult.response;
      shouldAskFollowUp = followUpResult.shouldAskFollowUp;
    } catch (error) {
      console.error('❌ Follow-up generation failed, using standard response:', error);
      response = intent.response || await generateResponse(message, history);
    }
    
    // Add GENI response to history
    history.push({ role: 'assistant', text: response });
    
    // Keep only last 10 messages
    if (history.length > 10) {
      history = history.slice(-10);
    }
    conversationHistory.set(sessionId, history);
    
    // Log GENI response
    const geniActivity = addActivity(`GENI: ${response}`, 'message');
    emitActivity(geniActivity);
    
    // Trigger TTS on client
    emitSpeak(response);
    
    res.json({
      response,
      intent: intent.intent,
      entities: intent.entities,
      conversational: shouldAskFollowUp, // Let client know this is a conversation, not just an answer
    });
    
  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

export default router;
