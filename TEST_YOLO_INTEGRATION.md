# 🧪 GENI YOLOv8 Integration Testing Guide

## What's Been Integrated

✅ **Backend YOLOv8 Service:**
- `/backend/src/services/yolo_detector.py` - Python microservice
- `/backend/src/services/yolo.ts` - TypeScript wrapper
- `/backend/src/routes/medication.ts` - Updated with dual detection

✅ **Smart Fallback System:**
1. Try YOLOv8 first (fast, accurate)
2. If unclear → Fall back to Claude Vision
3. Always get a result

---

## Testing Steps

### 1. Install Python Dependencies

```bash
cd /Users/yimi/Desktop/GENI

# Install YOLOv8
pip install ultralytics opencv-python numpy
```

### 2. Test Python Service Directly

```bash
# Test with a dummy image (replace with real base64)
cd backend/src/services
python3 yolo_detector.py "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

# Should output:
# {"status": "unclear", "confidence": 0.0, "details": "No pill box detected in image"}
```

### 3. Train Your YOLOv8 Model (Team Task)

**Follow:** `/Users/yimi/Desktop/GENI/YOLO_QUICK_START.md`

```bash
cd /Users/yimi/Desktop/GENI/yolo-training

# After labeling in Roboflow, train:
yolo task=detect mode=train \
  data=dataset/data.yaml \
  model=yolov8n.pt \
  epochs=100 \
  patience=20 \
  batch=16 \
  imgsz=640 \
  device=mps \
  project=runs/detect \
  name=pill_detection
```

**Trained model will be at:**
`yolo-training/runs/detect/pill_detection/weights/best.pt`

---

### 4. Test Backend API

**Start backend:**
```bash
cd /Users/yimi/Desktop/GENI/backend
npm run dev
```

**Test pill-check endpoint:**

```bash
# With YOLOv8 (default)
curl -X POST http://localhost:5001/api/pill-check \
  -F "image=@test_pill_image.jpg"

# Force Claude Vision
curl -X POST "http://localhost:5001/api/pill-check?method=vision" \
  -F "image=@test_pill_image.jpg"
```

**Expected Response:**
```json
{
  "status": "taken", // or "present" or "unclear"
  "confidence": 0.85,
  "details": "Monday compartment is empty - pills confirmed taken",
  "method": "yolo" // or "vision"
}
```

---

### 5. Test Frontend Integration

**Start frontend:**
```bash
cd /Users/yimi/Desktop/GENI/frontend
npm run dev
```

**Open:** http://localhost:5173

**Test "Check Pills" button:**
1. Click "Check Pills"
2. Allow camera access
3. Show pill box to camera
4. Should see result toast

---

## Debugging

### Python Service Not Working

```bash
# Check Python version (need 3.8+)
python3 --version

# Check ultralytics installed
python3 -c "from ultralytics import YOLO; print('OK')"

# If not installed:
pip install --upgrade ultralytics opencv-python
```

### Model Not Found

```bash
# Check if model exists
ls yolo-training/runs/detect/pill_detection/weights/best.pt

# If not, train the model first (see Step 3)
```

### Backend Can't Call Python

```bash
# Check which Python the system uses
which python3

# Test spawn from Node
node -e "console.log(require('child_process').spawnSync('python3', ['--version']))"
```

### Still Getting "unclear" Results

**Reasons:**
1. Model not trained yet → Train YOLOv8 model
2. Image doesn't contain pill box → Use test images from training
3. Low lighting/quality → Improve image quality

**Fallback:**
- System automatically uses Claude Vision
- Still works, just slower and costs API credits

---

## Performance Comparison

| Method | Latency | Accuracy | Cost | Offline |
|--------|---------|----------|------|---------|
| **YOLOv8** | 50-200ms | High (if trained) | $0 | ✅ Yes |
| **Claude Vision** | 1-3 seconds | High | $0.0048/image | ❌ No |

**Recommendation:** Use YOLOv8 for production, Claude Vision for fallback

---

## Integration Checklist

**Backend:**
- [x] `yolo_detector.py` created
- [x] `yolo.ts` wrapper created
- [x] `medication.ts` updated with dual detection
- [ ] YOLOv8 model trained (team task)
- [ ] Test endpoint with real images

**Frontend:**
- [x] "Check Pills" button exists
- [ ] Test camera capture
- [ ] Test result display
- [ ] Handle both YOLO and Vision responses

**System:**
- [ ] Python 3.8+ installed
- [ ] `ultralytics` package installed
- [ ] Trained model at correct path
- [ ] Backend can spawn Python process

---

## Demo Preparation

### Props Needed:
- **Option 1:** Print images from training set
- **Option 2:** Display on phone/tablet
- **Option 3:** Real pill box (best but needs props)

### Demo Script:

**Narrator:** "Let me show you GENI's pill verification system."

[Show pill box with Monday pills PRESENT]

**GENI:** "I can see pills are still in the Monday compartment. Please take your medication."

[Show pill box with Monday pills TAKEN/EMPTY]

**GENI:** "Great job! Monday pills confirmed taken. Medication logged."

[WhatsApp notification appears on phone]

**Narrator:** "And the caregiver is automatically notified. No more guessing if medication was taken."

---

## Common Issues

### "YOLO model not found"
**Fix:** Train the model or use Claude Vision fallback

### "Python spawn error"
**Fix:** Check Python path, install dependencies

### "Low confidence detection"
**Fix:** Improve lighting, retrain with more images

### "Backend 500 error"
**Fix:** Check backend logs, ensure Python service works

---

## Next Steps

1. **Train YOLOv8 model** (highest priority)
2. **Test with real images** (both full/empty)
3. **Practice demo flow** (multiple times)
4. **Record backup video** (in case live demo fails)

---

**The integration is ready. Just needs the trained model!** 🎯

**Questions? Check logs:**
```bash
# Backend logs
cd backend && npm run dev

# Watch for:
# "🎯 Attempting YOLOv8 detection..."
# "✅ YOLOv8 detection: taken (0.87)"
```

🐾 **Ready to train!**
