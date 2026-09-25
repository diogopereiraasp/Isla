import { openDB } from 'idb';
import { blobToBase64 } from './exportService';

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
 * Converte qualquer formato de áudio em string Base64 Data-URL.
 * No iOS PWA (Modo Standalone da tela de início), salvar Blobs ou ArrayBuffers no IndexedDB
 * pode perder a referência de memória ao reiniciar o app. String Data-URL é 100% imutável e à prova de falhas.
 */
async function normalizeAudioForStorage(phrase) {
  if (!phrase) return phrase;
  const copy = { ...phrase };
  
  if (copy.audioBlob) {
    if (copy.audioBlob instanceof Blob) {
      copy.audioBlob = await blobToBase64(copy.audioBlob);
    } else if (copy.audioBlob instanceof ArrayBuffer || ArrayBuffer.isView(copy.audioBlob)) {
      const blob = new Blob([copy.audioBlob], { type: copy.audioMime || 'audio/mpeg' });
      copy.audioBlob = await blobToBase64(blob);
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
