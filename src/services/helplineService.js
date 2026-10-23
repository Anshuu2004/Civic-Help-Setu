import { EMERGENCY_HELPLINES, HELPLINE_CATEGORIES } from '../data/emergencyHelplines';

export const helplineService = {
  getAll() {
    return EMERGENCY_HELPLINES;
  },

  getCategories() {
    return HELPLINE_CATEGORIES;
  },

  filterHelplines({ query = '', category = 'All' }) {
    let results = EMERGENCY_HELPLINES;

    if (category && category !== 'All') {
      results = results.filter(h => h.category === category);
    }

    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      results = results.filter(h =>
        h.name.toLowerCase().includes(q) ||
        h.number.includes(q) ||
        h.category.toLowerCase().includes(q) ||
        h.description.toLowerCase().includes(q)
      );
    }

    return results;
  },

  getDialUrl(number) {
    const cleanNumber = number.replace(/[^0-9+]/g, '');
    return `tel:${cleanNumber}`;
  }
};
