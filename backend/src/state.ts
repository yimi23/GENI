import { Patient, Contact } from './models/Patient';
import { Medication, MedicationHistory } from './models/Medication';
import { Activity, createActivity } from './models/Activity';
import { Reminder } from './models/Reminder';

interface AppState {
  patient: Patient;
  contacts: Contact[];
  todaysMedications: Medication[];
  medicationHistory: MedicationHistory[];
  activities: Activity[];
  reminders: Reminder[];
  hardwareStatus: {
    online: boolean;
    leds: {
      red: boolean;
      yellow: boolean;
      green: boolean;
    };
    buzzer: boolean;
    button: 'idle' | 'pressed';
    lastSync: number;
  };
}

export const state: AppState = {
  patient: {
    name: 'Margaret Johnson',
    age: 78,
    conditions: ['Diabetes', 'High Blood Pressure'],
    allergies: ['Penicillin', 'Sulfa'],
  },
  
  contacts: [
    {
      name: 'Praise',
      relationship: 'Caregiver',
      phone: '+19898540352',
      isPrimary: true,
    },
    {
      name: 'Family Member',
      relationship: 'Daughter',
      phone: '+17086648707',
      isPrimary: false,
    },
  ],
  
  todaysMedications: [
    {
      name: 'Metformin',
      dosage: '500mg',
      time: '8:00 AM',
      status: 'taken',
      period: 'morning',
    },
    {
      name: 'Vitamin D',
      dosage: '1000 IU',
      time: '8:00 AM',
      status: 'taken',
      period: 'morning',
    },
    {
      name: 'Blood Pressure Med',
      dosage: 'Lisinopril 10mg',
      time: '2:00 PM',
      status: 'pending',
      period: 'afternoon',
    },
    {
      name: 'Metformin',
      dosage: '500mg',
      time: '8:00 PM',
      status: 'upcoming',
      period: 'evening',
    },
  ],
  
  medicationHistory: [
    {
      date: '2024-01-27',
      day: 'Mon',
      dayNumber: 27,
      status: 'all-taken',
      details: [
        { time: '8:00 AM', medication: 'Morning Pills (Metformin, Vitamin D)', status: 'taken' },
        { time: '2:00 PM', medication: 'Afternoon Pills (Blood Pressure Med)', status: 'taken' },
        { time: '8:00 PM', medication: 'Evening Pills (Metformin)', status: 'taken' },
      ],
    },
    {
      date: '2024-01-28',
      day: 'Tue',
      dayNumber: 28,
      status: 'all-taken',
      details: [
        { time: '8:00 AM', medication: 'Morning Pills (Metformin, Vitamin D)', status: 'taken' },
        { time: '2:00 PM', medication: 'Afternoon Pills (Blood Pressure Med)', status: 'taken' },
        { time: '8:00 PM', medication: 'Evening Pills (Metformin)', status: 'taken' },
      ],
    },
    {
      date: '2024-01-29',
      day: 'Wed',
      dayNumber: 29,
      status: 'partial',
      details: [
        { time: '8:00 AM', medication: 'Morning Pills (Metformin, Vitamin D)', status: 'taken' },
        { time: '2:00 PM', medication: 'Afternoon Pills (Blood Pressure Med)', status: 'missed' },
        { time: '8:00 PM', medication: 'Evening Pills (Metformin)', status: 'taken' },
      ],
    },
    {
      date: '2024-01-30',
      day: 'Thu',
      dayNumber: 30,
      status: 'all-taken',
      details: [
        { time: '8:00 AM', medication: 'Morning Pills (Metformin, Vitamin D)', status: 'taken' },
        { time: '2:00 PM', medication: 'Afternoon Pills (Blood Pressure Med)', status: 'taken' },
        { time: '8:00 PM', medication: 'Evening Pills (Metformin)', status: 'taken' },
      ],
    },
  ],
  
  activities: [
    createActivity('GENI initialized and ready', 'system'),
  ],
  
  reminders: [
    {
      id: '1',
      time: '2:00 PM',
      message: 'Afternoon medication',
      completed: false,
      type: 'medication',
    },
    {
      id: '2',
      time: '3:30 PM',
      message: 'Doctor appointment',
      completed: false,
      type: 'appointment',
    },
    {
      id: '3',
      time: '8:00 PM',
      message: 'Evening medication',
      completed: false,
      type: 'medication',
    },
  ],
  
  hardwareStatus: {
    online: true,
    leds: {
      red: false,
      yellow: false,
      green: true,
    },
    buzzer: false,
    button: 'idle',
    lastSync: Date.now(),
  },
};

// Helper functions
export function addActivity(message: string, type: Activity['type']) {
  const activity = createActivity(message, type);
  state.activities.unshift(activity);
  
  // Keep only last 50 activities
  if (state.activities.length > 50) {
    state.activities = state.activities.slice(0, 50);
  }
  
  return activity;
}

export function updateMedicationStatus(medicationName: string, status: Medication['status']) {
  const med = state.todaysMedications.find(m => m.name === medicationName);
  if (med) {
    med.status = status;
    return true;
  }
  return false;
}

export function getPrimaryContact(): Contact | undefined {
  return state.contacts.find(c => c.isPrimary);
}
