import { config } from '../config';
import { PILL_DETECTION_PROMPT } from '../prompts/pillDetection';
import { HUMAN_DETECTION_PROMPT } from '../prompts/humanDetection';

import { anthropic } from '../lib/anthropic';

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
      model: 'claude-haiku-4-5', // Current Haiku 3.5 model
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
      model: 'claude-haiku-4-5', // Current Haiku 3.5 model for human detection
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
