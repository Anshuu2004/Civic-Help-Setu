import { useState, useEffect, useMemo } from 'react';
import {
  FileBadge, ShieldCheck, Upload, CreditCard, Car, FileText,
  Plus, Search, Eye, AlertTriangle, Layers, Download, Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../context/ConfirmationDialogContext';
import {
  getDocuments,
  saveDocument,
  deleteDocument,
  getExpiryStatus,
  getExpiringDocuments,
} from '../services/vaultStorage';
import VaultStats from '../components/vault/VaultStats';
import DocumentModal from '../components/vault/DocumentModal';
import DocumentPreviewModal from '../components/vault/DocumentPreviewModal';
import ExpiringDocumentsAlert from '../components/vault/ExpiringDocumentsAlert';
import VaultBackupRestoreModal from '../components/vault/VaultBackupRestoreModal';
import ServiceTaggingModal from '../components/vault/ServiceTaggingModal';
import DocumentPreflightChecker from '../components/vault/DocumentPreflightChecker';

const CATEGORIES = ['All', 'Identity', 'Finance', 'Transport', 'Education', 'Welfare'];
