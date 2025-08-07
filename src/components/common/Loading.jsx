import React from 'react';

const Loading = ({ message = '로딩 중...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="loading-spinner w-8 h-8 border-4 border-gray-200 border-t-black"></div>
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
};

export default Loading;
