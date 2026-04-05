import React, { useState } from 'react';
import { CheckCircle, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { trackInitiateCheckout } from '../lib/fbTracking';

export const PaymentView: React.FC = () => {
  const { user } = useAuth();
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) return;
    setLoading(true);

    trackInitiateCheckout(isYearly ? 60.0 : 10.0, 'USD');

    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          interval: isYearly ? 'yearly' : 'monthly',
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1F3A] text-white flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#6C63FF]/5 -skew-x-12"></div>
      <div className="max-w-xl w-full relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-3">Almost There!</h2>
          <p className="text-lg text-indigo-200">Choose your plan to start your child's learning journey.</p>
        </div>

        {/* Monthly / Yearly Toggle */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className={`font-bold text-sm transition-colors ${!isYearly ? 'text-white' : 'text-indigo-300'}`}>Monthly</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative w-14 h-7 rounded-full bg-[#6C63FF]/30 border border-[#6C63FF]/50 transition-colors"
            aria-label="Toggle yearly pricing"
          >
            <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-[#6C63FF] shadow-md transition-all duration-300 ${isYearly ? 'left-[calc(100%-1.625rem)]' : 'left-0.5'}`} />
          </button>
          <span className={`font-bold text-sm transition-colors ${isYearly ? 'text-white' : 'text-indigo-300'}`}>Yearly</span>
          {isYearly && (
            <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
              Save 50%
            </span>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-5 py-3 mb-6">
          <CheckCircle size={16} className="text-emerald-400 shrink-0" />
          <span className="text-emerald-300 text-sm"><span className="font-black text-white">🎁 Free Gift Included on Plan</span> — 5,000+ digital worksheets emailed to you instantly on signup</span>
          <Mail size={14} className="text-emerald-400 shrink-0" />
        </div>

        <div className="bg-white rounded-[2rem] p-8 md:p-12 text-[#1A1F3A] shadow-2xl relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FFD97D] text-[#1A1F3A] px-4 py-1.5 rounded-full font-extrabold text-[10px] tracking-widest shadow-md">
            3 DAY FREE TRIAL
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-slate-100 pb-8">
            <div>
              <h3 className="text-2xl font-extrabold mb-1">Base Plan</h3>
              <p className="text-slate-500 font-medium text-base">Daily essentials for strong foundations.</p>
            </div>
            <div className="text-center">
              {isYearly ? (
                <>
                  <div className="flex items-center justify-center gap-2">
                    <div className="text-2xl font-bold text-slate-300 line-through">$120</div>
                    <div className="text-5xl font-extrabold text-[#6C63FF]">$60</div>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">per child / year</div>
                  <div className="mt-1 bg-emerald-100 text-emerald-700 text-[10px] font-extrabold px-3 py-0.5 rounded-full inline-block">50% OFF — just $5/mo</div>
                </>
              ) : (
                <>
                  <div className="text-5xl font-extrabold text-[#6C63FF]">$10</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">per child / month</div>
                </>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <ul className="space-y-3">
              <li className="flex items-center gap-2 font-bold text-slate-700 text-sm"><CheckCircle className="text-emerald-500" size={16} /> Daily Math & Reading</li>
              <li className="flex items-center gap-2 font-bold text-slate-700 text-sm"><CheckCircle className="text-emerald-500" size={16} /> Structured Lesson Plans</li>
              <li className="flex items-center gap-2 font-bold text-slate-700 text-sm"><CheckCircle className="text-emerald-500" size={16} /> Custom Learning Plans</li>
            </ul>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 font-bold text-slate-700 text-sm"><CheckCircle className="text-emerald-500" size={16} /> PDF Downloads & Print</li>
              <li className="flex items-center gap-2 font-bold text-slate-700 text-sm"><CheckCircle className="text-emerald-500" size={16} /> Progress Tracking</li>
              <li className="flex items-center gap-2 font-bold text-slate-700 text-sm"><CheckCircle className="text-emerald-500" size={16} /> Parent Dashboard</li>
            </ul>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-[#6C63FF] text-white py-5 rounded-xl font-bold text-xl shadow-xl shadow-indigo-100 hover:bg-[#5A52E0] transition-all disabled:opacity-70"
          >
            {loading ? 'Redirecting...' : isYearly ? 'Start 3 Day Free Trial — $60/yr' : 'Start 3 Day Free Trial'}
          </button>
          <p className="mt-4 text-center text-slate-400 font-bold text-xs uppercase tracking-wide">Cancel anytime</p>
        </div>
      </div>
    </div>
  );
};
