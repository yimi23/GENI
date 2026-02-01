# GENI System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                       FAMILY/USER                           │
│  WhatsApp (Twilio) ←→ Browser (React) ←→ Voice/Camera       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP REST + WebSocket
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    BACKEND (Node.js)                        │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐       │
│  │   Express   │  │  Socket.IO  │  │  In-Memory   │       │
│  │     API     │  │   Server    │  │    State     │       │
│  └─────────────┘  └─────────────┘  └──────────────┘       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Service Orchestration                  │   │
│  │                                                     │   │
│  │  • twilio.ts     → WhatsApp send/receive          │   │
│  │  • vision.ts     → Claude Vision pill analysis     │   │
│  │  • whisper.ts    → Speech transcription           │   │
│  │  • elevenlabs.ts → Text-to-speech generation      │   │
│  │  • intent.ts     → Claude intent parsing          │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ API Calls
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   EXTERNAL SERVICES                         │
│                                                             │
│  Twilio          Anthropic      OpenAI         ElevenLabs  │
│  WhatsApp        Claude AI      Whisper        TTS         │
└─────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│                   HARDWARE (Optional)                       │
│                   FREE-WiLi (Raspberry Pi)                  │
│  Emergency Button | LEDs | Buzzer | Motion Sensor          │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### 1. Voice Command Flow

```
User speaks
  ↓
Frontend captures audio (MediaRecorder)
  ↓
POST /api/voice (FormData with audio blob)
  ↓
Backend saves temp file
  ↓
Whisper transcribes to text
  ↓
Claude parses intent
  ↓
Claude generates response
  ↓
Socket.IO emits 'speak' event
  ↓
Frontend plays TTS
  ↓
Activity logged in state
  ↓
Socket.IO emits 'activity' event
  ↓
Dashboard updates in real-time
```

### 2. Medication Tracking Flow

```
Camera captures pill image
  ↓
Frontend sends to POST /api/pill-check
  ↓
Backend converts to base64
  ↓
Claude Vision analyzes image
  ↓
Returns: {status: 'present'|'taken', confidence, observations}
  ↓
Backend updates medication state
  ↓
Socket.IO emits 'medication_update'
  ↓
Frontend updates medication card
  ↓
Activity logged
```

### 3. Emergency Alert Flow

```
User clicks 🆘 Help (or hardware button pressed)
  ↓
POST /api/emergency
  ↓
Backend logs emergency activity
  ↓
Socket.IO emits 'fall_detected' event
  ↓
Frontend shows 60-second countdown modal
  ↓
If not canceled:
  ↓
Backend sends WhatsApp to all contacts (Twilio)
  ↓
Logs alert confirmations
  ↓
Socket.IO updates activity feed
```

### 4. Incoming WhatsApp Message Flow

```
Family sends WhatsApp message
  ↓
Twilio receives message
  ↓
POST /webhook/twilio (from Twilio)
  ↓
Backend parses message
  ↓
Logs activity
  ↓
Socket.IO emits 'incoming_message' event
  ↓
Frontend shows orange banner
  ↓
User clicks "Listen"
  ↓
Browser TTS reads message aloud
  ↓
User clicks "Reply"
  ↓
Opens chat interface
```

## Frontend Architecture

```
App.tsx (Router + State)
  │
  ├── Dashboard
  │     ├── ProfileCard (patient info)
  │     ├── MedicationCard (today's pills)
  │     ├── HardwareStatusPanel (LEDs/button)
  │     ├── ContactsCard (emergency contacts)
  │     ├── RemindersCard (schedule)
  │     └── ActivityFeed (recent logs)
  │
  ├── ChatInterface
  │     ├── MessageBubble (GENI/User/Family)
  │     ├── VoiceInput (microphone recording)
  │     ├── QuickReplies (preset responses)
  │     └── TypingIndicator
  │
  ├── MedicationHistory
  │     ├── CalendarStrip (7-day view)
  │     └── DayDetails (breakdown by time)
  │
  └── Modals
        ├── FallDetectionModal (emergency UI)
        └── IncomingMessageBanner (WhatsApp alerts)
```

