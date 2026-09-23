import React, { useState } from 'react';
import { X, Tag, Plus, Trash2, Upload, Sparkles } from 'lucide-react';
import AudioRecorder from './AudioRecorder';

export default function AddPhraseModal({
  isOpen,
  onClose,
  onSave,
  editingPhrase = null,
  existingTags = []
}) {
  const [target, setTarget] = useState(''); // Frente (Front)
  const [native, setNative] = useState(''); // Verso (Back)
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [fileName, setFileName] = useState('');
  const [audioMode, setAudioMode] = useState('upload'); // 'upload' | 'record'

  // Pre-fill on open/edit
  React.useEffect(() => {
    if (editingPhrase) {
      setTarget(editingPhrase.target || '');
      setNative(editingPhrase.native || '');
      setTags(Array.isArray(editingPhrase.tags) ? editingPhrase.tags : []);
      setAudioBlob(editingPhrase.audioBlob || null);
      setFileName(editingPhrase.audioBlob ? 'Áudio Existente' : '');
    } else {
      setTarget('');
      setNative('');
      setTags([]);
      setTagInput('');
      setAudioBlob(null);
      setFileName('');
    }
  }, [editingPhrase, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = (tagToAdd) => {
    const raw = tagToAdd || tagInput;
    if (!raw) return;
    const formatted = raw
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_À-ÿ-]/g, '');

    if (formatted && !tags.includes(formatted)) {
      setTags([...tags, formatted]);
    }
    setTagInput('');
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioBlob(file);
      setFileName(`${file.name} (${Math.round(file.size / 1024)} KB)`);
    }
  };

  const handleAudioRecorded = (blob) => {
    setAudioBlob(blob);
    if (blob) {
      setFileName(`Gravação de Voz (${Math.round(blob.size / 1024)} KB)`);
    } else {
      setFileName('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!target.trim() || !native.trim()) return;

    let finalTags = [...tags];
    if (tagInput.trim()) {
      const formatted = tagInput.trim().toLowerCase().replace(/\s+/g, '_');
      if (formatted && !finalTags.includes(formatted)) {
        finalTags.push(formatted);
      }
    }

    onSave({
      id: editingPhrase?.id,
      target: target.trim(),
      native: native.trim(),
      tags: finalTags,
      audioBlob
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#131b2e] border border-[#1f2b45] rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1f2b45]">
          <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#00c57c]/10 text-[#00c57c]">
              <Tag className="w-5 h-5" />
            </div>
            <span>{editingPhrase ? 'Editar Card' : 'Novo Card no Isla'}</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">

          {/* Frente */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Frente
            </label>
            <textarea
              required
              rows={2}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="O que você vê primeiro para testar sua memória (ex: frase em inglês ou pergunta). Ex: was daring enough to take the King's challenge."
              className="w-full bg-[#0a0f1d] border border-[#1f2b45] rounded-2xl p-3 text-slate-100 placeholder-slate-500 focus:border-[#00c57c] focus:ring-1 focus:ring-[#00c57c] focus:outline-none text-xs transition"
            />
          </div>

          {/* Verso */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Verso
            </label>
            <textarea
              required
              rows={2}
              value={native}
              onChange={(e) => setNative(e.target.value)}
              placeholder="A resposta ou tradução revelada ao virar o card. Ex: fosse ousado o suficiente para aceitar o desafio do Rei."
              className="w-full bg-[#0a0f1d] border border-[#1f2b45] rounded-2xl p-3 text-slate-100 placeholder-slate-500 focus:border-[#00c57c] focus:ring-1 focus:ring-[#00c57c] focus:outline-none text-xs transition"
            />
          </div>

          {/* Anki-style Tags section */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-300">
              Tags
            </label>

            {/* Tag Input Field */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Digite uma tag e pressione Enter..."
                  className="w-full bg-[#0a0f1d] border border-[#1f2b45] rounded-xl pl-8.5 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:border-[#00c57c] focus:outline-none text-xs"
                />
              </div>
              <button
                type="button"
                onClick={() => handleAddTag()}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-medium transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tag</span>
              </button>
            </div>

            {/* Current Tags Chips */}
            <div className="min-h-[38px] p-2 bg-[#0a0f1d] border border-[#1f2b45] rounded-xl flex items-center gap-1.5 flex-wrap">
              {tags.length === 0 ? (
                <span className="text-slate-600 text-[11px] px-1">Nenhuma tag adicionada</span>
              ) : (
                tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-lg text-xs font-mono group"
                  >
                    <Tag className="w-3 h-3 text-[#00c57c]" />
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-slate-400 hover:text-rose-400 transition"
                      title="Remover tag"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Quick Sugestões de Tags Existentes */}
            {existingTags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
                <span className="text-slate-500">Tags existentes:</span>
                {existingTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    className="px-2 py-0.5 rounded-md bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/40 text-[10px] font-mono transition"
                  >
                    +{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Audio Input Tabs */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-300">
                Áudio do Card <span className="text-slate-500 font-normal">(Opcional)</span>
              </label>

              <div className="flex items-center bg-[#0a0f1d] p-0.5 rounded-lg border border-[#1f2b45] text-[11px]">
                <button
                  type="button"
                  onClick={() => setAudioMode('upload')}
                  className={`px-2.5 py-1 rounded-md transition ${audioMode === 'upload' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400'}`}
                >
                  Arquivo
                </button>
                <button
                  type="button"
                  onClick={() => setAudioMode('record')}
                  className={`px-2.5 py-1 rounded-md transition ${audioMode === 'record' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400'}`}
                >
                  Gravar Voz
                </button>
              </div>
            </div>

            {audioMode === 'record' ? (
              <AudioRecorder
                initialAudioBlob={editingPhrase?.audioBlob}
                onAudioRecorded={handleAudioRecorded}
              />
            ) : (
              <div className="border border-dashed border-slate-700 hover:border-slate-500 rounded-2xl p-4 text-center bg-[#0a0f1d]/70 cursor-pointer relative transition">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center justify-center gap-1.5 text-slate-400">
                  <Upload className="w-5 h-5 text-[#00c57c]" />
                  <span className="font-medium text-slate-200">
                    {fileName || "Clique ou arraste um arquivo de áudio (.mp3, .wav, .m4a)"}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Armazenado offline com IndexedDB
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-[#1f2b45] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-semibold bg-[#00c57c] hover:bg-[#00af6e] text-white shadow-lg shadow-emerald-950/40 transition active:scale-95"
            >
              {editingPhrase ? 'Salvar Alterações' : 'Adicionar Card'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
