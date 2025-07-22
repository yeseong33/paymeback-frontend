import React, { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import OTPVerification from '../components/auth/OTPVerification';

const AuthPage = () => {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'signup', 'otp'
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
          email={signupEmail}
          onVerificationSuccess={handleOTPVerificationSuccess}
          onBack={handleOTPBack}
        />
      )}
    </div>
  );
};

export default AuthPage;