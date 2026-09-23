import React from 'react';
import { X, Trophy, Flame, Calendar, Brain, Sparkles, CheckCircle2 } from 'lucide-react';
import { getSRSStats } from '../services/srs';

export default function StatsModal({ isOpen, onClose, phrases }) {
  if (!isOpen) return null;

  const stats = getSRSStats(phrases);
  const masteredPercentage = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#131b2e] border border-[#1f2b45] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1f2b45]">
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#00c57c]" />
            <span>Progresso de Aprendizado</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress summary card */}
        <div className="bg-[#0a0f1d] border border-[#1f2b45] rounded-2xl p-4 text-center space-y-2">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Taxa de Automatização</span>
          <div className="text-3xl font-black text-white">{masteredPercentage}%</div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#00c57c] h-full transition-all duration-500 rounded-full"
              style={{ width: `${masteredPercentage}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400">
            {stats.mastered} frases com retenção de longo prazo (&gt;21 dias)
          </p>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-[#0a0f1d] border border-[#1f2b45] p-3.5 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <Calendar className="w-4 h-4" />
              <span>Para Revisar Hoje</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.dueToday}</p>
            <p className="text-[10px] text-slate-500">Repetições programadas</p>
          </div>

          <div className="bg-[#0a0f1d] border border-[#1f2b45] p-3.5 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Total de Frases</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-[10px] text-slate-500">Ilhas cadastradas</p>
          </div>
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#00c57c] hover:bg-[#00af6e] text-white font-semibold rounded-xl transition text-xs shadow-lg shadow-emerald-950/40"
          >
            Continuar Praticando
          </button>
        </div>

      </div>
    </div>
  );
}
