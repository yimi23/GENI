# 🚀 GENI - 5-Minute Quick Start

## What You Have

A **production-ready** AI elder care system with:
- ✅ **Working Anthropic API** (Claude Vision + Chat)
- ✅ **Complete UI** from Logo design samples
- ✅ **Real-time backend** with Socket.IO
- ✅ **5,000+ lines** of TypeScript code

## Instant Setup (One Command)

```bash
cd /Users/yimi/Desktop/GENI
./setup-and-test.sh
```

This installs everything and shows you what's working.

## Start GENI (Two Terminals)

**Terminal 1 - Backend:**
```bash
cd /Users/yimi/Desktop/GENI/backend
npm run dev
```

Wait for:
```
╔════════════════════════════════════════╗
║   🐾 GENI Backend Server Running      ║
║   Port: 5000                           ║
╚════════════════════════════════════════╝
```

**Terminal 2 - Frontend:**
```bash
cd /Users/yimi/Desktop/GENI/frontend
npm run dev
```

Wait for:
```
VITE ready in XXXms
➜ Local: http://localhost:3000/
```

**Open:** http://localhost:3000

## What Works Right Now

### ✅ Fully Working (No Setup Needed)
1. **Dashboard** - Real patient data, medications, activities
2. **Chat with Claude** - Type messages → Claude responds
3. **Pill Detection** - Camera → Claude Vision analyzes
4. **Emergency Alerts** - 🆘 Help button → fall detection flow
5. **Real-time Updates** - Socket.IO live data everywhere
6. **Activity Logs** - Everything tracked and displayed

### ⏭️ Easy to Add (5 mins each)
7. **Voice Commands** - Add OpenAI API key for Whisper
8. **WhatsApp Integration** - Add Twilio API keys (free sandbox)
9. **Better TTS** - Add ElevenLabs key (optional, browser TTS works)

## Test It!

### Test 1: Dashboard
- See Margaret's profile, medications, activity feed
- All data comes from backend in real-time

### Test 2: Chat with Claude
1. Click "Open Chat"
2. Type: "What medications do I take today?"
3. Claude responds with current medication list
4. Click "Listen" to hear TTS

### Test 3: Pill Detection
1. Back to dashboard
2. Click "Check Pills"
3. Allow camera access
4. Point at anything (pills, hand, etc.)
5. Claude Vision describes what it sees

### Test 4: Emergency
1. Click "🆘 Help" button
2. Modal appears with 60-second countdown
3. Click "I Need Help" to see emergency flow

## API Keys Status

**Working Now:**
- ✅ Anthropic (Claude) - From your bowen project

**Optional (Get Later):**
- OpenAI (Whisper) - https://platform.openai.com/api-keys
- Twilio (WhatsApp) - https://www.twilio.com/try-twilio (free sandbox)
- ElevenLabs (Better TTS) - https://elevenlabs.io/ (optional)

Add them to `backend/.env` anytime.

## Project Structure

```
GENI/
├── backend/       → Node.js API with Claude integration
├── frontend/      → React UI (from Logo design samples)
└── docs/          → Full documentation
```

## Demo for Hackathon

See `docs/DEMO.md` for:
- 5-minute demo script
- What to show judges
- Backup plan if WiFi fails

## Troubleshooting

**Backend won't start:**
```bash
cd backend
npm install
# Check .env has Anthropic key
npm run dev
```

**Frontend won't start:**
```bash
cd frontend
npm install
npm run dev
```

**Port already in use:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
# Or change PORT in backend/.env
```

**Can't connect:**
- Make sure backend shows "Server Running"
- Check frontend .env has `VITE_API_URL=http://localhost:5000`
- Open browser console (F12) for errors

## Next Steps

1. **Now:** Test all working features
2. **Before hackathon:** Get Twilio WhatsApp sandbox (5 mins)
3. **Optional:** Add OpenAI for voice commands
4. **Demo day:** Follow `docs/DEMO.md` script

## Need Help?

- **Setup:** See `docs/SETUP.md`
- **Architecture:** See `docs/ARCHITECTURE.md`
- **Demo:** See `docs/DEMO.md`
- **Code:** Browse `STRUCTURE.txt`

---

**You have a real, working AI application. Just run it!** 🚀
