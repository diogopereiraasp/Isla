import React from 'react';
import { RotateCcw, HelpCircle, Check, Zap } from 'lucide-react';

export default function SRSFeedbackButtons({ onFeedback, simplified = false }) {
  if (simplified) {
    return (
      <div className="grid grid-cols-2 gap-3 w-full">
        <button
          onClick={() => onFeedback(0)}
          className="py-3.5 bg-rose-500/10 hover:bg-rose-500/20 active:scale-[0.98] text-rose-300 border border-rose-500/30 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4 text-rose-400" />
          <span>Hesitei / Repetir</span>
        </button>
        <button
          onClick={() => onFeedback(5)}
          className="py-3.5 bg-emerald-500/15 hover:bg-emerald-500/25 active:scale-[0.98] text-[#00c57c] border border-emerald-500/30 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20"
        >
          <Check className="w-4 h-4 text-[#00c57c]" />
          <span>Falei no Automático</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
      <button
        onClick={() => onFeedback(0)}
        className="py-3 px-2 bg-rose-500/10 hover:bg-rose-500/20 active:scale-[0.98] text-rose-300 border border-rose-500/30 rounded-xl transition flex flex-col items-center gap-1 text-center"
      >
        <div className="flex items-center gap-1">
          <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
          <span className="font-semibold text-xs">Errei</span>
        </div>
        <span className="text-[10px] text-rose-400/80">&lt; 10 min</span>
      </button>

      <button
        onClick={() => onFeedback(3)}
        className="py-3 px-2 bg-amber-500/10 hover:bg-amber-500/20 active:scale-[0.98] text-amber-300 border border-amber-500/30 rounded-xl transition flex flex-col items-center gap-1 text-center"
      >
        <div className="flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-xs">Difícil</span>
        </div>
        <span className="text-[10px] text-amber-400/80">4 horas</span>
      </button>

      <button
        onClick={() => onFeedback(4)}
        className="py-3 px-2 bg-blue-500/10 hover:bg-blue-500/20 active:scale-[0.98] text-blue-300 border border-blue-500/30 rounded-xl transition flex flex-col items-center gap-1 text-center"
      >
        <div className="flex items-center gap-1">
          <Check className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-semibold text-xs">Bom</span>
        </div>
        <span className="text-[10px] text-blue-400/80">1d ➔ 5d</span>
      </button>

      <button
        onClick={() => onFeedback(5)}
        className="py-3 px-2 bg-emerald-500/15 hover:bg-emerald-500/25 active:scale-[0.98] text-[#00c57c] border border-emerald-500/30 rounded-xl transition flex flex-col items-center gap-1 text-center shadow-lg shadow-emerald-950/20"
      >
        <div className="flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-[#00c57c]" />
          <span className="font-semibold text-xs">Fácil</span>
        </div>
        <span className="text-[10px] text-emerald-400/80">3d ➔ 7d</span>
      </button>
    </div>
  );
}
