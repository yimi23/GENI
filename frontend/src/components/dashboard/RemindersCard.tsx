interface Reminder {
  time: string;
  message: string;
}

const reminders: Reminder[] = [
  { time: '2:00 PM', message: 'Afternoon medication' },
  { time: '3:30 PM', message: 'Doctor appointment' },
  { time: '5:00 PM', message: 'Call Sarah back' },
  { time: '8:00 PM', message: 'Evening medication' }
];

export function RemindersCard() {
  return (
    <div className="border border-gray-200 bg-white rounded-lg p-5">
      <h2 className="text-base font-semibold mb-4 text-gray-900">Reminders</h2>

      <div className="space-y-0.5">
        {reminders.map((reminder, index) => (
          <div key={index} className="flex items-center gap-4 py-2.5 hover:bg-gray-50 rounded-md px-2 transition-colors">
            <span className="text-xs font-medium text-gray-500 min-w-[60px]">{reminder.time}</span>
            <span className="text-sm text-gray-900">{reminder.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}