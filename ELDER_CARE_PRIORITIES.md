# 🎯 GENI Elder Care - What Actually Matters

## GENI's Core Mission
**Help elderly people stay independent at home while keeping caregivers informed.**

---

## ✅ What We Have Working

1. **AI Chat** - Claude conversation ✅
2. **Voice Input** - Whisper transcription ✅
3. **Voice Output** - Browser TTS ✅
4. **WhatsApp Alerts** - Caregiver notifications ✅
5. **Medication Tracking** - Schedule & history ✅
6. **Proactive Intelligence** - Morning briefings, reminders ✅

---

## 🚨 What We Need to Fix/Add (For Demo)

### Priority 1: Make Camera Actually Work (2-3 hours)

**Current:** Camera pill detection endpoint exists but not tested
**Need:** Actually test and demo pill detection

**Two Options:**

#### Option A: Claude Vision (FASTEST - 30 minutes)
Already implemented, just needs testing:
```bash
# Test the existing endpoint
curl -X POST http://localhost:5001/api/pill-check \
  -F "image=@pill_photo.jpg"
```

**Pros:**
- ✅ Already coded
- ✅ Zero training needed
- ✅ Works immediately

**Cons:**
- ⚠️ 1-3 second latency
- ⚠️ Costs API credits

#### Option B: YOLOv8 (BETTER DEMO - 3 hours if we have time)
Only do this if we have extra time after everything else works.

**Skip this for hackathon** unless we finish early.

---

### Priority 2: Add Fall Detection (3-4 hours) 🔥

**This would be HUGE for the demo** - shows GENI actively monitors safety

**MediaPipe Implementation:**
```python
# backend/src/services/fall_detection.py
import cv2
import mediapipe as mp
import numpy as np
import time

class FallDetector:
    def __init__(self):
        self.pose = mp.solutions.pose.Pose(
            min_detection_confidence=0.5,
            model_complexity=1
        )
        self.prev_hip_y = None
        self.fall_start_time = None
        
    def detect_fall(self, frame):
        results = self.pose.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        if not results.pose_landmarks:
            return False, "No person detected"
        
        landmarks = results.pose_landmarks.landmark
        
        # Get key points
        shoulder_y = (landmarks[11].y + landmarks[12].y) / 2
        hip_y = (landmarks[23].y + landmarks[24].y) / 2
        ankle_y = (landmarks[27].y + landmarks[28].y) / 2
        
        # Calculate torso angle
        dx = (landmarks[11].x + landmarks[12].x)/2 - (landmarks[23].x + landmarks[24].x)/2
        dy = shoulder_y - hip_y
        torso_angle = abs(np.degrees(np.arctan2(dx, dy)))
        
        # Fall if horizontal or collapsed
        vertical_span = abs(shoulder_y - ankle_y)
        is_falling = (torso_angle > 45 or vertical_span < 0.3)
        
        # 3-second confirmation to avoid false positives
        if is_falling:
            if not self.fall_start_time:
                self.fall_start_time = time.time()
            elif time.time() - self.fall_start_time > 3:
                return True, "FALL DETECTED"
            return False, f"Checking... {int(time.time()-self.fall_start_time)}s"
        
        self.fall_start_time = None
        return False, "Standing" if vertical_span > 0.4 else "Sitting"
```

**New Endpoint:**
```python
# backend/src/routes/fall_detection.ts
router.post('/fall-check', upload.single('video_frame'), async (req, res) => {
  // Process frame with MediaPipe
  // If fall detected → trigger emergency alert
  // Alert caregiver via WhatsApp
});
```

**Demo Value:** 
- Shows GENI monitoring safety 24/7
- Differentiates from simple pill reminders
- Addresses #1 elderly concern (falls)

---

### Priority 3: Improve Voice Pipeline (1-2 hours)

**Current:** Works but could be smoother

**Improvements:**

1. **Add Voice Indicator** - Show when GENI is listening/speaking
2. **Better Error Handling** - If Whisper fails, show helpful message
3. **Auto-speak** - GENI speaks all responses automatically (already added)

**Code Updates:**
```typescript
// frontend - Add visual feedback
const [isListening, setIsListening] = useState(false);
const [isSpeaking, setIsSpeaking] = useState(false);

// Show mic animation when recording
// Show speaker animation when GENI talks
```

---

### Priority 4: Test WhatsApp Integration (30 minutes)

**Current:** Code works, sent test messages
**Need:** Test full flow before demo

