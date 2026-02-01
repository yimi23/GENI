#!/bin/bash

# Deploy trained YOLO model to GENI backend

set -e

echo "╔════════════════════════════════════════╗"
echo "║                                        ║"
echo "║   🚀 Deploy GENI YOLO Model           ║"
echo "║                                        ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check if model exists in Downloads
if [ -f ~/Downloads/geni_pill_model.zip ]; then
    echo "✅ Found geni_pill_model.zip in Downloads"
    
    # Extract
    echo "📦 Extracting model..."
    cd ~/Downloads
    unzip -o geni_pill_model.zip
    
    # Create models directory in backend
    mkdir -p /Users/yimi/Desktop/GENI/backend/models
    
    # Move model
    echo "📂 Moving model to backend..."
    cp geni_model/run/weights/best.pt /Users/yimi/Desktop/GENI/backend/models/geni_yolo.pt
    
    # Clean up
    rm -rf geni_model geni_pill_model.zip
    
    echo "✅ Model deployed to: /Users/yimi/Desktop/GENI/backend/models/geni_yolo.pt"
    echo ""
    
    # Update yolo.ts to use the model
    echo "🔧 Model is ready to use!"
    echo ""
    echo "📝 To integrate into GENI:"
    echo "   1. Update /backend/src/services/yolo.ts"
    echo "   2. Change model path to: '../models/geni_yolo.pt'"
    echo "   3. Restart backend: npm run dev"
    echo ""
    echo "🎯 GENI will now use YOLO for fast pill detection!"
    
else
    echo "❌ geni_pill_model.zip not found in Downloads"
    echo ""
    echo "📥 Download the model from Google Colab first:"
    echo "   1. After training completes in Colab"
    echo "   2. Look for geni_pill_model.zip in files panel"
    echo "   3. Click ⋮ → Download"
    echo "   4. Run this script again"
    echo ""
fi
