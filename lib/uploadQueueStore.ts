import type { PhotoMetadata } from './photoMetadata';

export type PersistedPlace = {
  label?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
} | null;

export type PersistedItem = {
  id: string;
  name: string;
  type: string;
  size: number;
  lastModified: number;
  blob: Blob;
  meta: PhotoMetadata | null;
  date: string;
  place: PersistedPlace;
  camera: string;
  collection: string;
  coordinates: { latitude?: number; longitude?: number; altitude?: number };
  uploadedId?: string;
  savedAt: number;
};

const DB_NAME = 'photo-upload-queue';
const STORE_NAME = 'items';
let warned = false;
let databasePromise: Promise<IDBDatabase> | null = null;

function warnOnce(error: unknown) {
  if (warned) return;
  warned = true;
  console.warn('Photo upload queue persistence is unavailable; continuing in memory.', error);
}

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('IndexedDB is unavailable'));
  if (databasePromise) return databasePromise;
  const opening = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Unable to open photo upload queue'));
    request.onblocked = () => reject(new Error('Opening photo upload queue was blocked'));
  }).catch((error) => {
    databasePromise = null;
    throw error;
  });
  databasePromise = opening;
  return opening;
}

async function withStore<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const request = operation(transaction.objectStore(STORE_NAME));
    let result: T;
    request.onsuccess = () => { result = request.result; };
    request.onerror = () => reject(request.error || new Error('Photo upload queue operation failed'));
    transaction.oncomplete = () => resolve(result);
    transaction.onabort = () => reject(transaction.error || new Error('Photo upload queue transaction aborted'));
  });
}

export async function saveItem(item: PersistedItem): Promise<boolean> {
  try {
    await withStore('readwrite', (store) => store.put(item));
    return true;
  } catch (error) {
    warnOnce(error);
    return false;
  }
}

export async function deleteItem(id: string): Promise<boolean> {
  try {
    await withStore('readwrite', (store) => store.delete(id));
    return true;
  } catch (error) {
    warnOnce(error);
    return false;
  }
}

export async function listItems(): Promise<PersistedItem[]> {
  try {
    return await withStore('readonly', (store) => store.getAll());
  } catch (error) {
    warnOnce(error);
    return [];
  }
}

export async function clearItems(): Promise<void> {
  try {
    await withStore('readwrite', (store) => store.clear());
  } catch (error) {
    warnOnce(error);
  }
}

export async function estimateUsage(): Promise<number> {
  try {
    const items = await listItems();
    return items.reduce((total, item) => total + item.size, 0);
  } catch (error) {
    warnOnce(error);
    return 0;
  }
}
