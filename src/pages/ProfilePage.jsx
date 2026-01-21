import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, LogOut, ChevronRight, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import Header from '../components/common/Header';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleNameUpdate = async () => {
    if (!newName.trim()) {
      toast.error('이름을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      // TODO: API 연동 시 실제 업데이트 호출
      // await updateProfile({ name: newName });
      toast.success('이름이 변경되었습니다.');
      setShowNameEdit(false);
    } catch (error) {
      toast.error(error.message || '이름 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Header title="내 정보" showBack={true} />

      <div className="page-content">
        {/* 프로필 카드 */}
        <div className="card mb-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <User size={32} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {user?.name || '사용자'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
          </div>

          {/* 정보 목록 */}
          <div className="space-y-1">
            <button
              onClick={() => {
                setNewName(user?.name || '');
                setShowNameEdit(true);
              }}
              className="w-full flex items-center justify-between p-3 -mx-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <User size={20} className="text-gray-400" />
                <div className="text-left">
                  <div className="text-sm text-gray-500 dark:text-gray-400">이름</div>
                  <div className="text-gray-900 dark:text-white">{user?.name || '-'}</div>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <div className="flex items-center justify-between p-3 -mx-3">
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-gray-400" />
                <div className="text-left">
                  <div className="text-sm text-gray-500 dark:text-gray-400">이메일</div>
                  <div className="text-gray-900 dark:text-white">{user?.email || '-'}</div>
                </div>
              </div>
              <span className="text-xs text-gray-400">변경 불가</span>
            </div>
          </div>
        </div>

        {/* 설정 */}
        <div className="card mb-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">설정</h3>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-3 -mx-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              {isDark ? (
                <Moon size={20} className="text-gray-400" />
              ) : (
                <Sun size={20} className="text-gray-400" />
              )}
              <span className="text-gray-900 dark:text-white">다크 모드</span>
            </div>
            <div className={`w-11 h-6 rounded-full transition-colors ${isDark ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${isDark ? 'translate-x-5.5 ml-0.5' : 'translate-x-0.5'}`} />
            </div>
          </button>
        </div>

        {/* 로그아웃 */}
        <div className="card">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 -mx-3 -my-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>로그아웃</span>
          </button>
        </div>
      </div>

      {/* 이름 수정 모달 */}
      <Modal
        isOpen={showNameEdit}
        onClose={() => setShowNameEdit(false)}
        title="이름 변경"
      >
        <div className="space-y-4">
          <Input
            label="새 이름"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="이름을 입력하세요"
          />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowNameEdit(false)}
            >
              취소
            </Button>
            <Button
              fullWidth
              onClick={handleNameUpdate}
              loading={loading}
            >
              저장
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;
