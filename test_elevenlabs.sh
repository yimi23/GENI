#!/bin/bash
# Test ElevenLabs TTS Integration

echo "╔════════════════════════════════════════════════════════╗"
echo "║                                                        ║"
echo "║     🔊 ElevenLabs TTS Integration Test               ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Load API key from .env
if [ -f .env ]; then
  export $(cat .env | grep ELEVENLABS_API_KEY | xargs)
  export $(cat .env | grep ELEVENLABS_VOICE_ID | xargs)
else
  echo "❌ .env file not found"
  exit 1
fi

if [ -z "$ELEVENLABS_API_KEY" ]; then
  echo "❌ ELEVENLABS_API_KEY not set in .env"
  exit 1
fi

echo "📋 API Key: ${ELEVENLABS_API_KEY:0:15}...${ELEVENLABS_API_KEY: -5}"
echo "🎤 Voice ID: $ELEVENLABS_VOICE_ID"
echo ""

# Test 1: User endpoint (verify key is valid)
echo "1️⃣  Testing API Key Validity..."
USER_RESPONSE=$(curl -s "https://api.elevenlabs.io/v1/user" \
  -H "xi-api-key: $ELEVENLABS_API_KEY")

if echo "$USER_RESPONSE" | grep -q "missing_permissions"; then
  echo "   ❌ FAIL - API key missing permissions"
  echo "   Error: $(echo $USER_RESPONSE | jq -r '.detail.message' 2>/dev/null || echo $USER_RESPONSE)"
  echo ""
  echo "🔧 FIX REQUIRED:"
  echo "   1. Go to https://elevenlabs.io/app/settings"
  echo "   2. Generate new API key with 'text_to_speech' permission"
  echo "   3. Update .env file with new key"
  echo ""
  exit 1
elif echo "$USER_RESPONSE" | grep -q "subscription"; then
  echo "   ✅ PASS - API key is valid"
  CHARS_LEFT=$(echo $USER_RESPONSE | jq -r '.subscription.character_count' 2>/dev/null || echo "N/A")
  CHARS_LIMIT=$(echo $USER_RESPONSE | jq -r '.subscription.character_limit' 2>/dev/null || echo "N/A")
  echo "   📊 Characters: $CHARS_LEFT / $CHARS_LIMIT"
else
  echo "   ⚠️  Unexpected response:"
  echo "   $USER_RESPONSE"
  exit 1
fi
echo ""

# Test 2: Voices endpoint (verify we can read voices)
echo "2️⃣  Testing Voices Access..."
VOICES_RESPONSE=$(curl -s "https://api.elevenlabs.io/v1/voices" \
  -H "xi-api-key: $ELEVENLABS_API_KEY")

if echo "$VOICES_RESPONSE" | grep -q "missing_permissions"; then
  echo "   ❌ FAIL - Cannot read voices"
  echo "   Warning: API works but can't list voices"
else
  echo "   ✅ PASS - Can read voices"
  VOICE_COUNT=$(echo $VOICES_RESPONSE | jq '.voices | length' 2>/dev/null || echo "0")
  echo "   🎤 Available voices: $VOICE_COUNT"
fi
echo ""

# Test 3: Text-to-speech (the main feature)
echo "3️⃣  Testing Text-to-Speech Generation..."
TTS_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X POST "https://api.elevenlabs.io/v1/text-to-speech/$ELEVENLABS_VOICE_ID" \
  -H "Accept: audio/mpeg" \
  -H "Content-Type: application/json" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -d '{
    "text": "Hello, this is GENI testing the ElevenLabs voice integration.",
    "model_id": "eleven_turbo_v2_5",
    "voice_settings": {
      "stability": 0.5,
      "similarity_boost": 0.8
    }
  }')

HTTP_CODE=$(echo "$TTS_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
TTS_BODY=$(echo "$TTS_RESPONSE" | sed '/HTTP_CODE:/d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✅ PASS - TTS generated successfully"
  
  # Save audio to file
  echo "$TTS_BODY" > test_geni_voice.mp3
  FILESIZE=$(wc -c < test_geni_voice.mp3 | tr -d ' ')
  
  if [ "$FILESIZE" -gt 1000 ]; then
    echo "   🎵 Audio file created: test_geni_voice.mp3 ($FILESIZE bytes)"
    echo "   ▶️  Play it: open test_geni_voice.mp3"
  else
    echo "   ⚠️  Audio file suspiciously small: $FILESIZE bytes"
    cat test_geni_voice.mp3
  fi
else
  echo "   ❌ FAIL - TTS generation failed (HTTP $HTTP_CODE)"
  
  if echo "$TTS_BODY" | grep -q "missing_permissions"; then
    echo "   Error: API key missing text_to_speech permission"
    echo ""
    echo "🔧 FIX REQUIRED:"
    echo "   1. Go to https://elevenlabs.io/app/settings"
    echo "   2. Generate new API key with ALL permissions checked"
    echo "   3. Update ELEVENLABS_API_KEY in .env"
  else
    echo "   Error details:"
    echo "$TTS_BODY" | jq '.' 2>/dev/null || echo "$TTS_BODY"
  fi
  exit 1
fi
echo ""

# Test 4: Backend endpoint (full integration test)
echo "4️⃣  Testing GENI Backend TTS Endpoint..."

if ! curl -s http://localhost:5001/health > /dev/null 2>&1; then
  echo "   ⚠️  Backend not running (skip this test)"
  echo "   Start backend: cd backend && npm run dev"
  echo ""
else
  curl -s -X POST http://localhost:5001/api/tts \
    -H "Content-Type: application/json" \
    -d '{"text": "Backend TTS test successful"}' \
    --output test_backend_tts.mp3 \
    --write-out "   HTTP %{http_code}\n"
  
  if [ -f test_backend_tts.mp3 ]; then
    BACKEND_SIZE=$(wc -c < test_backend_tts.mp3 | tr -d ' ')
    if [ "$BACKEND_SIZE" -gt 1000 ]; then
      echo "   ✅ PASS - Backend TTS working ($BACKEND_SIZE bytes)"
      echo "   🎵 Audio: test_backend_tts.mp3"
    else
      echo "   ❌ FAIL - Backend returned error"
      cat test_backend_tts.mp3
    fi
  fi
fi
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════╗"
echo "║                    TEST SUMMARY                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
  echo "🎉 SUCCESS - ElevenLabs TTS is working!"
  echo ""
  echo "✅ API key valid"
  echo "✅ Text-to-speech permission granted"
  echo "✅ Audio generated successfully"
  echo ""
  echo "🎵 Test audio files created:"
  echo "   - test_geni_voice.mp3 (direct API test)"
  if [ -f test_backend_tts.mp3 ]; then
    echo "   - test_backend_tts.mp3 (backend integration test)"
  fi
  echo ""
  echo "▶️  Play test: open test_geni_voice.mp3"
  echo ""
  echo "✅ GENI is now using high-quality ElevenLabs voice!"
  echo "✅ No more crappy laptop TTS!"
  exit 0
else
  echo "❌ FAILED - ElevenLabs TTS not working"
  echo ""
  echo "Common issues:"
  echo "  1. API key revoked or restricted"
  echo "  2. Missing text_to_speech permission"
  echo "  3. Free tier quota exceeded"
  echo ""
  echo "📖 See FIX_ELEVENLABS_TTS.md for detailed fix instructions"
  exit 1
fi
