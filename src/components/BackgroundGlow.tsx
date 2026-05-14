'use client';

import { motion } from 'framer-motion';

export default function BackgroundGlow() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#020617] pointer-events-none">
      {/* Primary Glow Orb */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px]"
      />

      {/* Secondary Glow Orb */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -40, 0],
          y: [0, -60, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]"
      />

      {/* Accent Glow Orb */}
      <motion.div
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-cyan-500/5 blur-[100px]"
      />

      {/* Noise Texture Overlay (optional but adds premium feel) */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
