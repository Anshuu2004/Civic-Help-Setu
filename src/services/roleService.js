const VALID_ROLES = ['admin', 'citizen'];

/**
 * Work out a user's role from Clerk publicMetadata only.
 * publicMetadata can only be changed from the Clerk dashboard or backend,
 * so it is safe to trust. Anything other than "admin" or "citizen"
 * (missing, wrong type, odd casing handled) falls back to "citizen".
 */
export const resolveRole = (publicMetadata) => {
  const role = publicMetadata?.role;
  if (typeof role !== 'string') return 'citizen';
  const normalised = role.trim().toLowerCase();
  return VALID_ROLES.includes(normalised) ? normalised : 'citizen';
};
