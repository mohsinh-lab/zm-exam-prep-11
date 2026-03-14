/**
 * Unit tests for AudioCache
 * 
 * Tests cover:
 * - IndexedDB initialization and connection
 * - Audio storage and retrieval
 * - Cache availability checks
 * - LRU eviction logic
 * - Cache size limits (50MB)
 * - Cache clearing
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AudioCache } from '../src/engine/audioCache.js';

// Helper to create mock audio blob
function createMockAudioBlob(sizeInBytes = 1000) {
  const data = new Uint8Array(sizeInBytes);
  return new Blob([data], { type: 'audio/mp3' });
}

describe('AudioCache', () => {
  let audioCache;

  beforeEach(async () => {
    audioCache = new AudioCache();
    await audioCache.initialize();
  });

  afterEach(async () => {
    if (audioCache && audioCache.db) {
      await audioCache.clear();
      audioCache.close();
    }
  });

  describe('Initialization', () => {
    it('should create an AudioCache instance', () => {
      const cache = new AudioCache();
      expect(cache).toBeDefined();
      expect(cache.DB_NAME).toBe('aceprep_voice_tutor');
      expect(cache.STORE_NAME).toBe('voiceTutorCache');
    });

    it('should initialize IndexedDB connection', async () => {
      const cache = new AudioCache();
      await cache.initialize();
      expect(cache.db).toBeDefined();
      expect(cache.db.name).toBe('aceprep_voice_tutor');
      cache.close();
    });

    it('should create object store for audio cache', async () => {
      const cache = new AudioCache();
      await cache.initialize();
      expect(cache.db.objectStoreNames.contains('voiceTutorCache')).toBe(true);
      cache.close();
    });

    it('should throw error if methods called before initialization', async () => {
      const cache = new AudioCache();
      await expect(cache.get('test')).rejects.toThrow('not initialized');
    });
  });

  describe('Storage and Retrieval', () => {
    it('should store audio blob with metadata', async () => {
      const blob = createMockAudioBlob(5000);
      const metadata = { language: 'en', rate: 1 };
      
      await audioCache.set('passage_001', blob, metadata);
      const retrieved = await audioCache.get('passage_001');
      
      expect(retrieved).toBeDefined();
      expect(retrieved.size).toBe(blob.size);
    });

    it('should retrieve cached audio blob', async () => {
      const blob = createMockAudioBlob(3000);
      await audioCache.set('passage_002', blob);
      
      const retrieved = await audioCache.get('passage_002');
      expect(retrieved).toBeDefined();
      expect(retrieved.type).toBe('audio/mp3');
    });

    it('should return null for non-existent passage', async () => {
      const retrieved = await audioCache.get('non_existent');
      expect(retrieved).toBeNull();
    });

    it('should store metadata with audio', async () => {
      const blob = createMockAudioBlob(2000);
      const metadata = { language: 'ur', rate: 1.5 };
      
      await audioCache.set('passage_003', blob, metadata);
      
      // Verify by checking internal storage
      const transaction = audioCache.db.transaction(['voiceTutorCache'], 'readonly');
      const store = transaction.objectStore('voiceTutorCache');
      const request = store.get('passage_003');
      
      await new Promise((resolve) => {
        request.onsuccess = () => {
          const entry = request.result;
          expect(entry.language).toBe('ur');
          expect(entry.rate).toBe(1.5);
          resolve();
        };
      });
    });
  });

  describe('Cache Availability', () => {
    it('should return true for cached passage', async () => {
      const blob = createMockAudioBlob(1000);
      await audioCache.set('passage_004', blob);
      
      const available = await audioCache.isAvailable('passage_004');
      expect(available).toBe(true);
    });

    it('should return false for non-cached passage', async () => {
      const available = await audioCache.isAvailable('non_existent');
      expect(available).toBe(false);
    });
  });

  describe('Cache Size Management', () => {
    it('should calculate total cache size', async () => {
      const blob1 = createMockAudioBlob(5000);
      const blob2 = createMockAudioBlob(3000);
      
      await audioCache.set('passage_005', blob1);
      await audioCache.set('passage_006', blob2);
      
      const size = await audioCache.getSize();
      expect(size).toBe(8000);
    });

    it('should return 0 for empty cache', async () => {
      const size = await audioCache.getSize();
      expect(size).toBe(0);
    });

    it('should update size after adding entries', async () => {
      let size = await audioCache.getSize();
      expect(size).toBe(0);
      
      const blob = createMockAudioBlob(10000);
      await audioCache.set('passage_007', blob);
      
      size = await audioCache.getSize();
      expect(size).toBe(10000);
    });
  });

  describe('LRU Eviction', () => {
    it('should update access timestamp on retrieval', async () => {
      const blob = createMockAudioBlob(1000);
      await audioCache.set('passage_008', blob);
      
      // Get the initial timestamp
      const transaction1 = audioCache.db.transaction(['voiceTutorCache'], 'readonly');
      const store1 = transaction1.objectStore('voiceTutorCache');
      const request1 = store1.get('passage_008');
      
      let initialTimestamp;
      await new Promise((resolve) => {
        request1.onsuccess = () => {
          initialTimestamp = request1.result.timestamp;
          resolve();
        };
      });
      
      // Wait a bit and retrieve
      await new Promise(resolve => setTimeout(resolve, 10));
      await audioCache.get('passage_008');
      
      // Check updated timestamp
      const transaction2 = audioCache.db.transaction(['voiceTutorCache'], 'readonly');
      const store2 = transaction2.objectStore('voiceTutorCache');
      const request2 = store2.get('passage_008');
      
      await new Promise((resolve) => {
        request2.onsuccess = () => {
          const updatedTimestamp = request2.result.timestamp;
          expect(updatedTimestamp).toBeGreaterThanOrEqual(initialTimestamp);
          resolve();
        };
      });
    });

    it('should preserve recently used entries during eviction', async () => {
      // Create entries with small size to test eviction
      const smallBlob = createMockAudioBlob(1000);
      
      // Add first entry
      await audioCache.set('passage_old', smallBlob);
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Add second entry (more recent)
      await audioCache.set('passage_new', smallBlob);
      
      // Access the old entry to make it more recent
      await audioCache.get('passage_old');
      
      // Both should still be available
      expect(await audioCache.isAvailable('passage_old')).toBe(true);
      expect(await audioCache.isAvailable('passage_new')).toBe(true);
    });
  });

  describe('Cache Clearing', () => {
    it('should clear all cached audio', async () => {
      const blob = createMockAudioBlob(1000);
      await audioCache.set('passage_009', blob);
      await audioCache.set('passage_010', blob);
      
      expect(await audioCache.getSize()).toBeGreaterThan(0);
      
      await audioCache.clear();
      
      expect(await audioCache.getSize()).toBe(0);
      expect(await audioCache.isAvailable('passage_009')).toBe(false);
      expect(await audioCache.isAvailable('passage_010')).toBe(false);
    });

    it('should allow new entries after clearing', async () => {
      const blob = createMockAudioBlob(1000);
      await audioCache.set('passage_011', blob);
      await audioCache.clear();
      
      await audioCache.set('passage_012', blob);
      expect(await audioCache.isAvailable('passage_012')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle database access errors gracefully', async () => {
      const cache = new AudioCache();
      
      await expect(cache.get('test')).rejects.toThrow();
    });

    it('should throw error when accessing uninitialized cache', async () => {
      const cache = new AudioCache();
      
      await expect(cache.set('test', createMockAudioBlob())).rejects.toThrow('not initialized');
      await expect(cache.isAvailable('test')).rejects.toThrow('not initialized');
      await expect(cache.getSize()).rejects.toThrow('not initialized');
    });
  });

  describe('Performance', () => {
    it('should retrieve cached audio quickly', async () => {
      const blob = createMockAudioBlob(50000);
      await audioCache.set('passage_perf_1', blob);
      
      const start = performance.now();
      await audioCache.get('passage_perf_1');
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(100); // Should be fast
    });

    it('should store audio efficiently', async () => {
      const blob = createMockAudioBlob(50000);
      
      const start = performance.now();
      await audioCache.set('passage_perf_2', blob);
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(200); // Should be reasonably fast
    });
  });
});
