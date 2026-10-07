import React, { useState, useRef } from 'react';
import { FileBadge, ShieldCheck, Upload, MoreVertical, CreditCard, Car, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Vault = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState([
    { id: 1, type: 'Aadhaar Card', number: 'XXXX XXXX 1234', verified: true, icon: <FileBadge size={32} />, color: '#10b981' },
    { id: 2, type: 'PAN Card', number: 'ABCDE1234F', verified: true, icon: <CreditCard size={32} />, color: '#3b82f6' },
    { id: 3, type: 'Driving License', number: 'DL-142022019', verified: false, icon: <Car size={32} />, color: '#f59e0b' }
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadSuccess(false);

    // Simulate upload delay and verification
    setTimeout(() => {
      const newDoc = {
        id: Date.now(),
        type: file.name.split('.')[0] || 'Uploaded Document',
        number: 'DOC-' + Math.floor(Math.random() * 1000000),
        verified: false,
        icon: <FileText size={32} />,
        color: 'var(--text-primary)'
      };
      setDocuments([...documents, newDoc]);
      setIsUploading(false);
      setUploadSuccess(true);
      
      setTimeout(() => setUploadSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="section animate-fade-in" style={{ paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              Digital Vault <ShieldCheck color="var(--accent-main)" size={36} />
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
              Securely store and access your civic documents anytime.
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {uploadSuccess && <span style={{ color: 'var(--success, #10b981)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', animation: 'fadeInUp 0.3s forwards' }}><CheckCircle2 size={20} /> Uploaded Successfully</span>}
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
            <button className="btn btn-primary" onClick={handleUploadClick} disabled={isUploading} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
              {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />} 
              {isUploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </div>

        <div className="grid-3">
          {documents.map((doc) => (
            <div key={doc.id} className="card animate-fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: '4rem', height: '4rem', borderRadius: '1rem', background: `var(--glass-bg)`, color: doc.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {doc.icon}
                </div>
                <button style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <MoreVertical size={20} />
                </button>
              </div>
              
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.type}</h3>
                <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontFamily: 'monospace', letterSpacing: '1px' }}>{doc.number}</p>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {doc.verified ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--success, #10b981)', fontSize: '0.875rem', fontWeight: '600' }}>
                    <ShieldCheck size={16} /> Govt. Verified
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-tertiary)', fontSize: '0.875rem', fontWeight: '600' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-tertiary)' }}></div> Pending Verification
                  </span>
                )}
              </div>
            </div>
          ))}

          <div className="card" onClick={handleUploadClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', borderStyle: 'dashed', cursor: 'pointer', minHeight: '240px' }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent-main)'; e.currentTarget.style.background = 'var(--glass-bg-hover)'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-main)'; e.currentTarget.style.background = 'var(--glass-bg-subtle)'; }}
          >
            <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: 'var(--glass-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{isUploading ? 'Uploading...' : 'Add New Document'}</h3>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Vault;
