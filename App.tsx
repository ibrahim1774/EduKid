import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomeView } from './views/HomeView';
import { LoginView } from './views/LoginView';
import { SignupView } from './views/SignupView';
import { OnboardingView } from './views/OnboardingView';
import { DashboardView } from './views/DashboardView';
import { WorksheetView } from './views/WorksheetView';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SubscriptionGuard } from './components/SubscriptionGuard';
import { PaymentView } from './views/PaymentView';
import { trackPageView } from './lib/fbTracking';
import { GoogleOAuthProvider } from '@react-oauth/google';

function AppContent() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    trackPageView();
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <Layout
      user={user ? { email: user.email! } : null}
      onLogout={handleLogout}
    >
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/login" element={<LoginView />} />
        <Route path="/get-started" element={<SignupView />} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingView onComplete={() => { }} user={user ? { email: user.email! } : { email: '' }} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscribe"
          element={
            <ProtectedRoute>
              <PaymentView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <SubscriptionGuard>
                <DashboardView
                  onViewWorksheet={(id, ansKey = false) => {
                    navigate(`/worksheet/${id}${ansKey ? '?key=true' : ''}`);
                  }}
                  onAddChild={() => navigate('/onboarding')}
                />
              </SubscriptionGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/worksheet/:id"
          element={
            <ProtectedRoute>
              <SubscriptionGuard>
                <WorksheetView />
              </SubscriptionGuard>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
