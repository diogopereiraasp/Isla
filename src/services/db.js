import { openDB } from 'idb';

const DB_NAME = 'IslaApp_DB';
const DB_VERSION = 2;
const STORE_NAME = 'phrases';

export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    }
  });
}

/**
 * Converte qualquer formato de áudio (Blob, ArrayBuffer, string) em ArrayBuffer puro
 * para garantir armazenamento 100% confiável no IndexedDB do iOS/WebKit.
 */
async function normalizeAudioForStorage(phrase) {
  if (!phrase) return phrase;
  const copy = { ...phrase };
  
  if (copy.audioBlob) {
    if (copy.audioBlob instanceof Blob) {
      copy.audioBlob = await copy.audioBlob.arrayBuffer();
      copy.audioMime = copy.audioBlob.type || 'audio/mpeg';
    } else if (typeof copy.audioBlob === 'string' && copy.audioBlob.startsWith('data:')) {
      try {
        const parts = copy.audioBlob.split(',');
        const binary = atob(parts[1]);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        copy.audioBlob = bytes.buffer;
        copy.audioMime = 'audio/mpeg';
      } catch (_) {}
    }
  }
  
  return copy;
}

export async function getAllPhrases() {
  const db = await getDB();
  const phrases = await db.getAll(STORE_NAME);
  return phrases || [];
}

export async function savePhrase(phrase) {
  const db = await getDB();
  const normalized = await normalizeAudioForStorage(phrase);
  await db.put(STORE_NAME, normalized);
  return phrase;
}

export async function importManyPhrases(newPhrases = []) {
  // 1. Normalizar todos os áudios ANTES de abrir a transação
  // Isso evita que a transação do IndexedDB expire/finalize (auto-commit) devido a awaits assíncronos no loop
  const normalizedPhrases = await Promise.all(
    newPhrases.map(phrase => normalizeAudioForStorage(phrase))
  );

  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  
  for (const item of normalizedPhrases) {
    tx.store.put(item);
  }
  
  await tx.done;
  return newPhrases;
}

export async function deletePhrase(id) {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
  return id;
}

export async function clearAllPhrases() {
  const db = await getDB();
  await db.clear(STORE_NAME);
  return [];
}
