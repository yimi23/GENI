# ✅ GENI Fix Checklist

**What:** Fix ElevenLabs TTS (5 minutes)  
**Why:** GENI currently uses crappy laptop voice instead of Rachel  
**Priority:** HIGH (you specifically said not to use laptop TTS)

---

## Step-by-Step Checklist

### ☐ Step 1: Get New ElevenLabs API Key

1. [ ] Go to https://elevenlabs.io/app/settings
2. [ ] Log in with your ElevenLabs account
3. [ ] Click "Create API Key" or "Generate New Key"
4. [ ] Select these permissions:
   - [ ] ✅ text_to_speech
   - [ ] ✅ voices_read
   - [ ] ✅ user_read
5. [ ] Copy the new key (starts with `sk_`)
6. [ ] Keep browser tab open (you'll verify in Step 4)

---

### ☐ Step 2: Update GENI .env File

1. [ ] Open Terminal
2. [ ] Run:
   ```bash
   open -e ~/Desktop/GENI/.env
   ```
3. [ ] Find this line:
   ```
   ELEVENLABS_API_KEY=sk_acd12d96729f02d93447bdc658f76874518bf0eb8cf4fb2d
   ```
4. [ ] Replace with your new key from Step 1:
   ```
   ELEVENLABS_API_KEY=sk_paste_your_new_key_here
   ```
5. [ ] Save file (⌘S)
6. [ ] Close editor

---

### ☐ Step 3: Restart GENI Backend

1. [ ] In Terminal, run:
   ```bash
   cd ~/Desktop/GENI/backend
   ```
2. [ ] Kill old backend:
   ```bash
   pkill -f "ts-node src/index.ts"
   ```
3. [ ] Start new backend:
   ```bash
   npm run dev
   ```
4. [ ] Wait for:
   ```
   🐾 GENI Backend Server Running
   Port: 5001
   ```

---

### ☐ Step 4: Test ElevenLabs Integration

1. [ ] In Terminal, run:
   ```bash
   cd ~/Desktop/GENI
   ./test_elevenlabs.sh
   ```
2. [ ] Should see:
   ```
   ✅ API key valid
   ✅ Text-to-speech permission granted
   ✅ Audio generated successfully
   🎵 Test audio: test_geni_voice.mp3
   ```
3. [ ] If you see ❌ errors, go back to Step 1

---

### ☐ Step 5: Listen to Test Audio

1. [ ] In Terminal, run:
   ```bash
   open test_geni_voice.mp3
   ```
2. [ ] Should hear Rachel say:
   > "Hello, this is GENI testing the ElevenLabs voice integration."
3. [ ] Verify it sounds **human and warm** (not robotic)

---

### ☐ Step 6: Test GENI Frontend

1. [ ] Open browser to http://localhost:3000
2. [ ] Type a message to GENI in chat
3. [ ] Click the speaker icon to hear response
4. [ ] Verify you hear **Rachel's voice** (not laptop TTS)
5. [ ] If laptop voice, check browser console for errors

---

### ☐ Step 7: Final Verification

1. [ ] Run full system test:
   ```bash
   cd ~/Desktop/GENI
   ./verify_audit_fix.sh
   ```
2. [ ] Should show:
   ```
   ✅ Tests Passed: 10
   ❌ Tests Failed: 0
   
   🎉 ALL TESTS PASSED - GENI is fully operational!
   ```

---

### ☐ Step 8: Cleanup (After Everything Works)

1. [ ] Delete temporary test files:
   ```bash
   cd ~/Desktop/GENI
   rm test_*.mp3
   ```
2. [ ] Delete fix documentation:
   ```bash
   rm FIX_ELEVENLABS_TTS.md
   rm CRITICAL_TTS_ISSUE.md
   rm ELEVENLABS_STATUS.md
   rm AUDIT_UPDATE_TTS_ISSUE.md
   rm ACTION_REQUIRED_PRAISE.md
   rm CHECKLIST_FOR_PRAISE.md
   ```
3. [ ] Keep audit reports:
   ```bash
   # Keep these files:
   SYSTEM_AUDIT_REPORT.md
   FINAL_AUDIT_SUMMARY.md
   AUDIT_SUMMARY.md
   ```

---

### ☐ Step 9: Update Documentation

1. [ ] Open API_KEYS.md:
   ```bash
   open -e ~/Desktop/GENI/API_KEYS.md
   ```
2. [ ] Update ElevenLabs section with new key
3. [ ] Change status from "Working" to "✅ Working (verified)"
4. [ ] Save and close

---

### ☐ Step 10: Deploy to Users

1. [ ] Test full workflow:
   - [ ] Chat with GENI
   - [ ] Take photo of pill box
   - [ ] Listen to GENI's response (should be Rachel's voice)
2. [ ] If everything works:
   - [ ] ✅ GENI is production ready
   - [ ] ✅ Deploy to beta users
3. [ ] Monitor logs for issues

---

## Quick Troubleshooting

### If test_elevenlabs.sh fails:

**Problem:** API key still shows errors  
**Fix:** Make sure you selected ALL permissions when generating key

**Problem:** "401 missing_permissions"  
**Fix:** Regenerate key with text_to_speech permission checked

**Problem:** Audio file is tiny (<100 bytes)  
**Fix:** Check your ElevenLabs account quota (might be out of free credits)

### If frontend still uses laptop TTS:

**Problem:** Browser cache  
**Fix:** Hard refresh (⌘⇧R on Mac)

**Problem:** Backend didn't restart  
**Fix:** Check if backend is running: `curl http://localhost:5001/health`

**Problem:** .env not reloaded  
**Fix:** Kill backend and restart: `pkill -f ts-node && npm run dev`

---

## Alternative: No ElevenLabs Account Yet?

### Quick Sign-Up (2 minutes):

1. [ ] Go to https://elevenlabs.io/sign-up
2. [ ] Sign up (use email or Google)
3. [ ] Free tier includes:
   - 10,000 characters/month
   - All voices (including Rachel)
   - Full API access
   - $0 cost
4. [ ] After sign-up, go to Settings → API Keys
5. [ ] Generate key
6. [ ] Continue with Step 2 above

---

## Time Estimate

- [ ] If you have ElevenLabs account: **~5 minutes**
- [ ] If you need to sign up: **~7 minutes**

---

## What You'll Get

**Before Fix:**
- ❌ Crappy laptop TTS (robotic)
- ❌ Loses human touch
- ❌ Poor UX for elderly users

**After Fix:**
- ✅ Rachel's warm, natural voice
- ✅ Human-sounding conversation
- ✅ Perfect for elderly care
- ✅ Production ready

---

## Priority

🔴 **HIGH** - This is the ONLY blocker preventing perfect UX

Everything else works. Just need 5 minutes to fix the voice.

---

**Start here: Step 1 (Get new API key)**

**Questions?** Read `CRITICAL_TTS_ISSUE.md` for details.

**Ready?** Let's fix this! 🚀
