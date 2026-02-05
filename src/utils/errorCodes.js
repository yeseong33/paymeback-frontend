// 모임 관련 에러 코드
export const GATHERING_ERROR_CODES = {
  PAYMENT_METHOD_REQUIRED: 'G007',
};

// 결제 수단 관련 에러 코드
export const PAYMENT_METHOD_ERROR_CODES = {
  CANNOT_DELETE_LAST: 'PM006',
};

export const AUTH_ERROR_CODES = {
  REQUIRES_OTP: 'U004',
  USER_NOT_FOUND: 'U001',
  INVALID_CREDENTIALS: 'U003',
  OTP_EXPIRED: 'U005',
  OTP_INVALID: 'U006',
  EMAIL_ALREADY_EXISTS: 'U007',
  TOKEN_EXPIRED: 'U008',
  INVALID_TOKEN: 'U009',
};

export const WEBAUTHN_ERROR_CODES = {
  NOT_SUPPORTED: 'W001',
  CANCELLED: 'W002',
  TIMEOUT: 'W003',
  INVALID_STATE: 'W004',
  NOT_ALLOWED: 'W005',
  SECURITY_ERROR: 'W006',
  UNKNOWN: 'W099',
};

export const WEBAUTHN_ERROR_MESSAGES = {
  [WEBAUTHN_ERROR_CODES.NOT_SUPPORTED]: '이 브라우저는 Passkey를 지원하지 않습니다.',
  [WEBAUTHN_ERROR_CODES.CANCELLED]: '인증이 취소되었습니다.',
  [WEBAUTHN_ERROR_CODES.TIMEOUT]: '인증 시간이 초과되었습니다.',
  [WEBAUTHN_ERROR_CODES.INVALID_STATE]: '이미 등록된 Passkey입니다.',
  [WEBAUTHN_ERROR_CODES.NOT_ALLOWED]: '인증이 허용되지 않았습니다. 다시 시도해주세요.',
  [WEBAUTHN_ERROR_CODES.SECURITY_ERROR]: '보안 오류가 발생했습니다. HTTPS 연결을 확인해주세요.',
  [WEBAUTHN_ERROR_CODES.UNKNOWN]: '알 수 없는 오류가 발생했습니다.',
};

/**
 * WebAuthn 에러를 표준 에러 코드로 변환
 * @param {Error} error
 * @returns {{ code: string, message: string }}
 */
export function parseWebAuthnError(error) {
  if (error.name === 'NotSupportedError') {
    return {
      code: WEBAUTHN_ERROR_CODES.NOT_SUPPORTED,
      message: WEBAUTHN_ERROR_MESSAGES[WEBAUTHN_ERROR_CODES.NOT_SUPPORTED],
    };
  }
  if (error.name === 'NotAllowedError') {
    // 사용자가 취소하거나 타임아웃
    if (error.message?.includes('timed out')) {
      return {
        code: WEBAUTHN_ERROR_CODES.TIMEOUT,
        message: WEBAUTHN_ERROR_MESSAGES[WEBAUTHN_ERROR_CODES.TIMEOUT],
      };
    }
    return {
      code: WEBAUTHN_ERROR_CODES.CANCELLED,
      message: WEBAUTHN_ERROR_MESSAGES[WEBAUTHN_ERROR_CODES.CANCELLED],
    };
  }
  if (error.name === 'InvalidStateError') {
    return {
      code: WEBAUTHN_ERROR_CODES.INVALID_STATE,
      message: WEBAUTHN_ERROR_MESSAGES[WEBAUTHN_ERROR_CODES.INVALID_STATE],
    };
  }
  if (error.name === 'SecurityError') {
    return {
      code: WEBAUTHN_ERROR_CODES.SECURITY_ERROR,
      message: WEBAUTHN_ERROR_MESSAGES[WEBAUTHN_ERROR_CODES.SECURITY_ERROR],
    };
  }
  return {
    code: WEBAUTHN_ERROR_CODES.UNKNOWN,
    message: error.message || WEBAUTHN_ERROR_MESSAGES[WEBAUTHN_ERROR_CODES.UNKNOWN],
  };
}