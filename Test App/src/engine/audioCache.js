/**
 * AudioCache - Caches generated audio for offline use
 * 
 * Responsibility: Store and retrieve audio blobs using IndexedDB,
 * implement LRU eviction, and manage cache size limits.
 */

export class AudioCache {
  /**
   * Initialize AudioCache
   */
  constructor() {
    this.db = null;
    this.STORE_NAME = 'voiceTutorCache';
    this.DB_NAME = 'aceprep_voice_tutor';
    this.DB_VERSION = 1;
    this.MAX_CACHE_SIZE = 52428800; // 50MB in bytes
  }

  /**
   * Initialize IndexedDB connection and create object store
   * @returns {Promise<void>} Promise that resolves when initialization completes
   */
  async initialize() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        reject(new Error(`Failed to open IndexedDB: ${request.error}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'passageId' });
          // Create index for timestamp to support LRU eviction
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Retrieve cached audio blob for a passage
   * @param {string} passageId - Unique identifier for the passage
   * @returns {Promise<Blob|null>} Audio blob or null if not cached
   */
  async get(passageId) {
    if (!this.db) {
      throw new Error('AudioCache not initialized. Call initialize() first.');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(passageId);

      request.onerror = () => {
        reject(new Error(`Failed to retrieve audio: ${request.error}`));
      };

      request.onsuccess = () => {
        const entry = request.result;
        if (entry) {
          // Update timestamp for LRU tracking
          this._updateTimestamp(passageId).catch(err => {
            console.warn('Failed to update timestamp:', err);
          });
          resolve(entry.audioBlob);
        } else {
          resolve(null);
        }
      };
    });
  }

  /**
   * Store audio blob with metadata
   * @param {string} passageId - Unique identifier for the passage
   * @param {Blob} audioBlob - Audio blob to cache
   * @param {Object} metadata - Additional metadata
   * @param {string} metadata.language - Language code
   * @param {number} metadata.rate - Playback rate
   * @returns {Promise<void>} Promise that resolves when storage completes
   */
  async set(passageId, audioBlob, metadata = {}) {
    if (!this.db) {
      throw new Error('AudioCache not initialized. Call initialize() first.');
    }

    // Check cache size and evict if necessary
    const currentSize = await this.getSize();
    const blobSize = audioBlob.size;
    
    if (currentSize + blobSize > this.MAX_CACHE_SIZE) {
      await this._evictLRU();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      
      const entry = {
        passageId,
        audioBlob,
        language: metadata.language || 'en',
        rate: metadata.rate || 1,
        timestamp: Date.now(),
        size: blobSize
      };

      const request = store.put(entry);

      request.onerror = () => {
        reject(new Error(`Failed to store audio: ${request.error}`));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  /**
   * Check if audio is cached for a passage
   * @param {string} passageId - Unique identifier for the passage
   * @returns {Promise<boolean>} True if audio is cached
   */
  async isAvailable(passageId) {
    if (!this.db) {
      throw new Error('AudioCache not initialized. Call initialize() first.');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(passageId);

      request.onerror = () => {
        reject(new Error(`Failed to check cache availability: ${request.error}`));
      };

      request.onsuccess = () => {
        resolve(!!request.result);
      };
    });
  }

  /**
   * Get total cache size in bytes
   * @returns {Promise<number>} Total cache size
   */
  async getSize() {
    if (!this.db) {
      throw new Error('AudioCache not initialized. Call initialize() first.');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();

      request.onerror = () => {
        reject(new Error(`Failed to calculate cache size: ${request.error}`));
      };

      request.onsuccess = () => {
        const entries = request.result;
        const totalSize = entries.reduce((sum, entry) => sum + (entry.size || 0), 0);
        resolve(totalSize);
      };
    });
  }

  /**
   * Clear all cached audio
   * @returns {Promise<void>} Promise that resolves when cache is cleared
   */
  async clear() {
    if (!this.db) {
      throw new Error('AudioCache not initialized. Call initialize() first.');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.clear();

      request.onerror = () => {
        reject(new Error(`Failed to clear cache: ${request.error}`));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  /**
   * Update timestamp for LRU tracking
   * @param {string} passageId - Unique identifier for the passage
   * @returns {Promise<void>} Promise that resolves when timestamp is updated
   * @private
   */
  async _updateTimestamp(passageId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const getRequest = store.get(passageId);

      getRequest.onerror = () => {
        reject(new Error(`Failed to get entry for timestamp update: ${getRequest.error}`));
      };

      getRequest.onsuccess = () => {
        const entry = getRequest.result;
        if (entry) {
          entry.timestamp = Date.now();
          const putRequest = store.put(entry);

          putRequest.onerror = () => {
            reject(new Error(`Failed to update timestamp: ${putRequest.error}`));
          };

          putRequest.onsuccess = () => {
            resolve();
          };
        } else {
          resolve();
        }
      };
    });
  }

  /**
   * Perform LRU eviction when cache exceeds maximum size
   * Efficiently removes oldest entries until cache is below threshold
   * @returns {Promise<void>} Promise that resolves when eviction completes
   * @private
   */
  async _evictLRU() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index('timestamp');
      const request = index.getAll();

      request.onerror = () => {
        reject(new Error(`Failed to get entries for eviction: ${request.error}`));
      };

      request.onsuccess = () => {
        const entries = request.result;
        
        // Sort by timestamp (oldest first) for LRU eviction
        entries.sort((a, b) => a.timestamp - b.timestamp);

        let currentSize = entries.reduce((sum, entry) => sum + (entry.size || 0), 0);
        const targetSize = this.MAX_CACHE_SIZE * 0.8; // Target 80% of max to avoid thrashing
        let evicted = 0;

        // Evict entries until cache is below target size
        for (const entry of entries) {
          if (currentSize <= targetSize) {
            break;
          }

          // Delete entry synchronously within transaction
          const deleteRequest = store.delete(entry.passageId);
          
          deleteRequest.onerror = () => {
            console.warn(`Failed to delete entry during eviction: ${deleteRequest.error}`);
          };

          deleteRequest.onsuccess = () => {
            currentSize -= entry.size || 0;
            evicted++;
          };
        }

        resolve();
      };
    });
  }

  /**
   * Close IndexedDB connection
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
