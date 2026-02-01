import { Router, Request, Response } from 'express';
import { textToSpeech } from '../services/elevenlabs';

const router = Router();

/**
 * POST /api/tts - Generate speech from text using ElevenLabs
 */
router.post('/tts', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    console.log(`🔊 Generating TTS for: "${text.substring(0, 50)}..."`);
    
    const audioBuffer = await textToSpeech(text);
    
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
    });
    
    res.send(audioBuffer);
    
  } catch (error) {
    console.error('❌ TTS generation failed:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

export default router;
