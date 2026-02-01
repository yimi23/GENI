# GENI Continuous Video Monitoring

## Overview
GENI can now continuously monitor medication adherence through periodic camera snapshots and Claude Vision analysis.

## How It Works

### Architecture
```
Camera Feed (Live) 
    ↓
Periodic Snapshots (every 30 seconds)
    ↓
Claude Vision Analysis (trained prompts)
    ↓
GENI Brain (contextual response)
    ↓
Auto-Notifications (when status changes)
```

### Components

**1. `useContinuousMonitoring` Hook** (`/frontend/src/hooks/useContinuousMonitoring.ts`)
- Captures frames from video element
- Rate limiting (min 10 seconds between requests)
- Queue management (won't send if already processing)
- Stores last 10 results for trend analysis

**2. UI Controls** (In ChatInterface)
- **"Start Auto"** button → Begins continuous monitoring
- **"Stop Auto"** button → Stops monitoring
- **Status indicator** → Shows monitoring state & last check time
- **Auto-notifications** → Alerts when pills are taken/replaced

**3. Vision Training**
- Detailed prompts teach Claude what pills look like
- Recognizes compartments, colors, shadows, depth
- Distinguishes "present" vs "taken" vs "unclear"

## Configuration

```typescript
{
  enabled: true,
  intervalSeconds: 30,      // Check every 30 seconds
  minIntervalMs: 10000,     // Min 10 sec between requests (rate limit)
}
```

## Rate Limits & Cost

**Claude Vision API:**
- Rate limit: ~50 requests/min (Tier 2)
- Cost: ~$3 per 1000 images
- Processing time: 1-3 seconds per image

**Continuous Monitoring (30 sec intervals):**
- 2 requests/min = 120 requests/hour
- Cost: ~$0.36/hour or ~$8.64/day
- ✅ Safe from rate limits

## Features

### Auto-Detection
- Automatically detects when pills are taken
- Sends notification: "✅ Great! I just noticed you took your medication."

### Change Tracking
- Monitors 10 most recent results
- Detects status changes (present → taken → present)
- Alerts on unusual patterns

### Rate Limiting
- Enforces minimum 10 seconds between API calls
- Prevents duplicate processing (queue check)
- Protects against API rate limits

### Manual Override
- "Check Now" button still works
- Disabled during auto-monitoring to prevent conflicts
- Stops auto-monitoring if needed

## Usage

### Start Monitoring
```
1. Open GENI chat interface
2. Allow camera permissions
3. Click "Start Auto" button
4. GENI will check every 30 seconds
5. Get notifications when status changes
```

### Stop Monitoring
```
1. Click "Stop Auto" button
2. Monitoring stops immediately
3. Can still use manual "Check Now"
```

## Logo Animation

### Loading Screen
- Beautiful animated GENI logo on app load
- Particles converging into letters
- Gradient effects and pulse animation
- 4.3 second animation before showing main interface

**Files:**
- `/frontend/src/components/GeniLogoAnimation.tsx`
- Uses Framer Motion for smooth animations

## Branding
- **Colors**: Blue gradient (#2563eb → #1e40af → #14b8a6)
- **Font**: Manrope (bold) + Plus Jakarta Sans (subtitle)
- **Tagline**: "Healthcare Assistant"
- **Status**: "READY" with pulsing indicator

## Safety & Reliability

✅ **ElevenLabs TTS** - Bulletproof with validation & fallbacks
✅ **Rate limiting** - Prevents API abuse
✅ **Error handling** - Graceful failures with retries
✅ **Queue management** - No duplicate processing
✅ **Memory efficient** - Only stores last 10 results

## Next Steps

### Potential Improvements:
1. **Motion detection** - Only analyze when movement detected
2. **Fall detection** - Use human detection prompt for safety monitoring
3. **Multi-camera** - Support multiple camera angles
4. **Cloud recording** - Store snapshots for review
5. **Family dashboard** - Real-time monitoring view for caregivers

## Files Modified/Created

### Created:
- `/frontend/src/hooks/useContinuousMonitoring.ts`
- `/frontend/src/components/GeniLogoAnimation.tsx`
- `/backend/src/prompts/humanDetection.ts`
- `CONTINUOUS_MONITORING.md` (this file)

### Modified:
- `/frontend/src/App.tsx` - Added logo animation
- `/frontend/src/components/chat/ChatInterface.tsx` - Integrated monitoring
- `/backend/src/prompts/pillDetection.ts` - Enhanced training
- `/backend/src/services/vision.ts` - Added human detection
- `/backend/src/services/elevenlabs.ts` - Bulletproofed TTS
- `GENI_BRAIN.md` - Updated vision capabilities

## Testing

**Test Scenarios:**
1. ✅ Start auto-monitoring → Should see "Auto Monitoring" indicator
2. ✅ Take pills from organizer → Should get notification within 30 seconds
3. ✅ Replace pills → Should detect and notify
4. ✅ Stop monitoring → Should return to manual mode
5. ✅ Manual check during auto → Button disabled (prevents conflicts)

**Verified:**
- Rate limiting works (min 10 sec between calls)
- No duplicate processing
- UI updates correctly
- Notifications appear in chat
- ElevenLabs TTS works with voice responses
