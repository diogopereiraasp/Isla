import React, { useState } from 'react';
import { X, Trophy, Calendar, Sparkles, BookOpen, Clock, Zap, Volume2, Target, Flame } from 'lucide-react';
import { getSRSStats } from '../services/srs';

export default function StatsModal({ isOpen, onClose, phrases = [], activeMode = 'learn' }) {
  const [statsMode, setStatsMode] = useState(activeMode);

  if (!isOpen) return null;

  const stats = getSRSStats(phrases, statsMode);

  // Percentuais para a barra de distribuição
  const total = stats.total || 1;
  const newPct = Math.round((stats.newCards / total) * 100);
  const learnPct = Math.round((stats.learning / total) * 100);
  const revPct = Math.round((stats.reviewing / total) * 100);
  const masterPct = Math.round((stats.mastered / total) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#131b2e] border border-[#1f2b45] rounded-t-3xl sm:rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto animate-fadeIn">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1f2b45]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                Estatísticas &amp; Progresso
              </h3>
              <p className="text-[11px] text-slate-400">
                Acompanhamento individual por modo de estudo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs in Stats Modal */}
        <div className="grid grid-cols-2 p-1 bg-[#0a0f1d] border border-[#1f2b45] rounded-xl text-xs font-semibold">
          <button
            onClick={() => setStatsMode('learn')}
            className={`py-1.5 rounded-lg transition-all text-center ${
              statsMode === 'learn'
                ? 'bg-slate-800 text-[#00c57c] shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Modo Aprender
          </button>
          <button
            onClick={() => setStatsMode('active')}
            className={`py-1.5 rounded-lg transition-all text-center ${
              statsMode === 'active'
                ? 'bg-slate-800 text-[#00c57c] shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Recordação Ativa
          </button>
        </div>

        {/* Big Highlight: Automatização & Retenção */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Taxa de Automatização */}
          <div className="bg-[#0a0f1d] border border-[#1f2b45] rounded-2xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Automatizados
              </span>
              <Sparkles className="w-3.5 h-3.5 text-[#00c57c]" />
            </div>
            <div className="my-1.5 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-[#00c57c]">
                {stats.masteredPercentage}%
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                ({stats.mastered}/{stats.total})
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Intervalo máximo de 15 dias atingido
            </p>
          </div>

          {/* Taxa de Acertos */}
          <div className="bg-[#0a0f1d] border border-[#1f2b45] rounded-2xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Taxa de Acertos
              </span>
              <Target className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="my-1.5 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-blue-400">
                {stats.accuracyRate}%
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                ({stats.totalReviews} reps)
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Respostas avaliadas como Bom ou Fácil
            </p>
          </div>
        </div>

        {/* Distribuição do Deck (Barra Colorida Segmentada) */}
        <div className="bg-[#0a0f1d] border border-[#1f2b45] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300">Estágios do Aprendizado</span>
            <span className="text-slate-400 font-mono">{stats.total} cards no total</span>
          </div>

          {/* Segmented Bar */}
          <div className="w-full bg-slate-800/80 h-3 rounded-full overflow-hidden flex">
            {stats.newCards > 0 && (
              <div
                style={{ width: `${newPct}%` }}
                className="bg-slate-500 transition-all duration-500"
                title={`Novos: ${stats.newCards} (${newPct}%)`}
              />
            )}
            {stats.learning > 0 && (
              <div
                style={{ width: `${learnPct}%` }}
                className="bg-amber-400 transition-all duration-500"
                title={`Aprendendo: ${stats.learning} (${learnPct}%)`}
              />
            )}
            {stats.reviewing > 0 && (
              <div
                style={{ width: `${revPct}%` }}
                className="bg-sky-400 transition-all duration-500"
                title={`Consolidando: ${stats.reviewing} (${revPct}%)`}
              />
            )}
            {stats.mastered > 0 && (
              <div
                style={{ width: `${masterPct}%` }}
                className="bg-[#00c57c] transition-all duration-500"
                title={`Automatizados: ${stats.mastered} (${masterPct}%)`}
              />
            )}
          </div>

          {/* 4 Cards de Estágio Detalhados */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            
            {/* 1. Novos */}
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                <span className="text-[11px] font-semibold text-slate-300">Novos</span>
              </div>
              <div className="text-base font-bold text-white font-mono">{stats.newCards}</div>
              <p className="text-[9px] text-slate-500">Nunca revisados</p>
            </div>

            {/* 2. Aprendendo */}
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="text-[11px] font-semibold text-amber-300">Aprendendo</span>
              </div>
              <div className="text-base font-bold text-amber-400 font-mono">{stats.learning}</div>
              <p className="text-[9px] text-slate-500">&lt; 3 dias</p>
            </div>

            {/* 3. Consolidando */}
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                <span className="text-[11px] font-semibold text-sky-300">Em Revisão</span>
              </div>
              <div className="text-base font-bold text-sky-400 font-mono">{stats.reviewing}</div>
              <p className="text-[9px] text-slate-500">3 a 14 dias</p>
            </div>

            {/* 4. Automatizados */}
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00c57c]"></span>
                <span className="text-[11px] font-semibold text-emerald-300">Fluentes</span>
              </div>
              <div className="text-base font-bold text-[#00c57c] font-mono">{stats.mastered}</div>
              <p className="text-[9px] text-slate-500">15 dias (teto)</p>
            </div>

          </div>
        </div>

        {/* Métricas Adicionais: Pendentes Hoje & Áudios Gravados */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          
          <div className="bg-[#0a0f1d] border border-[#1f2b45] p-3 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold text-white font-mono">{stats.dueToday}</div>
              <p className="text-[10px] text-slate-400">Revisões para hoje</p>
            </div>
          </div>

          <div className="bg-[#0a0f1d] border border-[#1f2b45] p-3 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-[#00c57c] flex items-center justify-center shrink-0">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold text-white font-mono">
                {stats.withAudio} <span className="text-[10px] font-normal text-slate-500">({stats.audioPercentage}%)</span>
              </div>
              <p className="text-[10px] text-slate-400">Cards com áudio IA</p>
            </div>
          </div>

        </div>

        {/* CTA */}
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

