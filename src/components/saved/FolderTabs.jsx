import { useState } from 'react';
import { Folder, Plus } from 'lucide-react';

const FolderTabs = ({ folders = [], activeFolder = 'All', onSelectFolder, onAddFolder }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onAddFolder(newFolderName.trim());
      setNewFolderName('');
      setIsAdding(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap',
        marginBottom: '2rem',
      }}
    >
      <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.35rem', marginRight: '0.25rem' }}>
        <Folder size={15} /> Folders:
      </span>

      {folders.map((folder) => {
        const isActive = activeFolder.toLowerCase() === folder.toLowerCase();
        return (
          <button
            key={folder}
            type="button"
            onClick={() => onSelectFolder(folder)}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '99px',
              fontSize: '0.85rem',
              fontWeight: '600',
              background: isActive ? 'var(--text-primary)' : 'var(--glass-bg)',
              color: isActive ? 'var(--bg-main)' : 'var(--text-secondary)',
              border: isActive ? '1px solid transparent' : '1px solid var(--border-light)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {folder}
          </button>
        );
      })}

      {isAdding ? (
        <form onSubmit={handleAddSubmit} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <input
            type="text"
            autoFocus
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            style={{
              padding: '0.3rem 0.75rem',
              borderRadius: '99px',
              fontSize: '0.8rem',
              background: 'var(--glass-bg)',
              border: '1px solid var(--accent-main)',
              color: 'var(--text-primary)',
              outline: 'none',
              width: '120px',
            }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ✕
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: '99px',
            fontSize: '0.8rem',
            background: 'var(--glass-bg-subtle)',
            border: '1px dashed var(--border-main)',
            color: 'var(--accent-main)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            cursor: 'pointer',
          }}
        >
          <Plus size={13} /> New Folder
        </button>
      )}
    </div>
  );
};

export default FolderTabs;
