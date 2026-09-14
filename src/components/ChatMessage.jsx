import React from 'react';
import { Shield, User } from 'lucide-react';

const ChatMessage = ({ role, content }) => {
  const isUser = role === 'user';
  const isAssistant = role === 'assistant';
  
  return (
    <div className={`flex gap-4 ${isAssistant ? '' : 'flex-row-reverse'} mb-6`}>
      <div 
        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm`}
        style={{ 
          backgroundColor: isAssistant ? 'var(--accent-light)' : 'var(--accent-main)',
          color: isAssistant ? 'var(--accent-main)' : 'white'
        }}
      >
        {isAssistant ? <Shield size={24} /> : <User size={24} />}
      </div>
      
      <div 
        className={`max-w-[85%] rounded-3xl p-6 shadow-sm text-sm md:text-base leading-relaxed ${
          isAssistant ? 'bg-white rounded-tl-sm border border-light' : 'bg-accent-main text-white rounded-tr-sm'
        }`}
        style={{
          backgroundColor: isAssistant ? 'white' : 'var(--accent-main)',
          color: isAssistant ? 'inherit' : 'white'
        }}
      >
        {content}
      </div>
    </div>
  );
};

export default ChatMessage;
