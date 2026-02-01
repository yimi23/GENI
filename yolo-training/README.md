# 🎯 GENI YOLOv8 Pill Detection Training

This folder contains everything needed to train a custom YOLOv8 model for detecting pill box states.

## 📁 Files

- **`verify_setup.py`** - Run this FIRST to check your environment
- **`webcam_demo.py`** - Demo script with GENI-style UI
- **`YOLO_TRAINING_GUIDE.md`** - Complete step-by-step guide (main docs folder)
- **`YOLO_QUICK_START.md`** - Copy-paste quick reference (main docs folder)

## 🚀 Quick Start (3-4 hours)

### 1. Verify Setup (5 min)
```bash
cd /Users/yimi/Desktop/GENI/yolo-training
python verify_setup.py
```

If you see errors, install missing packages:
```bash
pip install ultralytics opencv-python
```

### 2. Generate Images (30 min)
- Go to leonardo.ai or playground.com (free)
- Use prompts from `YOLO_QUICK_START.md`
- Generate 5-10 images per class:
  - `monday_full` - Pills in Monday compartment
  - `monday_empty` - Monday compartment empty
- Download all images

### 3. Label Images (30 min)
- Go to roboflow.com → Create account
- Upload images
- Use Auto Label
- Draw boxes around pill organizer
- Label each as `monday_full` or `monday_empty`
- Add augmentation (flip, rotate, brightness)
- Export as YOLOv8 format
- Extract to `dataset/` folder here

### 4. Train Model (30-60 min)
```bash
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

**Wait for training to complete** (auto-stops when done)

Model saved to: `runs/detect/pill_detection/weights/best.pt`

### 5. Test Webcam Demo (5 min)
```bash
python webcam_demo.py
```

**Show pill box to camera** - should see detection!

---

## 📊 What Success Looks Like

**During Training:**
- mAP@0.5 should reach >60% (good for hackathon)
- Loss decreases consistently

**During Demo:**
- Detects pill box in <1 second
- Shows correct label (monday_full or monday_empty)
- 20-30+ FPS on webcam

---

## 🔧 Troubleshooting

**"No module named ultralytics"**
```bash
pip install --upgrade ultralytics opencv-python
```

**Training fails**
```bash
# Check dataset
cat dataset/data.yaml
ls dataset/train/images/
ls dataset/train/labels/
```

**Low accuracy**
- Generate more images (20+ total)
- Increase epochs to 200
- Use yolov8s.pt instead of yolov8n.pt

**Webcam won't open**
```bash
# Test camera
python -c "import cv2; print('Camera works:', cv2.VideoCapture(0).read()[0])"
```

---

## 🎬 Demo Preparation

**Props needed:**
- Printed images OR
- Display images on phone/tablet OR
- Real pill box with pills

**Demo flow:**
1. Open webcam demo: `python webcam_demo.py`
2. Show `monday_full` image → GENI says "Pills detected"
3. Show `monday_empty` image → GENI says "Pills confirmed taken"
4. Explain how this prevents medication errors

---

## 📁 Expected Directory Structure

After training:
```
yolo-training/
├── README.md (this file)
├── verify_setup.py
├── webcam_demo.py
├── dataset/
│   ├── data.yaml
│   ├── train/
│   │   ├── images/
│   │   └── labels/
│   └── valid/
│       ├── images/
│       └── labels/
├── runs/
│   └── detect/
│       └── pill_detection/
│           ├── weights/
│           │   └── best.pt  ← YOUR TRAINED MODEL
│           └── results.png
└── test-images/
```

---

## 🎯 Integration with GENI

After training, the model integrates with GENI backend:

```python
# Backend uses the model
from ultralytics import YOLO
model = YOLO('yolo-training/runs/detect/pill_detection/weights/best.pt')

# Detect from uploaded image
results = model(image_path, device='mps')
status = results[0].names[int(results[0].boxes[0].cls[0])]

# If monday_empty → Medication confirmed
# If monday_full → Reminder needed
```

---

## ⏰ Time Management

**While training runs (30-60 min), team can:**
- Work on backend integration
- Polish frontend UI
- Test WhatsApp alerts
- Prepare demo script
- Practice presentation

**Don't wait - parallelize!**

---

## 📚 Documentation

- **Full Guide:** `../YOLO_TRAINING_GUIDE.md`
- **Quick Reference:** `../YOLO_QUICK_START.md`
- **Elder Care Focus:** `../ELDER_CARE_PRIORITIES.md`

---

## 🏆 Success Tips

✅ **Do:**
- Run `verify_setup.py` first
- Generate varied images
- Use augmentation in Roboflow
- Test early and often
- Prepare backup video

❌ **Don't:**
- Wait until last minute
- Skip augmentation
- Overtrain (let patience stop it)
- Forget to test webcam before demo

---

**Questions? Check the full guides in parent folder!**

**Your team has this. YOLOv8 is perfect for hackathons.** 🎯🐾
