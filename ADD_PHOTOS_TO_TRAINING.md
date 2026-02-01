# 📸 Add Your Photos to GENI Training

macOS Photos Library is protected. Here's how to export and add your images:

---

## 🚀 Quick Method (Drag & Drop - 2 minutes)

### Step 1: Open Photos App
```bash
open -a Photos
```

### Step 2: Export Images

1. **Select your 11 pill/medication photos**
   - Command+Click to select multiple
   
2. **Export them:**
   - File → Export → Export 11 Photos
   - OR right-click → Export 11 Photos
   
3. **Settings:**
   - Photo Kind: **JPEG** (best for training)
   - Quality: **High**
   - Location: **Desktop** (for easy access)
   
4. **Click Export**

### Step 3: Move to Training Folder

```bash
# Move exported photos to training images folder
mv ~/Desktop/*.jpg /Users/yimi/Desktop/GENI/backend/training-data/images/

# Or drag them in Finder:
# From Desktop → to /Users/yimi/Desktop/GENI/backend/training-data/images/
```

### Step 4: Open Training Mode & Label

```bash
# Open GENI training mode
open "http://localhost:3000?training=true"
```

Then for each new image:
1. Click "Start Camera" (or upload directly if added)
2. Select category
3. Add description
4. Save

---

## 📊 After Adding Photos

**Current status:**
- Original: 12 images
- New photos: 11 images
- **Total: 23 images**

**Augmentation:**
- 23 images × 11 transforms = **253 training images**
- That's enough to train YOLO!

---

## 🎯 Alternative: Quick Copy Script

If you want me to help automate this, you can:

1. **Export all 11 photos to Desktop first**
2. **Then run:**
   ```bash
   cd /Users/yimi/Desktop/GENI/backend/training-data
   
   # Copy all JPG/PNG from desktop
   cp ~/Desktop/*.jpg images/ 2>/dev/null
   cp ~/Desktop/*.png images/ 2>/dev/null
   cp ~/Desktop/*.jpeg images/ 2>/dev/null
   
   # Check what got copied
   ls -lh images/ | tail -20
   ```

---

## 📝 What to Label Them As

Based on what you sent, these likely are:
- **pill-organizer-full** - If showing pills in organizer
- **pill-organizer-empty** - If empty compartments
- **human-hand** - If hand holding something
- **other** - Medicine bottles, pill containers, etc.

---

## 🚀 Ready to Export?

**Just do this:**
1. Open Photos app
2. Select your 11 images
3. Right-click → Export
4. Save to Desktop
5. Drag to `/Users/yimi/Desktop/GENI/backend/training-data/images/`
6. Label in training mode

**Then we can train with 23 images → 250+ after augmentation!** 🎯