## Backend Architecture

```
index.ts (Express server + Socket.IO)
  │
  ├── Routes
  │     ├── status.ts       (GET /api/status)
  │     ├── chat.ts         (POST /api/chat)
  │     ├── voice.ts        (POST /api/voice)
  │     ├── medication.ts   (pill-check, confirm, history)
  │     ├── messages.ts     (send WhatsApp)
  │     ├── emergency.ts    (trigger alerts)
  │     └── webhooks.ts     (Twilio incoming)
  │
  ├── Services
  │     ├── twilio.ts       (WhatsApp integration)
  │     ├── vision.ts       (Claude Vision)
  │     ├── whisper.ts      (OpenAI transcription)
  │     ├── elevenlabs.ts   (TTS generation)
  │     └── intent.ts       (Claude intent parsing)
  │
  ├── Models
  │     ├── Patient.ts
  │     ├── Medication.ts
  │     ├── Activity.ts
  │     └── Reminder.ts
  │
  └── Prompts
        ├── pillDetection.ts   (Claude Vision instructions)
        ├── intentParsing.ts   (intent extraction prompt)
        └── conversation.ts    (chat response generation)
```

## State Management

**Backend:** In-memory state object (state.ts)
- Patient profile
- Contacts list
- Today's medications
- 7-day medication history
- Activity log (last 50 events)
- Reminders
- Hardware status

**Frontend:** React hooks + Socket.IO
- `useStatus()` - Fetches initial dashboard data
- `useSocket()` - Manages WebSocket connection
- `useSocketEvent()` - Subscribes to real-time events

Real-time updates flow:
1. Backend modifies state
2. Backend emits Socket.IO event
3. Frontend receives event
4. Frontend updates UI immediately
5. No polling needed

## Security Considerations

1. **API Keys**: Never commit .env files
2. **CORS**: Restricted to frontend origin
3. **Input Validation**: All user inputs sanitized
4. **File Uploads**: Limited to images/audio, size capped
5. **WhatsApp Webhook**: Verify Twilio signature (TODO)
6. **Rate Limiting**: Add Express rate-limit middleware (TODO)

## Scalability Path

Current: Single-user, in-memory state

**Production MVP:**
- PostgreSQL for persistent state
- Redis for Socket.IO pub/sub (multi-server)
- User authentication (Auth0/Clerk)
- File storage (S3/Cloudinary)

**Full Scale:**
- Multi-tenant architecture
- Microservices (separate AI service)
- Queue system (Bull/RabbitMQ) for async tasks
- Analytics dashboard for caregivers
- Mobile app (React Native)

## Technology Choices

| Component | Technology | Why |
|-----------|------------|-----|
| Frontend | React + TypeScript | Component reusability, type safety |
| Backend | Node.js + Express | JavaScript everywhere, fast prototyping |
| Real-time | Socket.IO | Bidirectional, auto-reconnect, rooms support |
| AI Vision | Claude 3.5 Sonnet | Best vision model, multimodal |
| Speech-to-Text | OpenAI Whisper | Industry standard, multilingual |
| Text-to-Speech | Browser Speech API + ElevenLabs | No API needed (browser), natural voices (ElevenLabs) |
| Messaging | Twilio WhatsApp | Reach family where they are |
| Styling | Tailwind CSS | Utility-first, rapid development |
| Build | Vite | Fast HMR, modern tooling |

## Performance

- **Initial load**: <2s (dashboard data is small)
- **Socket latency**: <50ms (local network)
- **Voice transcription**: 1-3s (Whisper API)
- **Claude Vision**: 2-5s (image analysis)
- **Chat response**: 1-2s (Claude streaming possible)
- **WhatsApp delivery**: 1-3s (Twilio)

## Monitoring & Logging

All events logged to console with emojis:
- ✅ Success events
- ❌ Error events
- 🔍 Vision analysis
- 🎤 Audio transcription
- 💬 Chat messages
- 📨 WhatsApp events

Production: Add structured logging (Winston/Pino) + error tracking (Sentry)
