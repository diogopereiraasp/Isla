/**
 * Algoritmo de Repetição Espaçada Ultra-Rápido com Teto Máximo de 15 Dias
 * 
 * Classificação:
 * 0 - Errei: Volta em 10 minutos (mesma sessão / hoje)
 * 3 - Difícil: Volta em 4 horas (mesmo dia / hoje)
 * 4 - Bom: Progressão rápida (1d -> 2d -> 3d -> 5d -> multiplicador até máx 15d)
 * 5 - Fácil: Progressão acelerada (3d -> 7d -> multiplicador até máx 15d)
 */

const MAX_INTERVAL_DAYS = 15; // Teto máximo

/**
 * Obtém os dados de repetição espaçada específicos para o modo atual ('learn' ou 'active')
 */
export function getCardSRS(card, mode = 'learn') {
  if (!card) {
    return {
      repetitions: 0,
      easeFactor: 2.0,
      interval: 0,
      dueDate: null,
      lastReviewed: null,
      history: []
    };
  }

  if (mode === 'active') {
    return {
      repetitions: card.activeRepetitions ?? 0,
      easeFactor: card.activeEaseFactor ?? 2.0,
      interval: card.activeInterval ?? 0,
      dueDate: card.activeDueDate ?? null,
      lastReviewed: card.activeLastReviewed ?? null,
      history: card.activeHistory ?? []
    };
  }

  // mode === 'learn' (com fallback retrocompatível para propriedades na raiz)
  return {
    repetitions: card.learnRepetitions ?? card.repetitions ?? 0,
    easeFactor: card.learnEaseFactor ?? card.easeFactor ?? 2.0,
    interval: card.learnInterval ?? card.interval ?? 0,
    dueDate: card.learnDueDate ?? card.dueDate ?? null,
    lastReviewed: card.learnLastReviewed ?? card.lastReviewed ?? null,
    history: card.learnHistory ?? card.history ?? []
  };
}

/**
 * Retorna os intervalos exatos que serão aplicados para cada botão de resposta
 * para este card específico no modo atual.
 */
export function getNextReviewIntervals(card, mode = 'learn') {
  const currentSRS = getCardSRS(card, mode);
  const { repetitions = 0, easeFactor = 2.0, interval = 0 } = currentSRS;

  // 1. Errei
  const againLabel = "10 min";

  // 2. Difícil
  const hardLabel = "4 horas";

  // 3. Bom
  let goodDays = 1;
  if (repetitions === 0) {
    goodDays = 1;
  } else if (repetitions === 1) {
    goodDays = 2;
  } else if (repetitions === 2) {
    goodDays = 3;
  } else if (repetitions === 3) {
    goodDays = 5;
  } else {
    goodDays = Math.min(MAX_INTERVAL_DAYS, Math.round(interval * easeFactor));
  }
  const goodLabel = `${goodDays} ${goodDays === 1 ? 'dia' : 'dias'}`;

  // 4. Fácil
  let easyDays = 3;
  if (repetitions === 0) {
    easyDays = 3;
  } else if (repetitions === 1) {
    easyDays = 7;
  } else {
    easyDays = Math.min(MAX_INTERVAL_DAYS, Math.round(interval * (easeFactor + 0.2)));
  }
  const easyLabel = `${easyDays} ${easyDays === 1 ? 'dia' : 'dias'}`;

  return {
    again: againLabel,
    hard: hardLabel,
    good: goodLabel,
    easy: easyLabel
  };
}

/**
 * Calcula a próxima revisão espaçada de forma totalmente independente por modo ('learn' ou 'active')
 */
