# GENI Integration Plan - Make It ONE Unit

**Date:** February 1, 2026  
**Goal:** Integrate all monitoring into a seamless, continuous system

---

## Issues to Fix

### 1. ❌ Infinite Re-render Loop
**Problem:** ChatInterface.tsx reads sessionStorage on every render (line 47)
```typescript
const messages = getMessages(); // ← Runs every render!
```

**Solution:** Use useState with useEffect for initialization
```typescript
const [messages, setMessages] = useState<Message[]>([]);

useEffect(() => {
  const saved = sessionStorage.getItem('geni_messages');
  if (saved) setMessages(JSON.parse(saved));
}, []); // Only on mount
```

---

### 2. ⚠️ Fall Detection Not Running
**Problem:** Python fall detection script exists but isn't integrated
**Solution:** Start it on backend startup

---

### 3. ⚠️ Camera Stops During Voice
**Problem:** No smooth transition between camera and voice modes
**Solution:** Implement camera pause/resume system

---

### 4. ⚠️ Generic Output Messages
**Problem:** Messages like "Margaret, I see you..." are static, not real-time
**Solution:** Generate contextual output from actual vision analysis

---

## Integration Steps

### Step 1: Fix Re-render Loop (URGENT)

**File:** `frontend/src/components/chat/ChatInterface.tsx`

```typescript
// BEFORE (causes infinite loop):
const getMessages = (): Message[] => {
  const saved = sessionStorage.getItem('geni_messages');
  return saved ? JSON.parse(saved) : [];
};
const messages = getMessages(); // ← RUNS EVERY RENDER

// AFTER (runs once):
const [messages, setMessages] = useState<Message[]>([]);

useEffect(() => {
  const saved = sessionStorage.getItem('geni_messages');
  if (saved) {
    try {
      setMessages(JSON.parse(saved));
    } catch (e) {
      console.error('Failed to load messages:', e);
    }
  }
}, []); // Only on mount

// Save messages when they change:
useEffect(() => {
  sessionStorage.setItem('geni_messages', JSON.stringify(messages));
}, [messages]);
```

---

### Step 2: Start Fall Detection on Backend

**File:** `backend/src/index.ts`

Add at startup:
```typescript
import { fallDetectionService } from './services/fall-detection';

// After server starts
fallDetectionService.start({
  patient: state.patient.name,
  camera: 0,
  headless: true, // No window in production
});

console.log('✅ Fall detection started');
```

---

### Step 3: Continuous Camera Monitoring

**Current:** Checks every 30 seconds, can miss things  
**Target:** Runs continuously, pauses only for voice

**New Service:** `backend/src/services/continuous-vision.ts`

```typescript
import { spawn } from 'child_process';
import { emitVisionUpdate } from '../socket';
import { anthropic } from './geni-brain';

class ContinuousVisionService {
  private visionInterval: NodeJS.Timeout | null = null;
  private isPaused = false;
  private lastAnalysis: Date | null = null;
  
  async start() {
    this.visionInterval = setInterval(async () => {
      if (!this.isPaused) {
        await this.analyzeCurrentView();
      }
    }, 5000); // Every 5 seconds
  }
  
  async analyzeCurrentView() {
    // Capture frame from camera
    const frame = await this.captureFrame();
    
    // Analyze with Claude Vision
    const analysis = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: frame.toString('base64'),
            },
          },
          {
            type: 'text',
            text: `You are GENI, an elder care AI. What do you see? Be brief and contextual. Focus on: Margaret's activity, pill organizer status, any concerns.`,
          },
        ],
      ]},
    });
    
    const observation = analysis.content[0].text;
    this.lastAnalysis = new Date();
    
    // Emit to frontend
    emitVisionUpdate({
      timestamp: new Date(),
      observation,
      concerns: this.extractConcerns(observation),
    });
  }
  
  pause() {
    this.isPaused = true;
    console.log('📷 Camera monitoring paused (voice active)');
  }
  
  resume() {
    this.isPaused = false;
    console.log('📷 Camera monitoring resumed');
  }
}

export const continuousVision = new ContinuousVisionService();
```

---

### Step 4: Voice → Camera Transitions

**Flow:**
1. User clicks mic → `continuousVision.pause()`
2. Voice recording starts
3. Whisper transcribes
4. Claude generates response
5. TTS speaks (if voice was used)
6. `continuousVision.resume()` → Camera back on

**Frontend:** `frontend/src/components/chat/ChatInterface.tsx`

```typescript
const handleVoiceStart = () => {
  setIsRecording(true);
  
  // Tell backend to pause camera
  socket.emit('pause-camera');
  
  recorderControls.startRecording();
};

const handleVoiceStop = async () => {
  setIsRecording(false);
  recorderControls.stopRecording();
  
  // Process voice...
  const response = await processVoice(audioBlob);
  
  // After response is complete
  socket.emit('resume-camera');
};
```

**Backend:** `backend/src/socket.ts`

```typescript
socket.on('pause-camera', () => {
  continuousVision.pause();
});

socket.on('resume-camera', () => {
  continuousVision.resume();
});
```

---

### Step 5: Real-Time Contextual Output

**Replace this:**
```
"Margaret, I see you, but something looks a bit unusual..."
```

**With this:**
```typescript
// Backend generates based on what it ACTUALLY sees:
const generateContextualMessage = (visionData: any) => {
  const time = new Date().toLocaleTimeString();
  const observations = visionData.observation;
  
  // Example real output:
  // "Margaret, it's 2:14 PM. I can see you're at the desk. 
  //  Your morning pills are still in the organizer. 
  //  Everything okay?"
  
  return buildMessageFromContext({
    time,
    whatISee: observations,
    medicationStatus: checkPillsInOrganizer(visionData),
    concerns: detectConcerns(visionData),
  });
};
```

---

## Key Lessons from Fall Detection Code

### 1. **Continuous Loop, Not Intervals**
Python code runs `while True:` - never stops  
**GENI should:** Run vision analysis continuously (every 3-5 seconds)

### 2. **State Tracking with Delta Time**
```python
dt = now - last_time
still_seconds += dt
```
**GENI should:** Track time-based states (how long since pills were taken, etc.)

### 3. **Velocity Detection (Movement Analysis)**
```python
nose_vel = nose_y - prev_nose_y
if nose_vel > 35: fall_primed = True
```
**GENI should:** Detect changes between frames (pill organizer changed? Person moved?)

### 4. **Confirmation Time (Don't React Immediately)**
```python
if still_seconds > 3.0 and not emergency_triggered:
    trigger_alert()
```
**GENI should:** Wait for confirmation before alerts (pills missing for 30+ mins)

### 5. **JSON Events to Backend**
```python
print(json.dumps(event))
sys.stdout.flush()
```
**GENI should:** Emit structured events from vision → backend → frontend

---

## Implementation Order

1. **Fix re-render loop** (5 min) ← DO THIS FIRST
2. **Start fall detection** (10 min) ← Immediate safety
3. **Continuous vision service** (30 min) ← Core feature
4. **Voice transitions** (20 min) ← UX improvement
5. **Contextual output** (30 min) ← Intelligence upgrade

**Total:** ~2 hours of focused work

---

## Expected Result

**Before:**
- Camera checks every 30 seconds
- Generic messages
- Infinite re-renders
- Voice breaks camera

**After:**
- Camera runs continuously (5-second intervals)
- Real-time contextual messages: "I see you at the desk, your 2 PM pills are still there"
- Smooth rendering
- Voice pauses camera, resumes after
- Fall detection active and integrated

---

**ONE UNIT. ALWAYS WATCHING. ALWAYS CONTEXTUAL.**
