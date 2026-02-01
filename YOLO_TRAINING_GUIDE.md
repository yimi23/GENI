# 🎯 YOLOv8 Pill Box Training - Complete Hackathon Guide

## 📋 Project Overview

**Goal:** Train YOLOv8 to detect two states of a Monday pill compartment in real-time
- **Class 1:** `monday_full` - Pills present in Monday compartment
- **Class 2:** `monday_empty` - Pills absent from Monday compartment

**Timeline:** 3-4 hours total
**Demo:** Webcam real-time detection showing medication adherence

---

## ⚡ Quick Start Checklist

**Phase 1: Setup (15 min)**
- [ ] Install YOLOv8 and dependencies
- [ ] Create Roboflow account
- [ ] Generate synthetic images

**Phase 2: Data (1 hour)**
- [ ] Generate 10-20 images (5-10 per class)
- [ ] Upload to Roboflow
- [ ] Auto-label with AI
- [ ] Export YOLOv8 format

**Phase 3: Training (1 hour)**
- [ ] Train YOLOv8 model
- [ ] Validate accuracy
- [ ] Test on webcam

**Phase 4: Integration (1 hour)**
- [ ] Add to GENI backend
- [ ] Create frontend button
- [ ] Test end-to-end

---

## 🛠️ Phase 1: Environment Setup (15 minutes)

### Install Dependencies

```bash
# On Mac (M1/M2)
pip install ultralytics opencv-python roboflow

# Test installation
yolo version

# Should show: Ultralytics YOLOv8.x.x
```

### Create Project Structure

```bash
cd /Users/yimi/Desktop/GENI
mkdir -p yolo-training/{dataset,runs,test-images}
cd yolo-training
```

---

## 🎨 Phase 2: Dataset Creation (1 hour)

### Step 1: Generate Synthetic Images (30 min)

**Use Stable Diffusion (any free service - Leonardo.ai, Playground, etc.)**

**Prompts for `monday_full` (Generate 5-10 images):**

```
Base Prompt:
"Photorealistic top-down view of a white plastic weekly pill organizer, 
7 compartments labeled MON TUE WED THU FRI SAT SUN, Monday compartment 
has blue pills inside, other compartments have pills, clean white 
background, studio lighting, sharp focus, no hands, no shadows"

Variations (add to base):
- "slight 10 degree rotation clockwise"
- "brighter lighting, slightly overexposed"
- "slight zoom in, closer view"
- "soft shadows, natural lighting"
- "slight angle from above, 15 degree tilt"
```

**Prompts for `monday_empty` (Generate 5-10 images):**

```
Base Prompt:
"Photorealistic top-down view of a white plastic weekly pill organizer,
7 compartments labeled MON TUE WED THU FRI SAT SUN, Monday compartment 
is COMPLETELY EMPTY showing white plastic bottom, all other compartments 
have pills, clean white background, studio lighting, sharp focus, 
no hands, no shadows"

Variations (same as above):
- "slight 10 degree rotation clockwise"
- "brighter lighting"
- "slight zoom in"
- etc.
```

**Download all images as PNG or JPG**

---

### Step 2: Label with Roboflow (30 min)

**Roboflow is the FASTEST way to label for hackathons**

1. **Sign up:** roboflow.com (free account)

2. **Create New Project:**
   - Name: "GENI Pill Detection"
   - Type: Object Detection
   - Upload all images

3. **Auto-Label with AI:**
   - Select all images
   - Click "Auto Label"
   - Prompt: "pill organizer" or "pill box"
   - Let Roboflow detect the box
   - Review and adjust bounding boxes

4. **Assign Classes Manually:**
   - Go through each image
   - Draw bounding box around the WHOLE pill organizer
   - Label it `monday_full` or `monday_empty` based on Monday state
   
   **Important:** You're detecting the entire box, not just Monday compartment

5. **Generate Dataset:**
   - Click "Generate New Version"
   - **Preprocessing:**
     - ✅ Auto-Orient
     - ✅ Resize to 640x640
   - **Augmentation** (this is KEY for small datasets):
     - ✅ Flip: Horizontal
     - ✅ Rotation: ±15°
     - ✅ Brightness: ±15%
     - ✅ Blur: up to 1px
     - This will 3x-4x your dataset size
   
6. **Export:**
   - Format: YOLOv8
   - Download ZIP file
   - Extract to `/Users/yimi/Desktop/GENI/yolo-training/dataset/`

---

## 🚀 Phase 3: Training (1 hour)

### Step 1: Verify Dataset Structure

```bash
cd /Users/yimi/Desktop/GENI/yolo-training/dataset

# Should see:
# data.yaml
# train/images/
# train/labels/
# valid/images/
# valid/labels/
```

### Step 2: Train the Model

