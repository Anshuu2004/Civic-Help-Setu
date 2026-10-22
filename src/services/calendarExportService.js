export const calendarExportService = {
  formatDateToIcs(dateStr, timeStr = '10:00 AM') {
    const [year, month, day] = dateStr.split('-');
    let hour = 10;
    let min = 0;

    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (match) {
      hour = parseInt(match[1], 10);
      min = parseInt(match[2], 10);
      const ampm = match[3] ? match[3].toUpperCase() : '';
      if (ampm === 'PM' && hour < 12) hour += 12;
      if (ampm === 'AM' && hour === 12) hour = 0;
    }

    const pad = (n) => String(n).padStart(2, '0');
    const startStr = `${year}${pad(month)}${pad(day)}T${pad(hour)}${pad(min)}00`;
    
    // Add 1 hour duration
    let endHour = (hour + 1) % 24;
    const endStr = `${year}${pad(month)}${pad(day)}T${pad(endHour)}${pad(min)}00`;

    return { startStr, endStr };
  },

  generateIcsContent(appointment) {
    const { startStr, endStr } = this.formatDateToIcs(appointment.date, appointment.timeSlot);
    const title = `Civic Appointment: ${appointment.officeName || 'Public Service Center'}`;
    const location = appointment.address || 'Govt Facilitation Center';
    const description = `Appointment for ${appointment.serviceName || 'Civic Procedure'}. Token / Ref: ${appointment.token || appointment.id || 'N/A'}. Remember to carry original identity documents, self-attested photocopies, and exact fee change.`;

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Civic Help Setu//Appointment Scheduler//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:civic-${Date.now()}@civic-help-setu.org`,
      `DTSTAMP:${startStr}Z`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT2H',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder: Civic office appointment in 2 hours',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
  },

  downloadIcsFile(appointment) {
    const icsData = this.generateIcsContent(appointment);
    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `civic-appointment-${appointment.date || 'schedule'}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  getGoogleCalendarUrl(appointment) {
    const { startStr, endStr } = this.formatDateToIcs(appointment.date, appointment.timeSlot);
    const title = encodeURIComponent(`Civic Appointment: ${appointment.officeName || 'Public Service Center'}`);
    const location = encodeURIComponent(appointment.address || 'Govt Facilitation Center');
    const details = encodeURIComponent(
      `Appointment for ${appointment.serviceName || 'Civic Procedure'}. Token: ${appointment.token || appointment.id || 'N/A'}. Carry required originals and photocopies.`
    );

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
  },

  getOutlookCalendarUrl(appointment) {
    const { startStr, endStr } = this.formatDateToIcs(appointment.date, appointment.timeSlot);
    const title = encodeURIComponent(`Civic Appointment: ${appointment.officeName || 'Public Service Center'}`);
    const location = encodeURIComponent(appointment.address || 'Govt Facilitation Center');
    const details = encodeURIComponent(
      `Appointment for ${appointment.serviceName || 'Civic Procedure'}. Token: ${appointment.token || appointment.id || 'N/A'}.`
    );

    return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${startStr}&enddt=${endStr}&body=${details}&location=${location}`;
  }
};
