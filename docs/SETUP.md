# GENI Setup Guide

## 1. Prerequisites

Install these before starting:
- Node.js 18+ (https://nodejs.org/)
- npm (comes with Node.js)
- Git (optional)

## 2. Get API Keys

### Twilio (WhatsApp)
1. Sign up at https://www.twilio.com/try-twilio
2. Go to Console → Messaging → Try it out → Try WhatsApp
3. Copy:
   - Account SID
   - Auth Token
   - WhatsApp Sandbox Number (+14155238886)
4. Join sandbox by sending code to WhatsApp number

### Anthropic Claude
1. Sign up at https://console.anthropic.com/
2. Go to API Keys
3. Create new key
4. Copy `sk-ant-...`

### OpenAI
1. Sign up at https://platform.openai.com/
2. Go to API Keys
3. Create new secret key
4. Copy `sk-...`

### ElevenLabs (Optional - for better TTS)
1. Sign up at https://elevenlabs.io/
2. Get API key from Profile
3. Choose a voice ID (or use default)

## 3. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your keys:
```env
PORT=5000
PATIENT_NAME=Margaret
CAREGIVER_PHONE=+1234567890  # Your WhatsApp number

TWILIO_ACCOUNT_SID=ACxxxxx...
TWILIO_AUTH_TOKEN=xxxxx...
TWILIO_WHATSAPP_NUMBER=+14155238886

ANTHROPIC_API_KEY=sk-ant-xxxxx...
OPENAI_API_KEY=sk-xxxxx...

ELEVENLABS_API_KEY=xxxxx...  # Optional
ELEVENLABS_VOICE_ID=xxxxx...  # Optional
```

Start backend:
```bash
npm run dev
```

You should see:
```
╔════════════════════════════════════════╗
║   🐾 GENI Backend Server Running      ║
║   Port: 5000                           ║
╚════════════════════════════════════════╝
```

## 4. Frontend Setup

Open new terminal:
```bash
cd frontend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000
```

Start frontend:
```bash
npm run dev
```

Open browser to http://localhost:3000

## 5. Configure Twilio Webhook

For incoming WhatsApp messages to work:

1. Go to Twilio Console → Messaging → Settings → WhatsApp Sandbox
2. Set "When a message comes in" to:
   ```
   https://your-domain.com/api/webhook/twilio
   ```
3. For local development, use ngrok:
   ```bash
   ngrok http 5000
   ```
   Then use the ngrok URL: `https://xxxxx.ngrok.io/api/webhook/twilio`

## 6. Test the System

### Test Dashboard
Open http://localhost:3000 - you should see:
- Patient profile (Margaret Johnson)
- Today's medications
- Hardware status
- Contacts

### Test Chat
1. Click "Open Chat"
2. Type: "What medications do I take?"
3. GENI should respond via Claude

### Test Voice
1. In chat, click microphone button
2. Speak: "I took my pills"
3. Should transcribe via Whisper and respond

### Test Pill Detection
1. Click "Check Pills"
2. Allow camera access
3. Point at pill organizer
4. Claude Vision analyzes the image

### Test Emergency
1. Click "🆘 Help" button
2. Fall detection modal should appear
3. 60-second countdown starts
4. Clicking "I Need Help" sends WhatsApp alerts

## 7. WhatsApp Integration Test

Send a message to the Twilio sandbox number from your phone.
It should:
1. Appear in backend logs
2. Show incoming message banner in UI
3. Allow you to listen (TTS) and reply

## 8. Common Issues

**Backend won't start**
- Check all required env vars are set
- Make sure port 5000 is free

**Frontend can't connect**
- Check VITE_API_URL in frontend/.env
- Make sure backend is running
- Check browser console for errors

**WhatsApp not working**
- Verify you joined Twilio sandbox
- Check webhook URL is set correctly
- Use ngrok for local testing

**Camera not working**
- Use HTTPS or localhost (required for camera access)
- Check browser permissions

**Voice not working**
- Allow microphone access in browser
- Check OpenAI API key is valid

## 9. Production Deployment

### Backend (Railway/Render/Heroku)
```bash
npm run build
npm start
```

Set environment variables in hosting dashboard.

### Frontend (Vercel/Netlify)
```bash
npm run build
```

Upload `dist/` folder or connect GitHub repo.
Set `VITE_API_URL` to production backend URL.

## 10. Hardware Integration (Optional)

If using FREE-WiLi hardware:
```bash
cd freewili
pip install -r requirements.txt
python main.py
```

Edit `config.py` with backend URL.

---

**Need help?** Check the logs:
- Backend: Terminal running `npm run dev`
- Frontend: Browser DevTools Console
- Socket: Look for "✅ Socket connected" messages
