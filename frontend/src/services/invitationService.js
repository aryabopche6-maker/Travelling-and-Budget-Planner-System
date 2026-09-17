import api from './api';

export const invitationService = {
  verifyInvitation: async (token) => {
    const response = await api.get(`/invitations/verify?token=${token}`);
    return response.data?.data;
  },

  acceptInvitation: async (token) => {
    const response = await api.post(`/invitations/accept?token=${token}`);
    return response.data;
  },

  declineInvitation: async (token) => {
    const response = await api.post(`/invitations/decline?token=${token}`);
    return response.data;
  }
};
