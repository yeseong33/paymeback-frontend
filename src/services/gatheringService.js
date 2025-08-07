import { gatheringAPI } from '../api';

export const gatheringService = {
  async createGathering(gatheringData) {
    const response = await gatheringAPI.create(gatheringData);
    return response.data;
  },

  async getGathering(id) {
    const response = await gatheringAPI.getGathering(id);
    return response.data;
  },

  async joinGathering(gatheringId) {
    const response = await gatheringAPI.joinGathering(gatheringId);
    return response.data;
  },

  async getMyGatherings() {
    const response = await gatheringAPI.getMyGatherings();
    return response.data;
  },

  async getParticipatedGatherings() {
    const response = await gatheringAPI.getParticipatedGatherings();
    return response.data;
  },
};