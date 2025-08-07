import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import OTPVerification from '../components/auth/OTPVerification';

const AuthPage = () => {
  const location = useLocation();
  console.log('AuthPage mounted/updated, location:', location);
  const initialView = location.state?.view || 'login';
  console.log('Initial view:', initialView);
  const [currentView, setCurrentView] = useState(initialView); // 'login', 'signup', 'otp'
  
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
      )}
      
      {currentView === 'otp' && (
        <OTPVerification 
          email={location.state?.email || signupEmail}
          mode={location.state?.mode || 'signup'}
          password={location.state?.password}
          onVerificationSuccess={handleOTPVerificationSuccess}
          onBack={handleOTPBack}
        />
      )}
    </div>
  );
};

export default AuthPage;