'use client';

import SearchBar from '@/components/SearchBar';
import UnitToggle from '@/components/UnitToggle';
import { CloudRain } from 'lucide-react';
import Link from 'next/link';

export default function PageHeader() {
  return (
    <header className="flex flex-col items-center justify-between gap-6 py-8 sm:py-10 md:flex-row">
      <Link href="/" className="flex items-center gap-3 group">
        <div className="rounded-2xl bg-blue-600 p-3 shadow-lg shadow-blue-600/25 group-hover:scale-110 transition-transform">
          <CloudRain className="text-white" size={28} />
        </div>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black tracking-normal">
            SkyCast AI
            <span className="rounded border border-blue-500/30 bg-blue-500/20 px-1.5 py-0.5 text-[10px] text-blue-400">2.0</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">Live multi-source forecast</p>
        </div>
      </Link>

      <div className="flex w-full flex-col items-stretch gap-3 md:w-auto md:flex-row md:items-center">
        <SearchBar />
        <UnitToggle />
      </div>
    </header>
  );
}
