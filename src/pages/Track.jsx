import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Search,
  FileText,
  ArrowRight,
  Copy,
  Plus,
  AlertTriangle,
  ShieldCheck,
  MessageSquare,
  Send,
  Compass,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import {
  getApplications,
  getApplicationById,
  addNoteToApplication,
  resolveApplicationPendingAction,
  getTrackingMetrics,
  getStatusMeta,
  formatDisplayDate,
} from '../services/trackingService';
import JourneyPlannerModal from '../components/journey/JourneyPlannerModal';
import ActiveApplicationsSummaryGrid from '../components/tracking/ActiveApplicationsSummaryGrid';
import ApplicationTimeline from '../components/tracking/ApplicationTimeline';
import ActionRequiredAlert from '../components/tracking/ActionRequiredAlert';
import LinkedDocumentsManager from '../components/tracking/LinkedDocumentsManager';
import ManualAddApplicationModal from '../components/tracking/ManualAddApplicationModal';
import TrackEmptyState from '../components/tracking/TrackEmptyState';
import TrackingReceiptModal from '../components/tracking/TrackingReceiptModal';
import SlaBreachAlertWidget from '../components/tracking/SlaBreachAlertWidget';

const Track = () => {
