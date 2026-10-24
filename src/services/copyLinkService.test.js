import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { copyServiceLink } from './copyLinkService';

const makeDocument = (execResult = true) => {
  const area = { setAttribute: vi.fn(), select: vi.fn(), remove: vi.fn(), style: {} };
  return {
    area,
    doc: {
      createElement: vi.fn(() => area),
      body: { appendChild: vi.fn() },
      execCommand: vi.fn(() => execResult),
    },
  };
};

describe('copyServiceLink', () => {
  beforeEach(() => vi.unstubAllGlobals());
  afterEach(() => vi.unstubAllGlobals());

  it('copies with the Clipboard API', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    expect(await copyServiceLink('http://x/services/a')).toBe(true);
    expect(writeText).toHaveBeenCalledWith('http://x/services/a');
  });

  it('falls back to execCommand when the clipboard rejects', async () => {
    const { doc, area } = makeDocument(true);
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } });
    vi.stubGlobal('document', doc);
    expect(await copyServiceLink('abc')).toBe(true);
    expect(doc.execCommand).toHaveBeenCalledWith('copy');
    expect(area.remove).toHaveBeenCalled();
  });

  it('falls back to execCommand when the clipboard is missing', async () => {
    const { doc } = makeDocument(true);
    vi.stubGlobal('navigator', {});
    vi.stubGlobal('document', doc);
    expect(await copyServiceLink('abc')).toBe(true);
  });

  it('returns false when both methods fail', async () => {
    const { doc, area } = makeDocument(false);
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('no')) } });
    vi.stubGlobal('document', doc);
    expect(await copyServiceLink('abc')).toBe(false);
    expect(area.remove).toHaveBeenCalled();
  });

  it('returns false for empty text', async () => {
    expect(await copyServiceLink('')).toBe(false);
  });
});
