import React from 'react';
import { Layers, Plus, BarChart3, Download } from 'lucide-react';

export default function Header({
  onOpenAdd,
  onOpenStats,
  mode,
  setMode,
  dueTodayCount = 0,
  installPrompt,
  onInstall
}) {
  return (
    <header className="w-full border-b border-[#1f2b45]/80 bg-[#0a0f1d]/95 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Brand & Mobile Actions Row */}
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#00c57c] to-emerald-800 flex items-center justify-center text-white shadow-lg shadow-emerald-950/40">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
              Isla
            </h1>
          </div>

          {/* Mobile Right Controls: Install + Stats + Add */}
          <div className="flex items-center gap-1.5 sm:hidden">
            {installPrompt && (
              <button
                onClick={onInstall}
                className="p-2 bg-emerald-500/15 text-[#00c57c] rounded-xl border border-emerald-500/30 active:scale-95"
                title="Instalar App"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onOpenStats}
              className="p-2 bg-slate-800 text-slate-300 rounded-xl border border-slate-700 active:scale-95"
              title="Estatísticas"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenAdd}
              className="px-3 py-1.5 bg-[#00c57c] hover:bg-[#00af6e] text-white text-xs font-semibold rounded-xl flex items-center gap-1 shadow-md active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Novo</span>
            </button>
          </div>
        </div>

        {/* Mode Selector & Desktop Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-center sm:justify-end">
          
          {/* Mode Switcher */}
          <div className="bg-[#131b2e] p-1 rounded-xl border border-[#1f2b45] flex items-center text-xs font-semibold w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={() => setMode('learn')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition-all text-center ${
                mode === 'learn'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Aprender
            </button>

            <button
              onClick={() => setMode('active')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition-all text-center ${
                mode === 'active'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Recordação Ativa
            </button>

            <button
              onClick={() => setMode('srs')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 text-center ${
                mode === 'srs'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Repetição</span>
              {dueTodayCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${mode === 'srs' ? 'bg-[#00c57c]/20 text-[#00c57c]' : 'bg-amber-500/20 text-amber-400'}`}>
                  {dueTodayCount}
                </span>
              )}
            </button>
          </div>

          {/* Desktop action buttons */}
          <div className="hidden sm:flex items-center gap-2">
            {installPrompt && (
              <button
                onClick={onInstall}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition active:scale-95"
                title="Instalar como aplicativo"
              >
                <Download className="w-3.5 h-3.5 text-[#00c57c]" />
                <span>Instalar</span>
              </button>
            )}

            <button
              onClick={onOpenStats}
              className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl transition active:scale-95"
              title="Ver Estatísticas"
            >
              <BarChart3 className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenAdd}
              className="px-3.5 py-2 bg-[#00c57c] hover:bg-[#00af6e] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition hover:scale-[1.02] active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Card</span>
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
