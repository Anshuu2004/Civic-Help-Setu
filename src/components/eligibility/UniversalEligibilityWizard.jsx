import { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Bookmark,
  ExternalLink,
  ChevronRight,
  FileCheck,
} from 'lucide-react';
import { evaluateAllSchemes, saveAssessment } from '../../services/assessmentStorage';
import { useToast } from '../../context/ToastContext';
import { Link } from 'react-router-dom';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Gujarat', 'Haryana',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha',
  'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
];

const UniversalEligibilityWizard = ({
  onAssessmentSaved = () => {},
}) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  // Form State
  const [profile, setProfile] = useState({
    age: 26,
    annualIncome: 180000,
    employment: 'salaried',
    category: 'OBC',
    state: 'Maharashtra',
    isStudent: false,
    ownsAgriculturalLand: false,
    hasAadhaar: true,
    hasPan: true,
    hasLearnerLicense: false,
    hasIncomeCertificate: false,
  });

  const [evaluations, setEvaluations] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isSaved, setIsSaved] = useState(false);

  const handleRunEvaluation = () => {
    const results = evaluateAllSchemes(profile);
    setEvaluations(results);
    setStep(3);
    setIsSaved(false);
  };

  const handleSaveToProfile = () => {
    if (!evaluations) return;
    saveAssessment(profile, evaluations);
    setIsSaved(true);
    toast.success('Eligibility assessment record saved to your profile!');
    onAssessmentSaved();
  };

  const handleReset = () => {
    setStep(1);
    setEvaluations(null);
    setIsSaved(false);
  };

  return (
    <div
      className="card animate-fade-in"
      style={{
        padding: '2rem',
        borderRadius: '1.25rem',
        background: 'var(--glass-bg)',
        border: '1px solid var(--border-main)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Progress header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-main)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Interactive Civic Wizard
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0.2rem 0 0' }}>
            {step === 1 && 'Step 1: Demographic & Income Profile'}
            {step === 2 && 'Step 2: Assets, Occupation & Held Documents'}
            {step === 3 && 'Assessment Results & Scheme Recommendations'}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                fontWeight: '700',
                background: step === s ? 'var(--accent-main)' : step > s ? 'rgba(16, 185, 129, 0.2)' : 'var(--glass-bg)',
                color: step === s ? 'var(--bg-main)' : step > s ? '#10b981' : 'var(--text-tertiary)',
                border: step === s ? '1px solid var(--accent-main)' : '1px solid var(--border-light)',
              }}
            >
              {step > s ? '✓' : s}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: Basic Demographics */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem' }}>
                Applicant Age (Years) *
              </label>
              <input
                type="number"
                min="1"
                max="110"
                className="input-field"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
                style={{ width: '100%' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem' }}>
                Annual Family Income (₹ INR) *
              </label>
              <input
                type="number"
                step="10000"
                min="0"
                className="input-field"
                value={profile.annualIncome}
                onChange={(e) => setProfile({ ...profile, annualIncome: Number(e.target.value) })}
                style={{ width: '100%' }}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.2rem', display: 'block' }}>
                ₹{(profile.annualIncome || 0).toLocaleString('en-IN')} / year
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem' }}>
                Primary Occupation / Status
              </label>
              <select
                className="input-field"
                value={profile.employment}
                onChange={(e) => setProfile({ ...profile, employment: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="salaried">Salaried (Private / Govt)</option>
                <option value="self-employed">Self-Employed / Trader</option>
                <option value="farmer">Farmer / Agriculturalist</option>
                <option value="student">Student / Research Scholar</option>
                <option value="unemployed">Currently Seeking Employment</option>
                <option value="homemaker">Homemaker</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem' }}>
                Social Category (Reservation / Welfare Quota)
              </label>
              <select
                className="input-field"
                value={profile.category}
                onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="General">General / Open</option>
                <option value="EWS">Economically Weaker Section (EWS)</option>
                <option value="OBC">Other Backward Class (OBC)</option>
                <option value="SC">Scheduled Caste (SC)</option>
                <option value="ST">Scheduled Tribe (ST)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem' }}>
                State / Union Territory of Residence
              </label>
              <select
                className="input-field"
                value={profile.state}
                onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                style={{ width: '100%' }}
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setStep(2)}
              style={{ padding: '0.65rem 1.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span>Continue to Prerequisite Check</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Attributes and Documents */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
            Check the credentials and circumstances that apply to you. This enables exact matching across all central and state welfare rules.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {[
              { key: 'hasAadhaar', label: 'Have Aadhaar card with mobile linked' },
              { key: 'hasPan', label: 'Hold valid PAN Card' },
              { key: 'hasLearnerLicense', label: 'Hold valid Learner License for 30+ days' },
              { key: 'hasIncomeCertificate', label: 'Have valid Tehsildar Income Certificate' },
              { key: 'ownsAgriculturalLand', label: 'Own cultivable agricultural land (Khatauni / Patta)' },
              { key: 'isStudent', label: 'Currently enrolled student in college/institute' },
            ].map(({ key, label }) => {
              const checked = Boolean(profile[key]);
              return (
                <div
                  key={key}
                  onClick={() => setProfile({ ...profile, [key]: !checked })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    borderRadius: '0.75rem',
                    background: checked ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    border: checked ? '1px solid var(--accent-main)' : '1px solid var(--border-light)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {}}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-main)' }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: checked ? '700' : '500', color: 'var(--text-primary)' }}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStep(1)}
              style={{ padding: '0.65rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleRunEvaluation}
              style={{ padding: '0.65rem 1.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Sparkles size={16} />
              <span>Evaluate My Eligibility</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Results and Recommendations */}
      {step === 3 && evaluations && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top action row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['all', 'eligible', 'conditional', 'ineligible'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilterStatus(f)}
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: '99px',
                    border: filterStatus === f ? '1px solid var(--accent-main)' : '1px solid var(--border-light)',
                    background: filterStatus === f ? 'rgba(56, 189, 248, 0.2)' : 'var(--glass-bg)',
                    color: filterStatus === f ? 'var(--accent-main)' : 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {f === 'all' ? `All Schemes (${evaluations.length})` : f}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveToProfile}
                disabled={isSaved}
                style={{ padding: '0.45rem 1.15rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Bookmark size={15} />
                <span>{isSaved ? 'Saved to Profile' : 'Save Assessment to Profile'}</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleReset}
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <RotateCcw size={14} /> Re-check
              </button>
            </div>
          </div>

          {/* Evaluations list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {evaluations
              .filter((ev) => filterStatus === 'all' || ev.status === filterStatus)
              .map((ev) => {
                const isEligible = ev.status === 'eligible';
                const isConditional = ev.status === 'conditional';

                return (
                  <div
                    key={ev.schemeId}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '0.85rem',
                      background: 'var(--glass-bg)',
                      border: isEligible
                        ? '1px solid rgba(16, 185, 129, 0.35)'
                        : isConditional
                        ? '1px solid rgba(245, 158, 11, 0.35)'
                        : '1px solid var(--border-light)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: '700' }}>
                            {ev.category}
                          </span>
                        </div>
                        <h3 style={{ margin: '0.2rem 0', fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                          {ev.schemeName}
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {ev.benefit}
                        </p>
                      </div>

                      <span
                        style={{
                          padding: '0.3rem 0.75rem',
                          borderRadius: '99px',
                          fontSize: '0.78rem',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: isEligible
                            ? 'rgba(16, 185, 129, 0.15)'
                            : isConditional
                            ? 'rgba(245, 158, 11, 0.15)'
                            : 'rgba(239, 68, 68, 0.15)',
                          color: isEligible ? '#10b981' : isConditional ? '#f59e0b' : '#ef4444',
                        }}
                      >
                        {isEligible && <CheckCircle2 size={14} />}
                        {isConditional && <AlertTriangle size={14} />}
                        {!isEligible && !isConditional && <XCircle size={14} />}
                        <span>{ev.status}</span>
                      </span>
                    </div>

                    <div
                      style={{
                        padding: '0.75rem 0.95rem',
                        borderRadius: '0.5rem',
                        background: 'rgba(0, 0, 0, 0.2)',
                        fontSize: '0.85rem',
                        lineHeight: '1.5',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <strong>Verdict:</strong> {ev.reason}
                    </div>

                    {/* Missing prerequisites if conditional */}
                    {ev.missingPrerequisites && ev.missingPrerequisites.length > 0 && (
                      <div style={{ fontSize: '0.8rem', color: '#f59e0b' }}>
                        <strong>Action Needed:</strong> {ev.missingPrerequisites.join(', ')}
                      </div>
                    )}

                    {/* Required documents if eligible */}
                    {ev.requiredDocuments && ev.requiredDocuments.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', fontSize: '0.78rem' }}>
                        <span style={{ color: 'var(--text-tertiary)', fontWeight: '600' }}>Mandatory Documents:</span>
                        {ev.requiredDocuments.map((doc, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              background: 'rgba(56, 189, 248, 0.1)',
                              color: 'var(--accent-main)',
                            }}
                          >
                            {doc}
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid var(--border-light)' }}>
                      <Link
                        to={ev.actionLink || '/services'}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <span>View Application Steps</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversalEligibilityWizard;
