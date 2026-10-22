import { useState } from 'react';
import AccessibleModal from '../common/AccessibleModal';
import {
  Calendar,
  Clock,
  User,
  Phone,
  FileCheck,
  CheckCircle2,
  Printer,
  ShieldCheck,
  Copy,
  Building,
} from 'lucide-react';
import { bookOfficeAppointment } from '../../services/locationService';
import { useToast } from '../../context/ToastContext';

const AppointmentModal = ({
  isOpen,
  onClose,
  office,
  prefilledService = '',
}) => {
  const { toast } = useToast();
  const [applicantName, setApplicantName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [selectedService, setSelectedService] = useState(prefilledService || '');
  const [appointmentDate, setAppointmentDate] = useState(() => {
    // Default to tomorrow
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 11:30 AM (Morning)');
  const [confirmedToken, setConfirmedToken] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeSlots = [
    '09:30 AM - 11:00 AM (Morning)',
    '11:00 AM - 12:30 PM (Mid-Day)',
    '02:00 PM - 03:30 PM (Afternoon)',
    '03:30 PM - 05:00 PM (Late Afternoon)',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!applicantName.trim()) {
      toast?.warning?.('Please enter your full name as per identity documents.');
      return;
    }
    if (!contactNumber.trim() || contactNumber.length < 10) {
      toast?.warning?.('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const booked = bookOfficeAppointment({
        officeId: office?.id || 'office-default',
        officeName: office?.name || 'Civic Center',
        serviceName: selectedService || 'General Inquiry & Document Submission',
        applicantName: applicantName.trim(),
        contactNumber: contactNumber.trim(),
        appointmentDate,
        timeSlot,
      });

      setConfirmedToken(booked);
      setIsSubmitting(false);
      toast?.success?.(
        `Appointment token ${booked.tokenNumber} reserved successfully.`,
        'Token Confirmed'
      );
    }, 600);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleResetAndClose = () => {
    setConfirmedToken(null);
    setApplicantName('');
    setContactNumber('');
    onClose();
  };

  if (!office) return null;

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title={confirmedToken ? 'Citizen Electronic Visit Pass' : 'Schedule Office Visit & Token'}
      subtitle={
        confirmedToken
          ? 'Show this digital token at the reception desk or kiosk on arrival.'
          : `${office.name} • ${office.city}`
      }
      maxWidth="540px"
    >
      {confirmedToken ? (
        /* Confirmed Token Screen */
        <div className="animate-fade-in" style={{ padding: '0.5rem 0' }}>
          <div
            style={{
              textAlign: 'center',
              padding: '1.5rem',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                padding: '0.6rem',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#10b981',
                marginBottom: '0.5rem',
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <span
              style={{
                display: 'block',
                fontSize: '0.8rem',
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: '700',
              }}
            >
              Appointment Reference Token
            </span>
            <div
              style={{
                fontSize: '2rem',
                fontWeight: '900',
                color: 'var(--accent-main)',
                fontFamily: 'monospace',
                letterSpacing: '2px',
                margin: '0.25rem 0',
              }}
            >
              {confirmedToken.tokenNumber}
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Reserved for <strong>{confirmedToken.applicantName}</strong>
            </p>
          </div>

          {/* Details List */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              fontSize: '0.875rem',
              background: 'var(--glass-bg)',
              padding: '1rem 1.25rem',
              borderRadius: '0.75rem',
              border: '1px solid var(--border-light)',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-tertiary)' }}>Center:</span>
              <span style={{ fontWeight: '600', color: 'var(--text-primary)', textAlign: 'right' }}>
                {office.name}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-tertiary)' }}>Service:</span>
              <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                {confirmedToken.serviceName}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-tertiary)' }}>Date & Slot:</span>
              <span style={{ fontWeight: '600', color: 'var(--accent-main)' }}>
                {confirmedToken.appointmentDate} • {confirmedToken.timeSlot}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-tertiary)' }}>Contact Mobile:</span>
              <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                {confirmedToken.contactNumber}
              </span>
            </div>
          </div>

          {/* Guidelines Checklist */}
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '0.6rem',
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.5',
              marginBottom: '1.5rem',
            }}
          >
            <strong style={{ color: 'var(--accent-main)', display: 'block', marginBottom: '0.25rem' }}>
              Important Visit Instructions:
            </strong>
            • Carry original identity proofs and 2 passport-size photographs.
            <br />
            • Arrive 15 minutes before your scheduled window to scan your token.
            <br />• Senior citizens and persons with disability can report directly to Counter 1.
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-secondary"
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
            >
              <Printer size={16} /> Print Token
            </button>
            <button
              type="button"
              onClick={handleResetAndClose}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              Done & Return
            </button>
          </div>
        </div>
      ) : (
        /* Booking Form */
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* Office Summary Banner */}
          <div
            style={{
              padding: '0.75rem 1rem',
              background: 'rgba(0, 0, 0, 0.15)',
              borderRadius: '0.6rem',
              border: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.85rem',
            }}
          >
            <Building size={18} color="var(--accent-main)" />
            <div>
              <span style={{ fontWeight: '600', color: 'var(--text-primary)', display: 'block' }}>
                {office.name}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {office.address}
              </span>
            </div>
          </div>

          {/* Applicant Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              Applicant Full Name *
            </label>
            <div style={{ position: 'relative' }}>
              <User
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-tertiary)',
                }}
              />
              <input
                type="text"
                required
                placeholder="As per Government ID (Aadhaar / Voter ID)"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.5rem', width: '100%', borderRadius: '0.5rem' }}
              />
            </div>
          </div>

          {/* Contact Mobile */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              10-Digit Mobile Number *
            </label>
            <div style={{ position: 'relative' }}>
              <Phone
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-tertiary)',
                }}
              />
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="e.g. 9876543210"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, ''))}
                className="input-field"
                style={{ paddingLeft: '2.5rem', width: '100%', borderRadius: '0.5rem' }}
              />
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.2rem', display: 'block' }}>
              SMS confirmation and visit reminders will be sent to this number.
            </span>
          </div>

          {/* Service Purpose Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              Purpose of Visit / Service
            </label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="input-field"
              style={{ width: '100%', borderRadius: '0.5rem', padding: '0.55rem' }}
            >
              <option value="">General Document Submission & Verification</option>
              {office.serviceIds?.map((sId) => (
                <option key={sId} value={sId.replace(/-/g, ' ')}>
                  {sId.replace(/-/g, ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Preferred Date & Time Slot Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                Preferred Date *
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="input-field"
                style={{ width: '100%', borderRadius: '0.5rem', padding: '0.5rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                Time Window
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="input-field"
                style={{ width: '100%', borderRadius: '0.5rem', padding: '0.5rem' }}
              >
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{
                flex: 2,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
            >
              <Calendar size={16} />
              {isSubmitting ? 'Reserving Token...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      )}
    </AccessibleModal>
  );
};

export default AppointmentModal;
