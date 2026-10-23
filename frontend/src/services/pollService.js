// src/services/pollService.js
import api from './api';

export const pollService = {
  getTripPolls: async (tripId) => {
    const response = await api.get(`/trips/${tripId}/polls`);
    return response.data?.data || [];
  },

  createPoll: async (tripId, pollData) => {
    const response = await api.post(`/trips/${tripId}/polls`, pollData);
    return response.data?.data;
  },

  castVote: async (tripId, pollId, optionId) => {
    const response = await api.post(`/trips/${tripId}/polls/${pollId}/vote`, { optionId });
    return response.data?.data;
  },

  lockPoll: async (tripId, pollId, optionId = null) => {
    const response = await api.post(`/trips/${tripId}/polls/${pollId}/lock`, null, {
      params: optionId ? { optionId } : {}
    });
    return response.data?.data;
  }
};
