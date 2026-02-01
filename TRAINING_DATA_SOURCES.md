# 📥 Training Data Sources for GENI

You have 12 images. Let's get you to 100-200+ for a solid YOLO model.

---

## 🎯 Quick Option: Use Pre-Made Datasets

### Option 1: Roboflow Universe (RECOMMENDED)

**Best for:** Ready-to-use, pre-labeled pill/medication datasets

**Steps:**
1. Go to: https://universe.roboflow.com
2. Search for: "pill detection" or "medication" or "pill organizer"
3. Popular datasets:
   - **Pill Detection**: https://universe.roboflow.com/search?q=pill
   - **Medicine Detection**: https://universe.roboflow.com/search?q=medicine
   - **Pill Organizer**: https://universe.roboflow.com/search?q=organizer

4. Click any dataset → "Download Dataset"
5. Format: **YOLO** (important!)
6. Download ZIP
7. Extract to `/Users/yimi/Desktop/GENI/backend/training-data/roboflow/`

**Free account required** (30 seconds to sign up)

---

### Option 2: Kaggle Datasets

**URL:** https://www.kaggle.com/datasets

**Search terms:**
- "pill detection"
- "medication recognition"
- "pharmacy"
- "pharmaceutical"

**Popular datasets:**
1. **Pills Dataset**: https://www.kaggle.com/datasets/vencerlanz09/pills-image-classification
   - 13,000+ images
   - Multiple pill types
   
2. **Medication Image Dataset**: https://www.kaggle.com/datasets/
   - Various medications
   - Different angles

**Download:**
1. Click "Download" button
2. Sign in with Google/Email (free)
3. Extract to training folder
4. You'll need to convert labels to YOLO format (I can help)

---

### Option 3: Google Open Images V7

**Best for:** Massive dataset with "pill" and "medicine" classes

**Quick download script:**
```bash
# Install OIDv4 toolkit
pip install oidv4-toolkit

# Download pill images
oidv4 downloader --classes Pill Medicine --type_csv all --limit 200

# This downloads ~200 images with bounding boxes
```

**Location:** Downloads to `OID/Dataset/`

---

### Option 4: NIH Pill Image Recognition Dataset

**URL:** https://data.lhncbc.nlm.nih.gov/public/Pills/

**Info:**
- 15,000+ pill images
- High quality
- Different pill types, shapes, colors

**Download:**
1. Visit URL above
2. Click "Download" links
3. Extract images
4. Convert to YOLO format

---

### Option 5: Sample Dataset from Tutorial Video

**The exact dataset from the YOLO training video!**

**Candy Detection Dataset** (good for testing YOLO pipeline):
```bash
cd /Users/yimi/Desktop/GENI/backend/training-data
curl -O https://www.ejtech.io/candy_data.zip
unzip candy_data.zip
```

**Pros:**
- Already in YOLO format
- 150+ labeled images
- Good for testing the training pipeline

**Cons:**
- Not pills (candy)
- You'd need to retrain on pill data later

**Use this to:** Test the YOLO training process while you collect real pill data

---

## 🛠️ DIY Options (More Work, Better Results)

### Option 6: Google Images Scraper

**Download images from Google:**

1. Install Chrome extension: "Download All Images"
2. Search Google Images for:
   - "pill organizer"
   - "weekly pill box"
   - "medication organizer"
   - "pill dispenser"
3. Download 50-100 images
4. Label them in GENI Training Mode

**Tools:**
```bash
# Or use command line
npm install -g google-images-download
google-images-download --keywords "pill organizer" --limit 100
```

---

### Option 7: YouTube Video Frames

**Extract frames from medication videos:**

```bash
# Install ffmpeg if needed
brew install ffmpeg

# Extract 1 frame per second from a video
ffmpeg -i medication_video.mp4 -vf fps=1 frames/frame_%04d.jpg
```

**Find videos on YouTube:**
- Search: "pill organizer tutorial"
- Search: "how to organize medication"
- Extract frames
- Label in GENI Training Mode

---

## 🎨 Synthetic Data (Advanced)

### Option 8: AI-Generated Images

**Use Stable Diffusion/Midjourney to generate pill organizer images:**

**Prompts:**
- "pill organizer on table, top view, realistic photo"
- "weekly medication organizer with pills visible, healthcare setting"
- "7-day pill box with compartments, medical photography"

**Tools:**
- Midjourney: https://midjourney.com
- Stable Diffusion: https://stablediffusionweb.com
- Generate 20-30 synthetic images

**Label in GENI Training Mode**

---

## 📊 Recommended Strategy

**For GENI pill detection, here's what I recommend:**

### Phase 1: Quick Start (TODAY)
1. ✅ Download **candy dataset** from tutorial video (test YOLO pipeline)
2. ✅ Download **Roboflow pill dataset** (100-200 images)
3. Merge with your 12 existing images
4. **Total: ~300+ images** → ready to train!

### Phase 2: Customize (NEXT WEEK)
1. Collect 50+ images of YOUR specific pill organizer
2. Different lighting, angles, backgrounds
3. Retrain model on your specific setup
4. **Result: 95%+ accuracy on your pills**

---

## 🚀 Quick Start Commands

**Option A: Download sample dataset (5 minutes)**
```bash
cd /Users/yimi/Desktop/GENI/backend/training-data
mkdir downloaded
cd downloaded

# Download candy dataset (YOLO format, ready to train)
curl -O https://www.ejtech.io/candy_data.zip
unzip candy_data.zip

# You now have 150+ labeled images in YOLO format!
```

**Option B: Download from Roboflow (10 minutes)**
1. Go to https://universe.roboflow.com/search?q=pill
2. Click any "Pill Detection" dataset
3. Click "Download Dataset"
4. Select format: **YOLO v8**
5. Download ZIP
6. Extract to `training-data/roboflow/`

**Option C: Download from Kaggle (15 minutes)**
1. Go to https://www.kaggle.com/datasets
2. Search "pill detection"
3. Download dataset
4. I'll help convert to YOLO format

---

## 📝 Next Steps After Download

Once you have downloaded datasets:

1. **Extract** all zip files
2. **Review** images (make sure they're relevant)
3. **Merge** with your 12 existing images
4. **Convert to YOLO format** (if needed - I can help)
5. **Train YOLO model** in Google Colab
6. **Integrate** into GENI

---

## 💡 My Recommendation

**Start with Option A (candy dataset) RIGHT NOW:**

This lets you:
- ✅ Test the YOLO training pipeline immediately
- ✅ Verify Google Colab setup works
- ✅ Learn the training process
- ✅ See how fast YOLO detection runs

**Then add Option B (Roboflow pill dataset):**
- Get real pill/medication images
- Retrain for actual pill detection
- Deploy to GENI

**Timeline:**
- **TODAY:** Download candy dataset + test YOLO training (1 hour)
- **THIS WEEK:** Download pill datasets + retrain (2 hours)
- **NEXT WEEK:** Collect YOUR specific pills + fine-tune (1 hour)

---

**Which option do you want to start with?** I can guide you through any of these! 🎯
