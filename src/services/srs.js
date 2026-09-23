/**
 * Algoritmo SuperMemo SM-2 para Repetição Espaçada
 * 
 * Classificação de Resposta (grade):
 * 0 - Errei / Totalmente esquecido
 * 3 - Difícil / Hesitei bastante
 * 4 - Bom / Lembrei com pequeno esforço
 * 5 - Fácil / Respondi no automático sem hesitar
 */

export function calculateSRS(card, grade) {
  let { repetitions = 0, easeFactor = 2.5, interval = 1 } = card;

  // Garantir limites padrão
  if (!easeFactor || easeFactor < 1.3) easeFactor = 2.5;

  if (grade >= 3) {
    // Resposta correta / lembrada
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    // Erro / Hesitação grave -> reiniciar contagem de repetição
    repetitions = 0;
    interval = 1;
  }

  // Atualizar Fator de Facilidade (EF)
  easeFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  // Calcular próxima data de revisão
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);

  return {
    ...card,
    repetitions,
    easeFactor: Number(easeFactor.toFixed(2)),
    interval,
    dueDate: nextDate.toISOString(),
    lastReviewed: new Date().toISOString(),
    history: [
      ...(card.history || []),
      {
        date: new Date().toISOString(),
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
  const now = new Date();
  let dueCount = 0;
  let masteredCount = 0; // interval >= 21
  let learningCount = 0; // interval < 21

  phrases.forEach(p => {
    if (isCardDue(p)) {
      dueCount++;
    }
    if ((p.interval || 1) >= 21) {
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
