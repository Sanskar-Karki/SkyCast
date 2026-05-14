'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Sparkles, Send, Bot, Maximize2 } from 'lucide-react';
import Link from 'next/link';

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 w-[380px] h-[520px] max-w-[calc(100vw-48px)] max-h-[calc(100vh-120px)] z-[2000] flex flex-col glass-card border-blue-500/20 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-blue-600/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">SkyCast AI Assistant</h3>
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest animate-pulse">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Link 
                  href="/chat" 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-xl text-slate-400 transition-colors"
                  title="Full screen chat"
                >
                  <Maximize2 size={16} />
                </Link>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-xl text-slate-400 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Chat Area (Static placeholder for now, actual logic in /chat page) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-600/30 flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-blue-400" />
                </div>
                <div className="bg-white/5 border border-white/5 p-3 rounded-2xl rounded-tl-none max-w-[80%]">
                  <p className="text-xs text-white/80 leading-relaxed">
                    Hello! I&apos;m your SkyCast weather expert. Ask me about rain timing, what to wear, or a quick local weather summary.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {['Will it rain soon?', 'What should I wear?', 'Weekend forecast'].map(q => (
                  <Link 
                    key={q}
                    href={`/chat?q=${encodeURIComponent(q)}`}
                    onClick={() => setIsOpen(false)}
                    className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all"
                  >
                    {q}
                  </Link>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-slate-900/50">
               <Link href="/chat" onClick={() => setIsOpen(false)} className="block">
                  <div className="relative">
                    <input 
                      type="text" 
                      readOnly
                      placeholder="Ask SkyCast AI..." 
                      className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-4 pr-10 text-sm focus:outline-none cursor-pointer"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-blue-600 text-white shadow-lg">
                      <Send size={14} />
                    </div>
                  </div>
               </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-600/40 z-[2001] border border-blue-400/30"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={28} className="text-white" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle size={28} className="text-white" />
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-blue-600 flex items-center justify-center"
              >
                <div className="w-1 h-1 bg-white rounded-full" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
