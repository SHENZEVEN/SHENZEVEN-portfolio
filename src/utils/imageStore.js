const DB_NAME = 'portfolio-images';
const DB_VERSION = 2;
const STORE_IMAGES = 'images';
const STORE_PROJECTS = 'projects';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_IMAGES)) {
        db.createObjectStore(STORE_IMAGES);
      }
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveToStore(storeName, key, data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.put(data, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function loadFromStore(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function deleteFromStore(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// 节点图片
export const saveImages = (id, data) => saveToStore(STORE_IMAGES, id, data);
export const loadImages = (id) => loadFromStore(STORE_IMAGES, id);
export const deleteImages = (id) => deleteFromStore(STORE_IMAGES, id);

// 项目媒体
export const saveProjectMedia = (id, data) => saveToStore(STORE_PROJECTS, id, data);
export const loadProjectMedia = (id) => loadFromStore(STORE_PROJECTS, id);
export const deleteProjectMedia = (id) => deleteFromStore(STORE_PROJECTS, id);
