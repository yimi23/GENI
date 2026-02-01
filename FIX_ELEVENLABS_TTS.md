# 🚨 CRITICAL: ElevenLabs TTS is BROKEN - Fix Required

**Status:** ❌ TTS falling back to crappy laptop voice  
**Cause:** API key has zero permissions (revoked or restricted)  
**Impact:** Praise specifically wants human-sounding TTS, not robot voice

---

## 🔍 What's Wrong

The current ElevenLabs API key in `.env`:
```
ELEVENLABS_API_KEY=sk_acd12d96729f02d93447bdc658f76874518bf0eb8cf4fb2d
```

**Testing this key:**
```bash
curl -s "https://api.elevenlabs.io/v1/user" \
  -H "xi-api-key: sk_acd12d96729f02d93447bdc658f76874518bf0eb8cf4fb2d"
```

**Result:**
```json
{
  "detail": {
    "status": "missing_permissions",
    "message": "The API key you used is missing the permission user_read to execute this operation."
  }
}
```

**Same error for:**
- ❌ `text_to_speech` permission (can't generate audio)
- ❌ `voices_read` permission (can't list voices)
- ❌ `user_read` permission (can't verify account)

**This key has ZERO permissions. It's either revoked or severely restricted.**

---

## ✅ How to Fix

### Step 1: Generate New API Key

1. Go to **https://elevenlabs.io/app/settings**
2. Log in (use your ElevenLabs account)
3. Navigate to **API Keys** section
4. Click **"Generate New Key"**
5. **IMPORTANT:** Make sure the key has these permissions:
   - ✅ `text_to_speech` (required)
   - ✅ `voices_read` (helpful for debugging)
   - ✅ `user_read` (helpful for monitoring usage)

### Step 2: Update GENI .env

Open `~/Desktop/GENI/.env` and replace the old key:

```bash
# OLD (broken):
ELEVENLABS_API_KEY=sk_acd12d96729f02d93447bdc658f76874518bf0eb8cf4fb2d

# NEW (your fresh key from Step 1):
ELEVENLABS_API_KEY=sk_your_new_key_here
```

### Step 3: Test the New Key

```bash
# Test API key works
curl -s "https://api.elevenlabs.io/v1/user" \
  -H "xi-api-key: sk_your_new_key_here"

# Should return account info, not error
```

### Step 4: Restart GENI Backend

```bash
cd ~/Desktop/GENI/backend
# Kill current backend
pkill -f "ts-node src/index.ts"

# Restart
npm run dev
```

### Step 5: Test TTS Endpoint

```bash
# Test TTS generation
curl -X POST http://localhost:5001/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, this is GENI testing ElevenLabs voice"}' \
  --output test_audio.mp3

# If working, you'll get an MP3 file
# Play it:
open test_audio.mp3
```

---

## 🎯 Voice ID (Keep This)

The current voice ID is **Rachel** - warm, natural female voice:
```
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

**Keep this in .env - it's the right voice for elderly care.**

---

## 🔄 Alternative: Use Free Tier Account

If you don't have an ElevenLabs account yet:

1. **Sign up (Free):** https://elevenlabs.io/sign-up
2. **Free Tier Includes:**
   - 10,000 characters/month
   - All voices (including Rachel)
   - Text-to-speech API access
3. **Generate API key** from dashboard
4. **Copy key** to GENI `.env`

---

## 📊 Current Behavior

**What happens now:**
1. Frontend calls `/api/tts` with GENI's response text
2. Backend tries to call ElevenLabs API
3. ElevenLabs returns `401 missing_permissions`
4. Backend returns `500` error to frontend
5. Frontend falls back to **browser TTS** (crappy laptop voice)

**What should happen:**
1. Frontend calls `/api/tts`
2. Backend successfully calls ElevenLabs
3. Returns MP3 audio with **Rachel's voice**
4. Frontend plays smooth, human-sounding audio
5. **Much better UX for elderly users**

---

## 🧪 Quick Test Script

I created a test script:

```bash
cd ~/Desktop/GENI
./test_elevenlabs.sh
```

This will:
- Test your API key
- Verify permissions
- Generate a sample audio
- Report status

---

## ⚠️ Why This Matters

**Praise's feedback:**
> "stop using my laptop's TTS it loses the human touch because it sounds like crappy ai voice"

**Impact:**
- Browser TTS sounds robotic and unnatural
- ElevenLabs Rachel voice is warm and conversational
- Critical for elderly users who need human connection
- GENI's personality comes through in voice quality

**Bottom line:** This is HIGH PRIORITY for user experience.

---

## 📝 Checklist

- [ ] Log into elevenlabs.io
- [ ] Generate new API key with `text_to_speech` permission
- [ ] Update `~/Desktop/GENI/.env` with new key
- [ ] Restart GENI backend
- [ ] Test TTS endpoint
- [ ] Verify frontend plays ElevenLabs audio (not browser TTS)
- [ ] Delete this file once fixed ✅

---

**Once fixed, delete this file and update `API_KEYS.md` with the new working key.**

---

**Status:** 🔴 BROKEN - Needs immediate attention  
**Priority:** HIGH - UX critical  
**Owner:** Praise  
**ETA:** ~5 minutes to fix
