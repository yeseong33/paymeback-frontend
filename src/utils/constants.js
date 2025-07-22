export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const ENDPOINTS = {
  // Auth
  SIGNUP: '/auth/signup',
  SIGNIN: '/auth/signin',
  VERIFY_OTP: '/auth/verify-otp',
  RESEND_OTP: '/auth/resend-otp',
  
  // Gatherings
  GATHERINGS: '/gatherings',
  JOIN_GATHERING: '/gatherings/join',
  MY_GATHERINGS: '/gatherings/my',
  PARTICIPATED_GATHERINGS: '/gatherings/participated',
  
  // Payments
  PAYMENTS: '/payments',
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  USER: 'user',
};

export const GATHERING_STATUS = {
  ACTIVE: 'ACTIVE',
  PAYMENT_REQUESTED: 'PAYMENT_REQUESTED',
  COMPLETED: 'COMPLETED',
  CLOSED: 'CLOSED',
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
};

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PENDING]: '결제 대기',
  [PAYMENT_STATUS.PROCESSING]: '결제 처리중',
  [PAYMENT_STATUS.COMPLETED]: '결제 완료',
  [PAYMENT_STATUS.FAILED]: '결제 실패',
  [PAYMENT_STATUS.CANCELLED]: '결제 취소',
};

export const QR_CODE_EXPIRY_MINUTES = 30;
export const PAYMENT_TIMEOUT_HOURS = 24;