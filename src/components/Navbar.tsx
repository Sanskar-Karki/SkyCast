'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Map as MapIcon, Calendar, MessageSquare, CloudRain, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/map', label: 'Heat Map', icon: MapIcon },
  { href: '/forecast', label: 'Forecast', icon: Calendar },
  { href: '/chat', label: 'AI Chat', icon: MessageSquare },
];

export default function Navbar() {
  const pathname = usePathname();
  const isChatPage = pathname === '/chat';

  return (
    <AnimatePresence>
      {!isChatPage && (
        <>
          {/* Desktop Vertical Sidebar */}
          <motion.nav 
            initial={{ x: -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -200, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="hidden lg:flex fixed left-6 top-1/2 -translate-y-1/2 z-[2005] flex-col gap-4"
          >
            <div className="bg-slate-950/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-3 flex flex-col items-center gap-2 shadow-[0_20px_80px_rgba(0,0,0,0.6)] py-8">
              {/* Logo / Top Icon */}
              <div className="mb-6 p-3 rounded-2xl bg-blue-600/20 border border-blue-500/20 text-blue-400">
                <Wind size={20} className="animate-pulse" />
              </div>

              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative group p-4 rounded-2xl transition-all duration-300 cursor-pointer",
                      isActive ? "text-white" : "text-slate-500 hover:text-slate-200"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill-desktop"
                        className="absolute inset-0 bg-blue-600 rounded-2xl z-0 shadow-lg shadow-blue-600/40"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    
                    <item.icon size={22} className="relative z-10" />
                    
                    {/* Tooltip */}
                    <div className="absolute left-20 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap shadow-2xl">
                      {item.label}
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.nav>

          {/* Mobile Bottom Bar */}
          <motion.nav 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[2005] px-4 w-full max-w-sm"
          >
            <div className="bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-2 flex items-center justify-around shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex flex-col items-center gap-1 px-5 py-3 rounded-2xl transition-all duration-300 cursor-pointer",
                      isActive ? "text-white" : "text-slate-500"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill-mobile"
                        className="absolute inset-0 bg-blue-600 rounded-2xl z-0 shadow-lg shadow-blue-600/30"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <item.icon size={20} className="relative z-10" />
                  </Link>
                );
              })}
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}


