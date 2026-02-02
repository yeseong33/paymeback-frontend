import React, { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { useRecaptcha } from '../../hooks/useRecaptcha';
import { validateEmail } from '../../utils/validation';
import { RECAPTCHA } from '../../utils/constants';

const RecoveryForm = ({ onSwitchToLogin }) => {
  const { recoveryStart, webAuthnSupported } = useAuth();
  const {
    executeRecaptcha,
    showV2,
    isV2Required,
    v2Ref,
    onV2Change,
    onV2Expired,
    resetV2,
    isV2RequiredError,
    isV2Ready,
  } = useRecaptcha();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [shakeField, setShakeField] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(false);

  const emailRef = useRef(null);

  const validateForm = () => {
    if (!email) {
      setError('이메일을 입력해주세요.');
      setShakeField(true);
      setTimeout(() => setShakeField(false), 500);
      return false;
    }
    if (!validateEmail(email)) {
      setError('올바른 이메일 주소를 입력해주세요.');
      setShakeField(true);
      setTimeout(() => setShakeField(false), 500);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // v2가 필요한데 아직 완료 안됐으면 경고
    if (isV2Required && !isV2Ready) {
      toast.error('보안 인증을 완료해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // reCAPTCHA 토큰 생성
      const { token: recaptchaToken, version: recaptchaVersion } = await executeRecaptcha('recovery');

      await recoveryStart({ email, recaptchaToken, recaptchaVersion });

      // 성공 시 v2 상태 리셋
      resetV2();
      toast.success('인증번호를 전송했습니다. 이메일을 확인해주세요.');
    } catch (err) {
      // v2 필요 에러인 경우
      if (isV2RequiredError(err)) {
        showV2();
      } else {
        toast.error(err.message || '요청 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  if (!webAuthnSupported) {
    return (
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h1 className="text-center text-3xl font-bold text-primary-500 dark:text-primary-400">
            Pay Me Back
          </h1>
          <div className="mt-10 text-center">
            <div className="text-red-500 dark:text-red-400">
              <svg
                className="w-16 h-16 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h2 className="text-lg font-semibold mb-2">Passkey 미지원 브라우저</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                이 브라우저는 Passkey(WebAuthn)를 지원하지 않습니다.
                <br />
                최신 버전의 Chrome, Safari, Firefox, Edge를 사용해주세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h1 className="text-center text-3xl font-bold text-primary-500 dark:text-primary-400">
          Pay Me Back
        </h1>
        <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-gray-900 dark:text-white">
          계정 복구
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          이메일 인증 후 새 Passkey를 등록합니다
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label
              htmlFor="email"
              className="block text-sm/6 font-medium text-gray-900 dark:text-gray-200"
            >
              이메일 주소
            </label>
            <div className="mt-2">
              <input
                ref={emailRef}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={handleChange}
                onFocus={() => setFocusedField(true)}
                onBlur={() => setFocusedField(false)}
                disabled={loading}
                className={`block w-full rounded-md border bg-white dark:bg-gray-800 px-3 py-1.5 text-base text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 sm:text-sm/6 transition-all duration-300 ease-in-out ${
                  error
                    ? 'border-red-500 dark:border-red-400 ring-2 ring-red-500/20 dark:ring-red-400/20'
                    : focusedField
                      ? 'border-primary-500 dark:border-primary-400 ring-2 ring-primary-500/20 dark:ring-primary-400/20 scale-[1.02] shadow-lg'
                      : 'border-gray-300 dark:border-gray-600'
                } ${shakeField ? 'animate-shake' : ''} ${loading ? 'opacity-50' : ''}`}
                placeholder="가입한 이메일 주소를 입력하세요"
              />
              {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
            </div>
          </div>

          {/* reCAPTCHA v2 (필요 시에만 표시) */}
          {isV2Required && RECAPTCHA.V2_SITE_KEY && (
            <div className="flex justify-center">
              <ReCAPTCHA
                ref={v2Ref}
                sitekey={RECAPTCHA.V2_SITE_KEY}
                onChange={onV2Change}
                onExpired={onV2Expired}
                theme="light"
              />
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || (isV2Required && !isV2Ready)}
              className="flex w-full justify-center rounded-md bg-primary-500 dark:bg-primary-500 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-primary-600 dark:hover:bg-primary-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:focus-visible:outline-primary-400 disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  처리중...
                </>
              ) : (
                '인증번호 받기'
              )}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm/6 text-gray-500 dark:text-gray-400">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-semibold text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 underline bg-transparent border-none p-0 cursor-pointer"
          >
            로그인으로 돌아가기
          </button>
        </p>
      </div>
    </div>
  );
};

export default RecoveryForm;
