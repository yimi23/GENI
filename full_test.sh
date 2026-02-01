#!/bin/bash

echo "🐾 GENI Complete App Test"
echo "========================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TEST_RESULTS=()

# Function to add test result
add_result() {
    TEST_RESULTS+=("$1")
}

echo "${BLUE}📋 PRE-FLIGHT CHECKS${NC}"
echo "-------------------"

# 1. Check .env files
echo ""
echo "1. Environment Variables"
if [ -f "backend/.env" ]; then
    echo -e "   ${GREEN}✓${NC} backend/.env exists"
    
    if grep -q "ANTHROPIC_API_KEY=sk-" backend/.env 2>/dev/null; then
        echo -e "   ${GREEN}✓${NC} ANTHROPIC_API_KEY configured"
        add_result "✓ Anthropic API Key"
    else
        echo -e "   ${RED}✗${NC} ANTHROPIC_API_KEY missing or invalid"
        add_result "✗ Anthropic API Key"
    fi
    
    if grep -q "OPENAI_API_KEY=sk-" backend/.env 2>/dev/null; then
        echo -e "   ${GREEN}✓${NC} OPENAI_API_KEY configured"
        add_result "✓ OpenAI API Key"
    else
        echo -e "   ${YELLOW}⚠${NC}  OPENAI_API_KEY missing (voice features won't work)"
        add_result "⚠ OpenAI API Key"
    fi
    
    if grep -q "TWILIO" backend/.env 2>/dev/null; then
        echo -e "   ${GREEN}✓${NC} Twilio credentials configured"
        add_result "✓ Twilio Config"
    else
        echo -e "   ${YELLOW}⚠${NC}  Twilio not configured (WhatsApp won't work)"
        add_result "⚠ Twilio Config"
    fi
else
    echo -e "   ${RED}✗${NC} backend/.env not found"
    echo "      Fix: cp backend/.env.example backend/.env"
    add_result "✗ Environment Files"
fi

# 2. Check dependencies
echo ""
echo "2. Dependencies"
if [ -d "backend/node_modules" ]; then
    echo -e "   ${GREEN}✓${NC} Backend dependencies installed"
    add_result "✓ Backend Dependencies"
else
    echo -e "   ${RED}✗${NC} Backend dependencies missing"
    echo "      Fix: cd backend && npm install"
    add_result "✗ Backend Dependencies"
fi

if [ -d "frontend/node_modules" ]; then
    echo -e "   ${GREEN}✓${NC} Frontend dependencies installed"
    add_result "✓ Frontend Dependencies"
else
    echo -e "   ${RED}✗${NC} Frontend dependencies missing"
    echo "      Fix: cd frontend && npm install"
    add_result "✗ Frontend Dependencies"
fi

# 3. Check if servers are running
echo ""
echo "3. Server Status"
if curl -s http://localhost:5001/api/status > /dev/null 2>&1; then
    echo -e "   ${GREEN}✓${NC} Backend running on port 5001"
    add_result "✓ Backend Running"
    BACKEND_RUNNING=true
else
    echo -e "   ${YELLOW}⚠${NC}  Backend not running"
    echo "      Start: cd backend && npm run dev"
    add_result "⚠ Backend Not Running"
    BACKEND_RUNNING=false
fi

if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "   ${GREEN}✓${NC} Frontend running on port 5173"
    add_result "✓ Frontend Running"
    FRONTEND_RUNNING=true
else
    echo -e "   ${YELLOW}⚠${NC}  Frontend not running"
    echo "      Start: cd frontend && npm run dev"
    add_result "⚠ Frontend Not Running"
    FRONTEND_RUNNING=false
fi

