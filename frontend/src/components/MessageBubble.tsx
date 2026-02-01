/**
 * Enhanced Message Bubble Component
 * Better styling, animations, and accessibility
 */

import { Volume2, Check } from 'lucide-react';

interface MessageBubbleProps {
  sender: 'geni' | 'user';
  text: string;
  time: string;
  wasSpoken?: boolean;
  isNew?: boolean;
}

export function MessageBubble({ sender, text, time, wasSpoken = false, isNew = false }: MessageBubbleProps) {
  const isGeni = sender === 'geni';

  return (
    <div
      className={`flex ${isGeni ? 'justify-start' : 'justify-end'} mb-4 ${
        isNew ? 'animate-slide-in-up' : ''
      }`}
    >
      <div className={`flex items-end gap-2 max-w-[80%] ${isGeni ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow-md ${
            isGeni
              ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white'
              : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
          }`}
        >
          {isGeni ? '🐾' : '👤'}
        </div>

        {/* Message Content */}
        <div className="flex flex-col gap-1">
          {/* Sender Name */}
          <span className={`text-xs font-medium ${isGeni ? 'text-purple-600' : 'text-blue-600'} px-2`}>
            {isGeni ? 'GENI' : 'You'}
          </span>

          {/* Message Bubble */}
          <div
            className={`px-4 py-3 rounded-2xl shadow-sm relative ${
              isGeni
                ? 'bg-gradient-to-br from-purple-50 to-purple-100 text-gray-800 rounded-bl-none'
                : 'bg-gradient-to-br from-blue-50 to-blue-100 text-gray-800 rounded-br-none'
            }`}
          >
            <p className="text-base leading-relaxed">{text}</p>

            {/* Indicators */}
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <span>{time}</span>
              {wasSpoken && isGeni && (
                <div className="flex items-center gap-1 text-purple-600" title="Message was spoken">
                  <Volume2 size={12} />
                  <span>Spoken</span>
                </div>
              )}
              {!isGeni && (
                <div className="flex items-center gap-1 text-blue-600" title="Message sent">
                  <Check size={12} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * System Message Component
 * For system notifications, status updates, etc.
 */
interface SystemMessageProps {
  text: string;
  type?: 'info' | 'warning' | 'success' | 'error';
}

export function SystemMessage({ text, type = 'info' }: SystemMessageProps) {
  const typeConfig = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: 'ℹ️',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      icon: '⚠️',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      icon: '✅',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: '❌',
    },
  };

  const config = typeConfig[type];

  return (
    <div className="flex justify-center my-3">
      <div className={`${config.bg} ${config.border} ${config.text} border rounded-lg px-4 py-2 text-sm flex items-center gap-2 shadow-sm`}>
        <span>{config.icon}</span>
        <span>{text}</span>
      </div>
    </div>
  );
}
