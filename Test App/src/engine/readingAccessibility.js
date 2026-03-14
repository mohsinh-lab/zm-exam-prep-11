// Reading Comprehension Accessibility Helpers
// WCAG 2.1 Level AA: keyboard navigation, ARIA, focus management, contrast

/**
 * Trap focus within a container element (for modals/dialogs).
 * Returns a cleanup function.
 */
export function trapFocus(container) {
  const focusable = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

  function getFocusable() {
    return Array.from(container.querySelectorAll(focusable));
  }

  function handleKeydown(e) {
    if (e.key !== 'Tab') return;
    const els = getFocusable();
    if (els.length === 0) return;
    const first = els[0];
    const last = els[els.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  container.addEventListener('keydown', handleKeydown);
  // Focus first element
  const els = getFocusable();
  if (els.length > 0) els[0].focus();

  return () => container.removeEventListener('keydown', handleKeydown);
}

/**
 * Enable arrow-key navigation within a radio group (option list).
 * Returns a cleanup function.
 */
export function enableArrowNavigation(container, selector = '[role="radio"]') {
  function handleKeydown(e) {
    if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(e.key)) return;
    const items = Array.from(container.querySelectorAll(selector));
    const idx = items.indexOf(document.activeElement);
    if (idx === -1) return;
    e.preventDefault();
    const next = (e.key === 'ArrowDown' || e.key === 'ArrowRight')
      ? (idx + 1) % items.length
      : (idx - 1 + items.length) % items.length;
    items[next].focus();
  }
  container.addEventListener('keydown', handleKeydown);
  return () => container.removeEventListener('keydown', handleKeydown);
}

/**
 * Announce a message to screen readers via an ARIA live region.
 */
export function announce(message, priority = 'polite') {
  if (typeof document === 'undefined') return;
  let region = document.getElementById('rc-live-region');
  if (!region) {
    region = document.createElement('div');
    region.id = 'rc-live-region';
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'true');
    region.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;';
    document.body.appendChild(region);
  }
  region.setAttribute('aria-live', priority);
  // Clear then set to trigger announcement
  region.textContent = '';
  requestAnimationFrame(() => { region.textContent = message; });
}

/**
 * Add ARIA attributes to a question element for screen reader support.
 */
export function applyQuestionAria(questionEl, question, index, total) {
  if (!questionEl) return;
  questionEl.setAttribute('role', 'group');
  questionEl.setAttribute('aria-label', `Question ${index} of ${total}: ${question.text}`);
}

/**
 * Apply ARIA to an option button/input.
 */
export function applyOptionAria(optionEl, option, isSelected) {
  if (!optionEl) return;
  optionEl.setAttribute('role', 'radio');
  optionEl.setAttribute('aria-checked', String(isSelected));
  optionEl.setAttribute('aria-label', option);
}

/**
 * Check if a colour pair meets WCAG AA contrast (4.5:1 for normal text).
 * Accepts hex colours like '#ffffff'.
 */
export function meetsContrastAA(hex1, hex2) {
  const l1 = _relativeLuminance(hex1);
  const l2 = _relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05) >= 4.5;
}

function _relativeLuminance(hex) {
  const rgb = _hexToRgb(hex);
  if (!rgb) return 0;
  return rgb.map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }).reduce((acc, c, i) => acc + c * [0.2126, 0.7152, 0.0722][i], 0);
}

function _hexToRgb(hex) {
  const m = hex.replace('#', '').match(/.{2}/g);
  if (!m || m.length < 3) return null;
  return m.slice(0, 3).map(h => parseInt(h, 16));
}

/**
 * Ensure all interactive elements in a container have visible focus styles.
 * Injects a <style> tag if not already present.
 */
export function ensureFocusStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('rc-focus-styles')) return;
  const style = document.createElement('style');
  style.id = 'rc-focus-styles';
  style.textContent = `
    .rc-container *:focus-visible {
      outline: 3px solid #005fcc;
      outline-offset: 2px;
      border-radius: 2px;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Minimum touch target size check (44x44px).
 */
export function checkTouchTarget(el) {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return rect.width >= 44 && rect.height >= 44;
}
