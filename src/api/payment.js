import api from './config';

export const paymentAPI = {
  createPayment: (paymentData) => {
    return api.post('/payments', paymentData);
  },

  getPaymentHistory: (gatheringId) => {
    return api.get(`/payments/history/${gatheringId}`);
  },

  getPaymentStatus: (paymentId) => {
    return api.get(`/payments/${paymentId}/status`);
  }
};