# 4. Test API endpoints if backend is running
if [ "$BACKEND_RUNNING" = true ]; then
    echo ""
    echo "${BLUE}🔌 API ENDPOINT TESTS${NC}"
    echo "--------------------"
    
    # Status endpoint
    echo ""
    echo "Testing /api/status..."
    STATUS_RESPONSE=$(curl -s http://localhost:5001/api/status)
    if echo "$STATUS_RESPONSE" | grep -q "online"; then
        echo -e "   ${GREEN}✓${NC} Status endpoint working"
        echo "      Response: $STATUS_RESPONSE"
        add_result "✓ Status API"
    else
        echo -e "   ${RED}✗${NC} Status endpoint failed"
        add_result "✗ Status API"
    fi
    
    # Chat endpoint
    echo ""
    echo "Testing /api/chat..."
    CHAT_RESPONSE=$(curl -s -X POST http://localhost:5001/api/chat \
        -H "Content-Type: application/json" \
        -d '{"message":"Hello GENI, this is a test"}')
    
    if echo "$CHAT_RESPONSE" | grep -q "response"; then
        echo -e "   ${GREEN}✓${NC} Chat endpoint working"
        RESPONSE_TEXT=$(echo "$CHAT_RESPONSE" | grep -o '"response":"[^"]*"' | cut -d'"' -f4)
        echo "      GENI said: ${RESPONSE_TEXT:0:100}..."
        add_result "✓ Chat API"
    else
        echo -e "   ${RED}✗${NC} Chat endpoint failed"
        echo "      Response: $CHAT_RESPONSE"
        add_result "✗ Chat API"
    fi
    
    # Medication history
    echo ""
    echo "Testing /api/medication/history..."
    MED_RESPONSE=$(curl -s http://localhost:5001/api/medication/history)
    if echo "$MED_RESPONSE" | grep -q "history"; then
        echo -e "   ${GREEN}✓${NC} Medication history working"
        add_result "✓ Medication API"
    else
        echo -e "   ${RED}✗${NC} Medication history failed"
        add_result "✗ Medication API"
    fi
    
    # Emergency endpoint
    echo ""
    echo "Testing /api/emergency..."
    EMERGENCY_RESPONSE=$(curl -s -X POST http://localhost:5001/api/emergency \
        -H "Content-Type: application/json" \
        -d '{"message":"Test emergency alert","sendWhatsApp":false}')
    
    if echo "$EMERGENCY_RESPONSE" | grep -q "success"; then
        echo -e "   ${GREEN}✓${NC} Emergency endpoint working"
        add_result "✓ Emergency API"
    else
        echo -e "   ${YELLOW}⚠${NC}  Emergency endpoint response unclear"
        echo "      Response: $EMERGENCY_RESPONSE"
        add_result "⚠ Emergency API"
    fi
fi

# 5. Frontend tests
if [ "$FRONTEND_RUNNING" = true ]; then
    echo ""
    echo "${BLUE}🎨 FRONTEND TESTS${NC}"
    echo "----------------"
    
    echo ""
    echo "Checking frontend files..."
    
    if [ -f "frontend/src/App.tsx" ]; then
        echo -e "   ${GREEN}✓${NC} App.tsx exists"
        add_result "✓ Frontend Files"
    fi
    
    if [ -f "frontend/src/components/chat/ChatInterface.tsx" ]; then
        echo -e "   ${GREEN}✓${NC} ChatInterface.tsx exists"
    fi
    
    if [ -f "frontend/src/services/api.ts" ]; then
        echo -e "   ${GREEN}✓${NC} API service exists"
    fi
    
    if [ -f "frontend/src/services/socket.ts" ]; then
        echo -e "   ${GREEN}✓${NC} Socket service exists"
    fi
fi

# 6. YOLOv8 Integration check
echo ""
echo "${BLUE}🎯 YOLO INTEGRATION${NC}"
echo "------------------"

if python3 -c "from ultralytics import YOLO" 2>/dev/null; then
    echo -e "   ${GREEN}✓${NC} YOLOv8 (ultralytics) installed"
    add_result "✓ YOLOv8 Installed"
else
    echo -e "   ${YELLOW}⚠${NC}  YOLOv8 not installed (optional)"
    echo "      Install: ./install_yolo.sh"
    add_result "⚠ YOLOv8 Not Installed"
fi

if [ -f "backend/src/services/yolo_detector.py" ]; then
    echo -e "   ${GREEN}✓${NC} YOLO detector service exists"
fi

if [ -f "backend/src/services/yolo.ts" ]; then
    echo -e "   ${GREEN}✓${NC} YOLO TypeScript wrapper exists"
fi

MODEL_PATH="yolo-training/runs/detect/pill_detection/weights/best.pt"
if [ -f "$MODEL_PATH" ]; then
    echo -e "   ${GREEN}✓${NC} Trained model found"
    add_result "✓ YOLO Model Trained"
else
    echo -e "   ${YELLOW}⚠${NC}  Model not trained (will use Claude Vision fallback)"
    add_result "⚠ YOLO Model Pending"
fi

# Summary
echo ""
echo "========================="
echo "${BLUE}📊 TEST SUMMARY${NC}"
echo "========================="
echo ""

PASSED=0
WARNED=0
FAILED=0

for result in "${TEST_RESULTS[@]}"; do
    echo "  $result"
    if [[ $result == *"✓"* ]]; then
        ((PASSED++))
    elif [[ $result == *"⚠"* ]]; then
        ((WARNED++))
    else
        ((FAILED++))
    fi
done

echo ""
echo "Results: ${GREEN}$PASSED passed${NC}, ${YELLOW}$WARNED warnings${NC}, ${RED}$FAILED failed${NC}"
echo ""

# Next steps
echo "========================="
echo "${BLUE}🚀 NEXT STEPS${NC}"
echo "========================="
echo ""

if [ "$BACKEND_RUNNING" = false ]; then
    echo "1. Start backend:"
    echo "   cd backend && npm run dev"
    echo ""
fi

if [ "$FRONTEND_RUNNING" = false ]; then
    echo "2. Start frontend:"
    echo "   cd frontend && npm run dev"
    echo ""
fi

if [ "$BACKEND_RUNNING" = true ] && [ "$FRONTEND_RUNNING" = true ]; then
    echo "✅ Both servers running!"
    echo ""
    echo "Test in browser:"
    echo "  http://localhost:5173"
    echo ""
    echo "Features to test manually:"
    echo "  ✓ Type message → GENI responds"
    echo "  ✓ Click microphone → Voice input"
    echo "  ✓ GENI speaks responses"
    echo "  ✓ Dashboard shows activities"
    echo "  ✓ Check Pills button (camera)"
    echo "  ✓ Emergency button"
    echo ""
fi

echo "Full documentation:"
echo "  - INTEGRATION_COMPLETE.md (what's ready)"
echo "  - TEST_YOLO_INTEGRATION.md (YOLO testing)"
echo "  - DEMO_GUIDE.md (how to present)"
echo ""

echo "🐾 Test complete!"
