import api from './api';

export const itineraryService = {
  getItinerary: async (tripId) => {
    const res = await api.get(`/trips/${tripId}/itinerary`);
    return res.data.data;
  },

  generateItinerary: async (tripId) => {
    const res = await api.post(`/trips/${tripId}/itinerary/generate`);
    return res.data.data;
  },

  addActivity: async (tripId, { dayId, title, time, category, location, estimatedCost, duration, isOutdoor }) => {
    const res = await api.post(`/trips/${tripId}/itinerary/activities`, {
      dayId,
      title,
      time,
      category,
      location,
      estimatedCost: estimatedCost || 0,
      duration: duration || '1 hr',
      isOutdoor: isOutdoor !== false,
    });
    return res.data.data;
  },

  deleteActivity: async (tripId, activityId) => {
    const res = await api.delete(`/trips/${tripId}/itinerary/activities/${activityId}`);
    return res.data;
  },
};
