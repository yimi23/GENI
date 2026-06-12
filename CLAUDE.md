# CLAUDE.md - GENI Project Memory & Rules

> **Purpose:** Self-improvement log for Claude. Update after every correction to prevent repeat mistakes.

## Project Overview

**GENI** = Conversational AI health companion for elderly care
- **Backend:** Node.js + TypeScript + Express + Socket.IO
- **Frontend:** React + TypeScript + Vite + TailwindCSS
- **AI:** Claude (Anthropic) for conversations + vision
- **Voice:** ElevenLabs TTS + OpenAI Whisper STT
- **Messaging:** Twilio (WhatsApp/SMS for caregivers)

---

## Critical Rules (Never Break These)

### 1. Claude Model Names
✅ **CURRENT:** `claude-haiku-4-5` — used everywhere (vision, conversations, brain) as of 2026-06-10.

**History:** The project previously used `claude-3-5-haiku-20241022`, which Anthropic retired on Feb 19, 2026 (404s now). All Claude 3.x models are retired or deprecated. Current model family: `claude-haiku-4-5` (cheap, vision-capable), `claude-sonnet-4-6` (stronger vision/reasoning), `claude-opus-4-8` (most capable Opus tier).

**If pill detection accuracy needs a boost:** change `visionModel` in `config.ts` to `claude-sonnet-4-6` ($3/$15 per MTok vs Haiku's $1/$5).

**Never hardcode dated model IDs** — use aliases like `claude-haiku-4-5` so retirements don't silently break the app again.
**Updated:** 2026-06-10 (SDK upgraded 0.20 → 0.104)

### 2. React State + HMR = Data Loss
❌ **WRONG:** Store critical data only in React state
✅ **CORRECT:** Persist to sessionStorage for HMR survival

**Why:** Hot Module Reload wipes React state, losing messages/monitoring state
**Fixed in:** ChatInterface.tsx, useContinuousMonitoring.ts
**Pattern:**
```typescript
// Save immediately
sessionStorage.setItem('key', JSON.stringify(data));
// Read on mount
const data = JSON.parse(sessionStorage.getItem('key') || 'default');
```
**Date:** 2026-01-31

### 3. GENI's Voice = Human, Not Robot
❌ **NEVER SAY:** "I have detected that...", "Please be advised...", "Successfully completed"
✅ **ALWAYS SAY:** "Looks like...", "Hey,", "Done"

**Why:** Users want natural conversation, not corporate speak
**Fixed in:** geni-brain.ts, caregiver-updates.ts, conversation.ts
**Date:** 2026-01-31

### 4. Timestamps Must Be Real
❌ **WRONG:** Fake examples like "(2:30 PM)"
✅ **CORRECT:** Actual time with date: "(Jan 31, 11:45 PM)"

**Why:** Caregivers need accurate timestamps for medical tracking
**Fixed in:** caregiver-updates.ts
**Pattern:**
```typescript
const now = new Date();
const dateStr = now.toLocaleDateString('en-US', { 
  month: 'short', day: 'numeric',
  hour: 'numeric', minute: '2-digit', hour12: true 
});
```
**Date:** 2026-01-31

### 5. No Hardcoded Patient Names
❌ **WRONG:** Hardcoding "Margaret" in prompts/responses
✅ **CORRECT:** Use `context.patientName` from GENI context

**Why:** GENI is universal, not just for one person
**Fixed in:** All services using buildGENIContext()
**Date:** 2026-01-31

### 6. ElevenLabs Integration
✅ **ALWAYS:** Use TTS service, not browser speechSynthesis
✅ **VALIDATE:** Check API key/voice ID before requests
✅ **FALLBACK:** Gracefully fall back to browser TTS on failure

**Fixed in:** elevenlabs.ts, tts.ts, ChatInterface.tsx
**Date:** 2026-01-31

---

## Architecture Patterns

### Context Engine Pattern
```
User Input → GENI Brain (Context) → Rich Prompt → Claude → Response
```

**Never:** Generate responses without context
**Always:** Call `buildGENIContext()` first, include in prompt

### Caregiver Updates Pattern
```
Event → notifyCaregiver() → ONE gate (quiet hours by priority + dedup with escalation override) → WhatsApp/SMS
```

**Never:** Send caregiver messages through any path except `services/notifications.ts`
**Always:** Let the gate decide timing — critical always sends, escalations always pass dedup

### Continuous Monitoring Pattern
```
Camera → monitoring.processFrame() → fall pose → scene analysis → pill check → notifications
```

**Never:** Add a new vision pipeline — attach a listener to the monitoring core's events instead
**Always:** Check `isProcessing` before new request; all AI JSON uses structured outputs (output_config json_schema), never regex extraction

---

## Common Mistakes & Solutions

### Mistake: "Error analyzing image"
**Cause:** Wrong model name or image format issues
**Solution:** 
1. Verify model name is correct
2. Check base64 encoding
3. Ensure image MIME type matches
4. Add JSON extraction from markdown responses

### Mistake: UI not updating after state change
**Cause:** HMR re-mounting component before setState completes
**Solution:**
1. Save to sessionStorage immediately
2. Use functional state updates
3. Force re-render with key prop if needed

### Mistake: Monitoring stops after code change
**Cause:** HMR killing interval timers
**Solution:**
1. Store monitoring state in sessionStorage
2. Restore interval on re-mount
3. Use `mountedRef` to prevent zombie timers

---

## File Organization

### Backend (post-rebuild, June 2026)
- `lib/` - db.ts (SQLite/WAL), logger.ts (pino — use moduleLogger, never console), anthropic.ts (shared client, 30s timeout)
- `middleware/` - auth (GENI_API_KEY), request-context (request IDs), error-handler (global net)
- `services/monitoring/core.ts` - THE monitoring loop (frame path + time-based cycle, EventEmitter)
- `services/notifications.ts` - THE caregiver-messaging path (gate: quiet hours + dedup)
- `services/vision.ts` - all Claude Vision calls (structured outputs)
- `services/geni-brain.ts` / `geni-context.ts` - context engine
- `services/fall-detection.ts` - Python YOLO supervision + degraded-state circuit breaker

### Frontend
- `ChatInterface.tsx` - Main conversation UI
- `lib/frame-capture.ts` - the ONLY frame-capture implementation
- `useContinuousMonitoring.ts` / `useContinuousVision.ts` - monitoring hooks

### Tests
- `backend/src/services/__tests__/` - vitest; `npm test`. CI runs tsc + tests on every push.

---

## Testing Checklist

Before committing:
- [ ] Manual pill check works (Check Pills button)
- [ ] Auto-monitoring works (Start Auto button)
- [ ] Voice chat works (mic button → speak → ElevenLabs response)
- [ ] Caregiver gets WhatsApp update with real timestamp
- [ ] GENI sounds human (no corporate speak)
- [ ] Monitoring survives HMR (doesn't stop on code changes)
- [ ] No hardcoded patient names
- [ ] No fake timestamps

---

## Self-Improvement Protocol

After every bug fix or correction:
1. Add rule to this file
2. Document why the mistake happened
3. Add the fix pattern
4. Update testing checklist if needed

**Reminder:** This file exists to make Claude smarter over time. Be ruthless about documenting failures.

---

## Known Issues & TODOs

### Current Issues
- None (as of 2026-01-31 23:45 PM EST)

### Future Enhancements
- [ ] Motion detection (only analyze when movement)
- [ ] Multi-camera support
- [ ] Family dashboard (real-time monitoring view)
- [ ] Cloud recording (store snapshots for review)
- [ ] Bi-directional caregiver messaging

---

## Performance Targets

- **Vision API:** < 3 seconds per analysis
- **TTS Response:** < 2 seconds (ElevenLabs)
- **Continuous Monitoring:** Every 30 seconds (rate limit: min 10s)
- **Cost:** ~$0.36/hour or ~$8.64/day for continuous monitoring

---

Last Updated: 2026-01-31 23:45 PM EST
