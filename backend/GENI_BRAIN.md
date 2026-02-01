# GENI Brain Architecture

## Philosophy
GENI is not a chatbot. GENI is a universal elderly care AI that adapts to whoever is using it.

## Core Architecture
**GENI Brain** = Context Engine that transforms raw data into intelligent prompts
**Claude** = The LLM that generates responses from those prompts
**Claude Vision** = Trained to recognize medications and humans

```
User Input → GENI Brain (Context) → Rich Prompt → Claude → Contextual Response
Camera → Claude Vision (trained prompts) → Structured data → GENI Brain → Response
```

The brain doesn't generate responses - it builds the context that lets Claude generate BETTER responses.

## Vision Capabilities

### What GENI Can See:

**Medications:**
- Tablets, capsules, caplets in various colors
- Pill organizers (weekly/daily compartments)
- Empty vs full compartments
- Multiple days of medication status

**Humans:**
- Body parts (head, torso, arms, legs)
- Postures (standing, sitting, lying, walking)
- **Fall detection** (person on floor, awkward positions)
- Multiple people in frame

GENI uses detailed prompts to teach Claude Vision what to look for, resulting in accurate detection without custom ML training.

## Core Principles

### 1. NO HARDCODED REPLIES
Every response is generated with full context:
- Current time/date
- Patient's name and info (from state)
- Recent conversation history
- Medication status
- Activity patterns
- Emotional state signals

### 2. CONTEXT IS EVERYTHING
GENI knows:
- What time it is (morning greetings vs evening check-ins)
- What day it is (Monday pills vs Sunday pills)
- What just happened (conversation continuity)
- What's overdue (medication timing)
- Who the patient is (pulled from state, not hardcoded)

### 3. PERSONALITY = CONSISTENCY
GENI should feel like:
- A caring, competent companion
- Patient but persistent when health matters
- Warm without being patronizing
- Clear communicator (no jargon)

But NOT hardcoded responses - natural language generation based on context.

## Architecture

### Context Engine
```typescript
interface GENIContext {
  // Real-time awareness
  timestamp: Date;
  timeOfDay: string; // calculated
  dayOfWeek: string;
  
  // Patient (from state)
  patientName: string;
  patientAge: number;
  
  // Health state
  todaysMedications: Medication[];
  medicationStatus: 'all-taken' | 'pending' | 'overdue';
  lastPillCheckTime: Date | null;
  lastPillCheckResult: string | null;
  
  // Conversation
  recentMessages: Message[]; // last 10
  lastInteractionTime: Date | null;
  
  // Activity
  recentActivities: Activity[]; // last 20
  activityLevel: 'active' | 'normal' | 'quiet' | 'concerning';
  
  // Family
  pendingMessages: IncomingMessage[];
}
```

### Prompt Construction
Every interaction:
1. Build full context object
2. Construct intelligent prompt with context
3. Send to Gemini
4. Return contextual, intelligent response

### Response Types

**Medication Check:**
Not: "I can see your pills are ready"
But: Context-aware response based on:
- Patient name
- Current time
- Which medication
- Last check result
- Conversation history

**Greetings:**
Not: "How can I help you?"
But: Time-appropriate, context-aware greeting:
- Morning: Reference day's medication schedule
- Evening: Review day's activities
- After long silence: Check if everything's okay

**Reminders:**
Not: "Don't forget your medication"
But: Gentle, contextual nudge:
- Reference specific medication
- Time since it was due
- Patient's usual patterns

## Implementation

### Phase 1: Context Engine (NOW)
- Build context gathering system
- Pull all state into structured context
- Add time/date intelligence

### Phase 2: Prompt System (NOW)
- Design system prompt for GENI personality
- Build contextual prompt constructor
- Replace all hardcoded strings

### Phase 3: Memory System (NEXT)
- Conversation history tracking
- Pattern learning (patient's speech, preferences)
- Long-term context storage

### Phase 4: Intelligence (AFTER)
- Proactive intelligence (sensing problems)
- Escalation logic (when to alert family)
- Health pattern recognition

## Key Files to Modify

1. **`/backend/src/services/geni-context.ts`** (NEW)
   - Context engine
   - State aggregation
   - Time intelligence

2. **`/backend/src/services/geni-brain.ts`** (NEW)
   - Prompt construction
   - Gemini integration
   - Response generation

3. **`/backend/src/routes/chat.ts`** (MODIFY)
   - Remove hardcoded responses
   - Use GENI brain for all replies

4. **`/backend/src/routes/medication.ts`** (MODIFY)
   - Remove hardcoded pill check responses
   - Use GENI brain with vision context

5. **`/backend/src/services/pillbox.ts`** (MODIFY)
   - Remove all hardcoded strings
   - Use GENI brain for medication logic

## Success Criteria

✅ Zero hardcoded response strings in codebase
✅ All responses include patient name from state
✅ All responses are time/date aware
✅ Conversation has continuity (references previous messages)
✅ GENI adapts to whoever is using it (not just "Margaret")
