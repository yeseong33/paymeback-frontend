import api from './api';
import { ENDPOINTS } from '../utils/constants';

export const paymentService = {
  async processPayment(gatheringId, paymentData) {
    const response = await api.post(`${ENDPOINTS.PAYMENTS}/gatherings/${gatheringId}`, paymentData);
    return response.data;
  },

  async getMyPaymentStatus(gatheringId) {
    const response = await api.get(`${ENDPOINTS.PAYMENTS}/gatherings/${gatheringId}/my`);
    return response.data;
  },

  async getGatheringPayments(gatheringId) {
    const response = await api.get(`${ENDPOINTS.PAYMENTS}/gatherings/${gatheringId}`);
    return response.data;
  },
};