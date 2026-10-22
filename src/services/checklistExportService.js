export const checklistExportService = {
  formatTextSummary(service) {
    if (!service) return '';

    const docs = service.documents && service.documents.length > 0
      ? service.documents.map((d, i) => `${i + 1}. [ ] ${d}`).join('\n')
      : '1. [ ] Valid Identity Proof\n2. [ ] Valid Address Proof\n3. [ ] Passport Size Photographs (x2)';

    return `🏛️ *CIVIC HELP SETU - SERVICE PREPARATION DOSSIER*
📋 Service: ${service.name} (${service.category})
💰 Expected Fees: ${service.fees || 'Nil / Standard'}
⏱️ Processing Time: ${service.processingTime || '10-15 working days'}

📄 *REQUIRED DOCUMENTS TO CARRY:*
${docs}

⚠️ *PHYSICAL VISIT CHECKLIST:*
• Original documents + 2 sets of self-attested photocopies
• Recent passport-size photographs (white background)
• Keep exact change or UPI payment ready for treasury fee
• Reach counter 15 minutes before queue opening time

🔗 Guide: ${window.location.origin}/services/${service.id}
Generated via Civic Help Setu`;
  },

  getWhatsAppShareUrl(service) {
    const text = encodeURIComponent(this.formatTextSummary(service));
    return `https://api.whatsapp.com/send?text=${text}`;
  },

  getTelegramShareUrl(service) {
    const url = encodeURIComponent(`${window.location.origin}/services/${service.id}`);
    const text = encodeURIComponent(`Civic Help Setu Guide: ${service.name} - Required Documents & Application Steps`);
    return `https://t.me/share/url?url=${url}&text=${text}`;
  },

  getEmailShareUrl(service) {
    const subject = encodeURIComponent(`Document Checklist & Guide: ${service.name}`);
    const body = encodeURIComponent(this.formatTextSummary(service));
    return `mailto:?subject=${subject}&body=${body}`;
  }
};
