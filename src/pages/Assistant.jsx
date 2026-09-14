import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Send, RotateCcw, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import ChatMessage from '../components/ChatMessage';
import { askCivicAssistant } from '../ai/civicAssistant';
import SourceCard from '../components/SourceCard';

const Assistant = () => {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Hello! I am the CivicBridge Assistant. Tell me what you need help with, for example: "I need to apply for a birth certificate."' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q');
    
    if (query && messages.length === 1) {
      handleSendMessage(query);
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const handleSendMessage = async (text = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await askCivicAssistant(text);
      
      const assistantMessage = {
        role: 'assistant',
        content: (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold mb-2">{response.data.title}</h3>
            <p className="text-lg">{response.data.summary}</p>
            
            {response.data.steps && response.data.steps.length > 0 && (
              <div className="mt-6">
                <h4 className="font-bold text-accent-main mb-3 text-lg">Key Steps:</h4>
                <ul className="list-decimal pl-5 space-y-2">
                  {response.data.steps.slice(0, 3).map((step, i) => (
                    <li key={i} className="font-medium text-text-secondary">{step.title}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {response.serviceId && (
              <div className="mt-8 pt-6 border-t border-light">
                <Link to={`/services/${response.serviceId}`} className="btn btn-primary inline-flex">
                  View Full Detailed Guide
                </Link>
              </div>
            )}
            
            {!response.serviceId && response.data.officialSources && response.data.officialSources.length > 0 && (
              <div className="mt-6">
                <h4 className="font-bold text-accent-main mb-3 text-lg">Sources:</h4>
                <div className="flex flex-col gap-3">
                  {response.data.officialSources.map((src, i) => (
                    <SourceCard key={i} source={src} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError('We couldn\'t process your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      { 
        role: 'assistant', 
        content: 'Hello! I am the CivicBridge Assistant. Tell me what you need help with, for example: "I need to apply for a birth certificate."' 
      }
    ]);
    setError(null);
  };

  return (
    <div className="container max-w-4xl pt-20 pb-24">
      <div className="flex justify-between items-end mb-8 border-b border-light pb-6">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Sparkles className="text-accent-main" size={32} />
            CivicBridge Assistant
          </h1>
          <p className="text-xl text-muted mt-2 font-medium">Tell me what you need help with in plain English.</p>
        </div>
        <button 
          onClick={handleClear}
          className="text-muted hover:text-error transition-colors flex items-center gap-2 font-bold text-sm bg-white px-4 py-2 rounded-full shadow-sm"
        >
          <RotateCcw size={16} /> Clear chat
        </button>
      </div>

      <div className="flex flex-col gap-8 mb-12">
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} role={msg.role} content={msg.content} />
        ))}
        
        {isLoading && (
          <div className="p-8 flex items-center gap-4 text-accent-main font-bold text-lg card animate-float-slow">
            <Loader2 size={28} className="animate-spin" />
            <span>Consulting civic records...</span>
          </div>
        )}
        
        {error && (
          <div className="p-6 m-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl flex items-center gap-3 text-base shadow-sm">
            <AlertCircle size={24} />
            {error}
            <button onClick={() => handleSendMessage(messages[messages.length-1].content)} className="ml-auto btn btn-primary text-sm px-4 py-2">Retry</button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Sticky Input Area */}
      <div className="sticky bottom-8 z-10 w-full animate-float" style={{ animationDelay: '2s' }}>
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          className="flex gap-3 bg-white p-2 rounded-full shadow-lg border border-light backdrop-blur-md"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="E.g., I lost my Aadhaar card..."
            className="input-field border-none shadow-none bg-transparent flex-1 focus:ring-0 focus:box-shadow-none"
            style={{ boxShadow: 'none' }}
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${input.trim() && !isLoading ? 'bg-accent-main text-white hover:scale-105 shadow-md' : 'bg-secondary text-muted'}`}
          >
            <Send size={20} className={input.trim() && !isLoading ? 'ml-1' : ''} />
          </button>
        </form>
        <p className="text-sm font-bold text-center text-muted mt-4 bg-white/50 inline-block px-4 py-1 rounded-full backdrop-blur-sm mx-auto w-max block shadow-sm border border-white">
          AI can make mistakes. Always verify information with official sources.
        </p>
      </div>
    </div>
  );
};

export default Assistant;
