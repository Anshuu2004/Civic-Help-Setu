import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MOCK_SERVICES } from '../data/services';
import ServiceCard from '../components/ServiceCard';
import FilterToolbar from '../components/services/FilterToolbar';
import DirectoryEmptyState from '../components/services/DirectoryEmptyState';
import { Sparkles, Layers } from 'lucide-react';

const Services = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL params or set defaults
  const activeCategory = searchParams.get('cat') || 'All';
  const searchQuery = searchParams.get('q') || '';
  const selectedMode = searchParams.get('mode') || 'All';
  const selectedDifficulty = searchParams.get('diff') || 'All';
  const sortBy = searchParams.get('sort') || 'featured';

  const categories = useMemo(() => {
    return ['All', ...new Set(MOCK_SERVICES.map((s) => s.category))];
  }, []);

  const updateParam = (key, value, defaultValue = 'All') => {
    const nextParams = new URLSearchParams(searchParams);
    if (!value || value === defaultValue || value === '') {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleCategoryChange = (cat) => updateParam('cat', cat, 'All');
  const handleSearchChange = (query) => updateParam('q', query, '');
  const handleModeChange = (mode) => updateParam('mode', mode, 'All');
  const handleDifficultyChange = (diff) => updateParam('diff', diff, 'All');
  const handleSortChange = (sort) => updateParam('sort', sort, 'featured');

  const handleResetFilters = () => {
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters = Boolean(
    activeCategory !== 'All' ||
    searchQuery ||
    selectedMode !== 'All' ||
    selectedDifficulty !== 'All' ||
    sortBy !== 'featured'
  );

  const filteredServices = useMemo(() => {
    let result = [...MOCK_SERVICES];

    // 1. Category Filter
    if (activeCategory !== 'All') {
      result = result.filter(
        (s) => s.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // 2. Keyword Search (title, description, eligibility, documents)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.shortDescription.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.documents.some((doc) => doc.toLowerCase().includes(q)) ||
          s.eligibility.some((el) => el.toLowerCase().includes(q))
      );
    }

    // 3. Application Mode Filter (Online / Offline)
    if (selectedMode !== 'All') {
      result = result.filter((s) => {
        const type = (s.type || '').toLowerCase();
        if (selectedMode === 'Online') return type.includes('online');
        if (selectedMode === 'Offline') return type.includes('offline');
        return true;
      });
    }

    // 4. Difficulty Filter
    if (selectedDifficulty !== 'All') {
      result = result.filter(
        (s) => (s.difficulty || '').toLowerCase() === selectedDifficulty.toLowerCase()
      );
    }

    // 5. Sorting
    if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'difficulty-asc') {
      const rank = { easy: 1, medium: 2, hard: 3 };
      result.sort((a, b) => (rank[a.difficulty?.toLowerCase()] || 2) - (rank[b.difficulty?.toLowerCase()] || 2));
    }

    return result;
  }, [activeCategory, searchQuery, selectedMode, selectedDifficulty, sortBy]);

  return (
    <div className="section animate-fade-in" style={{ paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--accent-main)',
              fontSize: '0.85rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '0.5rem',
            }}
          >
            <Layers size={16} /> Public Service Directory
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: '800', marginBottom: '0.75rem' }}>
            Browse Civic Guides
          </h1>
          <p
            style={{
              fontSize: '1.2rem',
              color: 'var(--text-secondary)',
              maxWidth: '750px',
              lineHeight: '1.6',
            }}
          >
            Explore verified government service roadmaps with prerequisite checklists, eligibility rules, and official submission links.
          </p>
        </div>

        {/* Category Pills Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.65rem',
            marginBottom: '2rem',
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              style={{
                padding: '0.6rem 1.4rem',
                borderRadius: '99px',
                fontSize: '0.95rem',
                fontWeight: '600',
                transition: 'all 0.25s ease',
                background: activeCategory.toLowerCase() === cat.toLowerCase() ? 'var(--text-primary)' : 'var(--glass-bg)',
                color: activeCategory.toLowerCase() === cat.toLowerCase() ? 'var(--bg-main)' : 'var(--text-secondary)',
                border: activeCategory.toLowerCase() === cat.toLowerCase() ? '1px solid transparent' : '1px solid var(--border-main)',
                cursor: 'pointer',
                boxShadow: activeCategory.toLowerCase() === cat.toLowerCase() ? '0 0 15px var(--glass-border-strong)' : 'none',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Multi-facet Filter and Search Toolbar */}
        <FilterToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedMode={selectedMode}
          onModeChange={handleModeChange}
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={handleDifficultyChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          totalResults={filteredServices.length}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Service Cards Grid or Empty State */}
        {filteredServices.length > 0 ? (
          <div className="grid-3 pb-12">
            {filteredServices.map((service, index) => (
              <div
                key={service.id}
                className="animate-fade-in"
                style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
              >
                <ServiceCard service={service} />
              </div>
            ))}
          </div>
        ) : (
          <DirectoryEmptyState
            activeCategory={activeCategory}
            searchQuery={searchQuery}
            onReset={handleResetFilters}
          />
        )}
      </div>
    </div>
  );
};

export default Services;
