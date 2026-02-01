# ✅ GENI Manual Testing Checklist

## Current Status
- ✅ Backend running: http://localhost:5001
- ✅ Frontend running: http://localhost:3001
- ✅ API keys configured
- ✅ All endpoints responding

---

## 🧪 Test Each Feature (Check Off As You Go)

### 1. Basic Chat Interface
**Open:** http://localhost:3001

- [ ] **Page loads** - Should see GENI dashboard
- [ ] **Chat panel visible** - Right side of screen
- [ ] **Type message:** "Hello GENI"
- [ ] **GENI responds** - Should get a warm greeting
- [ ] **Message appears** - Both user and GENI messages show
- [ ] **Timestamp visible** - Each message has time

**Expected:**
```
You: Hello GENI
GENI: Hello Margaret! I'm here to assist you. How can I help you today?
```

---

### 2. Voice Input (Speech-to-Text)
**Test Whisper integration**

- [ ] **Click microphone icon** (bottom of chat)
- [ ] **Browser asks for mic permission** - Click "Allow"
- [ ] **Red recording indicator** - Shows recording
- [ ] **Speak clearly:** "What medications do I need to take?"
- [ ] **Click to stop** recording
- [ ] **Text appears** - Your speech converted to text
- [ ] **GENI responds** - Answers about medications

**Troubleshooting:**
- If mic doesn't work → Check browser permissions
- If transcription fails → Check OPENAI_API_KEY in .env
- If no response → Check backend logs

---

### 3. Voice Output (Text-to-Speech)
**Test GENI speaking**

- [ ] **Send any message** to GENI
- [ ] **GENI responds in text**
- [ ] **Audio plays automatically** - You hear GENI speak
- [ ] **Voice is clear** - Not robotic, understandable
- [ ] **Matches text** - Audio says what text shows

**If no audio:**
- Check browser audio isn't muted
- Check system volume
- Try clicking the speaker icon manually

---

### 4. Dashboard Features
**Left side of screen**

- [ ] **Patient info shows** - Margaret Johnson, Age 78
- [ ] **Today's medications listed** - Should see 4 medications
- [ ] **Status badges** - "Taken", "Pending", "Upcoming"
- [ ] **Activity feed** - Recent events listed
- [ ] **Real-time updates** - Changes reflect immediately

**Test medication confirmation:**
- [ ] Find a "Pending" medication
- [ ] Click "Confirm" button
- [ ] Status changes to "Taken"
- [ ] Activity log updates
- [ ] Green checkmark appears

---

### 5. Camera / Pill Detection
**Test vision capabilities**

- [ ] **Click "Check Pills" button**
- [ ] **Browser asks for camera** - Click "Allow"
- [ ] **Camera preview shows**
- [ ] **Take photo** of any object (pill box if available)
- [ ] **Processing indicator** - Shows analyzing
- [ ] **Result appears** - Status message (taken/present/unclear)

**Expected responses:**
- If no pill box: "Unclear - no pill box detected"
- If using Claude Vision: ~2-3 second response
- If using YOLO (after training): <1 second response

---

### 6. Emergency Button
**Test alert system**

- [ ] **Click red "Emergency" button**
- [ ] **Confirmation dialog** appears
- [ ] **Click "Yes, Send Alert"**
- [ ] **Success message** shows
- [ ] **Activity log** records emergency
- [ ] **Check WhatsApp** (if configured) - Alert sent to caregiver

**Warning:** This sends a real alert if Twilio is configured!

---

### 7. Proactive Features
**Test morning briefing**

- [ ] **Check Activity Feed** - Should see morning briefing
- [ ] **Contains:**
  - Medication schedule
  - Appointments (if any)
  - Encouraging message

**Auto-generated message example:**
```
"Good morning Margaret! Here's your day:
💊 Medications: 2 doses scheduled today
   Next: Blood Pressure Med at 2:00 PM
📅 Appointments: Doctor appointment at 3:30 PM
⚡ You're doing great!"
```

---

### 8. Real-Time Updates (WebSocket)
**Test live sync**

**In Terminal 1:**
```bash
# Trigger a medication update
curl -X POST http://localhost:5001/api/medication/confirm \
  -H "Content-Type: application/json" \
  -d '{"medicationName":"Vitamin D"}'
```

**In Browser:**
- [ ] **Dashboard updates immediately** - No page refresh needed
- [ ] **Activity feed shows new entry**
- [ ] **Medication status changes**

