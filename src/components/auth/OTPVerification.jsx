import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { validateOTP } from '../../utils/validation';
import { AUTH_FLOW } from '../../utils/constants';
import Button from '../common/Button';
import Input from '../common/Input';

const OTPVerification = ({ onBack }) => {
  const { authFlow, flowData, signupVerify, recoveryVerify, resendOTP, goToLogin } = useAuth();

  const email = flowData?.email;
  const isSignup = authFlow === AUTH_FLOW.SIGNUP_OTP;
  const isRecovery = authFlow === AUTH_FLOW.RECOVERY_OTP;

  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5분
  const [resendCooldown, setResendCooldown] = useState(0);

  const formRef = useRef(null);
  const [focusedField, setFocusedField] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otpCode) {
      setError('인증 코드를 입력해주세요.');
      triggerShake();
      return;
    }

    if (!validateOTP(otpCode)) {
      setError('6자리 숫자를 입력해주세요.');
      triggerShake();
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isSignup) {
        await signupVerify({ otpCode });
        toast.success('이메일 인증이 완료되었습니다. Passkey를 등록해주세요.');
      } else if (isRecovery) {
        await recoveryVerify({ otpCode });
        toast.success('이메일 인증이 완료되었습니다. 새 Passkey를 등록해주세요.');
      }
    } catch (err) {
      setError(err.message || '인증에 실패했습니다.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    try {
      await resendOTP();
      toast.success('인증 코드를 재발송했습니다.');
      setCountdown(300);
      setResendCooldown(60);
    } catch (err) {
      toast.error(err.message || '재발송에 실패했습니다.');
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      goToLogin();
    }
  };

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtpCode(value);
    if (error) setError('');

    // 6자리 입력 완료 시 자동 제출
    if (value.length === 6 && countdown > 0) {
      setTimeout(() => {
        formRef.current?.requestSubmit();
      }, 300);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="card w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8 transition-colors duration-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">이메일 인증</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-1">{email}로 발송된</p>
          <p className="text-gray-600 dark:text-gray-400">6자리 인증 코드를 입력해주세요</p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} noValidate>
          <div
            className={`transition-all duration-300 ease-in-out ${focusedField ? 'scale-[1.02]' : ''}`}
          >
            <Input
              label="인증 코드"
              type="text"
              inputMode="numeric"
              value={otpCode}
              onChange={handleChange}
              onFocus={() => setFocusedField(true)}
              onBlur={() => setFocusedField(false)}
              placeholder="123456"
              error={error}
              shake={shake}
              maxLength={6}
              className={`text-center text-2xl tracking-widest transition-all duration-300 ${
                focusedField ? 'ring-2 ring-primary-500/20 shadow-lg' : ''
              }`}
            />
          </div>

          <div className="text-center mb-4">
            {countdown > 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                남은 시간: {formatTime(countdown)}
              </p>
            ) : (
              <p className="text-red-500 dark:text-red-400 text-sm">인증 시간이 만료되었습니다.</p>
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
            <Button type="button" variant="secondary" fullWidth onClick={handleBack}>
              이전
            </Button>

            <Button
              type="button"
              variant="secondary"
              fullWidth
              disabled={resendCooldown > 0}
              onClick={handleResend}
            >
              {resendCooldown > 0 ? `재발송 (${resendCooldown}초)` : '재발송'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OTPVerification;
