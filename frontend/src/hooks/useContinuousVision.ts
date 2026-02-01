/**
 * GENI Continuous Vision Hook
 * Sends camera frames to backend on a timed interval for analysis
 * 
 * Learned from fall_detection.py:
 * - Continuous loop (runs constantly)
 * - Not paused by default
 * - Pauses during voice interaction
 * - Resumes automatically after voice
 */

import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

const API_URL = (import.meta.env as Record<string, any>).VITE_API_URL || 'http://localhost:5001';

interface VisionUpdate {
  timestamp: Date;
  observation: string;
  message?: string;
  concerns: string[];
}

interface FallPoseUpdate {
  noseX?: number;
  noseY?: number;
  hipX?: number;
  hipY?: number;
  shoulderX?: number;
  shoulderY?: number;
  noseVelocity?: number;
  hipVelocity?: number;
  personDown: boolean;
  fallPrimed: boolean;
  emergencyTriggered: boolean;
  stillSeconds: number;
  confirmationTime: number;
  keypointsDetected: boolean;
  frameHeight?: number;
  frameWidth?: number;
}

interface ContinuousVisionConfig {
  enabled: boolean;
  intervalSeconds: number; // How often to capture and send frames
}

export function useContinuousVision(
  videoRef: React.RefObject<HTMLVideoElement>,
  config: ContinuousVisionConfig
) {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<VisionUpdate | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastFallPose, setLastFallPose] = useState<FallPoseUpdate | null>(null);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);
  
  /**
   * Capture frame from video element
   */
  const captureFrame = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!videoRef.current) {
        reject(new Error('Video element not found'));
        return;
      }
      
      const video = videoRef.current;
      
      // Check if video is ready
      if (video.readyState < 2) {
        reject(new Error('Video not ready'));
        return;
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(video, 0, 0);
      
      // Convert to base64 JPEG
      const base64 = canvas.toDataURL('image/jpeg', 0.8);
      resolve(base64);
    });
  };
  
  /**
   * Send frame to backend for analysis
   */
  const analyzeFrame = async () => {
    if (isProcessing || isPaused) {
      return;
    }
    
    try {
      setIsProcessing(true);
      
      console.log('📸 Continuous vision: Capturing frame...');
      const imageBase64 = await captureFrame();
      
      console.log('🔍 Continuous vision: Sending to backend...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      let response;
      try {
        response = await fetch(`${API_URL}/api/vision/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: imageBase64, source: 'continuous' }),
          signal: controller.signal,
        });
      
        if (!response.ok) {
          throw new Error(`Vision analysis failed: ${response.statusText}`);
        }
      } finally {
        clearTimeout(timeoutId);
      }
      
      const result = await response.json();
      
      if (result.status === 'paused') {
        console.log('⏸️  Vision paused on backend');
        return;
      }
      
      if (result.fallPose?.keypointsDetected) {
        console.log('🧠 Fall pose (frame):', result.fallPose);
        setLastFallPose(result.fallPose as FallPoseUpdate);
      }
      
      console.log('✅ Vision analysis complete:', result.observations);
      
      setLastUpdate({
        timestamp: new Date(result.timestamp),
        observation: result.observations,
        message: result.message,
        concerns: result.concerns || [],
      });
      
    } catch (error) {
      console.error('❌ Continuous vision error:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  /**
   * Start continuous vision monitoring
   */
  const start = () => {
    if (isActive) return;
    
    console.log('▶️  Starting continuous vision monitoring (every', config.intervalSeconds, 'seconds)');
    setIsActive(true);
    
    // Immediate first analysis
    setTimeout(() => {
      if (mountedRef.current) {
        analyzeFrame();
      }
    }, 2000); // Wait 2 seconds for camera to be ready
    
    // Schedule periodic analysis
    intervalRef.current = setInterval(() => {
      if (mountedRef.current && !isPaused) {
        analyzeFrame();
      }
    }, config.intervalSeconds * 1000);
  };
  
  /**
   * Stop continuous vision monitoring
   */
  const stop = () => {
    if (!isActive) return;
    
    console.log('⏹️  Stopping continuous vision monitoring');
    setIsActive(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
  
  /**
   * Pause monitoring (for voice interaction)
   */
  const pause = () => {
    console.log('⏸️  Pausing continuous vision');
    setIsPaused(true);
  };
  
  /**
   * Resume monitoring
   */
  const resume = () => {
    console.log('▶️  Resuming continuous vision');
    setIsPaused(false);
    
    // Immediate analysis after resume
    setTimeout(() => {
      if (mountedRef.current && isActive) {
        analyzeFrame();
      }
    }, 500);
  };
  
  // Auto-start if enabled
  useEffect(() => {
    if (config.enabled) {
      // Small delay to ensure camera is ready
      const timeout = setTimeout(() => {
        if (mountedRef.current) {
          start();
        }
      }, 3000); // 3 second delay
      
      return () => clearTimeout(timeout);
    }
  }, [config.enabled]);
  
  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  return {
    isActive,
    isPaused,
    lastUpdate,
    lastFallPose,
    isProcessing,
    start,
    stop,
    pause,
    resume,
  };
}
