import api from './api';

let locationTracker = null;

export const sosService = {
  getAlerts: async (tripId) => {
    const response = await api.get(`/trips/${tripId}/sos`);
    return response.data?.data || [];
  },

  getContacts: async (tripId) => {
    const response = await api.get(`/trips/${tripId}/sos/contacts`);
    return response.data?.data || [];
  },

  addContact: async (tripId, contact) => {
    const response = await api.post(`/trips/${tripId}/sos/contacts`, contact);
    return response.data?.data;
  },

  updateContact: async (tripId, contactId, contact) => {
    const response = await api.put(`/trips/${tripId}/sos/contacts/${contactId}`, contact);
    return response.data?.data;
  },

  deleteContact: async (tripId, contactId) => {
    await api.delete(`/trips/${tripId}/sos/contacts/${contactId}`);
  },

  trigger: async (tripId, payload) => {
    const response = await api.post(`/trips/${tripId}/sos`, payload);
    return response.data?.data;
  },

  updateLocation: async (tripId, sosId, location) => {
    const response = await api.put(`/trips/${tripId}/sos/${sosId}/location`, location);
    return response.data?.data;
  },

  markSafe: async (tripId, sosId) => {
    const response = await api.post(`/trips/${tripId}/sos/${sosId}/safe`);
    return response.data?.data;
  }
};

export function startSOSLocationSharing(tripId, sosId, callbacks, hasInitialLocation) {
  if (locationTracker?.tripId === tripId && locationTracker?.sosId === sosId) {
    locationTracker.callbacks = callbacks;
    return () => {
      if (locationTracker?.tripId === tripId && locationTracker?.sosId === sosId) {
        locationTracker.callbacks = null;
      }
    };
  }

  stopSOSLocationSharing();
  if (!navigator.geolocation) {
    callbacks.onError('This browser does not support location sharing.');
    return () => {};
  }

  const tracker = {
    tripId,
    sosId,
    callbacks,
    lastSentAt: hasInitialLocation ? Date.now() : 0,
    watchId: null
  };
  locationTracker = tracker;
  tracker.watchId = navigator.geolocation.watchPosition(
    (position) => {
      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      tracker.callbacks?.onLocation(location);

      if (Date.now() - tracker.lastSentAt < 15000) return;
      tracker.lastSentAt = Date.now();
      sosService.updateLocation(tripId, sosId, location)
        .then(() => tracker.callbacks?.onSync())
        .catch(() => tracker.callbacks?.onSyncError());
    },
    (error) => {
      tracker.callbacks?.onError(error.code === error.PERMISSION_DENIED
        ? 'Location permission was denied. Enable location access in your browser settings.'
        : 'Live location is temporarily unavailable.');
    },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
  );

  return () => {
    if (locationTracker === tracker) tracker.callbacks = null;
  };
}

export function stopSOSLocationSharing(sosId) {
  if (!locationTracker || (sosId != null && locationTracker.sosId !== sosId)) return;
  if (locationTracker.watchId != null && navigator.geolocation) {
    navigator.geolocation.clearWatch(locationTracker.watchId);
  }
  locationTracker = null;
}

if (typeof window !== 'undefined') {
  window.addEventListener('unauthorized', () => stopSOSLocationSharing());
  window.addEventListener('sos-user-logout', () => stopSOSLocationSharing());
}
