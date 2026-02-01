#!/bin/bash

echo "🎯 Installing YOLOv8 for GENI"
echo "=============================="

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Please install Python 3.8+"
    exit 1
fi

echo "✓ Python found: $(python3 --version)"

# Install ultralytics (YOLOv8)
echo ""
echo "📦 Installing ultralytics (YOLOv8)..."
pip install ultralytics opencv-python numpy

# Verify installation
echo ""
echo "🧪 Verifying installation..."
python3 -c "from ultralytics import YOLO; print('✅ YOLOv8 installed successfully')"
python3 -c "import cv2; print('✅ OpenCV installed successfully')"

# Download base model
echo ""
echo "📥 Downloading YOLOv8 base model..."
python3 -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Generate images (leonardo.ai)"
echo "2. Label in Roboflow"
echo "3. Train: yolo task=detect mode=train data=dataset/data.yaml model=yolov8n.pt"
echo ""
echo "🐾 Ready to train!"
