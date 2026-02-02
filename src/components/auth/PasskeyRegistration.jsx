import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AUTH_FLOW } from '../../utils/constants';
import Button from '../common/Button';

const PasskeyRegistration = ({ onBack }) => {
  const navigate = useNavigate();
  const {
    authFlow,
    flowData,
    signupPasskeyFinish,
    recoveryPasskeyFinish,
    resetFlow,
  } = useAuth();

  const isSignup = authFlow === AUTH_FLOW.SIGNUP_PASSKEY;
  const isRecovery = authFlow === AUTH_FLOW.RECOVERY_PASSKEY;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 컴포넌트 마운트 시 자동으로 Passkey 등록 시작
  useEffect(() => {
    if ((isSignup || isRecovery) && flowData?.passkeyOptions) {
      handleRegisterPasskey();
    }
  }, []);

  const handleRegisterPasskey = async () => {
    setLoading(true);
    setError('');

    try {
      if (isSignup) {
        await signupPasskeyFinish();
        toast.success('회원가입이 완료되었습니다!');
      } else if (isRecovery) {
        await recoveryPasskeyFinish();
        toast.success('Passkey가 재등록되었습니다!');
      }
      navigate('/main', { replace: true });
    } catch (err) {
      setError(err.message || 'Passkey 등록에 실패했습니다.');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetFlow();
    if (onBack) {
      onBack();
    } else {
      navigate('/auth', { replace: true });
    }
  };

  const handleRetry = () => {
    setError('');
    handleRegisterPasskey();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="card w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8 transition-colors duration-200">
        <div className="text-center mb-6">
          {/* Passkey 아이콘 */}
          <div className="w-20 h-20 mx-auto mb-4 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-primary-500 dark:text-primary-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            {isRecovery ? '새 Passkey 등록' : 'Passkey 등록'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {loading
              ? '기기의 인증 방법을 사용하여 Passkey를 등록해주세요.'
              : error
                ? '등록에 실패했습니다. 다시 시도해주세요.'
                : '버튼을 눌러 Passkey를 등록하세요.'}
          </p>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="flex flex-col items-center py-8">
            <div className="animate-pulse">
              <svg
                className="w-16 h-16 text-primary-500 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                />
              </svg>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
              기기에서 인증을 완료해주세요...
            </p>
          </div>
        )}

        {/* 에러 상태 */}
        {error && !loading && (
          <div className="mb-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* 버튼 */}
        {!loading && (
          <div className="space-y-3">
            {error ? (
              <Button type="button" fullWidth onClick={handleRetry}>
                다시 시도
              </Button>
            ) : (
              <Button type="button" fullWidth onClick={handleRegisterPasskey}>
                Passkey 등록하기
              </Button>
            )}

            <Button type="button" variant="secondary" fullWidth onClick={handleCancel}>
              취소
            </Button>
          </div>
        )}

        {/* 안내 문구 */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Passkey는 Touch ID, Face ID, Windows Hello 등<br />
            기기의 생체 인증을 사용합니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasskeyRegistration;
