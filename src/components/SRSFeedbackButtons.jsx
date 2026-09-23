import React from 'react';
import { RotateCcw, HelpCircle, Check, Zap } from 'lucide-react';

export default function SRSFeedbackButtons({ onFeedback, simplified = false }) {
  if (simplified) {
    return (
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full">
        <button
          onClick={() => onFeedback(0)}
          className="py-3 sm:py-3.5 bg-rose-500/10 hover:bg-rose-500/20 active:scale-[0.98] text-rose-300 border border-rose-500/30 text-xs sm:text-sm font-semibold rounded-xl sm:rounded-2xl transition flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4 text-rose-400" />
          <span>Hesitei / Repetir</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-rose-950/60 border border-rose-500/30 rounded text-[10px] text-rose-300 font-mono">1</kbd>
        </button>
        <button
          onClick={() => onFeedback(5)}
          className="py-3 sm:py-3.5 bg-emerald-500/15 hover:bg-emerald-500/25 active:scale-[0.98] text-[#00c57c] border border-emerald-500/30 text-xs sm:text-sm font-semibold rounded-xl sm:rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20"
        >
          <Check className="w-4 h-4 text-[#00c57c]" />
          <span>No Automático</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-emerald-950/60 border border-emerald-500/30 rounded text-[10px] text-[#00c57c] font-mono">4</kbd>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 w-full">
      {/* 1. Errei */}
      <button
        onClick={() => onFeedback(0)}
        className="py-2.5 sm:py-3 px-2 bg-rose-500/10 hover:bg-rose-500/20 active:scale-[0.98] text-rose-300 border border-rose-500/30 rounded-xl sm:rounded-2xl transition flex flex-col items-center justify-center gap-0.5 text-center group"
      >
        <div className="flex items-center gap-1.5">
          <RotateCcw className="w-3.5 h-3.5 text-rose-400 group-hover:rotate-[-45deg] transition-transform" />
          <span className="font-semibold text-xs">Errei</span>
          <kbd className="px-1 py-0.2 bg-rose-950/60 border border-rose-500/30 rounded text-[9px] text-rose-300 font-mono">1</kbd>
        </div>
        <span className="text-[10px] text-rose-400/80 font-medium">&lt; 10 min</span>
      </button>

      {/* 2. Difícil */}
      <button
        onClick={() => onFeedback(3)}
        className="py-2.5 sm:py-3 px-2 bg-amber-500/10 hover:bg-amber-500/20 active:scale-[0.98] text-amber-300 border border-amber-500/30 rounded-xl sm:rounded-2xl transition flex flex-col items-center justify-center gap-0.5 text-center group"
      >
        <div className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-xs">Difícil</span>
          <kbd className="px-1 py-0.2 bg-amber-950/60 border border-amber-500/30 rounded text-[9px] text-amber-300 font-mono">2</kbd>
        </div>
        <span className="text-[10px] text-amber-400/80 font-medium">4 horas</span>
      </button>

      {/* 3. Bom */}
      <button
        onClick={() => onFeedback(4)}
        className="py-2.5 sm:py-3 px-2 bg-blue-500/10 hover:bg-blue-500/20 active:scale-[0.98] text-blue-300 border border-blue-500/30 rounded-xl sm:rounded-2xl transition flex flex-col items-center justify-center gap-0.5 text-center group"
      >
        <div className="flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-xs">Bom</span>
          <kbd className="px-1 py-0.2 bg-blue-950/60 border border-blue-500/30 rounded text-[9px] text-blue-300 font-mono">3</kbd>
        </div>
        <span className="text-[10px] text-blue-400/80 font-medium">1d ➔ 5d</span>
      </button>

      {/* 4. Fácil */}
      <button
        onClick={() => onFeedback(5)}
        className="py-2.5 sm:py-3 px-2 bg-emerald-500/15 hover:bg-emerald-500/25 active:scale-[0.98] text-[#00c57c] border border-emerald-500/30 rounded-xl sm:rounded-2xl transition flex flex-col items-center justify-center gap-0.5 text-center shadow-lg shadow-emerald-950/20 group"
      >
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-[#00c57c] group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-xs">Fácil</span>
          <kbd className="px-1 py-0.2 bg-emerald-950/60 border border-emerald-500/30 rounded text-[9px] text-[#00c57c] font-mono">4</kbd>
        </div>
        <span className="text-[10px] text-emerald-400/80 font-medium">3d ➔ 7d</span>
      </button>
    </div>
  );
}
