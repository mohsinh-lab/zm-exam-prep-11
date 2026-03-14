// Offline Detection and Sync Queue for Reading Comprehension
// Detects online/offline status and manages offline progress queue

const OFFLINE_QUEUE_KEY = 'rc_offline_queue';
const MAX_RETRIES = 3;

/** Returns true if browser is currently online */
export function isOnline() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/** Register callbacks for online/offline transitions */
export function onConnectivityChange(onOnline, onOffline) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

/** Enqueue a progress update for later sync */
export function enqueueOfflineUpdate(data) {
  const queue = loadQueue();
  queue.push({ data, timestamp: Date.now(), retries: 0 });
  saveQueue(queue);
}

/** Flush the offline queue by calling syncFn for each item */
export async function flushOfflineQueue(syncFn) {
  if (!isOnline()) return;
  const queue = loadQueue();
  if (queue.length === 0) return;

  const remaining = [];
  for (const item of queue) {
    if (item.retries >= MAX_RETRIES) continue;
    try {
      await syncFn(item.data);
    } catch {
      remaining.push({ ...item, retries: item.retries + 1 });
    }
  }
  saveQueue(remaining);
}

export function loadQueue() {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveQueue(queue) {
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (e) { console.warn('offlineDetection: could not save queue', e); }
}

export function clearQueue() {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
}

export function getQueueLength() {
  return loadQueue().length;
}
