
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceAssistantProps {
  isListening: boolean;
  isSpeaking: boolean;
  toggleListening: () => void;
  toggleMute: () => void;
  isMuted: boolean;
  lastCommand: string;
  cartCount: number;
  onCartClick: () => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  isListening,
  isSpeaking,
  toggleListening,
  toggleMute,
  isMuted,
  lastCommand,
  cartCount,
  onCartClick,
}) => {
  const { toast } = useToast();
  const micRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isListening) {
      toast({
        title: "Voice Assistant Active",
        description: "I'm listening. What would you like to do?",
        duration: 3000,
      });
    }
  }, [isListening, toast]);

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center gap-4">
      {lastCommand && (
        <div className="bg-white/90 backdrop-blur-sm text-primary px-6 py-3 rounded-full shadow-lg animate-fade-in">
          <p className="font-medium">"{lastCommand}"</p>
        </div>
      )}
      
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleMute}
          className="rounded-full shadow-md bg-white h-12 w-12"
          aria-label={isMuted ? "Unmute voice assistant" : "Mute voice assistant"}
        >
          {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
        </Button>
        
        <div 
          ref={micRef}
          onClick={toggleListening}
          className={cn(
            "relative flex items-center justify-center w-16 h-16 rounded-full cursor-pointer bg-primary text-white shadow-lg",
            isListening && "pulse-animation"
          )}
          aria-label={isListening ? "Stop listening" : "Start listening"}
        >
          <div className="relative z-10 flex items-center justify-center w-full h-full">
            {isListening ? (
              <Mic className="h-8 w-8 animate-bounce-subtle" />
            ) : (
              <MicOff className="h-8 w-8" />
            )}
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onCartClick}
          className="rounded-full shadow-md bg-white h-12 w-12 relative"
          aria-label="Open shopping cart"
        >
          <ShoppingCart className="h-6 w-6" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default VoiceAssistant;
