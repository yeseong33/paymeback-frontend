import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, loading, isAuthenticated, initialize, signUp, signIn, verifyOTP, resendOTP, logout } = useAuthStore();

  useEffect(() => {
    // 항상 초기화 실행 (토큰 체크는 initialize 내부에서 수행)
    initialize();
  }, [initialize]);

  return {
    user,
    loading,
    isAuthenticated,
    signUp,
    signIn,
    verifyOTP,
    resendOTP,
    logout,
  };
};