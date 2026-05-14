'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  ArrowLeft, 
  Sparkles, 
  Loader2, 
  CloudRain, 
  Thermometer, 
  Wind
} from 'lucide-react';
import Link from 'next/link';
import { useWeatherStore } from '@/store/use-weather-store';
import { ChatMessage } from '@/types/weather';
import { formatTemp, formatWindSpeed } from '@/lib/utils';

// Wrapped in a shell for search params
export default function ChatPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={48} /></div>}>
      <ChatPage />
    </Suspense>
  );
}

function ChatPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q');
  const { data: weatherData, unit } = useWeatherStore();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial welcome and query handling
  useEffect(() => {
    if (messages.length === 0) {
      const welcome: ChatMessage = {
        id: '1',
        role: 'assistant',
        content: `Hi! I'm your SkyCast AI. I have the live data for ${weatherData?.city || 'your location'}. How can I help you today?`,
        timestamp: Date.now()
      };
      const timer = window.setTimeout(() => {
        setMessages([welcome]);
        if (initialQuery) {
          handleSendMessage(initialQuery);
        }
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [weatherData, initialQuery]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSendMessage(text: string) {
    if (!text.trim() || isLoading || !weatherData) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          weatherData
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Please try again';
      setMessages(prev => [...prev, {
        id: 'err',
        role: 'assistant',
        content: `Sorry, I hit a snag: ${message}.`,
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar - Weather Context (Hidden on mobile) */}
      <aside className="hidden lg:flex w-80 border-r border-white/5 flex-col p-6 bg-slate-900/30 backdrop-blur-3xl">
        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8">
          <ArrowLeft size={18} />
          <span className="text-sm font-bold">Back to Hub</span>
        </Link>

        {weatherData && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-gradient-blue leading-tight mb-1">{weatherData.city}</h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">Live Context</p>
            </div>

            <div className="glass-card p-4 border-blue-500/20">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col">
                    <span className="text-3xl font-black">{formatTemp(weatherData.current.temp, unit)}</span>
                    <span className="text-xs text-slate-400">{weatherData.current.condition}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-blue-600/10 text-blue-400">
                    <CloudRain size={24} />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <Thermometer size={12} className="text-orange-400" />
                    <span className="text-[10px] font-bold text-slate-300">Feels {formatTemp(weatherData.current.feelsLike, unit)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind size={12} className="text-purple-400" />
                    <span className="text-[10px] font-bold text-slate-300">{formatWindSpeed(weatherData.current.windSpeed, unit)}</span>
                  </div>
               </div>
            </div>

            <div>
              <p className="section-label mb-3 text-white/40">Prompting Tips</p>
              <div className="space-y-2">
                {[
                  "Will I need an umbrella in 2 hours?",
                  "What's the best time for a run?",
                  "How's the weekend looking?",
                  "Give me a 3-sentence summary."
                ].map(tip => (
                  <button 
                    key={tip}
                    onClick={() => handleSendMessage(tip)}
                    className="w-full text-left p-3 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
                  >
                    &quot;{tip}&quot;
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Chat Area */}
      <section className="flex-1 flex flex-col h-screen relative bg-slate-950/50">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 border-b border-white/5 flex items-center gap-3">
           <Link href="/"><ArrowLeft size={20} className="text-slate-400" /></Link>
           <h2 className="font-bold">SkyCast AI Assistant</h2>
        </div>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth pt-10"
        >
          <AnimatePresence>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                  m.role === 'user' 
                    ? 'bg-slate-800 text-slate-400' 
                    : 'bg-blue-600 text-white shadow-blue-600/20'
                }`}>
                  {m.role === 'user' ? <span className="text-sm font-black">You</span> : <Bot size={20} />}
                </div>
                <div className={`max-w-[85%] md:max-w-[70%] space-y-1`}>
                  <div className={`p-4 rounded-3xl ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'glass-card border-white/10 rounded-tl-none'
                  }`}>
                    <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{m.content}</p>
                  </div>
                  <p className={`text-[9px] font-bold text-slate-500 uppercase px-2 ${m.role === 'user' ? 'text-right' : ''}`}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white animate-pulse">
                <Sparkles size={20} />
              </div>
              <div className="glass-card p-4 rounded-3xl rounded-tl-none flex items-center gap-2">
                <Loader2 className="animate-spin text-blue-400" size={16} />
                <span className="text-sm text-slate-400 font-medium">Analyzing patterns...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 md:p-8 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
          <div className="max-w-3xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input)}
                placeholder="Ask your weather expert..."
                disabled={isLoading}
                className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 border-white/20 transition-all shadow-2xl"
              />
              <button
                onClick={() => handleSendMessage(input)}
                disabled={isLoading || !input.trim()}
                className="absolute right-3 p-3 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="mt-3 text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Powered by SkyCast AI & Gemini 2.0
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
