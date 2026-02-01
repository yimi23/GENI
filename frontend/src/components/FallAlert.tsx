/**
 * Fall Alert Component
 * Full-screen emergency alert when fall is detected
 */

import { useState, useEffect } from 'react';
import { AlertOctagon, Check, X } from 'lucide-react';

interface FallAlertProps {
  state: 'confirming' | 'emergency' | 'escalated' | 'cancelled';
  message: string;
  patient?: string;
  progress?: number;
  onConfirmOK: () => void;
}

export function FallAlert({ state, message, patient, progress = 0, onConfirmOK }: FallAlertProps) {
  const [countdown, setCountdown] = useState(60);
  const [userConfirmed, setUserConfirmed] = useState(false);
  
  // Countdown timer for emergency state
  useEffect(() => {
    if (state === 'emergency' && !userConfirmed) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [state, userConfirmed]);
  
  const handleConfirmOK = async () => {
    setUserConfirmed(true);
    
    try {
      const response = await fetch('http://localhost:5001/api/fall-detection/confirm-ok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const result = await response.json();
      console.log('✅ Confirmed OK:', result);
      
      // Call parent callback
      onConfirmOK();
      
    } catch (error) {
      console.error('❌ Failed to confirm OK:', error);
      setUserConfirmed(false);
    }
  };
  
  // Don't render if cancelled or user confirmed
  if (state === 'cancelled' || userConfirmed) {
    return null;
  }
  
  // Confirming state (fall suspected, 3-second wait)
  if (state === 'confirming') {
    return (
      <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
        <div className="bg-yellow-500 text-white rounded-lg shadow-2xl p-4 max-w-sm">
          <div className="flex items-center gap-3">
            <AlertOctagon className="animate-pulse" size={24} />
            <div>
              <p className="font-bold">Checking on you...</p>
              <div className="w-48 h-2 bg-yellow-300 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${progress * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Emergency state (fall confirmed)
  if (state === 'emergency') {
    return (
      <div className="fixed inset-0 bg-red-600/95 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-2xl p-8 max-w-lg w-full text-center shadow-2xl">
          {/* Emergency Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-red-600 text-white rounded-full p-6">
                <AlertOctagon size={64} strokeWidth={2.5} />
              </div>
            </div>
          </div>
          
          {/* Main Message */}
          <h1 className="text-4xl font-bold text-red-600 mb-4">
            FALL DETECTED
          </h1>
          
          <p className="text-xl text-gray-800 mb-2">
            {patient}, are you okay?
          </p>
          
          <p className="text-gray-600 mb-6">
            We've alerted your caregiver.
          </p>
          
          {/* Countdown */}
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              Help arriving if no response in:
            </p>
            <p className="text-5xl font-bold text-red-600 font-mono">
              {countdown}s
            </p>
          </div>
          
          {/* Confirm OK Button */}
          <button
            onClick={handleConfirmOK}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-8 py-6 rounded-xl text-2xl font-bold shadow-lg transform transition hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
          >
            <Check size={32} />
            I'M OK - CANCEL ALERT
          </button>
          
          <p className="text-sm text-gray-500 mt-4">
            Click this button if you're okay to cancel the emergency alert.
          </p>
        </div>
      </div>
    );
  }
  
  // Escalated state (no response after 60s)
  if (state === 'escalated') {
    return (
      <div className="fixed inset-0 bg-red-700/95 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-lg w-full text-center shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="bg-red-700 text-white rounded-full p-6">
              <AlertOctagon size={64} strokeWidth={2.5} />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-red-700 mb-4">
            HELP IS ON THE WAY
          </h1>
          
          <p className="text-xl text-gray-800 mb-6">
            All emergency contacts have been notified.
          </p>
          
          <p className="text-gray-600 mb-6">
            Someone will be there soon to check on you.
          </p>
          
          <button
            onClick={handleConfirmOK}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-xl font-bold shadow-lg flex items-center justify-center gap-3"
          >
            <Check size={24} />
            I'M OK - FALSE ALARM
          </button>
        </div>
      </div>
    );
  }
  
  return null;
}

/**
 * Fall Detection Status Indicator
 * Small indicator that shows fall detection is active
 */
export function FallDetectionStatus({ isActive }: { isActive: boolean }) {
  if (!isActive) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-40 bg-green-500 text-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
      <div className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-200"></span>
      </div>
      <span className="text-sm font-medium">Fall Detection Active</span>
    </div>
  );
}
