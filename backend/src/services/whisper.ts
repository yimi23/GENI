import OpenAI from 'openai';
import { config } from '../config';
import fs from 'fs';

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

export async function transcribeAudio(audioFilePath: string): Promise<string> {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioFilePath),
      model: 'whisper-1',
      language: 'en',
    });
    
    console.log('🎤 Transcribed:', transcription.text);
    return transcription.text;
    
  } catch (error) {
    console.error('❌ Transcription failed:', error);
    throw error;
  }
}
