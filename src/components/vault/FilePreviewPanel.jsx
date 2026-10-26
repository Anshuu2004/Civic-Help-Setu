import { useEffect, useState } from 'react';
import { FileText, Download, ExternalLink, Loader2, Lock, AlertTriangle, FileQuestion } from 'lucide-react';
import { getFileMetadata, resolvePreview } from '../../services/vaultFilePreview';

const FileActions = ({ url, name }) => (
  <div className="vault-preview-actions">
    <a className="btn btn-primary" href={url} download={name}>
      <Download size={16} aria-hidden="true" /> Download file
    </a>
    <a className="btn" href={url} target="_blank" rel="noopener noreferrer">
      <ExternalLink size={16} aria-hidden="true" /> Open in new tab
    </a>
  </div>
);

/** Presentational part: renders one preview state. `url` is a temporary object URL. */
export const PreviewStateView = ({ doc, preview, url }) => {
  const status = preview.status;
  const name = doc.fileName || doc.type;

  if (status === 'loading') {
    return (
      <p className="vault-preview-state" role="status">
        <Loader2 size={16} className="vault-preview-spin" aria-hidden="true" /> Loading preview...
      </p>
    );
  }
  if (status === 'denied') {
    return (
      <p className="vault-preview-state vault-preview-state--error" role="alert">
        <Lock size={16} aria-hidden="true" /> You do not have permission to open this file.
      </p>
    );
  }
  if (status === 'failed') {
    return (
      <p className="vault-preview-state vault-preview-state--error" role="alert">
        <AlertTriangle size={16} aria-hidden="true" /> The preview could not be loaded. Please try again later.
      </p>
    );
  }
  if (status === 'unavailable') {
    return (
      <p className="vault-preview-state" role="status">
        <FileQuestion size={16} aria-hidden="true" /> No stored copy of this file is available to preview or
        download. Only its details are saved in this Vault.
      </p>
    );
  }
  if (status === 'unsupported') {
    return (
      <div className="vault-preview-state" role="status">
        <p>
          <FileQuestion size={16} aria-hidden="true" /> A preview is not available for this file type. Open or
          download it instead.
        </p>
        <FileActions url={url} name={name} />
      </div>
    );
  }
  if (status === 'ready') {
    return (
      <div className="vault-preview-ready">
        {preview.kind === 'image' ? (
          <img className="vault-preview-media" src={url} alt={`Preview of ${name}`} />
        ) : (
          <iframe className="vault-preview-media vault-preview-frame" src={url} title={`Preview of ${name}`} sandbox="" />
        )}
        <FileActions url={url} name={name} />
      </div>
    );
  }
  return null;
};

const FilePreviewPanel = ({ doc, provider }) => {
  const [loaded, setLoaded] = useState({ doc: null, preview: null, url: '' });
  const hasFile = Boolean(doc && (doc.fileName || doc.fileType));

  useEffect(() => {
    if (!hasFile) return undefined;
    const controller = new AbortController();
    let objectUrl = '';
    resolvePreview(doc, { provider, signal: controller.signal }).then(({ blob, ...result }) => {
      if (controller.signal.aborted || result.status === 'aborted') return;
      if (blob) objectUrl = URL.createObjectURL(blob);
      setLoaded({ doc, preview: result, url: objectUrl });
    });
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [doc, provider, hasFile]);

  if (!hasFile) return null;
  // Loading is derived: anything not yet resolved for the current doc is loading.
  const isCurrent = loaded.doc === doc;
  const preview = isCurrent ? loaded.preview : { status: 'loading' };
  const url = isCurrent ? loaded.url : '';
  const metadata = getFileMetadata(doc);

  return (
    <section className="vault-preview" aria-labelledby="vault-preview-heading">
      <h3 id="vault-preview-heading" className="vault-preview-heading">
        <FileText size={16} aria-hidden="true" /> Attached file
      </h3>
      {metadata.length > 0 && (
        <dl className="vault-preview-meta">
          {metadata.map((item) => (
            <div key={item.key} className="vault-preview-meta-row">
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      )}
      <PreviewStateView doc={doc} preview={preview} url={url} />
    </section>
  );
};

export default FilePreviewPanel;
