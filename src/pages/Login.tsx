
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mic, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import VoiceService from '@/services/VoiceService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [currentField, setCurrentField] = useState<'email' | 'password' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const voiceServiceRef = useRef<VoiceService | null>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize voice service
    voiceServiceRef.current = new VoiceService({
      onResult: handleVoiceResult,
      onEnd: () => setIsListening(false),
      onError: (error) => {
        console.error('Voice error:', error);
        toast.error('Voice assistant error', { description: error });
        setIsListening(false);
      }
    });

    // Welcome message
    setTimeout(() => {
      speak("Welcome to the login page. You can say 'email' to enter your email, 'password' to enter your password, or 'login' to submit the form.");
    }, 1000);

    return () => {
      if (isListening && voiceServiceRef.current) {
        voiceServiceRef.current.stopListening();
      }
    };
  }, []);

  const speak = (text: string) => {
    if (voiceServiceRef.current) {
      voiceServiceRef.current.speak(text);
    }
  };

  const startListening = (field: 'email' | 'password' | null) => {
    if (voiceServiceRef.current) {
      setCurrentField(field);
      setIsListening(true);
      voiceServiceRef.current.startListening();
      
      if (field === 'email') {
        speak("Please say your email address");
      } else if (field === 'password') {
        speak("Please say your password");
      } else {
        speak("I'm listening. What would you like to do?");
      }
    }
  };

  const handleVoiceResult = (transcript: string) => {
    const lowerTranscript = transcript.toLowerCase();
    
    // Commands
    if (lowerTranscript.includes('email')) {
      setCurrentField('email');
      emailInputRef.current?.focus();
      speak("Please say your email address");
      return;
    }
    
    if (lowerTranscript.includes('password')) {
      setCurrentField('password');
      passwordInputRef.current?.focus();
      speak("Please say your password");
      return;
    }
    
    if (lowerTranscript.includes('login') || lowerTranscript.includes('submit')) {
      handleSubmit();
      return;
    }
    
    if (lowerTranscript.includes('register') || lowerTranscript.includes('sign up')) {
      speak("Taking you to the registration page");
      navigate('/register');
      return;
    }
    
    if (lowerTranscript.includes('help')) {
      speak("You can say email to input your email, password to input your password, login to submit the form, or register to create a new account.");
      return;
    }
    
    // Field input
    if (currentField === 'email') {
      // Remove spaces and convert to lowercase for email
      const cleanedEmail = transcript.replace(/\s+/g, '').toLowerCase();
      setEmail(cleanedEmail);
      speak(`Email set to ${cleanedEmail.split('').join(' ')}`);
    } else if (currentField === 'password') {
      // Remove spaces for password
      const cleanedPassword = transcript.replace(/\s+/g, '');
      setPassword(cleanedPassword);
      speak("Password has been set");
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!email || !password) {
      speak("Please provide both email and password");
      toast.error("Please provide both email and password");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await login(email, password);
      speak("Login successful! Taking you to the shop.");
      toast.success("Login successful!");
      navigate('/');
    } catch (error) {
      speak("Login failed. Please try again.");
      toast.error("Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Voice Grocer Aid</h1>
          <h2 className="text-2xl mt-6 mb-2">Login</h2>
          <p className="text-muted-foreground">
            Sign in to your account or{" "}
            <Link to="/register" className="text-primary hover:underline">
              create a new account
            </Link>
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="email">Email</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => startListening('email')}
                  className="h-8 w-8 p-0"
                >
                  <Mic className="h-4 w-4" />
                  <span className="sr-only">Use voice for email</span>
                </Button>
              </div>
              <Input
                ref={emailInputRef}
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => startListening('password')}
                  className="h-8 w-8 p-0"
                >
                  <Mic className="h-4 w-4" />
                  <span className="sr-only">Use voice for password</span>
                </Button>
              </div>
              <Input
                ref={passwordInputRef}
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
          
          <div className="mt-6">
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => startListening(null)}
            >
              {isListening ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Listening...
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  Use Voice Assistant
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
