import React, { useState, useEffect } from 'react';
import { Users, QrCode, CreditCard, Settings, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGathering } from '../../hooks/useGathering';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency, getStatusColor, toEpochMillis } from '../../utils/helpers';
import { GATHERING_STATUS } from '../../utils/constants';
import { paymentAPI } from '../../api';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import DateTimeDisplay from '../common/DateTimeDisplay';
import QRCodeDisplay from './QRCodeDisplay';

const GatheringDetail = ({ gathering, onUpdate }) => {
  const { user } = useAuth();
  const { createPaymentRequest, updateGathering, loading } = useGathering();
  const [showQR, setShowQR] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [totalAmount, setTotalAmount] = useState('');
  // TODO: API 연동 시 아래 모킹 데이터 제거
  const [payments] = useState([
    { id: 1, amount: 25000, status: 'COMPLETED', completedAt: Date.now() - 3600000 },
    { id: 2, amount: 25000, status: 'PENDING', createdAt: Date.now() - 1800000 },
    { id: 3, amount: 25000, status: 'FAILED', createdAt: Date.now() - 7200000 },
  ]);

  const formatPaymentStatus = (status) => {
    switch (status) {
      case 'COMPLETED': return { label: '완료', color: 'text-green-600 dark:text-green-400' };
      case 'PENDING': return { label: '대기', color: 'text-yellow-600 dark:text-yellow-400' };
      case 'FAILED': return { label: '실패', color: 'text-red-600 dark:text-red-400' };
      default: return { label: status, color: 'text-gray-600 dark:text-gray-400' };
    }
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // participantCount가 없으면 participants 배열 길이 사용
  const participantCount = gathering?.participantCount ?? gathering?.participants?.length ?? 0;

  const isOwner = gathering?.owner?.email === user?.email;
  const canRequestPayment = gathering?.status === GATHERING_STATUS.ACTIVE &&
                           participantCount > 0;

  const handlePaymentRequest = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(totalAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('올바른 금액을 입력해주세요.');
      return;
    }

    try {
      const updatedGathering = await createPaymentRequest(gathering.id, amount);
      toast.success('결제 요청이 생성되었습니다.');
      onUpdate(updatedGathering);
      setShowPaymentForm(false);
      setTotalAmount('');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case GATHERING_STATUS.ACTIVE:
        return '👥';
      case GATHERING_STATUS.PAYMENT_REQUESTED:
        return '💰';
      case GATHERING_STATUS.COMPLETED:
        return '✅';
      case GATHERING_STATUS.CLOSED:
        return '🔒';
      default:
        return status;
    }
  };

  if (!gathering) return null;

  return (
    <div className="space-y-6">
      {/* 기본 정보 */}
      <div className="card">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{gathering.title}</h1>
            {gathering.description && (
              <p className="text-gray-600 dark:text-gray-300">{gathering.description}</p>
            )}
          </div>
          
          {isOwner && (
            <button
              onClick={() => setShowQR(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ml-3 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800"
              title="모임 관리"
            >
              <QrCode size={16} />
              <span className="text-sm font-medium">모임 관리</span>
            </button>
          )}
        </div>

          <div className="flex items-center gap-4 text-sm text-gray-900 dark:text-white mb-4">
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span>참여자 {participantCount}명</span>
            </div>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span className="text-gray-500 dark:text-gray-400">
              방장: {gathering.owner?.name || '알 수 없음'}
            </span>
          </div>

          {/* 날짜/시간 표시 */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4 -mx-3">
            <DateTimeDisplay
              dateTime={gathering.scheduledAt || gathering.createdAt}
              editable={isOwner}
              label="모임 일시"
              onDateChange={async (newDate) => {
                const scheduledAt = toEpochMillis(newDate);
                const updatedGathering = await updateGathering(gathering.id, { scheduledAt });
                onUpdate(updatedGathering);
              }}
            />
          </div>

        {gathering.totalAmount && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">총 금액</span>
                <p className="font-semibold text-lg text-gray-900 dark:text-white">{formatCurrency(gathering.totalAmount)}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">개인 분담금</span>
                <p className="font-semibold text-lg text-red-600 dark:text-red-400">
                  {formatCurrency(gathering.amountPerPerson)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 방장 액션 - 결제 요청 */}
      {isOwner && canRequestPayment && (
        <div className="card">
          <Button
            fullWidth
            onClick={() => setShowPaymentForm(true)}
            className="flex items-center justify-center gap-2"
          >
            <CreditCard size={18} />
            결제 요청하기
          </Button>
        </div>
      )}

      {/* 결제 내역 */}
      {payments.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
            <Receipt size={18} />
            결제 내역
          </h3>
          <div className="space-y-2">
            {payments.map((payment) => {
              const statusInfo = formatPaymentStatus(payment.status);
              return (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(payment.amount)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDateTime(payment.completedAt || payment.createdAt)}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 참여자 목록 */}
      <div className="card">
        <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">참여자 목록</h3>
        
        {gathering.participants && gathering.participants.length > 0 ? (
          <div className="space-y-2">
            {gathering.participants.map((participant, index) => (
              <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-200">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {participant.user?.name || participant.name || '알 수 없음'}
                  </span>
                  {(participant.user?.email || participant.email) === gathering.owner?.email && (
                    <span className="text-xs bg-black text-white px-2 py-1 rounded">방장</span>
                  )}
                </div>
                
                {gathering.status === GATHERING_STATUS.PAYMENT_REQUESTED && (
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(participant.paymentStatus)}`}>
                    {participant.paymentStatus === 'COMPLETED' ? '결제완료' : '결제대기'}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">아직 참여자가 없습니다</p>
        )}
      </div>

      {/* QR 코드 모달 */}
      <QRCodeDisplay
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        gathering={gathering}
        onRefresh={onUpdate}
      />

      {/* 결제 요청 모달 */}
      <Modal 
        isOpen={showPaymentForm}
        onClose={() => setShowPaymentForm(false)}
        title="결제 요청하기"
      >
        <form onSubmit={handlePaymentRequest}>
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              총 결제 금액을 입력하면 참여자 수에 따라 자동으로 분할됩니다.
            </p>
            
            <Input
              label="총 결제 금액"
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="50000"
              min="1"
              required
            />
            
            {totalAmount && participantCount > 0 && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm">
                  <p className="text-gray-600 dark:text-gray-300">참여자: {participantCount}명</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    개인 분담금: {formatCurrency(parseFloat(totalAmount) / participantCount)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button 
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setShowPaymentForm(false)}
            >
              취소
            </Button>
            <Button 
              type="submit" 
              fullWidth 
              loading={loading}
            >
              요청하기
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GatheringDetail;