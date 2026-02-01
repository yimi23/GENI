# GENI Vision Training Guide
**Train GENI to recognize objects better**

---

## 🎯 What We're Building

A training system that lets you show GENI different objects and label them, so she learns what's what.

### Object Categories

1. **pill-organizer-full** - Pill organizer with pills visible
2. **pill-organizer-empty** - Pill organizer with empty compartments  
3. **loose-pills** - Pills not in organizer
4. **human-face** - Human face in frame
5. **human-hand** - Human hand in frame
6. **table-empty** - Empty table surface
7. **table-objects** - Table with random objects
8. **wall** - Wall or background
9. **blur** - Blurry/unclear image
10. **glare** - Glare or reflection blocking view
11. **other** - Other object not listed

---

## 📸 How to Train

### Backend is Ready ✅

I've added 3 new API endpoints:

```
GET  /api/training/categories  → List all object categories
POST /api/training/submit      → Submit labeled training image
GET  /api/training/stats       → View training dataset stats
```

### Training Process

**Option 1: Quick Test (Use Postman/curl)**

1. Capture an image from GENI camera
2. Send POST to `/api/training/submit`:
   ```json
   {
     "image": "<base64_image_data>",
     "category": "human-face",
     "description": "Front-facing with glasses"
   }
   ```

**Option 2: Build Training UI (Recommended)**

I can create a simple training mode page where you:
1. Click "Start Training"
2. Camera activates
3. Show an object
4. Click "Capture"
5. Select category from dropdown
6. Add optional description
7. Click "Save"
8. Repeat for different objects

---

## 💾 Where Training Data is Saved

```
/backend/training-data/
  ├── images/
  │   ├── 1738377234567-abc123.jpg
  │   ├── 1738377298456-def456.jpg
  │   └── ...
  └── labels.json
```

**labels.json** structure:
```json
[
  {
    "id": "1738377234567-abc123",
    "timestamp": 1738377234567,
    "category": "pill-organizer-full",
    "description": "Weekly organizer, Monday has 3 white pills",
    "filename": "1738377234567-abc123.jpg"
  },
  ...
]
```

---

## 🎓 How This Improves GENI

### Phase 1: Better Prompts (Immediate)
- After collecting 20-30 examples per category
- Update vision prompts with real examples from your environment
- More accurate "No pill organizer detected" responses

### Phase 2: YOLO Training (Advanced)
- After collecting 100+ labeled images
- Train YOLOv8 model on your specific objects
- Much faster and more accurate than Claude Vision
- Can detect multiple objects in one image

### Phase 3: Hybrid System (Production)
```
Quick check → YOLO (0.2s, very accurate)
  ↓ unclear
Claude Vision (2-3s, reasoning)
  ↓ still unclear
Ask user to confirm
```

---

## 📊 Recommended Training Dataset

For basic pill detection:

| Category | Minimum | Ideal |
|----------|---------|-------|
| pill-organizer-full | 20 | 50 |
| pill-organizer-empty | 20 | 50 |
| human-face | 10 | 30 |
| human-hand | 10 | 30 |
| table-empty | 10 | 20 |
| table-objects | 10 | 20 |
| wall | 5 | 10 |
| blur | 5 | 10 |
| glare | 5 | 10 |

**Total: 95 minimum, 230 ideal**

Capture images in different:
- Lighting conditions (bright, dim, natural, artificial)
- Angles (top-down, side view, tilted)
- Distances (close-up, normal, far)
- Backgrounds (different table colors, walls)

---

## 🚀 Next Steps

**Want me to:**

1. **Build a training UI page?**
   - Add "Training Mode" button to GENI frontend
   - Simple capture → label → save workflow
   - Real-time stats (20/50 pill organizer images collected)

2. **Start training now with what we have?**
   - Show me objects on your table
   - I'll capture and you tell me what they are
   - We can do 5-10 quick samples to test the system

3. **Set up YOLO training pipeline?**
   - Install Python dependencies (OpenCV, ultralytics)
   - Create training script for YOLOv8
   - Run first training when we have 100+ images

**What do you want to start with?** 🎯
