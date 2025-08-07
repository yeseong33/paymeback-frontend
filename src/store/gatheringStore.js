import { create } from 'zustand';
import { gatheringService } from '../services/gatheringService';

export const useGatheringStore = create((set, get) => ({
  gatherings: [],
  currentGathering: null,
  loading: false,
  error: null,

  initialize: () => {
    set({
      gatherings: [],
      currentGathering: null,
      loading: false,
      error: null
    });
  },

  createGathering: async (gatheringData) => {
    set({ loading: true, error: null });
    try {
      const response = await gatheringService.createGathering(gatheringData);
      set({ currentGathering: response, loading: false });
      return response;
    } catch (error) {
      console.log('Failed to create gathering:', error);
      // API 에러를 그대로 전달
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  getGathering: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await gatheringService.getGathering(id);
      set({ currentGathering: response, loading: false });
      return response;
    } catch (error) {
      console.log('Failed to get gathering:', error);
      // API 에러를 그대로 전달
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  joinGathering: async (qrCode) => {
    set({ loading: true, error: null });
    try {
      const response = await gatheringService.joinGathering(qrCode);
      set({ currentGathering: response, loading: false });
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  getMyGatherings: async () => {
    set({ loading: true, error: null });
    try {
      const response = await gatheringService.getMyGatherings();
      set({ gatherings: response.content || [], loading: false });
      return response;
    } catch (error) {
      console.log('Failed to fetch gatherings:', error);
      // API 에러를 그대로 전달
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createPaymentRequest: async (gatheringId, totalAmount) => {
    set({ loading: true, error: null });
    try {
      const response = await gatheringService.createPaymentRequest(gatheringId, totalAmount);
      set({ currentGathering: response, loading: false });
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  refreshGathering: async () => {
    const current = get().currentGathering;
    if (current?.id) {
      await get().getGathering(current.id);
    }
  },

  clearCurrentGathering: () => {
    set({ currentGathering: null });
  },
}));