**Test Scenarios:**
1. Medication reminder → Caregiver receives alert
2. Fall detected → Emergency WhatsApp sent
3. Health check-in → No response → Alert sent

**Make sure:**
- Praise's phone is joined to Twilio sandbox
- Test messages go through
- Response format looks good

---

## ⏰ Time Budget (What to Build Today)

**If you have 4 hours:**
1. (30 min) Test camera/pill detection - make it work ✅
2. (2 hours) Add fall detection with MediaPipe 🔥
3. (1 hour) Polish voice interface
4. (30 min) Test WhatsApp flow end-to-end

**If you have 2 hours:**
1. (30 min) Test camera/pill detection
2. (1 hour) Polish voice + test WhatsApp
3. (30 min) Practice demo narrative

**If you have 1 hour:**
1. Test everything that exists
2. Make sure it doesn't break during demo
3. Prepare backup video

---

## 🎬 Demo Flow (What Judges See)

### Scenario 1: Morning Routine (Proactive)
```
8:00 AM - GENI speaks:
"Good morning Margaret! Here's your day:
- 2 medications due today
- Doctor appointment at 3:30pm
- Praise will pick you up at 3pm"
```

### Scenario 2: Medication with Camera (Multi-Modal)
```
2:00 PM - GENI: "Time for afternoon medication"
Margaret takes photo of pill box
GENI: "I can see the compartment is still full. 
       Please take your medication."
After pills taken:
GENI: "Great! Pills confirmed. Logged."
```

### Scenario 3: Fall Detection (Safety) 🔥
```
[Person falls in view of camera]
GENI (3 seconds later): "Margaret, are you okay?"
[No response for 10 seconds]
GENI → WhatsApp to Praise:
"EMERGENCY: Fall detected at 4:23pm. No response. 
 Please check on Margaret immediately."
```

### Scenario 4: Voice Conversation (Natural Interaction)
```
Margaret: [via mic] "I don't feel good"
GENI: "I'm sorry to hear that. Can you tell me 
       what's bothering you?"
Margaret: "My head hurts"
GENI: "I understand. When did the headache start?
       Should I call Praise for you?"
```

---

## 🏆 Why This Wins

**Problem:**
- 10,000 Americans turn 65 daily
- Falls are #1 cause of elderly injury
- Medication non-adherence costs $300B/year
- Families can't afford 24/7 caregivers

**GENI's Solution:**
- ✅ Proactive medication reminders
- ✅ Camera verification (pills taken)
- ✅ Fall detection (prevents deaths)
- ✅ Voice interaction (no tech skills needed)
- ✅ Caregiver alerts (peace of mind)
- ✅ All for <$50/month (vs $5K+ for human care)

**The Pitch:**
"GENI combines AI vision, voice, and proactive intelligence 
to keep elderly people safe at home. She reminds about meds, 
verifies they're taken, detects falls, and alerts caregivers 
immediately. It's like having a nurse watching 24/7, but 
affordable for every family."

---

## 📋 Pre-Demo Checklist

**Backend:**
- [ ] Backend running on port 5001
- [ ] All API endpoints tested
- [ ] Proactive features working
- [ ] WhatsApp credentials valid

**Frontend:**
- [ ] Chat interface loads
- [ ] Voice input works
- [ ] Voice output works
- [ ] Camera access granted
- [ ] Real-time updates show

**Integration:**
- [ ] Pill detection tested with real image
- [ ] Fall detection tested (if implemented)
- [ ] WhatsApp messages send successfully
- [ ] Proactive briefing triggers correctly

**Backup:**
- [ ] Screen recording of working system
- [ ] Screenshots of key features
- [ ] Notes on what to say for each demo

---

## 🚫 What NOT to Do

**Don't:**
- ❌ Try to add email/calendar/GitHub integrations
- ❌ Build a general-purpose assistant
- ❌ Add features that aren't elder care focused
- ❌ Spend time on YOLOv8 training if short on time
- ❌ Over-engineer - keep it simple and working

**Do:**
- ✅ Focus on core elder care value
- ✅ Make existing features rock solid
- ✅ Test everything multiple times
- ✅ Prepare clear demo narrative
- ✅ Show empathy for elderly users

---

**GENI is an elder care system. Period.**

**Not a todo app. Not a GitHub bot. Not a general assistant.**

**She helps elderly people live independently and keeps families informed.**

**That's the mission. That's what we build.** 🐾

---

*Elder Care Priorities - Captain, Jan 31 2026*
