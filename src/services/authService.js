import api from './api';
import { ENDPOINTS, STORAGE_KEYS } from '../utils/constants';

export const authService = {
  async signUp(userData) {
    const response = await api.post(ENDPOINTS.SIGNUP, userData);
    return response.data;
  },

  async signIn(credentials) {
    const response = await api.post(ENDPOINTS.SIGNIN, credentials);
    const { accessToken } = response.data;
    
    // Store token
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    
    return response.data;
  },

  async verifyOTP(otpData) {
    const response = await api.post(ENDPOINTS.VERIFY_OTP, otpData);
    return response.data;
  },

  async resendOTP(email) {
    const response = await api.post(`${ENDPOINTS.RESEND_OTP}?email=${email}`);
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