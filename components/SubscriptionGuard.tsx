import React, { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const SubscriptionGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    let attempts = 0;
    const isPostCheckout = searchParams.get('checkout') === 'success';
    const maxAttempts = isPostCheckout ? 5 : 1;

    const checkSubscription = async () => {
      try {
        const res = await fetch('/api/check-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email }),
        });
        const data = await res.json();

        if (data.active) {
          setHasSubscription(true);
          setLoading(false);
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(checkSubscription, 2000);
          } else {
            setLoading(false);
          }
        }
      } catch {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [user, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6366F1]"></div>
        {searchParams.get('checkout') === 'success' && (
          <p className="text-slate-500 font-medium text-sm">Confirming your payment...</p>
        )}
      </div>
    );
  }

  if (!hasSubscription) {
    return <Navigate to="/subscribe" replace />;
  }

  return <>{children}</>;
};
