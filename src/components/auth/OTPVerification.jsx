import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { validateOTP } from '../../utils/validation';
import Button from '../common/Button';
import Input from '../common/Input';
import ThemeToggle from '../common/ThemeToggle';


const OTPVerification = ({ onVerificationSuccess, email: propEmail, mode: propMode, password: propPassword, onBack }) => {
  const { verifyOTP, resendOTP, signIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // props 우선, 없으면 location.state에서 가져옴
  const email = propEmail || location.state?.email;
  const mode = propMode || location.state?.mode;
  const password = propPassword || location.state?.password;

  useEffect(() => {
    console.log('OTPVerification mounted with:', { email, mode, propEmail, propMode });
  }, [email, mode, propEmail, propMode]);

  useEffect(() => {
    if (!email || !mode) {
      navigate('/auth');
    }
  }, [email, mode, navigate]);
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateOTP(otpCode)) {
      setError('6자리 숫자를 입력해주세요.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const verificationData = { email, otpCode };
      
      if (mode === 'signin') {
        // 로그인 시 OTP 인증
        await verifyOTP(verificationData);
        // 인증 성공 후 다시 로그인 시도
        await signIn({ email, password });
        onVerificationSuccess();
      } else {
        // 회원가입 시 OTP 인증
        await verifyOTP(verificationData);
        toast.success('이메일 인증이 완료되었습니다.\n다시 로그인 해주세요.');
        onVerificationSuccess();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await resendOTP(email);
      toast.success('인증 코드가 재발송되었습니다.');
      setCountdown(300);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setResendLoading(false);
    }
  };
  
  const handleBack = () => {
    navigate('/auth');
  };

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtpCode(value);
    if (error) setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-white dark:bg-gray-900 transition-colors duration-200 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="card w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8 transition-colors duration-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">이메일 인증</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-1">
            {email}로 발송된
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            6자리 인증 코드를 입력해주세요
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="인증 코드"
            type="text"
            inputMode="numeric"
            value={otpCode}
            onChange={handleChange}
            placeholder="123456"
            error={error}
            maxLength={6}
            className="text-center text-2xl tracking-widest"
            required
          />

          <div className="text-center mb-4">
            {countdown > 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                남은 시간: {formatTime(countdown)}
              </p>
            ) : (
              <p className="text-red-500 dark:text-red-400 text-sm">
                인증 시간이 만료되었습니다.
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            fullWidth 
            loading={loading}
            disabled={otpCode.length !== 6 || countdown === 0}
            className="mb-4"
          >
            인증 확인
          </Button>

          <div className="flex gap-2">
            <Button 
              type="button"
              variant="secondary"
              fullWidth
              onClick={handleBack}
            >
              이전
            </Button>
            
            <Button 
              type="button"
              variant="secondary"
              fullWidth
              loading={resendLoading}
              onClick={handleResend}
            >
              재발송
            </Button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default OTPVerification;