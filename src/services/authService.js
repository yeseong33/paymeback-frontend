import { authAPI } from '../api';
import { STORAGE_KEYS } from '../utils/constants';
import { AUTH_ERROR_CODES } from '../utils/errorCodes';

export const authService = {
  async signUp(userData) {
    const response = await authAPI.signUp(userData);
    return response.data;
  },

  async signIn(credentials) {
    try {
      const response = await authAPI.signIn(credentials);
      const { token, user } = response.data;
      
      // Store token and user info
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      this.setStoredUser(user);
      
      return response.data;
    } catch (error) {
      // 모든 에러를 그대로 전파 (OTP 필요 에러 포함)
      throw error;
    }
  },

  async verifyOTP(verificationData) {
    const response = await authAPI.verify(verificationData);
    return response.data;
  },

  async resendOTP(email) {
    const response = await authAPI.resendVerification(email);
    return response.data;
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  isAuthenticated() {
    return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  getStoredUser() {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  },

  setStoredUser(user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
};