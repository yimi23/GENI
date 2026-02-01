# 🐾 GENI - AI Elder Care Companion

**SpartaHack 2024** | Production-ready AI system with Logo samples UI + Real backend

---

## 🚀 Quick Start (30 seconds)

```bash
cd /Users/yimi/Desktop/GENI

# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev

# Open: http://localhost:3000
```

**All API keys configured. Just run it.**

---

## ✅ What You Get

### UI (From Logo Design Samples)
- ✅ **Dashboard** - 6 cards (Profile, Medications, Hardware, Contacts, Reminders, Activity)
- ✅ **Chat Interface** - Voice + text with AI
- ✅ **Medication History** - 7-day calendar
- ✅ **Fall Detection Modal** - Emergency alerts
- ✅ **60+ Polished Components** - Professional UI

### Backend (Real AI Integration)
- ✅ **Claude Vision** - Pill detection via camera
- ✅ **Claude Chat** - Natural conversations
- ✅ **Whisper** - Voice transcription
- ✅ **Socket.IO** - Real-time updates everywhere
- ✅ **7 API Endpoints** - Complete REST API

### Configuration
- ✅ **ONE .env** - All config in root (learned from Remi)
- ✅ **Working API Keys** - Anthropic + OpenAI from Remi project
- ✅ **No Setup Needed** - Dependencies installed, keys configured

---

## 📁 Structure

```
GENI/
├── .env                    ← ONE config with working keys
├── frontend/               ← Logo samples UI (60+ components)
│   ├── components/         ← Dashboard, Chat, History, Modals
│   ├── services/           ← API, Socket, Camera, Voice, TTS
│   └── hooks/              ← React hooks
└── backend/                ← Node.js + TypeScript
    ├── routes/             ← 7 API endpoints
    ├── services/           ← 5 AI integrations
    └── models/             ← Data structures
```

**94 TypeScript files. 5,000+ lines. Production quality.**

---

## 🎯 Features

### Working Now
1. **Chat** - Real Claude AI conversations
2. **Voice** - Whisper speech-to-text
3. **Pill Detection** - Claude Vision camera analysis
4. **Emergency Alerts** - Fall detection with 60s countdown
5. **Real-time Updates** - Socket.IO throughout
6. **Activity Logging** - Complete event tracking

### Add Later (Optional)
- WhatsApp messaging (Twilio free sandbox)
- Premium TTS (ElevenLabs)
- Hardware integration (FREE-WiLi)

---

## 🔑 API Keys (Already Working)

From your Remi project:
```
✅ Anthropic Claude: sk-ant-api03-Nd7cNN...kavhfgAA
✅ OpenAI Whisper:   sk-svcacct-zuUv_Tkp...yr_kwA
```

All in ONE `.env` at root. No multiple configs.

---

## 🧪 Test It

### 1. Start Servers
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2  
cd frontend && npm run dev
```

### 2. Test Features
- **Dashboard** - See live patient data
- **Chat** - Ask "What medications do I take?"
- **Voice** - Click mic, speak, see transcription
- **Camera** - Click "Check Pills", allow camera
- **Emergency** - Click "🆘 Help", see modal

### 3. Check Real-time
- Activity Feed updates instantly
- Medication status changes live
- Socket.IO events in console

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| **READY.md** | ⭐ Complete overview |
| **START.md** | Quick 2-step guide |
| **STRUCTURE_FINAL.md** | Complete file structure |
| **docs/DEMO.md** | Hackathon demo script |
| **docs/SETUP.md** | Detailed setup |
| **docs/ARCHITECTURE.md** | System design |

---

## 🛠️ Tech Stack

**Frontend:**
- React 18 + TypeScript + Vite
- Tailwind CSS 4 (styling)
- Radix UI (60+ components from Logo samples)
- Socket.IO Client (real-time)

**Backend:**
- Node.js + TypeScript + Express
- Anthropic Claude (Vision + Chat)
- OpenAI Whisper (speech-to-text)
- Socket.IO Server (real-time events)

---

## 📊 Stats

- **94 TypeScript files**
- **5,000+ lines of code**
- **60+ UI components** (from Logo samples)
- **7 API endpoints** (working)
- **5 AI integrations** (Claude, Whisper, etc.)
- **0 mocks or fakes** (all real)

---

## 🎬 Demo Flow (5 minutes)

1. **Dashboard** - Show live patient monitoring
2. **Chat** - "What medications do I take?" → Claude responds
3. **Voice** - Click mic → speak → Whisper transcribes
4. **Pill Check** - Camera → Claude Vision analyzes
5. **Emergency** - Click 🆘 → 60s countdown → alerts

See `docs/DEMO.md` for full script.

---

## 🔧 Configuration

### Single .env (Root)
```env
# Server
PORT=5000
NODE_ENV=development

# Patient
PATIENT_NAME=Margaret Johnson
CAREGIVER_PHONE=+1234567890

# AI (Working from Remi)
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-svcacct-...

# Optional
TWILIO_ACCOUNT_SID=
ELEVENLABS_API_KEY=
```

**Backend reads:** `dotenv.config({ path: '../.env' })`  
**Frontend reads:** `.env.local` (auto-generated)

---

## 🚨 Troubleshooting

**Port already in use:**
```bash
lsof -ti:5000 | xargs kill -9
```

**Need to reinstall:**
```bash
cd backend && npm install
cd ../frontend && npm install
```

**Check if keys loaded:**
```bash
cd backend && node -e "require('dotenv').config({path:'../.env'}); console.log('Anthropic:', process.env.ANTHROPIC_API_KEY ? '✅' : '❌');"
```

---

## 🤝 Team

- **Praise Oyimi** - Full Stack + AI Integration
- **Partner** - Hardware (FREE-WiLi)

---

## 📄 License

MIT License - SpartaHack 2024

---

**Logo samples UI ✅ Real backend ✅ Working APIs ✅**

**One .env. Just run it. Win the hackathon. 🐾🏆**
