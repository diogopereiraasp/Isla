import React, { useState } from 'react';
import { X, FileJson, Upload, Check, AlertCircle, Copy, Music, Loader2, Sparkles, Wand2, Key } from 'lucide-react';
import ApiKeyModal from './ApiKeyModal';
import { generateElevenLabsAudioBlob, DEFAULT_ELEVENLABS_VOICES, getStoredApiKey } from '../services/audioService';
import { parseBackupCards } from '../services/exportService';

const EXAMPLE_JSON = [
  {
    "frente": "was daring enough to take the King's challenge.",
    "verso": "fosse ousado o suficiente para aceitar o desafio do Rei.",
    "tags": ["the_endless_tale"]
  },
  {
    "frente": "I usually drink black coffee every morning before working.",
    "verso": "Eu costumo tomar café puro todas as manhãs antes de trabalhar.",
    "tags": ["rotina_matinal"]
  }
];

export default function ImportJSONModal({ isOpen, onClose, onImport, existingPhrases = [] }) {
  const [jsonText, setJsonText] = useState('');
  const [audioFilesMap, setAudioFilesMap] = useState({});
  const [generateWithElevenLabs, setGenerateWithElevenLabs] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState('random'); // Sorteia aleatoriamente
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  
  // Progress tracking
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [progressCurrent, setProgressCurrent] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);
  const [error, setError] = useState(null);
  const [successCount, setSuccessCount] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

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

  const handleImportSubmit = async (e, customApiKey = '') => {
    if (e && e.preventDefault) e.preventDefault();
    setError(null);
    setSuccessCount(null);

    if (!jsonText.trim()) {
      setError("Por favor, selecione um arquivo JSON ou cole o JSON dos cards.");
      return;
    }

    const activeKey = customApiKey || getStoredApiKey();
    if (generateWithElevenLabs && !activeKey) {
      setIsApiKeyModalOpen(true);
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

      setIsProcessing(true);
      setProgressTotal(cardsArray.length);
      setProgressCurrent(0);
      setProgressText("Lendo dados e áudios do arquivo...");

      // Converte audioBase64 em Blobs reais se for um arquivo de backup completo
      cardsArray = await parseBackupCards(cardsArray);

      const cleanSoundTag = (str) => String(str || '').replace(/\[sound:[^\]]+\]/gi, '').trim();
      const normalize = (str) => cleanSoundTag(str)
        .toLowerCase()
        .replace(/[.,/#!$%^&*;:{}=\-_`~()?'"]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      const existingKeys = new Set(
        existingPhrases.map(p => `${normalize(p.target)}|||${normalize(p.native)}`)
      );
      const seenBatchKeys = new Set();

      // Process and generate audio for each card if option enabled
      for (let i = 0; i < cardsArray.length; i++) {
        const card = cardsArray[i];
        setProgressCurrent(i + 1);

        const rawTarget = card.target || card.frente || card.front || '';
        const rawNative = card.native || card.verso || card.back || '';
        const normKey = `${normalize(rawTarget)}|||${normalize(rawNative)}`;

        // Se o card já existe ou é duplicata dentro do próprio lote, pula sem gastar ElevenLabs
        if (existingKeys.has(normKey) || seenBatchKeys.has(normKey)) {
          setProgressText(`Ignorando duplicata ${i + 1}/${cardsArray.length}...`);
          continue;
        }
        seenBatchKeys.add(normKey);

        const audioKey = (card.audio || card.sound || '').toLowerCase().trim();
        const hasManualAudio = !!audioFilesMap[audioKey] || !!card.audioBlob;

        if (generateWithElevenLabs && !hasManualAudio) {
          const textToSpeak = cleanSoundTag(rawTarget);
          
          if (textToSpeak) {
            setProgressText(`Gerando áudio IA ${i + 1}/${cardsArray.length}: "${textToSpeak.slice(0, 30)}..."`);
            try {
              const blob = await generateElevenLabsAudioBlob(textToSpeak, activeKey, selectedVoice);
              card.audioBlob = blob;
            } catch (elevenErr) {
              console.warn(`ElevenLabs error card ${i+1}:`, elevenErr);
              if (elevenErr.message && elevenErr.message.includes("não informada")) {
                setIsProcessing(false);
                setIsApiKeyModalOpen(true);
                return;
              }
            }
          }
        } else {
          setProgressText(`Processando card ${i + 1}/${cardsArray.length}...`);
        }
      }

      setProgressText("Salvando cards e áudios no banco local...");
      const imported = await onImport(cardsArray, audioFilesMap);
      setSuccessCount(imported);
      
      setTimeout(() => {
        onClose();
        setJsonText('');
        setAudioFilesMap({});
        setSuccessCount(null);
        setIsProcessing(false);
      }, 1500);
    } catch (err) {
      setError(err.message || "Estrutura JSON inválida. Verifique a sintaxe.");
      setIsProcessing(false);
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

  const progressPercent = progressTotal > 0 ? Math.round((progressCurrent / progressTotal) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#131b2e] border border-[#1f2b45] rounded-t-3xl sm:rounded-3xl w-full max-w-xl p-5 sm:p-7 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1f2b45]">
          <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <FileJson className="w-5 h-5" />
            </div>
            <span>Importar Cards &amp; Gerar Áudios ElevenLabs</span>
          </h3>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition active:scale-95 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleImportSubmit} className="space-y-4 text-xs">
          
          {/* File input */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300">
              1. Selecione seu arquivo <code className="text-blue-400 bg-slate-900 px-1.5 py-0.5 rounded">.json</code>:
            </label>
            
            <div className="border border-dashed border-slate-700 hover:border-slate-500 rounded-2xl p-4 text-center bg-[#0a0f1d]/70 cursor-pointer relative transition">
              <input
                type="file"
                multiple
                disabled={isProcessing}
                accept=".json,application/json,audio/*"
                onChange={handleFilesSelected}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
              />
              <div className="flex flex-col items-center justify-center gap-1.5 text-slate-400">
                <div className="flex items-center gap-2 text-blue-400">
                  <FileJson className="w-5 h-5" />
                  <span className="text-slate-500">+</span>
                  <Wand2 className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="font-medium text-slate-200 text-xs">
                  Arraste ou selecione o arquivo <strong className="text-white">.json</strong>
                </span>
                <span className="text-[10px] text-slate-500">
                  O Isla gera os áudios via ElevenLabs automaticamente para você
                </span>
              </div>
            </div>
          </div>

          {/* ElevenLabs Settings Box */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-slate-200">Gerar Áudios com ElevenLabs</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  disabled={isProcessing}
                  checked={generateWithElevenLabs}
                  onChange={(e) => setGenerateWithElevenLabs(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00c57c]"></div>
              </label>
            </div>

            {generateWithElevenLabs && (
              <div className="space-y-2.5 pt-1 text-xs border-t border-slate-800/80">
                <div>
                  <label className="block text-slate-400 mb-1">Voz do ElevenLabs:</label>
                  <select
                    disabled={isProcessing}
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full bg-[#0a0f1d] border border-[#1f2b45] rounded-xl px-3 py-2 text-slate-200 focus:border-[#00c57c] focus:outline-none"
                  >
                    {DEFAULT_ELEVENLABS_VOICES.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60">
                  <span className="text-slate-400">
                    {getStoredApiKey() ? "🔑 Chave de API configurada" : "⚠️ Nenhuma chave de API salva"}
                  </span>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => setIsApiKeyModalOpen(true)}
                    className="text-[#00c57c] hover:underline flex items-center gap-1 font-medium disabled:opacity-50"
                  >
                    <Key className="w-3 h-3" />
                    <span>{getStoredApiKey() ? "Alterar Chave" : "Inserir Chave"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* JSON Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label className="font-semibold text-slate-300">
                2. Conteúdo do JSON:
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fillWithExample}
                  disabled={isProcessing}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium underline disabled:opacity-50"
                >
                  Preencher Exemplo
                </button>
                <button
                  type="button"
                  onClick={copyTemplate}
                  disabled={isProcessing}
                  className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 disabled:opacity-50"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? 'Copiado!' : 'Copiar Modelo'}</span>
                </button>
              </div>
            </div>

            <textarea
              rows={6}
              disabled={isProcessing}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder={`[\n  {\n    "frente": "was daring enough to take the Kings challenge.",\n    "verso": "fosse ousado o suficiente para aceitar o desafio do Rei.",\n    "tags": ["the_endless_tale"]\n  }\n]`}
              className="w-full bg-[#0a0f1d] border border-[#1f2b45] rounded-2xl p-3 text-slate-100 placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-xs font-mono transition disabled:opacity-50"
            />
          </div>

          {/* Progress Bar when Generating */}
          {isProcessing && (
            <div className="p-4 bg-slate-900 border border-blue-500/30 rounded-2xl space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  <span className="truncate max-w-[280px]">{progressText || 'Gerando áudios ElevenLabs...'}</span>
                </span>
                <span className="font-mono font-bold text-blue-400">{progressPercent}%</span>
              </div>
              
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-[#00c57c] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-500 text-center">
                Gravando áudios permanentemente no seu dispositivo ({progressCurrent} de {progressTotal})
              </p>
            </div>
          )}

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
              <span>{successCount} cards e áudios salvos com sucesso no seu Isla!</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 border-t border-[#1f2b45] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-950/40 transition active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isProcessing ? 'Gerando e Salvando...' : 'Iniciar Importação'}</span>
            </button>
          </div>

        </form>

      </div>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSaved={(newKey) => {
          setIsApiKeyModalOpen(false);
          handleImportSubmit(null, newKey);
        }}
      />
    </div>
  );
}
