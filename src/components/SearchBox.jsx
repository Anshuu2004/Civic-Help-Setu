import { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchBox = ({
  placeholder = 'Search for a service...',
  size = 'normal',
  onSearch,
  value: controlledValue,
  onChange: controlledOnChange,
}) => {
  const [internalQuery, setInternalQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const isControlled = controlledValue !== undefined;
  const currentQuery = isControlled ? controlledValue : internalQuery;

  const handleInputChange = (e) => {
    if (isControlled && controlledOnChange) {
      controlledOnChange(e.target.value);
    } else {
      setInternalQuery(e.target.value);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = currentQuery.trim();
    if (!q) return;

    if (onSearch) {
      onSearch(q);
    } else {
      navigate(`/assistant?q=${encodeURIComponent(q)}`);
    }
  };

  const isLarge = size === 'large';

  return (
    <form onSubmit={handleSearch} style={{ position: 'relative', width: '100%', zIndex: 10 }}>
      <div
        style={{
          position: 'absolute',
          left: isLarge ? '1.5rem' : '1.25rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: isFocused ? 'var(--accent-main)' : 'var(--text-tertiary)',
          transition: 'color 0.3s ease',
          pointerEvents: 'none',
        }}
      >
        <Search size={isLarge ? 24 : 20} strokeWidth={2.5} />
      </div>
      <input
        type="text"
        className="input-field"
        placeholder={placeholder}
        value={currentQuery}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          padding: isLarge ? '1.25rem 1.5rem 1.25rem 4rem' : '0.875rem 1rem 0.875rem 3.5rem',
          fontSize: isLarge ? '1.125rem' : '1rem',
          paddingRight: isLarge ? '9rem' : '6rem',
        }}
      />
      <button
        type="submit"
        className="btn-primary"
        style={{
          position: 'absolute',
          right: '0.375rem',
          top: '50%',
          transform: 'translateY(-50%)',
          padding: isLarge ? '0.75rem 1.25rem' : '0.5rem 1rem',
          fontSize: isLarge ? '1rem' : '0.875rem',
          borderRadius: 'var(--radius-full)',
          boxShadow: isFocused ? '0 0 15px var(--glass-bg-hover)' : 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <span style={{ fontWeight: '600' }}>Search</span>
        {isLarge && <ArrowRight size={18} />}
      </button>
    </form>
  );
};

export default SearchBox;
