# 🔧 Quick Fix Guide - API Keys

## 🚨 CRITICAL: 2 API Keys Need Updating

### 1. Anthropic Claude API Key (BLOCKING ALL AI)

**Current Issue:** `401 invalid x-api-key` - key is expired/invalid

**How to Fix:**
1. Go to https://console.anthropic.com
2. Log in with your account
3. Navigate to "API Keys"
4. Create a new API key (or copy existing valid one)
5. Open `/Users/yimi/Desktop/GENI/.env`
6. Replace the `ANTHROPIC_API_KEY` line:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_NEW_KEY_HERE_IT_WILL_BE_LONG
```

**What This Fixes:**
- ✅ Chat responses (Claude conversation)
- ✅ Intent parsing (understanding user commands)
- ✅ Pill detection (Claude Vision)
- ✅ Voice responses (after transcription)

---

### 2. Twilio Auth Token (BLOCKING WHATSAPP)

**Current Issue:** Token is incomplete (26 chars, needs 32)

**Current (broken):** `6b1b5fb9c5e08acfdc469a`

**How to Fix:**
1. Go to https://console.twilio.com
2. Log in
3. Click on "Account" → "API keys & tokens"
4. Find your "Auth Token" (should be 32 characters)
5. Click "Show" to reveal it
6. Copy the FULL token
7. Open `/Users/yimi/Desktop/GENI/.env`
8. Replace the `TWILIO_AUTH_TOKEN` line:

```bash
TWILIO_AUTH_TOKEN=your_full_32_character_token_here
```

**What This Fixes:**
- ✅ WhatsApp message sending
- ✅ Emergency alerts to caregivers
- ✅ "Tell Sarah to call me" feature

---

## After Updating .env

1. **Restart the backend server:**
```bash
cd /Users/yimi/Desktop/GENI/backend
npm start
```

2. **Test the chat endpoint:**
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello GENI"}'
```

You should get a real Claude response instead of "I understand. How can I help you?"

3. **Test WhatsApp:**
```bash
curl -X POST http://localhost:5000/api/send-message \
  -H "Content-Type: application/json" \
  -d '{"message":"Test from GENI!"}'
```

You should get `{"success":true}` instead of an error.

---

## Optional (Not Blocking)

### Update Caregiver Phone
Current: `+1234567890` (placeholder)

In `.env`:
```bash
CAREGIVER_PHONE=+1_YOUR_REAL_NUMBER
```

---

## Once Fixed: 100% Functional ✅

All 7 REST endpoints will work  
All 4 AI integrations will be real  
No smoke and mirrors - everything connects to live APIs

Ready for hackathon judges! 🎯