```bash
# Navigate to training directory
cd /Users/yimi/Desktop/GENI/yolo-training

# Train (M1/M2 Mac uses MPS acceleration)
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

**What This Does:**
- Uses YOLOv8 Nano (fastest model)
- Trains for up to 100 epochs (stops early if no improvement)
- Uses MPS (Apple Silicon GPU)
- Saves to `runs/detect/pill_detection/`

**Training Time:**
- M1/M2 Mac: ~15-30 minutes
- Intel Mac/PC: ~30-60 minutes

**Watch for:**
- mAP@0.5 should reach >60% (acceptable)
- mAP@0.5 >75% is great for hackathon
- Loss should decrease consistently

### Step 3: Test the Model

```bash
# After training, test on validation images
yolo task=detect mode=predict \
  model=runs/detect/pill_detection/weights/best.pt \
  source=dataset/valid/images \
  save=True \
  device=mps

# Check results in runs/detect/predict/
```

---

## 📹 Phase 4: Real-Time Webcam Demo (30 min)

### Test Webcam Detection

```python
# /Users/yimi/Desktop/GENI/yolo-training/webcam_demo.py

import cv2
from ultralytics import YOLO
import time

# Load trained model
model = YOLO('runs/detect/pill_detection/weights/best.pt')

# Open webcam
cap = cv2.VideoCapture(0)

print("🎥 Webcam Demo Starting...")
print("Position pill box in view")
print("Press 'q' to quit")

while True:
    ret, frame = cap.read()
    if not ret:
        break
    
    # Run YOLOv8 inference
    results = model(frame, device='mps', verbose=False)
    
    # Draw detections
    annotated_frame = results[0].plot()
    
    # Show FPS
    cv2.putText(annotated_frame, f"FPS: {1/results[0].speed['inference']*1000:.1f}", 
                (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    
    # Display
    cv2.imshow('GENI Pill Detection', annotated_frame)
    
    # Check for detections
    for box in results[0].boxes:
        class_id = int(box.cls[0])
        conf = float(box.conf[0])
        class_name = model.names[class_id]
        
        print(f"Detected: {class_name} ({conf:.2f})")
        
        # If pills missing, could trigger alert here
        if class_name == 'monday_empty' and conf > 0.7:
            print("⚠️  ALERT: Monday pills not taken!")
    
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
```

**Run it:**
```bash
python webcam_demo.py
```

**Expected:** 
- Should see bounding box around pill organizer
- Label shows `monday_full` or `monday_empty`
- Should run at 30-60 FPS on M1/M2

---

## 🔗 Phase 5: GENI Integration (1 hour)

### Backend Integration

```python
# /Users/yimi/Desktop/GENI/backend/src/services/yolo_detection.py

from ultralytics import YOLO
import cv2
import numpy as np
from typing import Tuple

class PillDetector:
    def __init__(self, model_path: str):
        self.model = YOLO(model_path)
    
    def detect_from_image(self, image_path: str) -> Tuple[str, float]:
        """
        Detect pill status from image
        Returns: (status, confidence)
        """
        results = self.model(image_path, device='mps', verbose=False)
        
        if len(results[0].boxes) == 0:
            return "no_detection", 0.0
        
        # Get highest confidence detection
        box = results[0].boxes[0]
        class_id = int(box.cls[0])
        confidence = float(box.conf[0])
        class_name = self.model.names[class_id]
        
        return class_name, confidence
    
    def detect_from_bytes(self, image_bytes: bytes) -> Tuple[str, float]:
        """
        Detect from uploaded image bytes
        """
        # Convert bytes to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        results = self.model(img, device='mps', verbose=False)
        
        if len(results[0].boxes) == 0:
            return "no_detection", 0.0
        
        box = results[0].boxes[0]
        class_id = int(box.cls[0])
        confidence = float(box.conf[0])
        class_name = self.model.names[class_id]
        
        return class_name, confidence

# Initialize detector
detector = PillDetector('path/to/best.pt')
```

**Update Existing Endpoint:**

```typescript
// backend/src/routes/medication.ts
// Update the pill-check endpoint to use YOLO instead of Claude Vision

import { detector } from '../services/yolo_detection';

router.post('/pill-check', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image required' });
    }
    
    // Use YOLO detection
    const [status, confidence] = await detector.detect_from_bytes(
      fs.readFileSync(req.file.path)
    );
    
    let result = {
      status: 'unclear',
      confidence: 'low',
      observations: ''
    };
    
    if (status === 'monday_full' && confidence > 0.6) {
      result = {
        status: 'present',
        confidence: 'high',
        observations: 'Pills detected in Monday compartment'
      };
    } else if (status === 'monday_empty' && confidence > 0.6) {
      result = {
        status: 'taken',
        confidence: 'high',
        observations: 'Monday compartment is empty - pills taken!'
      };
    }
    
    res.json(result);
  } catch (error) {
    console.error('❌ Pill check error:', error);
    res.status(500).json({ error: 'Detection failed' });
  }
});
```

---

## 📱 Frontend Integration

**Add "Check Pills" Button to Dashboard:**

```typescript
// Already exists in Dashboard.tsx
const handleCheckPills = async () => {
  try {
    // Open camera
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' }  // Back camera on mobile
    });
    
    // Capture frame
    const video = document.createElement('video');
    video.srcObject = stream;
    await video.play();
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    
    // Convert to blob
    canvas.toBlob(async (blob) => {
      if (blob) {
        const result = await api.checkPills(blob);
        
        // Show result
        if (result.status === 'taken') {
          alert('✅ Great! Pills confirmed taken.');
        } else if (result.status === 'present') {
          alert('⚠️  Pills still in compartment. Please take medication.');
        }
      }
    }, 'image/jpeg');
    
    stream.getTracks().forEach(track => track.stop());
  } catch (error) {
    console.error('Camera error:', error);
  }
};
```

---

## 🎬 Demo Preparation

### Physical Setup

**Option 1: Print Physical Images**
```bash
# Print your generated images
# Laminate them for durability
# Show them to webcam during demo
```

**Option 2: Display on Phone/Tablet**
```bash
# Display generated images on a second device
# Point webcam at screen
# Switch between monday_full and monday_empty images
```

**Option 3: Real Pill Box** (if you have one)
```bash
# Use actual pill organizer
# Fill/empty Monday compartment
# Most realistic but requires props
```

### Demo Script

**Scenario: Medication Verification**

```
Presenter: "Margaret, did you take your Monday medication?"

