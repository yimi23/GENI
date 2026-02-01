# GENI Master Sensing (YOLO) Integration Guide

## Overview

The GENI Master Sensing system uses YOLOv8-pose for real-time human skeleton detection and emergency fall/faint detection.

**Key Features:**
- ✅ Desk faint detection (head below shoulders)
- ✅ Floor fall detection (rapid hip drop > 45 pixels/frame)
- ✅ 3-second confirmation timer (prevents false alarms)
- ✅ Immediate SMS alert via Twilio
- ✅ Immediate audio alert via ElevenLabs
- ✅ Front-end emergency overlay with live countdown
- ✅ Emergency acknowledgment ("I'm OK" button)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Camera Feed  →  YOLO Pose Detection  →  HTTP Alert        │
│                  (Python Service)          ↓               │
│                  • Skeleton keypoints      Backend          │
│                  • Impact detection        (Node.js)        │
│                  • 3s confirmation timer   ↓               │
│                                       SMS (Twilio)          │
│                                       Audio (ElevenLabs)    │
│                                       Socket.io broadcast   │
│                                            ↓               │
│                                       Frontend Overlay      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Installation

### 1. Python Dependencies

```bash
pip install ultralytics opencv-python torch requests
```

### 2. YOLOv8n-Pose Model

The model downloads automatically on first run (~50MB):

```bash
python3 yolo_master.py
```

---

## Running the System

### Terminal 1: Backend (Node.js)
```bash
cd /Users/yimi/Desktop/GENI/backend
npm run dev
```

### Terminal 2: Frontend (React)
```bash
cd /Users/yimi/Desktop/GENI/frontend
npm run dev
```

### Terminal 3: YOLO Master Sensing (Python)
```bash
cd /Users/yimi/Desktop/GENI/backend/src/services
bash start-yolo.sh
```

Or manually:
```bash
python3 yolo_master.py
```

---

## Detection Logic (DO NOT MODIFY THRESHOLDS)

### Impact Detection
- **Head velocity**: `nose_vel > 35 pixels/frame`
- **Hip velocity**: `hip_vel > 45 pixels/frame`
- **Triggers**: `fall_primed = True`

### Position Check
- **Desk faint**: `nose_y > shoulder_y + 40`
- **Floor collapse**: `abs(nose_y - hip_y) < 65`
- **Triggers**: `person_down = True`

### Confirmation Timer
- **Duration**: `3.0 seconds` of sustained down state
- **Resets on**: Standing back up (`nose_y < hip_y - 120`)

### Recovery/Reset
- **Condition**: `nose_y < hip_y - 120` (standing upright)
- **Effect**: Clears all flags, allows new detection cycle

---

## API Endpoints

### Emergency Alert (from Python)
```
POST /api/yolo/emergency
Content-Type: application/json

{
  "type": "fall" | "desk_faint" | "unresponsive",
  "timestamp": "2026-02-01T14:00:00Z",
  "confidence": 0.95,
  "detected_at_frame": 1520,
  "person_detected": true
}

Response: { status: "success", emergency_in_progress: boolean }
```

### Get Status
```
GET /api/yolo/status

Response: {
  "isMonitoring": true,
  "emergencyInProgress": false,
  "lastEmergency": { ... }
}
```

### Clear Emergency
```
POST /api/yolo/clear

Response: { status: "success", message: "Emergency cleared" }
```

---

## Frontend Events (Socket.io)

### Emergency Alert Broadcast
```javascript
socket.on('emergency_alert', (data) => {
  // {
  //   type: 'fall' | 'desk_faint' | 'unresponsive',
  //   timestamp: '2026-02-01T14:00:00Z',
  //   message: '⚠️ FALL DETECTED - Emergency services notified'
  // }
});
```

### Emergency Cleared
```javascript
socket.on('emergency_cleared', (data) => {
  // { timestamp: '2026-02-01T14:00:30Z' }
});
```

---

## Emergency Alert Flow

### When Fall/Faint Detected:

1. **Python Service** (frame-by-frame)
   - Detects impact (velocity threshold)
   - Confirms position (3-second timer)
   - Sends HTTP POST to backend

