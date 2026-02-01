#!/bin/bash

# Auto-deploy script - watches for trained model and deploys automatically

echo "🔍 Monitoring for trained model..."
echo "Watching Downloads folder for: best.pt or geni_pill_model.zip"
echo ""

while true; do
    # Check for downloaded model
    if [ -f ~/Downloads/best.pt ]; then
        echo "✅ Found best.pt in Downloads!"
        
        # Move to GENI directory
        echo "📦 Moving model to GENI..."
        mv ~/Downloads/best.pt ~/Desktop/GENI/
        
        # Run deployment
        echo "🚀 Deploying model..."
        cd ~/Desktop/GENI
        ./DEPLOY_MODEL.sh
        
        echo ""
        echo "✅ Model deployed! Now restarting services..."
        echo ""
        
        # Kill existing processes
        echo "🛑 Stopping existing services..."
        lsof -ti:5001 | xargs kill -9 2>/dev/null
        lsof -ti:3000 | xargs kill -9 2>/dev/null
        sleep 2
        
        # Start backend
        echo "🔧 Starting backend..."
        cd ~/Desktop/GENI/backend
        npm run dev > ~/Desktop/GENI/backend.log 2>&1 &
        BACKEND_PID=$!
        echo "Backend PID: $BACKEND_PID"
        sleep 3
        
        # Start frontend
        echo "🎨 Starting frontend..."
        cd ~/Desktop/GENI/frontend
        npm run dev > ~/Desktop/GENI/frontend.log 2>&1 &
        FRONTEND_PID=$!
        echo "Frontend PID: $FRONTEND_PID"
        sleep 3
        
        echo ""
        echo "🎉 ALL DONE!"
        echo ""
        echo "✅ Backend: http://localhost:5001 (PID: $BACKEND_PID)"
        echo "✅ Frontend: http://localhost:3000 (PID: $FRONTEND_PID)"
        echo ""
        echo "📊 Logs:"
        echo "  Backend: ~/Desktop/GENI/backend.log"
        echo "  Frontend: ~/Desktop/GENI/frontend.log"
        echo ""
        
        # Open frontend
        echo "🌐 Opening GENI in browser..."
        open "http://localhost:3000"
        
        exit 0
        
    elif [ -f ~/Downloads/geni_pill_model.zip ]; then
        echo "✅ Found geni_pill_model.zip in Downloads!"
        
        # Unzip and extract best.pt
        echo "📦 Extracting model..."
        cd ~/Downloads
        unzip -o geni_pill_model.zip
        
        # Find best.pt (should be in runs/detect/train/weights/)
        if [ -f ~/Downloads/runs/detect/train/weights/best.pt ]; then
            mv ~/Downloads/runs/detect/train/weights/best.pt ~/Desktop/GENI/
            rm -rf ~/Downloads/runs
            rm ~/Downloads/geni_pill_model.zip
            echo "✅ Model extracted!"
            
            # Run deployment
            echo "🚀 Deploying model..."
            cd ~/Desktop/GENI
            ./DEPLOY_MODEL.sh
            
            echo ""
            echo "✅ Model deployed! Now restarting services..."
            echo ""
            
            # Kill existing processes
            echo "🛑 Stopping existing services..."
            lsof -ti:5001 | xargs kill -9 2>/dev/null
            lsof -ti:3000 | xargs kill -9 2>/dev/null
            sleep 2
            
            # Start backend
            echo "🔧 Starting backend..."
            cd ~/Desktop/GENI/backend
            npm run dev > ~/Desktop/GENI/backend.log 2>&1 &
            BACKEND_PID=$!
            echo "Backend PID: $BACKEND_PID"
            sleep 3
            
            # Start frontend
            echo "🎨 Starting frontend..."
            cd ~/Desktop/GENI/frontend
            npm run dev > ~/Desktop/GENI/frontend.log 2>&1 &
            FRONTEND_PID=$!
            echo "Frontend PID: $FRONTEND_PID"
            sleep 3
            
            echo ""
            echo "🎉 ALL DONE!"
            echo ""
            echo "✅ Backend: http://localhost:5001 (PID: $BACKEND_PID)"
            echo "✅ Frontend: http://localhost:3000 (PID: $FRONTEND_PID)"
            echo ""
            echo "📊 Logs:"
            echo "  Backend: ~/Desktop/GENI/backend.log"
            echo "  Frontend: ~/Desktop/GENI/frontend.log"
            echo ""
            
            # Open frontend
            echo "🌐 Opening GENI in browser..."
            open "http://localhost:3000"
            
            exit 0
        else
            echo "❌ Could not find best.pt in extracted files"
            exit 1
        fi
    fi
    
    # Wait 10 seconds before checking again
    sleep 10
done
