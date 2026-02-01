/**
 * Loading Spinner Component
 * Shows when GENI is processing
 */

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export function LoadingSpinner({ message = 'Processing...', size = 'medium' }: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-4">
      <div className="relative">
        {/* Outer spinning ring */}
        <div className={`${sizeClasses[size]} border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin`}></div>
        
        {/* Pulsing center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      {message && (
        <p className="text-sm text-gray-600 animate-pulse">{message}</p>
      )}
    </div>
  );
}

/**
 * Typing Indicator
 * Shows when GENI is composing a response
 */
export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-purple-50 rounded-2xl w-fit">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span className="text-xs text-purple-600 ml-2">GENI is thinking...</span>
    </div>
  );
}

/**
 * Recording Indicator
 * Shows when voice recording is active
 */
interface RecordingIndicatorProps {
  duration: number;
  onCancel: () => void;
  onSend: () => void;
}

export function RecordingIndicator({ duration, onCancel, onSend }: RecordingIndicatorProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-red-50 border-2 border-red-300 rounded-lg animate-pulse">
      <div className="flex items-center gap-3">
        {/* Pulsing red dot */}
        <div className="relative flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
        </div>
        
        <span className="text-sm font-medium text-red-700">Recording</span>
        <span className="text-sm text-red-600 font-mono">{formatDuration(duration)}</span>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSend}
          className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}

/**
 * Camera Analysis Overlay
 * Shows when analyzing pill organizer
 */
interface CameraOverlayProps {
  status: 'idle' | 'capturing' | 'analyzing' | 'complete';
  progress?: number;
}

export function CameraAnalysisOverlay({ status, progress = 0 }: CameraOverlayProps) {
  if (status === 'idle') return null;

  const statusConfig = {
    capturing: {
      color: 'blue',
      icon: '📸',
      text: 'Capturing image...',
    },
    analyzing: {
      color: 'purple',
      icon: '🔍',
      text: 'Analyzing with AI...',
    },
    complete: {
      color: 'green',
      icon: '✅',
      text: 'Analysis complete!',
    },
  };

  const config = statusConfig[status];
  const colorClasses = {
    blue: 'border-blue-500 bg-blue-500/20 text-blue-700',
    purple: 'border-purple-500 bg-purple-500/20 text-purple-700',
    green: 'border-green-500 bg-green-500/20 text-green-700',
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className={`${colorClasses[config.color]} border-4 rounded-lg p-4 backdrop-blur-sm`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl animate-pulse">{config.icon}</span>
          <div>
            <p className="font-medium">{config.text}</p>
            {status === 'analyzing' && progress > 0 && (
              <div className="mt-2 w-48 h-2 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