[Show pill box to camera - Monday compartment FULL]

GENI: "I can see pills are still in the Monday compartment. 
       Please take your medication."

[Remove pills, show Monday compartment EMPTY]

GENI: "Great job! Monday pills confirmed taken. 
       Medication logged."

[WhatsApp sent to Praise]
"Margaret took her Monday medication at 10:15 AM ✅"
```

---

## 🐛 Troubleshooting

### Model Won't Train
```bash
# Check dataset structure
cat dataset/data.yaml

# Should show:
# train: ../train/images
# val: ../valid/images
# nc: 2
# names: ['monday_empty', 'monday_full']
```

### Low Accuracy (<50%)
- Generate more varied images
- Increase augmentation in Roboflow
- Train for more epochs (200+)
- Use yolov8s.pt instead of yolov8n.pt (slower but more accurate)

### Webcam Not Detected
```python
# Test camera
import cv2
cap = cv2.VideoCapture(0)
ret, frame = cap.read()
print(f"Camera working: {ret}")
```

### Slow Inference
```python
# Use MPS for M1/M2
results = model(frame, device='mps')

# Or CPU
results = model(frame, device='cpu')
```

---

## 📊 Success Metrics

**Minimum Viable:**
- mAP@0.5 > 60%
- Can detect in webcam demo
- Integration with GENI works

**Good:**
- mAP@0.5 > 75%
- Real-time FPS > 20
- False positives < 10%

**Excellent:**
- mAP@0.5 > 85%
- Real-time FPS > 30
- Works in varied lighting

---

## ⏰ Time Estimates

| Task | Time | Who Does It |
|------|------|-------------|
| Environment setup | 15 min | 1 person |
| Generate images | 30 min | 1 person |
| Label in Roboflow | 30 min | 1 person |
| Train model | 30-60 min | Automatic |
| Test webcam | 15 min | 1 person |
| Backend integration | 30 min | 1 person |
| Frontend integration | 30 min | 1 person |
| End-to-end testing | 30 min | Team |

**Total:** 3-4 hours with team collaboration

---

## 🎯 Parallel Workflow

**While model trains (30-60 min), teammates can:**
- Work on backend integration code
- Test WhatsApp alerts
- Polish frontend UI
- Prepare demo script
- Record backup video

**Don't wait for training to finish - prepare integration code now!**

---

## 📝 Deliverables

**For Demo:**
- [ ] Trained YOLOv8 model (`best.pt`)
- [ ] Webcam demo script
- [ ] Test images (physical or digital)
- [ ] GENI integration working
- [ ] Demo narrative prepared

**For Judges:**
- [ ] Show real-time detection
- [ ] Explain how it helps elderly
- [ ] Demo WhatsApp alert flow
- [ ] Emphasize camera verification prevents medication errors

---

## 🏆 Why This Matters

**The Problem:**
- 50% of elderly patients don't take meds correctly
- Self-reporting is unreliable
- Manual pill counts are intrusive

**GENI's Solution:**
- Camera verification (non-intrusive)
- Real-time detection (immediate feedback)
- Automatic caregiver alerts (peace of mind)
- AI-powered (no human monitoring needed)

**The Pitch:**
"Instead of asking 'Did you take your pills?', GENI SEES that you took them. 
Computer vision makes medication adherence verifiable and automatic."

---

**Your team has this. YOLOv8 is designed for exactly this kind of hackathon project.** 🎯

**Questions? Issues? I'm here to help debug!** 🐾

---

*YOLOv8 Training Guide - Captain, Jan 31 2026*
