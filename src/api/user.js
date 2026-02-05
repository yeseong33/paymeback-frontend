import api from './config';

/**
 * 회원 탈퇴
 * - Credential (Passkey): Hard Delete
 * - PaymentMethod (계좌): Hard Delete
 * - User 정보: 익명화 (Soft Delete)
 * - Gathering, Settlement 등: 보존
 */
export const userAPI = {
  /**
   * 회원 탈퇴
   * @returns {Promise<void>}
   */
  deleteMe: () => api.delete('/users/me'),
};
