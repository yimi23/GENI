# GENI Integration Fixes - February 1, 2026

## ✅ Completed Fixes

### 1. Fixed Infinite Re-render Loop (CRITICAL)
**File:** `frontend/src/components/chat/ChatInterface.tsx`

**Problem:**
- Component called `getMessages()` on EVERY render
- Read sessionStorage hundreds of times per second
- Caused browser to freeze and console to flood

**Solution:**
- Replaced sessionStorage reads with proper React state
- Load messages ONCE on mount
- Auto-save when state changes
- Removed `setRenderKey` hack

**Before:**
```typescript
const messages = getMessages(); // ← RUNS EVERY RENDER
console.log('🔄 Render - messages from storage:', messages.length);
```

**After:**
```typescript
const [messages, setMessages] = useState<Message[]>([]);

useEffect(() => {
  const saved = sessionStorage.getItem('geni_messages');
  if (saved) setMessages(JSON.parse(saved));
}, []); // Only on mount
```

**Result:** No more infinite loops. Clean, efficient rendering.

---

### 2. Integrated Fall Detection on Backend Startup
**File:** `backend/src/index.ts`

**Added:**
```typescript
import { fallDetectionService } from './services/fall-detection';

// Initialize Fall Detection (continuous monitoring)
fallDetectionService.start({
  patient: config.patient.name,
  camera: 0,
  headless: true, // No window in production
});
console.log('🚨 Fall detection started (YOLO pose estimation)');
```

**Result:** Fall detection runs automatically when backend starts

---

## 🚧 Still To Do

### 3. Continuous Vision Service (IN PROGRESS)
**Goal:** Camera analyzes every 5 seconds, generates contextual output

**What We Learned from Python Fall Detection:**
1. **Continuous loop** - never stops watching
2. **Delta time tracking** - measure duration of states
3. **Velocity detection** - detect changes between frames  
4. **Confirmation periods** - wait before acting (no false alarms)
5. **JSON events** - structured output to backend

**Implementation Plan:**
```typescript
// backend/src/services/continuous-vision.ts
class ContinuousVisionService {
  private interval: NodeJS.Timeout | null = null;
  private isPaused = false;
  private previousFrame: Buffer | null = null;
  
  async start() {
    this.interval = setInterval(async () => {
      if (!this.isPaused) {
        const frame = await this.captureFrame();
        const analysis = await this.analyzeWithClaude(frame);
        
        // Detect changes
        const changes = this.detectChanges(frame, this.previousFrame);
        
        // Generate contextual output
        const contextualMessage = this.generateMessage(analysis, changes);
        
        // Emit to frontend
        emitVisionUpdate(contextualMessage);
        
        this.previousFrame = frame;
      }
    }, 5000); // Every 5 seconds
  }
  
  pause() {
    this.isPaused = true;
    console.log('📷 Camera paused (voice active)');
  }
  
  resume() {
    this.isPaused = false;
    console.log('📷 Camera resumed');
  }
}
```

---

### 4. Smooth Voice ↔ Camera Transitions
**Goal:** Pause camera during voice, resume after

**Flow:**
1. User clicks mic → emit `pause-camera`
2. Backend: `continuousVision.pause()`
3. Record voice → transcribe → Claude responds
4. TTS speaks (if voice was used)
5. Emit `resume-camera`
6. Backend: `continuousVision.resume()`

**Frontend Changes:**
```typescript
// ChatInterface.tsx
const handleVoiceStart = () => {
  socket.emit('pause-camera');
  recorderControls.startRecording();
};

const handleVoiceStop = async () => {
  const response = await processVoice(audioBlob);
  socket.emit('resume-camera'); // Camera back on
};
```

**Backend Changes:**
```typescript
// socket.ts
socket.on('pause-camera', () => continuousVision.pause());
socket.on('resume-camera', () => continuousVision.resume());
```

---

### 5. Real-Time Contextual Output
**Goal:** Replace generic messages with vision-based observations

**Current (Generic):**
```
"Margaret, I see you, but something looks a bit unusual..."
```

**Target (Contextual):**
```typescript
function generateContextualMessage(visionData: any) {
  const time = new Date().toLocaleTimeString();
  const { activity, pillStatus, concerns } = visionData;
  
  // Example output:
  // "Margaret, it's 2:14 PM. I can see you're at the desk. 
  //  Your 2:00 PM medications are still in the organizer. 
  //  Everything okay?"
  
  return buildMessage({
    greeting: `${config.patient.name}, it's ${time}`,
    observation: `I can see you're ${activity}`,
    concern: pillStatus === 'present' ? 
      `Your ${getNextMedTime()} medications are still in the organizer` : null,
    question: 'Everything okay?'
  });
}
```

---

## Key Learnings from Fall Detection Code

### 1. Continuous Loop > Intervals
Python code runs `while True:` - never stops  
**Lesson:** GENI vision should run continuously, not in 30-second bursts

### 2. State Tracking with Delta Time
```python
dt = now - last_time
still_seconds += dt
if still_seconds > 3.0:
    trigger_alert()
```
**Lesson:** Track duration of states (pills present for 30+ min → alert)

### 3. Velocity Detection
```python
nose_vel = nose_y - prev_nose_y
if nose_vel > 35: # Sudden drop
    fall_primed = True
```
**Lesson:** Detect changes between frames (pill organizer changed? Person moved?)

### 4. Confirmation Time
```python
if still_seconds > 3.0 and not emergency_triggered:
    send_alert()
```
**Lesson:** Wait before acting (don't spam alerts on every frame)

### 5. JSON Events
```python
print(json.dumps({
  "timestamp": time.time(),
  "level": "warning",
  "message": "Impact detected",
  "data": {"velocity": nose_vel}
}))
sys.stdout.flush()
```
**Lesson:** Structured events from vision → backend → frontend

---

## Testing Checklist

- [x] Re-render loop fixed (no console spam)
- [x] Fall detection service integrated
- [ ] Continuous vision service running
- [ ] Camera pauses during voice
- [ ] Camera resumes after voice
- [ ] Contextual messages generated from vision
- [ ] No latency issues
- [ ] Smooth UX transitions

---

## Next Steps (Priority Order)

1. **Create Continuous Vision Service** (30 min)
   - Capture frames every 5 seconds
   - Analyze with Claude Vision
   - Emit contextual updates

2. **Implement Camera Pause/Resume** (20 min)
   - Socket events for pause/resume
   - Frontend triggers
   - Backend handlers

3. **Generate Contextual Messages** (30 min)
   - Real-time observations
   - Medication status from vision
   - Activity detection
   - Concern flagging

4. **End-to-End Testing** (30 min)
   - Test all transitions
   - Verify no re-renders
   - Check latency
   - Validate output quality

**Total Time:** ~2 hours

---

**Status:** 2/5 fixes complete (40%)  
**Next:** Build continuous vision service  
**Goal:** ONE UNIT - Always watching, always contextual
