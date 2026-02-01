#!/bin/bash

echo "🐾 GENI Quick Start Script"
echo "=========================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) found"
echo ""

# Backend setup
echo "📦 Installing backend dependencies..."
cd backend
if [ ! -f ".env" ]; then
    echo "⚠️  Creating backend .env file..."
    cp .env.example .env
    echo "   ⚠️  Please edit backend/.env with your API keys!"
fi

if [ ! -d "node_modules" ]; then
    npm install
else
    echo "   ✅ Dependencies already installed"
fi

cd ..
echo ""

# Frontend setup
echo "📦 Installing frontend dependencies..."
cd frontend
if [ ! -f ".env" ]; then
    echo "⚠️  Creating frontend .env file..."
    cp .env.example .env
fi

if [ ! -d "node_modules" ]; then
    npm install
else
    echo "   ✅ Dependencies already installed"
fi

cd ..
echo ""

echo "═══════════════════════════════════════════════"
echo "✅ Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo "   1. Edit backend/.env with your API keys"
echo "   2. Start backend:  cd backend && npm run dev"
echo "   3. Start frontend: cd frontend && npm run dev"
echo "   4. Open browser:   http://localhost:3000"
echo ""
echo "📚 See docs/SETUP.md for detailed instructions"
echo "═══════════════════════════════════════════════"
