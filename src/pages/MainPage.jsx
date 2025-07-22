import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, QrCode, Users } from 'lucide-react';
import { useGathering } from '../hooks/useGathering';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Header from '../components/common/Header';
import GatheringList from '../components/gathering/GatheringList';
import CreateGathering from '../components/gathering/CreateGathering';
import QRCodeScanner from '../components/gathering/QRCodeScanner';

const MainPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { gatherings, getMyGatherings, loading } = useGathering();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);

  useEffect(() => {
    loadGatherings();
  }, []);

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

  return (
    <div className="page">
      <Header 
        title={`안녕하세요, ${user?.name || '사용자'}님!`}
        showLogout={true}
      />
      
      <div className="page-content">
        {/* 빠른 액션 버튼 */}
        <div className="button-grid">
          <button
            className="action-button primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={24} />
            <span>모임 만들기</span>
          </button>
          
          <button
            className="action-button secondary"
            onClick={() => setShowScannerModal(true)}
          >
            <QrCode size={24} />
            <span>모임 참여</span>
          </button>
        </div>

        {/* 내 모임 목록 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
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
        <div className="card bg-gray-50">
          <h3 className="font-medium mb-3">사용법</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>1. <strong>모임 만들기</strong>로 새로운 더치페이 모임을 생성하세요</p>
            <p>2. 생성된 <strong>QR 코드</strong>를 친구들과 공유하세요</p>
            <p>3. 친구들이 QR 코드로 모임에 참여할 수 있습니다</p>
            <p>4. 결제 금액을 입력하면 자동으로 <strong>1/N</strong> 분할됩니다</p>
            <p>5. 각자 결제를 진행하면 완료!</p>
          </div>
        </div>
      </div>

      {/* 모달들 */}
      <CreateGathering
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
      
      <QRCodeScanner
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onSuccess={handleJoinSuccess}
      />
    </div>
  );
};

export default MainPage;