---

### 9. Conversation Context
**Test GENI remembers**

Send these in order:

1. [ ] **You:** "My name is Praise"
2. [ ] **GENI responds** - Acknowledges
3. [ ] **You:** "What's my name?"
4. [ ] **GENI responds** - Should say "Praise"

**Tests:** Short-term memory within conversation

---

### 10. Multi-Modal Interaction
**Test all input methods together**

- [ ] **Type:** "Check my pills"
- [ ] **Voice:** Say "What time is my appointment?"
- [ ] **Camera:** Take photo of pill box
- [ ] **Button:** Click "Confirm Medication"

**All should work seamlessly**

---

## 🔍 Advanced Tests

### API Direct Tests

**Test Chat API:**
```bash
curl -X POST http://localhost:5001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What medications do I have today?"}'
```

**Test Status API:**
```bash
curl http://localhost:5001/api/status
```

**Test Medication History:**
```bash
curl http://localhost:5001/api/medication/history
```

**Test Emergency:**
```bash
curl -X POST http://localhost:5001/api/emergency \
  -H "Content-Type: application/json" \
  -d '{"message":"Test emergency","sendWhatsApp":false}'
```

---

## 🐛 Common Issues & Fixes

### "GENI not responding"
```bash
# Check backend logs
cd backend && npm run dev

# Look for errors in console
```

### "Voice input not working"
- Check browser mic permissions
- Verify OPENAI_API_KEY in backend/.env
- Try different browser (Chrome works best)

### "Camera won't open"
- Grant camera permissions
- Try HTTPS (some browsers require it)
- Use Chrome/Firefox (Safari can be finicky)

### "No audio output"
- Check browser not muted
- Check system volume
- Try different browser
- Open browser dev console → Check for errors

### "WhatsApp not sending"
- Verify Twilio credentials in .env
- Check phone number format (+1...)
- Ensure WhatsApp sandbox joined

---

## 📊 Expected Performance

| Feature | Expected Time | Acceptable |
|---------|---------------|------------|
| Chat response | 1-2 seconds | < 5 seconds |
| Voice transcription | 1-2 seconds | < 5 seconds |
| TTS playback | Instant | < 1 second |
| Pill detection (YOLO) | 50-200ms | < 1 second |
| Pill detection (Vision) | 1-3 seconds | < 5 seconds |
| Emergency alert | 1-2 seconds | < 3 seconds |

---

## ✅ Final Checklist

**Before Demo:**
- [ ] Both servers running (backend + frontend)
- [ ] All API keys valid
- [ ] Tested chat (text)
- [ ] Tested voice input
- [ ] Tested voice output
- [ ] Tested camera/pills
- [ ] Tested emergency button
- [ ] Dashboard updates in real-time
- [ ] WhatsApp alerts working (if enabled)
- [ ] Backup video recorded

**Demo Props:**
- [ ] Pill box (real or printed images)
- [ ] Phone for WhatsApp alerts
- [ ] Laptop with both servers running
- [ ] Backup slides (if live demo fails)

---

## 🎬 Demo Script

**Opening:**
"This is GENI - Geriatric Executive Neural Interface - an AI system that helps elderly people live independently at home."

**Show features in order:**
1. "GENI, what medications do I have today?" (chat)
2. Voice input: "Remind me about my appointment"
3. Camera: "Let me verify I took my pills"
4. Dashboard: "See? Real-time tracking"
5. Emergency: "And if there's an emergency..."
6. WhatsApp: "Caregivers are notified immediately"

**Closing:**
"GENI combines AI conversation, computer vision, and proactive monitoring to make elder care affordable and effective. Thank you!"

---

## 🐾 Test Complete!

**If all features work:** You're ready to demo! 🎉

**If issues found:** 
1. Document the problem
2. Check relevant .md files (INTEGRATION_COMPLETE.md, etc.)
3. Review backend logs
4. Ask for help if stuck

**Currently working:**
- ✅ Backend API (all endpoints)
- ✅ Frontend UI
- ✅ Chat (Claude)
- ✅ Voice I/O (Whisper + TTS)
- ✅ Camera (Claude Vision fallback ready)
- ✅ Real-time updates (WebSocket)
- ✅ Emergency alerts

**Next level (optional):**
- Train YOLOv8 for faster pill detection
- Add fall detection (MediaPipe)
- Set up WhatsApp sandbox for live alerts

---

**The app is READY. Test it thoroughly!** 🚀🐾
