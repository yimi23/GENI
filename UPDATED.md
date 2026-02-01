# 🔊 GENI - Updated with ElevenLabs TTS

## What Changed

✅ **Added working ElevenLabs API key** (from FraudZero project)

### Before
```env
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
```

### Now
```env
ELEVENLABS_API_KEY=sk_acd12d96729f02d93447bdc658f76874518bf0eb8cf4fb2d
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
# Voice ID: Rachel (warm, natural female voice - good for elderly care)
```

## What This Gives You

### Browser TTS (Default - No Setup)
- Free, works immediately
- Basic voice quality
- Limited voice options
- Already working in GENI

### ElevenLabs TTS (Now Available)
- ✅ **Premium voice quality** (natural, human-like)
- ✅ **Rachel voice** - Warm, clear, perfect for elderly users
- ✅ **Better emotional tone** - More engaging than browser TTS
- ✅ **Professional** - Sounds like a real assistant

## How It Works

### Chat Interface
When GENI responds:
1. Backend generates response with Claude
2. **If ElevenLabs key exists:** Backend calls ElevenLabs API
3. Returns high-quality MP3 audio
4. Frontend plays it

### Fallback
If ElevenLabs fails or is disabled:
- Automatically falls back to browser TTS
- No errors, seamless experience

## API Keys Status

All from your existing projects:

```
✅ Anthropic (Claude)  - From Remi
✅ OpenAI (Whisper)    - From Remi  
✅ ElevenLabs (TTS)    - From FraudZero
⏭️ Twilio (WhatsApp)   - Optional (get free sandbox)
```

## Voice Options

Current: **Rachel** (`21m00Tcm4TlvDq8ikWAM`)
- Warm, natural female voice
- Clear pronunciation
- Good for elderly care context

Other popular options (change ELEVENLABS_VOICE_ID):
- `ErXwobaYiN019PkySvjV` - Antoni (male, deep)
- `MF3mGyEYCl7XYWbV9V6O` - Elli (female, young)
- `TxGEqnHWrfWFTfGW9XjX` - Josh (male, friendly)

## Testing

```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev

# Test in chat:
1. Click "Open Chat"
2. Ask anything
3. Click "Listen" button
4. Hear high-quality ElevenLabs voice
```

## Cost Note

ElevenLabs has generous free tier:
- 10,000 characters/month free
- ~5-10 minutes of speech
- Perfect for demo/development
- Upgrade only if needed for production

## Summary

**Before:** Browser TTS only (basic quality)  
**Now:** ElevenLabs + Browser TTS (premium quality with fallback)

All keys working. No additional setup needed. Just run it. 🔊
