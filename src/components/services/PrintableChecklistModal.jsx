import React, { useState } from 'react';
import { X, Printer, CheckSquare, Square, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

const PrintableChecklistModal = ({ isOpen, onClose, service }) => {
  const [checkedItems, setCheckedItems] = useState({});

  if (!isOpen || !service) return null;

  const toggleCheck = (idx) => {
    setCheckedItems(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const documents = service.documents || [
    'Valid Identity Proof (Aadhaar / Voter ID / Passport)',
    'Valid Address Proof (Electricity Bill / Rent Agreement)',
    'Proof of Date of Birth (Birth Certificate / Class 10th Certificate)',
    'Passport-size photographs with plain white background (x3)',
    'Self-declaration affidavit (if applicable)'
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="print-modal-title"
    >
      <div
        className="card-glass animate-fade-in print-dossier-card"
        style={{
          width: '100%',
          maxWidth: '720px',
          borderRadius: '1.25rem',
          background: 'var(--bg-card, #111827)',
          border: '1px solid var(--border-light, rgba(255, 255, 255, 0.1))',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--glass-bg)'
          }}
          className="no-print"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '0.75rem',
                background: 'rgba(56, 189, 248, 0.15)',
                color: 'var(--accent-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <h2 id="print-modal-title" style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Physical Office Visit Dossier
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Ink-friendly checklist formatted for physical counter verification.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handlePrint}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', fontSize: '0.875rem' }}
            >
              <Printer size={16} />
              <span>Print Dossier</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '0.5rem'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Dossier Printable Body */}
        <div 
          className="print-content"
          style={{ padding: '2rem', overflowY: 'auto', flex: 1, color: 'var(--text-primary)' }}
        >
          {/* Header Badge in print */}
          <div style={{ borderBottom: '2px solid var(--accent-main)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  CIVIC HELP SETU • VERIFICATION DOSSIER
                </span>
                <h1 style={{ fontSize: '1.65rem', fontWeight: '800', marginTop: '0.25rem', color: 'var(--text-primary)' }}>
                  {service.name}
                </h1>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Department / Authority: {service.category} • Expected Fee: {service.fees}
                </p>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <div>Date: {new Date().toLocaleDateString()}</div>
                <div>Status: Self-Attestation Required</div>
              </div>
            </div>
          </div>

          {/* Section 1: Required Physical Documents */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              1. Required Documents Checklist (Carry Original + 2 Photocopies Each)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {documents.map((doc, idx) => {
                const isChecked = !!checkedItems[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleCheck(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.6rem 0.85rem',
                      background: 'var(--glass-bg-subtle)',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      border: '1px solid var(--border-light)'
                    }}
                  >
                    {isChecked ? (
                      <CheckSquare size={18} color="var(--accent-main)" />
                    ) : (
                      <Square size={18} color="var(--text-secondary)" />
                    )}
                    <span style={{ fontSize: '0.9rem', textDecoration: isChecked ? 'line-through' : 'none', color: isChecked ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                      {doc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Physical Counter Verification Instructions */}
          <div style={{ marginBottom: '1.75rem', padding: '1rem', background: 'var(--glass-bg)', borderRadius: '0.75rem', border: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-main)' }}>
              <AlertCircle size={16} />
              <span>Counter Verification Protocol</span>
            </h3>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem', lineHeight: '1.5' }}>
              <li><strong>Self-Attestation:</strong> Sign your name with date in blue ink across the bottom of each photocopy.</li>
              <li><strong>Photographs:</strong> 3 color passport photos with plain white background (no caps/goggles).</li>
              <li><strong>Fee Payment:</strong> Carry exact cash or debit card for the government counter challan.</li>
              <li><strong>Originals Check:</strong> Keep originals in a separate transparent folder so they are not accidentally handed over.</li>
            </ul>
          </div>

          {/* Section 3: Applicant Counter Log (For handwritten notes) */}
          <div style={{ borderTop: '1px dashed var(--border-light)', paddingTop: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Applicant Counter Field Notes (Fill in at Office)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1.5rem' }}>
                Counter Number: ________
              </div>
              <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1.5rem' }}>
                Token / Queue ID: ________
              </div>
              <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1.5rem' }}>
                Officer Name: ________
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintableChecklistModal;
