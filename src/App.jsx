import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AuthPage from './pages/AuthPage';
import MainPage from './pages/MainPage';
import GatheringPage from './pages/GatheringPage';
import PaymentPage from './pages/PaymentPage';
import Loading from './components/common/Loading';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-200">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <Routes>
        <Route 
          path="/auth" 
          element={!user ? <AuthPage /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/" 
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;