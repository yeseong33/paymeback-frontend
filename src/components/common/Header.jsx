import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from './Button';
import ThemeToggle from './ThemeToggle';

const Header = ({ title, showBack = false, showLogout = false }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="page-header bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="flex items-center gap-3">
        {showBack && (
          <button 
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-900 dark:text-white"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="page-title text-gray-900 dark:text-white">{title}</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {showLogout && (
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <LogOut size={16} />
            로그아웃
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;