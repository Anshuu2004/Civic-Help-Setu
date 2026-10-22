import { CIVIC_OFFICES } from '../data/locationOffices';

const APPOINTMENTS_STORAGE_KEY = 'civicbridge_office_tokens';
const USER_LOCATION_CACHE_KEY = 'civicbridge_user_coords';

/**
 * Calculates straight line distance in km between two lat/lng pairs using the Haversine formula.
 */
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
};

/**
 * Formats a distance in kilometers into a human-friendly string.
 */
export const formatDistance = (distanceKm) => {
  if (distanceKm == null) return 'Distance unavailable';
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
};

/**
 * Request user's current GPS location with explicit consent and accuracy fallback.
 */
export const requestUserCoordinates = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
        };
        try {
          sessionStorage.setItem(USER_LOCATION_CACHE_KEY, JSON.stringify(coords));
        } catch {
          // ignore session storage fail
        }
        resolve(coords);
      },
      (error) => {
        let message = 'Unable to retrieve location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access was denied. You can select your state and district manually.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is currently unavailable.';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out. Please try again or select manually.';
            break;
          default:
            message = error.message;
        }
        reject(new Error(message));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  });
};

/**
 * Retrieves cached user coordinates from current session if available.
 */
export const getCachedUserCoordinates = () => {
  try {
    const raw = sessionStorage.getItem(USER_LOCATION_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Returns a list of unique states present in the offices registry.
 */
export const getAvailableStates = () => {
  const states = Array.from(new Set(CIVIC_OFFICES.map((o) => o.state))).filter(Boolean);
  return states.sort();
};

/**
 * Returns a list of districts belonging to a specific state.
 */
export const getDistrictsByState = (state) => {
  if (!state) return [];
  const districts = Array.from(
    new Set(
      CIVIC_OFFICES.filter((o) => o.state.toLowerCase() === state.toLowerCase()).map(
        (o) => o.district
      )
    )
  ).filter(Boolean);
  return districts.sort();
};

/**
 * Evaluates whether an office is currently open based on current local time.
 */
export const isOfficeOpenNow = (office) => {
  if (!office?.officeHours) return false;
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday, 6 is Saturday

  // Sunday closed for government offices unless 7 days
  if (day === 0 && !office.officeHours.days.toLowerCase().includes('7 days')) {
    return false;
  }

  // Saturday check
  if (day === 6 && !office.officeHours.openSaturdays) {
    return false;
  }

  const currentHour = now.getHours() + now.getMinutes() / 60;
  // Typical gov timings: 9.5 (9:30 AM) to 17.5 (5:30 PM)
  return currentHour >= 9.5 && currentHour <= 17.5;
};

/**
 * Filters and ranks civic offices based on multi-factor location & preference criteria.
 */
export const filterCivicOffices = ({
  userCoords = null,
  searchQuery = '',
  state = '',
  district = '',
  channel = 'all', // 'all' | 'in-person' | 'online' | 'phone'
  maxRadiusKm = 100,
  serviceId = '',
  onlyOpenNow = false,
  onlyWheelchairAccessible = false,
}) => {
  const cleanQuery = searchQuery.trim().toLowerCase();

  return CIVIC_OFFICES.map((office) => {
    let distance = null;
    if (userCoords && userCoords.lat && userCoords.lng) {
      distance = calculateDistanceKm(
        userCoords.lat,
        userCoords.lng,
        office.coordinates.lat,
        office.coordinates.lng
      );
    }

    const openNow = isOfficeOpenNow(office);
    const hasWheelchair = office.features?.includes('wheelchair_accessible') || false;

    return {
      ...office,
      distanceKm: distance,
      isOpenNow: openNow,
      isWheelchairAccessible: hasWheelchair,
    };
  })
    .filter((office) => {
      // Service ID filter (e.g. from service details page)
      if (serviceId && !office.serviceIds?.includes(serviceId)) {
        return false;
      }

      // State filter
      if (state && office.state.toLowerCase() !== state.toLowerCase()) {
        return false;
      }

      // District filter
      if (district && office.district.toLowerCase() !== district.toLowerCase()) {
        return false;
      }

      // Channel filter
      if (channel !== 'all' && !office.channels.includes(channel)) {
        return false;
      }

      // Radius filter when user coordinates exist
      if (userCoords && office.distanceKm != null && office.distanceKm > maxRadiusKm) {
        return false;
      }

      // Open now filter
      if (onlyOpenNow && !office.isOpenNow) {
        return false;
      }

      // Accessibility filter
      if (onlyWheelchairAccessible && !office.isWheelchairAccessible) {
        return false;
      }

      // Text query match
      if (cleanQuery) {
        const matchesName = office.name.toLowerCase().includes(cleanQuery);
        const matchesAddress = office.address.toLowerCase().includes(cleanQuery);
        const matchesCity = office.city.toLowerCase().includes(cleanQuery);
        const matchesPin = office.pincode.includes(cleanQuery);
        const matchesCategory = office.category.toLowerCase().includes(cleanQuery);
        const matchesLandmark = office.landmark.toLowerCase().includes(cleanQuery);

        if (
          !matchesName &&
          !matchesAddress &&
          !matchesCity &&
          !matchesPin &&
          !matchesCategory &&
          !matchesLandmark
        ) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      // Closest offices first if distance is known
      if (a.distanceKm != null && b.distanceKm != null) {
        return a.distanceKm - b.distanceKm;
      }
      if (a.distanceKm != null) return -1;
      if (b.distanceKm != null) return 1;
      return a.name.localeCompare(b.name);
    });
};

/**
 * Local appointment and visit token booking storage helpers.
 */
export const getOfficeAppointments = () => {
  try {
    const raw = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const bookOfficeAppointment = ({
  officeId,
  officeName,
  serviceName,
  applicantName,
  contactNumber,
  appointmentDate,
  timeSlot,
}) => {
  const appointments = getOfficeAppointments();
  const tokenNumber = `TKN-${Math.floor(100000 + Math.random() * 900000)}`;
  const newAppointment = {
    id: `apt_${Date.now()}`,
    tokenNumber,
    officeId,
    officeName,
    serviceName,
    applicantName,
    contactNumber,
    appointmentDate,
    timeSlot,
    status: 'Confirmed',
    bookedAt: new Date().toISOString(),
  };

  appointments.unshift(newAppointment);
  try {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
  } catch (err) {
    console.error('Failed to store appointment', err);
  }
  return newAppointment;
};

export const cancelOfficeAppointment = (appointmentId) => {
  const appointments = getOfficeAppointments();
  const filtered = appointments.filter((a) => a.id !== appointmentId);
  try {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to update appointments', err);
  }
  return filtered;
};
