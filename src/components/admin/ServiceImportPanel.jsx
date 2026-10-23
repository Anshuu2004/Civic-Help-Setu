import { useState } from 'react';
import { Upload, Download, X, AlertTriangle, CheckCircle2, Copy } from 'lucide-react';
import {
  buildImportPreview,
  csvTemplate,
  MAX_IMPORT_BYTES,
  MAX_IMPORT_ROWS,
} from '../../services/serviceImportService';
import { importAdminServices } from '../../services/adminService';

const cellStyle = { padding: '0.55rem 0.75rem', verticalAlign: 'top' };
const headStyle = { ...cellStyle, fontWeight: '700', color: 'var(--text-tertiary)' };

const Section = ({ title, icon, color, count, children }) => (
  <section style={{ marginTop: '1.25rem' }}>
    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: '700', color, margin: '0 0 0.5rem' }}>
      {icon} {title} ({count})
    </h4>
    <div style={{ border: '1px solid var(--border-light)', borderRadius: '0.6rem', overflow: 'auto', maxHeight: '260px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
        {children}
      </table>
    </div>
  </section>
);

const ServiceImportPanel = ({ existingServices, actorName, onImported, onClose }) => {
  const [fileName, setFileName] = useState('');
  const [report, setReport] = useState(null);
  const [readError, setReadError] = useState('');

  const reset = () => {
    setFileName('');
    setReport(null);
    setReadError('');
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    reset();
    setFileName(file.name);
    if (file.size > MAX_IMPORT_BYTES) {
      setReadError(`"${file.name}" is larger than ${MAX_IMPORT_BYTES / 1024} KB. Split it into smaller files.`);
      return;
    }
    try {
      const text = await file.text();
      setReport(buildImportPreview(text, { fileName: file.name, existingServices }));
    } catch (err) {
      setReadError(`Could not read "${file.name}": ${err.message}`);
    }
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([csvTemplate()], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'service-import-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleConfirm = () => {
    if (!report?.valid.length) return;
    const result = importAdminServices(
      report.valid.map((v) => v.service),
      actorName,
    );
    onImported(result);
    if (result.ok) reset();
  };

  const validCount = report?.valid.length || 0;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.25rem', borderRadius: '0.85rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0 }}>Import services from CSV or JSON</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0' }}>
            Records are checked before anything is saved. Up to {MAX_IMPORT_ROWS} records per file. In CSV, separate
            list values (eligibility, documents, warnings) with <code>|</code>. Steps can only be imported from JSON.
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close import panel" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <X size={18} />
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem', alignItems: 'center' }}>
        <label className="btn btn-primary" style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
          <Upload size={16} /> Choose file
          <input type="file" accept=".csv,.json,text/csv,application/json" onChange={handleFile} style={{ display: 'none' }} />
        </label>
        <button type="button" className="btn btn-secondary" onClick={handleDownloadTemplate} style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <Download size={16} /> Download CSV template
        </button>
        {fileName && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{fileName}</span>}
      </div>

      <div aria-live="polite">
        {readError && <p role="alert" style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '1rem' }}>{readError}</p>}

        {report?.fileErrors.length > 0 && (
          <div role="alert" style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '1rem' }}>
            {report.fileErrors.map((msg) => <p key={msg} style={{ margin: '0.2rem 0' }}>{msg}</p>)}
          </div>
        )}

        {report && report.fileErrors.length === 0 && (
          <p style={{ fontSize: '0.85rem', fontWeight: '600', marginTop: '1rem' }}>
            {report.total} record{report.total === 1 ? '' : 's'} found: {validCount} ready to import,{' '}
            {report.invalid.length} with errors, {report.duplicates.length} duplicate{report.duplicates.length === 1 ? '' : 's'}.
          </p>
        )}
      </div>

      {report?.warnings.length > 0 && (
        <ul style={{ fontSize: '0.8rem', color: '#f59e0b', margin: '0.5rem 0 0', paddingLeft: '1.1rem' }}>
          {report.warnings.map((w) => <li key={w}>{w}</li>)}
        </ul>
      )}

      {validCount > 0 && (
        <Section title="Ready to import" icon={<CheckCircle2 size={15} />} color="#10b981" count={validCount}>
          <thead>
            <tr><th style={headStyle}>Row</th><th style={headStyle}>Name</th><th style={headStyle}>Category</th><th style={headStyle}>ID</th><th style={headStyle}>Notes</th></tr>
          </thead>
          <tbody>
            {report.valid.map(({ row, service, warnings }) => (
              <tr key={`${row}-${service.id}`} style={{ borderTop: '1px solid var(--border-light)' }}>
                <td style={cellStyle}>{row}</td>
                <td style={cellStyle}>{service.name}</td>
                <td style={cellStyle}>{service.category}</td>
                <td style={cellStyle}><code>{service.id}</code></td>
                <td style={{ ...cellStyle, color: '#f59e0b' }}>{warnings.join('; ')}</td>
              </tr>
            ))}
          </tbody>
        </Section>
      )}

      {report?.invalid.length > 0 && (
        <Section title="Errors (will not be imported)" icon={<AlertTriangle size={15} />} color="#ef4444" count={report.invalid.length}>
          <thead>
            <tr><th style={headStyle}>Row</th><th style={headStyle}>Name</th><th style={headStyle}>What to fix</th></tr>
          </thead>
          <tbody>
            {report.invalid.map(({ row, name, errors }) => (
              <tr key={`inv-${row}`} style={{ borderTop: '1px solid var(--border-light)' }}>
                <td style={cellStyle}>{row}</td>
                <td style={cellStyle}>{name || <em>(no name)</em>}</td>
                <td style={cellStyle}>
                  <ul style={{ margin: 0, paddingLeft: '1rem' }}>{errors.map((err) => <li key={err}>{err}</li>)}</ul>
                </td>
              </tr>
            ))}
          </tbody>
        </Section>
      )}

      {report?.duplicates.length > 0 && (
        <Section title="Duplicates (skipped, review before re-importing)" icon={<Copy size={15} />} color="#f59e0b" count={report.duplicates.length}>
          <thead>
            <tr><th style={headStyle}>Row</th><th style={headStyle}>Name</th><th style={headStyle}>Why</th></tr>
          </thead>
          <tbody>
            {report.duplicates.map(({ row, name, reason }) => (
              <tr key={`dup-${row}`} style={{ borderTop: '1px solid var(--border-light)' }}>
                <td style={cellStyle}>{row}</td>
                <td style={cellStyle}>{name}</td>
                <td style={cellStyle}>{reason}</td>
              </tr>
            ))}
          </tbody>
        </Section>
      )}

      {report && report.fileErrors.length === 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button type="button" className="btn btn-secondary" onClick={reset} style={{ fontSize: '0.85rem' }}>
            Clear
          </button>
          <button type="button" className="btn btn-primary" onClick={handleConfirm} disabled={!validCount} style={{ fontSize: '0.85rem' }}>
            {validCount ? `Import ${validCount} service${validCount === 1 ? '' : 's'}` : 'Nothing to import'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ServiceImportPanel;
