import { paymentAPI } from '../api';

export const paymentService = {
  async createPayment(paymentData) {
    const response = await paymentAPI.createPayment(paymentData);
    return response.data;
  },

  async getPaymentHistory(gatheringId) {
    const response = await paymentAPI.getPaymentHistory(gatheringId);
    return response.data;
  },

  async getPaymentStatus(paymentId) {
    const response = await paymentAPI.getPaymentStatus(paymentId);
    return response.data;
  },
};