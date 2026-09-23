import React, { useState } from 'react';
import { X, Tag, Plus, Trash2, Upload, Sparkles, Loader2, Volume2 } from 'lucide-react';
import AudioRecorder from './AudioRecorder';
import { generateTTSAudioBlob } from '../services/audioService';

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
  const [audioMode, setAudioMode] = useState('upload'); // 'upload' | 'record' | 'generate'
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

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
      setFileName(`Gravação (${Math.round(blob.size / 1024)} KB)`);
    } else {
      setFileName('');
    }
  };

  const handleGenerateAI = async () => {
    if (!target.trim()) {
      alert("Digite a frase na Frente antes de gerar o áudio.");
      return;
    }

    try {
      setIsGeneratingAudio(true);
      const blob = await generateTTSAudioBlob(target.trim(), 'en');
      setAudioBlob(blob);
      setFileName(`Áudio Nativo Gerado (${Math.round(blob.size / 1024)} KB)`);
      
      // Play quick preview
      const previewUrl = URL.createObjectURL(blob);
      new Audio(previewUrl).play();
    } catch (err) {
      console.error(err);
      alert("Não foi possível baixar o MP3 no momento, usaremos a voz do sistema offline.");
    } finally {
      setIsGeneratingAudio(false);
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#131b2e] border border-[#1f2b45] rounded-t-3xl sm:rounded-3xl w-full max-w-lg p-5 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] sm:max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1f2b45]">
          <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
            <div className="p-1.5 sm:p-2 rounded-xl bg-[#00c57c]/10 text-[#00c57c]">
              <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span>{editingPhrase ? 'Editar Card' : 'Novo Card'}</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 text-xs">
          
          {/* Frente */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-300">
                Frente
              </label>
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={isGeneratingAudio || !target.trim()}
                className="text-[11px] text-[#00c57c] hover:text-emerald-300 flex items-center gap-1 font-semibold disabled:opacity-40 transition"
              >
                {isGeneratingAudio ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{isGeneratingAudio ? 'Gerando...' : '⚡ Gerar Áudio Nativo'}</span>
              </button>
            </div>
            <textarea
              required
              rows={2}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="O que você vê primeiro (ex: was daring enough to take the King's challenge.)"
              className="w-full bg-[#0a0f1d] border border-[#1f2b45] rounded-xl sm:rounded-2xl p-3 text-slate-100 placeholder-slate-500 focus:border-[#00c57c] focus:ring-1 focus:ring-[#00c57c] focus:outline-none text-xs transition"
            />
          </div>

          {/* Verso */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Verso
            </label>
            <textarea
              required
              rows={2}
              value={native}
              onChange={(e) => setNative(e.target.value)}
              placeholder="A resposta ao virar o card (ex: fosse ousado o suficiente para aceitar o desafio do Rei.)"
              className="w-full bg-[#0a0f1d] border border-[#1f2b45] rounded-xl sm:rounded-2xl p-3 text-slate-100 placeholder-slate-500 focus:border-[#00c57c] focus:ring-1 focus:ring-[#00c57c] focus:outline-none text-xs transition"
            />
          </div>

          {/* Tags section */}
          <div className="space-y-1.5">
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
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-medium transition flex items-center gap-1 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tag</span>
              </button>
            </div>

            {/* Current Tags Chips */}
            <div className="min-h-[36px] p-2 bg-[#0a0f1d] border border-[#1f2b45] rounded-xl flex items-center gap-1.5 flex-wrap">
              {tags.length === 0 ? (
                <span className="text-slate-600 text-[11px] px-1">Nenhuma tag adicionada</span>
              ) : (
                tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-lg text-xs font-mono"
                  >
                    <Tag className="w-2.5 h-2.5 text-[#00c57c]" />
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-0.5 text-slate-400 hover:text-rose-400 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Existing Tags Chips */}
            {existingTags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap pt-0.5 text-[11px]">
                <span className="text-slate-500 text-[10px]">Sugeridas:</span>
                {existingTags.slice(0, 6).map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    className="px-1.5 py-0.5 rounded bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/40 text-[10px] font-mono transition active:scale-95"
                  >
                    +{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Audio Input Tabs */}
          <div className="space-y-1.5 pt-1">
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

            {/* Current Audio Status */}
            {audioBlob && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs text-emerald-400">
                <span className="flex items-center gap-1.5 font-medium truncate">
                  <Volume2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{fileName || "Áudio anexado"}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAudioBlob(null);
                    setFileName('');
                  }}
                  className="text-[11px] text-slate-400 hover:text-rose-400 underline shrink-0 ml-2"
                >
                  Remover
                </button>
              </div>
            )}

            {audioMode === 'upload' ? (
              <div className="border border-dashed border-slate-700 hover:border-slate-500 rounded-xl sm:rounded-2xl p-3.5 text-center bg-[#0a0f1d]/70 cursor-pointer relative transition">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center justify-center gap-1 text-slate-400">
                  <Upload className="w-4 h-4 text-[#00c57c]" />
                  <span className="font-medium text-slate-200 text-xs">
                    {fileName || "Clique ou selecione um áudio (.mp3, .wav)"}
                  </span>
                </div>
              </div>
            ) : (
              <AudioRecorder
                initialAudioBlob={editingPhrase?.audioBlob}
                onAudioRecorded={handleAudioRecorded}
              />
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-[#1f2b45] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition font-medium text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-semibold bg-[#00c57c] hover:bg-[#00af6e] text-white shadow-lg shadow-emerald-950/40 transition active:scale-95 text-center"
            >
              {editingPhrase ? 'Salvar' : 'Adicionar Card'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
