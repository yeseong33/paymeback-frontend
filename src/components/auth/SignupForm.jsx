import React, { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { useRecaptcha } from '../../hooks/useRecaptcha';
import { validateEmail, validateName } from '../../utils/validation';
import { RECAPTCHA } from '../../utils/constants';

const SignupForm = ({ onSwitchToLogin }) => {
  const { signupStart, webAuthnSupported } = useAuth();
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

  const [formData, setFormData] = useState({
    email: '',
    name: '',
  });
  const [errors, setErrors] = useState({});
  const [shakeFields, setShakeFields] = useState({});
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const nameRef = useRef(null);
  const emailRef = useRef(null);

  const validateForm = () => {
    const newErrors = {};
    const newShakeFields = {};

    if (!formData.name) {
      newErrors.name = '이름을 입력해주세요.';
      newShakeFields.name = true;
    } else if (!validateName(formData.name)) {
      newErrors.name = '올바른 이름을 입력해주세요.';
      newShakeFields.name = true;
    }

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
      newShakeFields.email = true;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = '올바른 이메일 주소를 입력해주세요.';
      newShakeFields.email = true;
    }

    setErrors(newErrors);
    setShakeFields(newShakeFields);

    if (Object.keys(newShakeFields).length > 0) {
      setTimeout(() => setShakeFields({}), 500);
    }

    return Object.keys(newErrors).length === 0;
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
    try {
      // reCAPTCHA 토큰 생성
      const { token: recaptchaToken, version: recaptchaVersion } = await executeRecaptcha('signup');

      await signupStart({
        email: formData.email,
        name: formData.name,
        recaptchaToken,
        recaptchaVersion,
      });

      // 성공 시 v2 상태 리셋
      resetV2();
      toast.success('인증번호를 전송했습니다. 이메일을 확인해주세요.');
    } catch (error) {
      // v2 필요 에러인 경우
      if (isV2RequiredError(error)) {
        showV2();
      } else {
        toast.error(error.message || '회원가입 요청 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef?.current) {
        nextRef.current.focus();
      }
    }
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  if (!webAuthnSupported) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0 bg-white dark:bg-gray-900 transition-colors duration-200">
        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl">
          Pay Me Back
        </h1>
        <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 md:mt-0 sm:max-w-md xl:p-0 transition-colors duration-200 mt-6">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8 text-center">
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
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0 bg-white dark:bg-gray-900 transition-colors duration-200">
      <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-3xl mb-8">
        회원가입
      </h1>
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 sm:max-w-md xl:p-0 transition-colors duration-200">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit} noValidate>
            <div>
              <label
                htmlFor="name"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                이름
              </label>
              <input
                ref={nameRef}
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, emailRef)}
                onFocus={() => handleFocus('name')}
                onBlur={handleBlur}
                disabled={loading}
                className={`bg-white dark:bg-gray-700 border text-gray-900 dark:text-white rounded-lg block w-full p-2.5 placeholder-gray-400 dark:placeholder-gray-400 transition-all duration-300 ease-in-out ${
                  errors.name
                    ? 'border-red-500 dark:border-red-400 ring-2 ring-red-500/20 dark:ring-red-400/20'
                    : focusedField === 'name'
                      ? 'border-primary-500 dark:border-primary-400 ring-2 ring-primary-500/20 dark:ring-primary-400/20 scale-[1.02] shadow-lg'
                      : 'border-gray-300 dark:border-gray-600'
                } ${shakeFields.name ? 'animate-shake' : ''} ${loading ? 'opacity-50' : ''}`}
                placeholder="이름을 입력해주세요"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                이메일
              </label>
              <input
                ref={emailRef}
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => handleFocus('email')}
                onBlur={handleBlur}
                disabled={loading}
                className={`bg-white dark:bg-gray-700 border text-gray-900 dark:text-white rounded-lg block w-full p-2.5 placeholder-gray-400 dark:placeholder-gray-400 transition-all duration-300 ease-in-out ${
                  errors.email
                    ? 'border-red-500 dark:border-red-400 ring-2 ring-red-500/20 dark:ring-red-400/20'
                    : focusedField === 'email'
                      ? 'border-primary-500 dark:border-primary-400 ring-2 ring-primary-500/20 dark:ring-primary-400/20 scale-[1.02] shadow-lg'
                      : 'border-gray-300 dark:border-gray-600'
                } ${shakeFields.email ? 'animate-shake' : ''} ${loading ? 'opacity-50' : ''}`}
                placeholder="name@company.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
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

            <button
              type="submit"
              disabled={loading || (isV2Required && !isV2Ready)}
              className="w-full text-white bg-primary-500 dark:bg-primary-500 hover:bg-primary-600 dark:hover:bg-primary-400 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:focus:ring-primary-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? '처리중...' : '인증번호 받기'}
            </button>

            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
              이미 계정이 있으신가요?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-medium text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 underline bg-transparent border-none p-0 cursor-pointer"
              >
                로그인
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
