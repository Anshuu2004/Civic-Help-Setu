/**
 * Accessibility landmark and focus management utilities for Civic-Help-Setu.
 * Ensures WCAG 2.1 AA/AAA compliance for keyboard and screen-reader users.
 */

// Available standard landmark targets
export const DEFAULT_SKIP_TARGETS = [
  { id: 'main-content', label: 'Skip to Main Content', shortcut: 'Alt+M' },
  { id: 'site-navigation', label: 'Skip to Navigation', shortcut: 'Alt+N' },
  { id: 'site-footer', label: 'Skip to Footer', shortcut: 'Alt+F' },
];

/**
 * Safely focuses an HTML element by ID, ensuring appropriate tabindex and scroll behavior.
 * Resolves browser quirks where programmatic focus on non-interactive landmark elements
 * fails unless tabIndex="-1" is explicitly set.
 *
 * @param {string} elementId - The ID of the target element (without hash prefix).
 * @param {Object} options - Customization options.
 * @param {boolean} options.preventScroll - Whether to prevent browser auto-scroll.
 * @param {number} options.scrollOffset - Top offset to compensate for fixed headers.
 * @returns {boolean} True if element was successfully focused.
 */
export function focusLandmark(elementId, options = {}) {
  if (typeof document === 'undefined') return false;

  const targetId = elementId.replace(/^#/, '');
  const element = document.getElementById(targetId);

  if (!element) {
    console.warn(`[a11y] Landmark target #${targetId} was not found on the active page.`);
    return false;
  }

  // Ensure element can receive programmatic focus without entering natural tab order
  const originalTabIndex = element.getAttribute('tabindex');
  const needsTemporaryTabIndex = !originalTabIndex && !isNaturallyFocusable(element);

  if (needsTemporaryTabIndex) {
    element.setAttribute('tabindex', '-1');
  }

  try {
    element.focus({ preventScroll: options.preventScroll || false });

    // Compensate for fixed/sticky headers if necessary
    const offset = options.scrollOffset ?? 80;
    if (!options.preventScroll && offset > 0) {
      const rect = element.getBoundingClientRect();
      if (rect.top < offset || rect.top > window.innerHeight) {
        window.scrollBy({
          top: rect.top - offset,
          behavior: 'smooth',
        });
      }
    }

    // Clean up temporary tabindex on blur to preserve natural DOM semantics
    if (needsTemporaryTabIndex) {
      const handleBlur = () => {
        element.removeAttribute('tabindex');
        element.removeEventListener('blur', handleBlur);
      };
      element.addEventListener('blur', handleBlur);
    }

    return true;
  } catch (error) {
    console.error(`[a11y] Failed to focus element #${targetId}:`, error);
    return false;
  }
}

/**
 * Determines whether an element naturally receives keyboard focus.
 * @param {HTMLElement} el
 * @returns {boolean}
 */
export function isNaturallyFocusable(el) {
  if (!el || !el.tagName) return false;
  const tag = el.tagName.toLowerCase();
  if (['input', 'select', 'textarea', 'button'].includes(tag)) {
    return !el.disabled;
  }
  if (tag === 'a' && el.hasAttribute('href')) {
    return true;
  }
  if (el.hasAttribute('tabindex')) {
    const tabIndex = parseInt(el.getAttribute('tabindex') || '0', 10);
    return !isNaN(tabIndex) && tabIndex >= 0;
  }
  return false;
}

/**
 * Live screen reader announcer. Creates or updates an accessible aria-live region.
 *
 * @param {string} message - Announcement text for assistive technologies.
 * @param {'polite' | 'assertive'} politeness - Politeness level.
 */
export function announceToScreenReader(message, politeness = 'polite') {
  if (typeof document === 'undefined' || !message) return;

  const announcerId = 'civic-a11y-live-announcer';
  let announcer = document.getElementById(announcerId);

  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = announcerId;
    announcer.setAttribute('aria-live', politeness);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;';
    document.body.appendChild(announcer);
  } else {
    announcer.setAttribute('aria-live', politeness);
  }

  // Clear and update to ensure screen readers announce duplicate messages
  announcer.textContent = '';
  setTimeout(() => {
    announcer.textContent = message;
  }, 50);
}

/**
 * Registers global keyboard shortcut for quick landmark jump (e.g. Alt+M to jump to main).
 *
 * @param {Function} callback - Triggered when shortcut is detected.
 * @returns {Function} Cleanup function to unregister the listener.
 */
export function registerSkipKeyboardShortcuts(callback) {
  if (typeof window === 'undefined') return () => {};

  const handleKeyDown = (event) => {
    // Alt + M -> Main content
    if (event.altKey && (event.key === 'm' || event.key === 'M' || event.key === '1')) {
      event.preventDefault();
      callback('main-content');
    }
    // Alt + N -> Navigation
    else if (event.altKey && (event.key === 'n' || event.key === 'N' || event.key === '2')) {
      event.preventDefault();
      callback('site-navigation');
    }
    // Alt + F -> Footer
    else if (event.altKey && (event.key === 'f' || event.key === 'F' || event.key === '3')) {
      event.preventDefault();
      callback('site-footer');
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}
