
interface VoiceServiceConfig {
  onResult: (transcript: string) => void;
  onEnd: () => void;
  onError: (error: string) => void;
}

class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis;
  private config: VoiceServiceConfig;
  private isMuted: boolean = false;

  constructor(config: VoiceServiceConfig) {
    this.config = config;
    this.synthesis = window.speechSynthesis;
    this.initRecognition();
  }

  private initRecognition() {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      this.config.onError('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognitionAPI();
    
    this.recognition.lang = 'en-US';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    
    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      this.config.onResult(transcript);
    };
    
    this.recognition.onend = () => {
      this.config.onEnd();
    };
    
    this.recognition.onerror = (event) => {
      this.config.onError(`Error: ${event.error}`);
    };
  }

  startListening() {
    if (!this.recognition) {
      this.initRecognition();
      if (!this.recognition) return;
    }
    
    try {
      this.recognition.start();
    } catch (error) {
      // Recognition may already be started, try stopping then starting again
      try {
        this.recognition.stop();
        setTimeout(() => {
          this.recognition?.start();
        }, 100);
      } catch (err) {
        this.config.onError('Failed to start voice recognition');
      }
    }
  }

  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
  }

  speak(text: string) {
    if (this.isMuted) return;
    
    // Cancel any current speech
    this.synthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Find a good voice
    const voices = this.synthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Female') || 
      voice.name.includes('Google') || 
      voice.name.includes('Samantha')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    this.synthesis.speak(utterance);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    
    if (this.isMuted) {
      this.synthesis.cancel();
    }
    
    return this.isMuted;
  }

  isSpeaking() {
    return this.synthesis.speaking;
  }
}

export default VoiceService;
