import { create } from 'zustand';
import { gatheringService } from '../services/gatheringService';

export const useGatheringStore = create((set, get) => ({
  gatherings: [],
  currentGathering: null,
  loading: false,
  error: null,

  createGathering: async (gatheringData) => {
    set({ loading: true, error: null });
    try {
      const response = await gatheringService.createGathering(gatheringData);
      set({ currentGathering: response, loading: false });
      return response;
    } catch (error) {
      console.log('Failed to create gathering:', error);
      // 개발 모드에서 백엔드 없이 테스트하기 위한 임시 데이터
      if (import.meta.env.DEV) {
        const mockGathering = {
          id: Date.now(),
          ...gatheringData,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          participants: [
            { id: 1, name: '테스트 사용자', email: 'test@example.com' }
          ]
        };
        set({ currentGathering: mockGathering, loading: false });
        return mockGathering;
      }
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
      // 개발 모드에서 백엔드 없이 테스트하기 위한 임시 데이터
      if (import.meta.env.DEV) {
        const mockGathering = {
          id: parseInt(id),
          title: '테스트 모임',
          description: '테스트용 모임입니다.',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          participants: [
            { id: 1, name: '테스트 사용자', email: 'test@example.com' }
          ]
        };
        set({ currentGathering: mockGathering, loading: false });
        return mockGathering;
      }
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
      // 개발 모드에서 백엔드 없이 테스트하기 위한 임시 데이터
      if (import.meta.env.DEV) {
        const mockGatherings = [
          {
            id: 1,
            title: '점심 모임',
            description: '오늘 점심 같이 먹어요!',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            participants: [
              { id: 1, name: '테스트 사용자', email: 'test@example.com' }
            ]
          }
        ];
        set({ gatherings: mockGatherings, loading: false });
        return { content: mockGatherings };
      }
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