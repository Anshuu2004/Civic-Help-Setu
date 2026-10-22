import React, { useState, useMemo } from 'react';
import { HelpCircle, Search, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, MessageSquare, Sparkles } from 'lucide-react';
import { getFaqsForService, voteFaqHelpful, getUserFaqVotes } from '../../services/faqService';

const ServiceFAQAccordion = ({ service }) => {
  const allFaqs = useMemo(() => getFaqsForService(service), [service]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedId, setExpandedId] = useState(allFaqs[0]?.id || null);
  const [votes, setVotes] = useState(() => getUserFaqVotes());

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set(['All']);
    allFaqs.forEach(faq => {
      if (faq.category) set.add(faq.category);
    });
    return Array.from(set);
  }, [allFaqs]);

  // Filter FAQs by search & category
  const filteredFaqs = useMemo(() => {
    return allFaqs.filter(faq => {
      const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || 
        faq.question.toLowerCase().includes(query) || 
        faq.answer.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [allFaqs, activeCategory, searchQuery]);

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleVote = (faqId, isHelpful) => {
    const updated = voteFaqHelpful(faqId, isHelpful);
    setVotes({ ...updated });
  };

  return (
    <div 
      className="card"
      style={{
        border: '1px solid var(--border-main)',
        background: 'var(--bg-surface, var(--bg-main))',
        borderRadius: '1rem',
        padding: '1.75rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-main)', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.625rem', background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HelpCircle size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
              Frequently Asked Questions
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Verified official answers for {service?.name || 'this service'}
            </p>
          </div>
        </div>

        {/* Count Badge */}
        <span style={{ fontSize: '0.8rem', background: 'var(--glass-bg)', padding: '0.35rem 0.75rem', borderRadius: '1rem', border: '1px solid var(--border-main)', color: 'var(--text-secondary)' }}>
          {filteredFaqs.length} Questions
        </span>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search questions about ${service?.name || 'procedures'}...`}
          className="input-field"
          style={{ width: '100%', paddingLeft: '2.5rem', fontSize: '0.875rem' }}
        />
      </div>

      {/* Category Pills */}
      {categories.length > 2 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              style={{
                fontSize: '0.75rem',
                fontWeight: activeCategory === cat ? '700' : '500',
                padding: '0.3rem 0.75rem',
                borderRadius: '1rem',
                border: `1px solid ${activeCategory === cat ? 'var(--accent-main, #3b82f6)' : 'var(--border-main)'}`,
                background: activeCategory === cat ? 'var(--accent-main, #3b82f6)' : 'var(--glass-bg)',
                color: activeCategory === cat ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* FAQs List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredFaqs.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--glass-bg-subtle)', borderRadius: '0.75rem' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600' }}>No specific FAQs found for "{searchQuery}"</p>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>Try another keyword or ask our AI Civic Assistant directly.</p>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            const currentVote = votes[faq.id];

            return (
              <div 
                key={faq.id}
                style={{
                  border: `1px solid ${isExpanded ? 'var(--accent-main, #3b82f6)' : 'var(--border-main)'}`,
                  borderRadius: '0.75rem',
                  background: isExpanded ? 'var(--glass-bg)' : 'transparent',
                  transition: 'all 0.2s ease',
                  overflow: 'hidden'
                }}
              >
                <div 
                  onClick={() => toggleExpand(faq.id)}
                  style={{
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                    gap: '0.75rem'
                  }}
                >
                  <span style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {faq.question}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {faq.category && (
                      <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '0.25rem', background: 'var(--glass-bg-subtle)', color: 'var(--text-tertiary)', border: '1px solid var(--border-main)' }}>
                        {faq.category}
                      </span>
                    )}
                    {isExpanded ? <ChevronUp size={18} color="var(--text-secondary)" /> : <ChevronDown size={18} color="var(--text-secondary)" />}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: '0 1rem 1rem 1rem', borderTop: '1px solid var(--border-main)', paddingTop: '0.85rem' }}>
                    <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9rem' }}>
                      {faq.answer}
                    </p>

                    {/* Suggestions / Related */}
                    {faq.suggestions && faq.suggestions.length > 0 && (
                      <div style={{ marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                        <span>Related topics: </span>
                        {faq.suggestions.map((s, idx) => (
                          <span key={idx} style={{ display: 'inline-block', margin: '0.2rem 0.3rem', padding: '0.15rem 0.45rem', borderRadius: '0.25rem', background: 'var(--glass-bg)', border: '1px solid var(--border-main)' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Helpfulness Feedback */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-main)' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                        Was this answer helpful?
                      </span>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={() => handleVote(faq.id, true)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '0.35rem',
                            border: `1px solid ${currentVote === 'helpful' ? '#10b981' : 'var(--border-main)'}`,
                            background: currentVote === 'helpful' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                            color: currentVote === 'helpful' ? '#10b981' : 'var(--text-secondary)',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          <ThumbsUp size={12} /> Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => handleVote(faq.id, false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '0.35rem',
                            border: `1px solid ${currentVote === 'not-helpful' ? '#ef4444' : 'var(--border-main)'}`,
                            background: currentVote === 'not-helpful' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                            color: currentVote === 'not-helpful' ? '#ef4444' : 'var(--text-secondary)',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          <ThumbsDown size={12} /> No
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ServiceFAQAccordion;
