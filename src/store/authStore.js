import { create } from 'zustand';
import { authService } from '../services/authService';
import { STORAGE_KEYS } from '../utils/constants';

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  isAuthenticated: false,
  needsOTPVerification: false,
  pendingCredentials: null,

  initialize: () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const storedUser = authService.getStoredUser();
      
      // 토큰이 없거나 사용자 정보가 없으면 로그아웃 상태로 초기화
      if (!token || !storedUser) {
        // 토큰이나 사용자 정보가 하나라도 없으면 둘 다 삭제
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        
        set({ 
          isAuthenticated: false, 
          user: null,
          loading: false,
          needsOTPVerification: false,
          pendingCredentials: null
        });
        return;
      }

      // 토큰과 사용자 정보가 모두 있는 경우 로그인 상태로 초기화
      set({ 
        isAuthenticated: true, 
        user: storedUser,
        loading: false,
        needsOTPVerification: false,
        pendingCredentials: null
      });
    } catch (error) {
      console.log('Auth initialization error:', error);
      // 에러 발생 시 모든 인증 정보 삭제
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      
      set({ 
        isAuthenticated: false, 
        user: null,
        loading: false,
        needsOTPVerification: false,
        pendingCredentials: null
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
      
      // OTP 인증이 필요한 경우
      if (response.requiresOTP) {
        set({
          needsOTPVerification: true,
          pendingCredentials: credentials,
          isAuthenticated: false,
          user: null,
          loading: false
        });
        return response;
      }

      // 로그인 성공
      const { user, accessToken } = response;
      if (accessToken) {
        set({ 
          user, 
          isAuthenticated: true,
          needsOTPVerification: false,
          pendingCredentials: null,
          loading: false
        });
        return response;
      } else {
        throw new Error('로그인 응답에 토큰이 없습니다.');
      }
    } catch (error) {
      console.log('Sign in failed:', error);
      
      // OTP 인증이 필요한 경우 (에러로 받은 경우)
      if (error.code === 'U004') {
        console.log('Received U004 error, credentials:', credentials);

        // OTP 코드 비동기 발송 (응답을 기다리지 않음)
        authService.resendOTP(credentials.email)
          .then(() => console.log('Successfully sent OTP'))
          .catch((resendError) => console.error('Failed to send OTP:', resendError));

        // 즉시 상태 업데이트 및 OTP 페이지로 이동
        set({
          needsOTPVerification: true,
          pendingCredentials: credentials,
          isAuthenticated: false,
          user: null,
          loading: false
        });

        return {
          message: '인증 코드가 발송되었습니다. 이메일을 확인해주세요.',
          requiresOTP: true
        };
      }
      
      // 기타 에러
      set({ loading: false });
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