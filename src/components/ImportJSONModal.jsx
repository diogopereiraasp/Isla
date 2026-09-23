import React, { useState } from 'react';
import { X, FileJson, Upload, Check, AlertCircle, Copy, Music, FileText } from 'lucide-react';

const EXAMPLE_JSON = [
  {
    "frente": "was daring enough to take the King's challenge.",
    "verso": "fosse ousado o suficiente para aceitar o desafio do Rei.",
    "audio": "challenge.mp3",
    "tags": ["the_endless_tale"]
  },
  {
    "frente": "I usually drink black coffee every morning before working.",
    "verso": "Eu costumo tomar café puro todas as manhãs antes de trabalhar.",
    "audio": "coffee.mp3",
    "tags": ["rotina_matinal"]
  }
];

export default function ImportJSONModal({ isOpen, onClose, onImport }) {
  const [jsonText, setJsonText] = useState('');
  const [audioFilesMap, setAudioFilesMap] = useState({}); // { "filename.mp3": File }
  const [error, setError] = useState(null);
  const [successCount, setSuccessCount] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Handle files: can accept .json and multiple .mp3 / .wav / .m4a
  const handleFilesSelected = (e) => {
    setError(null);
    setSuccessCount(null);
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newAudios = { ...audioFilesMap };

    files.forEach(file => {
      const name = file.name.toLowerCase();
      if (name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setJsonText(event.target.result);
        };
        reader.readAsText(file);
      } else if (file.type.startsWith('audio/') || /\.(mp3|wav|m4a|ogg|aac)$/i.test(name)) {
        newAudios[file.name.toLowerCase()] = file;
      }
    });

    setAudioFilesMap(newAudios);
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessCount(null);

    if (!jsonText.trim()) {
      setError("Por favor, selecione um arquivo JSON ou cole o JSON dos cards.");
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);
      let cardsArray = [];

      if (Array.isArray(parsed)) {
        cardsArray = parsed;
      } else if (parsed && Array.isArray(parsed.cards)) {
        cardsArray = parsed.cards;
      } else if (parsed && Array.isArray(parsed.phrases)) {
        cardsArray = parsed.phrases;
      } else {
        throw new Error("O JSON precisa ser um array de objetos ou conter a chave 'cards': []");
      }

      if (cardsArray.length === 0) {
        throw new Error("Nenhum card encontrado no JSON fornecido.");
      }

      const imported = await onImport(cardsArray, audioFilesMap);
      setSuccessCount(imported);
      setTimeout(() => {
        onClose();
        setJsonText('');
        setAudioFilesMap({});
        setSuccessCount(null);
      }, 1500);
    } catch (err) {
      setError(err.message || "Estrutura JSON inválida. Verifique a sintaxe.");
    }
  };

  const copyTemplate = () => {
    navigator.clipboard.writeText(JSON.stringify(EXAMPLE_JSON, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fillWithExample = () => {
    setJsonText(JSON.stringify(EXAMPLE_JSON, null, 2));
    setError(null);
  };

  const audioCount = Object.keys(audioFilesMap).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#131b2e] border border-[#1f2b45] rounded-t-3xl sm:rounded-3xl w-full max-w-xl p-5 sm:p-7 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1f2b45]">
          <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <FileJson className="w-5 h-5" />
            </div>
            <span>Importar Cards &amp; Áudios em Massa</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload File or Paste */}
        <form onSubmit={handleImportSubmit} className="space-y-4 text-xs">
          
          {/* File input (accepts .json AND audio files simultaneously) */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300">
              1. Selecione o arquivo <code className="text-blue-400 bg-slate-900 px-1.5 py-0.5 rounded">.json</code> + arquivos de <code className="text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded">áudio</code>:
            </label>
            
            <div className="border border-dashed border-slate-700 hover:border-slate-500 rounded-2xl p-4 text-center bg-[#0a0f1d]/70 cursor-pointer relative transition">
              <input
                type="file"
                multiple
                accept=".json,application/json,audio/*"
                onChange={handleFilesSelected}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center justify-center gap-1.5 text-slate-400">
                <div className="flex items-center gap-2 text-blue-400">
                  <FileJson className="w-5 h-5" />
                  <span className="text-slate-500">+</span>
                  <Music className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="font-medium text-slate-200 text-xs">
                  Arraste ou selecione o <strong className="text-white">JSON</strong> e os <strong className="text-white">áudios (.mp3)</strong> juntos
                </span>
                <span className="text-[10px] text-slate-500">
                  O Isla conecta automaticamente cada áudio pelo nome definido no JSON
                </span>
              </div>
            </div>

            {/* Audio Files Attached Badge */}
            {audioCount > 0 && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs text-emerald-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <Music className="w-3.5 h-3.5" />
                  {audioCount} {audioCount === 1 ? 'arquivo de áudio carregado' : 'arquivos de áudio carregados'}
                </span>
                <button
                  type="button"
                  onClick={() => setAudioFilesMap({})}
                  className="text-[11px] text-slate-400 hover:text-rose-400 underline"
                >
                  Limpar áudios
                </button>
              </div>
            )}
          </div>

          {/* JSON Preview/Paste Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label className="font-semibold text-slate-300">
                2. Estrutura do JSON:
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fillWithExample}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium underline"
                >
                  Preencher Exemplo
                </button>
                <button
                  type="button"
                  onClick={copyTemplate}
                  className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? 'Copiado!' : 'Copiar Modelo'}</span>
                </button>
              </div>
            </div>

            <textarea
              rows={7}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder={`[\n  {\n    "frente": "was daring enough to take the Kings challenge.",\n    "verso": "fosse ousado o suficiente para aceitar o desafio do Rei.",\n    "audio": "challenge.mp3",\n    "tags": ["the_endless_tale"]\n  }\n]`}
              className="w-full bg-[#0a0f1d] border border-[#1f2b45] rounded-2xl p-3 text-slate-100 placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-xs font-mono transition"
            />
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successCount !== null && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[#00c57c] text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successCount} cards importados com sucesso para o seu Isla!</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 border-t border-[#1f2b45] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-950/40 transition active:scale-95"
            >
              Importar Cards &amp; Áudios
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
