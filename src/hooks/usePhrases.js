import { useState, useEffect } from 'react';
import { getAllPhrases, savePhrase, deletePhrase } from '../services/db';
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
    refreshPhrases: loadPhrases
  };
}
