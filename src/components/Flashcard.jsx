import React from 'react';
import { Eye, ArrowLeft, ArrowRight, Sparkles, Clock, Tag } from 'lucide-react';
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
  onOpenAdd
}) {
  if (!phrase) {
    return (
      <div className="w-full max-w-2xl bg-[#131b2e] rounded-2xl sm:rounded-3xl border border-[#1f2b45] p-6 sm:p-12 text-center card-glow my-auto">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mx-auto flex items-center justify-center text-[#00c57c] mb-3.5">
          <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Seu Isla está pronto!</h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-5 sm:mb-6">
          Nenhum card pendente para esta seleção. Adicione frases com áudio e tags para praticar.
        </p>
        <button
          onClick={onOpenAdd}
          className="w-full sm:w-auto px-5 py-3 bg-[#00c57c] hover:bg-[#00af6e] text-white font-semibold rounded-xl sm:rounded-2xl text-xs sm:text-sm shadow-lg shadow-emerald-950/40 transition active:scale-95"
        >
          + Adicionar Primeiro Card
        </button>
      </div>
    );
  }

  const isLearnMode = mode === 'learn';
  const isActiveMode = mode === 'active';
  const isSRSMode = mode === 'srs';
  const tags = phrase.tags || [];

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
          {isSRSMode && "Repetição"}
          {isLearnMode && "Aprender"}
          {isActiveMode && "Recordação"}
        </span>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[140px] sm:min-h-[180px] flex flex-col justify-center text-center px-1 sm:px-4">
        
        {/* Top Prompt Instruction */}
        <p className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-slate-400 mb-2 sm:mb-3 flex items-center justify-center gap-1.5">
          {isActiveMode && "TRADUZA EM VOZ ALTA:"}
          {isLearnMode && "OUÇA E REPITA:"}
          {isSRSMode && "FALE ANTES DE VIRAR:"}
        </p>

        {/* Primary Prompt Text */}
        <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight leading-relaxed select-text break-words">
          {isActiveMode ? phrase.native : phrase.target}
        </h2>

        {/* Learn Mode Front Audio */}
        {isLearnMode && (
          <div className="mt-3.5 sm:mt-4 flex items-center justify-center">
            <AudioPlayerButton phrase={phrase} label="Ouvir Pronúncia" />
          </div>
        )}

        {/* Revealed Section */}
        {isRevealed && (
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-[#1f2b45] transition-all animate-fadeIn">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#00c57c] mb-1">
              {isActiveMode || isSRSMode ? "RESPOSTA & SHADOWING:" : "TRADUÇÃO:"}
            </p>
            <h3 className="text-base sm:text-xl font-semibold text-slate-100 leading-snug select-text break-words">
              {isActiveMode || isSRSMode ? phrase.target : phrase.native}
            </h3>

            {/* Audio Button on Reveal */}
            {(isActiveMode || isSRSMode) && (
              <div className="mt-3 sm:mt-3.5 flex items-center justify-center">
                <AudioPlayerButton phrase={phrase} />
              </div>
            )}
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
            <span>{isLearnMode ? "Ver Tradução" : "Revelar Resposta"}</span>
          </button>
        ) : (
          <div>
            {/* Feedback / Review actions */}
            {isSRSMode ? (
              <SRSFeedbackButtons onFeedback={onFeedback} simplified={false} />
            ) : isActiveMode ? (
              <SRSFeedbackButtons onFeedback={onFeedback} simplified={true} />
            ) : (
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <button
                  onClick={onPrev}
                  className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-700/60 active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>
                <button
                  onClick={onNext}
                  className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-700/60 active:scale-95"
                >
                  <span>Próxima</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
