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

### 1. Claude Model Names (CRITICAL - FINAL ANSWER!)
❌ **WRONG:** `claude-3-5-sonnet-20241022` → 404
❌ **WRONG:** `claude-3-5-sonnet-20240620` → 404  
❌ **WRONG:** `claude-3-sonnet-20240229` → 404
✅ **CORRECT:** `claude-3-haiku-20240307` ← **ONLY MODEL THAT WORKS**

**Why:** This Anthropic API key doesn't have access to ANY Sonnet models (3.0 or 3.5). Only Haiku is available.

**All attempts:**
1. `claude-3-5-sonnet-20241022` → 404 not_found_error
2. `claude-3-5-sonnet-20240620` → 404 not_found_error
3. `claude-3-sonnet-20240229` → 404 not_found_error
4. `claude-3-haiku-20240307` → ✅ **WORKS** (all accounts have this)

**Final Solution:** Use Haiku for everything (vision, conversations, brain).

**Fixed in:** vision.ts, geni-brain.ts, conversation.ts
**Date:** 2026-02-01 00:02 AM EST (finally resolved!)

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
Event → Build Context → Check Priority + Time → Send WhatsApp/SMS
```

**Never:** Send updates at inappropriate times (late night)
**Always:** Use `shouldNotifyCaregiver()` to check timing

### Continuous Monitoring Pattern
```
Camera → Capture Frame (30s interval) → Vision API → Context Response → UI Update
```

**Never:** Spam API (rate limiting: 10s minimum between calls)
**Always:** Check `isProcessing` before new request

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

### Backend Services
- `geni-brain.ts` - Core conversational AI (Claude prompts)
- `geni-context.ts` - Context engine (state → prompt data)
- `conversation.ts` - Proactive conversations & follow-ups
- `caregiver-updates.ts` - WhatsApp/SMS to family
- `vision.ts` - Pill & human detection (Claude Vision)
- `elevenlabs.ts` - TTS (human voice)
- `scheduler.ts` - Cron jobs (proactive check-ins, reports)

### Frontend Components
- `ChatInterface.tsx` - Main conversation UI
- `GeniLogoAnimation.tsx` - Loading screen
- `useContinuousMonitoring.ts` - Auto-monitoring hook

### Documentation
- `GENI_BRAIN.md` - Architecture overview
- `GENI_VOICE.md` - Voice & personality guide
- `CONVERSATIONAL_GENI.md` - Conversation features
- `CONTINUOUS_MONITORING.md` - Auto-monitoring system

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

## Parallel Development Workflow

### Worktrees Setup
- **Main:** `/Users/yimi/Desktop/GENI` - Production work
- **Testing:** `../GENI-worktrees/testing` - Test features
- **Docs:** `../GENI-worktrees/docs` - Documentation
- **Features:** `../GENI-worktrees/features` - New features

### Shell Aliases (Add to ~/.zshrc or ~/.bashrc)
```bash
alias zm='cd /Users/yimi/Desktop/GENI'
alias zt='cd /Users/yimi/Desktop/GENI-worktrees/testing'
alias zd='cd /Users/yimi/Desktop/GENI-worktrees/docs'
alias zf='cd /Users/yimi/Desktop/GENI-worktrees/features'
```

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
