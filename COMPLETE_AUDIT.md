# GENI Complete System Audit
**Date:** January 31, 2026  
**Goal:** Evaluate everything, focus on caregiver reporting workflow

---

## Core Workflow (What You Want)

### 1. GENI → Margaret (User)
- **Style:** Kind, compassionate, simple
- **Goal:** Help with daily tasks, medications, reminders
- **Tone:** Friendly companion, not a nurse

### 2. GENI → Sarah (Caregiver)
- **Style:** Contextual reports, reassuring updates
- **Goal:** Keep caregiver informed, "your mom is doing fine"
- **Frequency:** Daily/weekly summaries + real-time alerts when needed

---

## What Currently Exists

### ✅ Backend Services (Working)

#### 1. **Twilio Integration** (`services/twilio.ts`)
- ✅ WhatsApp messaging
- ✅ SMS messaging
- ✅ Voice calling
- ✅ Emergency alerts

**Functions:**
```typescript
sendWhatsAppMessage(to, message)
sendSMS(to, message)
makeVoiceCall(to, message, callerName)
sendEmergencyAlert(contacts, patientName, type)
sendCaregiverUpdate(to, patientName, action, context)
sendMedicationAlert(to, patientName, medication, issue)
```

**Status:** ✅ Ready to use, credentials in `.env`

---

#### 2. **Proactive Intelligence** (`services/proactive.ts`)

✅ **Already has caregiver reporting:**

**Weekly Summary:**
```typescript
sendWeeklySummaryToCaregiver()
```
Sends:
- Medication adherence % (calculated from history)
- Activity status
- Health patterns
- Overall assessment

**Example Output:**
```
Hi Sarah! Here's Margaret's weekly summary:

✅ Medication Adherence: 92%
✅ Activity: Normal routine, active daily
✅ Health: No concerning patterns detected

Overall: Margaret is doing well! Keep up the great work.

- GENI 🐾
```

**Other Functions:**
- `generateMorningBriefing()` - Daily morning summary for Margaret
- `proactiveHealthCheck()` - Checks for inactivity, alerts caregiver if no response
- `checkMedicationAdherence()` - Monitors medication timing, alerts if missed
- `generateSmartMedicationReminder()` - Context-aware medication prompts

**Status:** ✅ All functions exist, just need to be scheduled/triggered

---

#### 3. **Conversation System** (`prompts/conversation.ts`)

Current personality:
```
- Be warm, caring, and encouraging (like a friend, not a nurse)
- Keep responses concise (2-3 sentences max)
- Praise them when they take medications correctly
```

**Status:** ✅ Already kind and compassionate

---

#### 4. **Vision/Camera** (`services/vision.ts`)
- ✅ Claude Vision API integrated
- ✅ Pill detection prompt ready
- ✅ Returns: present/taken/unclear + confidence

**Status:** ✅ Backend ready, needs frontend wiring

---

#### 5. **Voice/Audio** 
- ✅ Whisper (speech-to-text) - `services/whisper.ts`
- ✅ ElevenLabs (text-to-speech) - `services/elevenlabs.ts`
- ✅ Web Speech API (browser TTS) - `frontend/services/tts.ts`

**Status:** ✅ All working

---

### ✅ Data Models (Working)

#### State Structure (`state.ts`)
```typescript
{
  patient: { name, age, conditions, allergies }
  contacts: [ { name, relationship, phone, isPrimary } ]
  todaysMedications: [ { name, dosage, time, status } ]
  medicationHistory: [ { date, status, details } ]
  activities: [ { message, type, timestamp } ]
  reminders: [ { time, message, type } ]
  hardwareStatus: { online, leds, buzzer, button }
}
```

**Key Data:**
- ✅ Tracks medication adherence over time
- ✅ Activity log (everything GENI does)
- ✅ Primary contact (Sarah) flagged
- ✅ Patient info (conditions, allergies)

---

### ✅ Frontend Components (Working)

