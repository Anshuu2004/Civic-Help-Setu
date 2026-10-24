import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MOCK_SERVICES } from '../data/services';
import Checklist from '../components/Checklist';
import SourceCard from '../components/SourceCard';
import EligibilityWizard from '../components/eligibility/EligibilityWizard';
import PrintableChecklistModal from '../components/services/PrintableChecklistModal';
import ShareServiceModal from '../components/services/ShareServiceModal';
import RatingSummaryCard from '../components/services/RatingSummaryCard';
import CitizenReviewsList from '../components/services/CitizenReviewsList';
import ReviewSubmissionModal from '../components/services/ReviewSubmissionModal';
import { reviewStorage } from '../services/reviewStorage';
import FeeBreakdownModal from '../components/services/FeeBreakdownModal';
import EstimatedTimelineWidget from '../components/services/EstimatedTimelineWidget';
import ConcessionEligibilityBadge from '../components/services/ConcessionEligibilityBadge';
import { ArrowLeft, Clock, CreditCard, AlertTriangle, Bookmark, Flag, Zap, CheckCircle2, X, MapPin, Compass, Printer, Share2, Star, Calculator, History, Users, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { submitErrorReport } from '../services/adminService';
import { createApplication } from '../services/trackingService';
import { CIVIC_OFFICES } from '../data/locationOffices';
import CommonRejectionReasonsCard from '../components/services/CommonRejectionReasonsCard';
import ServiceFAQAccordion from '../components/services/ServiceFAQAccordion';
import ServiceChangelogModal from '../components/services/ServiceChangelogModal';
import CommunityAuditBoardModal from '../components/services/CommunityAuditBoardModal';
import CivicFormGeneratorModal from '../components/services/CivicFormGeneratorModal';

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [linkCopied, setLinkCopied] = useState(false);
  
  const [service, setService] = useState(() => MOCK_SERVICES.find(s => s.id === id) || null);
  const [isSaved, setIsSaved] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('civicbridge_saved') || '[]');
      return saved.some(s => s.id === id);
    } catch {
      return false;
    }
  });
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showChangelogModal, setShowChangelogModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showFormGenModal, setShowFormGenModal] = useState(false);
  const [applyStep, setApplyStep] = useState(1); // 1: form, 2: success
  const [generatedAppId, setGeneratedAppId] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reviews, setReviews] = useState(() => reviewStorage.getReviewsForService(id));
  const [reviewAggregate, setReviewAggregate] = useState(() => reviewStorage.getAggregate(id));
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const refreshReviews = () => {
    setReviews(reviewStorage.getReviewsForService(id));
    setReviewAggregate(reviewStorage.getAggregate(id));
  };

  const handleReportInaccuracy = () => {
    if (!service) return;
    setShowReportModal(true);
  };
  const [applyForm, setApplyForm] = useState({ fullName: '', aadhaarNumber: '' });

  useEffect(() => {
    const found = MOCK_SERVICES.find(s => s.id === id);
    setService(found || null);
    try {
      const saved = JSON.parse(localStorage.getItem('civicbridge_saved') || '[]');
      setIsSaved(saved.some(s => s.id === id));
    } catch {
      setIsSaved(false);
    }
  }, [id]);

  const handleCopyLink = async () => {
    const ok = await copyServiceLink(getServiceUrl(id));
    if (ok) {
      toast.success('Service link copied to clipboard.');
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } else {
      toast.error('Could not copy the link. Please copy it from the address bar.');
    }
  };

  const toggleSave = () => {
    if (!service) return;
    let saved = JSON.parse(localStorage.getItem('civicbridge_saved') || '[]');
    if (isSaved) saved = saved.filter(s => s.id !== service.id);
    else saved.push({ id: service.id, name: service.name, category: service.category });
    localStorage.setItem('civicbridge_saved', JSON.stringify(saved));
    setIsSaved(!isSaved);
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    const app = createApplication({
      serviceId: service.id,
      serviceName: service.name,
      category: service.category,
      applicantName: applyForm.fullName || user?.username || 'Citizen Applicant',
      aadhaarId: applyForm.aadhaarNumber,
    });
    setGeneratedAppId(app.id);
    setApplyStep(2);
  };

  if (!service) return (
    <div className="section container" style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Service not found</h2>
      <Link to="/services" className="btn btn-secondary">Return to directory</Link>
    </div>
  );

  return (
    <>
      <div className="section animate-fade-in" style={{ paddingBottom: '6rem' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <Link to="/services" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500', transition: 'color 0.3s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
              <ArrowLeft size={18} /> Back to Services
            </Link>
          </div>

          <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem', position: 'relative', overflow: 'hidden' }}>
            {/* Background Glow */}
            <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, var(--accent-light) 0%, transparent 70%)', zIndex: 0, opacity: 0.5, pointerEvents: 'none' }}></div>
            
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', marginBottom: '2rem' }}>
              <div style={{ flex: '1 1 400px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ padding: '0.25rem 0.75rem', background: 'var(--accent-light)', color: 'var(--accent-main)', borderRadius: '99px', fontSize: '0.875rem', fontWeight: '600' }}>{service.category}</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', fontWeight: '500' }}>{service.type}</span>
                  <button
                    type="button"
                    onClick={() => setShowChangelogModal(true)}
                    style={{
                      padding: '0.2rem 0.65rem',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid var(--border-light)',
                      borderRadius: '99px',
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="View official circulars and government order revisions"
                  >
                    <History size={13} />
                    <span>Circular History</span>
                  </button>
                </div>
                <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '800', lineHeight: '1.2', marginBottom: '1rem' }}>{service.name}</h1>
                <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '600px' }}>{service.shortDescription}</p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flexShrink: 0 }}>
                <button 
                  onClick={() => user ? setShowApplyModal(true) : navigate('/login')}
                  className="btn btn-primary"
                  style={{ padding: '0.85rem 1.75rem', fontSize: '1.05rem', background: 'var(--accent-main)', color: 'var(--bg-main)' }}
                >
                  <Zap size={18} fill="currentColor" />
                  Fast-Track Apply
                </button>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button 
                    onClick={toggleSave}
                    className="btn btn-secondary"
                    style={{ 
                      padding: '0.65rem',
                      fontSize: '0.875rem',
                      background: isSaved ? 'rgba(56, 189, 248, 0.1)' : 'var(--glass-bg)',
                      borderColor: isSaved ? 'var(--accent-main)' : 'var(--border-main)',
                      color: isSaved ? 'var(--accent-main)' : 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                  <button 
                    onClick={() => setShowShareModal(true)}
                    className="btn btn-secondary"
                    style={{ 
                      padding: '0.65rem',
                      fontSize: '0.875rem',
                      background: 'var(--glass-bg)',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem'
                    }}
                    title="Share checklist with family or WhatsApp"
                  >
                    <Share2 size={16} color="var(--accent-main)" />
                    Share
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="btn btn-secondary"
                    aria-label="Copy link to this service page"
                    style={{
                      gridColumn: '1 / -1',
                      padding: '0.65rem',
                      fontSize: '0.875rem',
                      background: 'var(--glass-bg)',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    {linkCopied ? <Check size={16} color="var(--accent-main)" /> : <Link2 size={16} color="var(--accent-main)" />}
                    {linkCopied ? 'Copied' : 'Copy link'}
                  </button>
                  <span className="sr-only" role="status" aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
                    {linkCopied ? 'Link copied to clipboard' : ''}
                  </span>
                </div>
                <button
                  onClick={() => setShowPrintModal(true)}
                  className="btn btn-outline"
                  style={{
                    padding: '0.6rem 1rem',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem'
                  }}
                  title="Generate ink-friendly office visit dossier"
                >
                  <Printer size={16} />
                  <span>Print Visit Dossier</span>
                </button>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    onClick={() => setShowAuditModal(true)}
                    className="btn btn-outline"
                    style={{
                      padding: '0.6rem 1rem',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                      borderColor: 'rgba(239, 68, 68, 0.4)',
                      color: 'var(--text-primary)'
                    }}
                    title="View and report ground-reality discrepancies with community verification"
                  >
                    <Users size={16} color="#ef4444" />
                    <span>Community Audit</span>
                  </button>
                  <button
                    onClick={() => setShowFormGenModal(true)}
                    className="btn btn-outline"
                    style={{
                      padding: '0.6rem 1rem',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem'
                    }}
                    title="Generate pre-filled application or affidavit form"
                  >
                    <FileText size={16} />
                    <span>Generate Form</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid-2" style={{ position: 'relative', zIndex: 1, marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--glass-bg-subtle)', border: '1px solid var(--border-light)', padding: '1.5rem', borderRadius: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <CreditCard size={24} color="var(--accent-main)" />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Expected Fees</h4>
                    <button
                      type="button"
                      onClick={() => setShowFeeModal(true)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent-main)',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: 0
                      }}
                    >
                      <Calculator size={14} />
                      <span>Calculator</span>
                    </button>
                  </div>
                  <p style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{service.fees}</p>
                  <ConcessionEligibilityBadge onOpenCalculator={() => setShowFeeModal(true)} />
                </div>
              </div>
              <div style={{ background: 'var(--glass-bg-subtle)', border: '1px solid var(--border-light)', padding: '1.5rem', borderRadius: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <Clock size={24} color="var(--accent-main)" />
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Processing Time</h4>
                  <p style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)' }}>{service.processingTime}</p>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Statutory citizen charter turnaround</span>
                </div>
              </div>
            </div>

            {/* Estimated Turnaround Milestones */}
            <div style={{ position: 'relative', zIndex: 1, marginBottom: '2.5rem' }}>
              <EstimatedTimelineWidget
                processingTime={service.processingTime}
                onOpenCalculator={() => setShowFeeModal(true)}
              />
            </div>

            {service.warnings && service.warnings.length > 0 && (
              <div style={{ position: 'relative', zIndex: 1, padding: '1.5rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '1rem', marginBottom: '2.5rem' }}>