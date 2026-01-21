import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';

const Header = ({ title, showBack = false, showProfile = false }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-900 dark:text-white"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          {showProfile && (
            <button
              onClick={() => navigate('/profile')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <User size={22} className="text-gray-600 dark:text-gray-300" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;