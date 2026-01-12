import React from 'react';
import { ArrowLeft, Mail, Lock, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const LoginView: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('LoginView: Attempting login for:', email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('LoginView: Login error:', error);
        throw error;
      }

      console.log('LoginView: Login successful');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('LoginView: Catch block error:', err);
      setError(err.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="bg-white w-full max-w-md p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-slate-100">
        <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-[#6366F1] transition-colors mb-8 font-medium">
          <ArrowLeft size={18} /> Back to Home
        </Link>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2 text-center">Welcome Back</h2>
        <p className="text-slate-500 mb-10 text-center">Continue your child's journey.</p>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-medium mb-6 animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="parent@example.com"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#6366F1] transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#6366F1] transition-all"
              />
            </div>
          </div>
          <button
            disabled={loading}
            className="w-full bg-[#6366F1] text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-[#5558E3] transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : 'Continue'}
          </button>
        </form>
        <p className="mt-8 text-center text-slate-400 text-sm">
          Don't have an account? <Link to="/get-started" className="text-[#6366F1] font-bold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};
