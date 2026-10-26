import { describe, expect, it } from 'vitest';
import { getSearchSuggestions } from './searchRankingEngine';

const services = [
  {
    name: 'Driving License',
    category: 'Transport',
    department: 'Road Transport Department',
    documents: ['Proof of Address', 'Learner Permit'],
  },
  {
    name: 'Income Certificate',
    category: 'Certificates',
    department: 'Revenue Department',
    documents: ['Salary Slip'],
  },
];

describe('getSearchSuggestions', () => {
  it('returns no suggestions until two meaningful characters are typed', () => {
    expect(getSearchSuggestions(services, 'd')).toEqual([]);
    expect(getSearchSuggestions(services, '  ')).toEqual([]);
  });

  it('ranks service-name prefixes before other matching catalog vocabulary', () => {
    expect(getSearchSuggestions(services, 'dr')[0]).toEqual({
      label: 'Driving License',
      kind: 'Service',
    });
  });

  it('suggests categories, departments, documents, and civic keywords', () => {
    expect(getSearchSuggestions(services, 'trans')).toContainEqual({ label: 'Transport', kind: 'Category' });
    expect(getSearchSuggestions(services, 'revenue')).toContainEqual({ label: 'Revenue Department', kind: 'Department' });
    expect(getSearchSuggestions(services, 'learner')).toContainEqual({ label: 'Learner Permit', kind: 'Document' });
    expect(getSearchSuggestions(services, 'aad')).toContainEqual({ label: 'aadhaar', kind: 'Keyword' });
  });

  it('deduplicates labels case-insensitively and respects the requested limit', () => {
    const duplicated = [...services, { name: 'driving license', category: 'Transport' }];
    const suggestions = getSearchSuggestions(duplicated, 'dr', 2);
    expect(suggestions).toHaveLength(2);
    expect(suggestions.filter(({ label }) => label.toLowerCase() === 'driving license')).toHaveLength(1);
  });
});
