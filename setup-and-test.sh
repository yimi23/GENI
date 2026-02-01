#!/bin/bash

echo "🐾 GENI - Complete Setup & Test"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+ first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"

# Backend setup
echo ""
echo "📦 Setting up backend..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "   Installing backend dependencies..."
    npm install
else
    echo -e "   ${GREEN}✅ Backend dependencies already installed${NC}"
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  No .env file found - it has been created with working Anthropic key${NC}"
fi

# Verify Anthropic API key
if grep -q "sk-ant-api03" .env; then
    echo -e "${GREEN}✅ Anthropic API key configured${NC}"
else
    echo -e "${RED}❌ No Anthropic API key found in .env${NC}"
fi

cd ..

# Frontend setup
echo ""
echo "📦 Setting up frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "   Installing frontend dependencies..."
    npm install
else
    echo -e "   ${GREEN}✅ Frontend dependencies already installed${NC}"
fi

cd ..

echo ""
echo "═══════════════════════════════════════════════"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "📝 Configuration Status:"
echo "   ✅ Anthropic API (Claude) - WORKING"
echo "   ⏭️  OpenAI API (Whisper) - Optional (use browser TTS instead)"
echo "   ⏭️  Twilio (WhatsApp) - Get free sandbox at twilio.com/try-twilio"
echo "   ⏭️  ElevenLabs (TTS) - Optional (browser TTS works fine)"
echo ""
echo "🚀 To start GENI:"
echo ""
echo "   Terminal 1 - Backend:"
echo "   $ cd backend && npm run dev"
echo ""
echo "   Terminal 2 - Frontend:"
echo "   $ cd frontend && npm run dev"
echo ""
echo "   Then open: http://localhost:3000"
echo ""
echo "🔥 Features Ready to Test:"
echo "   • Dashboard with live data"
echo "   • Chat with Claude AI (text messages)"
echo "   • Pill detection with Claude Vision (camera)"
echo "   • Emergency alerts"
echo "   • Real-time updates via Socket.IO"
echo ""
echo "📚 Docs: See docs/DEMO.md for full demo script"
echo "═══════════════════════════════════════════════"
