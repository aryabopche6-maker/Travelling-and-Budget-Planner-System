// src/services/expenseService.js
import api from './api';

export const expenseService = {
  /**
   * Upload a payment proof file (image/PDF, max 5MB).
   * Returns the safe server-side filename identifier.
   */
  uploadProof: async (tripId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/trips/${tripId}/expenses/upload-proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // Backend returns { proofUrl: "uuid.jpg" }
    return response.data?.data?.proofUrl;
  },

  /**
   * Get an authenticated Blob URL for the expense proof file.
   * Only trip members can access this URL.
   */
  getProofBlobUrl: async (tripId, expenseId) => {
    const response = await api.get(`/trips/${tripId}/expenses/${expenseId}/proof-file`, {
      responseType: 'blob',
    });
    return URL.createObjectURL(response.data);
  },

  getExpenses: async (tripId) => {
    const response = await api.get(`/trips/${tripId}/expenses`);
    return response.data?.data || [];
  },

  addExpense: async (tripId, expenseData) => {
    const response = await api.post(`/trips/${tripId}/expenses`, expenseData);
    return response.data?.data;
  },

  approveExpense: async (tripId, expenseId) => {
    const response = await api.post(`/trips/${tripId}/expenses/${expenseId}/approve`);
    return response.data?.data;
  },

  disputeExpense: async (tripId, expenseId, reason) => {
    const response = await api.post(`/trips/${tripId}/expenses/${expenseId}/dispute`, { reason });
    return response.data?.data;
  },

  settleExpense: async (tripId, expenseId) => {
    const response = await api.post(`/trips/${tripId}/expenses/${expenseId}/settle`);
    return response.data?.data;
  },
};
