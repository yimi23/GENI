# In-Scope Improvements Plan

## Status: Animation Restored ✅
- Added GENI logo as favicon (browser tab icon + mobile app icon)
- Restored full loading animation with particles, glow, and subtitle
- Added Apple mobile web app support

---

## Improvements Ready to Implement

### 1. Health Report SMS (Priority: HIGH)
**Current:** Backend generates daily/weekly health reports
**Missing:** Frontend display + SMS to caregiver

**Implementation:**
- Create daily summary of: medications taken, activities, health observations
- Send SMS to caregiver daily at 8 AM (configurable)
- Frontend: Show "Last Report Sent" timestamp in dashboard
- Format: "GENI Daily Report: Margaret took 3/4 meds. Activities: 2 walks, good appetite"

**Files to create:**
- `backend/src/services/health-report-sms.ts` - Generate + send daily
- `frontend/src/components/ReportStatus.tsx` - Show last report sent

---

### 2. Fall Detection Integration (Already DONE ✅)
**Status:** Backend fall-detection.ts + Socket.io emit → Frontend FallDetectionModal
- Backend: emitFallDetected() triggered by fall-detection service
- Frontend: App.tsx listens, shows FallDetectionModal
- Modal has emergency button → triggers SMS/audio

**No changes needed** - already fully integrated!

---

### 3. Medication Adherence Tracking + SMS Reports
**Current:** Backend tracks `medicationHistory[]` in state
**Missing:** Frontend historical display + weekly adherence SMS

**Implementation:**
- Frontend: New "Adherence History" view (show last 7/30 days)
- Display: % pills taken per day, charts, trends
- SMS: Weekly adherence report (Sundays at 6 PM)
- Format: "GENI Weekly Report: Medication adherence 92% (23/25 pills). Best day: Wed (100%)"

**Files to create:**
- `frontend/src/components/history/AdherenceHistory.tsx` - Show trends
- `backend/src/services/adherence-report-sms.ts` - Weekly SMS

---

### 4. Vision Systems (BOTH coexist)
**Current:** YOLO + Claude Vision API

**Approach:** Keep both running!
- YOLO: Fast real-time skeleton detection (3s confirmation)
- Claude Vision: Smart analysis when called (e.g., "analyze image" button)

**Result:**
- Faster fall detection (YOLO)
- More intelligent observation (Claude)
- No conflicts - run in parallel

---

## Quick Implementation Order

1. ✅ Animation restored
2. **Health Reports SMS** (easiest - reuse existing report logic)
3. **Medication Adherence Display** (reuse medication-history component)
4. **Both run in background** (no user involvement)

---

## Continuous State Issue

The "continuous re-renders" are actually HMR (Hot Module Reload) causing component remounts during development.

**Solution:**
- Refs are working correctly (cameraInitializedRef, micInitializedRef)
- Multiple remounts are normal during HMR
- Production build will not have this issue
- Safe to ignore in dev

---

## Next Steps

Should I implement:
1. **Health Reports SMS** first (high impact, quick to build)?
2. **Medication Adherence tracking** (better UX, show trends)?
3. **Both in parallel** (more work, complete feature)?

