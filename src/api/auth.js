import api from './config';

export const authAPI = {
  signUp: (userData) => {
    return api.post('/auth/signup', userData);
  },

  signIn: (credentials) => {
    return api.post('/auth/signin', credentials);
  },

  verify: (verificationData) => {
    return api.post('/auth/verify-otp', verificationData);
  },

  resendVerification: (email) => {
    return api.post('/auth/resend-otp', { email });
  }
};