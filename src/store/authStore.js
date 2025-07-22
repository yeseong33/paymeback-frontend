import { create } from 'zustand';
import { authService } from '../services/authService';
import { STORAGE_KEYS } from '../utils/constants';

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  isAuthenticated: false,

  initialize: () => {
    try {
      const isAuth = authService.isAuthenticated();
      const storedUser = authService.getStoredUser();
      
      set({ 
        isAuthenticated: isAuth, 
        user: storedUser,
        loading: false 
      });
    } catch (error) {
      console.log('Auth initialization error:', error);
      // 백엔드 연결 실패 시 기본값으로 설정
      set({ 
        isAuthenticated: false, 
        user: null,
        loading: false 
      });
    }
  },

  signUp: async (userData) => {
    try {
      const response = await authService.signUp(userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  signIn: async (credentials) => {
    try {
      const response = await authService.signIn(credentials);
      const user = { email: credentials.email }; // 실제로는 서버에서 받아야 함
      
      authService.setStoredUser(user);
      set({ user, isAuthenticated: true });
      
      return response;
    } catch (error) {
      console.log('Sign in failed:', error);
      // 개발 모드에서 백엔드 없이 테스트하기 위한 임시 로그인
      if (import.meta.env.DEV) {
        const tempUser = { 
          email: credentials.email, 
          name: credentials.email.split('@')[0] 
        };
        authService.setStoredUser(tempUser);
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'temp-token');
        
        set({ 
          user: tempUser, 
          isAuthenticated: true 
        });
        
        return { success: true };
      }
      throw error;
    }
  },

  verifyOTP: async (otpData) => {
    try {
      const response = await authService.verifyOTP(otpData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  resendOTP: async (email) => {
    try {
      const response = await authService.resendOTP(email);
      return response;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },
}));