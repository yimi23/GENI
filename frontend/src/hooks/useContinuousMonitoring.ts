import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

interface MonitoringConfig {
  enabled: boolean;
  intervalSeconds: number; // How often to capture and analyze
  minIntervalMs: number; // Minimum time between requests (rate limiting)
}

interface MonitoringResult {
  timestamp: Date;
  status: 'present' | 'taken' | 'unclear';
  confidence: string;
  observations: string;
}

export function useContinuousMonitoring(
  videoRef: React.RefObject<HTMLVideoElement>,
  config: MonitoringConfig
) {
  // Persist monitoring state across HMR re-mounts
  const [isMonitoring, setIsMonitoring] = useState(() => {
    const saved = sessionStorage.getItem('geni_monitoring_active');
    return saved === 'true';
  });
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [results, setResults] = useState<MonitoringResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastRequestTime = useRef<number>(0);
  const mountedRef = useRef(true);

  const captureFrame = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!videoRef.current) {
        reject(new Error('Video element not found'));
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create image blob'));
        }
      }, 'image/jpeg', 0.9);
    });
  };

  const analyzeFrame = async () => {
    // Rate limiting check
    const now = Date.now();
    if (now - lastRequestTime.current < config.minIntervalMs) {
      console.log('⏸️  Skipping analysis (rate limit)');
      return;
    }

    if (isProcessing) {
      console.log('⏸️  Skipping analysis (already processing)');
      return;
    }

    try {
      setIsProcessing(true);
      lastRequestTime.current = now;

      console.log('📸 Continuous monitoring: Capturing frame...');
      const imageBlob = await captureFrame();
      
      console.log('🔍 Continuous monitoring: Analyzing...');
      const result = await api.checkPills(imageBlob);
      
      const monitoringResult: MonitoringResult = {
        timestamp: new Date(),
        status: result.status,
        confidence: result.confidence,
        observations: result.observations,
      };

      setResults(prev => [...prev.slice(-9), monitoringResult]); // Keep last 10 results
      setLastCheck(new Date());
      
      console.log('✅ Continuous monitoring result:', result.status);
      
      // Trigger event if status changed
      if (results.length > 0 && results[results.length - 1].status !== result.status) {
        console.log('🔔 Status changed:', results[results.length - 1].status, '→', result.status);
        // Could emit custom event here for UI notifications
      }
      
    } catch (error) {
      console.error('❌ Continuous monitoring error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const startMonitoring = () => {
    if (isMonitoring) return;
    
    console.log('▶️  Starting continuous monitoring (every', config.intervalSeconds, 'seconds)');
    setIsMonitoring(true);
    sessionStorage.setItem('geni_monitoring_active', 'true');
    
    // Immediate first check
    analyzeFrame();
    
    // Schedule periodic checks
    intervalRef.current = setInterval(() => {
      if (mountedRef.current) {
        analyzeFrame();
      }
    }, config.intervalSeconds * 1000);
  };

  const stopMonitoring = () => {
    if (!isMonitoring) return;
    
    console.log('⏹️  Stopping continuous monitoring');
    setIsMonitoring(false);
    sessionStorage.setItem('geni_monitoring_active', 'false');
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Restore monitoring state on mount (after HMR)
  useEffect(() => {
    const wasMonitoring = sessionStorage.getItem('geni_monitoring_active') === 'true';
    if (wasMonitoring && !isMonitoring && !intervalRef.current) {
      console.log('🔄 Restoring monitoring after re-mount');
      // Small delay to ensure camera is ready
      setTimeout(() => {
        if (mountedRef.current) {
          startMonitoring();
        }
      }, 1000);
    }
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Don't clear interval on unmount - we want it to persist through HMR
      // Only clear when explicitly stopped
    };
  }, []);

  return {
    isMonitoring,
    isProcessing,
    lastCheck,
    results,
    startMonitoring,
    stopMonitoring,
  };
}
