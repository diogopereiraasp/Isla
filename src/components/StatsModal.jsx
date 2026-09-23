import React from 'react';
import { X, Trophy, Calendar, CheckCircle2 } from 'lucide-react';
import { getSRSStats } from '../services/srs';

export default function StatsModal({ isOpen, onClose, phrases }) {
  if (!isOpen) return null;

  const stats = getSRSStats(phrases);
  const masteredPercentage = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#131b2e] border border-[#1f2b45] rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[#1f2b45]">
          <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#00c57c]" />
            <span>Progresso de Aprendizado</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress summary card */}
        <div className="bg-[#0a0f1d] border border-[#1f2b45] rounded-2xl p-4 text-center space-y-2">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Taxa de Automatização</span>
          <div className="text-3xl font-black text-white">{masteredPercentage}%</div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#00c57c] h-full transition-all duration-500 rounded-full"
              style={{ width: `${masteredPercentage}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400">
            {stats.mastered} cards no teto máximo (15 dias de intervalo)
          </p>
        </div>

        {/* 2 Metric Cards */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="bg-[#0a0f1d] border border-[#1f2b45] p-3 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs">
              <Calendar className="w-3.5 h-3.5" />
              <span>Para Hoje</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.dueToday}</p>
            <p className="text-[10px] text-slate-500">Revisões pendentes</p>
          </div>

          <div className="bg-[#0a0f1d] border border-[#1f2b45] p-3 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-blue-400 font-semibold text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Total Cards</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-[10px] text-slate-500">Cards cadastrados</p>
          </div>
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#00c57c] hover:bg-[#00af6e] text-white font-semibold rounded-xl transition text-xs shadow-lg shadow-emerald-950/40 active:scale-95"
          >
            Continuar Praticando
          </button>
        </div>

      </div>
    </div>
  );
}
