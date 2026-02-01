import dotenv from 'dotenv';
import path from 'path';

// Load from root .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const nodeEnv = process.env.NODE_ENV || 'development';

export const config = {
  port: parseInt(process.env.PORT || '5000'),
  nodeEnv,
  
  patient: {
    name: process.env.PATIENT_NAME || 'Margaret',
    caregiverPhone: process.env.CAREGIVER_PHONE || '',
  },
  
  messaging: {
    enabled: process.env.GENI_ENABLE_MESSAGING === 'true' || nodeEnv === 'production',
  },
  
  fallDetection: {
    enabled: process.env.GENI_ENABLE_FALL_DETECTION === 'true' || nodeEnv === 'production',
    mode: (process.env.GENI_FALL_DETECTION_MODE || 'frame') as 'frame' | 'camera',
  },
  
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '+14155238886', // For voice calls
  },
  
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    visionModel: process.env.ANTHROPIC_VISION_MODEL || 'claude-3-5-haiku-20241022',
  },
  
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },
  
  elevenlabs: {
    apiKey: process.env.ELEVENLABS_API_KEY || '',
    voiceId: process.env.ELEVENLABS_VOICE_ID || '',
  },
};

// Validate required env vars
const requiredVars = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'ANTHROPIC_API_KEY',
  'OPENAI_API_KEY',
];

if (config.nodeEnv === 'production') {
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      console.error(`❌ Missing required environment variable: ${varName}`);
      process.exit(1);
    }
  }
}
