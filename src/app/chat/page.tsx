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
  Wind,
  Trash2,
  RefreshCw,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('skycast_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    }

    // Default welcome if no history
    if (messages.length === 0) {
      const welcome: ChatMessage = {
        id: '1',
        role: 'assistant',
        content: `Hi! I'm your SkyCast AI. I have the live data for **${weatherData?.city || 'your location'}**. How can I help you today?`,
        timestamp: Date.now()
      };
      setMessages([welcome]);
      
      if (initialQuery) {
        handleSendMessage(initialQuery, [welcome]);
      }
    }
  }, [weatherData]);

  // Handle initial query specifically when searchParams change
  useEffect(() => {
    if (initialQuery && messages.length > 0) {
      // Check if the last message is already this query to avoid loops
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'user' && lastMsg.content === initialQuery) return;
      
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  // Save history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('skycast_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear your chat history?')) {
      const welcome: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `History cleared. How else can I help you with the weather in **${weatherData?.city || 'your location'}**?`,
        timestamp: Date.now()
      };
      setMessages([welcome]);
      localStorage.setItem('skycast_chat_history', JSON.stringify([welcome]));
    }
  };

  const startNewChat = () => {
    const welcome: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Starting a fresh session. What's on your mind regarding the weather today?`,
      timestamp: Date.now()
    };
    setMessages([welcome]);
    localStorage.setItem('skycast_chat_history', JSON.stringify([welcome]));
  };

  async function handleSendMessage(text: string, currentMessages = messages) {
    if (!text.trim() || isLoading || !weatherData) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    const newMessages = [...currentMessages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
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
    <main className="min-h-screen bg-[#060c1a] text-white flex flex-col md:flex-row overflow-hidden relative">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Sidebar */}
      <aside className="hidden lg:flex w-80 border-r border-white/5 flex-col p-6 bg-slate-950/40 backdrop-blur-3xl z-10">
        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold tracking-tight">Back to Dashboard</span>
        </Link>

        {weatherData && (
          <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar">
            <div>
              <h1 className="text-2xl font-black text-gradient-blue leading-tight mb-1">{weatherData.city}</h1>
              <p className="section-label">Current Context</p>
            </div>

            <div className="glass-card p-5 border-blue-500/20 bg-blue-600/5">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col">
                    <span className="text-3xl font-black tabular-nums">{formatTemp(weatherData.current.temp, unit)}</span>
                    <span className="text-xs text-slate-400 font-medium">{weatherData.current.condition}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-blue-600/10 text-blue-400">
                    <CloudRain size={24} />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <Thermometer size={14} className="text-orange-400" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Feels</span>
                      <span className="text-[11px] font-bold text-slate-300">{formatTemp(weatherData.current.feelsLike, unit)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind size={14} className="text-purple-400" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Wind</span>
                      <span className="text-[11px] font-bold text-slate-300">{formatWindSpeed(weatherData.current.windSpeed, unit)}</span>
                    </div>
                  </div>
               </div>
            </div>

            <div>
              <p className="section-label mb-3">Quick Prompts</p>
              <div className="space-y-2">
                {[
                  "Will I need an umbrella today?",
                  "Best time for outdoor sports?",
                  "Give me a detailed weekend outlook.",
                  "Summarize today's conditions in 2 lines."
                ].map(tip => (
                  <button 
                    key={tip}
                    onClick={() => handleSendMessage(tip)}
                    className="w-full text-left p-3 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] font-medium text-slate-400 hover:text-white hover:bg-white/[0.08] hover:border-white/10 transition-all active:scale-[0.98]"
                  >
                    &quot;{tip}&quot;
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 mt-auto">
               <p className="section-label mb-3">Session Controls</p>
               <div className="grid grid-cols-2 gap-2">
                 <button 
                  onClick={startNewChat}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400 hover:bg-blue-600/10 hover:text-blue-400 hover:border-blue-500/20 transition-all"
                 >
                   <Plus size={14} />
                   New Chat
                 </button>
                 <button 
                  onClick={clearHistory}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400 hover:bg-red-600/10 hover:text-red-400 hover:border-red-500/20 transition-all"
                 >
                   <Trash2 size={14} />
                   Clear
                 </button>
               </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Chat Area */}
      <section className="flex-1 flex flex-col h-screen relative z-10">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 bg-slate-950/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <Link href="/"><ArrowLeft size={20} className="text-slate-400" /></Link>
             <h2 className="font-bold text-sm">SkyCast AI</h2>
           </div>
           <div className="flex items-center gap-2">
             <button onClick={startNewChat} className="p-2 text-slate-400"><Plus size={18} /></button>
             <button onClick={clearHistory} className="p-2 text-slate-400"><Trash2 size={18} /></button>
           </div>
        </div>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth pt-10 no-scrollbar"
        >
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-9 h-9 md:w-11 md:h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl ${
                  m.role === 'user' 
                    ? 'bg-slate-800 border border-white/5 text-slate-400' 
                    : 'bg-blue-600 border border-blue-400/30 text-white shadow-blue-600/20'
                }`}>
                  {m.role === 'user' ? <span className="text-xs font-black">YOU</span> : <Bot size={22} />}
                </div>
                <div className={`max-w-[85%] md:max-w-[75%] space-y-1.5`}>
                  <div className={`p-4 md:p-5 rounded-[2rem] shadow-2xl ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none border border-blue-400/20'
                      : 'bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-tl-none'
                  }`}>
                    <div className="prose prose-invert prose-sm md:prose-base max-w-none prose-p:leading-relaxed prose-strong:text-blue-400 prose-ul:my-2 prose-li:my-0.5">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                  <p className={`text-[9px] font-black text-slate-500 uppercase tracking-widest px-3 ${m.role === 'user' ? 'text-right' : ''}`}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-4"
            >
              <div className="w-9 h-9 md:w-11 md:h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white animate-pulse shadow-lg shadow-blue-600/20">
                <Sparkles size={20} />
              </div>
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-4 px-6 rounded-[2rem] rounded-tl-none flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                </div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">SkyCast is thinking...</span>
              </div>
            </motion.div>
          )}
          <div className="h-4" />
        </div>

        {/* Input Bar */}
        <div className="p-4 md:p-10 bg-gradient-to-t from-[#060c1a] via-[#060c1a] to-transparent">
          <div className="max-w-4xl mx-auto relative group">
            {/* Glow Effect on Focus */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-10 group-focus-within:opacity-30 transition duration-500"></div>
            
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input)}
                placeholder="Ask about precipitation, wind, or weekend plans..."
                disabled={isLoading}
                className="w-full bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] py-5 pl-8 pr-20 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-2xl"
              />
              <div className="absolute right-3 flex items-center gap-2">
                <button
                  onClick={() => handleSendMessage(input)}
                  disabled={isLoading || !input.trim()}
                  className="p-3.5 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-600/30 hover:bg-blue-500 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center justify-center"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-4 text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">
               <span className="flex items-center gap-1"><RefreshCw size={10} /> Persistent Session</span>
               <span className="w-1 h-1 bg-slate-700 rounded-full" />
               <span className="flex items-center gap-1"><Sparkles size={10} /> Gemini 2.0 Pro</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

