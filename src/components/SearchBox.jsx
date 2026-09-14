import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchBox = ({ placeholder = "Search for a service...", size = "normal" }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/assistant?q=${encodeURIComponent(query)}`);
    }
  };

  const paddingClass = size === 'large' ? '1.25rem 2rem' : '0.875rem 1.25rem';
  const fontSize = size === 'large' ? '1.25rem' : '1.125rem';
  const iconSize = size === 'large' ? 28 : 22;

  return (
    <form onSubmit={handleSearch} style={{ position: 'relative', width: '100%', zIndex: 10 }}>
      <input
        type="text"
        className="input-field"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: paddingClass, fontSize, paddingRight: '4rem' }}
      />
      <button 
        type="submit" 
        className="bg-accent-main hover:bg-accent-hover text-white transition-colors"
        style={{
          position: 'absolute',
          right: '0.5rem',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '3.5rem',
          height: 'calc(100% - 1rem)',
          borderRadius: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Search size={iconSize} />
      </button>
    </form>
  );
};

export default SearchBox;
