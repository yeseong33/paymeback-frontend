import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, CreditCard } from 'lucide-react';
import { formatDate, formatCurrency, getStatusColor } from '../../utils/helpers';
import { GATHERING_STATUS, PAYMENT_STATUS_LABELS } from '../../utils/constants';

const GatheringList = ({ gatherings, loading }) => {
  const navigate = useNavigate();

  const handleGatheringClick = (gathering) => {
    navigate(`/gathering/${gathering.id}`);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case GATHERING_STATUS.ACTIVE:
        return '모집 중';
      case GATHERING_STATUS.PAYMENT_REQUESTED:
        return '결제 요청';
      case GATHERING_STATUS.COMPLETED:
        return '완료';
      case GATHERING_STATUS.CLOSED:
        return '종료';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
            <div className="flex justify-between">
              <div className="h-3 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (gatherings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Users size={48} className="mx-auto" />
        </div>
        <p className="text-gray-600">모임이 없습니다</p>
        <p className="text-sm text-gray-500 mt-1">새로운 모임을 만들어보세요</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {gatherings.map((gathering) => (
        <div 
          key={gathering.id}
          className="card cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleGatheringClick(gathering)}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{gathering.title}</h3>
              {gathering.description && (
                <p className="text-gray-600 text-sm line-clamp-2">{gathering.description}</p>
              )}
            </div>
            
            <span className={`status-badge ${getStatusColor(gathering.status)} ml-3`}>
              {getStatusLabel(gathering.status)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Users size={16} />
                <span>{gathering.participantCount}명</span>
              </div>
              
              {gathering.totalAmount && (
                <div className="flex items-center gap-1">
                  <CreditCard size={16} />
                  <span>{formatCurrency(gathering.amountPerPerson)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{formatDate(gathering.createdAt)}</span>
            </div>
          </div>

          {gathering.owner && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                방장: {gathering.owner.name}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default GatheringList;