import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  LOCATION_STATUS,
  LOCATION_DENIED_KEY,
  statusFromErrorKind,
  getLocationFailureCopy,
  canRequestLocation,
  isFallbackStatus,
  readDeniedFlag,
  writeDeniedFlag,
  queryGeolocationPermission,
} from './locationPermission';
import { requestUserCoordinates } from '../services/locationService';

const makeStorage = () => {
  const data = new Map();
  return {
    getItem: vi.fn((k) => (data.has(k) ? data.get(k) : null)),
    setItem: vi.fn((k, v) => data.set(k, String(v))),
    removeItem: vi.fn((k) => data.delete(k)),
  };
};

const ERR = { PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 };

describe('geolocation outcomes mapped to statuses', () => {
  beforeEach(() => vi.stubGlobal('sessionStorage', makeStorage()));
  afterEach(() => vi.unstubAllGlobals());

  const stubGeo = (impl) =>
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition: vi.fn(impl) } });

  it('granted: resolves coordinates and caches them', async () => {
    stubGeo((ok) => ok({ coords: { latitude: 28.6, longitude: 77.2, accuracy: 30 } }));
    const coords = await requestUserCoordinates();
    expect(coords).toMatchObject({ lat: 28.6, lng: 77.2, accuracy: 30 });
    expect(sessionStorage.setItem).toHaveBeenCalled();
  });

  it.each([
    ['denied', ERR.PERMISSION_DENIED, LOCATION_STATUS.DENIED],
    ['unavailable', ERR.POSITION_UNAVAILABLE, LOCATION_STATUS.UNAVAILABLE],
    ['timeout', ERR.TIMEOUT, LOCATION_STATUS.TIMEOUT],
  ])('%s error maps to its own status', async (_name, code, expected) => {
    stubGeo((_ok, fail) => fail({ code, ...ERR, message: 'x' }));
    const err = await requestUserCoordinates().catch((e) => e);
    expect(statusFromErrorKind(err.kind)).toBe(expected);
  });

  it('unsupported: no geolocation API', async () => {
    vi.stubGlobal('navigator', {});
    const err = await requestUserCoordinates().catch((e) => e);
    expect(statusFromErrorKind(err.kind)).toBe(LOCATION_STATUS.UNSUPPORTED);
  });

  it('unknown error kinds fall back to unavailable', () => {
    expect(statusFromErrorKind(undefined)).toBe(LOCATION_STATUS.UNAVAILABLE);
  });
});

describe('failure copy', () => {
  it('has a distinct title and message for every failure status', () => {
    const statuses = ['denied', 'unsupported', 'unavailable', 'timeout'];
    const copies = statuses.map(getLocationFailureCopy);
    expect(new Set(copies.map((c) => c.title)).size).toBe(4);
    expect(new Set(copies.map((c) => c.message)).size).toBe(4);
  });

  it('returns null for non-failure statuses', () => {
    expect(getLocationFailureCopy(LOCATION_STATUS.IDLE)).toBeNull();
    expect(isFallbackStatus(LOCATION_STATUS.IDLE)).toBe(false);
    expect(isFallbackStatus(LOCATION_STATUS.REQUESTING)).toBe(false);
    expect(isFallbackStatus(LOCATION_STATUS.TIMEOUT)).toBe(true);
  });
});

describe('canRequestLocation', () => {
  it('allows an explicit first request', () => {
    expect(canRequestLocation({ status: LOCATION_STATUS.IDLE })).toBe(true);
  });

  it('does not re-prompt while the browser reports denied', () => {
    expect(canRequestLocation({ status: LOCATION_STATUS.DENIED, permissionState: 'denied' })).toBe(false);
  });

  it('allows a deliberate retry when denial cannot be confirmed', () => {
    expect(canRequestLocation({ status: LOCATION_STATUS.DENIED, permissionState: 'unknown' })).toBe(true);
  });

  it('blocks while a request is in flight and when unsupported', () => {
    expect(canRequestLocation({ status: LOCATION_STATUS.REQUESTING })).toBe(false);
    expect(canRequestLocation({ status: LOCATION_STATUS.UNSUPPORTED })).toBe(false);
  });

  it('allows retry after unavailable or timeout', () => {
    expect(canRequestLocation({ status: LOCATION_STATUS.UNAVAILABLE })).toBe(true);
    expect(canRequestLocation({ status: LOCATION_STATUS.TIMEOUT })).toBe(true);
  });
});

describe('denied flag storage', () => {
  it('round-trips and clears', () => {
    const storage = makeStorage();
    expect(readDeniedFlag(storage)).toBe(false);
    writeDeniedFlag(true, storage);
    expect(storage.setItem).toHaveBeenCalledWith(LOCATION_DENIED_KEY, '1');
    expect(readDeniedFlag(storage)).toBe(true);
    writeDeniedFlag(false, storage);
    expect(readDeniedFlag(storage)).toBe(false);
  });

  it('survives unavailable storage', () => {
    const fail = () => {
      throw new Error('blocked');
    };
    const broken = { getItem: fail, setItem: fail, removeItem: fail };
    expect(readDeniedFlag(broken)).toBe(false);
    expect(() => writeDeniedFlag(true, broken)).not.toThrow();
  });
});

describe('queryGeolocationPermission', () => {
  it('reports unknown without the Permissions API', async () => {
    expect((await queryGeolocationPermission({})).state).toBe('unknown');
  });

  it('reports unknown when the query rejects', async () => {
    const nav = { permissions: { query: () => Promise.reject(new Error('nope')) } };
    expect((await queryGeolocationPermission(nav)).state).toBe('unknown');
  });

  it('returns the browser state without requesting a position', async () => {
    const getCurrentPosition = vi.fn();
    const nav = {
      geolocation: { getCurrentPosition },
      permissions: { query: vi.fn().mockResolvedValue({ state: 'denied' }) },
    };
    expect((await queryGeolocationPermission(nav)).state).toBe('denied');
    expect(getCurrentPosition).not.toHaveBeenCalled();
  });
});
