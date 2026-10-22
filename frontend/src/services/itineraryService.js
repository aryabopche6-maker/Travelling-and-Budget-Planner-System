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

  addActivity: async (tripId, { dayId, title, time, category, location, estimatedCost, duration, isOutdoor, imageUrl }) => {
    const res = await api.post(`/trips/${tripId}/itinerary/activities`, {
      dayId,
      title,
      time,
      category,
      location,
      estimatedCost: estimatedCost || 0,
      duration: duration || '1 hr',
      isOutdoor: isOutdoor !== false,
      imageUrl: imageUrl || null
    });
    return res.data.data;
  },

  deleteActivity: async (tripId, activityId) => {
    const res = await api.delete(`/trips/${tripId}/itinerary/activities/${activityId}`);
    return res.data;
  },

  // Selected Places Management
  getSelectedPlaces: async (tripId) => {
    const res = await api.get(`/trips/${tripId}/selected-places`);
    return res.data.data || [];
  },

  addSelectedPlace: async (tripId, place) => {
    const res = await api.post(`/trips/${tripId}/selected-places`, {
      name: place.name,
      category: place.category,
      location: place.location,
      estimatedCost: place.estimatedCost,
      duration: place.duration,
      imageUrl: place.imageUrl,
      latitude: place.latitude,
      longitude: place.longitude
    });
    return res.data.data;
  },

  removeSelectedPlace: async (tripId, placeName) => {
    const res = await api.delete(`/trips/${tripId}/selected-places/${encodeURIComponent(placeName)}`);
    return res.data;
  },

  // Selected Hotel Management
  getSelectedHotel: async (tripId) => {
    const res = await api.get(`/trips/${tripId}/selected-hotel`);
    return res.data.data;
  },

  selectHotel: async (tripId, hotel) => {
    const res = await api.post(`/trips/${tripId}/selected-hotel`, {
      name: hotel.name,
      location: hotel.location,
      pricePerNight: hotel.pricePerNight,
      currency: hotel.currency || 'INR',
      rating: hotel.rating,
      hotelType: hotel.hotelType,
      imageUrl: hotel.imageUrl,
      latitude: hotel.latitude,
      longitude: hotel.longitude
    });
    return res.data.data;
  },

  removeSelectedHotel: async (tripId) => {
    const res = await api.delete(`/trips/${tripId}/selected-hotel`);
    return res.data;
  }
};
