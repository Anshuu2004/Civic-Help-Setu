import { services } from '../data/services';

const STORAGE_KEY = 'civic_compared_services';
const MAX_COMPARE_LIMIT = 3;

export const comparisonService = {
  getComparedIds() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  getComparedServices() {
    const ids = this.getComparedIds();
    return ids
      .map(id => services.find(s => s.id === id))
      .filter(Boolean);
  },

  addService(serviceId) {
    const ids = this.getComparedIds();
    if (ids.includes(serviceId)) {
      return { success: false, reason: 'already_added', ids };
    }
    if (ids.length >= MAX_COMPARE_LIMIT) {
      return { success: false, reason: 'limit_reached', max: MAX_COMPARE_LIMIT, ids };
    }
    const updated = [...ids, serviceId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return { success: true, ids: updated };
  },

  removeService(serviceId) {
    const ids = this.getComparedIds();
    const updated = ids.filter(id => id !== serviceId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  clearAll() {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  },

  isCompared(serviceId) {
    const ids = this.getComparedIds();
    return ids.includes(serviceId);
  },

  getSimilarServices(serviceId) {
    const target = services.find(s => s.id === serviceId);
    if (!target) return [];
    return services
      .filter(s => s.id !== serviceId && (s.category === target.category || s.department === target.department))
      .slice(0, 4);
  },

  buildComparisonMatrix(serviceList) {
    if (!serviceList || serviceList.length === 0) return [];

    return [
      {
        attribute: 'Department',
        values: serviceList.map(s => s.department || 'General')
      },
      {
        attribute: 'Category',
        values: serviceList.map(s => s.category || 'Public Service')
      },
      {
        attribute: 'Standard Fee',
        values: serviceList.map(s => s.fee || 'Free / Nil')
      },
      {
        attribute: 'Processing Duration',
        values: serviceList.map(s => s.processingTime || '10 - 15 working days')
      },
      {
        attribute: 'Online Availability',
        values: serviceList.map(s => (s.onlinePortalUrl ? 'Yes (Online Portal)' : 'Physical Center / Desk'))
      },
      {
        attribute: 'Required Key Documents',
        values: serviceList.map(s => (s.requiredDocuments ? s.requiredDocuments.slice(0, 3).join(', ') : 'Identity & Address Proof'))
      },
      {
        attribute: 'Target Eligibility',
        values: serviceList.map(s => s.eligibilitySummary || 'All Resident Citizens')
      }
    ];
  }
};
