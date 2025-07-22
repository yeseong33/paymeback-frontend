import api from './api';
import { ENDPOINTS } from '../utils/constants';

export const gatheringService = {
  async createGathering(gatheringData) {
    const response = await api.post(ENDPOINTS.GATHERINGS, gatheringData);
    return response.data;
  },

  async getGathering(id) {
    const response = await api.get(`${ENDPOINTS.GATHERINGS}/${id}`);
    return response.data;
  },

  async joinGathering(qrCode) {
    const response = await api.post(ENDPOINTS.JOIN_GATHERING, { qrCode });
    return response.data;
  },

  async getMyGatherings(page = 0, size = 10) {
    const response = await api.get(`${ENDPOINTS.MY_GATHERINGS}?page=${page}&size=${size}`);
    return response.data;
  },

  async getParticipatedGatherings(page = 0, size = 10) {
    const response = await api.get(`${ENDPOINTS.PARTICIPATED_GATHERINGS}?page=${page}&size=${size}`);
    return response.data;
  },

  async createPaymentRequest(gatheringId, totalAmount) {
    const response = await api.post(
      `${ENDPOINTS.GATHERINGS}/${gatheringId}/payment-request?totalAmount=${totalAmount}`
    );
    return response.data;
  },

  async closeGathering(gatheringId) {
    const response = await api.post(`${ENDPOINTS.GATHERINGS}/${gatheringId}/close`);
    return response.data;
  },

  async getQRCodeImage(gatheringId) {
    const response = await api.get(`${ENDPOINTS.GATHERINGS}/${gatheringId}/qr-image`, {
      responseType: 'blob'
    });
    return response;
  },
};