import { describe, it, expect } from 'vitest';
import {
  UNDO_WINDOW_MS,
  needsResetConfirmation,
  createResetSnapshot,
  getUndoRemainingMs,
  canUndoReset,
  restoreFromSnapshot,
} from './chatSession';

const welcome = { id: 'welcome-msg', role: 'assistant', text: 'Hello!' };
const conversation = [
  welcome,
  { id: 'user-1', role: 'user', text: 'How do I get a passport?' },
  {
    id: 'asst-1',
    role: 'assistant',
    text: '',
    data: { title: 'New Passport Application', steps: [{ title: 'Apply online' }] },
    serviceId: 'passport',
    suggestions: ['What are the fees?'],
    retrievedChunks: [{ id: 'c1' }],
  },
];

describe('needsResetConfirmation', () => {
  it('is false for a fresh chat that only has the welcome message', () => {
    expect(needsResetConfirmation([welcome])).toBe(false);
    expect(needsResetConfirmation([])).toBe(false);
    expect(needsResetConfirmation()).toBe(false);
  });

  it('is true once the citizen has asked something', () => {
    expect(needsResetConfirmation(conversation)).toBe(true);
  });
});

describe('reset snapshot', () => {
  it('uses a 10 second window', () => {
    expect(UNDO_WINDOW_MS).toBe(10000);
    expect(createResetSnapshot(conversation, 1000).expiresAt).toBe(11000);
  });

  it('restores the cleared messages exactly, same objects in the same order', () => {
    const snap = createResetSnapshot(conversation, 0);
    const restored = restoreFromSnapshot(snap, 5000);
    expect(restored).toEqual(conversation);
    restored.forEach((msg, i) => expect(msg).toBe(conversation[i]));
  });

  it('is not affected when the original array is changed afterwards', () => {
    const live = [...conversation];
    const snap = createResetSnapshot(live, 0);
    live.push({ id: 'user-2', role: 'user', text: 'later' });
    expect(restoreFromSnapshot(snap, 1)).toHaveLength(3);
  });

  it('can be restored right up to the last millisecond and not after', () => {
    const snap = createResetSnapshot(conversation, 0);
    expect(canUndoReset(snap, UNDO_WINDOW_MS - 1)).toBe(true);
    expect(getUndoRemainingMs(snap, UNDO_WINDOW_MS - 1)).toBe(1);
    expect(canUndoReset(snap, UNDO_WINDOW_MS)).toBe(false);
    expect(restoreFromSnapshot(snap, UNDO_WINDOW_MS)).toBeNull();
    expect(restoreFromSnapshot(snap, UNDO_WINDOW_MS + 60000)).toBeNull();
    expect(getUndoRemainingMs(snap, UNDO_WINDOW_MS + 5)).toBe(0);
  });

  it('handles a missing or empty snapshot', () => {
    expect(canUndoReset(null)).toBe(false);
    expect(restoreFromSnapshot(undefined)).toBeNull();
    expect(getUndoRemainingMs(null)).toBe(0);
    expect(restoreFromSnapshot(createResetSnapshot([], 0), 1)).toBeNull();
  });

  it('does not put chat text in anything but the in-memory messages', () => {
    const snap = createResetSnapshot(conversation, 0);
    expect(Object.keys(snap).sort()).toEqual(['expiresAt', 'messages']);
  });
});
