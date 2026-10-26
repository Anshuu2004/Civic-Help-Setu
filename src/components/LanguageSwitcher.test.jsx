import { readFileSync } from 'node:fs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import ServiceCard from './ServiceCard';
import UntranslatedBadge from './common/UntranslatedBadge';
import { MemoryRouter } from 'react-router-dom';
import { LANGUAGE_KEY } from '../utils/languagePreference';
import { MOCK_SERVICES } from '../data/services';

const withLanguage = (code, ui) => {
  vi.stubGlobal('localStorage', {
    getItem: (k) => (k === LANGUAGE_KEY ? code : null),
    setItem: () => {},
  });
  return renderToStaticMarkup(<MemoryRouter><LanguageProvider>{ui}</LanguageProvider></MemoryRouter>);
};

describe('LanguageSwitcher feedback', () => {
  beforeEach(() => vi.unstubAllGlobals());

  it('names the saved language on the button for assistive tech', () => {
    const html = withLanguage('hi', <LanguageSwitcher />);
    expect(html).toContain('aria-label="Select interface language. Currently हिन्दी (Hindi)"');
    expect(html).toContain('role="status"');
  });

  it('marks the active language and states how much of the interface is translated', () => {
    const html = withLanguage('bn', <LanguageSwitcher defaultOpen />);
    expect(html.match(/aria-current="true"/g)).toHaveLength(1);
    expect(html).toContain('Active');
    expect(html).toContain('Interface fully translated');
    expect(html).toMatch(/Interface partly translated \(\d+ of \d+ labels\)/);
  });

  it('explains in the dropdown that service content is not translated', () => {
    const html = withLanguage('en', <LanguageSwitcher defaultOpen />);
    expect(html).toContain('Only interface labels are translated.');
    expect(html).toContain('stay in English');
  });
});

describe('untranslated service content label', () => {
  beforeEach(() => vi.unstubAllGlobals());

  it('shows nothing in English', () => {
    expect(withLanguage('en', <UntranslatedBadge />)).not.toContain('untranslated-badge');
  });

  it.each(['hi', 'bn', 'ta'])('shows the label in %s', (code) => {
    const html = withLanguage(code, <UntranslatedBadge />);
    expect(html).toContain('untranslated-badge');
    expect(html).toContain('English only, not translated');
  });

  it('keeps the original service text and adds the label on a card', () => {
    const service = MOCK_SERVICES[0];
    const html = withLanguage('hi', <ServiceCard service={service} />);
    expect(html).toContain(service.name);
    expect(html).toContain('English only, not translated');
  });
});

describe('t() fallback', () => {
  beforeEach(() => vi.unstubAllGlobals());

  const Probe = () => {
    const { t } = useLanguage();
    return (
      <p>
        {[t('nav.services'), t('hero.tagline'), t('no.such.key'), t('no.such.key', 'given fallback')].join('|')}
      </p>
    );
  };

  it('uses the translation when it exists, else English, else the caller fallback, else the key', () => {
    const html = withLanguage('bn', <Probe />);
    const [translated, english, key, given] = html.replace(/<[^>]+>/g, '').split('|');
    expect(translated).not.toBe('Services');
    expect(translated.length).toBeGreaterThan(0);
    expect(english).toBe('The New Standard for Civic Assistance');
    expect(key).toBe('no.such.key');
    expect(given).toBe('given fallback');
  });
});

describe('mobile navbar fit', () => {
  beforeEach(() => vi.unstubAllGlobals());

  it('puts the language name in its own span so phones can hide it, name stays on the button', () => {
    const html = withLanguage('en', <LanguageSwitcher variant="mobile" />);
    expect(html).toContain('<span class="lang-switcher__label">English</span>');
    expect(html).toContain('aria-label="Select interface language. Currently English (English)"');
  });

  it('hides the label and tightens the navbar under 480px only', () => {
    const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8');
    const block = css.match(/@media \(max-width: 480px\) \{\s*\.nav-container[\s\S]*?\n\}/);
    expect(block).not.toBeNull();
    expect(block[0]).toContain('.nav-mobile-actions .lang-switcher__label { display: none; }');
    expect(block[0]).toContain('.nav-container { padding-left: 1rem; padding-right: 1rem; }');
    // the desktop navbar must not get the shrink rule
    expect(css).not.toMatch(/^\.nav-brand \{ min-width: 0; \}/m);
  });
});
