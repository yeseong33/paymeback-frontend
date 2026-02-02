import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { useAuthStore } from './store/authStore';
import { RECAPTCHA } from './utils/constants';
import AuthPage from './pages/AuthPage';
import MainPage from './pages/MainPage';
import GatheringPage from './pages/GatheringPage';
import PaymentPage from './pages/PaymentPage';
import ProfilePage from './pages/ProfilePage';
import PaymentMethodPage from './pages/PaymentMethodPage';

function App() {
  const { user, needsOTPVerification, pendingCredentials } = useAuthStore();
  const location = useLocation();

  // OTP 인증이 필요하고 현재 인증 페이지가 아닐 때
  if (needsOTPVerification && location.pathname !== '/auth') {
    return (
      <Navigate 
        to="/auth" 
        replace 
        state={{
          view: 'otp',
          email: pendingCredentials?.email,
          mode: 'signin'
        }} 
      />
    );
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={RECAPTCHA.V3_SITE_KEY}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head',
      }}
    >
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#4aed88',
            },
          },
          error: {
            duration: 3000,
            theme: {
              primary: '#ff4b4b',
            },
          },
        }}
      />
      <Routes>
        <Route 
          path="/auth/*" 
          element={!user ? <AuthPage /> : <Navigate to="/main" replace />} 
        />
        <Route 
          path="/main" 
          element={user ? <MainPage /> : <Navigate to="/auth" replace />} 
        />
        <Route 
          path="/gathering/:id" 
          element={user ? <GatheringPage /> : <Navigate to="/auth" replace />} 
        />
        <Route
          path="/payment/:gatheringId"
          element={user ? <PaymentPage /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/profile"
          element={user ? <ProfilePage /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/payment-methods"
          element={user ? <PaymentMethodPage /> : <Navigate to="/auth" replace />}
        />
        <Route path="/" element={<Navigate to={user ? "/main" : "/auth"} replace />} />
        <Route path="*" element={<Navigate to={user ? "/main" : "/auth"} replace />} />
      </Routes>
    </div>
    </GoogleReCaptchaProvider>
  );
}

export default App;