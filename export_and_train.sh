#!/bin/bash

# GENI Photo Export and Training Preparation Script

set -e

echo "╔════════════════════════════════════════╗"
echo "║                                        ║"
echo "║   📸 GENI Photo Export Helper         ║"
echo "║                                        ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Step 1: Check if Photos exported images to Desktop
echo "📋 Step 1: Looking for exported photos on Desktop..."
DESKTOP_PHOTOS=$(ls ~/Desktop/*.{jpg,jpeg,png,JPG,JPEG,PNG} 2>/dev/null | wc -l | tr -d ' ')

if [ "$DESKTOP_PHOTOS" -gt 0 ]; then
    echo "✅ Found $DESKTOP_PHOTOS photos on Desktop"
    echo ""
    echo "📥 Copying to training folder..."
    
    # Copy to training images
    cp ~/Desktop/*.{jpg,jpeg,png,JPG,JPEG,PNG} /Users/yimi/Desktop/GENI/backend/training-data/images/ 2>/dev/null || true
    
    # Clean up Desktop
    read -p "🗑️  Delete photos from Desktop after copying? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm ~/Desktop/*.{jpg,jpeg,png,JPG,JPEG,PNG} 2>/dev/null || true
        echo "✅ Desktop cleaned"
    fi
else
    echo "⚠️  No photos found on Desktop"
    echo ""
    echo "📝 To export photos from Photos app:"
    echo "   1. Open Photos app"
    echo "   2. Select your 11 medication/pill images"
    echo "   3. File → Export → Export 11 Photos"
    echo "   4. Save to Desktop"
    echo "   5. Run this script again"
    echo ""
    
    # Offer to open Photos app
    read -p "📸 Open Photos app now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open -a Photos
        echo "✅ Photos app opened"
        echo "After exporting, run this script again!"
        exit 0
    fi
fi

echo ""
echo "📊 Current training data status:"
cd /Users/yimi/Desktop/GENI/backend/training-data/images
IMAGE_COUNT=$(ls *.{jpg,jpeg,png,JPG,JPEG,PNG} 2>/dev/null | wc -l | tr -d ' ')
echo "   Total images: $IMAGE_COUNT"

echo ""
echo "🎯 Next steps:"
echo "   1. Label new images in training mode:"
echo "      http://localhost:3000?training=true"
echo ""
echo "   2. Run augmentation (multiply images by 11x):"
echo "      cd /Users/yimi/Desktop/GENI/backend"
echo "      npm run augment"
echo ""
echo "   3. Prepare training data:"
echo "      cd /Users/yimi/Desktop/GENI/backend/training-data"
echo "      zip -r ~/Desktop/training_data.zip labels.json images/"
echo ""
echo "   4. Train YOLO in Google Colab:"
echo "      Upload GENI_YOLO_Training.ipynb"
echo ""

echo "✅ Ready to proceed!"
