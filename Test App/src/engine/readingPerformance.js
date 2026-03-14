// Reading Comprehension Performance Utilities
// Lazy loading, memoization, debouncing, virtual scrolling helpers

/**
 * Memoize a function — caches results by serialised arguments.
 */
export function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Debounce a function — delays execution until after `wait` ms of inactivity.
 */
export function debounce(fn, wait = 50) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 * Measure async operation duration and log if over threshold.
 * @param {string} label
 * @param {Function} fn - async function
 * @param {number} threshold - ms warning threshold
 */
export async function measureAsync(label, fn, threshold = 300) {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  if (duration > threshold) {
    console.warn(`[RC Perf] ${label}: ${Math.round(duration)}ms (threshold ${threshold}ms)`);
  }
  return result;
}

/**
 * Lazy-load a module only when needed.
 * @param {Function} importFn - () => import('./module.js')
 */
export function lazyLoad(importFn) {
  let promise = null;
  return () => {
    if (!promise) promise = importFn();
    return promise;
  };
}

/**
 * Virtual scroll helper — returns the slice of items visible in the viewport.
 * @param {Array} items
 * @param {number} scrollTop - current scroll position
 * @param {number} containerHeight - visible height in px
 * @param {number} itemHeight - height of each item in px
 * @param {number} overscan - extra items to render above/below
 */
export function getVirtualSlice(items, scrollTop, containerHeight, itemHeight, overscan = 3) {
  const startIdx = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const endIdx = Math.min(items.length, startIdx + visibleCount + overscan * 2);
  return {
    items: items.slice(startIdx, endIdx),
    startIdx,
    endIdx,
    totalHeight: items.length * itemHeight,
    offsetY: startIdx * itemHeight
  };
}

/**
 * Parse word boundaries from passage text for efficient highlighting.
 * Returns array of { word, start, end } objects.
 */
export const parseWordBoundaries = memoize(function (text) {
  const words = [];
  const regex = /\S+/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    words.push({ word: match[0], start: match.index, end: match.index + match[0].length });
  }
  return words;
});

/**
 * Debounced highlight update — use for Voice Tutor word highlighting.
 * Calls fn with wordIndex after 50ms debounce.
 */
export const debouncedHighlight = debounce((fn, wordIndex) => fn(wordIndex), 50);

/**
 * Resource cleanup helper — collects cleanup functions and runs them all.
 */
export class CleanupManager {
  constructor() { this._fns = []; }
  add(fn) { this._fns.push(fn); }
  cleanup() {
    this._fns.forEach(fn => { try { fn(); } catch (e) { /* ignore */ } });
    this._fns = [];
  }
}
