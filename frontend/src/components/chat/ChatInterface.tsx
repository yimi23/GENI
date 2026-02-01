import { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, Mic, Volume2, AlertOctagon, Camera, PlayCircle, PauseCircle } from 'lucide-react';
import { useVoiceVisualizer, VoiceVisualizer } from 'react-voice-visualizer';
import { api } from '../../services/api';
import { speak as ttsSpeak } from '../../services/tts';
import { useContinuousMonitoring } from '../../hooks/useContinuousMonitoring';

interface Message {
  sender: 'geni' | 'user';
  text: string;
  time: string;
  wasSpoken?: boolean; // Track if this message was spoken out loud
}

interface ChatInterfaceProps {
  onBackToDashboard: () => void;
  onTriggerEmergency?: () => void;
}

/**
 * GENI Chat Interface
 * 
 * PHILOSOPHY: "Speak only when spoken to"
 * - Voice input → Voice output (user not looking at screen)
 * - Button/click → Text only (user is looking at screen)
 * - This reduces latency and avoids redundant audio
 */
export function ChatInterface({ onBackToDashboard, onTriggerEmergency }: ChatInterfaceProps) {
  // Force re-render counter to update UI when sessionStorage changes
  const [renderKey, setRenderKey] = useState(0);
  
  // ALWAYS read from sessionStorage on render (don't use state)
  const getMessages = (): Message[] => {
    try {
      const saved = sessionStorage.getItem('geni_messages');
      if (saved) {
        return JSON.parse(saved);
      }
      return [];
    } catch (error) {
      console.error('❌ Failed to load messages:', error);
      return [];
    }
  };
  
  const messages = getMessages();
  console.log('🔄 Render - messages from storage:', messages.length);
  
  // Helper to add messages (updates sessionStorage and forces re-render)
  const addMessage = (message: Message) => {
    const current = getMessages();
    const updated = [...current, message];
    sessionStorage.setItem('geni_messages', JSON.stringify(updated));
    setRenderKey(prev => prev + 1);
  };
  
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCheckingPills, setIsCheckingPills] = useState(false);
  const [lastInteractionWasVoice, setLastInteractionWasVoice] = useState(false);
  const [speakOnlyWhenSpokenTo, setSpeakOnlyWhenSpokenTo] = useState(true); // Default mode
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraInitializedRef = useRef(false);
  const micInitializedRef = useRef(false);
  const recorderControls = useVoiceVisualizer();
  
  // Continuous monitoring hook
  const {
    isMonitoring,
    isProcessing: isAutoChecking,
    lastCheck,
    results: monitoringResults,
    startMonitoring,
    stopMonitoring,
  } = useContinuousMonitoring(videoRef, {
    enabled: true,
    intervalSeconds: 30, // Check every 30 seconds
    minIntervalMs: 10000, // Minimum 10 seconds between requests (rate limiting)
  });
  
  // NO AUTO-SAVE - causes race conditions with manual saves
  // Messages are saved manually in handleCheckPills and voice handlers

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  
  // Handle continuous monitoring results
  useEffect(() => {
    if (monitoringResults.length < 2) return; // Need at least 2 results to detect change
    
    const latest = monitoringResults[monitoringResults.length - 1];
    const previous = monitoringResults[monitoringResults.length - 2];
    
    // If status changed, add notification message
    if (latest.status !== previous.status) {
      console.log('🔔 Auto-monitoring detected change:', previous.status, '→', latest.status);
      
      let notificationText = '';
      if (latest.status === 'taken' && previous.status === 'present') {
        notificationText = '✅ Great! I just noticed you took your medication.';
      } else if (latest.status === 'present' && previous.status === 'taken') {
        notificationText = '💊 I see pills are back in the organizer. Remember to take them when it\'s time.';
      }
      
      if (notificationText) {
        const notification: Message = {
          sender: 'geni',
          text: notificationText,
          time: getCurrentTime(),
          wasSpoken: false
        };
        addMessage(notification);
      }
    }
  }, [monitoringResults]);

  // Initialize camera on component mount
  useEffect(() => {
    if (!cameraInitializedRef.current) {
      initializeCamera();
      cameraInitializedRef.current = true;
    }
    
    if (!micInitializedRef.current) {
      requestMicrophonePermission();
      micInitializedRef.current = true;
    }
    
    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
        setCameraError(null);
        console.log('✅ Camera initialized');
      }
    } catch (error) {
      console.error('❌ Camera initialization failed:', error);
      setCameraError('Camera access denied. Please enable camera permissions.');
      setCameraActive(false);
    }
  };

  const requestMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Microphone permission granted');
    } catch (error) {
      console.error('❌ Microphone permission denied:', error);
    }
  };

  const captureImageFromVideo = (): Promise<Blob> => {
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

  const handleCheckPills = async (triggeredByVoice: boolean = false) => {
    console.log('🔔 handleCheckPills called, triggeredByVoice:', triggeredByVoice);
    console.log('📷 Camera active:', cameraActive);
    console.log('📷 isCheckingPills:', isCheckingPills);
    
    // Prevent duplicate checks
    if (isCheckingPills) {
      console.log('⚠️  Already checking pills, ignoring duplicate request');
      return;
    }
    
    if (!cameraActive) {
      console.log('❌ Camera not active, showing error message');
      const systemMessage: Message = {
        sender: 'geni',
        text: 'Camera is not available right now. Please check your camera permissions.',
        time: getCurrentTime(),
        wasSpoken: triggeredByVoice
      };
      addMessage(systemMessage);
      // RULE: Speak only when spoken to
      // Only speak camera errors if user used voice (they can't see the error)
      if (speakOnlyWhenSpokenTo && triggeredByVoice) {
        speak(systemMessage.text);
      }
      return;
    }

    console.log('✅ Starting pill check...');
    setIsCheckingPills(true);
    setLastInteractionWasVoice(triggeredByVoice);
    
    // NO hardcoded messages - let GENI brain handle everything
    try {
      console.log('📸 Capturing image from video...');
      const imageBlob = await captureImageFromVideo();
      console.log('✅ Image captured, size:', imageBlob.size);
      
      console.log('🔍 Sending to pill check API... (this may take 5-10 seconds)');
      const startTime = Date.now();
      
      const result = await api.checkPills(imageBlob);
      
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✅ API response received in ${elapsed}s:`, result);
      
      // Use GENI brain-generated contextual response (no more hardcoded responses!)
      const responseText = result.responseText || 'Let me check that for you...';
      
      console.log('💬 Adding result message:', responseText);
      const resultMessage: Message = {
        sender: 'geni',
        text: responseText,
        time: getCurrentTime(),
        wasSpoken: triggeredByVoice
      };
      
      // Add message via helper (saves to storage + forces re-render)
      addMessage(resultMessage);
      console.log('💬 Message added, total:', getMessages().length);
      
      // CRITICAL: Set checking to false BEFORE speaking/delay
      setIsCheckingPills(false);
      console.log('✅ Pill check complete, state updated');
      
      // Small delay to ensure state update before speaking
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // RULE: Speak only when spoken to
      // If user used voice → respond with voice
      // If user clicked button → respond with text only
      if (speakOnlyWhenSpokenTo && triggeredByVoice) {
        console.log('🔊 Speaking response (triggered by voice)');
        speak(resultMessage.text);
      } else {
        console.log('🔇 Not speaking (triggered by button click)');
      }
      
    } catch (error) {
      console.error('❌ Pill check error:', error);
      setIsCheckingPills(false);
      const errorMessage: Message = {
        sender: 'geni',
        text: 'Sorry, I had trouble checking the pills. Please try again.',
        time: getCurrentTime(),
        wasSpoken: triggeredByVoice
      };
      addMessage(errorMessage);
      // RULE: Speak only when spoken to
      if (speakOnlyWhenSpokenTo && triggeredByVoice) {
        speak(errorMessage.text);
      }
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Use ElevenLabs TTS (imported from services/tts.ts)
  const speak = (text: string) => {
    ttsSpeak(text); // Calls ElevenLabs API, falls back to browser TTS on error
  };

  const handleVoiceToggle = async () => {
    if (isRecording) {
      setIsRecording(false);
      recorderControls.stopRecording();
      
      // Get recorded audio blob
      const audioBlob = await recorderControls.recordedBlob;
      
      if (audioBlob) {
        try {
          // Mark that this was a voice interaction
          setLastInteractionWasVoice(true);
          
          // Show user message (transcription will come from API)
          setIsTyping(true);
          
          // Send to Whisper API
          const result = await api.sendVoice(audioBlob);
          
          setIsTyping(false);
          
          // Add user message (transcribed)
          const userMessage: Message = {
            sender: 'user',
            text: result.transcription,
            time: getCurrentTime()
          };
          addMessage(userMessage);
          
          // Check if user asked to check pills
          const transcription = result.transcription.toLowerCase();
          if (transcription.includes('check') && 
              (transcription.includes('pill') || transcription.includes('medication') || transcription.includes('med'))) {
            // Auto-trigger pill check (voice-triggered)
            setTimeout(() => {
              handleCheckPills(true);
            }, 500);
            return; // GENI will respond after pill check
          }
          
          // Add GENI response
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            const geniResponse: Message = {
              sender: 'geni',
              text: result.response,
              time: getCurrentTime(),
              wasSpoken: true // Voice in → Voice out
            };
            addMessage(geniResponse);
            
            // RULE: Voice in → Voice out
            // User spoke to us, so we speak back (they're not looking at screen)
            speak(result.response);
          }, 300);
          
        } catch (error) {
          console.error('Voice error:', error);
          setIsTyping(false);
          
          const errorMessage: Message = {
            sender: 'geni',
            text: 'Sorry, I had trouble hearing you. Could you try again?',
            time: getCurrentTime(),
            wasSpoken: true
          };
          addMessage(errorMessage);
          // Always speak voice-related errors (user is trying to use voice)
          speak(errorMessage.text);
        }
      }
    } else {
      try {
        setIsRecording(true);
        await recorderControls.startRecording();
      } catch (error) {
        console.error('Microphone error:', error);
        setIsRecording(false);
        
        const errorMessage: Message = {
          sender: 'geni',
          text: 'I need microphone access to hear you. Please enable microphone permissions.',
          time: getCurrentTime(),
          wasSpoken: true
        };
        addMessage(errorMessage);
        // Always speak mic permission errors (user is trying to use voice)
        speak(errorMessage.text);
      }
    }
  };

  // Debug: Log current state on every render
  console.log('🔄 Render - messages.length:', messages.length, 'isCheckingPills:', isCheckingPills);

  const clearChat = () => {
    sessionStorage.removeItem('geni_messages');
    setRenderKey(prev => prev + 1);
    console.log('🗑️ Chat cleared');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">GENI</h1>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear chat
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-6 flex flex-col">
        
        {/* Camera Feed */}
        <div className="mb-6 bg-gray-900 rounded-xl overflow-hidden aspect-video relative">
          {cameraError ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white text-center px-6">
              <div>
                <Camera size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">{cameraError}</p>
              </div>
            </div>
          ) : (
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted
              className="w-full h-full object-cover"
            />
          )}
          {cameraActive && (
            <div className="absolute bottom-3 left-3 flex gap-2">
              <div className="text-white text-xs bg-black/60 px-2 py-1 rounded flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                {isMonitoring ? 'Auto Monitoring' : 'Camera Active'}
              </div>
              <button
                onClick={() => handleCheckPills(false)}
                disabled={isCheckingPills || isMonitoring}
                className="text-white text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-3 py-1 rounded font-medium flex items-center gap-1 transition-colors"
              >
                <Camera size={12} />
                {isCheckingPills ? 'Checking...' : 'Check Now'}
              </button>
              <button
                onClick={() => isMonitoring ? stopMonitoring() : startMonitoring()}
                className={`text-white text-xs ${isMonitoring ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'} px-3 py-1 rounded font-medium flex items-center gap-1 transition-colors`}
              >
                {isMonitoring ? <PauseCircle size={12} /> : <PlayCircle size={12} />}
                {isMonitoring ? 'Stop Auto' : 'Start Auto'}
              </button>
              {lastCheck && (
                <div className="text-white text-xs bg-black/40 px-2 py-1 rounded">
                  Last: {lastCheck.toLocaleTimeString()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Conversation Area */}
        <div className="flex-1 mb-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-xl text-gray-600 font-medium">
                How can I help you?
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-sm p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-gray-900 text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">
                      {message.text}
                    </p>
                    {message.sender === 'geni' && message.wasSpoken && (
                      <button
                        onClick={() => speak(message.text)}
                        className="mt-2 text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                      >
                        <Volume2 size={12} />
                        Listen again
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Voice Input (Centered, Large) */}
        <div className="flex flex-col items-center gap-4 mb-6">
          {isRecording && (
            <div className="w-full max-w-xs">
              <VoiceVisualizer
                controls={recorderControls}
                height={50}
                width={300}
                barWidth={3}
                mainBarColor="#111827"
                secondaryBarColor="#9CA3AF"
              />
            </div>
          )}
          
          <button
            onClick={handleVoiceToggle}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 shadow-xl ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 scale-110'
                : 'bg-gray-900 hover:bg-gray-800'
            }`}
          >
            <Mic className="w-10 h-10 text-white" />
          </button>
          
          <span className="text-base text-gray-600 font-medium">
            {isRecording ? 'Listening...' : '🎤 Tap to speak'}
          </span>
        </div>

        {/* Bottom Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onBackToDashboard}
            className="h-12 bg-white border-2 border-gray-300 hover:bg-gray-50 transition-colors font-semibold text-gray-700 flex items-center justify-center gap-2 rounded-lg"
          >
            <LayoutDashboard size={18} />
            📊 Dashboard
          </button>
          <button
            onClick={onTriggerEmergency}
            className="h-12 bg-red-600 text-white hover:bg-red-700 transition-colors font-bold flex items-center justify-center gap-2 rounded-lg shadow-lg"
          >
            <AlertOctagon size={18} />
            🆘 Emergency
          </button>
        </div>
      </div>
    </div>
  );
}
