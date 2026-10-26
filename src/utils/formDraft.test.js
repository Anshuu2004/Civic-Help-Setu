import { describe, it, expect } from 'vitest';
import { createMemoryRouter } from 'react-router-dom';
import { isFormDirty, shouldBlockNavigation } from './formDraft';

const base = { name: 'a', age: 26, flag: false };

describe('isFormDirty', () => {
  it('is clean when values equal the baseline', () => {
    expect(isFormDirty({ ...base }, base)).toBe(false);
  });
  it('is dirty when any field changes', () => {
    expect(isFormDirty({ ...base, age: 27 }, base)).toBe(true);
    expect(isFormDirty({ ...base, flag: true }, base)).toBe(true);
  });
  it('becomes clean again once the baseline is updated after a save', () => {
    const edited = { ...base, name: 'b' };
    expect(isFormDirty(edited, base)).toBe(true);
    expect(isFormDirty(edited, edited)).toBe(false);
  });
  it('is clean when edits are reverted by hand', () => {
    expect(isFormDirty({ ...base, name: 'b' }, base)).toBe(true);
    expect(isFormDirty({ ...base, name: 'a' }, base)).toBe(false);
  });
  it('treats missing inputs as clean', () => {
    expect(isFormDirty(null, base)).toBe(false);
  });
});

describe('shouldBlockNavigation', () => {
  const here = { pathname: '/admin', search: '', hash: '' };
  it('never blocks a clean form', () => {
    expect(shouldBlockNavigation(false, here, { ...here, pathname: '/' })).toBe(false);
  });
  it('blocks leaving the page when dirty', () => {
    expect(shouldBlockNavigation(true, here, { ...here, pathname: '/' })).toBe(true);
  });
  it('does not block when the location is unchanged', () => {
    expect(shouldBlockNavigation(true, here, { ...here })).toBe(false);
  });
});

describe('router blocker integration (memory data router)', () => {
  const setup = (isDirty) => {
    const router = createMemoryRouter(
      [{ path: '/admin', element: null }, { path: '/', element: null }],
      { initialEntries: ['/', '/admin'], initialIndex: 1 },
    );
    const blocker = router.getBlocker('draft', ({ currentLocation, nextLocation }) =>
      shouldBlockNavigation(isDirty, currentLocation, nextLocation),
    );
    return { router, blocker };
  };

  it('lets a clean form navigate away', async () => {
    const { router } = setup(false);
    await router.navigate('/');
    expect(router.state.location.pathname).toBe('/');
  });

  it('blocks a dirty form, and stay keeps the user on the page', async () => {
    const { router } = setup(true);
    await router.navigate('/');
    expect(router.state.location.pathname).toBe('/admin');
    expect(router.state.blockers.get('draft').state).toBe('blocked');
    router.state.blockers.get('draft').reset();
    expect(router.state.location.pathname).toBe('/admin');
  });

  it('blocks browser back and discard proceeds', async () => {
    const { router } = setup(true);
    await router.navigate(-1);
    expect(router.state.location.pathname).toBe('/admin');
    expect(router.state.blockers.get('draft').state).toBe('blocked');
    router.state.blockers.get('draft').proceed();
    await new Promise((r) => setTimeout(r, 0));
    expect(router.state.location.pathname).toBe('/');
  });
});
