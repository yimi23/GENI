#!/bin/bash

echo "🐾 GENI - Verification Check"
echo "=============================="
echo ""

# Check structure
echo "📁 Checking file structure..."

if [ -f ".env" ]; then
    echo "  ✅ .env exists at root"
else
    echo "  ❌ .env missing"
    exit 1
fi

if [ -d "frontend/src/components/dashboard" ]; then
    echo "  ✅ Frontend components (Logo samples) in place"
else
    echo "  ❌ Frontend components missing"
    exit 1
fi

if [ -d "backend/src/routes" ]; then
    echo "  ✅ Backend routes exist"
else
    echo "  ❌ Backend routes missing"
    exit 1
fi

echo ""
echo "🔑 Checking API keys..."

if grep -q "sk-ant-api03-Nd7cNN" .env 2>/dev/null; then
    echo "  ✅ Anthropic API key configured"
else
    echo "  ❌ Anthropic API key missing"
    exit 1
fi

if grep -q "sk-svcacct-zuUv" .env 2>/dev/null; then
    echo "  ✅ OpenAI API key configured"
else
    echo "  ❌ OpenAI API key missing"
    exit 1
fi

echo ""
echo "📦 Checking dependencies..."

if [ -d "backend/node_modules" ]; then
    echo "  ✅ Backend dependencies installed"
else
    echo "  ⚠️  Backend dependencies not installed (run: cd backend && npm install)"
fi

if [ -d "frontend/node_modules" ]; then
    echo "  ✅ Frontend dependencies installed"
else
    echo "  ⚠️  Frontend dependencies not installed (run: cd frontend && npm install)"
fi

echo ""
echo "📊 File counts..."
echo "  - TypeScript files: $(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | wc -l | tr -d ' ')"
echo "  - Backend routes: $(ls -1 backend/src/routes/*.ts 2>/dev/null | wc -l | tr -d ' ')"
echo "  - Frontend components: $(find frontend/src/components -type f -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')"

echo ""
echo "═══════════════════════════════════════"
echo "✅ GENI is ready!"
echo ""
echo "To start:"
echo "  1. cd backend && npm run dev"
echo "  2. cd frontend && npm run dev"
echo "  3. Open http://localhost:3000"
echo "═══════════════════════════════════════"
