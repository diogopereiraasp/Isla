import React, { useState, useRef, useEffect } from 'react';
import { Layers, Plus, BarChart3, Download, FileJson, FolderArchive, Loader2, Check, MoreVertical, Database } from 'lucide-react';
import { exportPhrasesBackup } from '../services/exportService';

export default function Header({
  onOpenAdd,
  onOpenImport,
  onOpenStats,
  onOpenManager,
  phrases = [],
  mode,
  setMode,
  dueTodayCount = 0,
  installPrompt,
  onInstall
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportClick = async () => {
    if (phrases.length === 0) {
      alert("Nenhum card para exportar.");
      return;
    }
    try {
      setIsExporting(true);
      setExportSuccess(false);
      await exportPhrasesBackup(phrases);
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        setIsMenuOpen(false);
      }, 2000);
    } catch (err) {
      alert("Erro ao exportar backup: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <header className="w-full border-b border-[#1f2b45]/70 bg-[#0a0f1d]/90 backdrop-blur-lg sticky top-0 z-30 transition-all pt-[env(safe-area-inset-top)]">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-1.5 sm:gap-3">
        
        {/* 1. Brand Logo */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-[#00c57c] to-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <span className="font-bold text-sm sm:text-base tracking-tight text-white hidden md:inline-block">
            Isla
          </span>
        </div>

        {/* 2. Core Study Modes (Centered Switcher) */}
        <nav className="flex items-center bg-[#131b2e] p-0.5 sm:p-1 rounded-xl border border-[#1f2b45] text-[11px] sm:text-xs font-semibold shadow-inner shrink-0">
          <button
            onClick={() => setMode('learn')}
            className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg transition-all text-center whitespace-nowrap ${
              mode === 'learn'
                ? 'bg-slate-800 text-[#00c57c] shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Aprender
          </button>

          <button
            onClick={() => setMode('active')}
            className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg transition-all text-center whitespace-nowrap ${
              mode === 'active'
                ? 'bg-slate-800 text-[#00c57c] shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Recordação Ativa
          </button>
        </nav>

        {/* 3. Action Hub: Tools Menu + New Card CTA */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* PWA Install Button (when available) */}
          {installPrompt && (
            <button
              onClick={onInstall}
              className="p-1.5 sm:p-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-[#00c57c] rounded-xl border border-emerald-500/30 transition active:scale-95"
              title="Instalar Isla como Aplicativo"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}

          {/* Tools & Management Dropdown Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-1.5 sm:p-2 rounded-xl border transition active:scale-95 flex items-center justify-center ${
                isMenuOpen
                  ? 'bg-slate-800 text-white border-slate-600'
                  : 'bg-[#131b2e] hover:bg-slate-800 text-slate-300 border-[#1f2b45]'
              }`}
              title="Gerenciamento, Backup e Estatísticas"
            >
              <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Dropdown Popover */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#131b2e] border border-[#1f2b45] rounded-2xl shadow-2xl p-1.5 z-50 text-xs space-y-1 animate-fadeIn">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-[#1f2b45]/60">
                  Dados &amp; Gerenciamento
                </div>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenManager();
                  }}
                  className="w-full px-3 py-2 text-slate-200 hover:bg-slate-800/80 rounded-xl transition flex items-center gap-2.5 text-left"
                >
                  <Database className="w-4 h-4 text-[#00c57c]" />
                  <span>Gerenciador de Cards</span>
                  <span className="ml-auto text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">
                    {phrases.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenImport();
                  }}
                  className="w-full px-3 py-2 text-slate-200 hover:bg-slate-800/80 rounded-xl transition flex items-center gap-2.5 text-left"
                >
                  <FileJson className="w-4 h-4 text-blue-400" />
                  <span>Importar JSON</span>
                </button>

                <button
                  onClick={handleExportClick}
                  disabled={isExporting || phrases.length === 0}
                  className="w-full px-3 py-2 text-slate-200 hover:bg-slate-800/80 rounded-xl transition flex items-center gap-2.5 text-left disabled:opacity-40"
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                  ) : exportSuccess ? (
                    <Check className="w-4 h-4 text-[#00c57c]" />
                  ) : (
                    <FolderArchive className="w-4 h-4 text-emerald-400" />
                  )}
                  <span>{exportSuccess ? 'Backup Baixado!' : 'Exportar Backup (.json)'}</span>
                </button>

                <div className="border-t border-[#1f2b45]/60 my-1"></div>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenStats();
                  }}
                  className="w-full px-3 py-2 text-slate-200 hover:bg-slate-800/80 rounded-xl transition flex items-center gap-2.5 text-left"
                >
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  <span>Estatísticas &amp; Progresso</span>
                </button>
              </div>
            )}
          </div>

          {/* Primary CTA: Add New Card */}
          <button
            onClick={onOpenAdd}
            className="px-2.5 py-1.5 sm:px-4 sm:py-2 bg-[#00c57c] hover:bg-[#00af6e] text-white text-xs font-semibold rounded-xl flex items-center gap-1 sm:gap-1.5 shadow-lg shadow-emerald-950/40 transition hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">Novo Card</span>
            <span className="xs:hidden sm:hidden text-[11px]">Card</span>
          </button>

        </div>

      </div>
    </header>
  );
}

