import { Check, Clock, X, ArrowRight } from 'lucide-react';

interface Medication {
  name: string;
  pills: string;
  status: 'taken' | 'pending' | 'missed' | 'upcoming';
}

interface MedicationSection {
  title: string;
  time: string;
  medications: Medication[];
}

const medicationSchedule: MedicationSection[] = [
  {
    title: 'Morning',
    time: '8:00 AM',
    medications: [
      { name: 'Metformin', pills: '500mg', status: 'taken' },
      { name: 'Vitamin D', pills: '1000 IU', status: 'taken' }
    ]
  },
  {
    title: 'Afternoon',
    time: '2:00 PM',
    medications: [
      { name: 'Blood Pressure Med', pills: 'Lisinopril 10mg', status: 'pending' }
    ]
  },
  {
    title: 'Evening',
    time: '8:00 PM',
    medications: [
      { name: 'Metformin', pills: '500mg', status: 'upcoming' }
    ]
  }
];

function getStatusStyle(status: string) {
  switch (status) {
    case 'taken':
      return {
        icon: <Check size={14} />,
        text: 'Taken',
        bg: 'bg-green-50',
        border: 'border-green-200',
        text_color: 'text-green-700'
      };
    case 'pending':
      return {
        icon: <Clock size={14} />,
        text: 'Pending',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text_color: 'text-yellow-700'
      };
    case 'missed':
      return {
        icon: <X size={14} />,
        text: 'Missed',
        bg: 'bg-red-50',
        border: 'border-red-200',
        text_color: 'text-red-700'
      };
    case 'upcoming':
      return {
        icon: <ArrowRight size={14} />,
        text: 'Upcoming',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text_color: 'text-gray-700'
      };
  }
}

export function MedicationCard() {
  const totalMeds = medicationSchedule.reduce((acc, section) => acc + section.medications.length, 0);
  const takenMeds = medicationSchedule.reduce(
    (acc, section) => acc + section.medications.filter(m => m.status === 'taken').length,
    0
  );

  return (
    <div className="border border-gray-200 bg-white rounded-lg p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-gray-900">Today's Medications</h2>
        <span className="text-sm text-gray-500 font-medium">
          {takenMeds} of {totalMeds} taken
        </span>
      </div>

      <div className="space-y-5">
        {medicationSchedule.map((section, idx) => (
          <div key={idx}>
            {/* Section header */}
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold text-gray-900">{section.title}</h3>
              <span className="text-xs text-gray-400">{section.time}</span>
            </div>

            {/* Medications in this time period */}
            <div className="space-y-2">
              {section.medications.map((med, medIdx) => {
                const style = getStatusStyle(med.status);
                return (
                  <div
                    key={medIdx}
                    className={`p-3 border rounded-md ${style?.bg} ${style?.border} flex items-center justify-between`}
                  >
                    <div>
                      <div className="font-medium text-sm mb-0.5 text-gray-900">{med.name}</div>
                      <div className="text-xs text-gray-600">{med.pills}</div>
                    </div>
                    <div className={`flex items-center gap-1.5 font-medium text-xs ${style?.text_color}`}>
                      {style?.icon}
                      <span>{style?.text}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}