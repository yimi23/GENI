# 🔊 ElevenLabs TTS Integration - NEEDS API KEY UPDATE

## ❌ Current Problem

**Your ElevenLabs API key doesn't have TTS permissions!**

Error from API:
```
"The API key you used is missing the permission text_to_speech to execute this operation."
```

---

## ✅ What's Already Set Up

**Frontend:**
- ✅ Configured to use `/api/tts` endpoint
- ✅ Falls back to system voice if ElevenLabs fails (this is what's happening now)

**Backend:**
- ✅ TTS route at `/api/tts`  
- ✅ ElevenLabs service integrated
- ✅ Voice ID configured: `21m00Tcm4TlvDq8ikWAM` (Rachel)

**Current .env:**
```
ELEVENLABS_API_KEY=sk_acd12d96729f02d93447bdc658f76874518bf0eb8cf4fb2d
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

---

## 🔧 How to Fix

### Option 1: Enable TTS on Current Key

1. Go to https://elevenlabs.io/app/settings/api
2. Find the API key ending in `...8cf4fb2d`
3. Enable "Text-to-Speech" permission
4. Restart GENI backend

### Option 2: Create New API Key

1. Go to https://elevenlabs.io/app/settings/api
2. Click "Create New Key"
3. **Enable "Text-to-Speech" permission** ⚠️
4. Copy the new key
5. Update `~/Desktop/GENI/.env`:
   ```
   ELEVENLABS_API_KEY=sk_YOUR_NEW_KEY_HERE
   ```
6. Restart GENI backend:
   ```bash
   pkill -f nodemon
   cd ~/Desktop/GENI/backend && npm run dev
   ```

---

## 🎯 After Fix

**GENI will:**
- Use natural ElevenLabs voice (Rachel)
- Sound human and warm
- No more "crappy AI voice" from laptop TTS

**Test it:**
```bash
curl -X POST http://localhost:5001/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello Margaret, this is GENI speaking with ElevenLabs"}' \
  -o test.mp3 && open test.mp3
```

---

## 📝 Recommended Voice Settings

**Current:** Rachel (warm, friendly female voice)  
**Voice ID:** `21m00Tcm4TlvDq8ikWAM`

**Other good options for elderly care:**
- **Bella** (`EXAVITQu4vr4xnSDxMaL`) - Soft, clear, mature
- **Dorothy** (`ThT5KcBeYPX3keUQqHPh`) - Pleasant, older woman
- **Domi** (`AZnzlk1XvdvUeBnXmlld`) - Warm, expressive

To change voice, just update `ELEVENLABS_VOICE_ID` in `.env`

---

## ⚠️ Important

**Without a valid TTS-enabled API key, GENI will keep using laptop TTS.**

Get this fixed ASAP for the human touch! 🎯
