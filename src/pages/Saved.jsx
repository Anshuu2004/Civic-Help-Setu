import { useState, useEffect, useMemo } from 'react';
import { MOCK_SERVICES } from '../data/services';
import { BookmarkMinus, Bookmark, Search, Layers, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  getSavedItems,
  updateItem,
  removeItem,
  clearAllSaved,
  getFolders,
} from '../services/savedStorage';
import FolderTabs from '../components/saved/FolderTabs';
import ServiceNoteModal from '../components/saved/ServiceNoteModal';
import SavedItemCard from '../components/saved/SavedItemCard';

const Saved = () => {
  const [savedItems, setSavedItems] = useState([]);
  const [activeFolder, setActiveFolder] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingModal, setEditingModal] = useState({ isOpen: false, item: null, service: null });

  useEffect(() => {
    setSavedItems(getSavedItems());
  }, []);

  const folders = useMemo(() => getFolders(savedItems), [savedItems]);

  const handleAddFolder = (newFolder) => {
    setActiveFolder(newFolder);
  };

  const handleEditNotes = (item, service) => {
    setEditingModal({ isOpen: true, item, service });
  };

  const handleSaveNotes = (serviceId, updates) => {
    const updated = updateItem(serviceId, updates);
    setSavedItems(updated);
  };

  const handleRemoveItem = (serviceId) => {
    const updated = removeItem(serviceId);
    setSavedItems(updated);
  };

  const clearSaved = () => {
    if (window.confirm('Are you sure you want to clear all your saved service guides?')) {
      const reset = clearAllSaved();
      setSavedItems(reset);
    }
  };

  // Match saved items with mock services
  const populatedItems = useMemo(() => {
    return savedItems
      .map((item) => {
        const service = MOCK_SERVICES.find((s) => s.id === item.serviceId);
        return service ? { item, service } : null;
      })
      .filter(Boolean);
  }, [savedItems]);

  // Filter by folder and query
  const filteredItems = useMemo(() => {
    return populatedItems.filter(({ item, service }) => {
      const matchesFolder =
        activeFolder === 'All' ||
        (item.folder && item.folder.toLowerCase() === activeFolder.toLowerCase());

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        service.name.toLowerCase().includes(q) ||
        service.category.toLowerCase().includes(q) ||
        (item.notes && item.notes.toLowerCase().includes(q));

      return matchesFolder && matchesQuery;
    });
  }, [populatedItems, activeFolder, searchQuery]);

  return (
    <div className="section animate-fade-in" style={{ paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '2.5rem',
            borderBottom: '1px solid var(--border-main)',
            paddingBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-main)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.35rem' }}>
              <Bookmark size={16} /> Personal Bookmark Hub
            </div>
            <h1 style={{ fontSize: 'clamp(2.25rem, 5vw, 3rem)', fontWeight: '800' }}>
              Saved Guides & Notes
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: '0.25rem' }}>
              Organize saved civic roadmaps into custom folders with personal checklists and deadlines.
            </p>
          </div>

          {savedItems.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                type="button"
                onClick={clearSaved}
                className="btn btn-secondary"
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.85rem',
                  color: 'var(--error, #ef4444)',
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                }}
              >
                <BookmarkMinus size={15} /> Clear All
              </button>
            </div>
          )}
        </div>

        {/* Folder Tabs & Search Toolbar */}
        {savedItems.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            <FolderTabs
              folders={folders}
              activeFolder={activeFolder}
              onSelectFolder={setActiveFolder}
              onAddFolder={handleAddFolder}
            />

            <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
              <Search
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
                placeholder="Search saved guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
                style={{
                  padding: '0.45rem 0.85rem 0.45rem 2.4rem',
                  fontSize: '0.875rem',
                  borderRadius: '99px',
                }}
              />
            </div>
          </div>
        )}

        {/* Content Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid-3 pb-12">
            {filteredItems.map(({ item, service }) => (
              <SavedItemCard
                key={service.id}
                item={item}
                service={service}
                onEditNotes={handleEditNotes}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>
        ) : savedItems.length > 0 ? (
          <div
            className="glass-panel"
            style={{
              textAlign: 'center',
              padding: '3rem 2rem',
              marginTop: '1.5rem',
            }}
          >
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: '600' }}>
              No saved guides found in folder "{activeFolder}" matching "{searchQuery}".
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setSearchQuery('');
                setActiveFolder('All');
              }}
              style={{ marginTop: '1rem', padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
            >
              Show All Saved Guides
            </button>
          </div>
        ) : (
          <div
            className="glass-panel"
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              borderRadius: '1.5rem',
              maxWidth: '600px',
              margin: '2rem auto',
            }}
          >
            <div
              style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                background: 'rgba(56, 189, 248, 0.1)',
                color: 'var(--accent-main)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Bookmark size={32} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
              No Saved Guides Yet
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1rem' }}>
              Bookmark government services while browsing to track requirements, attach personal notes, and prepare for in-person visits.
            </p>
            <Link to="/services" className="btn btn-primary">
              Explore Services Directory
            </Link>
          </div>
        )}

        {/* Edit Note Modal */}
        <ServiceNoteModal
          isOpen={editingModal.isOpen}
          item={editingModal.item}
          service={editingModal.service}
          onClose={() => setEditingModal({ isOpen: false, item: null, service: null })}
          onSave={handleSaveNotes}
        />
      </div>
    </div>
  );
};

export default Saved;
