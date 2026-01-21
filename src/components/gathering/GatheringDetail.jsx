import React, { useState, useEffect, useRef } from 'react';
import { Users, QrCode, CreditCard, Receipt, Clock, Pencil, FlaskConical } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGathering } from '../../hooks/useGathering';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency, getStatusColor } from '../../utils/helpers';
import { GATHERING_STATUS } from '../../utils/constants';
import { expenseAPI } from '../../api';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import QRCodeDisplay from './QRCodeDisplay';

const GatheringDetail = ({ gathering, onUpdate }) => {
  const { user } = useAuth();
  const { createPaymentRequest, updateGathering, loading } = useGathering();
  const [showQR, setShowQR] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showTimeEdit, setShowTimeEdit] = useState(false);
  const [showExpenseTest, setShowExpenseTest] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [totalAmount, setTotalAmount] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(false);

  // 지출 목록 조회
  const fetchExpenses = async () => {
    if (!gathering?.id) return;
    setExpensesLoading(true);
    try {
      const response = await expenseAPI.getExpensesByGathering(gathering.id);
      const data = response?.data?.data || response?.data || [];
      console.log('Expenses:', data);
      setExpenses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      setExpenses([]);
    } finally {
      setExpensesLoading(false);
    }
  };

  // 모임 변경 시 지출 목록 조회
  useEffect(() => {
    fetchExpenses();
  }, [gathering?.id]);

  const CATEGORY_LABELS = {
    FOOD: '음식',
    TRANSPORT: '교통',
    ACCOMMODATION: '숙박',
    ENTERTAINMENT: '오락',
    SHOPPING: '쇼핑',
    OTHER: '기타',
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

  // 시간 포맷 (심플)
  const formatTimeSimple = (timestamp) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes().toString().padStart(2, '0');
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[date.getDay()];
    const ampm = hour < 12 ? '오전' : '오후';
    const hour12 = hour % 12 || 12;
    return { month, day, dayName, time: `${ampm} ${hour12}:${minute}`, date };
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

          {/* 날짜/시간 표시 - 심플 버전 */}
          {(() => {
            const start = formatTimeSimple(gathering.startAt);
            const end = formatTimeSimple(gathering.endAt);
            const isSameDay = start && end &&
              start.month === end.month && start.day === end.day;
            const hasTime = gathering.startAt || gathering.endAt;

            return (
              <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                <div
                  className={`group flex items-center gap-3 ${isOwner ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 -mx-2 px-2 py-2 rounded-lg transition-colors' : ''}`}
                  onClick={() => isOwner && setShowTimeEdit(true)}
                >
                  <div className="flex-1 flex items-center gap-2 text-sm">
                    {hasTime ? (
                      <>
                        {start && (
                          <>
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md font-medium">
                              {start.month}/{start.day} ({start.dayName})
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">{start.time}</span>
                          </>
                        )}
                        {end && (
                          <>
                            <span className="text-gray-400">→</span>
                            {!isSameDay && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md font-medium">
                                {end.month}/{end.day} ({end.dayName})
                              </span>
                            )}
                            <span className="text-gray-600 dark:text-gray-400">{end.time}</span>
                          </>
                        )}
                      </>
                    ) : (
                      <span className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                        <Clock size={16} />
                        {isOwner ? '일정을 추가하세요' : '일정 미정'}
                      </span>
                    )}
                  </div>
                  {isOwner && (
                    <Pencil size={14} className="text-gray-400 dark:text-gray-500 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </div>
            );
          })()}

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

      {/* 지출 내역 */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
            <Receipt size={18} />
            지출 내역
          </h3>
          {expenses.length > 0 && (
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              총 {expenses.reduce((sum, e) => sum + (e.totalAmount || 0), 0).toLocaleString()}
            </span>
          )}
        </div>
        {expensesLoading ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            로딩 중...
          </div>
        ) : expenses.length > 0 ? (
          <div className="space-y-2">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                onClick={() => setSelectedExpense(expense)}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {expense.totalAmount?.toLocaleString()}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                    {CATEGORY_LABELS[expense.category] || expense.category}
                  </span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDateTime(expense.paidAt || expense.createdAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            등록된 지출이 없습니다
          </div>
        )}
      </div>

      {/* 지출 API 테스트 */}
      <div className="card bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center gap-2 mb-2">
          <FlaskConical size={18} className="text-yellow-600 dark:text-yellow-400" />
          <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">개발자 테스트</span>
        </div>
        <Button
          fullWidth
          variant="secondary"
          onClick={() => setShowExpenseTest(true)}
          className="!bg-yellow-100 dark:!bg-yellow-800/30 !text-yellow-800 dark:!text-yellow-200 !border-yellow-300 dark:!border-yellow-700"
        >
          지출 등록 API 테스트
        </Button>
      </div>

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

      {/* 시간 수정 모달 */}
      <TimeEditModal
        isOpen={showTimeEdit}
        onClose={() => setShowTimeEdit(false)}
        startAt={gathering.startAt}
        endAt={gathering.endAt}
        onSave={async (startAt, endAt) => {
          const updatedGathering = await updateGathering(gathering.id, { startAt, endAt });
          onUpdate(updatedGathering);
          setShowTimeEdit(false);
        }}
        loading={loading}
      />

      {/* 지출 테스트 모달 */}
      <ExpenseTestModal
        isOpen={showExpenseTest}
        onClose={() => setShowExpenseTest(false)}
        gathering={gathering}
        onSuccess={fetchExpenses}
      />

      {/* 지출 상세 모달 */}
      <ExpenseDetailModal
        isOpen={!!selectedExpense}
        onClose={() => setSelectedExpense(null)}
        expense={selectedExpense}
        onDelete={fetchExpenses}
        onUpdate={fetchExpenses}
        categoryLabels={CATEGORY_LABELS}
        gathering={gathering}
      />
    </div>
  );
};

// 지출 상세 모달 컴포넌트
const ExpenseDetailModal = ({ isOpen, onClose, expense, onDelete, categoryLabels, gathering, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [participantShares, setParticipantShares] = useState([]);

  // 참여자 목록 초기화
  useEffect(() => {
    if (isOpen && expense && gathering) {
      const allParticipants = [];

      // 방장 추가
      if (gathering.owner) {
        const isIncluded = expense.participants?.some(p => p.user?.id === gathering.owner.id);
        const participantData = expense.participants?.find(p => p.user?.id === gathering.owner.id);
        allParticipants.push({
          userId: gathering.owner.id,
          userName: gathering.owner.name || '방장',
          isOwner: true,
          included: isIncluded,
          shareAmount: participantData?.shareAmount || 0,
        });
      }

      // 나머지 참여자 추가
      if (gathering.participants) {
        gathering.participants.forEach(p => {
          const participantId = p.user?.id || p.id;
          if (participantId !== gathering.owner?.id) {
            const isIncluded = expense.participants?.some(ep => ep.user?.id === participantId);
            const participantData = expense.participants?.find(ep => ep.user?.id === participantId);
            allParticipants.push({
              userId: participantId,
              userName: p.user?.name || p.name || '알 수 없음',
              isOwner: false,
              included: isIncluded,
              shareAmount: participantData?.shareAmount || 0,
            });
          }
        });
      }

      setParticipantShares(allParticipants);
      setIsEditing(false);
    }
  }, [isOpen, expense, gathering]);

  if (!expense) return null;

  const formatDateTime = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleToggleParticipant = (userId) => {
    setParticipantShares(prev => prev.map(p =>
      p.userId === userId ? { ...p, included: !p.included } : p
    ));
  };

  const handleDelete = async () => {
    if (!confirm('이 지출을 삭제하시겠습니까?')) return;

    setLoading(true);
    try {
      await expenseAPI.delete(expense.id);
      toast.success('지출이 삭제되었습니다.');
      onDelete?.();
      onClose();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || '삭제 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const includedParticipants = participantShares.filter(p => p.included);
    if (includedParticipants.length === 0) {
      toast.error('최소 1명의 참여자를 선택해주세요.');
      return;
    }

    setLoading(true);
    try {
      // 기존 지출 삭제 후 새로 생성
      await expenseAPI.delete(expense.id);

      const requestData = {
        gatheringId: expense.gatheringId,
        totalAmount: expense.totalAmount,
        description: expense.description || undefined,
        location: expense.location || undefined,
        category: expense.category,
        paidAt: expense.paidAt,
        receiptImageUrl: expense.receiptImageUrl || undefined,
        shareType: 'EQUAL',
        participants: includedParticipants.map(p => ({
          userId: p.userId,
          shareValue: 0,
        })),
      };

      await expenseAPI.create(requestData);
      toast.success('지출이 수정되었습니다.');
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || '수정 실패');
    } finally {
      setLoading(false);
    }
  };

  const includedCount = participantShares.filter(p => p.included).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="지출 상세">
      <div className="space-y-4">
        {/* 금액 */}
        <div className="text-center py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {expense.totalAmount?.toLocaleString()}원
          </div>
          <span className="inline-block mt-2 text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
            {categoryLabels[expense.category] || expense.category}
          </span>
        </div>

        {/* 상세 정보 */}
        <div className="space-y-3 text-sm">
          {expense.description && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">설명</span>
              <span className="text-gray-900 dark:text-white">{expense.description}</span>
            </div>
          )}
          {expense.location && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">위치</span>
              <span className="text-gray-900 dark:text-white">{expense.location}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">결제자</span>
            <span className="text-gray-900 dark:text-white">{expense.payer?.name || '알 수 없음'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">결제 시간</span>
            <span className="text-gray-900 dark:text-white">{formatDateTime(expense.paidAt)}</span>
          </div>
        </div>

        {/* 참여자 */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              참여자 {isEditing && `(${includedCount}명 선택)`}
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              {isEditing ? '취소' : '수정'}
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {participantShares.map((p) => (
              <div key={p.userId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {isEditing ? (
                  <>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={p.included}
                        onChange={() => handleToggleParticipant(p.userId)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                    <span className={`flex-1 ml-3 text-sm ${p.included ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 line-through'}`}>
                      {p.userName}
                      {p.isOwner && <span className="ml-1 text-xs bg-black text-white px-1.5 py-0.5 rounded">방장</span>}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {p.userName}
                      {p.isOwner && <span className="ml-1 text-xs bg-black text-white px-1.5 py-0.5 rounded">방장</span>}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {p.shareAmount?.toLocaleString()}원
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-2 pt-2">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => setIsEditing(false)}
              >
                취소
              </Button>
              <Button
                type="button"
                fullWidth
                onClick={handleSave}
                loading={loading}
              >
                저장
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={handleDelete}
                loading={loading}
                className="!text-red-600 dark:!text-red-400"
              >
                삭제
              </Button>
              <Button type="button" fullWidth onClick={onClose}>
                닫기
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

// 시간 수정 모달 컴포넌트 (달력 범위 선택)
const TimeEditModal = ({ isOpen, onClose, startAt, endAt, onSave, loading }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startHour, setStartHour] = useState(12);
  const [startMinute, setStartMinute] = useState(0);
  const [endHour, setEndHour] = useState(18);
  const [endMinute, setEndMinute] = useState(0);
  const [selecting, setSelecting] = useState('start'); // 'start' | 'end'

  const days = ['일', '월', '화', '수', '목', '금', '토'];

  // 모달 열릴 때 초기값 설정
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      if (startAt) {
        const s = new Date(startAt);
        setStartDate(new Date(s.getFullYear(), s.getMonth(), s.getDate()));
        setStartHour(s.getHours());
        setStartMinute(s.getMinutes());
        setViewDate(new Date(s.getFullYear(), s.getMonth(), 1));
      } else {
        setStartDate(null);
        setStartHour(12);
        setStartMinute(0);
        setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
      }
      if (endAt) {
        const e = new Date(endAt);
        setEndDate(new Date(e.getFullYear(), e.getMonth(), e.getDate()));
        setEndHour(e.getHours());
        setEndMinute(e.getMinutes());
      } else {
        setEndDate(null);
        setEndHour(18);
        setEndMinute(0);
      }
      setSelecting('start');
    }
  }, [isOpen, startAt, endAt]);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleSelectDay = (day) => {
    const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);

    if (selecting === 'start') {
      setStartDate(selected);
      // 시작일이 종료일보다 후면 종료일 초기화
      if (endDate && selected > endDate) {
        setEndDate(null);
      }
      setSelecting('end');
    } else {
      // 종료일이 시작일보다 전이면 시작일로 설정
      if (startDate && selected < startDate) {
        setStartDate(selected);
        setEndDate(null);
        setSelecting('end');
      } else {
        setEndDate(selected);
        setSelecting('start');
      }
    }
  };

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const isInRange = (day) => {
    if (!startDate || !endDate) return false;
    const current = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    return current > startDate && current < endDate;
  };

  const isStart = (day) => {
    if (!startDate) return false;
    const current = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    return isSameDay(current, startDate);
  };

  const isEnd = (day) => {
    if (!endDate) return false;
    const current = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    return isSameDay(current, endDate);
  };

  const isToday = (day) => {
    const today = new Date();
    return today.getDate() === day &&
           today.getMonth() === viewDate.getMonth() &&
           today.getFullYear() === viewDate.getFullYear();
  };

  const handleSave = () => {
    const start = startDate
      ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), startHour, startMinute).getTime()
      : null;
    const end = endDate
      ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), endHour, endMinute).getTime()
      : null;
    onSave(start, end);
  };

  const formatSelectedDate = (date) => {
    if (!date) return '선택 안됨';
    return `${date.getMonth() + 1}/${date.getDate()} (${days[date.getDay()]})`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="모임 기간 설정">
      <div className="space-y-4">
        {/* 선택된 기간 표시 */}
        <div className="flex items-center justify-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div
            className={`text-center px-3 py-1 rounded cursor-pointer transition-colors ${
              selecting === 'start'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setSelecting('start')}
          >
            <div className="text-xs opacity-70">시작</div>
            <div className="font-medium">{formatSelectedDate(startDate)}</div>
          </div>
          <span className="text-gray-400">→</span>
          <div
            className={`text-center px-3 py-1 rounded cursor-pointer transition-colors ${
              selecting === 'end'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setSelecting('end')}
          >
            <div className="text-xs opacity-70">종료</div>
            <div className="font-medium">{formatSelectedDate(endDate)}</div>
          </div>
        </div>

        {/* 달력 헤더 */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            ‹
          </button>
          <span className="font-semibold text-gray-900 dark:text-white">
            {viewDate.getFullYear()}년 {viewDate.getMonth() + 1}월
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            ›
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-0">
          {days.map((day) => (
            <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 gap-0">
          {Array.from({ length: firstDayOfMonth }, (_, i) => (
            <div key={`empty-${i}`} className="h-10" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const start = isStart(day);
            const end = isEnd(day);
            const inRange = isInRange(day);
            const today = isToday(day);
            const isSameStartEnd = start && end; // 당일 선택

            return (
              <button
                key={day}
                type="button"
                onClick={() => handleSelectDay(day)}
                className={`
                  h-10 text-sm font-medium transition-all relative
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  ${start || end ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-300'}
                  ${today && !start && !end ? 'text-blue-500 dark:text-blue-400' : ''}
                `}
              >
                {day}
                {/* 시작/종료 점 */}
                {(start || end) && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                )}
                {/* 범위 선 (당일 선택이 아닐 때만) */}
                {!isSameStartEnd && (inRange || (start && endDate) || (end && startDate)) && (
                  <span className={`absolute bottom-[5px] h-0.5 bg-blue-400 dark:bg-blue-500 ${
                    start ? 'left-1/2 right-0' : end ? 'left-0 right-1/2' : 'left-0 right-0'
                  }`} />
                )}
              </button>
            );
          })}
        </div>

        {/* 시간 선택 */}
        <div className="flex gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <TimePicker
            label="시작"
            hour={startHour}
            minute={startMinute}
            onHourChange={setStartHour}
            onMinuteChange={setStartMinute}
          />
          <TimePicker
            label="종료"
            hour={endHour}
            minute={endMinute}
            onHourChange={setEndHour}
            onMinuteChange={setEndMinute}
          />
        </div>

        {/* 버튼 */}
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>
            취소
          </Button>
          <Button type="button" fullWidth loading={loading} onClick={handleSave}>
            저장
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// 지출 테스트 모달 컴포넌트
const ExpenseTestModal = ({ isOpen, onClose, gathering, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    totalAmount: '',
    description: '',
    location: '',
    category: 'FOOD',
    paidAt: Date.now(),
    receiptImageUrl: '',
    shareType: 'EQUAL',
  });
  const [participantShares, setParticipantShares] = useState([]);

  const CATEGORIES = [
    { value: 'FOOD', label: '음식' },
    { value: 'TRANSPORT', label: '교통' },
    { value: 'ACCOMMODATION', label: '숙박' },
    { value: 'ENTERTAINMENT', label: '오락' },
    { value: 'SHOPPING', label: '쇼핑' },
    { value: 'OTHER', label: '기타' },
  ];

  const SHARE_TYPES = [
    { value: 'EQUAL', label: '균등 분배' },
    { value: 'CUSTOM', label: '직접 입력' },
    { value: 'PERCENTAGE', label: '비율 분배' },
  ];

  // 모달 열릴 때 참여자 목록 초기화 (방장 포함)
  useEffect(() => {
    if (isOpen && gathering) {
      const allParticipants = [];

      // 방장 추가
      if (gathering.owner) {
        allParticipants.push({
          userId: gathering.owner.id,
          userName: gathering.owner.name || '방장',
          isOwner: true,
          included: true,
        });
      }

      // 나머지 참여자 추가 (방장 제외)
      if (gathering.participants) {
        gathering.participants.forEach(p => {
          const participantId = p.user?.id || p.id;
          // 방장이 아닌 경우만 추가
          if (participantId !== gathering.owner?.id) {
            allParticipants.push({
              userId: participantId,
              userName: p.user?.name || p.name || '알 수 없음',
              isOwner: false,
              included: true,
            });
          }
        });
      }

      // shareValue 설정
      const totalCount = allParticipants.length;
      allParticipants.forEach(p => {
        p.shareValue = formData.shareType === 'PERCENTAGE' ? 100 / totalCount : 0;
      });

      setParticipantShares(allParticipants);
    }
  }, [isOpen, gathering]);

  // shareType 변경 시 shareValue 재계산
  useEffect(() => {
    if (formData.shareType === 'EQUAL') {
      setParticipantShares(prev => prev.map(p => ({ ...p, shareValue: 0 })));
    } else if (formData.shareType === 'PERCENTAGE') {
      const includedCount = participantShares.filter(p => p.included).length;
      setParticipantShares(prev => prev.map(p => ({
        ...p,
        shareValue: p.included ? 100 / includedCount : 0
      })));
    }
  }, [formData.shareType]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleShareChange = (userId, field, value) => {
    setParticipantShares(prev => prev.map(p =>
      p.userId === userId ? { ...p, [field]: value } : p
    ));
  };

  const handleSubmit = async () => {
    if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
      toast.error('총 금액을 입력해주세요.');
      return;
    }

    const includedParticipants = participantShares.filter(p => p.included);
    if (includedParticipants.length === 0) {
      toast.error('최소 1명의 참여자를 선택해주세요.');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        gatheringId: gathering.id,
        totalAmount: parseFloat(formData.totalAmount),
        description: formData.description || undefined,
        location: formData.location || undefined,
        category: formData.category,
        paidAt: formData.paidAt,
        receiptImageUrl: formData.receiptImageUrl || undefined,
        shareType: formData.shareType,
        participants: includedParticipants.map(p => ({
          userId: p.userId,
          shareValue: formData.shareType === 'EQUAL' ? 0 : parseFloat(p.shareValue) || 0,
        })),
      };

      console.log('Expense Request:', requestData);
      const response = await expenseAPI.create(requestData);
      console.log('Expense Response:', response);
      toast.success('지출이 등록되었습니다!');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Expense Error:', error);
      toast.error(error.response?.data?.message || error.message || '지출 등록 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="지출 등록 테스트">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {/* 자동 입력 정보 */}
        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
          <div className="text-gray-500 dark:text-gray-400 mb-1">모임 ID (자동)</div>
          <div className="font-mono text-gray-900 dark:text-white">{gathering?.id}</div>
        </div>

        {/* 금액 */}
        <Input
          label="총 금액 *"
          type="number"
          value={formData.totalAmount}
          onChange={(e) => handleInputChange('totalAmount', e.target.value)}
          placeholder="50000"
        />

        {/* 설명 */}
        <Input
          label="설명"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="점심 식사"
        />

        {/* 위치 */}
        <Input
          label="위치"
          value={formData.location}
          onChange={(e) => handleInputChange('location', e.target.value)}
          placeholder="강남역 맛집"
        />

        {/* 카테고리 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            카테고리 *
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* 분배 방식 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            분배 방식 *
          </label>
          <select
            value={formData.shareType}
            onChange={(e) => handleInputChange('shareType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {SHARE_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* 결제 시간 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            결제 시간
          </label>
          <input
            type="datetime-local"
            value={new Date(formData.paidAt).toISOString().slice(0, 16)}
            onChange={(e) => handleInputChange('paidAt', new Date(e.target.value).getTime())}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        {/* 영수증 이미지 URL */}
        <Input
          label="영수증 이미지 URL"
          value={formData.receiptImageUrl}
          onChange={(e) => handleInputChange('receiptImageUrl', e.target.value)}
          placeholder="https://..."
        />

        {/* 참여자 목록 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            참여자 * (토글로 포함/제외)
          </label>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            모임 인원: {participantShares.length}명 (방장 포함)
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {participantShares.length === 0 ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                모임에 참여자가 없습니다
              </div>
            ) : (
              participantShares.map(p => (
                <div key={p.userId} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={p.included}
                      onChange={(e) => handleShareChange(p.userId, 'included', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                  <span className={`flex-1 text-sm ${p.included ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 line-through'}`}>
                    {p.userName}
                    {p.isOwner && (
                      <span className="ml-1 text-xs bg-black text-white px-1.5 py-0.5 rounded">방장</span>
                    )}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">#{p.userId}</span>
                  {formData.shareType !== 'EQUAL' && p.included && (
                    <input
                      type="number"
                      value={p.shareValue}
                      onChange={(e) => handleShareChange(p.userId, 'shareValue', e.target.value)}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder={formData.shareType === 'PERCENTAGE' ? '%' : '금액'}
                    />
                  )}
                </div>
              ))
            )}
          </div>
          {participantShares.length > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              선택됨: {participantShares.filter(p => p.included).length}명
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>
            취소
          </Button>
          <Button type="button" fullWidth loading={loading} onClick={handleSubmit}>
            지출 등록
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// 시간 선택 컴포넌트
const TimePicker = ({ label, hour, minute, onHourChange, onMinuteChange }) => {
  const [showPicker, setShowPicker] = useState(false);
  const hourRef = React.useRef(null);
  const minuteRef = React.useRef(null);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 10, 20, 30, 40, 50];

  // 스크롤 위치 조정
  useEffect(() => {
    if (showPicker) {
      if (hourRef.current) {
        const selectedEl = hourRef.current.querySelector(`[data-value="${hour}"]`);
        if (selectedEl) selectedEl.scrollIntoView({ block: 'center' });
      }
      if (minuteRef.current) {
        const selectedEl = minuteRef.current.querySelector(`[data-value="${minute}"]`);
        if (selectedEl) selectedEl.scrollIntoView({ block: 'center' });
      }
    }
  }, [showPicker, hour, minute]);

  const adjustTime = (delta) => {
    const total = hour * 60 + minute + delta;
    if (total >= 0 && total < 24 * 60) {
      onHourChange(Math.floor(total / 60));
      onMinuteChange(total % 60);
    }
  };

  return (
    <div className="flex-1 text-center relative">
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      <div className="flex items-center justify-center gap-2 mt-1">
        <button
          type="button"
          onClick={() => adjustTime(-10)}
          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          −
        </button>
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="text-lg font-medium text-gray-900 dark:text-white w-16 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')}
        </button>
        <button
          type="button"
          onClick={() => adjustTime(10)}
          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          +
        </button>
      </div>

      {/* 스크롤 Picker 모달 */}
      {showPicker && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setShowPicker(false)} />
          <div className="fixed inset-x-4 bottom-4 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 max-w-sm mx-auto">
            <div className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{label} 시간</div>
            <div className="flex justify-center gap-2">
              {/* 시간 */}
              <div
                ref={hourRef}
                className="h-48 w-16 overflow-y-auto"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <style>{`div::-webkit-scrollbar { display: none; }`}</style>
                <div className="py-20">
                  {hours.map((h) => (
                    <button
                      key={h}
                      type="button"
                      data-value={h}
                      onClick={() => onHourChange(h)}
                      className={`w-full py-2 text-lg rounded-lg transition-colors ${
                        hour === h
                          ? 'bg-blue-500 text-white font-bold'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {h.toString().padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>
              <span className="self-center text-2xl text-gray-400">:</span>
              {/* 분 */}
              <div
                ref={minuteRef}
                className="h-48 w-16 overflow-y-auto"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div className="py-20">
                  {minutes.map((m) => (
                    <button
                      key={m}
                      type="button"
                      data-value={m}
                      onClick={() => onMinuteChange(m)}
                      className={`w-full py-2 text-lg rounded-lg transition-colors ${
                        minute === m
                          ? 'bg-blue-500 text-white font-bold'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {m.toString().padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPicker(false)}
              className="w-full mt-4 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors"
            >
              확인
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default GatheringDetail;