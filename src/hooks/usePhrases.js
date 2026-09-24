import { useState, useEffect } from 'react';
import { getAllPhrases, savePhrase, deletePhrase, importManyPhrases } from '../services/db';
import { calculateSRS, isCardDue } from '../services/srs';

export function usePhrases(mode = 'learn') {
  const [phrases, setPhrases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('all');
  const [dueOnlyFilter, setDueOnlyFilter] = useState(true); // Abre por padrão nas revisões de Hoje

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
    const cleanSoundTag = (str) => {
      if (!str) return '';
      // Remove tags estilo Anki: [sound:arquivo.mp3] ou [sound:33 was daring.mp3]
      return String(str).replace(/\[sound:[^\]]+\]/gi, '').trim();
    };

    const normalizeText = (str) => {
      return cleanSoundTag(str)
        .toLowerCase()
        .replace(/[.,/#!$%^&*;:{}=\-_`~()?'"]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    // Criar conjunto de chaves únicas dos cards já existentes no projeto
    const existingKeys = new Set(
      phrases.map(p => `${normalizeText(p.target)}|||${normalizeText(p.native)}`)
    );

    // Conjunto para evitar duplicatas dentro do próprio lote que está sendo importado
    const batchKeys = new Set();

    const formattedList = [];

    for (let idx = 0; idx < cardsArray.length; idx++) {
      const card = cardsArray[idx];
      const rawTarget = card.target || card.frente || card.front || '';
      const rawNative = card.native || card.verso || card.back || '';

      const target = cleanSoundTag(rawTarget);
      const native = cleanSoundTag(rawNative);

      if (!target || !native) continue;

      const normTarget = normalizeText(target);
      const normNative = normalizeText(native);
      const cardKey = `${normTarget}|||${normNative}`;

      // Se já existe no projeto ou já foi adicionado neste lote, ignora para não duplicar
      if (existingKeys.has(cardKey) || batchKeys.has(cardKey)) {
        continue;
      }
      batchKeys.add(cardKey);

      const tags = Array.isArray(card.tags)
        ? card.tags.map(t => String(t).trim().toLowerCase().replace(/\s+/g, '_')).filter(Boolean)
        : (card.tag ? [String(card.tag).trim().toLowerCase().replace(/\s+/g, '_')] : []);

      // Check audio filename match if audioFilesMap was provided
      let audioKey = (card.audio || card.audioName || card.sound || '').toLowerCase().trim();
      const soundMatch = String(rawTarget).match(/\[sound:([^\]]+)\]/i);
      if (soundMatch && !audioKey) {
        audioKey = soundMatch[1].toLowerCase().trim();
      }

      let matchedAudioBlob = card.audioBlob || null;
      if (audioKey && audioFilesMap && audioFilesMap[audioKey]) {
        matchedAudioBlob = audioFilesMap[audioKey];
      }

      formattedList.push({
        id: card.id || (now + idx),
        target,
        native,
        tags,
        hasAudio: !!matchedAudioBlob,
        audioBlob: matchedAudioBlob,
        // Root / Aprender SRS
        interval: card.interval || 1,
        repetitions: card.repetitions || 0,
        easeFactor: card.easeFactor || 2.5,
        dueDate: card.dueDate || new Date().toISOString(),
        lastReviewed: card.lastReviewed || null,
        history: card.history || [],
        // Learn SRS
        learnInterval: card.learnInterval ?? card.interval ?? 1,
        learnRepetitions: card.learnRepetitions ?? card.repetitions ?? 0,
        learnEaseFactor: card.learnEaseFactor ?? card.easeFactor ?? 2.5,
        learnDueDate: card.learnDueDate ?? card.dueDate ?? new Date().toISOString(),
        learnLastReviewed: card.learnLastReviewed ?? card.lastReviewed ?? null,
        learnHistory: card.learnHistory ?? card.history ?? [],
        // Active SRS
        activeInterval: card.activeInterval ?? 0,
        activeRepetitions: card.activeRepetitions ?? 0,
        activeEaseFactor: card.activeEaseFactor ?? 2.0,
        activeDueDate: card.activeDueDate ?? null,
        activeLastReviewed: card.activeLastReviewed ?? null,
        activeHistory: card.activeHistory ?? []
      });
    }

    if (formattedList.length > 0) {
      await importManyPhrases(formattedList);
      await loadPhrases();
    }
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
      // Root / Learn SRS
      interval: phraseData.interval || 1,
      repetitions: phraseData.repetitions || 0,
      easeFactor: phraseData.easeFactor || 2.5,
      dueDate: phraseData.dueDate || new Date().toISOString(),
      lastReviewed: phraseData.lastReviewed || null,
      history: phraseData.history || [],
      // Learn mode SRS
      learnInterval: phraseData.learnInterval ?? phraseData.interval ?? 1,
      learnRepetitions: phraseData.learnRepetitions ?? phraseData.repetitions ?? 0,
      learnEaseFactor: phraseData.learnEaseFactor ?? phraseData.easeFactor ?? 2.5,
      learnDueDate: phraseData.learnDueDate ?? phraseData.dueDate ?? new Date().toISOString(),
      learnLastReviewed: phraseData.learnLastReviewed ?? phraseData.lastReviewed ?? null,
      learnHistory: phraseData.learnHistory ?? phraseData.history ?? [],
      // Active mode SRS
      activeInterval: phraseData.activeInterval ?? 0,
      activeRepetitions: phraseData.activeRepetitions ?? 0,
      activeEaseFactor: phraseData.activeEaseFactor ?? 2.0,
      activeDueDate: phraseData.activeDueDate ?? null,
      activeLastReviewed: phraseData.activeLastReviewed ?? null,
      activeHistory: phraseData.activeHistory ?? []
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

  const handleSRSFeedback = async (card, grade, feedbackMode = mode) => {
    const updatedCard = calculateSRS(card, grade, feedbackMode);
    await savePhrase(updatedCard);
    setPhrases(prev => prev.map(p => p.id === updatedCard.id ? updatedCard : p));
    return updatedCard;
  };

  // Filtragem por Tags e Modo Ativo
  const filteredPhrases = phrases.filter(p => {
    const cardTags = p.tags || [];
    const matchesTag = selectedTag === 'all' || cardTags.includes(selectedTag);
    const matchesDue = dueOnlyFilter ? isCardDue(p, mode) : true;
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

