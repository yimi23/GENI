# 🚀 GENI Training Data - Quick Start

Get from **12 images → 300+ images** in 30 minutes!

---

## ✅ STEP 1: Multiply Your Images (5 min)

**Install ImageMagick:**
```bash
brew install imagemagick
```

**Run augmentation:**
```bash
cd /Users/yimi/Desktop/GENI/backend
npm run augment
```

**Result:** 12 → 144 images (12x multiplier)

---

## ✅ STEP 2: Download Real Datasets (10 min)

### Roboflow Universe (EASIEST)

1. **Go to:** https://app.roboflow.com
2. **Sign up** (Google/GitHub - 30 seconds)
3. **Search:** "pill detection"
4. **Download:**
   - Click any pill dataset
   - Format: **YOLO v8**
   - Download ZIP

5. **Extract:**
   ```bash
   cd /Users/yimi/Desktop/GENI/backend/training-data
   mkdir roboflow
   # drag downloaded zip here
   unzip pill-detection.zip
   ```

**Result:** +200 images

---

## ✅ STEP 3: Optional - Open Images (15 min)

```bash
# Install
pip install oidv4-toolkit

# Download
cd /Users/yimi/Desktop/GENI/backend/training-data
oidv4 downloader --classes Pill Medicine --limit 200
```

**Result:** +200 images

---

## 📊 Total Dataset

| Source | Images |
|--------|--------|
| Your 12 augmented | 144 |
| Roboflow | 200 |
| Open Images (optional) | 200 |
| **TOTAL** | **544** ✅ |

---

## 🎯 Next: Train YOLO

After collecting images:
1. Convert to YOLO format
2. Upload to Google Colab
3. Train YOLO11s (30 min)
4. Download model
5. Deploy to GENI

---

## 🚀 Start Now

**Copy-paste this:**
```bash
# Install ImageMagick
brew install imagemagick

# Augment your 12 images
cd /Users/yimi/Desktop/GENI/backend
npm run augment

# Then go download Roboflow dataset while it runs
# https://app.roboflow.com
```

**Total time:** 30 minutes to get 300+ images! 🎯
