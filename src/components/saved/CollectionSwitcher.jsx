import { useState, useRef, useEffect } from 'react';
import { Folder, Plus } from 'lucide-react';
import { ALL_COLLECTION, validateNewCollection } from '../../services/savedCollections';

const CollectionSwitcher = ({ collections = [], activeCollection = ALL_COLLECTION, onSelect, onCreate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const addButtonRef = useRef(null);

  const restoreFocus = useRef(false);

  useEffect(() => {
    if (isAdding) inputRef.current?.focus();
    else if (restoreFocus.current) {
      restoreFocus.current = false;
      addButtonRef.current?.focus();
    }
  }, [isAdding]);

  const closeForm = () => {
    setIsAdding(false);
    setName('');
    setError('');
    restoreFocus.current = true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = validateNewCollection(name, collections);
    if (result.ok) {
      onCreate(result.name);
      closeForm();
    } else if (result.reason === 'exists') {
      // Creating a name that already exists just switches to it.
      onSelect(result.name);
      closeForm();
    } else {
      setError(result.reason);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="collection-switcher">
      <div role="group" aria-label="Saved collections" className="collection-switcher__list">
        <span className="collection-switcher__label" aria-hidden="true">
          <Folder size={15} /> Collections
        </span>
        {collections.map(({ name: collectionName, count, pending }) => {
          const isActive = collectionName.toLowerCase() === activeCollection.toLowerCase();
          const label = collectionName === ALL_COLLECTION ? 'All saved' : collectionName;
          return (
            <button
              key={collectionName}
              type="button"
              className={`collection-chip${isActive ? ' is-active' : ''}`}
              aria-pressed={isActive}
              aria-label={`${label}, ${count} ${count === 1 ? 'guide' : 'guides'}${pending ? ', empty collection' : ''}`}
              onClick={() => onSelect(collectionName)}
            >
              <span>{label}</span>
              <span className="collection-chip__count" aria-hidden="true">{count}</span>
            </button>
          );
        })}

        {isAdding ? (
          <form className="collection-switcher__form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="new-collection-name" className="sr-only">New collection name</label>
            <input
              id="new-collection-name"
              ref={inputRef}
              type="text"
              className="collection-switcher__input"
              placeholder="Collection name"
              maxLength={60}
              value={name}
              aria-invalid={error ? 'true' : undefined}
              aria-describedby={error ? 'new-collection-error' : undefined}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  closeForm();
                }
              }}
            />
            <button type="submit" className="btn btn-primary collection-switcher__btn">Create</button>
            <button type="button" className="collection-switcher__cancel" onClick={closeForm}>
              Cancel
            </button>
          </form>
        ) : (
          <button
            type="button"
            ref={addButtonRef}
            className="collection-chip collection-chip--add"
            onClick={() => setIsAdding(true)}
          >
            <Plus size={13} aria-hidden="true" /> New collection
          </button>
        )}
      </div>
      <p
        id="new-collection-error"
        className="collection-switcher__error"
        role="alert"
      >
        {error}
      </p>
    </div>
  );
};

export default CollectionSwitcher;
