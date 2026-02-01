/**
 * Emergency Alert Component
 * Displays full-screen emergency overlay when YOLO detects fall/unresponsive state
 */

import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, Phone, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { socket } from '../services/socket';

interface EmergencyAlert {
  type: 'fall' | 'desk_faint' | 'unresponsive';
  timestamp: string;
  message: string;
}

export function EmergencyAlert() {
  const [alert, setAlert] = useState<EmergencyAlert | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState(0);

  useEffect(() => {
    // Listen for emergency alerts from backend
    socket.on('emergency_alert', (data: EmergencyAlert) => {
      console.log('🚨 Emergency alert received:', data);
      setAlert(data);
      setCountdownSeconds(30); // Auto-dismiss after 30 seconds
      
      // Vibrate device if supported
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
    });

    // Listen for emergency clearance
    socket.on('emergency_cleared', () => {
      console.log('✅ Emergency cleared');
      setAlert(null);
      setCountdownSeconds(0);
    });

    return () => {
      socket.off('emergency_alert');
      socket.off('emergency_cleared');
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!alert || countdownSeconds <= 0) return;

    const interval = setInterval(() => {
      setCountdownSeconds(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [alert, countdownSeconds]);

  // Auto-clear when countdown reaches 0
  useEffect(() => {
    if (countdownSeconds === 0 && alert) {
      setAlert(null);
    }
  }, [countdownSeconds, alert]);

  const handleDismiss = () => {
    // Send clear signal to backend
    fetch('http://localhost:5001/api/yolo/clear', { method: 'POST' })
      .catch(err => console.error('Failed to clear emergency:', err));
    setAlert(null);
  };

  const handleCall911 = () => {
    // Open dialer on mobile
    window.location.href = 'tel:911';
  };

  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          key="emergency-overlay"
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Emergency Card */}
          <motion.div
            className="relative w-full max-w-md"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            {/* Pulsing background */}
            <motion.div
              className="absolute inset-0 bg-red-600 rounded-2xl blur-2xl"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />

            {/* Card content */}
            <div className="relative bg-white rounded-2xl shadow-2xl p-8">
              {/* Icon */}
              <motion.div
                className="flex justify-center mb-6"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <AlertOctagon size={64} className="text-red-600" />
              </motion.div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-center text-red-600 mb-2">
                {alert.type === 'fall'
                  ? '🚨 FALL DETECTED'
                  : '⚠️ UNRESPONSIVE'}
              </h1>

              {/* Message */}
              <p className="text-center text-gray-700 text-lg mb-6">
                {alert.message}
              </p>

              {/* Status message */}
              <motion.div
                className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6 text-center"
                animate={{ borderColor: ['#fecaca', '#ef4444', '#fecaca'] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <p className="text-sm font-medium text-red-800">
                  ✓ Emergency services notified
                  <br />✓ Caregiver alerted via SMS
                  <br />✓ Audio alert playing
                </p>
              </motion.div>

              {/* Countdown */}
              <div className="text-center mb-6">
                <p className="text-gray-500 text-sm">
                  Dismissing in {countdownSeconds}s
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleCall911}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone size={20} />
                  Call 911
                </button>
                <button
                  onClick={handleDismiss}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  I'm OK
                </button>
              </div>

              {/* Location info */}
              <div className="mt-4 text-center text-xs text-gray-500 flex items-center justify-center gap-1">
                <MapPin size={14} />
                Location shared with caregiver
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
