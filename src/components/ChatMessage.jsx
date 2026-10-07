import React from 'react';
import { Shield, User } from 'lucide-react';

const ChatMessage = ({ role, content }) => {
  const isUser = role === 'user';
  const isAssistant = role === 'assistant';
  
  return (
    <div style={{ display: 'flex', gap: '1rem', flexDirection: isAssistant ? 'row' : 'row-reverse', marginBottom: '1.5rem' }} className="animate-fade-in">
      <div 
        style={{ 
          width: '3rem', height: '3rem', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: isAssistant ? 'var(--accent-light)' : 'var(--accent-main)',
          color: isAssistant ? 'var(--accent-main)' : 'var(--bg-main)'
        }}
      >
        {isAssistant ? <Shield size={24} /> : <User size={24} />}
      </div>
      
      <div 
        style={{
          maxWidth: '85%', padding: '1.5rem', fontSize: '1.05rem', lineHeight: '1.6',
          borderRadius: '1.5rem',
          borderTopLeftRadius: isAssistant ? '0.25rem' : '1.5rem',
          borderTopRightRadius: isUser ? '0.25rem' : '1.5rem',
          backgroundColor: isAssistant ? 'var(--glass-bg-hover)' : 'var(--accent-main)',
          color: isAssistant ? 'var(--text-primary)' : 'var(--bg-main)',
          border: isAssistant ? '1px solid var(--border-main)' : 'none',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        {content}
      </div>
    </div>
  );
};

export default ChatMessage;
