import { useState, useEffect } from 'react';
import { getAllPhrases, savePhrase, deletePhrase, importManyPhrases } from '../services/db';
import { calculateSRS, isCardDue } from '../services/srs';

export function usePhrases() {
  const [phrases, setPhrases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('all');
  const [dueOnlyFilter, setDueOnlyFilter] = useState(false);

  useEffect(() => {
    loadPhrases();
  }, []);

  const loadPhrases = async () => {
    try {
      setLoading(true);
      const data = await getAllPhrases();
      // Ensure backwards compatibility with tags / island
      const normalized = data.map(item => ({
        ...item,
        tags: Array.isArray(item.tags) 
          ? item.tags 
          : (item.island ? [item.island] : [])
      }));
      setPhrases(normalized);
    } catch (err) {
      console.error("Erro ao carregar frases:", err);
    } finally {
      setLoading(false);
    }
  };

  const importPhrasesBatch = async (cardsArray = [], audioFilesMap = {}) => {
    const now = Date.now();
    const formattedList = cardsArray.map((card, idx) => {
      const tags = Array.isArray(card.tags)
        ? card.tags.map(t => String(t).trim().toLowerCase().replace(/\s+/g, '_')).filter(Boolean)
        : (card.tag ? [String(card.tag).trim().toLowerCase().replace(/\s+/g, '_')] : []);

      // Check audio filename match
      const audioKey = (card.audio || card.audioName || card.sound || '').toLowerCase().trim();
      let matchedAudioBlob = card.audioBlob || null;
      if (audioKey && audioFilesMap[audioKey]) {
        matchedAudioBlob = audioFilesMap[audioKey];
      }

      return {
        id: card.id || (now + idx),
        target: card.target || card.frente || card.front || '',
        native: card.native || card.verso || card.back || '',
        tags,
        hasAudio: !!matchedAudioBlob || !!card.hasAudio,
        audioBlob: matchedAudioBlob,
        interval: card.interval || 1,
        repetitions: card.repetitions || 0,
        easeFactor: card.easeFactor || 2.5,
        dueDate: card.dueDate || new Date().toISOString(),
        lastReviewed: card.lastReviewed || null,
        history: card.history || []
      };
    }).filter(c => c.target && c.native);

    await importManyPhrases(formattedList);
    await loadPhrases();
    return formattedList.length;
  };

  const addOrUpdatePhrase = async (phraseData) => {
    const isNew = !phraseData.id;
    const tags = Array.isArray(phraseData.tags) 
      ? phraseData.tags.map(t => t.trim().toLowerCase().replace(/\s+/g, '_')).filter(Boolean)
      : [];

    const phrase = {
      id: phraseData.id || Date.now(),
      tags,
      native: phraseData.native,
      target: phraseData.target,
      hasAudio: !!phraseData.audioBlob,
      audioBlob: phraseData.audioBlob || null,
      interval: phraseData.interval || 1,
      repetitions: phraseData.repetitions || 0,
      easeFactor: phraseData.easeFactor || 2.5,
      dueDate: phraseData.dueDate || new Date().toISOString(),
      lastReviewed: phraseData.lastReviewed || null,
      history: phraseData.history || []
    };

    await savePhrase(phrase);
    setPhrases(prev => {
      if (isNew) {
        return [...prev, phrase];
      }
      return prev.map(p => p.id === phrase.id ? phrase : p);
    });
    return phrase;
  };

  const removePhrase = async (id) => {
    await deletePhrase(id);
    setPhrases(prev => prev.filter(p => p.id !== id));
  };

  const handleSRSFeedback = async (card, grade) => {
    const updatedCard = calculateSRS(card, grade);
    await savePhrase(updatedCard);
    setPhrases(prev => prev.map(p => p.id === updatedCard.id ? updatedCard : p));
    return updatedCard;
  };

  // Filtragem por Tags
  const filteredPhrases = phrases.filter(p => {
    const cardTags = p.tags || [];
    const matchesTag = selectedTag === 'all' || cardTags.includes(selectedTag);
    const matchesDue = dueOnlyFilter ? isCardDue(p) : true;
    return matchesTag && matchesDue;
  });

  // Lista única de tags existentes
  const allTags = Array.from(
    new Set(phrases.flatMap(p => p.tags || []))
  ).filter(Boolean).sort();

  return {
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
    importPhrasesBatch,
    refreshPhrases: loadPhrases
  };
}
