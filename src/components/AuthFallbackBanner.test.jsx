import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ isDemoMode: false, user: null, signInAsDemo: null })),
}));

import { useAuth } from '../context/AuthContext';
import AuthFallbackBanner, { AuthFailureNotice } from './AuthFallbackBanner';
import { classifyAuthFailure } from '../utils/authFailure';

const render = (element) => renderToStaticMarkup(<MemoryRouter>{element}</MemoryRouter>);

describe('AuthFailureNotice', () => {
  it('retryable failure: announces itself and offers Try again and Return home', () => {
    const html = render(<AuthFailureNotice failure={classifyAuthFailure({ status: 503 })} onRetry={() => {}} />);
    expect(html).toContain('role="alert"');
    expect(html).toContain('data-failure-kind="service_unavailable"');
    expect(html).toContain('Try again');
    expect(html).toContain('href="/"');
    expect(html).toContain('Return home');
    expect(html).not.toContain('Report a problem');
  });

  it('non-retryable failure: no Try again, but the way home stays', () => {
    const html = render(<AuthFailureNotice failure={classifyAuthFailure({ status: 403 })} onRetry={() => {}} />);
    expect(html).not.toContain('Try again');
    expect(html).toContain('Return home');
  });

  it('while a retry is running the button is disabled and says so', () => {
    const html = render(<AuthFailureNotice failure={classifyAuthFailure({ status: 500 })} onRetry={() => {}} retrying />);
    expect(html).toContain('disabled=""');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('Trying again');
  });

  it('shows nothing without a failure', () => {
    expect(render(<AuthFailureNotice failure={null} />)).toBe('');
  });

  it('never shows raw provider text', () => {
    const raw = Object.assign(new Error('sess_SECRET token eyJabc'), { errors: [{ message: 'sess_SECRET' }], status: 500 });
    const html = render(<AuthFailureNotice failure={classifyAuthFailure(raw)} onRetry={() => {}} />);
    expect(html).not.toContain('SECRET');
    expect(html).not.toContain('eyJabc');
  });
});

describe('AuthFallbackBanner', () => {
  it('still renders the demo mode banner when there is no failure', () => {
    useAuth.mockReturnValue({ isDemoMode: true, user: null, signInAsDemo: () => {} });
    const html = render(<AuthFallbackBanner />);
    expect(html).toContain('Demo / Local Mode');
    expect(html).not.toContain('auth-failure-notice');
  });

  it('renders nothing outside demo mode when there is no failure', () => {
    useAuth.mockReturnValue({ isDemoMode: false, user: null, signInAsDemo: null });
    expect(render(<AuthFallbackBanner />)).toBe('');
  });

  it('shows the recovery state when a failure is passed, even outside demo mode', () => {
    useAuth.mockReturnValue({ isDemoMode: false, user: null, signInAsDemo: null });
    const html = render(<AuthFallbackBanner failure={classifyAuthFailure(new TypeError('Failed to fetch'))} onRetry={() => {}} />);
    expect(html).toContain('data-failure-kind="network"');
    expect(html).toContain('You seem to be offline');
  });
});
