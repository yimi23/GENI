# 🎯 GENI Complete Workflow Implementation

## What's Been Added to Backend ✅

### 1. **Enhanced Twilio Service** (`backend/src/services/twilio.ts`)
- ✅ Voice calling capability
- ✅ WhatsApp messaging
- ✅ SMS messaging
- ✅ Emergency alerts (voice + message)
- ✅ Caregiver updates
- ✅ Medication alerts
- ✅ Call doctor functionality

**Functions:**
- `makeVoiceCall(phone, message, callerName)` - Call anyone
- `callDoctor(doctorPhone, patientName, reason)` - Specific for doctors
- `sendCaregiverUpdate(phone, patientName, action)` - Info updates
- `sendMedicationAlert(phone, patientName, medication, issue)` - Med alerts
- `sendEmergencyAlert(contacts, patientName, type)` - Full emergency

---

### 2. **Twilio Webhooks** (`backend/src/routes/twilio.ts`)
- ✅ Receives incoming WhatsApp/SMS from caregivers
- ✅ Real-time frontend updates when caregiver responds
- ✅ Voice call status tracking
- ✅ Auto-responds to caregiver messages

**Endpoints:**
- `POST /api/twilio/webhook/message` - Incoming messages
- `POST /api/twilio/webhook/voice` - Voice call handling
- `POST /api/twilio/webhook/status` - Delivery status

**How it works:**
1. Caregiver texts back
2. Twilio hits webhook
3. Backend emits `incoming_message` event
4. Frontend displays message in real-time

---

### 3. **Voice Calling Routes** (`backend/src/routes/calls.ts`)
- ✅ Call caregiver with reason
- ✅ Call doctor's office
- ✅ Emergency call (all contacts)

**Endpoints:**
```bash
POST /api/call/caregiver
{
  "contactId": "Sarah Johnson",
  "reason": "Margaret needs to speak with you"
}

POST /api/call/doctor
{
  "doctorName": "Dr. Smith",
  "reason": "Patient has concerns about medication"
}

POST /api/call/emergency
{
  "reason": "Fall detected - needs immediate assistance"
}
```

---

### 4. **Fall Detection System** (`backend/src/routes/fall.ts`)
- ✅ Camera fall detection trigger
- ✅ 60-second countdown
- ✅ Three response options: "I'm Okay", "I Need Help", "Cancel"
- ✅ Auto-calls help if no response

**Endpoints:**
```bash
POST /api/fall/detected   # Camera detected fall
POST /api/fall/okay       # User: "I'm okay"
POST /api/fall/help       # User: "I need help"
POST /api/fall/cancel     # User cancels countdown
GET  /api/fall/status     # Current fall state
```

**Workflow:**
1. Camera detects fall → `POST /api/fall/detected`
2. Backend emits `fall_detected` event to frontend
3. Frontend shows dialog: "Are you okay?"
4. User has 60 seconds to respond
5. If "I'm Okay" → Cancel alert
6. If "I Need Help" → Call for help immediately
7. If no response → Auto-call after 60 seconds

---

### 5. **Pill Box Intelligence** (`backend/src/services/pillbox.ts`)
- ✅ Context-aware pill box analysis
- ✅ Detects full week (all compartments full)
- ✅ Detects empty box (refill needed)
- ✅ Detects today's medication status
- ✅ Auto-alerts caregiver

**Scenarios:**

**Full Week (all compartments full):**
```
Action: "Great! Your pill box is fully stocked for the week..."
Caregiver Update: "Pill box refilled for the week"
```

**Empty Box (needs refill):**
```
Action: "Your pill box is empty. Time to refill..."
Caregiver Alert: "REFILL NEEDED - Pill box empty"
SMS to caregiver + reminder to Margaret
```

**Monday Empty (on Monday):**
```
Action: "Perfect! You've taken your Monday medication!"
Caregiver Update: "Monday meds taken (camera verified)"
Updates medication status automatically
```

**Monday Empty (on Tuesday):**
```
Action: "I see you haven't taken Tuesday's medication yet..."
Asks: "Have you taken your Tuesday medication?"
```

---

### 6. **Medication Context System** (`services/pillbox.ts`)
- ✅ Allergies always included in AI responses
- ✅ Prescription details (dosage, timing)
- ✅ Food requirements (Metformin with meals)
- ✅ Specific medication advice

**Example Context Injected:**
```
ALLERGIES: Penicillin, Sulfa - NEVER suggest these!
CONDITIONS: Diabetes, High Blood Pressure

TODAY'S MEDICATIONS:
- Metformin (500mg) at 8:00 AM - Status: taken
- Blood Pressure Med (Lisinopril 10mg) at 2:00 PM - Status: pending

RULES:
1. Metformin should be taken with food
2. Lisinopril at same time daily
3. Check allergies before suggesting anything
```

