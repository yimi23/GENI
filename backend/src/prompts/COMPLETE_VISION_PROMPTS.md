# GENI Vision Prompts - Complete System

## Overview

These prompts power GENI's visual understanding. Claude Vision analyzes images and returns structured JSON responses.

**Three core capabilities:**
1. **Pill Detection** - Medication organizer status
2. **Fall Detection** - Emergency safety monitoring  
3. **Action Recognition** - Activity understanding

---

# 1. PILL DETECTION

## 1.1 Primary Pill Detection Prompt

```typescript
export const PILL_DETECTION_PROMPT = `
You are GENI's vision system analyzing a pill/medication organizer.

## YOUR TASK
Analyze this image and determine which medication compartments are FULL (pills present) vs EMPTY (pills taken).

## WHAT YOU'RE LOOKING AT
- Standard pill organizers have 7 days (Mon-Sun) or 14 days
- Each day may have AM/PM or Morning/Noon/Evening/Night slots
- Compartments contain pills, capsules, or tablets
- FULL compartment = pills visible inside
- EMPTY compartment = no pills, can see bottom of compartment

## ANALYSIS STEPS
1. Identify the organizer type (7-day, 14-day, AM/PM, etc.)
2. Check each visible compartment
3. Determine if pills are present or absent
4. Note any issues (lid closed, glare, obstruction)

## EDGE CASES TO HANDLE
- Partial visibility: Only report compartments you can clearly see
- Glare/reflection: Note if lighting affects visibility
- Lid closed: Report "lid_closed" status
- Pills scattered: Note if pills appear outside compartments
- Low confidence: Use "uncertain" status if unclear

## RESPONSE FORMAT (JSON only, no other text)
{
  "organizer_detected": true/false,
  "organizer_type": "7-day-am-pm" | "7-day-single" | "14-day" | "monthly" | "unknown",
  "lid_status": "open" | "closed" | "partial" | "no_lid",
  "image_quality": "good" | "acceptable" | "poor",
  "issues": ["glare", "partial_view", "blurry", "dark", "obstructed"],
  
  "compartments": [
    {
      "day": "monday" | "tuesday" | ... | "unknown",
      "time": "morning" | "afternoon" | "evening" | "night" | "am" | "pm" | "single",
      "status": "full" | "empty" | "partial" | "uncertain",
      "pill_count_estimate": number | null,
      "confidence": 0.0-1.0
    }
  ],
  
  "summary": {
    "total_compartments_visible": number,
    "full_count": number,
    "empty_count": number,
    "uncertain_count": number,
    "medication_due": true/false,
    "next_due": "monday-morning" | null
  },
  
  "alerts": [
    {
      "type": "missed_dose" | "pills_scattered" | "organizer_knocked" | "lid_issue",
      "severity": "low" | "medium" | "high",
      "description": "string"
    }
  ],
  
  "confidence_overall": 0.0-1.0,
  "analysis_notes": "Any relevant observations"
}
`;
```

*[... rest of the prompts document you sent ...]*

---

# Implementation Notes

These prompts are designed to be used with Claude Vision API (Sonnet 3.5 or Haiku 3.5).

**Current GENI integration:**
- `/backend/src/prompts/pillDetection.ts`
- `/backend/src/prompts/humanDetection.ts`
- `/backend/src/services/vision.ts`

**To update:**
1. Copy relevant prompts to appropriate files
2. Update vision.ts to use new structured formats
3. Add response type interfaces
4. Update geni-brain.ts to handle richer data
