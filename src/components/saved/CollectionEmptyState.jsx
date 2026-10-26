import { Link } from 'react-router-dom';
import { FolderOpen } from 'lucide-react';

const CollectionEmptyState = ({ collectionName, onShowAll }) => (
  <section
    className="card collection-empty"
    aria-labelledby="collection-empty-title"
  >
    <FolderOpen size={40} aria-hidden="true" className="collection-empty__icon" />
    <h2 id="collection-empty-title" className="collection-empty__title">
      No guides in "{collectionName}" yet
    </h2>
    <p className="collection-empty__text">
      A guide belongs to one collection at a time. Choose "Notes" on any saved guide and set its folder to
      "{collectionName}" to move it here. This empty collection is not stored and will disappear if you reload
      before adding a guide.
    </p>
    <div className="collection-empty__actions">
      <button type="button" className="btn btn-primary" onClick={onShowAll}>
        Show all saved guides
      </button>
      <Link to="/services" className="btn btn-secondary">
        Find more services to save
      </Link>
    </div>
  </section>
);

export default CollectionEmptyState;
