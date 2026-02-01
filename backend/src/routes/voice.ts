import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { transcribeAudio } from '../services/whisper';
import { parseIntent, generateResponse } from '../services/intent';
import { addActivity } from '../state';
import { emitActivity, emitSpeak } from '../socket';

const router = Router();

// Configure multer to preserve file extension
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Force .webm extension for audio files
    cb(null, 'voice-' + uniqueSuffix + '.webm');
  }
});

const upload = multer({ storage });

router.post('/voice', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }
    
    console.log('🎤 Received audio file:', req.file.filename, 'size:', req.file.size);
    
    // Transcribe audio
    const transcription = await transcribeAudio(req.file.path);
    
    // Log transcription
    const transcriptionActivity = addActivity(`Voice: ${transcription}`, 'voice');
    emitActivity(transcriptionActivity);
    
    // Parse intent and generate response
    const intent = await parseIntent(transcription);
    const response = intent.response || await generateResponse(transcription);
    
    // Log GENI response
    const geniActivity = addActivity(`GENI: ${response}`, 'voice');
    emitActivity(geniActivity);
    
    // Trigger TTS on client
    emitSpeak(response);
    
    // Clean up uploaded file
    const fs = require('fs');
    fs.unlinkSync(req.file.path);
    console.log('🗑️  Cleaned up audio file');
    
    res.json({
      transcription,
      response,
      intent: intent.intent,
      entities: intent.entities,
    });
    
  } catch (error) {
    console.error('❌ Voice error:', error);
    // Clean up file on error too
    if (req.file) {
      try {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
      } catch {}
    }
    res.status(500).json({ error: 'Failed to process voice' });
  }
});

export default router;
