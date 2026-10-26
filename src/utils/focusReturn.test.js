import { describe, it, expect, vi } from 'vitest';
import { captureFocusedElement, pickFocusRestoreTarget, restoreFocus } from './focusReturn';

const fakeElement = (extra = {}) => ({ isConnected: true, focus: vi.fn(), ...extra });

describe('captureFocusedElement', () => {
  it('returns the element that has focus', () => {
    const button = fakeElement();
    const doc = { activeElement: button, body: {}, documentElement: {} };
    expect(captureFocusedElement(doc)).toBe(button);
  });

  it('returns null when focus is on the body or the root element', () => {
    const body = {};
    const documentElement = {};
    expect(captureFocusedElement({ activeElement: body, body, documentElement })).toBeNull();
    expect(captureFocusedElement({ activeElement: documentElement, body, documentElement })).toBeNull();
  });

  it('returns null when nothing is focused or there is no document', () => {
    expect(captureFocusedElement({ activeElement: null, body: {}, documentElement: {} })).toBeNull();
    expect(captureFocusedElement(null)).toBeNull();
  });
});

describe('pickFocusRestoreTarget', () => {
  it('keeps an opener that is still in the page', () => {
    const opener = fakeElement();
    expect(pickFocusRestoreTarget(opener)).toBe(opener);
  });

  it('drops an opener that was removed from the page', () => {
    expect(pickFocusRestoreTarget(fakeElement({ isConnected: false }))).toBeNull();
  });

  it('drops values that cannot take focus', () => {
    expect(pickFocusRestoreTarget(null)).toBeNull();
    expect(pickFocusRestoreTarget(undefined)).toBeNull();
    expect(pickFocusRestoreTarget({ isConnected: true })).toBeNull();
  });
});

describe('restoreFocus', () => {
  it('focuses the opener and reports it', () => {
    const opener = fakeElement();
    expect(restoreFocus(opener)).toBe(true);
    expect(opener.focus).toHaveBeenCalledTimes(1);
  });

  it('does nothing for a removed opener', () => {
    const opener = fakeElement({ isConnected: false });
    expect(restoreFocus(opener)).toBe(false);
    expect(opener.focus).not.toHaveBeenCalled();
  });

  it('does nothing when there was no opener', () => {
    expect(restoreFocus(null)).toBe(false);
  });
});
