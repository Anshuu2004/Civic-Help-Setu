// Pure helpers for the Saved page collection switcher.
//
// Persistence model: a collection is the existing `folder` string on each saved
// item in savedStorage. Nothing here writes to storage, so a service can never
// be duplicated across collections. A collection only exists in storage while at
// least one saved item uses it; collections created on the page before any guide
// is assigned are kept in component state only ("pending") and disappear on reload.

export const ALL_COLLECTION = 'All';
export const DEFAULT_COLLECTION = 'General';

const sameName = (a, b) => String(a).toLowerCase() === String(b).toLowerCase();

export const normalizeCollectionName = (name) =>
  String(name ?? '').replace(/\s+/g, ' ').trim();

const folderOf = (item) => item?.folder || DEFAULT_COLLECTION;

/**
 * Build the switcher entries: "All" first (count = number of saved guides),
 * then every folder used by a saved item, then pending (empty, session-only) ones.
 */
export const buildCollections = (items = [], pendingNames = []) => {
  const byKey = new Map();
  items.forEach((item) => {
    const name = folderOf(item);
    const key = name.toLowerCase();
    const entry = byKey.get(key);
    if (entry) entry.count += 1;
    else byKey.set(key, { name, count: 1, pending: false });
  });
  pendingNames.forEach((raw) => {
    const name = normalizeCollectionName(raw);
    if (!name || sameName(name, ALL_COLLECTION)) return;
    const key = name.toLowerCase();
    if (!byKey.has(key)) byKey.set(key, { name, count: 0, pending: true });
  });
  return [
    { name: ALL_COLLECTION, count: items.length, pending: false },
    ...byKey.values(),
  ];
};

/** Returns { ok, name, reason } for a requested new collection name. */
export const validateNewCollection = (rawName, collections = []) => {
  const name = normalizeCollectionName(rawName);
  if (!name) return { ok: false, name, reason: 'Enter a collection name.' };
  if (name.length > 40) return { ok: false, name, reason: 'Use 40 characters or fewer.' };
  if (sameName(name, ALL_COLLECTION)) {
    return { ok: false, name, reason: '"All" is reserved for the full list.' };
  }
  const existing = collections.find((c) => sameName(c.name, name));
  if (existing) return { ok: false, name: existing.name, reason: 'exists' };
  return { ok: true, name };
};

export const isInCollection = (item, collection) =>
  sameName(collection, ALL_COLLECTION) || sameName(folderOf(item), collection);

/** Resolve the collection name to show; falls back to "All" if it no longer exists. */
export const resolveActiveCollection = (active, collections = []) => {
  const match = collections.find((c) => sameName(c.name, active));
  return match ? match.name : ALL_COLLECTION;
};
