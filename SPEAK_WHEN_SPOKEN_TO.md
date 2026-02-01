# GENI Philosophy: "Speak Only When Spoken To"

**Date:** January 31, 2026  
**Core Principle:** Voice in → Voice out. Button click → Text only.

---

## The Rule

**GENI speaks ONLY when the user speaks to it via voice.**

### ✅ When GENI Speaks:
1. User used voice input → GENI responds with voice
2. User said "check my pills" → GENI speaks the result
3. Voice-related errors (mic permission, transcription failed)

### ❌ When GENI Stays Silent:
1. User clicked "Check Pills" button → Text only (user is looking)
2. User is reading chat → No redundant audio
3. Any button/click interaction → Text only

---

## Why This Matters

### 1. **Natural Interaction**
```
Voice conversation:
User: [Speaks] "Check my pills"
GENI: [Speaks back] "I can see your pills are ready"
```

```
Visual interaction:
User: [Clicks button while looking at screen]
GENI: [Shows text] "I can see your pills are ready"
      [NO audio - user is reading]
```

### 2. **Reduced Latency**
- Text appears instantly
- Audio generation happens in background (only if needed)
- No waiting for TTS when user doesn't need it

### 3. **Better User Experience**
- No talking over the user
- No redundant audio when user is reading
- Respects the user's attention state

---

## Implementation Details

### Flag
```typescript
const [speakOnlyWhenSpokenTo, setSpeakOnlyWhenSpokenTo] = useState(true);
```

### Context Tracking
```typescript
const handleCheckPills = async (triggeredByVoice: boolean = false) => {
  // Track whether this interaction came from voice or button
  const resultMessage: Message = {
    sender: 'geni',
    text: responseText,
    wasSpoken: triggeredByVoice
  };
  
  // RULE: Speak only when spoken to
  if (speakOnlyWhenSpokenTo && triggeredByVoice) {
    speak(resultMessage.text);
  }
}
```

---

## User Flows

### Flow 1: Voice Interaction ✅ Speaks

```
1. User taps microphone
2. User speaks: "Check my pills"
3. GENI transcribes: "Check my pills"
4. GENI detects pill check command
5. Camera captures image
6. GENI analyzes with vision API
7. GENI shows text: "I can see your pills are ready"
8. GENI speaks: "I can see your pills are ready" ✅
9. Shows "Listen Again" button
```

**Reasoning:** User used voice input, so they're not looking at the screen. GENI needs to speak the response.

---

### Flow 2: Button Click ❌ No Speech

```
1. User clicks "Check Pills" button (while looking at screen)
2. GENI shows text: "Let me check your pills for you..."
3. Camera captures image
4. GENI analyzes with vision API
5. GENI shows text: "I can see your pills are ready"
6. NO audio ❌
7. No "Listen Again" button
```

**Reasoning:** User is looking at the screen (they clicked a button). Text is sufficient, no need for audio.

---

## Exceptions (Always Speak)

### Exception 1: Voice-Related Errors
```typescript
// User tried to use voice but got an error
const errorMessage = {
  text: 'Sorry, I had trouble hearing you. Could you try again?',
  wasSpoken: true
};
speak(errorMessage.text); // Always speak - user is expecting voice response
```

### Exception 2: Microphone Permission
```typescript
// User tried to use mic but permission denied
const errorMessage = {
  text: 'I need microphone access to hear you.',
  wasSpoken: true
};
speak(errorMessage.text); // Always speak - they're trying to use voice
```

### Exception 3: Proactive Alerts (Future)
```typescript
// GENI proactively alerts about missed medication
// User might not be looking at screen
speak("It's time for your medication"); // Proactive = speak
```

---

## Code Comments

Every place where speech decisions are made has comments:

```typescript
// RULE: Speak only when spoken to
// If user used voice → respond with voice
// If user clicked button → respond with text only
if (speakOnlyWhenSpokenTo && triggeredByVoice) {
  speak(resultMessage.text);
}
```

---

## UI Indicators

### "Listen Again" Button
Only shown for messages that were spoken:

```typescript
{message.sender === 'geni' && message.wasSpoken && (
  <button onClick={() => speak(message.text)}>
    <Volume2 size={12} />
    Listen again
  </button>
)}
```

**Why:** If a message wasn't spoken the first time, there's no reason to offer "Listen again"

---

## Benefits

### For Users:
- ✅ Natural conversation when using voice
- ✅ Silent, text-based interaction when clicking
- ✅ No waiting for TTS when not needed
- ✅ No redundant audio

### For System:
- ✅ Reduced ElevenLabs API calls (save costs)
- ✅ Lower bandwidth usage
- ✅ Faster perceived response time
- ✅ Better accessibility (respects interaction mode)

---

## Testing

### Test 1: Voice Input → Voice Output
```
1. Tap microphone
2. Say anything
3. Verify: GENI speaks response ✅
4. Verify: "Listen Again" button present ✅
```

### Test 2: Button Click → Text Only
```
1. Click "Check Pills" button
2. Verify: Text appears ✅
3. Verify: NO audio ✅
4. Verify: NO "Listen Again" button ✅
```

### Test 3: Voice Command → Voice Response
```
1. Tap microphone
2. Say "Check my pills"
3. Verify: GENI speaks result ✅
4. Verify: "Listen Again" button present ✅
```

---

## Future Enhancements

### 1. Screen State Detection
```typescript
// Detect if screen is off or device is locked
if (document.hidden || screenLocked) {
  // Always speak when screen is off
  alwaysSpeak = true;
}
```

### 2. Distance Detection
```typescript
// Use camera to detect distance
if (userDistanceFromScreen > 3feet) {
  // User is far away, always speak
  alwaysSpeak = true;
}
```

### 3. User Preference
```typescript
// Let user toggle mode
<Toggle>
  Always speak mode: {alwaysSpeakMode ? 'ON' : 'OFF'}
</Toggle>
```

---

## Summary

**Core Philosophy:**
> "Speak only when spoken to"

**Implementation:**
> Voice in → Voice out  
> Button click → Text only

**Result:**
> Natural, context-aware interaction that respects the user's attention state

**Code Location:**
> `frontend/src/components/chat/ChatInterface.tsx`

**Flag:**
> `speakOnlyWhenSpokenTo = true` (default)

---

✅ **GENI now behaves like a respectful companion, not a chatty robot.**
