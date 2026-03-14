/**
 * DataCache — localStorage-backed LRU cache for dashboard data
 */

const CACHE_KEY = 'aad_cache';
const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

function getCacheStore() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveCacheStore(store) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(store));
  } catch {
    // Storage full — evict and retry
    evictLRU(store);
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(store)); } catch { /* ignore */ }
  }
}

function evictLRU(store) {
  const entries = Object.entries(store).sort((a, b) => (a[1].accessedAt || 0) - (b[1].accessedAt || 0));
  if (entries.length > 0) delete store[entries[0][0]];
}

function estimateSize(store) {
  return new Blob([JSON.stringify(store)]).size;
}

export const dataCache = {
  set(key, data) {
    const store = getCacheStore();
    store[key] = { data, savedAt: Date.now(), accessedAt: Date.now() };
    // Evict if over size limit
    while (estimateSize(store) > MAX_SIZE_BYTES && Object.keys(store).length > 1) {
      evictLRU(store);
    }
    saveCacheStore(store);
  },

  get(key) {
    const store = getCacheStore();
    const entry = store[key];
    if (!entry) return null;
    // Update access time
    entry.accessedAt = Date.now();
    saveCacheStore(store);
    return entry.data;
  },

  getWithMeta(key) {
    const store = getCacheStore();
    return store[key] || null;
  },

  clear(key) {
    const store = getCacheStore();
    delete store[key];
    saveCacheStore(store);
  },

  clearAll() {
    localStorage.removeItem(CACHE_KEY);
  },
};
