const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
let currentAudio: HTMLAudioElement | null = null;

export async function speak(text: string): Promise<void> {
  try {
    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    
    // Call backend TTS endpoint (ElevenLabs)
    const response = await fetch(`${API_URL}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      console.error('TTS request failed, falling back to browser TTS');
      speakWithBrowser(text);
      return;
    }
    
    // Get audio blob
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Play audio
    currentAudio = new Audio(audioUrl);
    currentAudio.play();
    
    // Cleanup after playing
    currentAudio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
    };
    
  } catch (error) {
    console.error('TTS error:', error);
    // Fallback to browser TTS
    speakWithBrowser(text);
  }
}

// Fallback to browser TTS if ElevenLabs fails
function speakWithBrowser(text: string, rate: number = 0.85): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn('Text-to-speech not supported');
  }
}

export function stopSpeaking(): void {
  // Stop ElevenLabs audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  
  // Stop browser TTS
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
