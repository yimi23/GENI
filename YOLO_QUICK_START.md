# ⚡ YOLOv8 Quick Start - Copy/Paste Commands

## Setup (5 minutes)

```bash
# Install
pip install ultralytics opencv-python

# Create folders
cd /Users/yimi/Desktop/GENI
mkdir -p yolo-training/{dataset,runs,test-images}
cd yolo-training
```

---

## Generate Images (30 minutes)

**Go to:** leonardo.ai or playground.com (free AI image generation)

**Prompt for FULL (generate 5-10):**
```
Photorealistic top-down view of white plastic weekly pill organizer, 
7 compartments labeled MON TUE WED THU FRI SAT SUN, Monday compartment 
has blue pills, other compartments have pills, white background, 
studio lighting, no hands, no shadows
```

**Variations:** Add "slight rotation" or "brighter lighting" or "zoomed in"

**Prompt for EMPTY (generate 5-10):**
```
Photorealistic top-down view of white plastic weekly pill organizer,
7 compartments labeled MON TUE WED THU FRI SAT SUN, Monday compartment 
COMPLETELY EMPTY showing white plastic, other compartments have pills,
white background, studio lighting, no hands, no shadows
```

**Download all as JPG**

---

## Label (30 minutes)

1. Go to **roboflow.com** → Create account (free)
2. Create New Project → "GENI Pill Detection" → Object Detection
3. Upload all images
4. Click "Auto Label" → prompt: "pill organizer"
5. For each image:
   - Draw box around entire pill organizer
   - Label: `monday_full` or `monday_empty`
6. Generate → Add augmentation:
   - Flip horizontal
   - Rotate ±15°
   - Brightness ±15%
7. Export → YOLOv8 format → Download ZIP
8. Extract to `dataset/` folder

---

## Train (30-60 minutes)

```bash
cd /Users/yimi/Desktop/GENI/yolo-training

# Train (copy-paste this exact command)
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

**Wait 30-60 minutes** (it will auto-stop when done)

**Look for:** mAP@0.5 > 60% = good enough

**Model saved at:** `runs/detect/pill_detection/weights/best.pt`

---

## Test Webcam (5 minutes)

```bash
# Quick test
yolo task=detect mode=predict \
  model=runs/detect/pill_detection/weights/best.pt \
  source=0 \
  show=True \
  device=mps
```

**Press 'q' to quit**

**Should see:** Bounding box around pill box with label

---

## Integration Test

```python
# test_detection.py
from ultralytics import YOLO

model = YOLO('runs/detect/pill_detection/weights/best.pt')
results = model('path/to/test_image.jpg', device='mps')

for box in results[0].boxes:
    class_name = model.names[int(box.cls[0])]
    confidence = float(box.conf[0])
    print(f"Detected: {class_name} ({confidence:.2f})")
```

---

## Troubleshooting

**"No module named ultralytics"**
```bash
pip install --upgrade ultralytics
```

**"MPS not available"**
```bash
# Use CPU instead
device=cpu
```

**"Dataset not found"**
```bash
# Check data.yaml exists
ls dataset/data.yaml
cat dataset/data.yaml
```

**Low accuracy (<50%)**
- Generate more images (20+ total)
- Increase augmentation in Roboflow
- Train longer (epochs=200)

---

## Demo Prep

**Physical props:**
- Print 2 images (monday_full, monday_empty)
- Or display on phone/tablet screen
- Or use real pill box

**Demo flow:**
1. Show pill box to webcam
2. YOLO detects: "monday_full"
3. GENI: "Pills still present, please take medication"
4. Switch to empty image
5. YOLO detects: "monday_empty"
6. GENI: "Pills confirmed taken!"
7. WhatsApp alert sent to caregiver

---

## File Checklist

After training, you should have:

```
yolo-training/
├── dataset/
│   ├── data.yaml
│   ├── train/
│   └── valid/
├── runs/
│   └── detect/
│       └── pill_detection/
│           └── weights/
│               └── best.pt  ← THIS IS YOUR MODEL
└── webcam_demo.py
```

---

**That's it! 3-4 hours total. You got this!** 🎯