export function calculateSRS(card, grade, mode = 'learn') {
  const currentSRS = getCardSRS(card, mode);
  let { repetitions = 0, easeFactor = 2.0, interval = 0 } = currentSRS;

  const now = new Date();
  let nextDate = new Date(now);

  if (grade === 0) {
    // 🔴 Errei: volta em 10 minutos
    repetitions = 0;
    interval = 0;
    nextDate.setMinutes(now.getMinutes() + 10);
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else if (grade === 3) {
    // 🟡 Difícil: volta em 4 horas (mesmo dia)
    repetitions = Math.max(0, repetitions - 1);
    interval = 0.16; // ~4 horas
    nextDate.setHours(now.getHours() + 4);
    easeFactor = Math.max(1.3, easeFactor - 0.15);
  } else if (grade === 4) {
    // 🔵 Bom: 1d -> 2d -> 3d -> 5d -> x(easeFactor) travando no máx 15d
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 2;
    } else if (repetitions === 2) {
      interval = 3;
    } else if (repetitions === 3) {
      interval = 5;
    } else {
      interval = Math.min(MAX_INTERVAL_DAYS, Math.round(interval * easeFactor));
    }
    repetitions += 1;
    nextDate.setDate(now.getDate() + interval);
  } else if (grade === 5) {
    // 🟢 Fácil: 3d -> 7d -> x(easeFactor + 0.2) travando no máx 15d
    if (repetitions === 0) {
      interval = 3;
    } else if (repetitions === 1) {
      interval = 7;
    } else {
      interval = Math.min(MAX_INTERVAL_DAYS, Math.round(interval * (easeFactor + 0.2)));
    }
    repetitions += 1;
    easeFactor = Math.min(2.5, easeFactor + 0.1);
    nextDate.setDate(now.getDate() + interval);
  }

  const updatedSRS = {
    repetitions,
    easeFactor: Number(easeFactor.toFixed(2)),
    interval: Number(interval.toFixed(2)),
    dueDate: nextDate.toISOString(),
    lastReviewed: now.toISOString(),
    history: [
      ...(currentSRS.history || []),
      {
        date: now.toISOString(),
        grade,
        interval: Number(interval.toFixed(2)),
        mode
      }
    ]
  };

  if (mode === 'active') {
    return {
      ...card,
      activeRepetitions: updatedSRS.repetitions,
      activeEaseFactor: updatedSRS.easeFactor,
      activeInterval: updatedSRS.interval,
      activeDueDate: updatedSRS.dueDate,
      activeLastReviewed: updatedSRS.lastReviewed,
      activeHistory: updatedSRS.history
    };
  }

  // mode === 'learn'
  return {
    ...card,
    // Propriedades retrocompatíveis na raiz
    repetitions: updatedSRS.repetitions,
    easeFactor: updatedSRS.easeFactor,
    interval: updatedSRS.interval,
    dueDate: updatedSRS.dueDate,
    lastReviewed: updatedSRS.lastReviewed,
    history: updatedSRS.history,
    // Propriedades explícitas de Aprender
    learnRepetitions: updatedSRS.repetitions,
    learnEaseFactor: updatedSRS.easeFactor,
    learnInterval: updatedSRS.interval,
    learnDueDate: updatedSRS.dueDate,
    learnLastReviewed: updatedSRS.lastReviewed,
    learnHistory: updatedSRS.history
  };
}

/**
 * Verifica se o card é NOVO no modo especificado (nunca avaliado com nota no modo)
 */
export function isCardNew(card, mode = 'learn') {
  if (!card) return false;
  const srs = getCardSRS(card, mode);
  const reps = srs.repetitions || 0;
  const history = srs.history || [];
  return reps === 0 && history.length === 0 && !srs.lastReviewed;
}

/**
 * Verifica se o card está pendente para o modo especificado
 */
export function isCardDue(card, mode = 'learn') {
  const srs = getCardSRS(card, mode);
  if (!srs.dueDate) return true; // Nunca agendado neste modo -> pendente para estudo
  const due = new Date(srs.dueDate);
  const now = new Date();
  return due <= now;
}

/**
 * Calcula estatísticas do deck para o modo atual
 */
export function getSRSStats(phrases = [], mode = 'learn') {
  let newCount = 0;       // Nunca revisados no modo (repetitions === 0 e sem histórico)
  let learningCount = 0;  // Em aprendizado rápido (< 3 dias de intervalo)
  let reviewingCount = 0; // Em consolidação (3 a 14 dias de intervalo)
  let masteredCount = 0;  // Automatizados / Fluentes (intervalo >= 15 dias)
  let dueCount = 0;       // Pendentes para hoje no modo
  let withAudioCount = 0; // Cards com áudio anexado

  let totalReviews = 0;
  let successfulReviews = 0;

  phrases.forEach(p => {
    const srs = getCardSRS(p, mode);
    const reps = srs.repetitions || 0;
    const interval = srs.interval || 0;
    const history = srs.history || [];

    if (p.audioBlob || p.hasAudio) {
      withAudioCount++;
    }

    if (isCardDue(p, mode)) {
      dueCount++;
    }

    if (isCardNew(p, mode)) {
      newCount++;
    } else if (interval >= MAX_INTERVAL_DAYS) {
      masteredCount++;
    } else if (interval >= 3) {
      reviewingCount++;
    } else {
      learningCount++;
    }

    // Calcula taxa de acerto histórico
    history.forEach(h => {
      totalReviews++;
      if (h.grade >= 4) {
        successfulReviews++;
      }
    });
  });

  const total = phrases.length;
  const accuracyRate = totalReviews > 0 ? Math.round((successfulReviews / totalReviews) * 100) : 100;
  const masteredPercentage = total > 0 ? Math.round((masteredCount / total) * 100) : 0;
  const audioPercentage = total > 0 ? Math.round((withAudioCount / total) * 100) : 0;

  return {
    total,
    mode,
    newCards: newCount,
    learning: learningCount,
    reviewing: reviewingCount,
    mastered: masteredCount,
    dueToday: dueCount,
    withAudio: withAudioCount,
    audioPercentage,
    totalReviews,
    accuracyRate,
    masteredPercentage
  };
}

