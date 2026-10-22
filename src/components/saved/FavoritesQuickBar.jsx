import { useState } from 'react';
import {
  Star,
  Clock,
  Bell,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Download,
} from 'lucide-react';
import {
  requestBrowserNotificationPermission,
  getNotificationSettings,
  downloadCalendarFile,
} from '../../services/reminderNotificationService';
import { useToast } from '../../context/ToastContext';

const FavoritesQuickBar = ({
  savedItems = [],
  reminders = [],
  showFavoritesOnly = false,
  onToggleFavoritesOnly = () => {},
  showUpcomingOnly = false,
  onToggleUpcomingOnly = () => {},
}) => {
  const { toast } = useToast();
  const [notificationState, setNotificationState] = useState(() => {
    return 'Notification' in window ? Notification.permission : 'unsupported';
  });

  const favoritesCount = savedItems.filter((item) => item.isFavorite).length;

  // Filter reminders due in next 14 days
  const now = new Date();
  const upcomingReminders = reminders.filter((r) => {
    if (!r.deadlineDate || r.status === 'completed') return false;
    const target = new Date(r.deadlineDate);
    const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 14;
  });

  const handleEnableAlerts = async () => {
    const res = await requestBrowserNotificationPermission();
    setNotificationState(res);
    if (res === 'granted') {
      toast?.success?.('Browser reminder notifications enabled.', 'Alerts Active');
    } else if (res === 'denied') {
      toast?.warning?.('Notifications blocked in browser preferences.');
    }
  };

  const handleExportAllCalendar = () => {
    if (reminders.length === 0) {
      toast?.info?.('No scheduled deadlines found to export.');
      return;
    }
    reminders.forEach((r) => {
      downloadCalendarFile(r.serviceName, r.deadlineDate, r.reminderNote);
    });
    toast?.success?.(`Exported ${reminders.length} deadline calendar events.`);
  };

  return (
    <div
      className="glass-panel animate-fade-in"
      style={{
        padding: '1rem 1.25rem',
        borderRadius: '0.85rem',
        border: '1px solid var(--border-light)',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}
    >
      {/* Quick Filter Buttons */}
      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onToggleFavoritesOnly}
          style={{
            padding: '0.4rem 0.85rem',
            borderRadius: '99px',
            fontSize: '0.8rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: showFavoritesOnly ? 'rgba(245, 158, 11, 0.2)' : 'var(--glass-bg)',
            border: `1px solid ${showFavoritesOnly ? '#f59e0b' : 'var(--border-light)'}`,
            color: showFavoritesOnly ? '#f59e0b' : 'var(--text-secondary)',
            transition: 'all 0.2s',
          }}
        >
          <Star size={14} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
          Favorites ({favoritesCount})
        </button>

        <button
          type="button"
          onClick={onToggleUpcomingOnly}
          style={{
            padding: '0.4rem 0.85rem',
            borderRadius: '99px',
            fontSize: '0.8rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: showUpcomingOnly ? 'rgba(239, 68, 68, 0.2)' : 'var(--glass-bg)',
            border: `1px solid ${showUpcomingOnly ? '#ef4444' : 'var(--border-light)'}`,
            color: showUpcomingOnly ? '#ef4444' : 'var(--text-secondary)',
            transition: 'all 0.2s',
          }}
        >
          <Clock size={14} />
          Due Soon ({upcomingReminders.length})
        </button>
      </div>

      {/* Notifications & Calendar Export */}
      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
        {notificationState !== 'granted' && notificationState !== 'unsupported' && (
          <button
            type="button"
            onClick={handleEnableAlerts}
            className="btn btn-secondary"
            style={{
              fontSize: '0.75rem',
              padding: '0.35rem 0.75rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Bell size={13} color="var(--accent-main)" /> Enable Desktop Reminders
          </button>
        )}

        {reminders.length > 0 && (
          <button
            type="button"
            onClick={handleExportAllCalendar}
            className="btn"
            title="Download .ics calendar schedules"
            style={{
              fontSize: '0.75rem',
              padding: '0.35rem 0.75rem',
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-light)',
              color: 'var(--text-secondary)',
              borderRadius: '0.4rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              cursor: 'pointer',
            }}
          >
            <Download size={13} /> Export All Deadlines (.ics)
          </button>
        )}
      </div>
    </div>
  );
};

export default FavoritesQuickBar;
