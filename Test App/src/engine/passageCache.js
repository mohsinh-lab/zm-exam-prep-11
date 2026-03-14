// Passage Cache  LRU eviction with 50MB limit
// Caches passages and questions for offline access

const STORAGE_KEY = 'rc_passage_cache';
const MAX_SIZE = 52428800; // 50MB in bytes

export class PassageCache {
  constructor() {
    this.STORAGE_KEY = STORAGE_KEY;
    this.MAX_SIZE = MAX_SIZE;
  }

  _load() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : { entries: {}, order: [] };
    } catch {
      return { entries: {}, order: [] };
    }
  }

  _save(cache) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cache));
    } catch (e) {
      console.warn('PassageCache: could not save:', e);
    }
  }

  async get(passageId) {
    const cache = this._load();
    const entry = cache.entries[passageId];
    if (!entry) return null;
    // Update LRU order
    cache.order = cache.order.filter(id => id !== passageId);
    cache.order.push(passageId);
    entry.lastAccessed = Date.now();
    this._save(cache);
    return entry.data;
  }

  async set(passageId, passage, questions = []) {
    const cache = this._load();
    const data = { passage, questions };
    const size = JSON.stringify(data).length;

    // Evict until we have room
    while (this._calcSize(cache) + size > this.MAX_SIZE && cache.order.length > 0) {
      await this.evictLRU(cache);
    }

    cache.entries[passageId] = {
      data,
      size,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
      language: passage.language || 'en'
    };
    cache.order = cache.order.filter(id => id !== passageId);
    cache.order.push(passageId);
    this._save(cache);
  }

  async evictLRU(cache) {
    if (!cache) cache = this._load();
    if (cache.order.length === 0) return;
    const lruId = cache.order.shift();
    delete cache.entries[lruId];
    this._save(cache);
  }

  async clear() {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  async getSize() {
    const cache = this._load();
    return this._calcSize(cache);
  }

  async isAvailable(passageId) {
    const cache = this._load();
    return !!cache.entries[passageId];
  }

  _calcSize(cache) {
    return Object.values(cache.entries).reduce((sum, e) => sum + (e.size || 0), 0);
  }
}

export default new PassageCache();
