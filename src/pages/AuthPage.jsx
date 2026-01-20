import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import OTPVerification from '../components/auth/OTPVerification';
import AlertModal from '../components/common/AlertModal';
import { useAuth } from '../hooks/useAuth';

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showOTPAlert, setShowOTPAlert] = useState(false);
  const initialView = location.state?.view || 'login';
  const [currentView, setCurrentView] = useState(initialView); // 'login', 'signup', 'otp'

  // 인증된 사용자는 메인 페이지로 리다이렉트
  useEffect(() => {
    if (isAuthenticated && currentView !== 'otp') {
      navigate('/main', { replace: true });
    }
  }, [isAuthenticated, navigate, currentView]);
  
  useEffect(() => {
    console.log('AuthPage location.state:', location.state);
    if (location.state?.view) {
      console.log('Setting view to:', location.state.view);
      setCurrentView(location.state.view);
    }
  }, [location.state]);
  const [signupEmail, setSignupEmail] = useState('');

  const handleSwitchToSignup = () => {
    setCurrentView('signup');
  };

  const handleSwitchToLogin = () => {
    setCurrentView('login');
  };

  const handleSignupSuccess = (email) => {
    setSignupEmail(email);
    setCurrentView('otp');
  };

  const handleOTPVerificationSuccess = () => {
    setCurrentView('login');
  };

  const handleOTPBack = () => {
    setCurrentView('signup');
  };

  return (
    <div className="page bg-white dark:bg-gray-900 transition-colors duration-200">
      {currentView === 'login' && (
        <LoginForm onSwitchToSignup={handleSwitchToSignup} />
      )}
      
      {currentView === 'signup' && (
        <SignupForm 
          onSignupSuccess={handleSignupSuccess}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}-=
      
      {currentView === 'otp' && (
        <OTPVerification 
          email={location.state?.email || signupEmail}
          mode={location.state?.mode || 'signup'}
          password={location.state?.password}
          onVerificationSuccess={() => {
            handleOTPVerificationSuccess();
            setShowOTPAlert(true);
          }}
          onBack={handleOTPBack}
        />
      )}

    </div>
  );
};

export default AuthPage;