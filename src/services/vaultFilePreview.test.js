import { describe, it, expect } from 'vitest';
import {
  getFileMetadata,
  resolveMimeType,
  resolvePreview,
  localVaultProvider,
} from './vaultFilePreview';

const pdfDoc = { id: '1', type: 'PAN', fileName: 'pan.pdf', fileType: 'application/pdf', fileSize: '280 KB' };
const blob = new Blob(['x'], { type: 'application/pdf' });

describe('getFileMetadata', () => {
  it('lists name, type and size when present', () => {
    expect(getFileMetadata(pdfDoc).map((i) => [i.key, i.value])).toEqual([
      ['name', 'pan.pdf'],
      ['type', 'PDF'],
      ['size', '280 KB'],
    ]);
  });

  it('omits fields that are missing', () => {
    expect(getFileMetadata({ fileName: 'scan' })).toEqual([{ key: 'name', label: 'File name', value: 'scan' }]);
    expect(getFileMetadata({})).toEqual([]);
  });

  it('infers type from the extension when no MIME type is stored', () => {
    expect(resolveMimeType({ fileName: 'a.JPG' })).toBe('image/jpeg');
    expect(resolveMimeType({ fileName: 'a.docx' })).toBe('');
  });
});

describe('resolvePreview', () => {
  it('is ready for a supported type with content', async () => {
    const r = await resolvePreview(pdfDoc, { provider: { getFile: async () => blob } });
    expect(r.status).toBe('ready');
    expect(r.kind).toBe('pdf');
  });

  it('marks unsupported types and keeps the blob for download', async () => {
    const doc = { fileName: 'a.docx', fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
    const r = await resolvePreview(doc, { provider: { getFile: async () => blob } });
    expect(r.status).toBe('unsupported');
    expect(r.blob).toBe(blob);
  });

  it('is unavailable when the provider has no stored copy (default provider)', async () => {
    expect((await resolvePreview(pdfDoc)).status).toBe('unavailable');
    expect(await localVaultProvider.getFile()).toBeNull();
  });

  it('reports permission denied distinctly', async () => {
    const denied = Object.assign(new Error('no'), { code: 'PERMISSION_DENIED' });
    expect((await resolvePreview(pdfDoc, { provider: { getFile: async () => { throw denied; } } })).status).toBe('denied');
    const http = Object.assign(new Error('no'), { status: 403 });
    expect((await resolvePreview(pdfDoc, { provider: { getFile: async () => { throw http; } } })).status).toBe('denied');
  });

  it('reports other provider errors as failed', async () => {
    const r = await resolvePreview(pdfDoc, { provider: { getFile: async () => { throw new Error('boom'); } } });
    expect(r.status).toBe('failed');
  });

  it('fails instead of loading forever when the provider hangs', async () => {
    const r = await resolvePreview(pdfDoc, { provider: { getFile: () => new Promise(() => {}) }, timeoutMs: 20 });
    expect(r.status).toBe('failed');
  });

  it('resolves as aborted when cancelled', async () => {
    const controller = new AbortController();
    const p = resolvePreview(pdfDoc, { provider: { getFile: () => new Promise(() => {}) }, signal: controller.signal });
    controller.abort();
    expect((await p).status).toBe('aborted');
  });
});
