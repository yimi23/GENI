import { Volume2, Reply, X } from 'lucide-react';

interface IncomingMessageBannerProps {
  senderName: string;
  senderRelation: string;
  message: string;
  onListen: () => void;
  onReply: () => void;
  onDismiss: () => void;
}

export function IncomingMessageBanner({
  senderName,
  senderRelation,
  message,
  onListen,
  onReply,
  onDismiss
}: IncomingMessageBannerProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-orange-50 border-b border-orange-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-start justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">New Message</h2>
          <button
            onClick={onDismiss}
            className="w-6 h-6 flex items-center justify-center hover:bg-orange-100 rounded transition-colors"
          >
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        <div className="mb-4">
          <div className="mb-2">
            <span className="text-sm font-medium text-orange-700">
              From: {senderName} ({senderRelation})
            </span>
          </div>

          <div className="bg-white p-4 border border-orange-200 rounded-md">
            <p className="text-sm leading-relaxed text-gray-900">
              {message}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onListen}
            className="h-9 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 rounded-md"
          >
            <Volume2 size={14} />
            Listen
          </button>
          <button
            onClick={onReply}
            className="h-9 px-4 border border-orange-500 hover:bg-orange-50 font-medium text-sm transition-colors flex items-center justify-center gap-2 rounded-md"
          >
            <Reply size={14} />
            Reply
          </button>
        </div>
      </div>
    </div>
  );
}