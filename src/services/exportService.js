/**
 * Utilitários para Exportação e Importação de Backup Completo do Isla (Cards + Áudios)
 */

/**
 * Converte um Blob em Base64 Data URL para permitir serialização em JSON
 */
export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    if (!blob) return resolve(null);
    if (typeof blob === 'string') return resolve(blob); // já é data URL ou url
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Converte um Base64 Data URL de volta para Blob
 */
export function base64ToBlob(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return null;
  if (!dataUrl.startsWith('data:')) return null;

  try {
    const parts = dataUrl.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'audio/mpeg';
    const binary = atob(parts[1]);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes.buffer], { type: mime });
  } catch (err) {
    console.warn("Erro ao converter base64 para Blob:", err);
    return null;
  }
}

/**
 * Exporta todas as frases e seus áudios anexados em um arquivo .json completo
 */
export async function exportPhrasesBackup(phrases = [], onProgress) {
  if (!phrases || phrases.length === 0) {
    throw new Error("Nenhum card para exportar.");
  }

  const exportList = [];
  const total = phrases.length;

  for (let i = 0; i < total; i++) {
    const p = phrases[i];
    if (onProgress) {
      onProgress(i + 1, total, p.target);
    }

    let audioBase64 = null;
    if (p.audioBlob) {
      try {
        audioBase64 = await blobToBase64(p.audioBlob);
      } catch (e) {
        console.warn(`Erro ao converter áudio do card ${p.id}:`, e);
      }
    }

    exportList.push({
      id: p.id,
      target: p.target,
      native: p.native,
      tags: p.tags || [],
      audioBase64: audioBase64,
      // Root / Learn SRS
      interval: p.interval || 1,
      repetitions: p.repetitions || 0,
      easeFactor: p.easeFactor || 2.5,
      dueDate: p.dueDate || new Date().toISOString(),
      lastReviewed: p.lastReviewed || null,
      history: p.history || [],
      // Learn mode SRS
      learnInterval: p.learnInterval ?? p.interval ?? 1,
      learnRepetitions: p.learnRepetitions ?? p.repetitions ?? 0,
      learnEaseFactor: p.learnEaseFactor ?? p.easeFactor ?? 2.5,
      learnDueDate: p.learnDueDate ?? p.dueDate ?? new Date().toISOString(),
      learnLastReviewed: p.learnLastReviewed ?? p.lastReviewed ?? null,
      learnHistory: p.learnHistory ?? p.history ?? [],
      // Active mode SRS
      activeInterval: p.activeInterval ?? 0,
      activeRepetitions: p.activeRepetitions ?? 0,
      activeEaseFactor: p.activeEaseFactor ?? 2.0,
      activeDueDate: p.activeDueDate ?? null,
      activeLastReviewed: p.activeLastReviewed ?? null,
      activeHistory: p.activeHistory ?? []
    });
  }

  const backupData = {
    version: '1.0',
    app: 'Isla',
    exportedAt: new Date().toISOString(),
    totalCards: exportList.length,
    cards: exportList
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const dateStr = new Date().toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `isla_backup_${dateStr}_${exportList.length}_cards.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return exportList.length;
}

/**
 * Prepara uma lista de cards vinda de um backup (com audioBase64) convertendo de volta para Blob
 */
export async function parseBackupCards(cardsArray = [], onProgress) {
  const result = [];
  const total = cardsArray.length;

  for (let i = 0; i < total; i++) {
    const card = cardsArray[i];
    if (onProgress) {
      onProgress(i + 1, total);
    }

    let audioBlob = card.audioBlob || null;
    if (!audioBlob && card.audioBase64) {
      audioBlob = base64ToBlob(card.audioBase64);
    }

    result.push({
      ...card,
      audioBlob
    });
  }

  return result;
}
