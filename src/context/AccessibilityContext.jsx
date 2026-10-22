import { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

const STORAGE_KEY = 'civicbridge_a11y_prefs';

export const AccessibilityProvider = ({ children }) => {
  const [fontSizeScale, setFontSizeScale] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw).fontSizeScale || 'normal' : 'normal';
    } catch {
      return 'normal';
    }
  });

  const [isHighContrast, setIsHighContrast] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? Boolean(JSON.parse(raw).isHighContrast) : false;
    } catch {
      return false;
    }
  });

  const [isDyslexicFont, setIsDyslexicFont] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? Boolean(JSON.parse(raw).isDyslexicFont) : false;
    } catch {
      return false;
    }
  });

  const [isSpeaking, setIsSpeaking] = useState(false);

  // Apply attributes to document root
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-font-scale', fontSizeScale);

    if (isHighContrast) {
      root.setAttribute('data-high-contrast', 'true');
    } else {
      root.removeAttribute('data-high-contrast');
    }

    if (isDyslexicFont) {
      root.setAttribute('data-dyslexic-font', 'true');
    } else {
      root.removeAttribute('data-dyslexic-font');
    }

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ fontSizeScale, isHighContrast, isDyslexicFont })
      );
    } catch (err) {
      console.error('Failed to save a11y preferences', err);
    }
  }, [fontSizeScale, isHighContrast, isDyslexicFont]);

  // Text to Speech
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const cycleFontSize = () => {
    setFontSizeScale((prev) => {
      if (prev === 'normal') return 'large';
      if (prev === 'large') return 'xlarge';
      return 'normal';
    });
  };

  const toggleHighContrast = () => {
    setIsHighContrast((prev) => !prev);
  };

  const toggleDyslexicFont = () => {
    setIsDyslexicFont((prev) => !prev);
  };

  const resetAccessibility = () => {
    setFontSizeScale('normal');
    setIsHighContrast(false);
    setIsDyslexicFont(false);
    stopSpeaking();
  };

  return (
    <AccessibilityContext.Provider
      value={{
        fontSizeScale,
        setFontSizeScale,
        cycleFontSize,
        isHighContrast,
        toggleHighContrast,
        isDyslexicFont,
        toggleDyslexicFont,
        isSpeaking,
        speakText,
        stopSpeaking,
        resetAccessibility,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