---

### 7. **Real-Time Socket Events** (`backend/src/socket.ts`)
Updated with new events:
- ✅ `incoming_message` - Caregiver replied
- ✅ `fall_detected` - Fall detected
- ✅ `activity` - Any activity update
- ✅ `speak` - GENI wants to speak
- ✅ `medication_update` - Med status changed

---

## What Frontend Needs ⏳

### 1. **Incoming Messages Component**
**Location:** `frontend/src/components/messages/IncomingMessage.tsx`

```typescript
// Listen for incoming caregiver messages
socket.on('incoming_message', (message) => {
  // Show notification
  // Display in messages panel
  // "Listen" button for TTS
});
```

**UI:**
```
┌─────────────────────────────────────┐
│ New Message                         │
│ From: Sarah (Daughter)              │
│ "Hi Mom! How are you feeling?"      │
│ [Listen 🔊]                         │
└─────────────────────────────────────┘
```

---

### 2. **Fall Detection Dialog**
**Location:** `frontend/src/components/fall/FallDialog.tsx`

```typescript
socket.on('fall_detected', () => {
  // Show modal dialog
  // Start 60-second countdown timer
  // Three buttons: "I'm Okay", "I Need Help", "Cancel"
});
```

**UI:**
```
┌─────────────────────────────────────┐
│ ⚠️  Fall Detected                   │
│                                     │
│ Are you okay?                       │
│                                     │
│ Calling help in: 52 seconds         │
│                                     │
│ [I'm Okay]  [I Need Help]  [Cancel] │
└─────────────────────────────────────┘
```

---

### 3. **Call Buttons**
**Location:** Add to `Dashboard.tsx` contact cards

```typescript
const handleCallCaregiver = async (contact: Contact) => {
  await api.callCaregiver(contact.name, "Margaret wants to speak with you");
};

const handleCallDoctor = async () => {
  await api.callDoctor("Dr. Smith", "Medication question");
};
```

**UI Updates:**
```typescript
// In contact card
<button onClick={() => handleCall(contact)}>
  📞 Call
</button>

// In doctor info
<button onClick={handleCallDoctor}>
  📞 Call Dr. Smith
</button>
```

---

### 4. **Enhanced Pill Check**
Update `CheckPills` function to use pill box intelligence:

```typescript
const handleCheckPills = async (image) => {
  const result = await api.checkPills(image);
  
  // Show result with context
  if (result.action === 'refill_needed') {
    showAlert('🔄 Refill Alert', result.message);
  } else if (result.action === 'medication_confirmed') {
    showSuccess('✅ Confirmed', result.message);
  }
};
```

---

### 5. **API Service Updates**
**Location:** `frontend/src/services/api.ts`

```typescript
// Add to api.ts
export const api = {
  // ... existing methods ...
  
  // Voice calling
  callCaregiver: (contactId: string, reason: string) =>
    post('/call/caregiver', { contactId, reason }),
  
  callDoctor: (doctorName: string, reason: string) =>
    post('/call/doctor', { doctorName, reason }),
  
  callEmergency: (reason: string) =>
    post('/call/emergency', { reason }),
  
  // Fall detection
  fallDetected: () => post('/fall/detected'),
  fallOkay: () => post('/fall/okay'),
  fallHelp: () => post('/fall/help'),
  fallCancel: () => post('/fall/cancel'),
  fallStatus: () => get('/fall/status'),
};
```

---

### 6. **Socket Event Listeners**
**Location:** `frontend/src/services/socket.ts`

```typescript
// Add event listeners
socket.on('incoming_message', (message) => {
  // Show notification
  const notification = new Notification(`Message from ${message.from}`, {
    body: message.message,
    icon: '/geni-icon.png'
  });
});

socket.on('fall_detected', () => {
  // Show fall detection dialog
  showFallDialog();
});
```

---

## Twilio Setup Required 🔧

### 1. **Get Twilio Phone Number**
1. Go to twilio.com console
2. Buy a phone number (Voice + SMS capable)
3. Add to `.env`:
```bash
TWILIO_PHONE_NUMBER=+15551234567
```

### 2. **Configure Webhooks**
In Twilio Console → Phone Numbers → Configure:

**Incoming Messages:**
```
https://your-domain.com/api/twilio/webhook/message
```

**Voice Calls:**
```
https://your-domain.com/api/twilio/webhook/voice
```

