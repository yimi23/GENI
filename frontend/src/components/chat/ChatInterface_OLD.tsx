import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Mic, Send, Volume2 } from 'lucide-react';
import { useVoiceVisualizer, VoiceVisualizer } from 'react-voice-visualizer';

interface Message {
  sender: 'geni' | 'user' | 'family';
  text: string;
  time: string;
  familyName?: string;
}

const initialMessages: Message[] = [
  {
    sender: 'geni',
    text: 'Good morning Margaret! You have 3 medications scheduled today and 1 appointment. Your morning pills are due now.',
    time: '9:00 AM'
  },
  {
    sender: 'user',
    text: 'I took my pills already',
    time: '9:02 AM'
  },
  {
    sender: 'geni',
    text: "Great! I've marked your morning medication as taken. Your next reminder is at 2:00 PM for your afternoon pills.",
    time: '9:02 AM'
  },
  {
    sender: 'user',
    text: 'Tell Sarah to pick up my prescription',
    time: '9:15 AM'
  },
  {
    sender: 'geni',
    text: "I'll let Sarah know to pick up your prescription. Message sent via WhatsApp.",
    time: '9:15 AM'
  },
  {
    sender: 'family',
    familyName: 'Sarah',
    text: "I'll pick it up on my way home. See you at 3pm!",
    time: '9:20 AM'
  }
];

const quickReplies = [
  'Yes',
  'No',
  'Call Sarah',
  'What are my medications?'
];

interface ChatInterfaceProps {
  onBackToDashboard: () => void;
}

export function ChatInterface({ onBackToDashboard }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recorderControls = useVoiceVisualizer();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      recorderControls.stopRecording();
      
      setTimeout(() => {
        const voiceMessage: Message = {
          sender: 'user',
          text: 'What time is my doctor appointment?',
          time: getCurrentTime()
        };
        setMessages(prev => [...prev, voiceMessage]);
        
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const geniResponse: Message = {
            sender: 'geni',
            text: 'Your doctor appointment is scheduled for 3:30 PM today.',
            time: getCurrentTime()
          };
          setMessages(prev => [...prev, geniResponse]);
        }, 1500);
      }, 500);
    } else {
      setIsRecording(true);
      recorderControls.startRecording();
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      sender: 'user',
      text: inputText,
      time: getCurrentTime()
    };

    setMessages([...messages, userMessage]);
    setInputText('');

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const geniResponse: Message = {
        sender: 'geni',
        text: "I understand. I'll help you with that right away.",
        time: getCurrentTime()
      };
      setMessages(prev => [...prev, geniResponse]);
    }, 1500);
  };

  const handleQuickReply = (reply: string) => {
    const userMessage: Message = {
      sender: 'user',
      text: reply,
      time: getCurrentTime()
    };

    setMessages([...messages, userMessage]);

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const geniResponse: Message = {
        sender: 'geni',
        text: "I understand. Let me help you with that.",
        time: getCurrentTime()
      };
      setMessages(prev => [...prev, geniResponse]);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Chat with GENI</h1>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-6 flex flex-col">
        <div
          className="flex-1 overflow-y-auto mb-5"
          style={{ maxHeight: 'calc(100vh - 350px)' }}
        >
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-lg p-4 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-gray-900 text-white'
                      : message.sender === 'family'
                      ? 'bg-orange-50 border border-orange-200'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className={`text-xs font-medium ${
                      message.sender === 'user' ? 'text-gray-300' : 
                      message.sender === 'family' ? 'text-orange-700' : 
                      'text-gray-500'
                    }`}>
                      {message.sender === 'user' 
                        ? 'Margaret' 
                        : message.sender === 'family'
                        ? `${message.familyName} (Daughter)`
                        : 'GENI'}
                    </span>
                    <span className={`text-xs ${
                      message.sender === 'user' ? 'text-gray-400' : 'text-gray-400'
                    }`}>
                      {message.time}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {message.text}
                  </p>
                  
                  {message.sender === 'family' && (
                    <button
                      onClick={() => speak(message.text)}
                      className="mt-3 h-8 px-3 bg-orange-500 text-white hover:bg-orange-600 transition-colors font-medium text-xs flex items-center gap-1.5 rounded-md"
                    >
                      <Volume2 size={14} />
                      Listen
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-4 rounded-lg">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick Replies */}
        <div className="mb-4 flex flex-wrap gap-2">
          {quickReplies.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickReply(reply)}
              className="h-8 px-3 bg-white hover:bg-gray-50 border border-gray-200 transition-colors font-medium text-sm rounded-full"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          {isRecording && (
            <div className="mb-3 flex items-center justify-center">
              <VoiceVisualizer
                controls={recorderControls}
                height={50}
                width={250}
                barWidth={2}
                mainBarColor="#111827"
                secondaryBarColor="#9CA3AF"
              />
            </div>
          )}
          
          <div className="flex items-end gap-3">
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={handleVoiceToggle}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-gray-900 hover:bg-gray-800'
                }`}
              >
                <Mic className="w-5 h-5 text-white" />
              </button>
              <span className="text-xs text-gray-500 font-medium">Speak</span>
            </div>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm bg-gray-50"
            />

            <button
              onClick={handleSendMessage}
              className="w-14 h-14 bg-gray-900 text-white hover:bg-gray-800 transition-colors flex items-center justify-center rounded-full"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}