const API_URL = (import.meta.env as Record<string, any>).VITE_API_URL || 'http://localhost:5001';
let currentAudio: HTMLAudioElement | null = null;
let isSpeaking = false;
const ttsQueue: string[] = [];

export async function speak(text: string): Promise<void> {
  if (!text.trim()) return;
  ttsQueue.push(text);
  if (isSpeaking) return;
  await drainQueue();
}

async function drainQueue(): Promise<void> {
  if (isSpeaking) return;
  isSpeaking = true;
  
  while (ttsQueue.length > 0) {
    const text = ttsQueue.shift()!;
    await playOnce(text);
  }
  
  isSpeaking = false;
}

async function playOnce(text: string): Promise<void> {
  return new Promise((resolve) => {
    try {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
      
      fetch(`${API_URL}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      }).then(async (response) => {
        if (!response.ok) {
          console.warn('ElevenLabs TTS failed, using browser TTS');
          speakWithBrowser(text);
          resolve();
          return;
        }
        
        try {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          currentAudio = new Audio(audioUrl);
          
          currentAudio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            currentAudio = null;
            resolve();
          };
          
          currentAudio.onerror = () => {
            console.warn('Audio playback failed, using browser TTS');
            URL.revokeObjectURL(audioUrl);
            currentAudio = null;
            speakWithBrowser(text);
            resolve();
          };
          
          currentAudio.play().catch((err) => {
            console.warn('Audio play failed:', err);
            URL.revokeObjectURL(audioUrl);
            currentAudio = null;
            speakWithBrowser(text);
            resolve();
          });
        } catch (error) {
          console.warn('TTS blob processing failed:', error);
          speakWithBrowser(text);
          resolve();
        }
      }).catch((error) => {
        console.error('TTS fetch error:', error);
        speakWithBrowser(text);
        resolve();
      });
    } catch (error) {
      console.error('TTS error:', error);
      speakWithBrowser(text);
      resolve();
    }
  });
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
  ttsQueue.length = 0;
  isSpeaking = false;
  
  // Stop browser TTS
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
