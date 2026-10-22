// src/services/budgetService.js
import api from './api';

export const budgetService = {
  /**
   * Get the real-time calculated budget breakdown, spending, status, and hidden costs for a trip.
   */
  getBudget: async (tripId) => {
    const response = await api.get(`/trips/${tripId}/budget`);
    return response.data?.data;
  },

  /**
   * Add a custom hidden cost to the trip's budget calculation.
   * payload: { category, description, estimatedCost, isEstimate }
   */
  addHiddenCost: async (tripId, costData) => {
    const response = await api.post(`/trips/${tripId}/budget/hidden-costs`, costData);
    return response.data?.data;
  },

  /**
   * Delete a hidden cost item by id.
   */
  deleteHiddenCost: async (tripId, costId) => {
    const response = await api.delete(`/trips/${tripId}/budget/hidden-costs/${costId}`);
    return response.data;
  },

  /**
   * Run a what-if simulation with modified variables.
   * payload: { newBudget, newDuration, newTravelers, hotelCost, transportCost, activityCost, diningCost }
   */
  simulateBudget: async (tripId, simulationData) => {
    const response = await api.post(`/trips/${tripId}/budget/simulate`, simulationData);
    return response.data?.data;
  },

  /**
   * Get smart alternatives tailored to save costs on the trip (Hotels, Transport, Activities).
   */
  getAlternatives: async (tripId) => {
    const response = await api.get(`/trips/${tripId}/budget/alternatives`);
    return response.data?.data || [];
  },

  /**
   * Apply a smart alternative option directly into the trip plan.
   */
  applyAlternative: async (tripId, alternativeId) => {
    const response = await api.post(`/trips/${tripId}/budget/alternatives/${alternativeId}/apply`);
    return response.data;
  },

  /**
   * Get budget rescue report and recommended emergency savings options.
   */
  getBudgetRescue: async (tripId) => {
    const response = await api.get(`/trips/${tripId}/budget/rescue`);
    return response.data?.data;
  },
};

export default budgetService;
