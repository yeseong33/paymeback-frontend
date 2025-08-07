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
      // 토큰이 없으면 바로 초기화 완료
      if (!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)) {
        set({ 
          isAuthenticated: false, 
          user: null,
          loading: false,
          needsOTPVerification: false,
          pendingCredentials: null
        });
        return;
      }

      const storedUser = authService.getStoredUser();
      
      set({ 
        isAuthenticated: true, 
        user: storedUser,
        loading: false,
        needsOTPVerification: false,
        pendingCredentials: null
      });
    } catch (error) {
      console.log('Auth initialization error:', error);
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
          user: null
        });
        return response;
      }

      // 로그인 성공
      const { user } = response;
      authService.setStoredUser(user);
      set({ 
        user, 
        isAuthenticated: true,
        needsOTPVerification: false,
        pendingCredentials: null
      });
      
      return response;
    } catch (error) {
      console.log('Sign in failed:', error);
      
      // OTP 인증이 필요한 경우 (에러로 받은 경우)
      if (error.code === 'U004') {
        console.log('Received U004 error, credentials:', credentials);
        
        // OTP 코드 자동 발송 (먼저 시도)
        try {
          console.log('Attempting to send OTP to:', credentials.email);
          await authService.resendOTP(credentials.email);
          console.log('Successfully sent OTP');
          
          // 성공 시 상태 업데이트
          set({
            needsOTPVerification: true,
            pendingCredentials: credentials,
            isAuthenticated: false,
            user: null
          });
          
          // 성공 메시지 반환
          return {
            message: '인증 코드가 발송되었습니다. 이메일을 확인해주세요.',
            requiresOTP: true
          };
        } catch (resendError) {
          console.error('Failed to send OTP:', resendError);
          throw resendError;
        }
      }
      
      // 기타 에러
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