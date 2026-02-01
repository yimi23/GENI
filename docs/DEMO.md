# GENI Demo Script - SpartaHack 2024

## 🎬 5-Minute Demo Flow

### Opening (30 seconds)
> "Hi! I'm Praise, and this is GENI - an AI-powered companion for elderly care. Margaret is 78 and lives alone with diabetes and high blood pressure. GENI helps her stay safe and independent while keeping her family connected."

**Show:** Dashboard overview

---

### Demo 1: Medication Tracking (60 seconds)

**Scenario:** Morning medication reminder

**Show:**
1. Dashboard → Medication card showing today's schedule
2. "Morning pills taken ✅, afternoon pending ⏰"
3. Click "Check Pills" → Camera opens
4. Point at pill organizer
5. Claude Vision analyzes: "Pills still present"
6. Manual confirm → Status updates in real-time

**Say:**
> "GENI tracks Margaret's medication schedule. We use Claude Vision to visually verify if pills are taken, plus manual confirmation. Real-time updates keep everyone informed."

**Tech highlight:** Claude Vision API, Socket.IO real-time updates

---

### Demo 2: Voice Interaction (60 seconds)

**Scenario:** Margaret asks about her schedule

**Show:**
1. Click "Open Chat"
2. Click microphone button 🎤
3. Speak: "What appointments do I have today?"
4. Watch voice visualizer
5. Whisper transcribes
6. Claude responds: "You have a doctor appointment at 3:30 PM"
7. Response plays via browser TTS

**Say:**
> "Voice-first interface because many seniors prefer talking over typing. Whisper handles speech-to-text, Claude understands intent and responds naturally, then browser text-to-speech reads it aloud."

**Tech highlight:** OpenAI Whisper, Claude intent parsing, Web Speech API

---

### Demo 3: Fall Detection & Emergency (90 seconds)

**Scenario:** Fall detected, emergency protocol

**Show:**
1. Click "🆘 Help" (or press F for demo)
2. Modal appears: "Fall Detected - Are you okay?"
3. Click "I Need Help"
4. 60-second countdown starts
5. Show color changes (yellow → orange → red)
6. Alert fires → WhatsApp messages sent
7. Show backend logs: "Emergency alerts sent to 2 contacts"

**Say:**
> "If Margaret falls or presses the emergency button, she has 60 seconds to cancel if it's a false alarm. The countdown gets urgent - color changes, beeping, phone vibration. If not canceled, GENI automatically alerts all emergency contacts via WhatsApp with her location."

**Tech highlight:** Real-time UI, Twilio WhatsApp API, Socket.IO events

---

### Demo 4: Family Communication (60 seconds)

**Scenario:** Daughter sends message via WhatsApp

**Show:**
1. Send WhatsApp message to Twilio sandbox (pre-prepared)
2. Message appears in backend logs
3. Orange banner slides down in UI
4. Click "Listen" → Browser reads message aloud
5. Click "Reply" → Opens chat
6. Type response, send
7. Show message delivered via Twilio

**Say:**
> "Family can text Margaret via WhatsApp - even if they're not tech-savvy. Messages appear instantly with a 'Listen' button for text-to-speech. Margaret can reply via voice or text, and it goes straight to their WhatsApp."

**Tech highlight:** Twilio webhooks, Socket.IO push, bidirectional WhatsApp

---

### Demo 5: Activity Dashboard (30 seconds)

**Show:**
1. Dashboard → Activity Feed
2. Scroll through log:
   - "Morning medication taken (camera verified)"
   - "Voice command received"
   - "Message sent to Sarah"
   - "Movement detected in kitchen"

**Say:**
> "Everything GENI sees and does gets logged in real-time. Caregivers can review the full activity history - medication compliance, conversations, movements, messages."

---

### Tech Stack Breakdown (30 seconds)

**Show:** Architecture diagram or README

**Say:**
> "Stack: React frontend with Socket.IO for real-time updates. Node.js backend orchestrating five AI/communication APIs. Claude for vision analysis and conversation, Whisper for speech, Twilio for WhatsApp, optional ElevenLabs for better voice. We also integrate with FREE-WiLi hardware for physical buttons and LED indicators."

---

### Closing (30 seconds)

**Say:**
> "GENI isn't just an app - it's peace of mind. Seniors get independence and AI support. Families get transparency and instant communication. And it all just works - no complex setup, natural interaction, real-time everything."

**Final Screen:** Show real-time dashboard with live data

---

## 🎯 Demo Prep Checklist

**Before demo:**
- [ ] Backend running (`npm run dev`)
- [ ] Frontend running (`npm run dev`)
- [ ] Twilio sandbox active
- [ ] Test WhatsApp message ready to send
- [ ] Camera permissions granted
- [ ] Microphone permissions granted
- [ ] Fall detection button visible (remove for production)
- [ ] Browser at http://localhost:3000
- [ ] Zoom to 125% for better visibility
- [ ] Close unnecessary browser tabs

**Have ready:**
- [ ] Phone with WhatsApp to demo incoming messages
- [ ] Pill organizer or photo for vision demo
- [ ] Backend terminal visible (for "wow factor" logs)

**If something breaks:**
- Fall back to static screenshots
- Pre-recorded screen recording as backup
- Emphasize the working pieces

## 🔥 Potential Questions

**Q: How do you handle false positive falls?**
A: 60-second cancellation window with escalating urgency. Also integrates with hardware motion sensors for smarter detection.

**Q: What about privacy?**
A: All data stays local in state, no persistent database. Family sees only what Margaret shares. Camera analyzes locally when possible.

**Q: Cost to run?**
A: API costs minimal for single user (~$5-10/month). Twilio WhatsApp is free in sandbox, ~$0.005/message in production.

**Q: Real hardware integration?**
A: Yes! FREE-WiLi partner handles Raspberry Pi with LEDs, buzzer, and physical emergency button. Backend has endpoints ready.

**Q: Scalability?**
A: Current version is single-user, in-memory state. Production would add PostgreSQL, Redis for Socket.IO, and user authentication.

---

**Good luck! 🐾**
