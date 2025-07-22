import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, loading, isAuthenticated, initialize, signUp, signIn, verifyOTP, resendOTP, logout } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

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