#### 1. **GENI Interface** (`ChatInterface.tsx`)
- ✅ Voice-only (text input removed)
- ✅ Camera feed visible
- ✅ Big microphone button
- ✅ Auto-speak responses

#### 2. **Dashboard** (`Dashboard.tsx`)
- ✅ Shows all patient data
- ✅ Medication schedule
- ✅ Activity feed
- ✅ Contacts
- ✅ Hardware status

#### 3. **Medication History** (`MedicationHistory.tsx`)
- ✅ Shows adherence over time
- ✅ Visual calendar
- ✅ Missed doses highlighted

---

## What's Missing for Caregiver Reporting

### ❌ 1. Scheduled Reports

**Currently:** Functions exist but aren't scheduled

**Need:**
- Daily summary at end of day (e.g., 9 PM)
- Weekly summary on Sundays
- Monthly summary

**Solution:** Add cron job or scheduled task

---

### ❌ 2. Daily Report Structure

**Currently:** Only weekly summary exists

**Need:** Daily report template

**Suggested Format:**
```
Hi Sarah! Here's Margaret's daily update:

📅 Friday, January 31, 2026

✅ Medications:
   • Morning: Taken on time (8:05 AM)
   • Afternoon: Taken on time (2:03 PM)
   • Evening: Pending (due 8:00 PM)

💬 Activity:
   • Asked about doctor appointment
   • Checked medication schedule
   • Spoke 3 times today

😊 Overall: Margaret had a good day! No concerns.

- GENI
```

**Status:** ❌ Need to create this function

---

### ❌ 3. Event-Based Alerts (Contextual)

**Currently:** Emergency alerts are all-or-nothing

**Need:** Smart, context-aware alerts

**Examples:**

**Low Urgency:**
```
Hi Sarah, Margaret mentioned feeling a bit tired today. 
She took her afternoon medication 30 minutes late but 
is resting now. Just wanted you to know. - GENI
```

**Medium Urgency:**
```
Hi Sarah, Margaret hasn't taken her 2pm blood pressure 
medication yet and mentioned feeling dizzy. I reminded 
her to sit down. Might be worth a quick check-in. - GENI
```

**High Urgency:**
```
Sarah - Margaret fell in the kitchen. She says she's okay 
but I've triggered emergency protocols. Please call her 
immediately. - GENI
```

**Status:** ❌ Need context-aware alert generation

---

### ❌ 4. Caregiver Dashboard/Portal

**Currently:** No way for Sarah to VIEW data remotely

**Need:**
- Web portal for caregiver
- Shows real-time status
- Medication adherence chart
- Activity timeline
- Can send messages to Margaret via GENI

**Status:** ❌ Not built yet (future feature)

---

## What Works vs What Needs Work

### ✅ What Works Right Now

| Feature | Status | Notes |
|---------|--------|-------|
| Voice interface (Margaret → GENI) | ✅ Working | Voice-only, kind responses |
| Camera integration (backend) | ✅ Working | Vision API ready |
| WhatsApp messaging (GENI → Sarah) | ✅ Working | Twilio configured |
| Voice calling | ✅ Working | Can call Sarah |
| Weekly summary generation | ✅ Working | Already coded |
| Medication tracking | ✅ Working | Adherence calculated |
| Activity logging | ✅ Working | Everything tracked |
| Emergency alerts | ✅ Working | Falls, SOS |

---

### ⚠️ What Needs Connection/Scheduling

| Feature | Status | What's Needed |
|---------|--------|---------------|
| Daily summary to Sarah | ⚠️ Exists but not scheduled | Add cron job (9 PM daily) |
| Weekly summary to Sarah | ⚠️ Exists but not scheduled | Add cron job (Sundays) |
| Auto pill-check after reminders | ⚠️ Backend ready | Frontend camera auto-trigger |
| Proactive health checks | ⚠️ Exists but not scheduled | Add cron job (every 2 hours) |

---

### ❌ What's Missing Completely

