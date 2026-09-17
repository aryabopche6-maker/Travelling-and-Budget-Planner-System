// src/services/tripService.js
import api from './api';

export const tripService = {
  getMyTrips: async () => {
    try {
      const response = await api.get('/trips');
      return response.data?.data || [];
    } catch (error) {
      console.error("Error fetching trips:", error);
      return [];
    }
  },
  
  getPlaces: async (tripId, location, radius) => {
    let url = `/trips/${tripId}/places`;
    if (location || radius) {
      const params = new URLSearchParams();
      if (location) params.append('location', location);
      if (radius) params.append('radius', radius);
      url += `?${params.toString()}`;
    }
    const response = await api.get(url);
    return response.data?.data;
  },

  getHotels: async (tripId, location, radius) => {
    let url = `/trips/${tripId}/hotels`;
    if (location || radius) {
      const params = new URLSearchParams();
      if (location) params.append('location', location);
      if (radius) params.append('radius', radius);
      url += `?${params.toString()}`;
    }
    const response = await api.get(url);
    return response.data?.data;
  },
  
  getTrip: async (tripId) => {
    const response = await api.get(`/trips/${tripId}`);
    if (!response.data?.data) throw new Error("Trip not found");
    return response.data.data;
  },

  createTrip: async (tripData) => {
    const response = await api.post('/trips', tripData);
    return response.data?.data;
  },

  updateTrip: async (tripId, tripData) => {
    const response = await api.put(`/trips/${tripId}`, tripData);
    return response.data?.data;
  },

  deleteTrip: async (tripId) => {
    const response = await api.delete(`/trips/${tripId}`);
    return response.data;
  },

  // Invitation methods
  inviteMember: async (tripId, email) => {
    const response = await api.post(`/trips/${tripId}/invitations`, { email });
    return response.data;
  },

  getInvitations: async (tripId) => {
    const response = await api.get(`/trips/${tripId}/invitations`);
    return response.data?.data || [];
  },

  deleteInvitation: async (tripId, invitationId) => {
    const response = await api.delete(`/trips/${tripId}/invitations/${invitationId}`);
    return response.data;
  }
};
