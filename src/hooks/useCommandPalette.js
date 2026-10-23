import { useState, useEffect } from 'react';

export const useCommandPalette = () => {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      const isInput = activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.isContentEditable;

      // Ctrl + K or Cmd + K
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
        setIsShortcutsOpen(false);
        return;
      }

      // '?' key when not inside an input
      if (e.key === '?' && !isInput && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsShortcutsOpen(prev => !prev);
        setIsPaletteOpen(false);
        return;
      }

      // Escape
      if (e.key === 'Escape') {
        if (isPaletteOpen) {
          e.preventDefault();
          setIsPaletteOpen(false);
        }
        if (isShortcutsOpen) {
          e.preventDefault();
          setIsShortcutsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaletteOpen, isShortcutsOpen]);

  return {
    isPaletteOpen,
    setIsPaletteOpen,
    isShortcutsOpen,
    setIsShortcutsOpen
  };
};
