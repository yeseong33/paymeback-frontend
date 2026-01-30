import { authAPI } from '../api';
import { STORAGE_KEYS } from '../utils/constants';
import { AUTH_ERROR_CODES } from '../utils/errorCodes';

export const authService = {
  async signUp(userData) {
    const response = await authAPI.signUp(userData);
    return response.data;
  },

  async signIn(credentials) {
    const response = await authAPI.signIn(credentials);
    
    // ApiResponse 구조에 맞게 데이터 접근
    const { accessToken } = response.data.data;
    
    // Store token
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, `Bearer ${accessToken}`);
    
    // Create basic user info from credentials
    const user = {
      email: credentials.email,
    };
    
    // Store user info
    this.setStoredUser(user);
    
    return {
      accessToken,
      user,
    };
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
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      localStorage.removeItem(STORAGE_KEYS.USER);
      return null;
    }
  },

  setStoredUser(user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
};