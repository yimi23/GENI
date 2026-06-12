import { Phone, MessageSquare } from 'lucide-react';
import { api } from '../../services/api';
import { useState } from 'react';

interface Contact {
  name: string;
  relationship: string;
  phone: string;
  isPrimary?: boolean;
}

interface ContactsCardProps {
  contacts?: Contact[];
  patientName?: string;
}

export function ContactsCard({ contacts: propsContacts, patientName }: ContactsCardProps) {
  const displayName = patientName || 'The patient';
  const [calling, setCalling] = useState<string | null>(null);
  const [messaging, setMessaging] = useState<string | null>(null);
  
  const contacts = propsContacts || [];

  const handleCall = async (contact: Contact) => {
    try {
      setCalling(contact.name);
      
      if (contact.relationship.includes('Doctor') || contact.relationship.includes('Primary Care')) {
        await api.callDoctor(contact.name, `${displayName} requested to speak with you`);
      } else {
        await api.callCaregiver(contact.name, `${displayName} wants to speak with you`);
      }
      
      // Show success notification (you could use a toast library here)
      alert(`📞 Calling ${contact.name}...\n\nTheir phone will ring shortly with a voice message from GENI.`);
    } catch (error) {
      console.error('Call failed:', error);
      alert(`❌ Failed to call ${contact.name}. Please try again.`);
    } finally {
      setCalling(null);
    }
  };

  const handleMessage = async (contact: Contact) => {
    const message = prompt(`Message to ${contact.name}:`);
    if (message && message.trim()) {
      try {
        setMessaging(contact.name);
        await api.sendMessage(contact.phone, message, contact.name);
        alert(`✅ Message sent to ${contact.name}!`);
      } catch (error) {
        console.error('Message failed:', error);
        alert(`❌ Failed to send message to ${contact.name}`);
      } finally {
        setMessaging(null);
      }
    }
  };

  return (
    <div className="border border-gray-200 bg-white rounded-lg p-5">
      <h2 className="text-base font-semibold mb-4 text-gray-900">Contacts</h2>

      <div className="space-y-4">
        {contacts.map((contact, index) => (
          <div key={index} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
            <div className="mb-3">
              <div className="font-medium text-sm mb-0.5 text-gray-900">{contact.name}</div>
              <div className="text-xs text-gray-500">{contact.relationship} • {contact.phone}</div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleCall(contact)}
                disabled={calling === contact.name}
                className="flex-1 h-8 px-3 border border-gray-300 hover:bg-gray-50 transition-colors font-medium text-xs flex items-center justify-center gap-1.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Phone size={14} />
                {calling === contact.name ? 'Calling...' : 'Call'}
              </button>
              {(contact.isPrimary || contact.relationship === 'Daughter') && (
                <button 
                  onClick={() => handleMessage(contact)}
                  disabled={messaging === contact.name}
                  className="flex-1 h-8 px-3 border border-gray-300 hover:bg-gray-50 transition-colors font-medium text-xs flex items-center justify-center gap-1.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageSquare size={14} />
                  {messaging === contact.name ? 'Sending...' : 'Message'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}