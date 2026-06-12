import { User, Phone, MessageSquare, Settings } from 'lucide-react';

interface ProfileCardProps {
  patient?: { name: string; age: number; conditions: string[]; allergies: string[] };
  contacts?: { name: string; relationship: string; phone: string; isPrimary?: boolean }[];
}

export function ProfileCard({ patient, contacts }: ProfileCardProps) {
  const primary = contacts?.find(c => c.isPrimary) || contacts?.[0];
  return (
    <div className="border border-gray-200 bg-white rounded-lg">
      {/* Header with avatar and name */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User size={20} className="text-gray-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold mb-0.5 text-gray-900">{patient?.name || '—'}</h2>
              <div className="text-sm text-gray-500">{patient ? `Age ${patient.age}` : ''}</div>
            </div>
          </div>
          <button className="p-1.5 hover:bg-gray-50 rounded transition-colors">
            <Settings size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Health conditions - subtle pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(patient?.conditions || []).map(condition => (
            <span key={condition} className="px-2.5 py-1 bg-gray-50 text-gray-700 rounded-full text-xs font-medium">
              {condition}
            </span>
          ))}
        </div>

        {/* Allergies - minimal red accent */}
        {(patient?.allergies?.length ?? 0) > 0 && (
          <div className="bg-red-50 rounded-md p-3 mb-4 border-l-2 border-red-400">
            <div className="text-sm text-red-900">
              <span className="font-medium">Allergies:</span> {patient!.allergies.join(', ')}
            </div>
          </div>
        )}

        {/* Emergency contact */}
        <div>
          <h3 className="text-xs font-medium mb-2 text-gray-500 uppercase tracking-wide">Emergency Contact</h3>
          <div className="mb-3">
            <div className="text-sm font-medium mb-0.5 text-gray-900">{primary?.name || 'Not configured'}</div>
            <div className="text-xs text-gray-500">{primary ? `${primary.relationship} • ${primary.phone}` : ''}</div>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 h-9 px-3 bg-gray-900 text-white hover:bg-gray-800 transition-colors font-medium text-sm flex items-center justify-center gap-1.5 rounded-md">
              <Phone size={14} />
              Call
            </button>
            <button className="flex-1 h-9 px-3 border border-gray-300 hover:bg-gray-50 transition-colors font-medium text-sm flex items-center justify-center gap-1.5 rounded-md">
              <MessageSquare size={14} />
              Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}