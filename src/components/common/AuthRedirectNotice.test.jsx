import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import AuthRedirectNotice from './AuthRedirectNotice';

const render = (props) =>
  renderToStaticMarkup(
    <MemoryRouter>
      <AuthRedirectNotice {...props} />
    </MemoryRouter>
  );

describe('AuthRedirectNotice', () => {
  it('explains why sign in is needed and where the user goes back to', () => {
    const html = render({ redirectTo: '/saved', mode: 'signin' });
    expect(html).toContain('Sign in to open your saved services');
    expect(html).toContain('/saved');
    expect(html).toContain('role="status"');
  });

  it('links to sign up while keeping the destination', () => {
    const html = render({ redirectTo: '/vault', mode: 'signin' });
    expect(html).toContain('href="/signup?redirect_url=%2Fvault"');
    expect(html).toContain('Create a free account');
  });

  it('uses sign up wording and links back to sign in on the sign up page', () => {
    const html = render({ redirectTo: '/profile', mode: 'signup' });
    expect(html).toContain('Create a free account to open your profile');
    expect(html).toContain('href="/login?redirect_url=%2Fprofile"');
  });

  it('renders nothing without a protected destination', () => {
    expect(render({ redirectTo: null })).toBe('');
    expect(render({ redirectTo: '/' })).toBe('');
  });
});
