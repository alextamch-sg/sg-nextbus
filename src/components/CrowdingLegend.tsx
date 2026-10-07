import React from 'react';
import { Accessibility } from 'lucide-react';

export const CrowdingLegend: React.FC = () => {
  return (
    <div className="bg-white/80 border-b border-slate-200/80 px-4 lg:px-6 py-2 text-[11px] text-slate-500">
      <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-y-1.5 gap-x-4">
        {/* Left: Crowding Indicators */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
            Crowding Legend:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="text-slate-700 font-medium">Seats Available (SEA)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
            <span className="text-slate-700 font-medium">Standing Available (SDA)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
            <span className="text-slate-700 font-medium">Limited Standing (LSD)</span>
          </div>
        </div>

        {/* Right: Bus Decks & Accessibility */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 font-mono font-bold rounded text-[10px] border border-slate-200">
              DD
            </span>
            <span>Double Deck</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 font-mono font-bold rounded text-[10px] border border-slate-200">
              SD
            </span>
            <span>Single Deck</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700">
            <Accessibility className="w-3.5 h-3.5 text-slate-500" />
            <span>Wheelchair Accessible</span>
          </div>
        </div>
      </div>
    </div>
  );
};
