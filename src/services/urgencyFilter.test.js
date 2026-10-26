import { describe, expect, it } from 'vitest';
import { rankAndFilterServices } from './searchRankingEngine';

const services = [
  { id: 'same-day', name: 'Same Day', category: 'Identity', speedDays: 1 },
  { id: 'three-day', name: 'Three Day', category: 'Certificates', speedDays: 3 },
  { id: 'week', name: 'One Week', category: 'Certificates', speedDays: 7 },
  { id: 'standard', name: 'Standard', category: 'Certificates', speedDays: 15 },
];

describe('urgent service filtering', () => {
  it('shows only services that can complete within three days', () => {
    const result = rankAndFilterServices(services, { speedFilter: 'Urgent' });
    expect(result.map(({ id }) => id)).toEqual(['same-day', 'three-day']);
  });

  it('composes urgency with the existing category filter', () => {
    const result = rankAndFilterServices(services, {
      category: 'Certificates',
      speedFilter: 'Urgent',
    });
    expect(result.map(({ id }) => id)).toEqual(['three-day']);
  });
});
