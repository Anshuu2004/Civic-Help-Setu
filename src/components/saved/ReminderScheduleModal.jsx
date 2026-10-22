import { useState, useEffect } from 'react';
import AccessibleModal from '../common/AccessibleModal';
import {
  Bell,
  Calendar,
  Download,
  Trash2,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import {
  saveReminder,
  deleteReminder,
  getReminderByServiceId,
  downloadCalendarFile,
  calculateDaysRemaining,
} from '../../services/reminderNotificationService';
import { useToast } from '../../context/ToastContext';

const ReminderScheduleModal = ({
  isOpen,
  onClose,
  service,
  onReminderUpdated = () => {},
}) => {
  const { toast } = useToast();
  const [reminderType, setReminderType] = useState('renewal');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [reminderNote, setReminderNote] = useState('');
  const [leadDays, setLeadDays] = useState(7);
  const [existingReminder, setExistingReminder] = useState(null);

  useEffect(() => {
    if (service?.id) {
      const found = getReminderByServiceId(service.id);
      setExistingReminder(found);
      if (found) {
        setReminderType(found.reminderType || 'renewal');
        setDeadlineDate(found.deadlineDate || '');
        setReminderNote(found.reminderNote || '');
        setLeadDays(found.leadDays || 7);
      } else {
        // Default deadline to 30 days ahead
        const future = new Date();
        future.setDate(future.getDate() + 30);
        setDeadlineDate(future.toISOString().split('T')[0]);
        setReminderNote('');
        setLeadDays(7);
      }
    }
  }, [service, isOpen]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!deadlineDate) {
      toast?.warning?.('Please select a deadline or target submission date.');
      return;
    }

    const saved = saveReminder({
      serviceId: service.id,
      serviceName: service.name,
      reminderType,
      deadlineDate,
      reminderNote: reminderNote.trim(),
      leadDays,
    });

    toast?.success?.(
      `Reminder scheduled for ${service.name}. Alert set ${leadDays} days before.`,
      'Reminder Saved'
    );
    onReminderUpdated(saved);
    onClose();
  };

  const handleDelete = () => {
    deleteReminder(service.id);
    toast?.info?.(`Reminder removed for ${service.name}.`);
    onReminderUpdated(null);
    onClose();
  };

  const handleExportICS = () => {
    if (!deadlineDate) {
      toast?.warning?.('Set a deadline date first before exporting.');
      return;
    }
    downloadCalendarFile(service.name, deadlineDate, reminderNote);
    toast?.success?.('Calendar event (.ics) downloaded.', 'Export Successful');
  };

  const daysLeft = calculateDaysRemaining(deadlineDate);

  if (!service) return null;

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Set Service Deadline & Reminder"
      subtitle={`Configure renewal reminders and submission targets for ${service.name}`}
      maxWidth="520px"
    >
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Days Left Notice Banner */}
        {daysLeft != null && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.6rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.85rem',
              background: daysLeft <= 7 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(56, 189, 248, 0.1)',
              border: `1px solid ${daysLeft <= 7 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`,
              color: daysLeft <= 7 ? '#ef4444' : 'var(--accent-main)',
            }}
          >
            <Clock size={16} />
            <span>
              {daysLeft > 0 ? (
                <strong>{daysLeft} days remaining</strong>
              ) : daysLeft === 0 ? (
                <strong>Due today!</strong>
              ) : (
                <strong>{Math.abs(daysLeft)} days overdue!</strong>
              )}{' '}
              until scheduled date.
            </span>
          </div>
        )}

        {/* Reminder Type Select */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
            Reminder Category
          </label>
          <select
            value={reminderType}
            onChange={(e) => setReminderType(e.target.value)}
            className="input-field"
            style={{ width: '100%', borderRadius: '0.5rem', padding: '0.55rem' }}
          >
            <option value="renewal">License / Certificate Periodic Renewal</option>
            <option value="submission">Application Submission Target</option>
            <option value="document_expiry">Supporting Document Expiry Check</option>
            <option value="followup">Department Follow-up</option>
          </select>
        </div>

        {/* Deadline Date */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
            Target Deadline Date *
          </label>
          <input
            type="date"
            required
            value={deadlineDate}
            onChange={(e) => setDeadlineDate(e.target.value)}
            className="input-field"
            style={{ width: '100%', borderRadius: '0.5rem', padding: '0.55rem' }}
          />
        </div>

        {/* Notification Lead Days */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
            Advance Warning Notification
          </label>
          <select
            value={leadDays}
            onChange={(e) => setLeadDays(Number(e.target.value))}
            className="input-field"
            style={{ width: '100%', borderRadius: '0.5rem', padding: '0.55rem' }}
          >
            <option value={1}>1 day before target date</option>
            <option value={3}>3 days before target date</option>
            <option value={7}>7 days before target date (Recommended)</option>
            <option value={14}>14 days before target date</option>
            <option value={30}>30 days before target date (Annual renewals)</option>
          </select>
        </div>

        {/* Custom Reminder Note */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
            Notes / Required Documents to Prepare
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Gather hospital discharge summary, verify Aadhaar OTP mobile number..."
            value={reminderNote}
            onChange={(e) => setReminderNote(e.target.value)}
            className="input-field"
            style={{ width: '100%', borderRadius: '0.5rem', padding: '0.6rem' }}
          />
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <div>
            {existingReminder && (
              <button
                type="button"
                onClick={handleDelete}
                className="btn"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '0.5rem 0.85rem',
                  fontSize: '0.8rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={14} /> Remove
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handleExportICS}
              className="btn btn-secondary"
              title="Add to Google Calendar / Apple Calendar"
              style={{
                padding: '0.5rem 0.85rem',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                borderRadius: '0.5rem',
              }}
            >
              <Download size={14} /> Export .ics
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                padding: '0.5rem 1.25rem',
                fontSize: '0.85rem',
                borderRadius: '0.5rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Bell size={15} /> Save Reminder
            </button>
          </div>
        </div>
      </form>
    </AccessibleModal>
  );
};

export default ReminderScheduleModal;
