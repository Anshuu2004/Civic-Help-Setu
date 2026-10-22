const GRIEVANCE_STORAGE_KEY = 'civic_grievance_tickets';

export const grievanceService = {
  getTickets() {
    try {
      const data = localStorage.getItem(GRIEVANCE_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  submitGrievance({ serviceId, serviceTitle, category, description, citizenName, contact, urgency = 'medium' }) {
    const existing = this.getTickets();
    const trackingId = `GRV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    
    const newTicket = {
      id: trackingId,
      serviceId,
      serviceTitle,
      category,
      description,
      citizenName: citizenName || 'Anonymous Citizen',
      contact: contact || 'Not provided',
      urgency,
      status: 'Submitted',
      submittedAt: new Date().toISOString(),
      expectedResolutionDays: urgency === 'critical' ? 3 : urgency === 'high' ? 7 : 14,
      updates: [
        {
          timestamp: new Date().toISOString(),
          status: 'Submitted',
          message: 'Grievance ticket registered into the Civic Help Setu redressal queue.'
        }
      ]
    };

    const updated = [newTicket, ...existing];
    localStorage.setItem(GRIEVANCE_STORAGE_KEY, JSON.stringify(updated));
    return newTicket;
  },

  getByTrackingId(id) {
    const tickets = this.getTickets();
    return tickets.find(t => t.id === id) || null;
  },

  getByService(serviceId) {
    const tickets = this.getTickets();
    return tickets.filter(t => t.serviceId === serviceId);
  }
};
