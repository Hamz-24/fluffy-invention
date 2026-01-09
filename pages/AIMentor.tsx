
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Brain, Compass, AlertCircle, Loader2, Volume2, VolumeX } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { streamGeminiResponse, generateVoiceCoaching } from '../services/gemini';
import { DBService } from '../services/db';
import { UserProfile } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const AIMentor: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const init = async () => {
      setFetchingProfile(true);
      const p = await DBService.getProfile();
      setProfile(p);
      setMessages([
        { role: 'model', text: `Greetings, ${p?.name || 'Explorer'}. I am your GuideX Mentor. Today, we focus on your growth. What's standing in your way?` }
      ]);
      setFetchingProfile(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSpeak = async (text: string) => {
    if (isSpeaking) {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsSpeaking(false);
      }
      return;
    }

    setIsSpeaking(true);
    const base64Audio = await generateVoiceCoaching(text);
    if (base64Audio) {
      const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setIsSpeaking(false);
      audio.play();
    } else {
      setIsSpeaking(false);
    }
  };

  const handleSend = async (customPrompt?: string) => {
    const userMessage = customPrompt || input.trim();
    if (!userMessage || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    setMessages(prev => [...prev, { role: 'model', text: '' }]);
    
    let fullResponse = '';
    try {
      const stream = streamGeminiResponse(userMessage);
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = fullResponse;
          return newMessages;
        });
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].text = "I'm having trouble connecting right now. Please check your configuration.";
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (fetchingProfile) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-accentPurple" size={48} />
        <p className="text-softGray font-bold tracking-widest uppercase">Connecting to Mentor...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <div className="p-2 bg-accentPurple rounded-lg glow-purple">
               <Brain size={24} className="text-white" />
            </div>
            AI Mentor
          </h1>
          <p className="text-softGray">Intelligence-driven coaching active.</p>
        </div>
      </div>

      <GlassCard className="flex-1 flex flex-col overflow-hidden p-0 border-white/5 bg-white/[0.02]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="flex flex-col gap-2 max-w-[80%]">
                <div className={`
                  p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                  ${msg.role === 'user' 
                    ? 'bg-accentBlue/20 border border-accentBlue/30 text-white rounded-tr-none' 
                    : 'glass border-white/5 text-softGray rounded-tl-none bg-white/[0.03]'}
                `}>
                  {msg.text || (isLoading && i === messages.length - 1 ? '...' : '')}
                </div>
                {msg.role === 'model' && msg.text && (
                  <button 
                    onClick={() => handleSpeak(msg.text)}
                    className="flex items-center gap-2 text-[10px] font-bold text-accentPurple hover:text-white transition-colors uppercase tracking-widest ml-1"
                  >
                    {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                    {isSpeaking ? 'Stop Audio' : 'Listen to Mentor'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-white/5 space-y-4 bg-white/[0.01]">
          <div className="relative">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask your mentor anything..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-16 focus:outline-none focus:border-accentPurple transition-all text-sm resize-none min-h-[60px]"
            />
            <button 
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="absolute right-4 bottom-4 p-3 bg-gradient-to-r from-accentBlue to-accentPurple rounded-xl glow-blue disabled:opacity-50 transition-all"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default AIMentor;
