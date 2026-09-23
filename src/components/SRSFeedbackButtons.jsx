import React from 'react';

export default function SRSFeedbackButtons({ onFeedback, simplified = false }) {
  if (simplified) {
    return (
      <div className="grid grid-cols-2 gap-3 w-full">
        <button
          onClick={() => onFeedback(0)}
          className="py-3 px-4 bg-slate-900/60 hover:bg-slate-800 border border-[#1f2b45] hover:border-rose-500/40 text-slate-300 hover:text-rose-400 text-xs sm:text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <span>Repetir</span>
          <span className="text-[10px] text-slate-500 border border-slate-700/80 px-1.5 py-0.5 rounded font-mono">1</span>
        </button>
        <button
          onClick={() => onFeedback(5)}
          className="py-3 px-4 bg-slate-900/60 hover:bg-slate-800 border border-[#1f2b45] hover:border-[#00c57c]/40 text-slate-300 hover:text-[#00c57c] text-xs sm:text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <span>No Automático</span>
          <span className="text-[10px] text-slate-500 border border-slate-700/80 px-1.5 py-0.5 rounded font-mono">4</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 w-full">
      
      {/* 1. Errei */}
      <button
        onClick={() => onFeedback(0)}
        className="py-1.5 px-2.5 bg-slate-900/50 hover:bg-slate-800/80 border border-[#1f2b45] hover:border-rose-500/40 rounded-xl text-center transition-all group active:scale-[0.98] flex items-center justify-between sm:flex-col sm:justify-center sm:gap-0"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-200 group-hover:text-rose-300 transition-colors">Errei</span>
          <span className="text-[9px] text-slate-500 group-hover:text-rose-400 font-mono border border-slate-800 group-hover:border-rose-500/30 px-1 py-0.2 rounded">1</span>
        </div>
        <span className="text-[10px] text-slate-500 group-hover:text-slate-400">10 min</span>
      </button>

      {/* 2. Difícil */}
      <button
        onClick={() => onFeedback(3)}
        className="py-1.5 px-2.5 bg-slate-900/50 hover:bg-slate-800/80 border border-[#1f2b45] hover:border-amber-500/40 rounded-xl text-center transition-all group active:scale-[0.98] flex items-center justify-between sm:flex-col sm:justify-center sm:gap-0"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-200 group-hover:text-amber-300 transition-colors">Difícil</span>
          <span className="text-[9px] text-slate-500 group-hover:text-amber-400 font-mono border border-slate-800 group-hover:border-amber-500/30 px-1 py-0.2 rounded">2</span>
        </div>
        <span className="text-[10px] text-slate-500 group-hover:text-slate-400">4 horas</span>
      </button>

      {/* 3. Bom */}
      <button
        onClick={() => onFeedback(4)}
        className="py-1.5 px-2.5 bg-slate-900/50 hover:bg-slate-800/80 border border-[#1f2b45] hover:border-blue-500/40 rounded-xl text-center transition-all group active:scale-[0.98] flex items-center justify-between sm:flex-col sm:justify-center sm:gap-0"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-200 group-hover:text-blue-300 transition-colors">Bom</span>
          <span className="text-[9px] text-slate-500 group-hover:text-blue-400 font-mono border border-slate-800 group-hover:border-blue-500/30 px-1 py-0.2 rounded">3</span>
        </div>
        <span className="text-[10px] text-slate-500 group-hover:text-slate-400">1-5 dias</span>
      </button>

      {/* 4. Fácil */}
      <button
        onClick={() => onFeedback(5)}
        className="py-1.5 px-2.5 bg-slate-900/50 hover:bg-slate-800/80 border border-[#1f2b45] hover:border-[#00c57c]/40 rounded-xl text-center transition-all group active:scale-[0.98] flex items-center justify-between sm:flex-col sm:justify-center sm:gap-0"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-200 group-hover:text-[#00c57c] transition-colors">Fácil</span>
          <span className="text-[9px] text-slate-500 group-hover:text-[#00c57c] font-mono border border-slate-800 group-hover:border-[#00c57c]/30 px-1 py-0.2 rounded">4</span>
        </div>
        <span className="text-[10px] text-slate-500 group-hover:text-slate-400">3-7 dias</span>
      </button>

    </div>
  );
}