**Status Callbacks:**
```
https://your-domain.com/api/twilio/webhook/status
```

### 3. **For Local Testing (ngrok)**
```bash
# Start ngrok
ngrok http 5001

# Use ngrok URL in Twilio webhooks
https://abc123.ngrok.io/api/twilio/webhook/message
```

---

## Testing the Complete Workflow

### Test 1: Call Caregiver
```bash
curl -X POST http://localhost:5001/api/call/caregiver \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "Sarah Johnson",
    "reason": "Margaret wants to discuss her medication schedule"
  }'

# Caregiver's phone will ring with voice message
```

### Test 2: Fall Detection
```bash
# Trigger fall
curl -X POST http://localhost:5001/api/fall/detected

# User responds "I'm okay"
curl -X POST http://localhost:5001/api/fall/okay

# OR user needs help
curl -X POST http://localhost:5001/api/fall/help
```

### Test 3: Incoming Message
Send WhatsApp to your Twilio number:
```
"Hi Margaret, how are you feeling?"
```

Backend receives it, frontend shows:
```
New Message
From: Sarah (Daughter)
"Hi Margaret, how are you feeling?"
[Listen 🔊]
```

---

## Demo Flow (Full Workflow)

### Scenario 1: Medication + Pill Check
1. **Camera shows full pill box**
   - GENI: "Great! Your pill box is fully stocked for the week. Remember to take medications with food!"
   - Caregiver gets WhatsApp: "Pill box refilled for the week"

2. **Camera shows Monday empty**
   - GENI: "Perfect! I can see you've taken your Monday medication. Great job!"
   - Caregiver gets: "Margaret took Monday meds (camera verified)"

3. **Camera shows all empty**
   - GENI: "Your pill box is empty. Time to refill! I'm notifying Sarah."
   - Caregiver gets: "⚠️ REFILL NEEDED - Pill box empty"

### Scenario 2: Fall Detection
1. **Camera detects fall**
   - UI shows: "Fall Detected - Are you okay?"
   - Timer: "Calling help in 60 seconds"

2. **User clicks "I'm Okay"**
   - Countdown stops
   - Activity log: "Fall detected but patient okay"

3. **OR User clicks "I Need Help"**
   - Immediate calls to all caregivers
   - Voice message: "Emergency - Margaret has fallen"
   - WhatsApp alert sent

### Scenario 3: Voice Calling
1. **User asks: "GENI, call Sarah"**
   - GENI: "Calling Sarah now..."
   - Phone rings with message
   - Activity: "Calling Sarah Johnson (Daughter)"

2. **User: "GENI, call Dr. Smith"**
   - GENI: "Calling Dr. Smith's office..."
   - Voice message: "Margaret needs to discuss medication"

### Scenario 4: Caregiver Messages
1. **Sarah texts GENI number:**
   "How is Mom doing today?"

2. **Frontend shows:**
   ```
   📬 New Message
   From: Sarah (Daughter)
   "How is Mom doing today?"
   [Listen 🔊]
   ```

3. **GENI auto-responds:**
   "Thank you for checking in. Margaret will be notified. - GENI"

---

## Priority Implementation Order

### Must Have (Demo Ready)
1. ✅ Backend routes (DONE)
2. ⏳ Fall detection dialog UI
3. ⏳ Incoming message display
4. ⏳ Call buttons on contact cards
5. ⏳ Twilio webhook setup

### Nice to Have
6. Enhanced pill check UI
7. Voice call status indicators
8. Message history panel
9. Call history log

---

## Files Modified/Created

### Backend ✅
- ✅ `services/twilio.ts` - Enhanced with voice calls
- ✅ `services/pillbox.ts` - NEW - Pill box intelligence
- ✅ `routes/twilio.ts` - NEW - Webhooks
- ✅ `routes/calls.ts` - NEW - Voice calling
- ✅ `routes/fall.ts` - NEW - Fall detection
- ✅ `prompts/conversation.ts` - Added medication context
- ✅ `socket.ts` - Added new events
- ✅ `config.ts` - Added phone number
- ✅ `index.ts` - Registered new routes

### Frontend ⏳ (Need to Create)
- ⏳ `components/fall/FallDialog.tsx`
- ⏳ `components/messages/IncomingMessage.tsx`
- ⏳ `components/calls/CallButton.tsx`
- ⏳ Update `services/api.ts`
- ⏳ Update `services/socket.ts`
- ⏳ Update `Dashboard.tsx`

---

**Backend is 100% ready. Frontend needs UI components to trigger these features.** 🎯🐾

---

*Implementation Guide - Captain, Jan 31 2026*
