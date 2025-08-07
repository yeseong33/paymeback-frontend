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

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full ml-3"></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (gatherings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <Users size={48} className="mx-auto" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">모임이 없습니다</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">새로운 모임을 만들어보세요</p>
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
              <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">{gathering.title}</h3>
              {gathering.description && (
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">{gathering.description}</p>
              )}
            </div>
            
            <span className={`status-badge ${getStatusColor(gathering.status)} dark:bg-opacity-20 dark:text-white ml-3`}>
              {getStatusLabel(gathering.status)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
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
            <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400">
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