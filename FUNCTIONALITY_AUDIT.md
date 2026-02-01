# GENI Functionality Audit - What's Built vs What Needs Work

**Date:** January 31, 2026  
**Goal:** Identify placeholders and make everything functional

---

## BACKEND (What's Built)

### ✅ Fully Functional (No Changes Needed)

| Service | Status | File |
|---------|--------|------|
| WhatsApp Messaging | ✅ Working | `services/twilio.ts` |
| SMS Messaging | ✅ Working | `services/twilio.ts` |
| Voice Calling | ✅ Working | `services/twilio.ts` |
| Claude Vision API | ✅ Working | `services/vision.ts` |
| Whisper STT | ✅ Working | `services/whisper.ts` |
| ElevenLabs TTS | ✅ Working | `services/elevenlabs.ts` |
| Daily Reports | ✅ Working | `services/reporting.ts` |
| Context Alerts | ✅ Working | `services/alerts.ts` |
| Scheduler (cron) | ✅ Working | `services/scheduler.ts` |
| Socket.io Real-time | ✅ Working | `socket.ts` |
| State Management | ✅ Working | `state.ts` |
| All Data Models | ✅ Working | `models/*.ts` |

### ⚠️ Needs Testing (Code exists, needs real testing)

| Feature | Status | What's Needed |
|---------|--------|---------------|
| Emergency Calls | ⚠️ Untested | Test with real phone number |
| Fall Detection | ⚠️ Simulated | Connect to real hardware/accelerometer |
| Medication Adherence Checks | ⚠️ Logic exists | Test with real schedule |
| Weekly Summary | ⚠️ Logic exists | Test sending via WhatsApp |

---

## FRONTEND (What's Built)

### ✅ Fully Functional UI Components

| Component | Status | File |
|-----------|--------|------|
| Dashboard Layout | ✅ Working | `components/Dashboard.tsx` |
| Profile Card | ✅ Working | `components/dashboard/ProfileCard.tsx` |
| Medication Card | ✅ Working | `components/dashboard/MedicationCard.tsx` |
| Hardware Status | ✅ Working | `components/dashboard/HardwareStatusPanel.tsx` |
| Contacts Card | ✅ Working | `components/dashboard/ContactsCard.tsx` |
| Reminders Card | ✅ Working | `components/dashboard/RemindersCard.tsx` |
| Activity Feed | ✅ Working | `components/dashboard/ActivityFeed.tsx` |
| Medication History | ✅ Working | `components/history/MedicationHistory.tsx` |
| Fall Detection Modal | ✅ Working | `components/modals/FallDetectionModal.tsx` |
| Incoming Message Banner | ✅ Working | `components/modals/IncomingMessageBanner.tsx` |

---

## ❌ PLACEHOLDERS / NOT FUNCTIONAL

### 1. Camera Feed (PLACEHOLDER)

**Current State:**
```tsx
<video 
  id="camera-feed" 
  autoPlay 
  playsInline 
  className="w-full h-full object-cover"
/>
```
- Video element exists but NOT connected to actual camera
- Shows blank/black screen
- Label says "📹 Pill Cabinet" (needs to be removed/simplified)

**What's Needed:**
- ✅ Backend vision API ready (`services/vision.ts`)
- ✅ Frontend camera service exists (`services/camera.ts`)
- ❌ Camera feed NOT wired to video element
- ❌ Auto-capture on medication time NOT implemented
- ❌ Pill detection button NOT wired to camera

**Fix Required:**
1. Connect getUserMedia() to video element
2. Implement auto-capture after medication reminders
3. Wire "Check Pills" to actual camera snapshot + vision API
4. Remove "Pill Cabinet" label or make it generic

---

### 2. Microphone / Voice Recording (PARTIALLY FUNCTIONAL)

**Current State:**
```tsx
const recorderControls = useVoiceVisualizer();
// Voice recording logic exists
```

**What Works:**
- ✅ Voice recording UI exists
- ✅ useVoiceVisualizer hook integrated
- ✅ Whisper API endpoint ready (`POST /api/voice`)
- ✅ Audio blob creation logic exists

**What Doesn't Work:**
- ❌ Microphone permission NOT requested on load
- ❌ Recording may fail silently without mic access
- ❌ No fallback if mic is blocked
- ❌ Browser compatibility not tested (Chrome/Safari)

**Fix Required:**
1. Request mic permission on GENI interface load
2. Show permission prompt if denied
3. Test recording → Whisper → response flow
4. Add error handling for mic failures

---

### 3. Camera Pill Detection Button (NOT WIRED)

**Current State:**
```tsx
<button onClick={handleCheckPills}>
  <Camera size={16} />
  Check Pills
</button>
```

**handleCheckPills function:**
```typescript
const handleCheckPills = async () => {
  try {
    const imageBlob = await capturePhoto();
    const result = await api.checkPills(imageBlob);
    alert(result); // Shows alert, not integrated
  } catch (error) {
    alert('❌ Camera check failed');
  }
}
```

