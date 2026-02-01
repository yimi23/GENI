#!/usr/bin/env python3
"""
GENI YOLOv8 Setup Verification Script
Run this before starting training to catch issues early
"""

import sys

print("🔍 GENI YOLOv8 Setup Verification\n")
print("=" * 50)

# Check Python version
print("\n1. Checking Python version...")
if sys.version_info >= (3, 8):
    print(f"   ✅ Python {sys.version_info.major}.{sys.version_info.minor} (OK)")
else:
    print(f"   ❌ Python {sys.version_info.major}.{sys.version_info.minor} (need 3.8+)")
    sys.exit(1)

# Check ultralytics
print("\n2. Checking ultralytics (YOLOv8)...")
try:
    import ultralytics
    from ultralytics import YOLO
    print(f"   ✅ ultralytics {ultralytics.__version__} installed")
except ImportError:
    print("   ❌ ultralytics not found")
    print("   Fix: pip install ultralytics")
    sys.exit(1)

# Check OpenCV
print("\n3. Checking OpenCV...")
try:
    import cv2
    print(f"   ✅ OpenCV {cv2.__version__} installed")
except ImportError:
    print("   ❌ OpenCV not found")
    print("   Fix: pip install opencv-python")
    sys.exit(1)

# Check device availability
print("\n4. Checking compute devices...")
try:
    import torch
    
    # MPS (Apple Silicon)
    if torch.backends.mps.is_available():
        print("   ✅ MPS (Apple GPU) available - FAST training!")
        device = "mps"
    # CUDA (NVIDIA)
    elif torch.cuda.is_available():
        print(f"   ✅ CUDA available - {torch.cuda.get_device_name(0)}")
        device = "cuda"
    # CPU only
    else:
        print("   ⚠️  CPU only - training will be slower")
        device = "cpu"
except Exception as e:
    print(f"   ⚠️  Could not detect device: {e}")
    device = "cpu"

# Test YOLOv8 download
print("\n5. Testing YOLOv8 model download...")
try:
    model = YOLO("yolov8n.pt")
    print("   ✅ YOLOv8n model downloaded successfully")
except Exception as e:
    print(f"   ❌ Failed to download model: {e}")
    sys.exit(1)

# Test webcam
print("\n6. Testing webcam access...")
try:
    cap = cv2.VideoCapture(0)
    ret, frame = cap.read()
    cap.release()
    
    if ret and frame is not None:
        print(f"   ✅ Webcam working ({frame.shape[1]}x{frame.shape[0]})")
    else:
        print("   ❌ Webcam failed to capture frame")
        print("   Note: This might be OK if using phone camera for demo")
except Exception as e:
    print(f"   ⚠️  Webcam test failed: {e}")
    print("   Note: This might be OK if using phone camera for demo")

# Check directory structure
print("\n7. Checking directory structure...")
import os

required_dirs = ['dataset', 'runs', 'test-images']
for dir_name in required_dirs:
    if os.path.exists(dir_name):
        print(f"   ✅ {dir_name}/ exists")
    else:
        print(f"   ⚠️  {dir_name}/ not found - will be created during training")

# Final summary
print("\n" + "=" * 50)
print("\n📊 SUMMARY\n")
print(f"Recommended device for training: {device}")
print(f"Python: {sys.version_info.major}.{sys.version_info.minor}")
print(f"YOLOv8: {ultralytics.__version__}")
print(f"OpenCV: {cv2.__version__}")

print("\n✅ Setup verification complete!")
print("\nNext steps:")
print("1. Generate images (leonardo.ai or stable diffusion)")
print("2. Label in Roboflow")
print("3. Download dataset to dataset/ folder")
print("4. Run training command from YOLO_QUICK_START.md")

print("\n🎯 Ready to train!\n")
