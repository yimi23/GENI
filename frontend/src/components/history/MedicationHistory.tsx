import { useState } from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';

interface DayData {
  day: string;
  date: number;
  status: 'all-taken' | 'partial' | 'none' | 'today';
  details: {
    time: string;
    medication: string;
    status: 'taken' | 'missed';
  }[];
}

const weekData: DayData[] = [
  {
    day: 'Mon',
    date: 27,
    status: 'all-taken',
    details: [
      { time: '8:00 AM', medication: 'Morning Pills (Metformin, Vitamin D)', status: 'taken' },
      { time: '2:00 PM', medication: 'Afternoon Pills (Blood Pressure Med)', status: 'taken' },
      { time: '8:00 PM', medication: 'Evening Pills (Metformin)', status: 'taken' }
    ]
  },
  {
    day: 'Tue',
    date: 28,
    status: 'all-taken',
    details: [
      { time: '8:00 AM', medication: 'Morning Pills (Metformin, Vitamin D)', status: 'taken' },
      { time: '2:00 PM', medication: 'Afternoon Pills (Blood Pressure Med)', status: 'taken' },
      { time: '8:00 PM', medication: 'Evening Pills (Metformin)', status: 'taken' }
    ]
  },
  {
    day: 'Wed',
    date: 29,
    status: 'partial',
    details: [
      { time: '8:00 AM', medication: 'Morning Pills (Metformin, Vitamin D)', status: 'taken' },
      { time: '2:00 PM', medication: 'Afternoon Pills (Blood Pressure Med)', status: 'missed' },
      { time: '8:00 PM', medication: 'Evening Pills (Metformin)', status: 'taken' }
    ]
  },
  {
    day: 'Thu',
    date: 30,
    status: 'all-taken',
    details: [
      { time: '8:00 AM', medication: 'Morning Pills (Metformin, Vitamin D)', status: 'taken' },
      { time: '2:00 PM', medication: 'Afternoon Pills (Blood Pressure Med)', status: 'taken' },
      { time: '8:00 PM', medication: 'Evening Pills (Metformin)', status: 'taken' }
    ]
  },
  {
    day: 'Fri',
    date: 31,
    status: 'none',
    details: [
      { time: '8:00 AM', medication: 'Morning Pills (Metformin, Vitamin D)', status: 'missed' },
      { time: '2:00 PM', medication: 'Afternoon Pills (Blood Pressure Med)', status: 'missed' },
      { time: '8:00 PM', medication: 'Evening Pills (Metformin)', status: 'missed' }
    ]
  },
  {
    day: 'Sat',
    date: 1,
    status: 'all-taken',
    details: [
      { time: '8:00 AM', medication: 'Morning Pills (Metformin, Vitamin D)', status: 'taken' },
      { time: '2:00 PM', medication: 'Afternoon Pills (Blood Pressure Med)', status: 'taken' },
      { time: '8:00 PM', medication: 'Evening Pills (Metformin)', status: 'taken' }
    ]
  },
  {
    day: 'Sun',
    date: 2,
    status: 'today',
    details: []
  }
];

interface MedicationHistoryProps {
  onBackToDashboard: () => void;
}

export function MedicationHistory({ onBackToDashboard }: MedicationHistoryProps) {
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'all-taken':
        return { 
          indicator: <div className="w-3 h-3 rounded-full bg-green-500 mx-auto mb-1.5"></div>,
          label: 'All taken', 
          color: 'text-green-600' 
        };
      case 'partial':
        return { 
          indicator: <div className="w-3 h-3 rounded-full bg-yellow-500 mx-auto mb-1.5"></div>,
          label: '1 missed', 
          color: 'text-yellow-600' 
        };
      case 'none':
        return { 
          indicator: <div className="w-3 h-3 rounded-full bg-red-500 mx-auto mb-1.5"></div>,
          label: 'None taken', 
          color: 'text-red-600' 
        };
      case 'today':
        return { 
          indicator: <div className="w-3 h-3 rounded-full bg-gray-300 mx-auto mb-1.5"></div>,
          label: 'Today', 
          color: 'text-gray-500' 
        };
      default:
        return { 
          indicator: <div className="w-3 h-3 rounded-full bg-gray-300 mx-auto mb-1.5"></div>,
          label: '', 
          color: 'text-gray-500' 
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Medication History</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-6">
        {/* 7-Day Calendar Strip */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-5">
          <h2 className="text-base font-semibold mb-5 text-gray-900">Last 7 Days</h2>
          
          <div className="grid grid-cols-7 gap-3">
            {weekData.map((day, idx) => {
              const statusDisplay = getStatusDisplay(day.status);
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDay(day)}
                  className={`p-4 border rounded-md transition-all flex flex-col items-center justify-center gap-2 ${
                    selectedDay?.date === day.date
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-xs font-medium text-gray-500">{day.day}</div>
                  <div className="text-lg font-semibold text-gray-900">{day.date}</div>
                  {statusDisplay.indicator}
                  <div className={`text-xs font-medium ${statusDisplay.color}`}>
                    {statusDisplay.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed View */}
        {selectedDay && selectedDay.status !== 'today' && (
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-base font-semibold mb-4 text-gray-900">
              {selectedDay.day}, January {selectedDay.date}
            </h2>

            <div className="space-y-2">
              {selectedDay.details.map((detail, idx) => (
                <div
                  key={idx}
                  className={`p-3 border rounded-md flex items-center justify-between ${
                    detail.status === 'taken'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div>
                    <div className="text-sm font-medium mb-0.5 text-gray-900">{detail.time}</div>
                    <div className="text-xs text-gray-600">{detail.medication}</div>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${
                    detail.status === 'taken' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {detail.status === 'taken' ? (
                      <>
                        <Check size={14} />
                        <span>Taken</span>
                      </>
                    ) : (
                      <>
                        <X size={14} />
                        <span>Missed</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedDay && selectedDay.status === 'today' && (
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-base font-semibold mb-3 text-gray-900">Today</h2>
            <p className="text-sm text-gray-600">
              Check the dashboard for today's medication schedule.
            </p>
          </div>
        )}

        {!selectedDay && (
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <p className="text-sm text-gray-600 text-center">
              Select a day to view medication details
            </p>
          </div>
        )}
      </main>
    </div>
  );
}