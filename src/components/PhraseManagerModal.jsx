import React, { useState } from 'react';
import { X, Search, Trash2, Edit3, Volume2, Mic, Clock, Tag, Video, Download, Upload, Loader2, Check } from 'lucide-react';
import AudioPlayerButton from './AudioPlayerButton';
import { exportPhrasesBackup } from '../services/exportService';
import { getCardSRS } from '../services/srs';

export default function PhraseManagerModal({
  isOpen,
  onClose,
  phrases,
  onDelete,
  onEdit,
  onOpenImport
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen) return null;

  const allTags = ['all', ...new Set(phrases.flatMap(p => p.tags || []))].filter(Boolean);

  const handleExportBackup = async () => {
    if (phrases.length === 0) {
      alert("Nenhum card para exportar.");
      return;
    }

    try {
      setIsExporting(true);
      setExportSuccess(false);
      await exportPhrasesBackup(phrases, (current, total) => {
        setExportProgress({ current, total });
      });
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      alert("Erro ao exportar backup: " + err.message);
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  const filtered = phrases.filter(p => {
    const cardTags = p.tags || [];
    const matchesSearch = 
      (p.target && p.target.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.native && p.native.toLowerCase().includes(searchTerm.toLowerCase())) ||
      cardTags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTag = selectedTag === 'all' || cardTags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#131b2e] border border-[#1f2b45] rounded-t-3xl sm:rounded-3xl w-full max-w-3xl p-4 sm:p-6 shadow-2xl space-y-3.5 max-h-[90vh] sm:max-h-[88vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[#1f2b45]">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
              <span>Gerenciador de Cards</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-[#00c57c] border border-emerald-500/20">
                {phrases.length}
              </span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Cards, tags e áudios salvos no dispositivo
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por frente, verso ou tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a0f1d] border border-[#1f2b45] rounded-xl pl-8.5 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:border-[#00c57c] focus:outline-none text-xs"
            />
          </div>

          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="bg-[#0a0f1d] border border-[#1f2b45] rounded-xl px-3 py-2 text-slate-200 text-xs focus:border-[#00c57c] focus:outline-none"
          >
            {allTags.map(tag => (
              <option key={tag} value={tag}>
                {tag === 'all' ? 'Todas as Tags' : `#${tag}`}
              </option>
            ))}
          </select>
        </div>

        {/* Phrases List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Nenhum card encontrado com os filtros atuais.
            </div>
          ) : (
            filtered.map((phrase) => (
              <div
                key={phrase.id}
                className="p-3 bg-[#0a0f1d] border border-[#1f2b45] rounded-xl sm:rounded-2xl flex items-center justify-between gap-2.5 transition"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(phrase.tags || []).length > 0 ? (
                      phrase.tags.map(tag => (
                        <span key={tag} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 flex items-center gap-1">
                          <Tag className="w-2 h-2 text-[#00c57c]" />
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-[9px] text-slate-500">sem tags</span>
                    )}

                    {phrase.audioBlob ? (
                      <span className="text-[9px] text-emerald-400 flex items-center gap-1 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        <Mic className="w-2.5 h-2.5" /> Áudio
                      </span>
                    ) : null}
                    
                    {(() => {
                      const lSrs = getCardSRS(phrase, 'learn');
                      const aSrs = getCardSRS(phrase, 'active');
                      return (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {lSrs.interval > 0 && (
                            <span className="text-[9px] text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20 flex items-center gap-1" title="Intervalo no modo Aprender">
                              <Clock className="w-2.5 h-2.5" /> Aprender: {lSrs.interval < 1 ? 'hoje' : `${Math.round(lSrs.interval)}d`}
                            </span>
                          )}
                          {aSrs.interval > 0 && (
                            <span className="text-[9px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20 flex items-center gap-1" title="Intervalo no modo Recordação Ativa">
                              <Clock className="w-2.5 h-2.5" /> Recordação: {aSrs.interval < 1 ? 'hoje' : `${Math.round(aSrs.interval)}d`}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  <p className="font-semibold text-slate-200 truncate text-xs">{phrase.target}</p>
                  <p className="text-slate-400 text-[11px] truncate">{phrase.native}</p>
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                  <a
                    href={`https://www.playphrase.me/#/search?q=${encodeURIComponent(phrase.target.replace(/\[sound:[^\]]+\]/gi, '').replace(/[^\w\s'?]/gi, ' ').trim())}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition hover:bg-rose-500/10"
                    title="Ver cenas reais no PlayPhrase.me (Sem limites)"
                  >
                    <Video className="w-3.5 h-3.5" />
                  </a>

                  <AudioPlayerButton phrase={phrase} variant="compact" />
                  
                  <button
                    onClick={() => onEdit(phrase)}
                    className="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg transition"
                    title="Editar Card"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Deseja realmente excluir este card?")) {
                        onDelete(phrase.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition"
                    title="Excluir Card"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-2.5 border-t border-[#1f2b45] flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportBackup}
              disabled={isExporting || phrases.length === 0}
              className="flex-1 sm:flex-initial px-3.5 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-[#00c57c] border border-emerald-500/30 rounded-xl transition font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-40"
              title="Exportar todos os cards e áudios em um arquivo JSON"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{exportProgress ? `Exportando (${exportProgress.current}/${exportProgress.total})...` : 'Exportando...'}</span>
                </>
              ) : exportSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Backup Baixado!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar Backup (.json)</span>
                </>
              )}
            </button>

            {onOpenImport && (
              <button
                onClick={() => {
                  onClose();
                  onOpenImport();
                }}
                className="flex-1 sm:flex-initial px-3.5 py-2 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 rounded-xl transition font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95"
                title="Importar cards / backup"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Importar JSON</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition font-medium text-xs active:scale-95 text-center"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
