import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle, Users } from 'lucide-react';
import { usePayment } from '../../hooks/usePayment';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { PAYMENT_STATUS, PAYMENT_STATUS_LABELS } from '../../utils/constants';
import Loading from '../common/Loading';

const PaymentHistory = ({ gatheringId }) => {
  const { getGatheringPayments, loading } = usePayment();
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    loadPayments();
  }, [gatheringId]);

  const loadPayments = async () => {
    try {
      const data = await getGatheringPayments(gatheringId);
      setPayments(data);
    } catch (error) {
      console.error('결제 내역 조회 실패:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case PAYMENT_STATUS.COMPLETED:
        return <CheckCircle className="text-green-500" size={16} />;
      case PAYMENT_STATUS.FAILED:
      case PAYMENT_STATUS.CANCELLED:
        return <XCircle className="text-red-500" size={16} />;
      default:
        return <Clock className="text-yellow-500" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case PAYMENT_STATUS.COMPLETED:
        return 'status-completed';
      case PAYMENT_STATUS.FAILED:
      case PAYMENT_STATUS.CANCELLED:
        return 'status-failed';
      default:
        return 'status-pending';
    }
  };

  const completedCount = payments.filter(p => p.status === PAYMENT_STATUS.COMPLETED).length;
  const totalCount = payments.length;
  const completionRate = totalCount > 0 ? (completedCount / totalCount * 100).toFixed(0) : 0;

  if (loading) {
    return <Loading message="결제 내역을 불러오고 있습니다..." />;
  }

  return (
    <div className="space-y-6">
      {/* 결제 현황 요약 */}
      <div className="card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Users size={20} />
          결제 현황
        </h3>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">{completedCount}</p>
            <p className="text-sm text-gray-600">완료</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">{totalCount - completedCount}</p>
            <p className="text-sm text-gray-600">대기</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{completionRate}%</p>
            <p className="text-sm text-gray-600">완료율</p>
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* 결제 내역 목록 */}
      <div className="card">
        <h3 className="font-semibold mb-4">참여자별 결제 상태</h3>
        
        {payments.length > 0 ? (
          <div className="space-y-2">
            {payments.map((payment) => (
              <div 
                key={payment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(payment.status)}
                  <div>
                    <p className="font-medium">참여자 #{payment.participantId}</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(payment.createdAt)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                  <span className={`status-badge ${getStatusColor(payment.status)} text-xs`}>
                    {PAYMENT_STATUS_LABELS[payment.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">결제 내역이 없습니다</p>
          </div>
        )}
      </div>

      {/* 통계 정보 */}
      {payments.length > 0 && (
        <div className="card bg-gray-50">
          <h4 className="font-medium mb-3">결제 통계</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">총 결제 예정 금액</span>
              <span className="font-medium">
                {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">완료된 결제 금액</span>
              <span className="font-medium text-green-600">
                {formatCurrency(
                  payments
                    .filter(p => p.status === PAYMENT_STATUS.COMPLETED)
                    .reduce((sum, p) => sum + p.amount, 0)
                )}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">미결제 금액</span>
              <span className="font-medium text-red-600">
                {formatCurrency(
                  payments
                    .filter(p => p.status !== PAYMENT_STATUS.COMPLETED)
                    .reduce((sum, p) => sum + p.amount, 0)
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;