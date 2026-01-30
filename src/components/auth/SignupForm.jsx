import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail, validatePassword, validateName } from '../../utils/validation';

const SignupForm = ({ onSignupSuccess, onSwitchToLogin }) => {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [errors, setErrors] = useState({});
  const [shakeFields, setShakeFields] = useState({});
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Input refs for focus management
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

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

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
      newShakeFields.password = true;
    } else if (!validatePassword(formData.password)) {
      newErrors.password = '8자 이상, 대/소문자, 숫자, 특수문자를 포함해주세요.';
      newShakeFields.password = true;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
      newShakeFields.confirmPassword = true;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
      newShakeFields.confirmPassword = true;
    }

    setErrors(newErrors);
    setShakeFields(newShakeFields);

    // shake 애니메이션 후 상태 초기화
    if (Object.keys(newShakeFields).length > 0) {
      setTimeout(() => setShakeFields({}), 500);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await signUp(formData);
      toast.success('인증번호를 전송했습니다. 이메일을 확인해주세요.');
      onSignupSuccess(formData.email);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
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

  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0 bg-white dark:bg-gray-900 transition-colors duration-200">
      <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl">
        Pay Me Back
      </h1>
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 md:mt-0 sm:max-w-md xl:p-0 transition-colors duration-200 mt-6">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
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
                className={`bg-white dark:bg-gray-700 border text-gray-900 dark:text-white rounded-lg block w-full p-2.5 placeholder-gray-400 dark:placeholder-gray-400 transition-all duration-300 ease-in-out ${
                  errors.name
                    ? 'border-red-500 dark:border-red-400 ring-2 ring-red-500/20 dark:ring-red-400/20'
                    : focusedField === 'name'
                      ? 'border-primary-500 dark:border-primary-400 ring-2 ring-primary-500/20 dark:ring-primary-400/20 scale-[1.02] shadow-lg'
                      : 'border-gray-300 dark:border-gray-600'
                } ${shakeFields.name ? 'animate-shake' : ''}`}
                placeholder="이름을 입력해주세요"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                이메일
              </label>
              <input
                ref={emailRef}
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, passwordRef)}
                onFocus={() => handleFocus('email')}
                onBlur={handleBlur}
                className={`bg-white dark:bg-gray-700 border text-gray-900 dark:text-white rounded-lg block w-full p-2.5 placeholder-gray-400 dark:placeholder-gray-400 transition-all duration-300 ease-in-out ${
                  errors.email
                    ? 'border-red-500 dark:border-red-400 ring-2 ring-red-500/20 dark:ring-red-400/20'
                    : focusedField === 'email'
                      ? 'border-primary-500 dark:border-primary-400 ring-2 ring-primary-500/20 dark:ring-primary-400/20 scale-[1.02] shadow-lg'
                      : 'border-gray-300 dark:border-gray-600'
                } ${shakeFields.email ? 'animate-shake' : ''}`}
                placeholder="name@company.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                비밀번호
              </label>
              <input
                ref={passwordRef}
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, confirmPasswordRef)}
                onFocus={() => handleFocus('password')}
                onBlur={handleBlur}
                placeholder="대/소문자, 숫자, 특수문자 포함 8자 이상"
                className={`bg-white dark:bg-gray-700 border text-gray-900 dark:text-white rounded-lg block w-full p-2.5 placeholder-gray-400 dark:placeholder-gray-400 transition-all duration-300 ease-in-out ${
                  errors.password
                    ? 'border-red-500 dark:border-red-400 ring-2 ring-red-500/20 dark:ring-red-400/20'
                    : focusedField === 'password'
                      ? 'border-primary-500 dark:border-primary-400 ring-2 ring-primary-500/20 dark:ring-primary-400/20 scale-[1.02] shadow-lg'
                      : 'border-gray-300 dark:border-gray-600'
                } ${shakeFields.password ? 'animate-shake' : ''}`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                비밀번호 확인
              </label>
              <input
                ref={confirmPasswordRef}
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onFocus={() => handleFocus('confirmPassword')}
                onBlur={handleBlur}
                placeholder="비밀번호를 다시 입력해주세요"
                className={`bg-white dark:bg-gray-700 border text-gray-900 dark:text-white rounded-lg block w-full p-2.5 placeholder-gray-400 dark:placeholder-gray-400 transition-all duration-300 ease-in-out ${
                  errors.confirmPassword
                    ? 'border-red-500 dark:border-red-400 ring-2 ring-red-500/20 dark:ring-red-400/20'
                    : focusedField === 'confirmPassword'
                      ? 'border-primary-500 dark:border-primary-400 ring-2 ring-primary-500/20 dark:ring-primary-400/20 scale-[1.02] shadow-lg'
                      : 'border-gray-300 dark:border-gray-600'
                } ${shakeFields.confirmPassword ? 'animate-shake' : ''}`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white bg-primary-500 dark:bg-primary-500 hover:bg-primary-600 dark:hover:bg-primary-400 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:focus:ring-primary-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? '회원가입 중...' : '회원가입'}
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