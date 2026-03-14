// Reading Comprehension Cloud Sync
// Syncs reading progress to Firebase with offline queue and conflict resolution

import { syncProgressToCloud, loadProgressFromCloud } from './cloudSync.js';
import { getProgress, updateProgress } from './progressStore.js';

const OFFLINE_QUEUE_KEY = 'rc_offline_sync_queue';
const MAX_RETRIES = 3;

/**
 * Sync reading progress to Firebase.
 * Falls back to offline queue if not connected.
 */
export async function syncReadingProgress(readingStats) {
  try {
    const progress = getProgress();
    progress.readingStats = { ...(progress.readingStats || {}), ...readingStats, lastSync: Date.now() };
    updateProgress(progress);
    await syncProgressToCloud(progress);
    _flushOfflineQueue();
  } catch (err) {
    console.warn('Reading sync failed, queuing:', err);
    _enqueueOffline(readingStats);
  }
}

/**
 * Load reading progress from Firebase, merge with local (keep most recent).
 */
export async function loadReadingProgress() {
  try {
    const cloudData = await loadProgressFromCloud();
    if (!cloudData?.readingStats) return null;
    const local = getProgress();
    const localTs = local?.readingStats?.lastSync || 0;
    const cloudTs = cloudData.readingStats?.lastSync || 0;
    if (cloudTs > localTs) {
      local.readingStats = cloudData.readingStats;
      updateProgress(local);
    }
    return local.readingStats;
  } catch (err) {
    console.warn('Reading load failed:', err);
    return null;
  }
}

function _enqueueOffline(data) {
  try {
    const queue = _loadQueue();
    queue.push({ data, timestamp: Date.now(), retries: 0 });
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (e) { /* ignore */ }
}

function _loadQueue() {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

async function _flushOfflineQueue() {
  const queue = _loadQueue();
  if (queue.length === 0) return;
  const remaining = [];
  for (const item of queue) {
    if (item.retries >= MAX_RETRIES) continue; // drop after max retries
    try {
      const progress = getProgress();
      progress.readingStats = { ...(progress.readingStats || {}), ...item.data };
      await syncProgressToCloud(progress);
    } catch {
      remaining.push({ ...item, retries: item.retries + 1 });
    }
  }
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
  } catch (e) { /* ignore */ }
}

/** Expose for testing */
export function getOfflineQueue() { return _loadQueue(); }
export function clearOfflineQueue() { localStorage.removeItem(OFFLINE_QUEUE_KEY); }
