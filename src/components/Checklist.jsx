import React, { useState } from 'react';
import { CheckSquare, Square } from 'lucide-react';

const Checklist = ({ items = [] }) => {
  const [checkedItems, setCheckedItems] = useState(new Set());

  const toggleItem = (index) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(index)) newChecked.delete(index);
    else newChecked.add(index);
    setCheckedItems(newChecked);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {items.map((item, index) => {
        const isChecked = checkedItems.has(index);
        return (
          <div 
            key={index}
            onClick={() => toggleItem(index)}
            style={{ 
              display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1.25rem', borderRadius: '1rem', cursor: 'pointer', transition: 'all 0.3s ease',
              background: isChecked ? 'rgba(56, 189, 248, 0.05)' : 'var(--glass-bg-subtle)',
              border: isChecked ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid var(--border-light)'
            }}
          >
            <div style={{ color: isChecked ? 'var(--accent-main)' : 'var(--text-tertiary)', marginTop: '0.125rem' }}>
              {isChecked ? <CheckSquare size={22} /> : <Square size={22} />}
            </div>
            <span style={{ 
              color: isChecked ? 'var(--text-secondary)' : 'var(--text-primary)',
              textDecoration: isChecked ? 'line-through' : 'none',
              fontSize: '1rem',
              lineHeight: '1.5'
            }}>
              {item}
            </span>
          </div>
        );
      })}
    </div>
  );
};
export default Checklist;
