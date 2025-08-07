export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '날짜 없음';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '잘못된 날짜';
    }
    
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (error) {
    console.error('날짜 형식 변환 오류:', error);
    return '날짜 형식 오류';
  }
};

export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  return `${days}일 전`;
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'COMPLETED':
      return 'status-completed';
    case 'PENDING':
      return 'status-pending';
    case 'FAILED':
    case 'CANCELLED':
      return 'status-failed';
    default:
      return 'status-pending';
  }
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('클립보드 복사 실패:', err);
    return false;
  }
};

export const shareUrl = async (url, title) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        url,
      });
      return true;
    } catch (err) {
      console.error('공유 실패:', err);
    }
  }
  
  // 공유 API가 지원되지 않으면 클립보드에 복사
  return await copyToClipboard(url);
};

export const isExpired = (expiryTime) => {
  return new Date() > new Date(expiryTime);
};

export const getRemainingTime = (expiryTime) => {
  const now = new Date();
  const expiry = new Date(expiryTime);
  const diff = expiry - now;
  
  if (diff <= 0) return null;
  
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  
  return { minutes, seconds };
};