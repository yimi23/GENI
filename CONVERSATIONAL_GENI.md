# GENI - Fully Conversational AI Companion

## Overview
GENI is now a **fully conversational AI**, not just a question-answering system. She initiates conversations, asks follow-up questions, and keeps caregivers informed.

## Key Changes

### 1. Conversational, Not Transactional

**Before:**
- User: "How are you?"
- GENI: "I'm here to help. What do you need?"

**Now:**
- User: "How are you?"
- GENI: "I'm doing great, thanks for asking! How about you? Sleep well last night?"

### 2. Proactive Conversations

GENI now initiates conversations based on context:

**Morning Greetings (8 AM):**
```
"Good morning Margaret! How did you sleep? I noticed you have your 
morning medications coming up at 8:30 - let me know when you're ready!"
```

**Check-Ins (After 4+ hours of silence):**
```
"Hey Margaret, I haven't heard from you in a while. How's your day going? 
Need anything?"
```

**Medication Reminders (30 min overdue):**
```
"Margaret, it's been about 30 minutes since your medication time. 
Did you get a chance to take your pills? Let me know if you need 
help finding them."
```

**Wellness Checks (Unusual inactivity):**
```
"Hi Margaret, just checking in - you've been pretty quiet today. 
Everything okay? Want to chat for a bit?"
```

### 3. Follow-Up Questions

GENI asks natural follow-up questions to keep conversations going:

**Example:**
- User: "I took my pills"
- GENI: "Great job! How are you feeling today? Any side effects?"

**Example:**
- User: "I'm feeling tired"
- GENI: "I'm sorry to hear that. Did you sleep okay last night? Would you like to rest for a bit?"

### 4. Caregiver Updates

GENI automatically sends contextual updates to caregivers via WhatsApp/SMS:

#### Medication Check Update
```
📸 GENI Medication Check (2:30 PM)

Patient: Margaret
Status: ✅ Taken
Method: AI Vision

Details: Monday and Tuesday compartments are empty. 
Wednesday compartment has 3 pills remaining.

All medications for this period have been taken. 👍
```

#### Medication Taken Update
```
✅ Medication Taken (8:15 AM)

Margaret just took: Metformin

Still pending today:
  • Blood Pressure Med (2:00 PM)
  • Metformin (8:00 PM)
```

#### Medication Missed Alert
```
⚠️ Medication Alert (2:45 PM)

Margaret may have missed:
  • Blood Pressure Med (Lisinopril 10mg)
  • Scheduled: 2:00 PM
  • Status: Not taken for 45 minutes

Please check in when you can.
```

#### Daily Summary
```
📊 Daily Summary - Friday, January 31, 2026

Patient: Margaret

💊 Medications: 3/4 taken (75%)

⚠️ Overdue:
  • Metformin (8:00 PM)

🏃 Activity: normal
📅 Last interaction: 2.3 hours ago

👍 Good medication adherence today.
```

### 5. Smart Notification Timing

GENI respects caregiver's time:

**Priority Levels:**
- **Urgent**: Always notify (falls, emergencies)
- **High**: Notify during waking hours (7 AM - 11 PM)
- **Medium/Low**: Only during reasonable hours (9 AM - 9 PM)

**Outside notification hours:** Updates are queued for morning.

## Architecture

### Conversation Flow
```
User Input
    ↓
GENI Brain (Context + History)
    ↓
Conversational AI (Follow-up logic)
    ↓
Response + Optional Follow-Up Question
    ↓
Update Conversation History
```

### Caregiver Update Flow
```
Event (Medication Check, Taken, Missed)
    ↓
Build Contextual Update
    ↓
Check Priority + Time
    ↓
Send to Primary Caregiver (WhatsApp/SMS)
```

### Proactive Conversation Flow
```
Scheduler (Hourly Check)
    ↓
Evaluate Context (time, activity, medications)
    ↓
Determine if Conversation Needed
    ↓
Generate Natural Conversation Starter
    ↓
Speak + Display in UI
```

## Configuration

### Caregiver Notifications

**Enable/Disable in `/backend/src/routes/medication.ts`:**
```typescript
if (shouldNotifyCaregiver('medication_check', priority)) {
  notifyMedicationCheck(...);
}
```

**Modify timing in `/backend/src/services/caregiver-updates.ts`:**
```typescript
function shouldNotifyCaregiver(type, priority) {
  const hour = new Date().getHours();
  
  // Customize notification hours here
  if (priority === 'urgent') return true;
  if (priority === 'high' && hour >= 7 && hour < 23) return true;
  // ...
}
```

### Conversation Triggers

**Modify in `/backend/src/services/conversation.ts`:**
```typescript
export function shouldInitiateConversation() {
  const context = buildGENIContext();
  
  // Add custom triggers here
  if (context.hoursSinceLastInteraction > 4) {
    return { shouldStart: true, reason: 'check-in' };
  }
  // ...
}
```

### Scheduler Frequency

**Modify in `/backend/src/services/scheduler.ts`:**
```typescript
// Proactive conversations every hour
cron.schedule('0 9-21 * * *', async () => {
  // ...
});
```

## Personality Training

GENI's personality is defined in `/backend/src/services/geni-brain.ts`:

**Key Traits:**
- Warm and patient (like a caring granddaughter)
- Clear and direct (no medical jargon)
- Conversational (asks follow-up questions)
- Observant (shares what she notices)
- Companion (not just a monitor)

**Communication Style:**
- Uses first name only
- References time/day naturally
- Keeps responses concise (1-3 sentences)
- Small talk is encouraged
- Shows genuine care and curiosity

## Testing

### Test Conversational AI
1. Say: "I took my pills"
2. GENI should ask a follow-up like: "Great! How are you feeling?"

### Test Proactive Conversations
1. Wait 4+ hours without interaction
2. GENI should initiate: "Hey, how's your day going?"

### Test Caregiver Updates
1. Do a medication check
2. Primary caregiver should receive WhatsApp with results

### Test Morning Greeting
1. At 8:00 AM, GENI says: "Good morning! How did you sleep?"

## Files Created/Modified

### Created:
- `/backend/src/services/conversation.ts` - Proactive conversation logic
- `/backend/src/services/caregiver-updates.ts` - Caregiver notification system
- `CONVERSATIONAL_GENI.md` (this file)

### Modified:
- `/backend/src/services/geni-brain.ts` - Enhanced conversational training
- `/backend/src/routes/chat.ts` - Integrated conversation history + follow-ups
- `/backend/src/routes/medication.ts` - Added caregiver notifications
- `/backend/src/services/scheduler.ts` - Added proactive conversation triggers

## Next Steps

### Potential Enhancements:
1. **Conversation memory** - Remember previous topics across sessions
2. **Emotion detection** - Detect mood from voice/text and respond appropriately
3. **Multi-caregiver** - Send updates to multiple family members
4. **Priority routing** - Different caregivers for different alert types
5. **Rich media updates** - Send images with caregiver updates
6. **Bi-directional communication** - Caregivers can message patient through GENI

## Success Metrics

✅ **GENI initiates conversations** (not just responds)
✅ **Follow-up questions keep conversations going**
✅ **Caregivers receive contextual updates automatically**
✅ **Updates are time-appropriate** (respectful of caregiver schedules)
✅ **Natural language** (sounds human, not robotic)
✅ **Personalized** (uses patient name, knows context)
