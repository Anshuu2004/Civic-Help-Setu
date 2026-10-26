import { hasUserMessages } from '../ai/conversationContext.js';

// How long a reset can be undone. The snapshot only lives in memory, never in the URL,
// localStorage or a notification, so it is gone after this or on leaving the page.
export const UNDO_WINDOW_MS = 10000;

// Only ask before resetting when the citizen has actually asked something.
export const needsResetConfirmation = (messages = []) => hasUserMessages(messages);

export const createResetSnapshot = (messages = [], now = Date.now(), windowMs = UNDO_WINDOW_MS) => ({
  messages: [...messages],
  expiresAt: now + windowMs,
});

export const getUndoRemainingMs = (snapshot, now = Date.now()) =>
  snapshot ? Math.max(0, snapshot.expiresAt - now) : 0;

export const canUndoReset = (snapshot, now = Date.now()) =>
  Boolean(snapshot) && snapshot.messages.length > 0 && getUndoRemainingMs(snapshot, now) > 0;

// Returns the exact messages that were cleared, or null once the window has closed.
export const restoreFromSnapshot = (snapshot, now = Date.now()) =>
  canUndoReset(snapshot, now) ? [...snapshot.messages] : null;
