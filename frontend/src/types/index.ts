export interface Patient {
  name: string;
  age: number;
  conditions: string[];
  allergies: string[];
}

export interface Contact {
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

export interface Medication {
  name: string;
  dosage: string;
  time: string;
  status: 'taken' | 'pending' | 'missed' | 'upcoming';
  period: 'morning' | 'afternoon' | 'evening';
}

export interface Activity {
  id: string;
  time: string;
  message: string;
  type: 'medication' | 'message' | 'voice' | 'movement' | 'reminder' | 'emergency' | 'system';
  timestamp: number;
}

export interface Reminder {
  id: string;
  time: string;
  message: string;
  completed: boolean;
  type: 'medication' | 'appointment' | 'call' | 'general';
}

export interface HardwareStatus {
  online: boolean;
  leds: {
    red: boolean;
    yellow: boolean;
    green: boolean;
  };
  buzzer: boolean;
  button: 'idle' | 'pressed';
  lastSync: number;
}

export interface DashboardData {
  patient: Patient;
  contacts: Contact[];
  medications: Medication[];
  activities: Activity[];
  reminders: Reminder[];
  hardware: HardwareStatus;
}

export interface IncomingMessage {
  from: string;
  senderName: string;
  message: string;
  timestamp: number;
}
