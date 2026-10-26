// Safe preview adapter for Vault documents.
//
// The Vault currently keeps only metadata (name, type, size) in localStorage;
// file bytes are not stored. A "file provider" is any object with an async
// getFile(doc, { signal }) that resolves to a Blob (or null when there is no
// stored copy) and may reject with an error carrying code 'PERMISSION_DENIED'.
// Nothing in here logs file contents, object URLs or signed URLs.

export const PREVIEWABLE_TYPES = {
  'application/pdf': { label: 'PDF', kind: 'pdf' },
  'image/jpeg': { label: 'JPG', kind: 'image' },
  'image/png': { label: 'PNG', kind: 'image' },
};

export const PREVIEW_TIMEOUT_MS = 8000;

const EXTENSION_TO_MIME = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

const extensionOf = (name = '') => {
  const idx = name.lastIndexOf('.');
  return idx === -1 ? '' : name.slice(idx + 1).toLowerCase();
};

/** MIME type from stored metadata, falling back to the file extension. */
export const resolveMimeType = (doc) => {
  if (!doc) return '';
  if (typeof doc.fileType === 'string' && doc.fileType) return doc.fileType.toLowerCase();
  return EXTENSION_TO_MIME[extensionOf(doc.fileName)] || '';
};

export const isPreviewable = (mime) => Object.prototype.hasOwnProperty.call(PREVIEWABLE_TYPES, mime);

/**
 * Only fields that are actually present are returned, so the UI never shows
 * placeholders for missing metadata.
 */
export const getFileMetadata = (doc) => {
  const items = [];
  if (!doc) return items;
  if (doc.fileName) items.push({ key: 'name', label: 'File name', value: doc.fileName });
  const mime = resolveMimeType(doc);
  if (mime) {
    items.push({ key: 'type', label: 'Type', value: PREVIEWABLE_TYPES[mime]?.label || mime });
  }
  if (doc.fileSize) items.push({ key: 'size', label: 'Size', value: doc.fileSize });
  return items;
};

/** Default provider: the Vault stores no file bytes, so there is no copy to open. */
export const localVaultProvider = {
  async getFile() {
    return null;
  },
};

const withTimeout = (promise, ms, signal) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Object.assign(new Error('timeout'), { code: 'TIMEOUT' })), ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(Object.assign(new Error('aborted'), { code: 'ABORTED' }));
    };
    if (signal) {
      if (signal.aborted) {
        onAbort();
        return;
      }
      signal.addEventListener('abort', onAbort, { once: true });
    }
    promise.then(
      (v) => {
        clearTimeout(timer);
        signal?.removeEventListener('abort', onAbort);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        signal?.removeEventListener('abort', onAbort);
        reject(e);
      }
    );
  });

const isDenied = (err) =>
  Boolean(err) && (err.code === 'PERMISSION_DENIED' || err.status === 401 || err.status === 403);

/**
 * Resolve the preview state for a document. Never rejects and always settles
 * within timeoutMs.
 *
 * status: 'ready' | 'unsupported' | 'denied' | 'unavailable' | 'failed' | 'aborted'
 * 'ready' and 'unsupported' carry the provider's blob.
 */
export const resolvePreview = async (
  doc,
  { provider = localVaultProvider, signal, timeoutMs = PREVIEW_TIMEOUT_MS } = {}
) => {
  if (!doc) return { status: 'unavailable' };
  const mime = resolveMimeType(doc);
  let blob;
  try {
    blob = await withTimeout(
      Promise.resolve().then(() => provider.getFile(doc, { signal })),
      timeoutMs,
      signal
    );
  } catch (err) {
    if (err?.code === 'ABORTED') return { status: 'aborted' };
    if (isDenied(err)) return { status: 'denied' };
    return { status: 'failed' };
  }
  if (!blob) return { status: 'unavailable', mime };
  if (!isPreviewable(mime)) return { status: 'unsupported', mime, blob };
  return { status: 'ready', mime, kind: PREVIEWABLE_TYPES[mime].kind, blob };
};
