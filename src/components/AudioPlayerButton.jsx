import React, { useState } from 'react';
import { Volume2, Loader2, Sparkles } from 'lucide-react';
import { playPhraseAudio } from '../services/audioService';

export default function AudioPlayerButton({ phrase, label, className = '', variant = 'default' }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = async (e) => {
    e.stopPropagation();
    if (!phrase || isPlaying) return;

    try {
      setIsPlaying(true);
      await playPhraseAudio(phrase);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPlaying(false);
    }
  };

  const hasCustomAudio = !!phrase?.audioBlob;

  if (variant === 'compact') {
    return (
      <button
        onClick={handlePlay}
        disabled={isPlaying}
        className={`p-2 rounded-lg transition-all flex items-center justify-center ${
          isPlaying 
            ? 'bg-emerald-500/20 text-[#00c57c]' 
            : 'text-slate-400 hover:text-[#00c57c] hover:bg-slate-800'
        } ${className}`}
        title={hasCustomAudio ? "Tocar Áudio Gravado" : "Ouvir Pronúncia Nativa"}
      >
        {isPlaying ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#00c57c]" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handlePlay}
      disabled={isPlaying}
      className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 ${
        hasCustomAudio
          ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-[#00c57c] border-emerald-500/30'
          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700/70'
      } ${isPlaying ? 'ring-2 ring-[#00c57c]/40' : ''} ${className}`}
    >
      {isPlaying ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00c57c]" />
      ) : (
        <Volume2 className={`w-3.5 h-3.5 ${hasCustomAudio ? 'text-[#00c57c]' : 'text-slate-300'}`} />
      )}
      <span>
        {label || (hasCustomAudio ? 'Áudio Nativo / Gravado' : 'Ouvir Pronúncia')}
      </span>
      <kbd className="hidden sm:inline-block px-1 py-0.2 bg-slate-900/80 border border-slate-700/70 rounded text-[9px] text-slate-400 font-mono">
        R
      </kbd>
    </button>
  );
}
