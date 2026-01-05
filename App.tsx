import React, { useState, useCallback, useEffect } from 'react';
import { Layout } from './components/Layout';
import { HomeView } from './views/HomeView';
import { LoginView } from './views/LoginView';
import { SignupView } from './views/SignupView';
import { OnboardingView } from './views/OnboardingView';
import { DashboardView } from './views/DashboardView';
import { WorksheetView } from './views/WorksheetView';
import { AppState, AppView, Child, Worksheet } from './types';

const INITIAL_STATE: AppState = {
  user: null,
  children: [],
  activeChildId: null,
  worksheets: [],
};

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('edukid_state');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [activeWorksheetId, setActiveWorksheetId] = useState<string | null>(null);
  const [startWithAnswerKey, setStartWithAnswerKey] = useState(false);

  useEffect(() => {
    localStorage.setItem('edukid_state', JSON.stringify(state));
  }, [state]);

  const handleLogin = (email: string) => {
    setState(prev => ({ ...prev, user: { email } }));
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setState(INITIAL_STATE);
    setCurrentView('home');
  };

  const handleSignup = (email: string) => {
    setState(prev => ({ ...prev, user: { email } }));
    setCurrentView('onboarding');
  };

  const handleAddChild = (child: Child) => {
    setState(prev => {
      const newChildren = [...prev.children, child];
      return {
        ...prev,
        children: newChildren,
        activeChildId: prev.activeChildId || child.id
      };
    });
    setCurrentView('dashboard');
  };

  const renderView = () => {
    switch (currentView) {
      case 'home': return <HomeView onStart={() => setCurrentView('signup')} onLogin={() => setCurrentView('login')} />;
      case 'login': return <LoginView onLogin={handleLogin} onBack={() => setCurrentView('home')} />;
      case 'signup': return <SignupView onSignup={handleSignup} onBack={() => setCurrentView('home')} />;
      case 'onboarding': return <OnboardingView onComplete={handleAddChild} user={state.user!} />;
      case 'dashboard': return (
        <DashboardView 
          state={state} 
          setState={setState}
          onViewWorksheet={(id, ansKey = false) => { 
            setActiveWorksheetId(id); 
            setStartWithAnswerKey(ansKey);
            setCurrentView('worksheet'); 
          }}
          onAddChild={() => setCurrentView('onboarding')}
        />
      );
      case 'worksheet': {
        const ws = state.worksheets.find(w => w.id === activeWorksheetId);
        if (!ws) return <div className="p-12 text-center">Worksheet not found.</div>;
        return (
          <WorksheetView 
            worksheet={ws} 
            onBack={() => setCurrentView('dashboard')}
            initialShowAnswerKey={startWithAnswerKey}
          />
        );
      }
      default: return <HomeView onStart={() => setCurrentView('signup')} onLogin={() => setCurrentView('login')} />;
    }
  };

  return (
    <Layout 
      user={state.user} 
      onNavigate={setCurrentView} 
      onLogout={handleLogout} 
      activeView={currentView}
    >
      {renderView()}
    </Layout>
  );
}
