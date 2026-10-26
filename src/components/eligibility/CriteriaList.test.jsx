import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import CriteriaList from './CriteriaList';
import EligibilityBadge from './EligibilityBadge';
import { evaluateCriteria } from '../../services/eligibilityCriteria';

const profile = {
  age: 16,
  annualIncome: 180000,
  employment: 'salaried',
  category: 'General',
  isStudent: true,
  hasLearnerLicense: false,
  hasAadhaar: true,
  hasPan: true,
  hasIncomeCertificate: true,
};

const render = (schemeId, p = profile, onReview = () => {}) =>
  renderToStaticMarkup(
    <CriteriaList schemeId={schemeId} schemeName="Test scheme" criteria={evaluateCriteria(schemeId, p)} onReview={onReview} />
  );

describe('CriteriaList', () => {
  const html = render('scholarship-post-matric');

  it('is a labelled list with one item per requirement', () => {
    expect(html).toContain('aria-labelledby="criteria-scholarship-post-matric"');
    expect(html).toContain('<ul');
    expect(html.match(/<li /g)).toHaveLength(evaluateCriteria('scholarship-post-matric', profile).length);
  });

  it('names every state in text, not only by colour', () => {
    expect(html).toContain('Satisfied');
    expect(html).toContain('Missing');
    expect(html).toContain('Unknown');
    expect(html).toContain('Needs confirmation');
  });

  it('hides decorative icons from assistive tech', () => {
    const icons = html.match(/<svg[^>]*>/g) || [];
    expect(icons.length).toBeGreaterThan(0);
    icons.forEach((svg) => expect(svg).toContain('aria-hidden="true"'));
  });

  it('uses a different icon shape per state', () => {
    ['circle-check', 'circle-x', 'circle-question-mark', 'clipboard-check'].forEach((name) => {
      expect(html.toLowerCase()).toContain(name);
    });
  });

  it('offers a named Review answers action only for requirements that are not satisfied', () => {
    // 5 rows: 2 satisfied, 1 unknown with no input to change, so 2 buttons
    const reviewButtons = html.match(/<button[^>]*aria-label="Review answers for [^"]+"/g) || [];
    expect(reviewButtons).toHaveLength(2);
    expect(html).toContain('Review answers for Social category quota');
    expect(html).not.toContain('Review answers for Currently enrolled');
    expect(html).not.toContain('Review answers for Marks in the previous');
  });

  it('shows no review button without a handler', () => {
    const noHandler = renderToStaticMarkup(
      <CriteriaList schemeId="passport" schemeName="Passport" criteria={evaluateCriteria('passport', profile)} />
    );
    expect(noHandler).not.toContain('<button');
  });

  it('lets long labels wrap instead of overflowing', () => {
    expect(html).toContain('overflow-wrap:anywhere');
    expect(html).toContain('flex-wrap:wrap');
  });

  it('renders the unknown row for a service with incomplete data and no review target', () => {
    const out = render('no-such-service');
    expect(out).toContain('Unknown');
    expect(out).toContain('official source');
    expect(out).not.toContain('<button');
  });

  it('summarises the counts in the heading', () => {
    expect(render('driving-license', { ...profile, age: 30, hasLearnerLicense: true })).toContain('(2 satisfied, 1 needs confirmation)');
  });
});

describe('EligibilityBadge result labels', () => {
  it('describes results as potentially relevant, never as a granted decision', () => {
    const labels = ['eligible', 'conditional', 'ineligible', 'unknown'].map((s) => renderToStaticMarkup(<EligibilityBadge status={s} />));
    expect(labels[0]).toContain('Potentially relevant');
    expect(labels[1]).toContain('action needed');
    expect(labels[2]).toContain('Not matched on your answers');
    expect(labels[3]).toContain('Not enough information');
    labels.forEach((l) => expect(l).not.toMatch(/Eligible to Apply/i));
  });
});
