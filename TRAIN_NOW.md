# 🚀 Train YOLO with Your 12 Images - RIGHT NOW

Complete training in 30 minutes using Google Colab (free GPU).

---

## ✅ What I Created

**Google Colab Notebook:** `GENI_YOLO_Training.ipynb`

This notebook:
1. ✅ Augments your 12 images → 120+
2. ✅ Converts to YOLO format
3. ✅ Trains YOLO11s model (60 epochs)
4. ✅ Downloads trained model
5. ✅ Ready to integrate into GENI

---

## 🎯 How to Use (5 Steps)

### Step 1: Upload Notebook to Colab (2 min)

1. **Go to:** https://colab.research.google.com
2. **Click:** File → Upload notebook
3. **Upload:** `GENI_YOLO_Training.ipynb` from Desktop/GENI/
4. **Click:** Runtime → Change runtime type
5. **Select:** T4 GPU
6. **Click:** Save

### Step 2: Prepare Training Data (2 min)

**Zip your training data:**
```bash
cd /Users/yimi/Desktop/GENI/backend/training-data
zip -r training_data.zip labels.json images/
```

**Result:** `training_data.zip` with 12 images + labels

### Step 3: Upload to Colab (2 min)

1. **In Colab:**
   - Click folder icon (left sidebar)
   - Click upload button
   - Upload `training_data.zip`

2. **Unzip:**
   - Run this cell in notebook:
   ```python
   !unzip training_data.zip
   !ls -la
   ```

### Step 4: Run Training (20 min)

**Just click through each cell:**
1. ▶️ Check GPU
2. ▶️ Install dependencies  
3. ▶️ Create directories
4. ▶️ Augment images (12 → 120+)
5. ▶️ Convert to YOLO format
6. ▶️ Train model (this takes ~15-20 min)
7. ▶️ View results
8. ▶️ Test model
9. ▶️ Download model

**Colab will show progress bars and training metrics**

### Step 5: Download Model (2 min)

1. **After training:**
   - Find `geni_pill_model.zip` in files panel
   - Click ⋮ (three dots)
   - Click "Download"

2. **Move to GENI:**
   ```bash
   cd ~/Downloads
   unzip geni_pill_model.zip
   mv geni_model/pill_detection/weights/best.pt /Users/yimi/Desktop/GENI/backend/models/geni_pill_model.pt
   ```

---

## 📊 What You'll Get

**After 30 minutes:**
- ✅ Trained YOLO11s model
- ✅ 120+ augmented training images
- ✅ Training metrics (mAP, precision, recall)
- ✅ Test predictions
- ✅ Ready-to-use model file

**Accuracy:** Should get 70-85% mAP with 12 images

---

## 🎯 Quick Start

**Copy-paste these commands:**

```bash
# 1. Zip your training data
cd /Users/yimi/Desktop/GENI/backend/training-data
zip -r ~/Desktop/training_data.zip labels.json images/

# 2. Open Colab
open https://colab.research.google.com

# 3. Upload GENI_YOLO_Training.ipynb
# (drag from Desktop/GENI/)

# 4. Upload training_data.zip in Colab
# (click folder icon → upload)

# 5. Run all cells (Runtime → Run all)
# Wait 20 minutes

# 6. Download geni_pill_model.zip

# 7. Extract and move to GENI
cd ~/Downloads
unzip geni_pill_model.zip
mkdir -p /Users/yimi/Desktop/GENI/backend/models
mv geni_model/pill_detection/weights/best.pt /Users/yimi/Desktop/GENI/backend/models/geni_pill_model.pt
```

---

## 💡 Tips

**While training:**
- Watch the mAP (mean average precision) metric
- Should increase each epoch
- Final mAP >70% is good for 12 images
- Final mAP >85% is excellent

**If training fails:**
- Make sure GPU is enabled (Runtime → Change runtime type)
- Check all files uploaded correctly
- Reduce batch size to 8 if out of memory

**After training:**
- Test the model on new images
- If accuracy is low, collect more training data
- Retrain with 50+ images for production use

---

## 🚀 Start Now!

**Ready?** 

1. Open https://colab.research.google.com
2. Upload `GENI_YOLO_Training.ipynb`
3. Enable GPU
4. Run all cells
5. Come back in 20 minutes!

**The notebook does everything automatically** - augmentation, conversion, training, testing! 🎯

---

## 📝 After Training

Once you have the model, I'll help you:
1. Integrate into GENI's `yolo.ts`
2. Update pill-check API to use YOLO first
3. Fall back to Claude Vision if unclear
4. Test on real pill organizer
5. Deploy to production

**Want to start the training now?** 🚀
