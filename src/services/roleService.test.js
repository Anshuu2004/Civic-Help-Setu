import { describe, it, expect } from 'vitest';
import { resolveRole } from './roleService';

describe('resolveRole', () => {
  it('returns admin when publicMetadata.role is admin', () => {
    expect(resolveRole({ role: 'admin' })).toBe('admin');
  });

  it('returns citizen when metadata is missing', () => {
    expect(resolveRole(undefined)).toBe('citizen');
    expect(resolveRole(null)).toBe('citizen');
    expect(resolveRole({})).toBe('citizen');
  });

  it('returns citizen for unknown or non-string roles', () => {
    expect(resolveRole({ role: 'superuser' })).toBe('citizen');
    expect(resolveRole({ role: 42 })).toBe('citizen');
    expect(resolveRole({ role: { admin: true } })).toBe('citizen');
  });

  it('does not grant admin from an email or username (only metadata counts)', () => {
    // resolveRole only receives metadata, so an "admin" email has no effect
    expect(resolveRole({ email: 'myadmin@gmail.com', username: 'esha' })).toBe('citizen');
  });

  it('accepts citizen and tolerates casing/whitespace', () => {
    expect(resolveRole({ role: 'citizen' })).toBe('citizen');
    expect(resolveRole({ role: ' Admin ' })).toBe('admin');
  });
});
