import React, { useState } from 'react';
import { X, FileJson, Upload, Check, AlertCircle, Copy, FileText } from 'lucide-react';

const EXAMPLE_JSON = [
  {
    "frente": "was daring enough to take the King's challenge.",
    "verso": "fosse ousado o suficiente para aceitar o desafio do Rei.",
    "tags": ["the_endless_tale", "historia_1"]
  },
  {
    "frente": "I usually drink black coffee every morning before working.",
    "verso": "Eu costumo tomar café puro todas as manhãs antes de trabalhar.",
    "tags": ["rotina_matinal", "habitos"]
  },
  {
    "frente": "Could you please explain this concept in more detail?",
    "verso": "Você poderia por favor explicar este conceito com mais detalhes?",
    "tags": ["trabalho", "perguntas"]
  }
];

export default function ImportJSONModal({ isOpen, onClose, onImport }) {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState(null);
  const [successCount, setSuccessCount] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    setError(null);
    setSuccessCount(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        setJsonText(content);
      } catch (err) {
        setError("Erro ao ler o arquivo JSON.");
      }
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessCount(null);

    if (!jsonText.trim()) {
      setError("Por favor, cole ou envie um JSON válido com os cards.");
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

      const imported = await onImport(cardsArray);
      setSuccessCount(imported);
      setTimeout(() => {
        onClose();
        setJsonText('');
        setSuccessCount(null);
      }, 1200);
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

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#131b2e] border border-[#1f2b45] rounded-t-3xl sm:rounded-3xl w-full max-w-xl p-5 sm:p-7 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1f2b45]">
          <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <FileJson className="w-5 h-5" />
            </div>
            <span>Importar Vários Cards (JSON)</span>
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
          
          <div className="flex items-center justify-between gap-2">
            <label className="font-semibold text-slate-300">
              Cole o JSON ou envie um arquivo .json:
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fillWithExample}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium underline"
              >
                Preencher Exemplo
              </button>
              <button
                type="button"
                onClick={copyTemplate}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                title="Copiar modelo"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Copiado!' : 'Copiar Modelo'}</span>
              </button>
            </div>
          </div>

          {/* Drag & Drop / File selector */}
          <div className="border border-dashed border-slate-700 hover:border-slate-500 rounded-2xl p-3 text-center bg-[#0a0f1d]/70 cursor-pointer relative transition">
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <Upload className="w-4 h-4 text-blue-400" />
              <span className="font-medium text-slate-300 text-xs">
                Clique para selecionar um arquivo .json do seu computador
              </span>
            </div>
          </div>

          {/* JSON Textarea */}
          <div>
            <textarea
              rows={8}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder='[\n  {\n    "frente": "was daring enough...",\n    "verso": "fosse ousado o suficiente...",\n    "tags": ["the_endless_tale"]\n  }\n]'
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
              Importar Cards
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
