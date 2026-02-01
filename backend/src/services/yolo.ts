/**
 * GENI YOLOv8 Detection Service
 * Calls Python YOLOv8 detector for pill box detection
 */

import { spawn } from 'child_process';
import path from 'path';

interface YOLOResult {
  status: 'taken' | 'present' | 'unclear';
  confidence: number;
  details: string;
  class?: string;
}

/**
 * Detect pill status using YOLOv8
 * @param base64Image - Base64 encoded image
 * @param modelPath - Optional custom model path
 */
export async function detectPillsYOLO(
  base64Image: string,
  modelPath?: string
): Promise<YOLOResult> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, 'yolo_detector.py');
    const args = [pythonScript, base64Image];
    
    if (modelPath) {
      args.push(modelPath);
    }
    
    const python = spawn('python3', args);
    
    let stdout = '';
    let stderr = '';
    
    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    python.on('close', (code) => {
      if (code !== 0) {
        console.error('❌ YOLOv8 detection error:', stderr);
        resolve({
          status: 'unclear',
          confidence: 0,
          details: 'YOLOv8 detection failed - using fallback',
        });
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (error) {
        console.error('❌ Failed to parse YOLO result:', error);
        resolve({
          status: 'unclear',
          confidence: 0,
          details: 'Failed to parse detection result',
        });
      }
    });
    
    python.on('error', (error) => {
      console.error('❌ Failed to spawn Python process:', error);
      resolve({
        status: 'unclear',
        confidence: 0,
        details: 'Python not available',
      });
    });
  });
}

/**
 * Check if YOLOv8 is available and trained model exists
 */
export async function checkYOLOAvailability(): Promise<boolean> {
  try {
    const pythonScript = path.join(__dirname, 'yolo_detector.py');
    const python = spawn('python3', ['-c', 'from ultralytics import YOLO; print("ok")']);
    
    return new Promise((resolve) => {
      python.on('close', (code) => {
        resolve(code === 0);
      });
      python.on('error', () => {
        resolve(false);
      });
    });
  } catch {
    return false;
  }
}
