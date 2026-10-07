import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Send, RotateCcw, AlertCircle, Loader2, Sparkles, Mic, MicOff } from 'lucide-react';
import ChatMessage from '../components/ChatMessage';
import { askCivicAssistant } from '../ai/civicAssistant';
import SourceCard from '../components/SourceCard';

const Assistant = () => {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Hello! I am the CivicBridge AI Assistant. Tell me what you need help with, for example: "I need to apply for a birth certificate."' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
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

            {/* Render AI Suggestions */}
            {response.suggestions && response.suggestions.length > 0 && (
              <div className="mt-6 pt-4">
                <p className="text-sm font-bold text-text-tertiary mb-3 uppercase tracking-wider">Suggested Questions</p>
                <div className="flex flex-wrap gap-2">
                  {response.suggestions.map((suggestion, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleSendMessage(suggestion)}
                      className="px-4 py-2 rounded-full border border-accent-light bg-accent-light/10 text-accent-main text-sm hover:bg-accent-main hover:text-bg-main transition-colors text-left"
                    >
                      {suggestion}
                    </button>
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

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      setInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
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
    <div className="section animate-fade-in" style={{ paddingBottom: '8rem' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <div className="flex-between" style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Sparkles color="var(--accent-main)" size={32} />
              AI Assistant
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontWeight: '500' }}>Tell me what you need help with in plain English.</p>
          </div>
          <button 
            onClick={handleClear}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', fontSize: '0.875rem', background: 'var(--glass-bg)', padding: '0.5rem 1rem', borderRadius: '99px', color: 'var(--text-secondary)', border: '1px solid var(--border-light)', cursor: 'pointer', transition: 'all 0.3s' }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--error)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <RotateCcw size={16} /> Clear chat
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem' }}>
          {messages.map((msg, idx) => (
            <ChatMessage key={idx} role={msg.role} content={msg.content} />
          ))}
          
          {isLoading && (
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--accent-main)', fontWeight: '700', fontSize: '1.125rem' }}>
              <Loader2 size={28} className="animate-spin" style={{ animation: 'spin 2s linear infinite' }} />
              <span>Analyzing your request...</span>
            </div>
          )}
          
          {error && (
            <div style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--error)', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: '500' }}>
              <AlertCircle size={24} />
              {error}
              <button onClick={() => handleSendMessage(messages[messages.length-1].content)} className="btn btn-primary" style={{ marginLeft: 'auto', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Retry</button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Sticky Input Area */}
        <div style={{ position: 'sticky', bottom: '2rem', zIndex: 10 }}>
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            style={{ display: 'flex', gap: '0.75rem', background: 'var(--bg-main)', padding: '0.5rem', borderRadius: '99px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-main)' }}
          >
            <button
              type="button"
              onClick={toggleVoiceInput}
              style={{
                width: '3rem', height: '3rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isListening ? 'var(--error)' : 'var(--glass-bg)',
                color: isListening ? 'var(--bg-main)' : 'var(--text-primary)',
                border: 'none', cursor: 'pointer', transition: 'all 0.3s'
              }}
              title={isListening ? "Stop listening" : "Use Voice Input"}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "E.g., I lost my Aadhaar card..."}
              className="input-field"
              style={{ border: 'none', background: 'transparent', flex: 1, padding: '0 1rem', boxShadow: 'none' }}
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              style={{
                width: '3rem', height: '3rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: input.trim() && !isLoading ? 'var(--accent-main)' : 'var(--glass-bg)',
                color: input.trim() && !isLoading ? 'var(--bg-main)' : 'var(--text-tertiary)',
                border: 'none', cursor: input.trim() && !isLoading ? 'pointer' : 'default', transition: 'all 0.3s'
              }}
            >
              <Send size={20} style={{ marginLeft: input.trim() && !isLoading ? '2px' : '0' }} />
            </button>
          </form>
          <p style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-tertiary)', marginTop: '1rem' }}>
            AI responses may contain inaccuracies. Always verify with official authorities.
          </p>
        </div>
      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Assistant;
