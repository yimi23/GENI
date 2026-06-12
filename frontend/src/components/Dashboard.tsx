import { MessageCircle, Calendar, AlertOctagon } from 'lucide-react';
import { ProfileCard } from './dashboard/ProfileCard';
import { MedicationCard } from './dashboard/MedicationCard';
import { HardwareStatusPanel } from './dashboard/HardwareStatusPanel';
import { ContactsCard } from './dashboard/ContactsCard';
import { RemindersCard } from './dashboard/RemindersCard';
import { ActivityFeed } from './dashboard/ActivityFeed';
import { useStatus } from '../hooks/useStatus';

interface DashboardProps {
  onOpenChat: () => void;
  onOpenMedicationHistory: () => void;
  onTriggerEmergency: () => void;
}

export function Dashboard({ onOpenChat, onOpenMedicationHistory, onTriggerEmergency }: DashboardProps) {
  const { data } = useStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <img src="/geni-logo.png" alt="GENI" className="h-10 w-auto object-contain" />
            <span className="text-gray-500 text-sm">{data?.patient?.name ? `${data.patient.name.split(' ')[0]}'s Home` : 'Home'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Online</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Top Row - Profile + Medications */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          <div className="col-span-4">
            <ProfileCard patient={data?.patient} contacts={data?.contacts} />
          </div>
          <div className="col-span-8">
            <MedicationCard />
          </div>
        </div>

        {/* Second Row - Hardware Status + Contacts/Reminders */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          <div className="col-span-4">
            <HardwareStatusPanel />
          </div>
          <div className="col-span-8">
            <div className="grid grid-cols-2 gap-4">
              <ContactsCard contacts={data?.contacts} patientName={data?.patient?.name} />
              <RemindersCard />
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="mb-4">
          <ActivityFeed />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={onOpenChat}
            className="h-10 px-4 bg-gray-900 text-white hover:bg-gray-800 transition-colors font-medium text-sm flex items-center justify-center gap-2 rounded-md"
          >
            <MessageCircle size={16} />
            Open Chat
          </button>
          <button
            onClick={onOpenMedicationHistory}
            className="h-10 px-4 border border-gray-300 hover:bg-gray-50 transition-colors font-medium text-sm flex items-center justify-center gap-2 rounded-md"
          >
            <Calendar size={16} />
            Med History
          </button>
          <button
            onClick={onTriggerEmergency}
            className="h-10 px-4 bg-red-600 text-white hover:bg-red-700 transition-colors font-semibold text-sm flex items-center justify-center gap-2 rounded-md shadow-md"
          >
            <AlertOctagon size={16} />
            🆘 Emergency
          </button>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
