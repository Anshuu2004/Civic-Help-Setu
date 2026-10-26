import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import ChatHeaderControls from './ChatHeaderControls';
import ChatEmptyState from './ChatEmptyState';
import UndoResetNotice from './UndoResetNotice';
import { STARTER_PROMPTS } from '../../ai/conversationContext';

const asked = [
  { id: 'welcome-msg', role: 'assistant', text: 'Hello' },
  { id: 'u1', role: 'user', text: 'passport' },
];

// The reset button is the one whose text is "New conversation"
const resetButton = (html) => html.match(/<button[^>]*>(?:(?!<\/button>).)*New conversation<\/button>/s)[0];

describe('ChatHeaderControls reset action', () => {
  it('is a text button called New conversation, not an icon on its own', () => {
    const html = renderToStaticMarkup(<ChatHeaderControls messages={asked} onNewConversation={() => {}} />);
    const btn = resetButton(html);
    expect(btn).toContain('New conversation');
    expect(btn).toContain('type="button"');
    expect(btn).not.toContain('disabled');
    expect(html).not.toContain('>Clear<');
  });

  it('is disabled while a reply is loading and says why', () => {
    const html = renderToStaticMarkup(<ChatHeaderControls messages={asked} isLoading onNewConversation={() => {}} />);
    const btn = resetButton(html);
    expect(btn).toContain('disabled');
    expect(btn).toContain('Wait for the current reply');
  });

  it('is disabled when there is nothing to reset', () => {
    const html = renderToStaticMarkup(<ChatHeaderControls messages={[asked[0]]} canReset={false} onNewConversation={() => {}} />);
    const btn = resetButton(html);
    expect(btn).toContain('disabled');
    expect(btn).toContain('Ask a question first');
  });
});

describe('ChatEmptyState', () => {
  const html = renderToStaticMarkup(<ChatEmptyState prompts={STARTER_PROMPTS} onSelectPrompt={() => {}} />);

  it('explains what the assistant can help with', () => {
    expect(html).toContain('aria-labelledby="chat-empty-title"');
    expect(html).toContain('What can I help you with?');
    expect(html).toContain('which documents you');
    expect(html).toContain('official portals');
  });

  it('shows every starter question as a button', () => {
    STARTER_PROMPTS.forEach((item) => {
      expect(html).toContain(item.label);
      expect(html).toContain(item.prompt);
    });
    expect((html.match(/<button/g) || []).length).toBe(STARTER_PROMPTS.length);
    expect(html).not.toContain('disabled');
  });

  it('disables the starters while a reply is loading', () => {
    const loading = renderToStaticMarkup(<ChatEmptyState prompts={STARTER_PROMPTS} disabled onSelectPrompt={() => {}} />);
    expect((loading.match(/disabled/g) || []).length).toBe(STARTER_PROMPTS.length);
  });
});

describe('UndoResetNotice', () => {
  const html = renderToStaticMarkup(<UndoResetNotice seconds={10} onUndo={() => {}} />);

  it('is a polite status message with an Undo button', () => {
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('Undo</button>');
    expect(html).toContain('10 seconds');
  });

  it('does not repeat any chat content', () => {
    expect(html).not.toContain('passport');
  });
});
