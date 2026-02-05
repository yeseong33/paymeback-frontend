import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, QrCode, Users } from 'lucide-react';
import { useGathering } from '../hooks/useGathering';
import { useAuthStore } from '../store/authStore';
import { useAccountCheck } from '../hooks/useAccountCheck';
import Button from '../components/common/Button';
import Header from '../components/common/Header';
import GatheringList from '../components/gathering/GatheringList';
import CreateGathering from '../components/gathering/CreateGathering';
import QRCodeScanner from '../components/gathering/QRCodeScanner';
import AccountRequiredModal from '../components/common/AccountRequiredModal';

const MainPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { gatherings, getMyGatherings, loading, initialize } = useGathering();
  const { hasAccount, refetch: refetchAccount } = useAccountCheck();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'create' | 'join'

  // 컴포넌트가 언마운트될 때 gathering store 초기화
  useEffect(() => {
    return () => {
      initialize();
    };
  }, []);

  // 인증 상태가 변경될 때마다 모임 목록 로드
  useEffect(() => {
    if (isAuthenticated && user) {
      loadGatherings();
    }
  }, [isAuthenticated, user]);

  const loadGatherings = async () => {
    try {
      await getMyGatherings();
    } catch (error) {
      console.error('모임 목록 조회 실패:', error);
    }
  };

  const handleCreateSuccess = (gathering) => {
    navigate(`/gathering/${gathering.id}`);
  };

  const handleJoinSuccess = (gathering) => {
    navigate(`/gathering/${gathering.id}`);
  };

  // 계좌 체크 후 모임 생성
  const handleCreateClick = () => {
    if (hasAccount) {
      setShowCreateModal(true);
    } else {
      setPendingAction('create');
      setShowAccountModal(true);
    }
  };

  // 계좌 체크 후 모임 참여
  const handleJoinClick = () => {
    if (hasAccount) {
      setShowScannerModal(true);
    } else {
      setPendingAction('join');
      setShowAccountModal(true);
    }
  };

  // 계좌 등록 완료 후 처리
  const handleAccountSuccess = async () => {
    await refetchAccount();
    if (pendingAction === 'create') {
      setShowCreateModal(true);
    } else if (pendingAction === 'join') {
      setShowScannerModal(true);
    }
    setPendingAction(null);
  };

  return (
    <div className="page">
      <Header showProfile={true} />
      
      <div className="page-content">
        {/* 빠른 액션 버튼 */}
        <div className="button-grid">
          <button
            className="action-button primary"
            onClick={handleCreateClick}
          >
            <Plus size={24} />
            <span>모임 만들기</span>
          </button>

          <button
            className="action-button secondary"
            onClick={handleJoinClick}
          >
            <QrCode size={24} />
            <span>모임 참여</span>
          </button>
        </div>

        {/* 내 모임 목록 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <Users size={20} />
              내 모임
            </h2>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={loadGatherings}
              loading={loading}
            >
              새로고침
            </Button>
          </div>
          
          <GatheringList 
            gatherings={gatherings} 
            loading={loading}
          />
        </div>

        {/* 도움말 */}
        <div className="card">
          <h3 className="font-bold mb-4 text-gray-900 dark:text-white">사용법</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</span>
              <p className="text-gray-600 dark:text-gray-300"><strong className="text-gray-900 dark:text-white">모임 만들기</strong>로 새로운 더치페이 모임을 생성하세요</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</span>
              <p className="text-gray-600 dark:text-gray-300">생성된 <strong className="text-gray-900 dark:text-white">QR 코드</strong>를 친구들과 공유하세요</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</span>
              <p className="text-gray-600 dark:text-gray-300">친구들이 QR 코드로 모임에 참여할 수 있습니다</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">4</span>
              <p className="text-gray-600 dark:text-gray-300">결제 금액을 입력하면 자동으로 <strong className="text-gray-900 dark:text-white">1/N</strong> 분할됩니다</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">5</span>
              <p className="text-gray-600 dark:text-gray-300">각자 결제를 진행하면 완료!</p>
            </div>
          </div>
        </div>
      </div>

      {/* 모달들 */}
      <CreateGathering
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
        onPaymentMethodRequired={() => {
          setPendingAction('create');
          setShowAccountModal(true);
          refetchAccount();
        }}
      />

      <QRCodeScanner
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onSuccess={handleJoinSuccess}
        onPaymentMethodRequired={() => {
          setPendingAction('join');
          setShowAccountModal(true);
          refetchAccount();
        }}
      />

      <AccountRequiredModal
        isOpen={showAccountModal}
        onClose={() => {
          setShowAccountModal(false);
          setPendingAction(null);
        }}
        onSuccess={handleAccountSuccess}
        title={pendingAction === 'create' ? '모임을 만들려면 계좌가 필요해요' : '모임에 참여하려면 계좌가 필요해요'}
      />
    </div>
  );
};

export default MainPage;