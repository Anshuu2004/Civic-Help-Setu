import React, { useState } from 'react';
import { CheckSquare, Square } from 'lucide-react';

const Checklist = ({ items = [] }) => {
  const [checkedItems, setCheckedItems] = useState(new Set());

  const toggleItem = (index) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedItems(newChecked);
  };

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, index) => {
        const isChecked = checkedItems.has(index);
        return (
          <div 
            key={index}
            className="flex items-start gap-4 p-5 rounded-2xl cursor-pointer transition-all"
            style={{ 
              backgroundColor: isChecked ? 'var(--bg-secondary)' : 'transparent',
              border: '1px solid',
              borderColor: isChecked ? 'var(--border-medium)' : 'var(--border-light)'
            }}
            onClick={() => toggleItem(index)}
          >
            <div className="mt-0.5" style={{ color: isChecked ? 'var(--success)' : 'var(--text-tertiary)' }}>
              {isChecked ? <CheckSquare size={20} /> : <Square size={20} />}
            </div>
            <span style={{ 
              color: isChecked ? 'var(--text-secondary)' : 'var(--text-primary)',
              textDecoration: isChecked ? 'line-through' : 'none'
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
