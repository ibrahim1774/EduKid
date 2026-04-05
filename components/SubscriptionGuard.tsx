import React, { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const SubscriptionGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let attempts = 0;
    const isPostCheckout = searchParams.get('checkout') === 'success';
    const maxAttempts = isPostCheckout ? 10 : 1;

    const checkSubscription = async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .limit(1)
        .single();

      if (data) {
        setHasSubscription(true);
        setLoading(false);
      } else {
        attempts++;
        if (attempts < maxAttempts) {
          // Webhook may not have fired yet — retry after 1 second
          setTimeout(checkSubscription, 1000);
        } else {
          setLoading(false);
        }
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
