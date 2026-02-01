import axios from 'axios';
import { config } from '../config';

export async function textToSpeech(text: string): Promise<Buffer> {
  // Validate config before making request
  if (!config.elevenlabs.apiKey || config.elevenlabs.apiKey === '') {
    throw new Error('ElevenLabs API key not configured');
  }
  
  if (!config.elevenlabs.voiceId || config.elevenlabs.voiceId === '') {
    throw new Error('ElevenLabs voice ID not configured');
  }
  
  try {
    const response = await axios({
      method: 'post',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${config.elevenlabs.voiceId}`,
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': config.elevenlabs.apiKey,
      },
      data: {
        text,
        model_id: 'eleven_turbo_v2_5', // Faster model
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.0,
          use_speaker_boost: true
        },
      },
      responseType: 'arraybuffer',
      timeout: 15000, // 15 second timeout
    });
    
    console.log('✅ ElevenLabs TTS generated:', text.substring(0, 50) + '...');
    return Buffer.from(response.data);
    
  } catch (error: any) {
    if (error.response) {
      console.error('❌ ElevenLabs API error:', error.response.status, error.response.data);
      throw new Error(`ElevenLabs API error: ${error.response.status}`);
    } else if (error.request) {
      console.error('❌ ElevenLabs network error:', error.message);
      throw new Error('ElevenLabs network error');
    } else {
      console.error('❌ ElevenLabs error:', error.message);
      throw error;
    }
  }
}
