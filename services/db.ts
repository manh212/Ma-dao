

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { SaveFile, GalleryImage, MemoryChunk } from '../types';

const DB_NAME = 'GameAI_DB';
const DB_VERSION = 6; // Incremented version to remove id control store
const SAVE_STORE_NAME = 'saves';
const GALLERY_STORE_NAME = 'gallery_images';
const MEMORY_STORE_NAME = 'long_term_memories';
const ASSET_STORE_NAME = 'assets';
const ID_CONTROL_STORE_NAME = 'idControlData'; // Kept for removal logic


let db: IDBDatabase;

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('Error opening IndexedDB:', request.error);
            reject('Error opening IndexedDB');
        };

        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const tempDb = (event.target as IDBOpenDBRequest).result;
            if (event.oldVersion < 2) {
                if (!tempDb.objectStoreNames.contains(SAVE_STORE_NAME)) {
                    const saveStore = tempDb.createObjectStore(SAVE_STORE_NAME, { keyPath: 'id' });
                    saveStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                if (!tempDb.objectStoreNames.contains(GALLERY_STORE_NAME)) {
                    const galleryStore = tempDb.createObjectStore(GALLERY_STORE_NAME, { keyPath: 'id' });
                    galleryStore.createIndex('name', 'name', { unique: false });
                }
            }
            if (event.oldVersion < 3) {
                 if (!tempDb.objectStoreNames.contains(MEMORY_STORE_NAME)) {
                    const memoryStore = tempDb.createObjectStore(MEMORY_STORE_NAME, { keyPath: 'id' });
                    memoryStore.createIndex('saveId', 'saveId', { unique: false });
                    memoryStore.createIndex('keywords', 'keywords', { unique: false, multiEntry: true });
                }
            }
            if (event.oldVersion < 4) {
                 if (!tempDb.objectStoreNames.contains(ASSET_STORE_NAME)) {
                    tempDb.createObjectStore(ASSET_STORE_NAME, { keyPath: 'id' });
                }
            }
             if (event.oldVersion < 5) {
                 if (!tempDb.objectStoreNames.contains(ID_CONTROL_STORE_NAME)) {
                    const idControlStore = tempDb.createObjectStore(ID_CONTROL_STORE_NAME, { keyPath: 'id' });
                    idControlStore.createIndex('saveId', 'saveId', { unique: false });
                }
            }
            if (event.oldVersion < 6) {
                if (tempDb.objectStoreNames.contains(ID_CONTROL_STORE_NAME)) {
                    tempDb.deleteObjectStore(ID_CONTROL_STORE_NAME);
                }
            }
        };
    });
};

export const addOrUpdateSave = async (saveFile: SaveFile): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([SAVE_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(SAVE_STORE_NAME);
        const request = store.put(saveFile);

        request.onsuccess = () => resolve();
        request.onerror = () => {
            console.error('Error adding/updating save:', request.error);
            reject('Error adding/updating save');
        };
    });
};

export const getSaveById = async (saveId: string): Promise<SaveFile | undefined> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([SAVE_STORE_NAME], 'readonly');
        const store = transaction.objectStore(SAVE_STORE_NAME);
        const request = store.get(saveId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
            console.error('Error getting save by id:', request.error);
            reject('Error getting save by id');
        };
    });
};

export const getAllSaves = async (): Promise<SaveFile[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([SAVE_STORE_NAME], 'readonly');
        const store = transaction.objectStore(SAVE_STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            const sortedSaves = request.result.sort((a, b) => 
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
            resolve(sortedSaves);
        };
        request.onerror = () => {
            console.error('Error getting all saves:', request.error);
            reject('Error getting all saves');
        };
    });
};

export const deleteSave = async (saveId: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([SAVE_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(SAVE_STORE_NAME);
        const request = store.delete(saveId);

        request.onsuccess = () => resolve();
        request.onerror = () => {
            console.error('Error deleting save:', request.error);
            reject('Error deleting save');
        };
    });
};

// --- Gallery Functions ---

