import React, { useState } from 'react';
import { Eye, ArrowLeft, ArrowRight, Sparkles, Clock, Tag, Copy, Check, Video, ExternalLink } from 'lucide-react';
import AudioPlayerButton from './AudioPlayerButton';
import SRSFeedbackButtons from './SRSFeedbackButtons';

export default function Flashcard({
  phrase,
  mode,
  currentIndex,
  totalCards,
  isRevealed,
  onReveal,
  onFeedback,
  onNext,
  onPrev,
  onOpenAdd,
  hasFiltersActive = false,
  onClearFilters
}) {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedRevealed, setCopiedRevealed] = useState(false);

  if (!phrase) {
    return (
      <div className="w-full max-w-2xl bg-[#131b2e] rounded-2xl sm:rounded-3xl border border-[#1f2b45] p-6 sm:p-12 text-center card-glow my-auto animate-fadeIn">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mx-auto flex items-center justify-center text-[#00c57c] mb-3.5">
          <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
          {hasFiltersActive ? "Nenhum card com esse filtro" : "Seu Isla está pronto!"}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-5 sm:mb-6">
          {hasFiltersActive 
            ? "Você filtrou por tag ou pendências de hoje e não há cards correspondentes nesta combinação." 
            : "Nenhum card cadastrado ainda. Adicione frases com áudio e tags para praticar."
          }
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {hasFiltersActive && onClearFilters && (
            <button
              onClick={onClearFilters}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl sm:rounded-2xl text-xs sm:text-sm transition active:scale-95"
            >
              Ver Todas as Frases
            </button>
          )}
          <button
            onClick={onOpenAdd}
            className="px-5 py-2.5 bg-[#00c57c] hover:bg-[#00af6e] text-white font-semibold rounded-xl sm:rounded-2xl text-xs sm:text-sm shadow-lg shadow-emerald-950/40 transition active:scale-95"
          >
            + Adicionar Novo Card
          </button>
        </div>
      </div>
    );
  }

  const isLearnMode = mode === 'learn';
  const isActiveMode = mode === 'active';
  const isSRSMode = mode === 'srs';
  const tags = phrase.tags || [];

  const handleCopyPrompt = (e) => {
    e.stopPropagation();
    const textToCopy = isActiveMode ? phrase.native : phrase.target;
    navigator.clipboard.writeText(textToCopy);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 1500);
  };

  const handleCopyRevealed = (e) => {
    e.stopPropagation();
    const textToCopy = isActiveMode || isSRSMode ? phrase.target : phrase.native;
    navigator.clipboard.writeText(textToCopy);
    setCopiedRevealed(true);
    setTimeout(() => setCopiedRevealed(false), 1500);
  };

  /**
   * Renderiza o texto em inglês com cada palavra interativa
   * Ao passar o mouse: sublinha com animação
   * Ao clicar: abre o Cambridge Dictionary em nova aba
   */
  const renderInteractiveEnglishText = (text, className = '') => {
    if (!text) return null;

    // Divide preservando palavras e pontuações/espaços
    const tokens = text.split(/(\s+|[.,/#!$%^&*;:{}=\-_`~()?'"]+)/);

    return (
      <span className={className}>
        {tokens.map((token, idx) => {
          // Se for palavra (contém caracteres alfanuméricos)
          const isWord = /[a-zA-Z0-9]/.test(token);

          if (!isWord) {
            return <span key={idx}>{token}</span>;
          }

          const cleanWord = token.replace(/[^\w]/g, '').toLowerCase();

          return (
            <span
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://dictionary.cambridge.org/dictionary/english-portuguese/${cleanWord}`, '_blank', 'noopener,noreferrer');
              }}
              title={`Consultar "${token}" no Cambridge Dictionary`}
              className="inline-block cursor-pointer underline-offset-4 decoration-dotted hover:underline hover:decoration-solid hover:decoration-emerald-400 hover:text-emerald-300 transition-colors duration-150 active:scale-95"
            >
              {token}
            </span>
          );
        })}
      </span>
    );
  };

  return (
    <div className={`w-full max-w-2xl bg-[#131b2e] rounded-2xl sm:rounded-3xl border border-[#1f2b45] p-4 sm:p-8 relative transition-all duration-300 ${isRevealed ? 'card-glow-active' : 'card-glow'}`}>
      
      {/* Card Header: Counter, Tags & Mode Badge */}
      <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-4 sm:mb-6 font-medium">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
          <span className="tracking-wide font-semibold text-slate-300 whitespace-nowrap text-[11px] sm:text-xs">
            {currentIndex + 1}/{totalCards}
          </span>
          {tags.length > 0 ? (
            tags.slice(0, 2).map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-md text-[10px] bg-slate-800/90 text-slate-300 border border-slate-700/60 font-mono flex items-center gap-1 truncate max-w-[120px]">
                <Tag className="w-2.5 h-2.5 text-[#00c57c] shrink-0" />
                <span className="truncate">{tag}</span>
              </span>
            ))
          ) : null}
          {phrase.interval > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400/90 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20 whitespace-nowrap">
              <Clock className="w-2.5 h-2.5" />
              {phrase.interval < 1 ? 'hoje' : `${Math.round(phrase.interval)}d`}
            </span>
          )}
        </div>

        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-[#182338] text-slate-300 border border-slate-700/60 text-[10px] sm:text-[11px] font-medium tracking-wide whitespace-nowrap shrink-0">
          {isLearnMode ? "Aprender" : "Recordação Ativa"}
        </span>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[140px] sm:min-h-[180px] flex flex-col justify-center text-center px-1 sm:px-4">
        
        {/* Primary Prompt Text with Copy Button */}
        <div className="relative group inline-flex items-center justify-center gap-2">
          <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight leading-relaxed select-text break-words">
            {isActiveMode 
              ? phrase.native 
              : renderInteractiveEnglishText(phrase.target)
            }
          </h2>
          <button
            onClick={handleCopyPrompt}
            className={`p-1.5 rounded-lg border transition-all active:scale-95 ${
              copiedPrompt
                ? 'bg-emerald-500/20 text-[#00c57c] border-emerald-500/30'
                : 'text-slate-400 hover:text-white bg-slate-800/60 border-slate-700/60 opacity-70 hover:opacity-100'
            }`}
            title="Copiar texto"
          >
            {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Learn Mode Front Audio & YouGlish Button */}
        {isLearnMode && (
          <div className="mt-3.5 sm:mt-4 flex items-center justify-center gap-2 flex-wrap">
            <AudioPlayerButton phrase={phrase} label="Ouvir Pronúncia" />
            <a
              href={`https://youglish.com/pronounce/${encodeURIComponent(phrase.target.replace(/\[sound:[^\]]+\]/gi, '').replace(/[^\w\s'?]/gi, ' ').trim().replace(/\s+/g, '_'))}/english`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
              title="Ver exemplos reais falados em vídeos no YouGlish"
            >
              <Video className="w-3.5 h-3.5 text-rose-400" />
              <span>Ver no YouGlish</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        )}

        {/* Revealed Section */}
        {isRevealed && (
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-[#1f2b45] transition-all animate-fadeIn">
            <div className="relative group inline-flex items-center justify-center gap-2">
              <h3 className="text-base sm:text-xl font-semibold text-slate-100 leading-snug select-text break-words">
                {isActiveMode 
                  ? renderInteractiveEnglishText(phrase.target) 
                  : phrase.native
                }
              </h3>
              <button
                onClick={handleCopyRevealed}
                className={`p-1.5 rounded-lg border transition-all active:scale-95 ${
                  copiedRevealed
                    ? 'bg-emerald-500/20 text-[#00c57c] border-emerald-500/30'
                    : 'text-slate-400 hover:text-white bg-slate-800/60 border-slate-700/60 opacity-70 hover:opacity-100'
                }`}
                title="Copiar tradução"
              >
                {copiedRevealed ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Audio Button & YouGlish on Reveal */}
            <div className="mt-3 sm:mt-3.5 flex items-center justify-center gap-2 flex-wrap">
              {isActiveMode && (
                <AudioPlayerButton phrase={phrase} />
              )}
              <a
                href={`https://youglish.com/pronounce/${encodeURIComponent(phrase.target.replace(/\[sound:[^\]]+\]/gi, '').replace(/[^\w\s'?]/gi, ' ').trim().replace(/\s+/g, '_'))}/english`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                title="Ver exemplos reais falados em vídeos no YouGlish"
              >
                <Video className="w-3.5 h-3.5 text-rose-400" />
                <span>Ver no YouGlish</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Actions Section */}
      <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-[#1f2b45]/70">
        
        {/* Reveal Button */}
        {!isRevealed ? (
          <button
            onClick={onReveal}
            className="w-full py-3 sm:py-3.5 bg-[#1b263b] hover:bg-[#23324d] active:scale-[0.98] text-slate-200 font-semibold text-xs sm:text-sm rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2 border border-slate-700/60 shadow-lg shadow-black/30"
          >
            <Eye className="w-4 h-4 text-[#00c57c]" />
            <span>Ver Resultado</span>
          </button>
        ) : (
          <div className="space-y-3">
            {/* Rating Buttons with numeric shortcuts (1, 2, 3, 4) */}
            <SRSFeedbackButtons onFeedback={onFeedback} simplified={false} />

            {/* Navigation buttons for Aprender mode */}
            {isLearnMode && (
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  onClick={onPrev}
                  className="py-2 px-3 text-slate-400 hover:text-slate-200 text-xs font-medium rounded-xl transition flex items-center gap-1 hover:bg-slate-800/60"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Anterior</span>
                </button>
                <button
                  onClick={onNext}
                  className="py-2 px-3 text-slate-400 hover:text-slate-200 text-xs font-medium rounded-xl transition flex items-center gap-1 hover:bg-slate-800/60"
                >
                  <span>Pular</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
