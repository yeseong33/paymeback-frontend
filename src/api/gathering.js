import api from './config';

export const gatheringAPI = {
  create: (gatheringData) => {
    return api.post('/gatherings', gatheringData);
  },

  getMyGatherings: () => {
    return api.get('/gatherings/my');
  },

  getGathering: (id) => {
    return api.get(`/gatherings/${id}`);
  },

  joinGathering: (gatheringId) => {
    return api.post(`/gatherings/${gatheringId}/join`);
  },

  getParticipatedGatherings: () => {
    return api.get('/gatherings/participated');
  }
};