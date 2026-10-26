import { describe, it, expect, vi } from 'vitest';
import {
  AUTH_FAILURE_KINDS as K,
  classifyAuthFailure,
  failureForKind,
  createRedirectGate,
} from './authFailure';

describe('classifyAuthFailure', () => {
  it('maps offline and fetch failures to a retryable network state', () => {
    expect(classifyAuthFailure(new Error('anything'), { online: false })).toMatchObject({ kind: K.NETWORK, retryable: true });
    expect(classifyAuthFailure(new TypeError('Failed to fetch')).kind).toBe(K.NETWORK);
    expect(classifyAuthFailure({ message: 'NetworkError when attempting to fetch resource.' }).kind).toBe(K.NETWORK);
    expect(classifyAuthFailure({ code: 'network_error' }).kind).toBe(K.NETWORK);
  });

  it('maps an invalid or unauthorised session to a retryable expired-session state', () => {
    expect(classifyAuthFailure({ errors: [{ code: 'authentication_invalid' }] })).toMatchObject({
      kind: K.SESSION_EXPIRED,
      retryable: true,
    });
    expect(classifyAuthFailure({ status: 401 }).kind).toBe(K.SESSION_EXPIRED);
  });

  it('maps provider load failures, 5xx and rate limits to a retryable unavailable state', () => {
    expect(classifyAuthFailure({ code: 'failed_to_load_clerk_js' }).kind).toBe(K.SERVICE_UNAVAILABLE);
    expect(classifyAuthFailure({ code: 'failed_to_load_clerk_js_timeout' }).kind).toBe(K.SERVICE_UNAVAILABLE);
    expect(classifyAuthFailure({ status: 503 }).kind).toBe(K.SERVICE_UNAVAILABLE);
    expect(classifyAuthFailure({ status: 429 }).kind).toBe(K.SERVICE_UNAVAILABLE);
  });

  it('treats a 403 as non-retryable', () => {
    const result = classifyAuthFailure({ status: 403 });
    expect(result.kind).toBe(K.ACCESS_BLOCKED);
    expect(result.retryable).toBe(false);
  });

  it('keeps unrecognised failures generic', () => {
    ['boom', null, undefined, {}, new Error('something odd'), { code: 'some_new_code' }, { status: 418 }].forEach((err) => {
      const result = classifyAuthFailure(err);
      expect(result.kind).toBe(K.UNKNOWN);
      expect(result.title).toBe('Sign-in did not finish');
    });
  });

  it('never copies provider text, codes, tokens or ids into the message', () => {
    const secret = 'sess_2abcSECRET eyJhbGciOiJIUzI1NiJ9.token user_123 sk_live_abc oauth_google';
    const error = Object.assign(new Error(`Clerk: ${secret}`), {
      code: 'failed_to_load_clerk_js',
      status: 502,
      errors: [{ code: 'internal_x', message: secret, longMessage: secret, meta: { token: secret } }],
    });
    [classifyAuthFailure(error), classifyAuthFailure({ message: secret }), classifyAuthFailure(error, { online: false })].forEach((result) => {
      const shown = JSON.stringify(result);
      ['SECRET', 'eyJ', 'user_123', 'sk_live', 'oauth_google', 'sess_', 'internal_x', 'Clerk:'].forEach((bit) => {
        expect(shown).not.toContain(bit);
      });
    });
  });

  it('only returns fixed fields', () => {
    expect(Object.keys(classifyAuthFailure({ status: 500 })).sort()).toEqual(['kind', 'message', 'retryable', 'title']);
  });

  it('builds a failure straight from a kind', () => {
    expect(failureForKind(K.SERVICE_UNAVAILABLE).retryable).toBe(true);
    expect(failureForKind('made_up').kind).toBe('made_up');
    expect(failureForKind('made_up').title).toBe('Sign-in did not finish');
  });
});

describe('createRedirectGate', () => {
  it('starts one redirect and ignores rapid repeat clicks while it is starting', async () => {
    const gate = createRedirectGate();
    let release;
    const redirect = vi.fn(() => new Promise((resolve) => { release = resolve; }));

    const first = gate.run(redirect);
    const clicks = await Promise.all([gate.run(redirect), gate.run(redirect), gate.run(redirect)]);
    expect(clicks.every((c) => c.status === 'busy')).toBe(true);

    release();
    expect(await first).toEqual({ status: 'started' });
    expect(redirect).toHaveBeenCalledTimes(1);
  });

  it('stays closed after a successful start because the page is navigating away', async () => {
    const gate = createRedirectGate();
    const redirect = vi.fn().mockResolvedValue(undefined);
    await gate.run(redirect);
    expect((await gate.run(redirect)).status).toBe('busy');
    expect(redirect).toHaveBeenCalledTimes(1);
  });

  it('reopens after a failure so the retry works exactly once', async () => {
    const gate = createRedirectGate();
    const redirect = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined);

    expect((await gate.run(redirect)).status).toBe('failed');
    expect(gate.isBusy()).toBe(false);

    const [a, b] = await Promise.all([gate.run(redirect), gate.run(redirect)]);
    expect([a.status, b.status].sort()).toEqual(['busy', 'started']);
    expect(redirect).toHaveBeenCalledTimes(2);
  });

  it('can be released when the page returns from the back/forward cache', async () => {
    const gate = createRedirectGate();
    const redirect = vi.fn().mockResolvedValue(undefined);
    await gate.run(redirect);
    gate.release();
    expect((await gate.run(redirect)).status).toBe('started');
    expect(redirect).toHaveBeenCalledTimes(2);
  });
});