export const addOrUpdateImage = async (image: GalleryImage): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([GALLERY_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(GALLERY_STORE_NAME);
        const request = store.put(image);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(`Error adding/updating image: ${request.error}`);
    });
};

export const getAllImages = async (): Promise<GalleryImage[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([GALLERY_STORE_NAME], 'readonly');
        const store = transaction.objectStore(GALLERY_STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(`Error getting all images: ${request.error}`);
    });
};

export const getImageById = async (id: string): Promise<GalleryImage | undefined> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([GALLERY_STORE_NAME], 'readonly');
        const store = transaction.objectStore(GALLERY_STORE_NAME);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(`Error getting image by id: ${request.error}`);
    });
};

export const deleteImage = async (id: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([GALLERY_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(GALLERY_STORE_NAME);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(`Error deleting image: ${request.error}`);
    });
};

export const updateImage = async (image: GalleryImage): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([GALLERY_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(GALLERY_STORE_NAME);
        const request = store.put(image);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(`Error updating image: ${request.error}`);
    });
};

// --- Long-Term Memory Functions ---

export const addMemoryChunk = async (memoryChunk: MemoryChunk): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([MEMORY_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(MEMORY_STORE_NAME);
        const request = store.put(memoryChunk);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(`Error adding memory chunk: ${request.error}`);
    });
};

export const getMemoryChunksByKeywords = async (saveId: string, keywords: string[]): Promise<MemoryChunk[]> => {
    const db = await openDB();
    return new Promise(async (resolve, reject) => {
        const transaction = db.transaction([MEMORY_STORE_NAME], 'readonly');
        const store = transaction.objectStore(MEMORY_STORE_NAME);
        const index = store.index('keywords');
        const results: Map<string, MemoryChunk> = new Map();

        if (keywords.length === 0) {
            resolve([]);
            return;
        }

        try {
            const promises = keywords.map(keyword => {
                return new Promise<MemoryChunk[]>((res, rej) => {
                    const request = index.getAll(IDBKeyRange.only(keyword.toLowerCase()));
                    request.onsuccess = () => res(request.result);
                    request.onerror = () => rej(request.error);
                });
            });

            const chunkArrays = await Promise.all(promises);
            
            chunkArrays.forEach(chunkArray => {
                chunkArray.forEach(chunk => {
                    if (chunk.saveId === saveId) {
                        results.set(chunk.id, chunk);
                    }
                });
            });
            
            resolve(Array.from(results.values()));

        } catch (error) {
             reject(`Error fetching memory chunks: ${error}`);
        }
    });
};


export const deleteMemoryChunksForSave = async (saveId: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([MEMORY_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(MEMORY_STORE_NAME);
        const index = store.index('saveId');
        const request = index.openCursor(IDBKeyRange.only(saveId));

        request.onsuccess = () => {
            const cursor = request.result;
            if (cursor) {
                cursor.delete();
                cursor.continue();
            } else {
                resolve();
            }
        };
        request.onerror = () => reject(`Error deleting memories for save ${saveId}: ${request.error}`);
    });
};

export const countMemoryChunksForSave = async (saveId: string): Promise<number> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([MEMORY_STORE_NAME], 'readonly');
        const store = transaction.objectStore(MEMORY_STORE_NAME);
        const index = store.index('saveId');
        const request = index.count(IDBKeyRange.only(saveId));

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
            console.error(`Error counting memories for save ${saveId}:`, request.error);
            reject(`Error counting memories for save ${saveId}`);
        };
    });
};

// --- Asset Functions ---

export const getAsset = async (id: string): Promise<{id: string, value: any} | undefined> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([ASSET_STORE_NAME], 'readonly');
        const store = transaction.objectStore(ASSET_STORE_NAME);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(`Error getting asset by id: ${request.error}`);
    });
};

export const setAsset = async (asset: { id: string; value: any }): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([ASSET_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(ASSET_STORE_NAME);
        const request = store.put(asset);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(`Error setting asset: ${request.error}`);
    });
};

export const deleteAsset = async (id: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([ASSET_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(ASSET_STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => {
            console.error('Error deleting asset:', request.error);
            reject('Error deleting asset');
        };
    });
};