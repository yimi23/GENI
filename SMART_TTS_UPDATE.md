# Smart TTS Decision Making - Context-Aware Speech

**Date:** January 31, 2026  
**Issue:** Speech latency + redundant audio when user is reading screen

---

## Problem

1. **Redundant Audio:** If user is reading chat, no need to speak
2. **Speech Latency:** ElevenLabs takes 2-3 seconds to generate audio
3. **Poor UX:** Waiting for audio before showing text response

---

## Solution: Context-Aware Speech

### Rule: Voice In → Voice Out

**When to speak:**
- ✅ User used voice input → Speak response (they're not looking at screen)
- ✅ Proactive alerts/reminders → Speak (user might not be looking)
- ✅ Errors during voice interaction → Speak

**When NOT to speak:**
- ❌ User clicked button → Don't speak (they're looking at screen)
- ❌ User is reading chat → Don't speak (they can see the text)

---

## Implementation

### Added Context Tracking

```typescript
const [lastInteractionWasVoice, setLastInteractionWasVoice] = useState(false);

interface Message {
  sender: 'geni' | 'user';
  text: string;
  time: string;
  wasSpoken?: boolean; // Track if this message was spoken
}
```

### Smart Pill Detection

```typescript
const handleCheckPills = async (triggeredByVoice: boolean = false) => {
  const resultMessage: Message = {
    sender: 'geni',
    text: responseText,
    time: getCurrentTime(),
    wasSpoken: triggeredByVoice // Only mark as spoken if voice-triggered
  };
  
  // Only speak if interaction was voice-based
  if (triggeredByVoice) {
    speak(resultMessage.text);
  }
}
```

### Voice Command Flow

```typescript
// User says "check my pills"
const transcription = result.transcription.toLowerCase();
if (transcription.includes('check') && transcription.includes('pill')) {
  handleCheckPills(true); // Pass true = triggered by voice
}
```

### Button Click Flow

```typescript
// User clicks "Check Pills" button
<button onClick={() => handleCheckPills(false)}>
  // Pass false = triggered by click, don't speak
</button>
```

### UI Updates

```typescript
// Only show "Listen Again" button if message was spoken
{message.sender === 'geni' && message.wasSpoken && (
  <button onClick={() => speak(message.text)}>
    <Volume2 size={12} />
    Listen again
  </button>
)}
```

---

## User Experience

### Scenario 1: Voice Interaction

```
User: [Taps mic] "Check my pills"
GENI: [Shows in chat] "Let me check your pills for you..."
      [Analyzes camera]
      [Shows in chat] "I can see your pills are ready. Don't forget to take them!"
      [Speaks out loud] "I can see your pills are ready. Don't forget to take them!"
      [Shows "Listen again" button]
```

**Result:** User gets spoken response because they used voice input

---

### Scenario 2: Button Interaction

```
User: [Clicks "Check Pills" button while looking at screen]
GENI: [Shows in chat] "Let me check your pills for you..."
      [Analyzes camera]
      [Shows in chat] "I can see your pills are ready. Don't forget to take them!"
      [NO audio - user is reading]
      [NO "Listen again" button]
```

**Result:** User reads response on screen, no redundant audio

---

## Benefits

### 1. Reduced Latency
- Text shows immediately
- Audio generation happens in background (if needed)
- User doesn't wait for TTS

### 2. Better UX
- No redundant audio when user is looking at screen
- Natural conversation flow
- Voice in → Voice out (consistent interaction model)

### 3. Bandwidth Savings
- Don't generate ElevenLabs audio unnecessarily
- Save API calls for when they matter

### 4. Accessibility
- Voice users get spoken responses
- Visual users get text responses
- Best of both worlds

---

## Code Changes

### Files Modified:
```
frontend/src/components/chat/ChatInterface.tsx
+ Added lastInteractionWasVoice state
+ Added wasSpoken property to Message interface
+ Updated handleCheckPills to accept triggeredByVoice parameter
+ Updated handleVoiceToggle to set context flags
+ Updated UI to only show "Listen again" for spoken messages
```

---

## Testing

### Test Voice → Voice
1. Tap microphone
2. Say "Check my pills"
3. **Expect:** Response appears in chat AND is spoken out loud
4. **Expect:** "Listen again" button visible

### Test Button → Text
1. Click "Check Pills" button
2. **Expect:** Response appears in chat
3. **Expect:** NO audio plays
4. **Expect:** NO "Listen again" button

### Test Voice → Voice (General)
1. Tap microphone
2. Say "What medications do I have today?"
3. **Expect:** Response appears in chat AND is spoken out loud
4. **Expect:** "Listen again" button visible

---

## Future Enhancements

### Screen State Detection
Could detect if screen is off or user is far away:
```typescript
// Use Page Visibility API
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Screen off → Always speak
    setAlwaysSpeak(true);
  }
});
```

### Distance Detection
Could use camera to detect if user is near screen:
```typescript
// If user is >3 feet away → Speak
// If user is close → Don't speak
```

### User Preference
Could let user toggle "Always speak" mode:
```typescript
const [alwaysSpeakMode, setAlwaysSpeakMode] = useState(false);
```

---

## Summary

**Before:**
- Every response triggered audio
- Speech latency blocked UI
- Redundant audio when user reading

**After:**
- Smart context detection
- Voice in → Voice out
- Button click → Text only
- No latency, better UX

✅ **Context-aware speech = Better user experience**
