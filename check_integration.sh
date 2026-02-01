#!/bin/bash

echo "🐾 GENI Integration Status Check"
echo "=================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Python
echo ""
echo "1. Python Environment"
echo "   ---------------------"
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "   ${GREEN}✓${NC} Python installed: $PYTHON_VERSION"
else
    echo -e "   ${RED}✗${NC} Python3 not found"
    echo "      Fix: Install Python 3.8+"
fi

# Check ultralytics
echo ""
echo "2. YOLOv8 (ultralytics)"
echo "   ---------------------"
if python3 -c "import ultralytics" 2>/dev/null; then
    YOLO_VERSION=$(python3 -c "import ultralytics; print(ultralytics.__version__)")
    echo -e "   ${GREEN}✓${NC} ultralytics installed: $YOLO_VERSION"
else
    echo -e "   ${RED}✗${NC} ultralytics not installed"
    echo "      Fix: pip install ultralytics opencv-python"
fi

# Check OpenCV
echo ""
echo "3. OpenCV"
echo "   ---------------------"
if python3 -c "import cv2" 2>/dev/null; then
    CV_VERSION=$(python3 -c "import cv2; print(cv2.__version__)")
    echo -e "   ${GREEN}✓${NC} OpenCV installed: $CV_VERSION"
else
    echo -e "   ${RED}✗${NC} OpenCV not installed"
    echo "      Fix: pip install opencv-python"
fi

# Check YOLO detector script
echo ""
echo "4. YOLO Detector Service"
echo "   ---------------------"
if [ -f "backend/src/services/yolo_detector.py" ]; then
    echo -e "   ${GREEN}✓${NC} yolo_detector.py exists"
else
    echo -e "   ${RED}✗${NC} yolo_detector.py not found"
    echo "      Fix: Check backend/src/services/ directory"
fi

# Check TypeScript wrapper
echo ""
echo "5. TypeScript Wrapper"
echo "   ---------------------"
if [ -f "backend/src/services/yolo.ts" ]; then
    echo -e "   ${GREEN}✓${NC} yolo.ts exists"
else
    echo -e "   ${RED}✗${NC} yolo.ts not found"
    echo "      Fix: Check backend/src/services/ directory"
fi

# Check trained model
echo ""
echo "6. Trained YOLOv8 Model"
echo "   ---------------------"
MODEL_PATH="yolo-training/runs/detect/pill_detection/weights/best.pt"
if [ -f "$MODEL_PATH" ]; then
    SIZE=$(du -h "$MODEL_PATH" | cut -f1)
    echo -e "   ${GREEN}✓${NC} Model exists: $SIZE"
else
    echo -e "   ${YELLOW}⚠${NC}  Model not trained yet"
    echo "      Next: Train using YOLO_QUICK_START.md"
fi

# Check dataset folder
echo ""
echo "7. Training Dataset"
echo "   ---------------------"
if [ -d "yolo-training/dataset" ]; then
    if [ -f "yolo-training/dataset/data.yaml" ]; then
        echo -e "   ${GREEN}✓${NC} Dataset ready"
        echo "      $(find yolo-training/dataset -name '*.jpg' -o -name '*.png' | wc -l | xargs) images found"
    else
        echo -e "   ${YELLOW}⚠${NC}  Dataset folder exists but data.yaml missing"
        echo "      Next: Download from Roboflow"
    fi
else
    echo -e "   ${YELLOW}⚠${NC}  Dataset not downloaded yet"
    echo "      Next: Generate images → Label in Roboflow → Download"
fi

# Check backend dependencies
echo ""
echo "8. Backend Dependencies"
echo "   ---------------------"
if [ -f "backend/package.json" ]; then
    echo -e "   ${GREEN}✓${NC} package.json exists"
    if [ -d "backend/node_modules" ]; then
        echo -e "   ${GREEN}✓${NC} node_modules installed"
    else
        echo -e "   ${RED}✗${NC} node_modules missing"
        echo "      Fix: cd backend && npm install"
    fi
else
    echo -e "   ${RED}✗${NC} backend/package.json not found"
fi

# Check frontend dependencies
echo ""
echo "9. Frontend Dependencies"
echo "   ---------------------"
if [ -f "frontend/package.json" ]; then
    echo -e "   ${GREEN}✓${NC} package.json exists"
    if [ -d "frontend/node_modules" ]; then
        echo -e "   ${GREEN}✓${NC} node_modules installed"
    else
        echo -e "   ${RED}✗${NC} node_modules missing"
        echo "      Fix: cd frontend && npm install"
    fi
else
    echo -e "   ${RED}✗${NC} frontend/package.json not found"
fi

# Check .env files
echo ""
echo "10. Environment Variables"
echo "    ---------------------"
if [ -f "backend/.env" ]; then
    echo -e "   ${GREEN}✓${NC} backend/.env exists"
    
    # Check critical keys
    if grep -q "ANTHROPIC_API_KEY" backend/.env; then
        echo -e "   ${GREEN}✓${NC} ANTHROPIC_API_KEY set"
    else
        echo -e "   ${RED}✗${NC} ANTHROPIC_API_KEY missing"
    fi
    
    if grep -q "OPENAI_API_KEY" backend/.env; then
        echo -e "   ${GREEN}✓${NC} OPENAI_API_KEY set"
    else
        echo -e "   ${YELLOW}⚠${NC}  OPENAI_API_KEY missing (needed for Whisper)"
    fi
else
    echo -e "   ${RED}✗${NC} backend/.env not found"
    echo "      Fix: Copy .env.example to .env and add keys"
fi

# Summary
echo ""
echo "=================================="
echo "📊 INTEGRATION SUMMARY"
echo "=================================="

echo ""
echo "Ready to start:"
echo "  cd backend && npm run dev"
echo "  cd frontend && npm run dev"
echo ""

if [ -f "$MODEL_PATH" ]; then
    echo -e "${GREEN}✅ YOLOv8 integration complete!${NC}"
    echo "   Test: curl -X POST http://localhost:5001/api/pill-check -F 'image=@test.jpg'"
else
    echo -e "${YELLOW}⏳ YOLOv8 model pending${NC}"
    echo "   Next: Train model using YOLO_QUICK_START.md"
    echo "   Fallback: Claude Vision will be used automatically"
fi

echo ""
echo "🐾 Check complete!"
