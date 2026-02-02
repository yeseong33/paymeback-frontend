import { create } from 'zustand';
import { authService } from '../services/authService';
import { STORAGE_KEYS, AUTH_FLOW } from '../utils/constants';

export const useAuthStore = create((set, get) => ({
  // 사용자 정보
  user: null,
  isAuthenticated: false,
  loading: true,

  // 인증 플로우 상태
  authFlow: AUTH_FLOW.IDLE,
  flowData: {
    email: null,
    name: null,
    passkeyOptions: null,
  },
  error: null,

  // WebAuthn 지원 여부
  webAuthnSupported: false,

  // ==================== 초기화 ====================

  initialize: async () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const storedUser = authService.getStoredUser();
      const webAuthnSupported = authService.isWebAuthnSupported();

      if (!token || !storedUser) {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);

        set({
          isAuthenticated: false,
          user: null,
          loading: false,
          webAuthnSupported,
        });
        return;
      }

      set({
        isAuthenticated: true,
        user: storedUser,
        loading: false,
        webAuthnSupported,
      });
    } catch (error) {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);

      set({
        isAuthenticated: false,
        user: null,
        loading: false,
        webAuthnSupported: authService.isWebAuthnSupported(),
      });
    }
  },

  // ==================== 회원가입 플로우 ====================

  /**
   * 회원가입 시작 - 이메일 입력 → OTP 발송
   */
  signupStart: async ({ email, name }) => {
    set({ loading: true, error: null });
    try {
      await authService.signupStart({ email, name });

      set({
        loading: false,
        authFlow: AUTH_FLOW.SIGNUP_OTP,
        flowData: { ...get().flowData, email, name },
      });

      return { success: true };
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  /**
   * 회원가입 OTP 검증 → Passkey 등록 화면으로
   */
  signupVerify: async ({ otpCode }) => {
    const { email } = get().flowData;
    set({ loading: true, error: null });

    try {
      await authService.signupVerify({ email, otpCode });

      // Passkey 등록 시작 (challenge 발급)
      const passkeyOptions = await authService.signupPasskeyStart();

      set({
        loading: false,
        authFlow: AUTH_FLOW.SIGNUP_PASSKEY,
        flowData: { ...get().flowData, passkeyOptions },
      });

      return { success: true };
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  /**
   * Passkey 등록 완료 → 로그인 완료
   */
  signupPasskeyFinish: async () => {
    const { passkeyOptions } = get().flowData;
    set({ loading: true, error: null });

    try {
      const { user } = await authService.signupPasskeyFinish(passkeyOptions);

      set({
        loading: false,
        isAuthenticated: true,
        user,
        authFlow: AUTH_FLOW.IDLE,
        flowData: { email: null, name: null, passkeyOptions: null },
      });

      return { success: true };
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // ==================== 로그인 플로우 ====================

  /**
   * 로그인 시작 - Passkey 인증 프롬프트
   * @param {{ email?: string }} data - email이 없으면 usernameless 로그인
   */
  loginStart: async ({ email } = {}) => {
    set({ loading: true, error: null });

    try {
      // 인증 옵션 발급 (email이 없으면 usernameless 로그인)
      const passkeyOptions = await authService.loginStart(email ? { email } : {});

      set({
        loading: false,
        authFlow: AUTH_FLOW.LOGIN_PASSKEY,
        flowData: { ...get().flowData, email: email || null, passkeyOptions },
      });

      return { success: true, passkeyOptions };
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  /**
   * Passkey 인증 완료 → 로그인 완료
   */
  loginFinish: async () => {
    const { passkeyOptions } = get().flowData;
    set({ loading: true, error: null });

    try {
      const { user } = await authService.loginFinish(passkeyOptions);

      set({
        loading: false,
        isAuthenticated: true,
        user,
        authFlow: AUTH_FLOW.IDLE,
        flowData: { email: null, name: null, passkeyOptions: null },
      });

      return { success: true };
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // ==================== 계정 복구 플로우 ====================

  /**
   * 계정 복구 시작 - 이메일 입력 → OTP 발송
   */
  recoveryStart: async ({ email }) => {
    set({ loading: true, error: null });

    try {
      await authService.recoveryStart({ email });

      set({
        loading: false,
        authFlow: AUTH_FLOW.RECOVERY_OTP,
        flowData: { ...get().flowData, email },
      });

      return { success: true };
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  /**
   * 계정 복구 OTP 검증 → 새 Passkey 등록 화면으로
   */
  recoveryVerify: async ({ otpCode }) => {
    const { email } = get().flowData;
    set({ loading: true, error: null });

    try {
      await authService.recoveryVerify({ email, otpCode });

      // 새 Passkey 등록 시작 (challenge 발급)
      const passkeyOptions = await authService.recoveryPasskeyStart();

      set({
        loading: false,
        authFlow: AUTH_FLOW.RECOVERY_PASSKEY,
        flowData: { ...get().flowData, passkeyOptions },
      });

      return { success: true };
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  /**
   * 새 Passkey 등록 완료 → 로그인 완료
   */
  recoveryPasskeyFinish: async () => {
    const { passkeyOptions } = get().flowData;
    set({ loading: true, error: null });

    try {
      const { user } = await authService.recoveryPasskeyFinish(passkeyOptions);

      set({
        loading: false,
        isAuthenticated: true,
        user,
        authFlow: AUTH_FLOW.IDLE,
        flowData: { email: null, name: null, passkeyOptions: null },
      });

      return { success: true };
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // ==================== OTP 재발송 ====================

  resendOTP: async () => {
    const { authFlow, flowData } = get();
    const { email } = flowData;
    set({ loading: true, error: null });

    try {
      if (authFlow === AUTH_FLOW.SIGNUP_OTP) {
        await authService.resendSignupOTP(email);
      } else if (authFlow === AUTH_FLOW.RECOVERY_OTP) {
        await authService.resendRecoveryOTP(email);
      }

      set({ loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  // ==================== 플로우 전환 ====================

  setAuthFlow: (flow) => {
    set({ authFlow: flow, error: null });
  },

  goToSignup: () => {
    set({
      authFlow: AUTH_FLOW.SIGNUP_EMAIL,
      flowData: { email: null, name: null, passkeyOptions: null },
      error: null,
    });
  },

  goToLogin: () => {
    set({
      authFlow: AUTH_FLOW.LOGIN_EMAIL,
      flowData: { email: null, name: null, passkeyOptions: null },
      error: null,
    });
  },

  goToRecovery: () => {
    set({
      authFlow: AUTH_FLOW.RECOVERY_EMAIL,
      flowData: { email: null, name: null, passkeyOptions: null },
      error: null,
    });
  },

  resetFlow: () => {
    authService.clearSignupSession();
    authService.clearRecoverySession();
    set({
      authFlow: AUTH_FLOW.IDLE,
      flowData: { email: null, name: null, passkeyOptions: null },
      error: null,
    });
  },

  // ==================== 로그아웃 ====================

  logout: () => {
    authService.logout();
    set({
      user: null,
      isAuthenticated: false,
      authFlow: AUTH_FLOW.IDLE,
      flowData: { email: null, name: null, passkeyOptions: null },
      error: null,
    });
  },

  // ==================== 에러 처리 ====================

  setError: (error) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));
