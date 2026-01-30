import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail } from '../../utils/validation';

const LoginForm = ({ onSwitchToSignup }) => {
  const { signIn, needsOTPVerification } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [shakeFields, setShakeFields] = useState({});
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Input refs for focus management
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const validateForm = () => {
    const newErrors = {};
    const newShakeFields = {};

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
      const response = await signIn(formData);
      
      // OTP 인증이 필요한 경우 OTP 인증 페이지로 이동
      if (response?.requiresOTP) {
        navigate('/auth', {
          state: {
            view: 'otp',
            email: formData.email,
            mode: 'signin'
          },
          replace: true
        });
        return;
      }
      
      // 로그인 성공 (OTP가 필요하지 않은 경우에만)
      if (!response?.requiresOTP && response?.accessToken) {
        toast.success('로그인되었습니다.');
        navigate('/main', { replace: true });
        return;
      }
      
    } catch (error) {
      
      // U004 에러는 authStore에서 자동으로 처리됨
      if (error.code === 'U004') {
        toast.success('인증 코드가 발송되었습니다. 이메일을 확인해주세요.');
        navigate('/auth', {
          state: {
            view: 'otp',
            email: formData.email,
            mode: 'signin'
          },
          replace: true
        });
        return;
      }

      if (error.code === 'U003') {
        toast.error('비밀번호가 일치하지 않습니다.');
        return;
      }
      
      toast.error(error.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

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
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h1 className="text-center text-3xl font-bold text-primary-500 dark:text-primary-400">
            Pay Me Back
          </h1>
          <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-gray-900 dark:text-white">
            Sign in
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900 dark:text-gray-200">
                Email address
              </label>
              <div className="mt-2">
                <input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  onKeyDown={(e) => handleKeyDown(e, passwordRef)}
                  onFocus={() => handleFocus('email')}
                  onBlur={handleBlur}
                  className={`block w-full rounded-md border bg-white dark:bg-gray-800 px-3 py-1.5 text-base text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 sm:text-sm/6 transition-all duration-300 ease-in-out ${
                    errors.email
                      ? 'border-red-500 dark:border-red-400 ring-2 ring-red-500/20 dark:ring-red-400/20'
                      : focusedField === 'email'
                        ? 'border-primary-500 dark:border-primary-400 ring-2 ring-primary-500/20 dark:ring-primary-400/20 scale-[1.02] shadow-lg'
                        : 'border-gray-300 dark:border-gray-600'
                  } ${shakeFields.email ? 'animate-shake' : ''}`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900 dark:text-gray-200">
                  Password
                </label>
                <div className="text-sm">
                  <a href="#" className="font-semibold text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300">
                    Forgot password?
                  </a>
                </div>
              </div>
              <div className="mt-2">
                <input
                  ref={passwordRef}
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => handleFocus('password')}
                  onBlur={handleBlur}
                  className={`block w-full rounded-md border bg-white dark:bg-gray-800 px-3 py-1.5 text-base text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 sm:text-sm/6 transition-all duration-300 ease-in-out ${
                    errors.password
                      ? 'border-red-500 dark:border-red-400 ring-2 ring-red-500/20 dark:ring-red-400/20'
                      : focusedField === 'password'
                        ? 'border-primary-500 dark:border-primary-400 ring-2 ring-primary-500/20 dark:ring-primary-400/20 scale-[1.02] shadow-lg'
                        : 'border-gray-300 dark:border-gray-600'
                  } ${shakeFields.password ? 'animate-shake' : ''}`}
                />
                {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md bg-primary-500 dark:bg-primary-500 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-primary-600 dark:hover:bg-primary-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:focus-visible:outline-primary-400 disabled:opacity-50 transition-colors duration-200"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm/6 text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <button 
              type="button"
              onClick={onSwitchToSignup}
              className="font-semibold text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 underline bg-transparent border-none p-0 cursor-pointer"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
  );
};

export default LoginForm;