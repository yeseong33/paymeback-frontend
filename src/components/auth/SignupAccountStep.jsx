import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ChevronRight, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { paymentMethodAPI, PAYMENT_PLATFORMS, BANK_CODES } from '../../api/paymentMethod';
import { useAuth } from '../../hooks/useAuth';

const SignupAccountStep = ({ onBack }) => {
  const navigate = useNavigate();
  const { completeSignup } = useAuth();
  const [step, setStep] = useState('intro'); // 'intro' | 'form'
  const [formData, setFormData] = useState({
    platform: 'TOSS',
    bankCode: 'TOSS_BANK',
    accountNumber: '',
    accountHolder: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.accountNumber.trim()) {
      toast.error('계좌번호를 입력해주세요.');
      return;
    }
    if (!formData.accountHolder.trim()) {
      toast.error('예금주명을 입력해주세요.');
      return;
    }
    if (!/^[\d-]+$/.test(formData.accountNumber)) {
      toast.error('올바른 계좌번호를 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      await paymentMethodAPI.create(formData);
      toast.success('계좌가 등록되었습니다!');
      completeSignup();
      navigate('/main', { replace: true });
    } catch (error) {
      console.error('Failed to create payment method:', error);
      toast.error(error.message || '계좌 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    completeSignup();
    navigate('/main', { replace: true });
  };

  if (step === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0 bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 sm:max-w-md overflow-hidden transition-colors duration-200">
          {/* 헤더 이미지 */}
          <div className="h-40 bg-gradient-to-br from-blue-500 to-indigo-600 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Building2 className="text-white" size={40} />
              </div>
            </div>
          </div>

          {/* 내용 */}
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
              정산받을 계좌를 등록하세요
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-6 text-sm">
              모임에서 정산금을 받기 위해<br />계좌 정보가 필요합니다
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">✓</div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Passkey 등록 완료</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">지문/얼굴 인식 설정됨</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">송금받을 계좌 등록</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">토스, 카카오페이 등 (선택)</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep('form')}
              className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors mb-3"
            >
              계좌 등록하기
              <ChevronRight size={20} />
            </button>

            <button
              onClick={handleSkip}
              className="w-full py-3 text-gray-500 dark:text-gray-400 font-medium flex items-center justify-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              나중에 할게요
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0 bg-white dark:bg-gray-900 transition-colors duration-200">
      <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-3xl mb-8">
        계좌 등록
      </h1>
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 sm:max-w-md xl:p-0 transition-colors duration-200">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {/* 플랫폼 선택 */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                송금 플랫폼
              </label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {PAYMENT_PLATFORMS.map((platform) => (
                  <option key={platform.value} value={platform.value}>
                    {platform.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 은행 선택 */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                은행
              </label>
              <select
                value={formData.bankCode}
                onChange={(e) => setFormData({ ...formData, bankCode: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {BANK_CODES.map((bank) => (
                  <option key={bank.value} value={bank.value}>
                    {bank.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 계좌번호 */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                계좌번호
              </label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder="'-' 없이 숫자만 입력"
                maxLength={50}
                disabled={submitting}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50"
              />
            </div>

            {/* 예금주명 */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                예금주명
              </label>
              <input
                type="text"
                value={formData.accountHolder}
                onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                placeholder="실명을 입력해주세요"
                maxLength={50}
                disabled={submitting}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50"
              />
            </div>

            {/* 버튼 */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors mt-6"
            >
              {submitting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                '등록하고 계속하기'
              )}
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className="w-full py-2 text-gray-500 dark:text-gray-400 font-medium text-sm hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              건너뛰기
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupAccountStep;
