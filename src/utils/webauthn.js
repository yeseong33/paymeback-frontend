/**
 * WebAuthn 유틸리티 함수들
 * Base64URL 인코딩/디코딩 및 옵션 변환
 */

/**
 * ArrayBuffer를 Base64URL 문자열로 변환
 * @param {ArrayBuffer} buffer
 * @returns {string}
 */
export function bufferToBase64URL(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Base64URL 문자열을 ArrayBuffer로 변환
 * @param {string} base64url
 * @returns {ArrayBuffer}
 */
export function base64URLToBuffer(base64url) {
  const base64 = base64url
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const paddedBase64 = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(paddedBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * 서버에서 받은 등록 옵션을 WebAuthn API 형식으로 변환
 * @param {Object} options - 서버에서 받은 옵션
 * @returns {Object} - navigator.credentials.create()에 전달할 publicKey 옵션
 */
export function parseCreationOptions(options) {
  const publicKey = {
    ...options,
    challenge: base64URLToBuffer(options.challenge),
    user: {
      ...options.user,
      id: base64URLToBuffer(options.user.id),
    },
  };

  if (options.excludeCredentials) {
    publicKey.excludeCredentials = options.excludeCredentials.map((cred) => ({
      ...cred,
      id: base64URLToBuffer(cred.id),
    }));
  }

  return publicKey;
}

/**
 * 서버에서 받은 인증 옵션을 WebAuthn API 형식으로 변환
 * @param {Object} options - 서버에서 받은 옵션
 * @returns {Object} - navigator.credentials.get()에 전달할 publicKey 옵션
 */
export function parseRequestOptions(options) {
  const publicKey = {
    ...options,
    challenge: base64URLToBuffer(options.challenge),
  };

  if (options.allowCredentials) {
    publicKey.allowCredentials = options.allowCredentials.map((cred) => ({
      ...cred,
      id: base64URLToBuffer(cred.id),
    }));
  }

  return publicKey;
}

/**
 * 등록 응답(credential)을 서버 전송 형식으로 변환
 * @param {PublicKeyCredential} credential
 * @returns {Object}
 */
export function serializeCreationResponse(credential) {
  const response = credential.response;
  return {
    id: credential.id,
    rawId: bufferToBase64URL(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: bufferToBase64URL(response.clientDataJSON),
      attestationObject: bufferToBase64URL(response.attestationObject),
    },
    clientExtensionResults: credential.getClientExtensionResults(),
  };
}

/**
 * 인증 응답(credential)을 서버 전송 형식으로 변환
 * @param {PublicKeyCredential} credential
 * @returns {Object}
 */
export function serializeAssertionResponse(credential) {
  const response = credential.response;
  return {
    id: credential.id,
    rawId: bufferToBase64URL(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: bufferToBase64URL(response.clientDataJSON),
      authenticatorData: bufferToBase64URL(response.authenticatorData),
      signature: bufferToBase64URL(response.signature),
      userHandle: response.userHandle
        ? bufferToBase64URL(response.userHandle)
        : null,
    },
    clientExtensionResults: credential.getClientExtensionResults(),
  };
}

/**
 * WebAuthn 지원 여부 확인
 * @returns {boolean}
 */
export function isWebAuthnSupported() {
  return !!(
    window.PublicKeyCredential &&
    navigator.credentials &&
    navigator.credentials.create &&
    navigator.credentials.get
  );
}

/**
 * 플랫폼 인증기 지원 여부 확인 (Touch ID, Face ID, Windows Hello 등)
 * @returns {Promise<boolean>}
 */
export async function isPlatformAuthenticatorAvailable() {
  if (!isWebAuthnSupported()) {
    return false;
  }
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

/**
 * Passkey 등록 수행
 * @param {Object} options - 서버에서 받은 등록 옵션
 * @returns {Promise<Object>} - 서버로 전송할 응답 데이터
 */
export async function createPasskey(options) {
  const publicKey = parseCreationOptions(options);
  const credential = await navigator.credentials.create({ publicKey });
  return serializeCreationResponse(credential);
}

/**
 * Passkey 인증 수행
 * @param {Object} options - 서버에서 받은 인증 옵션
 * @returns {Promise<Object>} - 서버로 전송할 응답 데이터
 */
export async function authenticateWithPasskey(options) {
  const publicKey = parseRequestOptions(options);
  const credential = await navigator.credentials.get({ publicKey });
  return serializeAssertionResponse(credential);
}
