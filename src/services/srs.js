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

export function calculateSRS(card, grade) {
  let { repetitions = 0, easeFactor = 2.0, interval = 0 } = card;

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

  return {
    ...card,
    repetitions,
    easeFactor: Number(easeFactor.toFixed(2)),
    interval: Number(interval.toFixed(2)),
    dueDate: nextDate.toISOString(),
    lastReviewed: now.toISOString(),
    history: [
      ...(card.history || []),
      {
        date: now.toISOString(),
        grade,
        interval
      }
    ]
  };
}

export function isCardDue(card) {
  if (!card.dueDate) return true;
  const due = new Date(card.dueDate);
  const now = new Date();
  return due <= now;
}

export function getSRSStats(phrases = []) {
  let dueCount = 0;
  let masteredCount = 0; // interval >= 15 (teto atingido)
  let learningCount = 0;

  phrases.forEach(p => {
    if (isCardDue(p)) {
      dueCount++;
    }
    if ((p.interval || 0) >= MAX_INTERVAL_DAYS) {
      masteredCount++;
    } else {
      learningCount++;
    }
  });

  return {
    total: phrases.length,
    dueToday: dueCount,
    mastered: masteredCount,
    learning: learningCount
  };
}
