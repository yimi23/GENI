#!/bin/bash

# Quick script to download sample training dataset
# This downloads the candy dataset from the YOLO tutorial video

set -e

echo "╔════════════════════════════════════════╗"
echo "║                                        ║"
echo "║   📥 Downloading Sample Dataset       ║"
echo "║                                        ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Create directory
TRAINING_DIR="backend/training-data/downloaded"
mkdir -p "$TRAINING_DIR"
cd "$TRAINING_DIR"

echo "📂 Download directory: $(pwd)"
echo ""

# Download candy dataset (YOLO format, from tutorial video)
echo "📦 Downloading candy detection dataset..."
echo "   Source: https://www.ejtech.io/candy_data.zip"
echo "   Size: ~50MB"
echo "   Images: 150+"
echo "   Format: YOLO (ready to train)"
echo ""

curl -L -o candy_data.zip https://www.ejtech.io/candy_data.zip

echo ""
echo "📂 Extracting..."
unzip -q candy_data.zip

echo ""
echo "✅ Download complete!"
echo ""
echo "📊 Dataset info:"
ls -lh

echo ""
echo "📍 Location: $(pwd)"
echo ""
echo "🎯 Next steps:"
echo "   1. Review the images in 'data/images/'"
echo "   2. Check labels in 'data/labels/'"
echo "   3. Ready to train YOLO model in Google Colab!"
echo ""
echo "💡 This is a sample dataset (candy). Good for:"
echo "   - Testing YOLO training pipeline"
echo "   - Learning the process"
echo "   - Then switch to pill detection datasets"
echo ""
