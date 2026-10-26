import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import FilePreviewPanel, { PreviewStateView } from './FilePreviewPanel';

const doc = { id: '1', type: 'PAN Card', fileName: 'pan.pdf', fileType: 'application/pdf', fileSize: '280 KB' };
const view = (preview, url = 'blob:test', d = doc) => renderToStaticMarkup(<PreviewStateView doc={d} preview={preview} url={url} />);

describe('PreviewStateView', () => {
  it('shows a pdf preview in a sandboxed iframe with download and open links', () => {
    const html = view({ status: 'ready', kind: 'pdf' });
    expect(html).toContain('<iframe');
    expect(html).toContain('sandbox=""');
    expect(html).toContain('download="pan.pdf"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('shows an image preview with alt text', () => {
    expect(view({ status: 'ready', kind: 'image' })).toContain('alt="Preview of pan.pdf"');
  });

  it('gives unsupported files a download/open fallback instead of a preview', () => {
    const html = view({ status: 'unsupported' });
    expect(html).toContain('preview is not available for this file type');
    expect(html).toContain('Download file');
    expect(html).not.toContain('<iframe');
  });

  it('renders distinct loading, unavailable, denied and failed states', () => {
    const loading = view({ status: 'loading' });
    const unavailable = view({ status: 'unavailable' });
    const denied = view({ status: 'denied' });
    const failed = view({ status: 'failed' });
    expect(loading).toContain('Loading preview');
    expect(unavailable).toContain('No stored copy');
    expect(denied).toContain('do not have permission');
    expect(failed).toContain('could not be loaded');
    expect(new Set([loading, unavailable, denied, failed]).size).toBe(4);
    expect(denied).toContain('role="alert"');
    expect(unavailable).not.toContain('href=');
  });
});

describe('FilePreviewPanel', () => {
  it('shows only the metadata that exists', () => {
    const html = renderToStaticMarkup(<FilePreviewPanel doc={{ ...doc, fileSize: '' }} />);
    expect(html).toContain('pan.pdf');
    expect(html).toContain('PDF');
    expect(html).not.toContain('Size');
  });

  it('renders nothing for a document without an attached file', () => {
    expect(renderToStaticMarkup(<FilePreviewPanel doc={{ id: '2', type: 'Note' }} />)).toBe('');
  });
});