2. **Backend** (Node.js)
   - Receives alert from Python
   - Triggers SMS via Twilio: "🚨 EMERGENCY: FALL DETECTED"
   - Triggers audio via ElevenLabs: "Are you okay? I'm notifying..."
   - Broadcasts to frontend via Socket.io

3. **Frontend** (React)
   - Receives Socket.io event
   - Shows full-screen emergency overlay
   - Displays countdown (30 seconds)
   - Offers "Call 911" and "I'm OK" buttons

4. **User Response**
   - Taps "I'm OK" → sends POST to `/api/yolo/clear`
   - Or countdown ends → auto-dismisses
   - Backend clears emergency state

---

## Environment Variables

```bash
# Backend
YOLO_BACKEND_URL=http://localhost:5001  # Python service will post here
TWILIO_ACCOUNT_SID=<your_account_id>
TWILIO_AUTH_TOKEN=<your_auth_token>
TWILIO_PHONE_NUMBER=<your_twilio_number>
CAREGIVER_PHONE=<target_phone_number>
ELEVENLABS_API_KEY=<your_api_key>
ELEVENLABS_VOICE_ID=<your_voice_id>

# Python
YOLO_BACKEND_URL=http://localhost:5001  # (optional, defaults to this)
```

---

## Testing

### Test Emergency Alert (without camera)
```bash
curl -X POST http://localhost:5001/api/yolo/emergency \
  -H "Content-Type: application/json" \
  -d '{
    "type": "fall",
    "timestamp": "'$(date -u +'%Y-%m-%dT%H:%M:%SZ')'",
    "confidence": 0.95,
    "detected_at_frame": 100,
    "person_detected": true
  }'
```

### Test Status Endpoint
```bash
curl http://localhost:5001/api/yolo/status
```

### Monitor YOLO Output
```bash
# Check Python logs for keypoint detection
# Should see output like:
# [DETECT] Impact: nose_vel=45.3, hip_vel=50.2
# [RESET] Person stood up - clearing fall state
```

---

## Troubleshooting

### "Cannot open camera"
- Check camera permissions
- Try: `ls -la /dev/video0` (Linux) or use System Preferences (macOS)

### "No keypoints detected"
- Poor lighting? Try brighter environment
- Model needs clear skeleton visibility
- Must show torso + arms + legs

### "False alarms every 3 seconds"
- Lighting conditions causing erratic detection
- Try repositioning camera
- Increase threshold values if needed (documented in python file)

### "Backend not receiving alerts"
- Check Python console for HTTP error
- Verify backend is running: `curl http://localhost:5001/health`
- Check firewall: `lsof -i :5001`

### "SMS not sending"
- Verify Twilio credentials in `.env`
- Check phone number format (E.164: +1234567890)
- Test: `curl -X POST http://localhost:5001/api/yolo/clear`

### "No audio on mobile"
- Check ElevenLabs API key
- Verify device volume is up
- Test: Use browser console to call `speak()`

---

## Performance Notes

- **CPU Usage**: ~15-25% (YOLOv8n on modern CPU)
- **Latency**: ~100-150ms per frame (30 FPS)
- **Memory**: ~500MB (model + buffers)
- **Internet**: ~50KB per alert (SMS + API calls)

---

## Security Notes

- ⚠️ Store API keys in `.env` (never commit)
- ⚠️ YOLO service should only accept from localhost
- ⚠️ SMS messages are sent to real phone numbers
- ⚠️ False positives will alert caregivers

---

## Known Limitations

1. **Requires good lighting** for pose detection
2. **Single person only** (if multiple people, may trigger false alerts)
3. **Python process must be running** for detection
4. **No audio feedback during detection** (only when alert triggered)
5. **Mobile only sends SMS** (no phone call)

---

## Future Enhancements

- [ ] Multi-person detection (track individual ID)
- [ ] Motion-triggered detection (only analyze when movement)
- [ ] Video recording (store last 10s when alert triggered)
- [ ] Audio confirmation ("Are you okay?" with voice response)
- [ ] Integration with wearable sensors (smartwatch, fall pendant)
- [ ] Alternative backends (Firebase, AWS)

---

## Support

For issues or questions:
1. Check Python console output (has detailed logs)
2. Check backend logs (pm2 or terminal)
3. Check browser console (frontend logs)
4. Review Socket.io connection status
