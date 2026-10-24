import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  focusLandmark,
  isNaturallyFocusable,
  announceToScreenReader,
  registerSkipKeyboardShortcuts,
  DEFAULT_SKIP_TARGETS,
} from '../../utils/a11yLandmarks';

// Lightweight in-memory DOM mock for Node test environment
function createMockElement(tagName = 'div', attributes = {}) {
  const attrs = { ...attributes };
  const eventListeners = {};

  return {
    tagName: tagName.toUpperCase(),
    getAttribute: vi.fn((key) => attrs[key] || null),
    setAttribute: vi.fn((key, val) => {
      attrs[key] = String(val);
    }),
    removeAttribute: vi.fn((key) => {
      delete attrs[key];
    }),
    hasAttribute: vi.fn((key) => key in attrs),
    focus: vi.fn(),
    getBoundingClientRect: vi.fn(() => ({ top: 120, height: 400 })),
    addEventListener: vi.fn((evt, cb) => {
      eventListeners[evt] = eventListeners[evt] || [];
      eventListeners[evt].push(cb);
    }),
    removeEventListener: vi.fn((evt, cb) => {
      if (eventListeners[evt]) {
        eventListeners[evt] = eventListeners[evt].filter((fn) => fn !== cb);
      }
    }),
    disabled: false,
    textContent: '',
    style: {},
    className: '',
    id: attrs.id || '',
  };
}

describe('Accessibility Skip Links and Landmark Navigation (#74)', () => {
  let mockElements;
  let mockBody;
  let windowListeners;

  beforeEach(() => {
    mockElements = {};
    windowListeners = {};
    mockBody = createMockElement('body');

    // Stub global document
    vi.stubGlobal('document', {
      getElementById: vi.fn((id) => mockElements[id] || null),
      createElement: vi.fn((tagName) => {
        const el = createMockElement(tagName);
        return el;
      }),
      body: {
        appendChild: vi.fn((el) => {
          if (el.id) mockElements[el.id] = el;
          return el;
        }),
      },
    });

    // Stub global window
    vi.stubGlobal('window', {
      innerHeight: 800,
      scrollBy: vi.fn(),
      addEventListener: vi.fn((evt, cb) => {
        windowListeners[evt] = windowListeners[evt] || [];
        windowListeners[evt].push(cb);
      }),
      removeEventListener: vi.fn((evt, cb) => {
        if (windowListeners[evt]) {
          windowListeners[evt] = windowListeners[evt].filter((fn) => fn !== cb);
        }
      }),
      dispatchEvent: vi.fn((evt) => {
        const list = windowListeners[evt.type] || [];
        list.forEach((cb) => cb(evt));
      }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('provides default landmark targets for main content, navigation, and footer', () => {
    expect(DEFAULT_SKIP_TARGETS).toHaveLength(3);
    const targetIds = DEFAULT_SKIP_TARGETS.map((t) => t.id);
    expect(targetIds).toContain('main-content');
    expect(targetIds).toContain('site-navigation');
    expect(targetIds).toContain('site-footer');
  });

  it('correctly identifies naturally focusable elements vs generic containers', () => {
    const button = createMockElement('button');
    const anchorWithHref = createMockElement('a', { href: 'https://example.gov.in' });
    const anchorWithoutHref = createMockElement('a');
    const div = createMockElement('div');
    const main = createMockElement('main');

    expect(isNaturallyFocusable(button)).toBe(true);
    expect(isNaturallyFocusable(anchorWithHref)).toBe(true);
    expect(isNaturallyFocusable(anchorWithoutHref)).toBe(false);
    expect(isNaturallyFocusable(div)).toBe(false);
    expect(isNaturallyFocusable(main)).toBe(false);

    main.setAttribute('tabindex', '0');
    expect(isNaturallyFocusable(main)).toBe(true);
  });

  it('safely handles missing landmark IDs without throwing errors', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = focusLandmark('non-existent-landmark');
    expect(result).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[a11y] Landmark target #non-existent-landmark was not found')
    );
  });

  it('dynamically sets tabIndex="-1" on landmarks and focuses the element', () => {
    const main = createMockElement('main', { id: 'main-content' });
    mockElements['main-content'] = main;

    const success = focusLandmark('main-content');
    expect(success).toBe(true);
    expect(main.setAttribute).toHaveBeenCalledWith('tabindex', '-1');
    expect(main.focus).toHaveBeenCalled();
  });

  it('preserves existing tabIndex if landmark already has one configured', () => {
    const nav = createMockElement('nav', { id: 'site-navigation', tabindex: '0' });
    mockElements['site-navigation'] = nav;

    const success = focusLandmark('site-navigation');
    expect(success).toBe(true);
    expect(nav.setAttribute).not.toHaveBeenCalledWith('tabindex', '-1');
    expect(nav.focus).toHaveBeenCalled();
  });

  it('creates an accessible live region for screen-reader announcements', async () => {
    announceToScreenReader('Navigated to Main Content', 'polite');

    const createdAnnouncer = mockElements['civic-a11y-live-announcer'];
    expect(createdAnnouncer).toBeDefined();
    expect(createdAnnouncer.setAttribute).toHaveBeenCalledWith('aria-live', 'polite');
    expect(createdAnnouncer.setAttribute).toHaveBeenCalledWith('aria-atomic', 'true');

    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(createdAnnouncer.textContent).toBe('Navigated to Main Content');
  });

  it('handles keyboard shortcuts for rapid landmark jumping (Alt+M, Alt+N, Alt+F)', () => {
    const callback = vi.fn();
    const unregister = registerSkipKeyboardShortcuts(callback);

    // Simulate Alt + M
    const altMEvent = { type: 'keydown', key: 'm', altKey: true, preventDefault: vi.fn() };
    window.dispatchEvent(altMEvent);
    expect(callback).toHaveBeenCalledWith('main-content');

    // Simulate Alt + N
    const altNEvent = { type: 'keydown', key: 'n', altKey: true, preventDefault: vi.fn() };
    window.dispatchEvent(altNEvent);
    expect(callback).toHaveBeenCalledWith('site-navigation');

    // Simulate Alt + F
    const altFEvent = { type: 'keydown', key: 'f', altKey: true, preventDefault: vi.fn() };
    window.dispatchEvent(altFEvent);
    expect(callback).toHaveBeenCalledWith('site-footer');

    // Unregister and verify shortcut no longer triggers
    unregister();
    callback.mockClear();
    window.dispatchEvent(altMEvent);
    expect(callback).not.toHaveBeenCalled();
  });
});
