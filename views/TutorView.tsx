
import React, { useState, useEffect, useRef } from 'react';
import { Child, Worksheet } from '../types';
import { ArrowLeft, Mic, Send, Volume2, Sparkles, User, Loader2, X, Square, Star, Lightbulb } from 'lucide-react';
import { getTutorExplanation } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';

interface TutorViewProps {
  child: Child;
  worksheet: Worksheet;
  onBack: () => void;
}

export const TutorView: React.FC<TutorViewProps> = ({ child, worksheet, onBack }) => {
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string, steps?: any[] }[]>([
    { role: 'ai', text: `Hi ${child.name}! I'm your EduKid learning assistant. Let's look at that question together! I'm here to help you figure it out step-by-step. 🌟` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setIsTyping(true);

    try {
      const explanation = await getTutorExplanation(text, `Working on a ${worksheet.subject} worksheet for ${child.grade}. Problem text: "${text}"`, child.grade);
      
      await new Promise(r => setTimeout(r, 1000));
      
      setMessages(prev => [...prev, { role: 'ai', text: explanation }]);
      
      if (child.preferences.voiceEnabled) {
        speak(explanation);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: "Oops! My thinking gears got stuck for a second. Can you ask that again?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = child.preferences.voiceSpeed;
    utterance.pitch = 1.1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const toggleListen = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleSend(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1F3A]/60 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white w-full max-w-3xl h-[85vh] rounded-[3.5rem] shadow-[0_32px_128px_-32px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border-8 border-white"
      >
        {/* Tutor Header */}
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#6C63FF] text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-indigo-200">
                 <Lightbulb size={32} />
              </div>
              <div>
                 <h2 className="text-2xl font-extrabold text-[#1A1F3A]">EduKid Learning Assistant</h2>
                 <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Supporting {child.name}'s Progress</p>
              </div>
           </div>
           <button onClick={onBack} className="w-12 h-12 bg-slate-50 text-slate-400 hover:text-red-500 rounded-full flex items-center justify-center transition-all">
              <X size={24} />
           </button>
        </div>

        {/* Conversation Area */}
        <div ref={scrollRef} className="flex-grow p-8 md:p-12 overflow-y-auto space-y-10 custom-scrollbar">
           {messages.map((m, i) => (
             <motion.div 
               key={i} 
               initial={{ opacity: 0, x: m.role === 'ai' ? -20 : 20 }}
               animate={{ opacity: 1, x: 0 }}
               className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}
             >
                <div className={`flex gap-5 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                   <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center shadow-md ${m.role === 'ai' ? 'bg-[#6C63FF] text-white' : 'bg-[#FF7A59] text-white'}`}>
                      {m.role === 'ai' ? <Lightbulb size={24} /> : <User size={24} />}
                   </div>
                   <div className={`p-8 rounded-[2rem] text-xl leading-relaxed shadow-sm ${m.role === 'ai' ? 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100' : 'bg-[#6C63FF] text-white rounded-tr-none shadow-xl shadow-indigo-100'}`}>
                      {m.text}
                      {m.role === 'ai' && (
                        <div className="mt-6 flex items-center gap-3">
                           <button 
                             onClick={() => speak(m.text)}
                             className="p-3 bg-white text-[#6C63FF] rounded-xl hover:bg-indigo-50 transition-all shadow-sm"
                           >
                              <Volume2 size={20} />
                           </button>
                           {isSpeaking && (
                             <motion.div 
                               animate={{ scale: [1, 1.1, 1] }} 
                               transition={{ repeat: Infinity, duration: 1 }}
                               className="text-xs font-extrabold text-[#6C63FF] uppercase tracking-widest"
                             >
                               Tutor is reading...
                             </motion.div>
                           )}
                        </div>
                      )}
                   </div>
                </div>
             </motion.div>
           ))}
           {isTyping && (
             <div className="flex justify-start">
                <div className="flex gap-5">
                   <div className="w-12 h-12 bg-[#6C63FF] rounded-2xl flex items-center justify-center text-white">
                      <Lightbulb size={24} />
                   </div>
                   <div className="bg-slate-50 p-8 rounded-[2rem] rounded-tl-none">
                      <Loader2 className="animate-spin text-[#6C63FF]" size={24} />
                   </div>
                </div>
             </div>
           )}
        </div>

        {/* Input Bar */}
        <div className="p-8 bg-slate-50/50 border-t border-slate-100">
           <div className="flex gap-4 items-center">
              <button 
                onClick={toggleListen}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-slate-400 border-2 border-slate-100 hover:border-[#6C63FF] hover:text-[#6C63FF] shadow-sm'}`}
              >
                 <Mic size={28} />
              </button>
              <div className="flex-grow relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                  placeholder="Ask for a hint or type a question..."
                  className="w-full bg-white border-2 border-slate-100 rounded-3xl py-5 px-8 focus:outline-none focus:border-[#6C63FF] text-xl font-bold shadow-sm transition-all"
                />
                {isSpeaking && (
                  <button 
                    onClick={stopSpeaking}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-500"
                  >
                    <Square size={20} fill="currentColor" />
                  </button>
                )}
              </div>
              <button 
                onClick={() => handleSend(input)}
                className="w-16 h-16 bg-[#6C63FF] text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-200 hover:bg-[#5A52E0] transition-all active:scale-95"
              >
                 <Send size={28} />
              </button>
           </div>
           <p className="text-center text-[10px] text-slate-300 font-extrabold uppercase tracking-[0.3em] mt-6">
              Encouraging, Safe, and Personalized Learning Assistant
           </p>
        </div>
      </motion.div>
    </div>
  );
};
