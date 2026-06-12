# 🐾 GENI — AI Elder Care Companion

GENI watches over elderly individuals living alone and keeps their families connected to their wellbeing — a warm conversational companion with passive medication monitoring, automatic fall detection, and caregiver alerts. **Companionship that protects.**

## Quick start

```bash
# 1. Configure (first time only)
cp .env.example .env   # then fill in your keys

# 2. Backend (terminal 1)
cd backend && npm install && npm run dev

# 3. Frontend (terminal 2)
cd frontend && npm install && npm run dev
```

Tip: set `PORT=5001` in `.env` — macOS AirPlay occupies the default 5000.

## What it does

- **Conversational companion** — context-aware chat powered by Claude. GENI knows the medication schedule, recent activity, and conversation history before every exchange.
- **Voice** — Whisper speech-to-text in, ElevenLabs voice out (browser TTS fallback).
- **Medication adherence** — Claude Vision reads the pill organizer from camera frames; seven-day adherence history with concern-tiered caregiver alerts.
- **Fall detection** — YOLO pose estimation with a 60-second cancellable countdown before caregivers are alerted via Twilio WhatsApp/SMS.
- **Caregiver notifications** — every message flows through one decision gate (quiet hours by priority, dedup with escalation override). A confirmed fall always gets through; repeated triggers don't spam.
- **Real-time dashboard** — patient profile, medication schedule, contacts, reminders, live activity feed over Socket.IO.

## Architecture

```
backend/  Node + TypeScript + Express
  src/
    lib/           db (SQLite/WAL), logger (pino), shared Anthropic client
    middleware/    auth (API key), request context, global error handler
    services/
      monitoring/  ONE monitoring core: frame path + time-based cycle
      notifications.ts   ONE caregiver-messaging path with the decision gate
      vision.ts    all Claude Vision calls (structured outputs — guaranteed JSON)
      geni-brain.ts / geni-context.ts   the context engine
      fall-detection.ts  Python YOLO sidecar supervision + circuit breaker
    routes/        thin Express routes
    database/      pill check history (SQLite)
frontend/ React 18 + Vite + Tailwind + Radix
```

- **Storage:** SQLite via better-sqlite3 (WAL). Legacy JSON data imports automatically on first boot.
- **AI:** `claude-haiku-4-5` for chat and vision (set `ANTHROPIC_VISION_MODEL=claude-sonnet-4-6` for stronger pill detection).
- **Security:** set `GENI_API_KEY` and every `/api` route plus the Socket.IO handshake requires it. CORS allowlist via `CORS_ORIGINS`. Production refuses to start without a key.
- **Health:** `GET /health` reports real subsystem state (fall detection process, AI config) and returns 503 when degraded.

## Commands

```bash
cd backend
npm run dev       # nodemon + ts-node
npm test          # vitest (notification gate + adherence logic)
npm run build     # tsc -> dist/

cd frontend
npm run dev       # vite dev server
npm run build     # production build

# production
pm2 start ecosystem.config.js   # from repo root, after backend build
```

## Environment

See `.env.example` for the full list. Required: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`. Required in production: `GENI_API_KEY` (generate with `openssl rand -hex 32`; mirror it as `VITE_GENI_API_KEY` in `frontend/.env.local`).

## Status

Working end to end: chat, voice, pill detection, fall countdown, caregiver notifications, dashboard. Twilio runs in sandbox mode pending a production account. Next up: remote family dashboard, fall-detection tuning.

Built by Praise Oyimi.
