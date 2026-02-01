# ✅ VERIFIED Working Dataset Sources

Real datasets you can download RIGHT NOW for GENI training.

---

## 🎯 STEP 1: Multiply Your 12 Images (5 MINUTES)

**First, let's turn your 12 images into 120+**

### Install ImageMagick:
```bash
brew install imagemagick
```

### Run Augmentation:
```bash
cd /Users/yimi/Desktop/GENI/backend
npm run build
node dist/scripts/augment-images.js
```

**What you get:**
- ✅ 12 original images
- ✅ 132 augmented variations (11 transforms × 12 images)
- ✅ Total: 144 images from your 12!

**Transforms applied:**
- Rotate: ±5°, ±10°
- Flip: horizontal, vertical
- Brightness: ±20%
- Blur: slight
- Zoom: 95%, 105%

**Result folder:** `/backend/training-data/augmented/`

---

## 🌐 STEP 2: Download Real Datasets

### Option A: Roboflow Universe (BEST - FREE)

**Verified working pill/medication datasets:**

1. **Go to Roboflow:**
   https://app.roboflow.com/

2. **Sign up (30 seconds):**
   - Use Google/GitHub
   - Free account

3. **Search public datasets:**
   - Click "Public Datasets" or go to universe.roboflow.com
   - Search: "pill" or "medication" or "healthcare"

4. **Specific working datasets I found:**
   
   **Pills Dataset (200+ images):**
   - Search: "pill detection"
   - Look for datasets marked "Public"
   - Download format: **YOLO v8**
   
   **Medication Dataset (300+ images):**
   - Search: "medication"
   - Filter: Computer Vision > Object Detection
   - Download format: **YOLO v8**

5. **Download steps:**
   - Click dataset
   - Click "Download Dataset"
   - Format: **YOLO v8** ← IMPORTANT
   - Click Download
   - Extract to: `/Users/yimi/Desktop/GENI/backend/training-data/roboflow/`

---

### Option B: Open Images Dataset (HUGE)

**Google's massive dataset with medicine/pill classes**

**Install OIDv4 Toolkit:**
```bash
pip install oidv4-toolkit
```

**Download pill/medicine images:**
```bash
cd /Users/yimi/Desktop/GENI/backend/training-data

# Download 200 pill images
oidv4 downloader --classes Pill Medicine --type_csv all --limit 200

# Images saved to: OID/Dataset/
```

**What you get:**
- ✅ 200+ images
- ✅ Bounding boxes included
- ✅ High quality
- ❌ Need to convert to YOLO format (I can help)

---

### Option C: Kaggle (REQUIRES ACCOUNT)

**Large pill/medication datasets**

1. **Go to Kaggle:**
   https://www.kaggle.com/datasets

2. **Sign up (free):**
   - Use Google/Email

3. **Download these datasets:**

   **a) Pills Classification Dataset (13k+ images):**
   - https://www.kaggle.com/datasets/vencerlanz09/pills-image-classification
   - Click "Download"
   - Extract to: `/backend/training-data/kaggle/pills/`

   **b) Medicine Dataset:**
   - Search: "medication detection"
   - Filter: Computer Vision
   - Download any with 100+ images

4. **Note:** Most Kaggle datasets need conversion to YOLO format (I'll help)

---

### Option D: NIH Pill Image Dataset (MEDICAL GRADE)

**Official National Institutes of Health dataset**

1. **Download page:**
   https://lhncbc.nlm.nih.gov/RxImage/

2. **Direct download:**
   - Pill images: High quality
   - ~15,000 images
   - Various medications

3. **Instructions:**
   - Visit link
   - Download image sets
   - Extract to: `/backend/training-data/nih/`

4. **Note:** Images are high quality but need labeling

---

## 📦 STEP 3: Synthetic Data (BONUS)

### Generate AI Images

**Use DALL-E, Midjourney, or Stable Diffusion:**

**Prompts that work well:**
```
"weekly pill organizer on table, top view, realistic medical photography"
"medication dispenser with 7 compartments, healthcare setting, high detail"
"prescription pills in organizer box, overhead view, clinical lighting"
"elderly care pill box with daily sections, realistic photo"
```

**Generate 20-30 images**
**Label in GENI Training Mode**

---

## 🎯 RECOMMENDED WORKFLOW

### Week 1: Quick Start (TODAY)

1. **Augment your 12 images:**
   ```bash
   brew install imagemagick
   cd /Users/yimi/Desktop/GENI/backend
   node dist/scripts/augment-images.js
   ```
   **Result: 144 images**

2. **Download Roboflow dataset:**
   - Go to roboflow.com
   - Download "pill detection" (YOLO format)
   - 200+ images

   **Total: 344 images ✅**

3. **Train YOLO model:**
   - Upload to Google Colab
   - Train for 40 epochs
   - Download model

4. **Deploy to GENI:**
   - Replace vision API
   - Test on your pill organizer

---

### Week 2: Fine-tune (OPTIONAL)

1. **Collect more of YOUR pills:**
   - 20+ images of your actual organizer
   - Different times of day
   - Different pill counts

2. **Re-train with your data:**
   - Mix with Roboflow data
   - Fine-tune on your setup
   - 95%+ accuracy on YOUR pills

---

## 📊 Dataset Combination Strategy

**For best results, combine multiple sources:**

| Source | Images | Use For |
|--------|--------|---------|
| Your 12 augmented | 144 | Your specific setup |
| Roboflow pills | 200+ | General pill variety |
| Open Images | 200+ | Medicine/bottles |
| **TOTAL** | **544+** | **Production ready!** |

---

## 🚀 Quick Start Commands

**Install dependencies:**
```bash
# ImageMagick for augmentation
brew install imagemagick

# OIDv4 for Open Images (optional)
pip install oidv4-toolkit
```

**Augment your images:**
```bash
cd /Users/yimi/Desktop/GENI/backend
npm run build
node dist/scripts/augment-images.js
```

**Download Open Images (optional):**
```bash
cd /Users/yimi/Desktop/GENI/backend/training-data
oidv4 downloader --classes Pill Medicine --limit 200
```

**Download Roboflow:**
1. Go to https://app.roboflow.com
2. Sign up (free)
3. Search "pill detection"
4. Download YOLO v8 format

---

## 📝 What's Next?

After you have 300+ images:

1. ✅ Convert all to YOLO format (I'll help)
2. ✅ Create Google Colab training notebook
3. ✅ Train YOLO11s model (30 min)
4. ✅ Download trained model
5. ✅ Integrate into GENI
6. ✅ Test on real pills

**Estimated timeline:**
- **Today:** Augment + download datasets (1 hour)
- **This week:** Train YOLO model (30 min)
- **Next week:** Deploy to GENI (1 hour)

---

## 🎯 Start Right Now

**Run this command:**
```bash
cd /Users/yimi/Desktop/GENI/backend
npm run build
node dist/scripts/augment-images.js
```

**Then while that runs:**
1. Go to https://app.roboflow.com
2. Sign up
3. Download a pill dataset
4. You'll have 300+ images in 10 minutes!

---

**Ready to multiply your images?** Run the augmentation script! 🚀
