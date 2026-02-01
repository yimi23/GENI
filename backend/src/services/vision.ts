import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';
import { PILL_DETECTION_PROMPT } from '../prompts/pillDetection';
import { HUMAN_DETECTION_PROMPT } from '../prompts/humanDetection';

const anthropic = new Anthropic({
  apiKey: config.anthropic.apiKey,
});

interface PillDetectionResult {
  status: 'present' | 'taken' | 'unclear';
  confidence: 'high' | 'medium' | 'low';
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
      model: 'claude-3-5-sonnet-20240620', // Correct Sonnet 3.5 model
      max_tokens: 1024,
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
    const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
    const result: PillDetectionResult = JSON.parse(jsonStr);
    
    console.log('💊 Pill analysis:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Pill vision analysis failed:', error);
    return {
      status: 'unclear',
      confidence: 'low',
      observations: 'Error analyzing image',
    };
  }
}

export async function analyzeHumanPresence(imageBase64: string): Promise<HumanDetectionResult> {
  try {
    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620', // Correct Sonnet 3.5 model for human detection
      max_tokens: 1024,
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
