import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Check, X, ShieldAlert } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey } from '../services/audioService';

export default function ApiKeyModal({ isOpen, onClose, onSaved }) {
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setKeyInput(getStoredApiKey() || '');
      setError(null);
      setShowKey(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    const cleanKey = keyInput.trim();
    if (!cleanKey) {
      setError('Por favor, informe uma chave de API válida da ElevenLabs.');
      return;
    }

    setStoredApiKey(cleanKey);
    if (onSaved) onSaved(cleanKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#131b2e] border border-[#1f2b45] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1f2b45]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-[#00c57c]">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Chave de API ElevenLabs</h3>
              <p className="text-[11px] text-slate-400">Necessária para sintetizar áudio IA com vozes reais</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-semibold">
              Digite ou cole sua chave ElevenLabs (API Key):
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={(e) => {
                  setKeyInput(e.target.value);
                  setError(null);
                }}
                placeholder="sk_..."
                autoFocus
                className="w-full bg-[#0a0f1d] border border-[#1f2b45] rounded-xl px-3 py-2.5 pr-10 text-slate-100 placeholder-slate-600 focus:border-[#00c57c] focus:outline-none font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                tabIndex={-1}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              Sua chave fica gravada apenas no navegador local do seu aparelho e nunca é compartilhada.
            </p>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-[11px] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1f2b45]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-semibold bg-[#00c57c] hover:bg-[#00af6e] text-white shadow-lg shadow-emerald-950/40 transition active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Chave</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
