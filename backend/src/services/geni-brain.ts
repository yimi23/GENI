/**
 * GENI Brain - Contextual Intelligence Engine
 * Uses Gemini to generate context-aware, personalized responses
 * NO HARDCODED REPLIES
 */

import Anthropic from '@anthropic-ai/sdk';
import { buildGENIContext, formatContextSummary, type GENIContext } from './geni-context';
import type { Medication } from '../models/Medication';
import { config } from '../config';

const anthropic = new Anthropic({
  apiKey: config.anthropic.apiKey,
});

/**
 * GENI's core personality and instructions
 */
const GENI_SYSTEM_PROMPT = `You are GENI, a caring and intelligent AI health companion for elderly individuals.

PERSONALITY:
- **Sound like a helpful neighbor**, not a robot
- Warm, clear, casual - like texting someone you care about
- Natural conversationalist - use contractions, natural flow
- **NO corporate speak, NO "AI assistant" energy**

VOICE RULES (Critical):
❌ NEVER say: "I have detected that..." → ✅ Say: "Looks like..."
❌ NEVER say: "Please be advised..." → ✅ Say: "Hey," or "Just so you know,"
❌ NEVER say: "It appears that..." → ✅ Say: "Seems like..."
❌ NEVER say: "I am here to assist" → ✅ Just help, don't announce it
❌ NEVER say: "Your scheduled medication" → ✅ Say: "Your pills"
❌ NEVER say: "Successfully completed" → ✅ Say: "Done" or "Taken"

COMMUNICATION STYLE:
- Talk like you're texting someone you care about
- Use contractions (you're, haven't, it's, didn't)
- Natural flow over perfect grammar
- Short, clear sentences
- Use emojis naturally when speaking to caregivers

EXAMPLES FOR ELDERLY PERSON:
- Reminder: "Hey, time for your afternoon pills"
- Missed dose: "Looks like you haven't taken your pills yet. Everything okay?"
- Confirming: "Got it, I'll let them know"
- Incoming message: "You got a message. Want me to read it?"
- Check-in: "Haven't seen you in a bit. You doing alright?"
- Appointment: "Just a heads up, your appointment is in an hour"
- Emergency: "Help is on the way. Stay calm."

These are examples of VIBE, not scripts. Adapt to context, stay natural.

RULES:
- NEVER use generic phrases like "How can I help you?" or "I'd be happy to help"
- ALWAYS be specific and contextual
- Reference recent conversation when relevant
- If medication is overdue, escalate concern appropriately
- Speak naturally, like you're in the room with them
- Use contractions and natural speech patterns

HEALTH RESPONSIBILITIES:
- Monitor medication adherence
- Watch for concerning patterns (inactivity, confusion)
- Provide clear medication instructions when needed
- Escalate to family when appropriate
- Check in proactively when patterns are unusual

Remember: You're not just answering questions - you're a companion who knows the patient, their routine, and their health needs.`;

/**
 * Build context section for prompt
 */
function buildContextPrompt(context: GENIContext): string {
  const { 
    patientName, 
    patientAge, 
    timeOfDay, 
    dayOfWeek,
    medicationStatus,
    pendingMedications,
    overdueMedications,
    activityLevel,
    hoursSinceLastInteraction,
    timestamp
  } = context;
  
  const currentTime = timestamp.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  let contextText = `CURRENT CONTEXT:
📅 ${dayOfWeek}, ${currentTime} (${timeOfDay})
👤 Patient: ${patientName}, age ${patientAge}
`;

  // Medication context
  if (medicationStatus === 'all-taken') {
    contextText += `💊 Medications: All taken for today\n`;
  } else if (medicationStatus === 'overdue') {
    contextText += `💊 Medications: OVERDUE\n`;
    overdueMedications.forEach(med => {
      contextText += `   ⚠️  ${med.name} (${med.time}) - ${med.dosage}\n`;
    });
  } else if (medicationStatus === 'some-pending') {
    contextText += `💊 Medications: Pending\n`;
    pendingMedications.forEach(med => {
      contextText += `   ⏰ ${med.name} (${med.time}) - ${med.dosage}\n`;
    });
  } else {
    contextText += `💊 Medications: None scheduled today\n`;
  }
  
  // Activity level
  if (activityLevel === 'concerning') {
    contextText += `🚨 Activity: Very quiet (no activity in 4+ hours)\n`;
  } else if (activityLevel === 'quiet') {
    contextText += `😴 Activity: Quiet today\n`;
  }
  
  // Last interaction
  if (hoursSinceLastInteraction > 8) {
    contextText += `🕐 Last interaction: ${hoursSinceLastInteraction.toFixed(0)} hours ago (long silence)\n`;
  } else if (hoursSinceLastInteraction > 2) {
    contextText += `🕐 Last interaction: ${hoursSinceLastInteraction.toFixed(0)} hours ago\n`;
  }
  
  return contextText;
}

/**
 * Generate contextual response using Gemini
 */
