import { Pill, MessageSquare, Mic, Activity, Bell } from 'lucide-react';

interface ActivityItem {
  time: string;
  message: string;
  type: 'medication' | 'message' | 'voice' | 'movement' | 'reminder';
}

const activities: ActivityItem[] = [
  { time: '10:32 AM', message: 'Morning medication taken (confirmed by camera)', type: 'medication' },
  { time: '10:30 AM', message: 'Sent message to Sarah: "Pick up prescription"', type: 'message' },
  { time: '10:15 AM', message: 'Voice command received', type: 'voice' },
  { time: '9:45 AM', message: 'Movement detected in kitchen', type: 'movement' },
  { time: '8:05 AM', message: 'Medication reminder sent', type: 'reminder' },
  { time: '8:00 AM', message: 'Morning medication time', type: 'medication' }
];

function getActivityIcon(type: string) {
  const iconProps = { size: 14, className: 'text-gray-400' };
  
  switch (type) {
    case 'medication':
      return <Pill {...iconProps} />;
    case 'message':
      return <MessageSquare {...iconProps} />;
    case 'voice':
      return <Mic {...iconProps} />;
    case 'movement':
      return <Activity {...iconProps} />;
    case 'reminder':
      return <Bell {...iconProps} />;
    default:
      return <Bell {...iconProps} />;
  }
}

export function ActivityFeed() {
  return (
    <div className="border border-gray-200 bg-white rounded-lg p-5">
      <h2 className="text-base font-semibold mb-4 text-gray-900">Recent Activity</h2>

      <div className="space-y-0.5">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3 py-2 hover:bg-gray-50 rounded-md px-2 transition-colors">
            <div className="pt-0.5">
              {getActivityIcon(activity.type)}
            </div>
            <span className="text-xs text-gray-500 font-mono min-w-[65px] flex-shrink-0">
              {activity.time}
            </span>
            <span className="text-sm text-gray-900 flex-1">
              {activity.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}