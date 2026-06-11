import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { captureFrameAsBlob } from '../lib/frame-capture';

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
  responseText?: string; // GENI's contextual message
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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastRequestTime = useRef<number>(0);
  const mountedRef = useRef(true);

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
      const imageBlob = await captureFrameAsBlob(videoRef.current, 0.9);
      
      console.log('🔍 Continuous monitoring: Analyzing...');
      const result = await api.checkPills(imageBlob);
      
      const monitoringResult: MonitoringResult = {
        timestamp: new Date(),
        status: result.status,
        confidence: result.confidence,
        observations: result.observations,
        responseText: result.responseText, // GENI's contextual message
      };

      setResults(prev => [...prev.slice(-9), monitoringResult]); // Keep last 10 results
      setLastCheck(new Date());
      
      console.log('✅ Continuous monitoring result:', result.status);
      
      // Only emit message if it's DIFFERENT from the last one (prevent duplicates)
      if (result.responseText) {
        const lastResult = results[results.length - 1];
        const isDuplicate = lastResult && lastResult.responseText === result.responseText;
        
        if (!isDuplicate) {
          console.log('💬 GENI says:', result.responseText);
          
          // Emit custom event with GENI's message
          const event = new CustomEvent('geni-monitoring-message', {
            detail: {
              message: result.responseText,
              status: result.status,
              timestamp: new Date(),
            }
          });
          window.dispatchEvent(event);
        } else {
          console.log('⏭️  Skipping duplicate message');
        }
      }
      
      // Trigger event if status changed
      if (results.length > 0 && results[results.length - 1].status !== result.status) {
        console.log('🔔 Status changed:', results[results.length - 1].status, '→', result.status);
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

  // Auto-start monitoring on mount if enabled or previously running
  useEffect(() => {
    const wasMonitoring = sessionStorage.getItem('geni_monitoring_active') === 'true';

    // Auto-start only if enabled or previously running
    if (config.enabled || wasMonitoring) {
      if (!isMonitoring && !intervalRef.current) {
        console.log('🔄 Auto-starting monitoring on mount');
        // Small delay to ensure camera is ready
        setTimeout(() => {
          if (mountedRef.current && !intervalRef.current) {
            startMonitoring();
          }
        }, 1500); // Longer delay for camera
      }
    }
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
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
