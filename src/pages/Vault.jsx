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

const getDocumentIcon = (type = '', category = '') => {
  const t = type.toLowerCase();
  const c = category.toLowerCase();
  if (t.includes('aadhaar') || t.includes('voter') || c === 'identity') {
    return <FileBadge size={30} />;
  }
  if (t.includes('pan') || t.includes('tax') || c === 'finance') {
    return <CreditCard size={30} />;
  }
  if (t.includes('driving') || t.includes('license') || t.includes('vehicle') || c === 'transport') {
    return <Car size={30} />;
  }
  return <FileText size={30} />;
};

const FILE_TYPE_LABELS = { 'application/pdf': 'PDF', 'image/jpeg': 'JPG', 'image/png': 'PNG' };

const formatAddedDate = (iso) => {
  if (!iso) return 'Date not recorded';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? 'Date not recorded' : `Added ${d.toLocaleDateString()}`;
};

const Vault = () => {
  const { user } = useAuth();
  const confirm = useConfirm();
  const [documents, setDocuments] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [taggingDoc, setTaggingDoc] = useState(null);
  const [expiringDocs, setExpiringDocs] = useState(() => getExpiringDocuments());

  const refreshVault = () => {
    const docs = getDocuments();
    setDocuments(docs);
    setExpiringDocs(getExpiringDocuments());
  };

  useEffect(() => {
    refreshVault();
  }, []);

  const handleSaveDocument = (docData) => {
    const updated = saveDocument(docData);
    setDocuments(updated);
    setExpiringDocs(getExpiringDocuments());
  };

  const handleDeleteDocument = async (id) => {
    const targetDoc = documents.find((d) => d.id === id);
    const docName = targetDoc ? `${targetDoc.type} (${targetDoc.number})` : 'this document';

    const shouldDelete = await confirm({
      title: 'Permanently Delete Document?',
      message: `Are you sure you want to delete ${docName} from your secure document vault? All associated document files and service tags will be permanently removed.`,
      itemName: docName,
      confirmLabel: 'Permanently Delete',
      cancelLabel: 'Keep Document',
      variant: 'danger',
    });

    if (!shouldDelete) return;

    const updated = deleteDocument(id);
    setDocuments(updated);
    setExpiringDocs(getExpiringDocuments());
  };

  return null;
};

export default Vault;