**What's Wrong:**
- Uses `capturePhoto()` which creates NEW video element (not using feed)
- Shows generic `alert()` popup (bad UX)
- Not connected to GENI chat interface
- Doesn't update medication status automatically

**Fix Required:**
1. Use existing camera feed (not create new video)
2. Show result in GENI chat (not alert)
3. Auto-update medication status if pills detected as taken
4. Move functionality to chat interface (as user requested)

---

### 4. Demo Controls (STILL PRESENT)

**Current State:**
```tsx
<div className="mb-4 p-4 bg-yellow-50">
  <h3>🎬 Demo Controls</h3>
  <button>Test Fall Detection</button>
  <button>Test Emergency Calls</button>
  <button>Test Pill Detection</button>
</div>
```

**Status:** ❌ Still present (should be removed or made functional)

**User Request:** "Move Check Pills to chat space as needed"

**Fix Required:**
1. Remove entire "Demo Controls" section from Dashboard
2. Make features accessible through natural conversation in GENI chat
3. Or create "Settings/Admin" view for testing (not on main dashboard)

---

### 5. Chat Interface Voice/Camera Integration (INCOMPLETE)

**Current State:**
- Camera feed shows in GENI interface ✅
- Microphone button exists ✅
- BUT neither are fully functional ❌

**What's Missing:**
- Camera feed is static (no real video)
- Mic recording works but permissions not requested upfront
- No visual feedback when camera is analyzing pills
- No way to trigger pill check from chat naturally

**Fix Required:**
1. Initialize camera when GENI interface loads
2. Request mic permission when GENI interface loads
3. Allow voice command: "Check my pills" → auto-capture + analyze
4. Show loading state during vision analysis
5. Display result in chat conversation

---

## HARDWARE STATUS (PLACEHOLDER DATA)

**Current State:**
```typescript
hardwareStatus: {
  online: true,
  leds: { red: false, yellow: false, green: true },
  buzzer: false,
  button: 'idle',
  lastSync: Date.now()
}
```

**Status:** ❌ Hardcoded, not connected to real hardware

**What's Needed:**
- ESP32/Arduino integration (if hardware exists)
- WebSocket updates from device
- LED control endpoints
- Button press detection

**Priority:** Low (unless hardware exists)

---

## SUMMARY: What Needs to Be Made Functional

### 🔴 Critical (Must Fix)

1. **Camera Feed** - Connect getUserMedia to video element
2. **Microphone** - Request permissions, test recording flow
3. **Pill Detection** - Wire to actual camera + vision API
4. **Remove "Pill Cabinet" label** - Make it generic or remove
5. **Remove Demo Controls** - Clean up dashboard

### 🟡 Important (Should Fix)

6. **Move Check Pills to Chat** - Natural language trigger
7. **Auto-capture after med reminders** - Proactive pill checking
8. **Voice command "Check my pills"** - Hands-free detection
9. **Emergency call testing** - Verify Twilio calls work

### 🟢 Nice to Have (Optional)

10. **Hardware integration** - ESP32/FREE-WiLi connection
11. **Camera auto-start on page load** - Seamless UX
12. **Mic auto-test on load** - Ensure recording works

---

## Proposed Fixes (Priority Order)

### Phase 3A: Make Camera Functional (30-45 min)
1. Connect getUserMedia() to video element in GENI interface
2. Remove "📹 Pill Cabinet" label
3. Wire "Check Pills" button to capture + vision API
4. Show result in GENI chat (not alert)

### Phase 3B: Make Microphone Functional (20-30 min)
1. Request mic permission when GENI loads
2. Test voice recording → Whisper → Claude flow
3. Add error handling for denied permissions
4. Show visual feedback during recording

### Phase 3C: Clean Up Dashboard (15 min)
1. Remove entire "Demo Controls" section
2. Move "Check Pills" to chat interface
3. Or make Demo Controls admin-only

### Phase 3D: Proactive Features (30 min)
1. Auto-capture camera after medication reminder
2. Voice command "Check my pills" triggers detection
3. Update medication status automatically if pills detected

---

## Files That Need Changes

### Frontend Changes Needed:
```
frontend/src/components/chat/ChatInterface.tsx    [Wire camera + mic]
frontend/src/components/Dashboard.tsx             [Remove demo controls]
frontend/src/services/camera.ts                   [Fix capturePhoto to use feed]
```

### Backend (Already Done):
```
✅ backend/src/services/vision.ts        [Vision API ready]
✅ backend/src/services/whisper.ts       [STT ready]
✅ backend/src/routes/medication.ts      [Pill check endpoint ready]
✅ backend/src/routes/voice.ts           [Voice endpoint ready]
```

---

## Ready to Fix?

I'll now:
1. Make camera feed functional (real video)
2. Make microphone functional (real recording)
3. Wire pill detection to actual camera
4. Remove placeholders and "Pill Cabinet" label
5. Clean up demo controls

Total time: ~2 hours

Proceed?
