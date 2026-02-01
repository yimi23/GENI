import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { ChatInterface } from './components/chat/ChatInterface';
import { MedicationHistory } from './components/history/MedicationHistory';
import TrainingMode from './components/TrainingMode';
import { FallDetectionModal } from './components/modals/FallDetectionModal';
import { IncomingMessageBanner } from './components/modals/IncomingMessageBanner';
import { GeniLogoAnimation } from './components/GeniLogoAnimation';
import { useStatus } from './hooks/useStatus';
import { useSocketEvent } from './hooks/useSocket';
import { speak } from './services/tts';
import type { Activity, IncomingMessage } from './types';

type View = 'dashboard' | 'chat' | 'medication-history' | 'training';

export default function App() {
  // Check URL for training mode
  const urlParams = new URLSearchParams(window.location.search);
  const isTrainingMode = urlParams.get('training') === 'true';
  
  const [showLogo, setShowLogo] = useState(!isTrainingMode); // Skip logo for training
  const { data, loading, refresh } = useStatus();
  const [currentView, setCurrentView] = useState<View>(isTrainingMode ? 'training' : 'chat');
  const [showFallModal, setShowFallModal] = useState(false);
  const [incomingMessage, setIncomingMessage] = useState<IncomingMessage | null>(null);

  // Socket event listeners
  useSocketEvent<Activity>('activity', () => {
    refresh(); // Refresh dashboard when new activity comes in
  });

  useSocketEvent('medication_update', () => {
    refresh();
  });

  useSocketEvent<IncomingMessage>('incoming_message', (message) => {
    setIncomingMessage(message);
  });

  useSocketEvent<{ text: string }>('speak', (data) => {
    speak(data.text);
  });

  useSocketEvent('fall_detected', () => {
    setShowFallModal(true);
  });

  const handleListenMessage = () => {
    if (incomingMessage) {
      speak(incomingMessage.message);
    }
  };

  const handleReplyMessage = () => {
    setIncomingMessage(null);
    setCurrentView('chat');
  };

  const handleTriggerEmergency = async () => {
    setShowFallModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <img src="/geni-logo-v2.png" alt="GENI" className="h-16 w-auto object-contain mx-auto mb-4 opacity-50" />
          <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load dashboard</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show logo animation on first load
  if (showLogo) {
    return <GeniLogoAnimation onComplete={() => setShowLogo(false)} />;
  }

  return (
    <>
      {/* Incoming Message Banner */}
      {incomingMessage && (
        <IncomingMessageBanner
          senderName={incomingMessage.senderName}
          senderRelation="Family"
          message={incomingMessage.message}
          onListen={handleListenMessage}
          onReply={handleReplyMessage}
          onDismiss={() => setIncomingMessage(null)}
        />
      )}

      {/* Main Views */}
      <div className={incomingMessage ? 'mt-[180px]' : ''}>
        {currentView === 'dashboard' && (
          <Dashboard
            onOpenChat={() => setCurrentView('chat')}
            onOpenMedicationHistory={() => setCurrentView('medication-history')}
            onTriggerEmergency={handleTriggerEmergency}
          />
        )}

        {currentView === 'chat' && (
          <ChatInterface
            onBackToDashboard={() => setCurrentView('dashboard')}
            onTriggerEmergency={handleTriggerEmergency}
          />
        )}

        {currentView === 'medication-history' && (
          <MedicationHistory
            onBackToDashboard={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'training' && (
          <TrainingMode />
        )}
      </div>

      {/* Fall Detection Modal */}
      <FallDetectionModal
        isOpen={showFallModal}
        onClose={() => setShowFallModal(false)}
      />
    </>
  );
}
