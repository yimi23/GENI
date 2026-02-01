const API_URL = (import.meta.env as Record<string, any>).VITE_API_URL || 'http://localhost:5001';

// Helper function to add timeout to fetch
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = 30000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = () => reject(reader.error || new Error('FileReader error'));
    reader.readAsDataURL(blob);
  });
}

export const api = {
  // Get dashboard status
  async getStatus() {
    const response = await fetchWithTimeout(`${API_URL}/api/status`, {}, 5000);
    if (!response.ok) throw new Error('Failed to fetch status');
    return response.json();
  },

  // Send chat message
  async sendChat(message: string) {
    const response = await fetchWithTimeout(
      `${API_URL}/api/chat`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      },
      15000 // 15 second timeout for Claude
    );
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },

  // Send voice audio
  async sendVoice(audioBlob: Blob) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice.webm');
    
    const response = await fetchWithTimeout(
      `${API_URL}/api/voice`,
      {
        method: 'POST',
        body: formData,
      },
      30000 // 30 second timeout for Whisper + Claude
    );
    if (!response.ok) throw new Error('Failed to send voice');
    return response.json();
  },

  // Check pills via camera
  async checkPills(imageBlob: Blob) {
    const image = await blobToDataUrl(imageBlob);
    console.log('🔍 API: Sending pill check request...');
    const response = await fetchWithTimeout(
      `${API_URL}/api/vision/analyze`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, source: 'manual' }),
      },
      30000 // 30 second timeout for Vision API
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API: Pill check failed:', response.status, errorText);
      throw new Error(`Pill check failed: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ API: Pill check response:', result);
    return result.pillCheck ? { ...result.pillCheck.result, ...result.pillCheck, fallPose: result.fallPose } : result;
  },

  // Send WhatsApp message
  async sendMessage(to: string, message: string, contactName?: string) {
    const response = await fetch(`${API_URL}/api/send-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, message, contactName }),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },

  // Trigger emergency
  async triggerEmergency(type = 'fall') {
    const response = await fetch(`${API_URL}/api/emergency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    });
    if (!response.ok) throw new Error('Failed to trigger emergency');
    return response.json();
  },

  // Confirm medication manually
  async confirmMedication(medicationName: string) {
    const response = await fetch(`${API_URL}/api/medication/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medicationName }),
    });
    if (!response.ok) throw new Error('Failed to confirm medication');
    return response.json();
  },

  // Get medication history
  async getMedicationHistory() {
    const response = await fetch(`${API_URL}/api/medication/history`);
    if (!response.ok) throw new Error('Failed to fetch history');
    return response.json();
  },

  // Voice calling
  async callCaregiver(contactId: string, reason: string) {
    const response = await fetch(`${API_URL}/api/call/caregiver`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactId, reason }),
    });
    if (!response.ok) throw new Error('Failed to call caregiver');
    return response.json();
  },

  async callDoctor(doctorName: string, reason: string) {
    const response = await fetch(`${API_URL}/api/call/doctor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctorName, reason }),
    });
    if (!response.ok) throw new Error('Failed to call doctor');
    return response.json();
  },

  async callEmergency(reason: string) {
    const response = await fetch(`${API_URL}/api/call/emergency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!response.ok) throw new Error('Failed to call emergency');
    return response.json();
  },

  // Fall detection
  async fallOkay() {
    const response = await fetch(`${API_URL}/api/fall/okay`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to report okay');
    return response.json();
  },

  async fallHelp() {
    const response = await fetch(`${API_URL}/api/fall/help`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to call for help');
    return response.json();
  },

  async fallCancel() {
    const response = await fetch(`${API_URL}/api/fall/cancel`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to cancel alert');
    return response.json();
  },

  async fallStatus() {
    const response = await fetch(`${API_URL}/api/fall/status`);
    if (!response.ok) throw new Error('Failed to get fall status');
    return response.json();
  },
};
