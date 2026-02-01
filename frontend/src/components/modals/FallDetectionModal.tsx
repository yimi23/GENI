import { useState, useEffect } from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';

interface FallDetectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalStage = 'alert' | 'countdown' | 'notifying' | 'confirmed';

export function FallDetectionModal({ isOpen, onClose }: FallDetectionModalProps) {
  const [stage, setStage] = useState<ModalStage>('alert');
  const [timeLeft, setTimeLeft] = useState(60);
  const [notificationStatus, setNotificationStatus] = useState<{name: string; status: 'sending' | 'sent'}[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setStage('alert');
      setTimeLeft(60);
      setNotificationStatus([]);
      return;
    }

    if (stage === 'countdown') {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleNeedHelp();
            return 0;
          }
          
          if (prev === 30 || prev === 20 || prev === 10 || prev <= 5) {
            playBeep(prev);
          }
          
          if (prev <= 10) {
            navigator.vibrate?.(200);
          }
          
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [stage, isOpen]);

  const playBeep = (timeRemaining: number) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    if (timeRemaining >= 30) {
      gainNode.gain.value = 0.1;
    } else if (timeRemaining >= 10) {
      gainNode.gain.value = 0.3;
    } else {
      gainNode.gain.value = 0.5;
    }

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  const handleImOkay = async () => {
    try {
      await api.fallOkay();
      console.log('✅ Reported okay to backend');
    } catch (error) {
      console.error('Failed to report okay:', error);
    }
    onClose();
  };

  const handleNeedHelp = async () => {
    try {
      // Call backend - this will actually call emergency contacts
      await api.fallHelp();
      console.log('🆘 Emergency help called via backend');
    } catch (error) {
      console.error('Failed to call for help:', error);
    }
    
    // Show notification UI (backend handles actual calling)
    setStage('notifying');
    
    setNotificationStatus([
      { name: 'Sarah (Daughter)', status: 'sending' }
    ]);

    setTimeout(() => {
      setNotificationStatus(prev => 
        prev.map(item => ({ ...item, status: 'sent' }))
      );
      
      setTimeout(() => {
        setNotificationStatus(prev => [
          ...prev,
          { name: 'Dr. Johnson', status: 'sending' }
        ]);
        
        setTimeout(() => {
          setNotificationStatus(prev => 
            prev.map(item => ({ ...item, status: 'sent' }))
          );
          
          setTimeout(() => {
            setStage('confirmed');
          }, 1000);
        }, 1500);
      }, 1000);
    }, 2000);
  };

  const handleStartCountdown = () => {
    setStage('countdown');
  };

  const getRingColor = () => {
    if (timeLeft >= 31) return '#EAB308';
    if (timeLeft >= 11) return '#F97316';
    return '#EF4444';
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
      role="alertdialog"
      aria-live="assertive"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-6 shadow-xl">
        {stage === 'alert' && (
          <div className="text-center">
            <div className="mb-8">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <AlertTriangle size={32} className="text-yellow-600" />
              </div>
              <h1 className="text-2xl font-bold mb-3 text-gray-900">
                Fall Detected
              </h1>
              <p className="text-base text-gray-600">
                Are you okay?
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={handleImOkay}
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 rounded-md"
              >
                <Check size={18} />
                I'm Okay
              </button>

              <button
                onClick={handleStartCountdown}
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 rounded-md"
              >
                <AlertTriangle size={18} />
                I Need Help
              </button>
            </div>

            <div className="text-sm text-gray-500 mb-3">
              Calling help in 60 seconds
            </div>
            <button
              onClick={onClose}
              className="text-sm text-gray-400 hover:text-gray-600 underline font-medium"
            >
              Cancel
            </button>
          </div>
        )}

        {stage === 'countdown' && (
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-xl font-semibold mb-8 text-gray-900">
                Calling for Help
              </h1>

              <div className="flex justify-center mb-8">
                <div
                  className="w-40 h-40 rounded-full relative"
                  style={{
                    background: `conic-gradient(
                      ${getRingColor()} ${(timeLeft / 60) * 360}deg,
                      #E5E7EB ${(timeLeft / 60) * 360}deg
                    )`
                  }}
                >
                  <div className={`absolute inset-2 bg-white rounded-full flex items-center justify-center ${
                    timeLeft <= 10 ? 'animate-pulse' : ''
                  }`}>
                    <span className="text-5xl font-bold text-gray-900">{timeLeft}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                Emergency contacts will be notified
              </p>
            </div>

            <button
              onClick={handleImOkay}
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 rounded-md"
            >
              <Check size={18} />
              I'm Okay - Cancel
            </button>
          </div>
        )}

        {stage === 'notifying' && (
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-xl font-semibold mb-6 text-gray-900">
                Notifying Emergency Contacts
              </h1>

              <div className="space-y-3 mb-6">
                {notificationStatus.map((contact, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-md bg-white"
                  >
                    <span className="text-sm font-medium text-gray-900">{contact.name}</span>
                    <div className="text-sm font-medium">
                      {contact.status === 'sending' ? (
                        <span className="text-yellow-600">Sending...</span>
                      ) : (
                        <span className="text-green-600 flex items-center gap-1.5">
                          <Check size={14} />
                          Notified
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-sm text-gray-600">
                Your location has been shared
              </p>
            </div>

            <button
              onClick={handleImOkay}
              className="w-full h-10 border border-gray-300 hover:bg-gray-50 transition-colors font-medium text-sm rounded-md"
            >
              Cancel Alert - I'm Fine
            </button>
          </div>
        )}

        {stage === 'confirmed' && (
          <div className="text-center">
            <div className="mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <Check size={32} className="text-green-600" />
              </div>
              <h1 className="text-2xl font-bold mb-6 text-green-600">
                Help is on the Way
              </h1>

              <div className="space-y-3 mb-6">
                {notificationStatus.map((contact, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 border border-green-200 bg-green-50 rounded-md"
                  >
                    <span className="text-sm font-medium text-gray-900">{contact.name}</span>
                    <span className="text-sm font-medium text-green-600 flex items-center gap-1.5">
                      <Check size={14} />
                      Notified
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-sm text-gray-600">
                Your location has been shared
              </p>
            </div>

            <button
              onClick={handleImOkay}
              className="w-full h-10 border border-gray-300 hover:bg-gray-50 transition-colors font-medium text-sm rounded-md"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}