
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
  private autoRestart: boolean = true;
  private isListening: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: number | null = null;

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
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;
    
    this.recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      if (event.results[event.results.length - 1].isFinal) {
        this.config.onResult(transcript);
      }
    };
    
    this.recognition.onend = () => {
      this.isListening = false;
      this.config.onEnd();
      
      // Auto restart if needed
      if (this.autoRestart) {
        this.handleReconnect();
      }
    };
    
    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      if (event.error === 'network') {
        this.config.onError(`Network connection issue. Trying to reconnect...`);
        this.handleReconnect();
      } else {
        this.config.onError(`Error: ${event.error}`);
      }
    };
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.config.onError(`Failed to reconnect after ${this.maxReconnectAttempts} attempts. Please check your network connection.`);
      this.reconnectAttempts = 0;
      return;
    }

    this.reconnectAttempts++;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    this.reconnectTimeout = window.setTimeout(() => {
      console.log(`Attempting to reconnect speech recognition (attempt ${this.reconnectAttempts})`);
      this.startListening();
    }, 2000); // Wait 2 seconds before attempting to reconnect
  }

  startListening() {
    if (!this.recognition) {
      this.initRecognition();
      if (!this.recognition) return;
    }
    
    try {
      if (this.isListening) {
        this.recognition.stop();
      }
      
      this.recognition.start();
      this.isListening = true;
      this.autoRestart = true;
      this.reconnectAttempts = 0;
    } catch (error) {
      // Recognition may already be started, try stopping then starting again
      try {
        this.recognition.stop();
        setTimeout(() => {
          this.recognition?.start();
          this.isListening = true;
        }, 100);
      } catch (err) {
        this.config.onError('Failed to start voice recognition');
      }
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.autoRestart = false;
      try {
        this.recognition.stop();
        this.isListening = false;
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
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