| Feature | Priority | Complexity |
|---------|----------|------------|
| Daily report generation function | 🔴 High | Low (1 hour) |
| Context-aware alert generation | 🔴 High | Medium (2 hours) |
| Scheduled reporting (cron jobs) | 🔴 High | Low (30 min) |
| Caregiver web portal | 🟡 Medium | High (8+ hours) |
| Smart symptom → alert logic | 🟡 Medium | Medium (2 hours) |

---

## Recommended Workflow (Simplified)

### GENI → Margaret (Daily)
1. **Morning (8 AM):** "Good morning Margaret! You have 2 medications this morning. Ready when you are."
2. **Medication times:** Gentle reminders, camera check 5 min after
3. **Throughout day:** Answer questions, help with tasks
4. **Evening:** "You're all set for the day! Sleep well."

### GENI → Sarah (Reporting)

#### **Daily (9 PM):**
```
Hi Sarah! Margaret's doing well today.

✅ All medications taken on time
💬 She asked about her doctor appointment (3:30 PM tomorrow)
😊 Active and engaged, no concerns

- GENI
```

#### **Weekly (Sundays, 8 PM):**
```
Hi Sarah! Here's Margaret's week:

✅ Medication adherence: 96% (29/30 doses)
✅ Activity: Normal routine
❓ One missed dose on Wednesday (afternoon BP med)

Overall: Margaret's doing great! She's been consistent 
and engaged all week.

- GENI
```

#### **Real-Time Alerts (As Needed):**
- Missed medication + symptom → alert
- Fall detected → immediate alert
- No activity for 2+ hours → check-in alert
- Emergency button → immediate call + alert

---

## Action Plan: Fix Caregiver Reporting

### Phase 2A: Create Daily Reporting (1-2 hours)

**File:** `backend/src/services/reporting.ts` (new)

**Functions to create:**
1. `generateDailyReport()` - Creates end-of-day summary
2. `generateContextualAlert()` - Smart, situation-aware alerts
3. `sendDailyReportToCaregiver()` - Sends via WhatsApp

---

### Phase 2B: Schedule Reports (30 min)

**Options:**
1. Use `node-cron` package (simple)
2. Use OS cron (external)
3. Use Clawdbot cron system (if available)

**Schedule:**
- Daily report: 9:00 PM
- Weekly report: Sunday 8:00 PM
- Health checks: Every 2 hours (9 AM - 9 PM)

---

### Phase 2C: Context-Aware Alerts (2 hours)

**File:** `backend/src/services/alerts.ts` (new)

**Logic:**
```typescript
analyzeContext({
  event: 'missed_medication',
  medication: 'Blood Pressure Med',
  symptom: 'dizziness',
  timeElapsed: 30 // minutes
})

→ Returns:
{
  urgency: 'medium',
  message: 'Margaret missed her BP med and mentioned dizziness...',
  action: 'send_whatsapp'
}
```

---

## Files to Create/Modify

### New Files:
```
backend/src/services/reporting.ts      [Daily/weekly reports]
backend/src/services/alerts.ts         [Context-aware alerts]
backend/src/services/scheduler.ts      [Cron job setup]
```

### Modify:
```
backend/src/prompts/conversation.ts    [Already good, maybe simplify more]
backend/src/services/proactive.ts      [Connect to scheduler]
backend/src/index.ts                   [Initialize scheduler]
```

---

## Summary

### ✅ What's Already Great:
- GENI talks kindly to Margaret
- Weekly summary to caregiver exists
- All backend services work (Twilio, Vision, Voice)
- Data tracking is comprehensive

### ❌ What's Missing:
- **Daily reports to caregiver** (not scheduled)
- **Context-aware alerts** (missing logic)
- **Scheduled proactive checks** (not running)

### 🎯 Next Steps:
1. Build daily reporting system
2. Add context-aware alert generation
3. Schedule everything with cron
4. Test with real WhatsApp → Sarah

---

Want me to start building the **Daily Reporting System**?
