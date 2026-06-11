import { config } from '../config';
import { PILL_DETECTION_PROMPT } from '../prompts/pillDetection';
import { HUMAN_DETECTION_PROMPT } from '../prompts/humanDetection';

import { anthropic, VISION_MODEL } from '../lib/anthropic';

interface PillDetectionResult {
  status: 'present' | 'taken' | 'unclear';
  confidence: 'high' | 'medium' | 'low';
  compartments?: {
    monday?: 'empty' | 'full' | 'unclear';
    tuesday?: 'empty' | 'full' | 'unclear';
    wednesday?: 'empty' | 'full' | 'unclear';
    thursday?: 'empty' | 'full' | 'unclear';
    friday?: 'empty' | 'full' | 'unclear';
    saturday?: 'empty' | 'full' | 'unclear';
    sunday?: 'empty' | 'full' | 'unclear';
  };
  pillCounts?: {
    monday?: number;
    tuesday?: number;
    wednesday?: number;
    thursday?: number;
    friday?: number;
    saturday?: number;
    sunday?: number;
  };
  overallStatus?: 'all-taken' | 'partial-adherence' | 'no-adherence' | 'unclear' | 'no-organizer-detected';
  observations: string;
}

interface HumanDetectionResult {
  humanPresent: boolean;
  count: number;
  positions: ('standing' | 'sitting' | 'lying' | 'fallen' | 'walking' | 'unclear')[];
  fallDetected: boolean;
  confidence: 'high' | 'medium' | 'low';
  observations: string;
}

export async function analyzePillImage(imageBase64: string): Promise<PillDetectionResult> {
  try {
    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    
    const message = await anthropic.messages.create({
      model: VISION_MODEL,
      max_tokens: 1024,
      system: "You are a computer vision API. You MUST respond with ONLY a valid JSON object, no other text whatsoever. No explanations, no apologies, no markdown. Start with { and end with }.",
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: PILL_DETECTION_PROMPT,
            },
          ],
        },
      ],
    });
    
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    console.log('🔍 Raw vision response:', responseText);
    
    // Extract JSON from response (may have markdown formatting)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.error('❌ No JSON found in vision response. Got conversational text instead.');
      console.error('First 200 chars:', responseText.substring(0, 200));
      return {
        status: 'unclear',
        confidence: 'low',
        observations: 'Vision API returned invalid format (no JSON). This may indicate a prompt issue.',
      };
    }
    
    const jsonStr = jsonMatch[0];
    const result: PillDetectionResult = JSON.parse(jsonStr);
    
    console.log('💊 Pill analysis:', result);
    return result;
    
  } catch (error: any) {
    console.error('❌ Pill vision analysis failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Full error:', JSON.stringify(error, null, 2));
    return {
      status: 'unclear',
      confidence: 'low',
      observations: `Error: ${error.message || 'Unknown error'}`,
    };
  }
}

export async function analyzeHumanPresence(imageBase64: string): Promise<HumanDetectionResult> {
  try {
    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    
    const message = await anthropic.messages.create({
      model: VISION_MODEL,
      max_tokens: 1024,
      system: "You are a computer vision API. You MUST respond with ONLY a valid JSON object, no other text whatsoever. No explanations, no apologies, no markdown. Start with { and end with }.",
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: HUMAN_DETECTION_PROMPT,
            },
          ],
        },
      ],
    });
    
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    console.log('🔍 Raw human detection response:', responseText);
    
    // Extract JSON from response (may have markdown formatting)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
    const result: HumanDetectionResult = JSON.parse(jsonStr);
    
    console.log('👤 Human analysis:', result);
    
    // CRITICAL: If fall detected, log alert
    if (result.fallDetected) {
      console.error('🚨 FALL DETECTED:', result.observations);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Human vision analysis failed:', error);
    return {
      humanPresent: false,
      count: 0,
      positions: [],
      fallDetected: false,
      confidence: 'low',
      observations: 'Error analyzing image',
    };
  }
}

export interface SceneAnalysis {
  timestamp: Date;
  observations: string;
  activity: string; // 'at desk' | 'walking' | 'sitting' | 'lying down' | 'not visible' | 'unclear'
  pillStatus: 'present' | 'taken' | 'unclear';
  concerns: string[];
}

/**
 * General scene understanding for the continuous monitoring loop:
 * what is the patient doing, is the pill organizer visible, any concerns.
 */
export async function analyzeScene(
  imageBase64: string,
  scheduleContext: string
): Promise<SceneAnalysis> {
  const fallback: SceneAnalysis = {
    timestamp: new Date(),
    observations: 'Analysis unavailable',
    activity: 'unclear',
    pillStatus: 'unclear',
    concerns: [],
  };

  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await anthropic.messages.create({
      model: VISION_MODEL,
      max_tokens: 300,
      system:
        'You are a computer vision API. You MUST respond with ONLY a valid JSON object. No extra text, no markdown. Start with { and end with }.',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/jpeg', data: base64Data },
            },
            {
              type: 'text',
              text: `You are GENI, an AI elder care companion monitoring ${config.patient.name}.

Analyze this camera frame and respond in JSON format:

{
  "observations": "Brief description of what you see",
  "activity": "at desk" | "walking" | "sitting" | "lying down" | "not visible",
  "pillStatus": "present" | "taken" | "unclear",
  "concerns": ["list any concerns"]
}

Current time: ${new Date().toLocaleTimeString()}
Current medications schedule: ${scheduleContext}

Focus on:
1. Is ${config.patient.name} visible and what are they doing?
2. Can you see the pill organizer? Are pills present or taken?
3. Any safety concerns (unusual position, fall risk)?
4. Any changes from typical behavior?

Be concise and factual. Only list real concerns.`,
            },
          ],
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') return fallback;

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { ...fallback, observations: 'Vision response invalid (no JSON).' };

    const analysis = JSON.parse(jsonMatch[0]);
    return {
      timestamp: new Date(),
      observations: analysis.observations || 'No clear observation',
      activity: analysis.activity || 'unclear',
      pillStatus: analysis.pillStatus || 'unclear',
      concerns: Array.isArray(analysis.concerns) ? analysis.concerns : [],
    };
  } catch (error) {
    return fallback;
  }
}
