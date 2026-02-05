import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Trash2, Star, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import DOMPurify from 'dompurify';
import Header from '../components/common/Header';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { paymentMethodAPI, PAYMENT_PLATFORMS, BANK_CODES } from '../api/paymentMethod';

// XSS 방어
const sanitizeText = (text) => {
  if (!text) return '';
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
};

const PaymentMethodPage = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    platform: 'TOSS',
    bankCode: 'TOSS_BANK',
    accountNumber: '',
    accountHolder: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // 결제 수단 목록 조회
  const fetchPaymentMethods = async () => {
    try {
      const response = await paymentMethodAPI.getMyPaymentMethods();
      setPaymentMethods(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
      toast.error('결제 수단 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  // 결제 수단 등록
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
    // 계좌번호 검증 (숫자와 하이픈만)
    if (!/^[\d-]+$/.test(formData.accountNumber)) {
      toast.error('올바른 계좌번호를 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      await paymentMethodAPI.create(formData);
      toast.success('결제 수단이 등록되었습니다.');
      setShowAddModal(false);
      setFormData({
        platform: 'TOSS',
        bankCode: 'TOSS_BANK',
        accountNumber: '',
        accountHolder: '',
      });
      fetchPaymentMethods();
    } catch (error) {
      console.error('Failed to create payment method:', error);
      toast.error(sanitizeText(error.message) || '결제 수단 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // 기본 결제 수단 설정
  const handleSetDefault = async (id) => {
    try {
      await paymentMethodAPI.setDefault(id);
      toast.success('기본 결제 수단으로 설정되었습니다.');
      fetchPaymentMethods();
    } catch (error) {
      console.error('Failed to set default:', error);
      toast.error(sanitizeText(error.message) || '설정에 실패했습니다.');
    }
  };

  // 결제 수단 삭제
  const handleDelete = async (id) => {
    if (!confirm('이 결제 수단을 삭제하시겠습니까?')) return;

    try {
      await paymentMethodAPI.delete(id);
      toast.success('결제 수단이 삭제되었습니다.');
      fetchPaymentMethods();
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error(sanitizeText(error.message) || '삭제에 실패했습니다.');
    }
  };

  // 플랫폼명 가져오기
  const getPlatformLabel = (value) => {
    return PAYMENT_PLATFORMS.find(p => p.value === value)?.label || value;
  };

  // 은행명 가져오기
  const getBankLabel = (value) => {
    return BANK_CODES.find(b => b.value === value)?.label || value;
  };

  return (
    <div className="page">
      <Header title="결제 수단 관리" showBack={true} />

      <div className="page-content">
        {/* 등록된 결제 수단 목록 */}
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">내 계좌</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {paymentMethods.length}개
            </span>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              로딩 중...
            </div>
          ) : paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    method.isDefault
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        method.isDefault
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        <Building2 size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {sanitizeText(getBankLabel(method.bankCode))}
                          </span>
                          {method.isDefault && (
                            <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                              기본
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {sanitizeText(method.accountNumber)} · {sanitizeText(method.accountHolder)}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {sanitizeText(getPlatformLabel(method.platform))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {!method.isDefault && (
                        <button
                          onClick={() => handleSetDefault(method.id)}
                          className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                          title="기본 설정"
                        >
                          <Star size={18} />
                        </button>
                      )}
                      {paymentMethods.length > 1 ? (
                        <button
                          onClick={() => handleDelete(method.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="삭제"
                        >
                          <Trash2 size={18} />
                        </button>
                      ) : (
                        <button
                          disabled
                          className="p-2 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                          title="최소 1개의 계좌가 필요합니다"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard size={48} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400 mb-1">등록된 계좌가 없습니다</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                정산 시 송금받을 계좌를 등록해주세요
              </p>
            </div>
          )}
        </div>

        {/* 안내 문구 */}
        <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-4">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            등록된 기본 계좌로 정산 금액을 송금받을 수 있습니다.
            토스 딥링크를 통해 빠른 송금이 지원됩니다.
          </p>
        </div>

        {/* 추가 버튼 */}
        <Button
          fullWidth
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          계좌 추가
        </Button>
      </div>

      {/* 계좌 추가 모달 */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="계좌 추가"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 플랫폼 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              송금 플랫폼
            </label>
            <select
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              은행
            </label>
            <select
              value={formData.bankCode}
              onChange={(e) => setFormData({ ...formData, bankCode: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              계좌번호
            </label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              placeholder="'-' 없이 입력"
              maxLength={50}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* 예금주명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              예금주명
            </label>
            <input
              type="text"
              value={formData.accountHolder}
              onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
              placeholder="예금주 이름"
              maxLength={50}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setShowAddModal(false)}
            >
              취소
            </Button>
            <Button
              type="submit"
              fullWidth
              loading={submitting}
            >
              등록
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PaymentMethodPage;
