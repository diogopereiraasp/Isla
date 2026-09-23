import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import IslandFilterBar from './components/IslandFilterBar';
import Flashcard from './components/Flashcard';
import AddPhraseModal from './components/AddPhraseModal';
import PhraseManagerModal from './components/PhraseManagerModal';
import StatsModal from './components/StatsModal';
import ImportJSONModal from './components/ImportJSONModal';
import { usePhrases } from './hooks/usePhrases';
import { getSRSStats } from './services/srs';
import { playPhraseAudio } from './services/audioService';

export default function App() {
  const {
    phrases,
    filteredPhrases,
    loading,
    selectedTag,
    setSelectedTag,
    dueOnlyFilter,
    setDueOnlyFilter,
    allTags,
    addOrUpdatePhrase,
    removePhrase,
    handleSRSFeedback,
    importPhrasesBatch
  } = usePhrases();

  const [mode, setMode] = useState('learn'); // 'learn' | 'active' | 'srs'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [editingPhrase, setEditingPhrase] = useState(null);

  // PWA Install prompt state
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Reset index on filter or mode change
  useEffect(() => {
    setCurrentIndex(0);
    setIsRevealed(false);
  }, [selectedTag, dueOnlyFilter, mode]);

  const currentPhrase = filteredPhrases[currentIndex] || null;
  const srsStats = getSRSStats(phrases);

  // Reveal handler
  const handleReveal = () => {
    setIsRevealed(true);
    // In active or SRS mode, automatically play the target audio for shadowing
    if (currentPhrase && (mode === 'active' || mode === 'srs')) {
      playPhraseAudio(currentPhrase);
    }
  };

  const handleNext = () => {
    if (filteredPhrases.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % filteredPhrases.length);
      setIsRevealed(false);
    }
  };

  const handlePrev = () => {
    if (filteredPhrases.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + filteredPhrases.length) % filteredPhrases.length);
      setIsRevealed(false);
    }
  };

  const onSRSFeedback = async (grade) => {
    if (!currentPhrase) return;

    if (grade >= 4) {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.8 },
        colors: ['#00c57c', '#38bdf8', '#fbbf24']
      });
    }

    await handleSRSFeedback(currentPhrase, grade);
    handleNext();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (isAddModalOpen || isManagerOpen || isStatsOpen) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (!isRevealed) {
          handleReveal();
        } else if (currentPhrase) {
          playPhraseAudio(currentPhrase);
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (isRevealed && (mode === 'active' || mode === 'srs')) {
        if (e.key === '1') onSRSFeedback(0);
        if (e.key === '2') onSRSFeedback(3);
        if (e.key === '3') onSRSFeedback(4);
        if (e.key === '4') onSRSFeedback(5);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRevealed, currentPhrase, mode, isAddModalOpen, isManagerOpen, isStatsOpen, filteredPhrases.length]);

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Top Header */}
      <Header
        mode={mode}
        setMode={setMode}
        dueTodayCount={srsStats.dueToday}
        onOpenAdd={() => {
          setEditingPhrase(null);
          setIsAddModalOpen(true);
        }}
        onOpenImport={() => setIsImportModalOpen(true)}
        onOpenManager={() => setIsManagerOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        installPrompt={!!deferredPrompt}
        onInstall={handleInstallClick}
      />

      {/* Main Flashcard Stage */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 flex flex-col">
        
        {/* Anki-style Tag Filter Bar */}
        <IslandFilterBar
          tags={allTags}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          totalCount={phrases.length}
          onOpenManager={() => setIsManagerOpen(true)}
          dueOnly={dueOnlyFilter}
          onToggleDueOnly={() => setDueOnlyFilter(prev => !prev)}
          dueCount={srsStats.dueToday}
        />

        {/* Center Flashcard */}
        <div className="flex-1 flex flex-col justify-center items-center my-auto py-2">
          {loading ? (
            <div className="text-slate-400 animate-pulse text-sm">Carregando Isla...</div>
          ) : (
            <Flashcard
              phrase={currentPhrase}
              mode={mode}
              currentIndex={currentIndex}
              totalCards={filteredPhrases.length}
              isRevealed={isRevealed}
              onReveal={handleReveal}
              onFeedback={onSRSFeedback}
              onNext={handleNext}
              onPrev={handlePrev}
              onOpenAdd={() => {
                setEditingPhrase(null);
                setIsAddModalOpen(true);
              }}
            />
          )}

          {/* Keyboard Helpers (only when cards exist) */}
          {currentPhrase && (
            <div className="mt-5 flex items-center justify-center flex-wrap gap-4 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300 font-mono">Espaço</kbd>
                <span>{isRevealed ? "Tocar Áudio" : "Revelar Resposta"}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300 font-mono">← / →</kbd>
                <span>Navegar</span>
              </span>
              {isRevealed && (
                <span className="hidden sm:flex items-center gap-1.5 text-slate-400">
                  <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300 font-mono">1-4</kbd>
                  <span>Avaliar Repetição</span>
                </span>
              )}
            </div>
          )}
        </div>

      </main>

      {/* Modals */}
      <AddPhraseModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingPhrase(null);
        }}
        onSave={async (phraseData) => {
          await addOrUpdatePhrase(phraseData);
        }}
        editingPhrase={editingPhrase}
        existingTags={allTags}
      />

      <PhraseManagerModal
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        phrases={phrases}
        onDelete={removePhrase}
        onEdit={(phrase) => {
          setEditingPhrase(phrase);
          setIsManagerOpen(false);
          setIsAddModalOpen(true);
        }}
      />

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        phrases={phrases}
      />

      <ImportJSONModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={importPhrasesBatch}
      />

    </div>
  );
}