export async function generateResponse(
  userMessage: string,
  conversationHistory: { role: 'user' | 'assistant'; text: string }[] = []
): Promise<string> {
  const context = buildGENIContext();
  
  console.log('🧠 GENI Brain - Building contextual response');
  console.log(formatContextSummary(context));
  
  // Build conversation history
  let historyText = '';
  if (conversationHistory.length > 0) {
    historyText = '\nRECENT CONVERSATION:\n';
    conversationHistory.slice(-5).forEach(msg => {
      const role = msg.role === 'user' ? context.patientName : 'GENI';
      historyText += `${role}: ${msg.text}\n`;
    });
  }
  
  const fullPrompt = `${GENI_SYSTEM_PROMPT}

${buildContextPrompt(context)}
${historyText}

${context.patientName}: ${userMessage}

GENI:`;

  console.log('🔮 Sending to Claude via GENI brain...');
  
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: fullPrompt,
        },
      ],
    });
    
    const response = message.content[0].type === 'text' ? message.content[0].text : '';
    console.log('✅ GENI response:', response);
    return response;
  } catch (error) {
    console.error('❌ Claude error:', error);
    // Fallback (but still contextual)
    return `I'm having a bit of trouble thinking right now, ${context.patientName}. Can you try again?`;
  }
}

/**
 * Generate pill check response based on vision result
 */
export async function generatePillCheckResponse(
  visionResult: {
    status: 'taken' | 'present' | 'unclear';
    observations: string;
  }
): Promise<string> {
  const context = buildGENIContext();
  
  console.log('🧠 GENI Brain - Generating pill check response');
  console.log('Vision result:', visionResult);
  console.log(formatContextSummary(context));
  
  const pillCheckPrompt = `${GENI_SYSTEM_PROMPT}

${buildContextPrompt(context)}

SITUATION:
You just used the camera to check ${context.patientName}'s medication.

VISION ANALYSIS RESULT:
Status: ${visionResult.status}
Detailed observations: ${visionResult.observations}

CRITICAL CONTEXT:
${context.overdueMedications.length > 0 ? `⚠️ OVERDUE: ${context.overdueMedications.map(m => m.name).join(', ')}` : ''}
${context.pendingMedications.length > 0 ? `Pending today: ${context.pendingMedications.map(m => `${m.name} at ${m.time}`).join(', ')}` : 'All medications taken today'}

TASK:
Based on what the camera saw AND the medication context:
- If status is TAKEN and compartment(s) are empty: Praise them for taking medication
- If status is PRESENT and pills are visible: Remind them which specific medication to take (use time/name from context)
- If multiple days are empty: Ask if they've been taking medications regularly
- If status is UNCLEAR: Ask to adjust camera or confirm manually
- ALWAYS reference specific medication names/times from the context above

Be specific. Use the observations to inform your response. Don't give generic replies.

GENI:`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: pillCheckPrompt,
        },
      ],
    });
    
    const response = message.content[0].type === 'text' ? message.content[0].text : '';
    console.log('✅ Pill check response:', response);
    return response;
  } catch (error) {
    console.error('❌ Claude error:', error);
    // Contextual fallback
    if (visionResult.status === 'present') {
      return `${context.patientName}, I can see your medication is ready. Time to take it!`;
    } else if (visionResult.status === 'taken') {
      return `Great job, ${context.patientName}! I can see you've already taken your medication.`;
    } else {
      return `I'm having trouble seeing clearly, ${context.patientName}. Can you adjust the camera or confirm you took your medication?`;
    }
  }
}

/**
 * Generate proactive check-in message
 */
export async function generateProactiveCheckIn(
  reason: 'overdue-medication' | 'long-silence' | 'low-activity' | 'morning-greeting'
): Promise<string> {
  const context = buildGENIContext();
  
  console.log('🧠 GENI Brain - Generating proactive check-in');
  console.log('Reason:', reason);
  console.log(formatContextSummary(context));
  
  let situationText = '';
  
  switch (reason) {
    case 'overdue-medication':
      situationText = `${context.patientName} has overdue medication. You need to check in and remind them gently but persistently.`;
      break;
    case 'long-silence':
      situationText = `It's been ${context.hoursSinceLastInteraction.toFixed(0)} hours since you last heard from ${context.patientName}. Check in to make sure everything is okay.`;
      break;
    case 'low-activity':
      situationText = `${context.patientName} has been very quiet today (low activity). Check in warmly to see if they need anything.`;
      break;
    case 'morning-greeting':
      situationText = `It's morning. Greet ${context.patientName} warmly and let them know what's on the schedule for today.`;
      break;
  }
  
  const checkInPrompt = `${GENI_SYSTEM_PROMPT}

${buildContextPrompt(context)}

SITUATION:
${situationText}

Generate a warm, natural proactive message. Don't ask generic questions - be specific to their context.

GENI:`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: checkInPrompt,
        },
      ],
    });
    
    const response = message.content[0].type === 'text' ? message.content[0].text : '';
    console.log('✅ Proactive check-in:', response);
    return response;
  } catch (error) {
    console.error('❌ Claude error:', error);
    // Basic fallback
    return `Hey ${context.patientName}, just checking in. How are you doing?`;
  }
}

/**
 * Quick context check without generating response
 */
export function getContext(): GENIContext {
  return buildGENIContext();
}
