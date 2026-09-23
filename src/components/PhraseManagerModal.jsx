import React, { useState } from 'react';
import { X, Search, Trash2, Edit3, Volume2, Mic, Clock, Tag } from 'lucide-react';
import AudioPlayerButton from './AudioPlayerButton';

export default function PhraseManagerModal({
  isOpen,
  onClose,
  phrases,
  onDelete,
  onEdit
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');

  if (!isOpen) return null;

  const allTags = ['all', ...new Set(phrases.flatMap(p => p.tags || []))].filter(Boolean);

  const filtered = phrases.filter(p => {
    const cardTags = p.tags || [];
    const matchesSearch = 
      p.native.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cardTags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTag = selectedTag === 'all' || cardTags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#131b2e] border border-[#1f2b45] rounded-3xl w-full max-w-3xl p-6 shadow-2xl space-y-4 max-h-[88vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1f2b45]">
          <div>
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <span>Gerenciador de Cards (Isla)</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-[#00c57c] border border-emerald-500/20">
                {phrases.length}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Gerencie seus cards, tags do Anki e áudios
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por português, inglês ou tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a0f1d] border border-[#1f2b45] rounded-xl pl-9 pr-3.5 py-2 text-slate-200 placeholder-slate-500 focus:border-[#00c57c] focus:outline-none text-xs"
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
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              Nenhum card cadastrado ou encontrado com os filtros atuais.
            </div>
          ) : (
            filtered.map((phrase) => (
              <div
                key={phrase.id}
                className="p-3.5 bg-[#0a0f1d] border border-[#1f2b45] hover:border-slate-700 rounded-2xl flex items-center justify-between gap-3 transition"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(phrase.tags || []).length > 0 ? (
                      phrase.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5 text-[#00c57c]" />
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-500">sem tags</span>
                    )}

                    {phrase.audioBlob ? (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <Mic className="w-3 h-3" /> Áudio Anexado
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Volume2 className="w-3 h-3" /> Voz Nativa
                      </span>
                    )}
                    
                    {phrase.interval && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {phrase.interval}d
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-slate-200 truncate">{phrase.native}</p>
                  <p className="text-slate-400 text-[11px] truncate">{phrase.target}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <AudioPlayerButton phrase={phrase} variant="compact" />
                  
                  <button
                    onClick={() => onEdit(phrase)}
                    className="p-2 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-800 transition"
                    title="Editar Card"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Deseja realmente remover este card?")) {
                        onDelete(phrase.id);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                    title="Excluir Card"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#1f2b45] flex justify-between items-center text-xs">
          <span className="text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00c57c]"></span>
            Isla Database (Offline)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition font-medium"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
