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

export async function getAllPhrases() {
  const db = await getDB();
  const phrases = await db.getAll(STORE_NAME);
  return phrases || [];
}

export async function savePhrase(phrase) {
  const db = await getDB();
  await db.put(STORE_NAME, phrase);
  return phrase;
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
