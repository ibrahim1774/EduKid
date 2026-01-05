
import React from 'react';
import { ArrowLeft, Mail, Lock, UserPlus } from 'lucide-react';

export const SignupView: React.FC<{ onSignup: (email: string) => void, onBack: () => void }> = ({ onSignup, onBack }) => {
  const [email, setEmail] = React.useState('');

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white w-full max-w-md p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-slate-100">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-[#6366F1] transition-colors mb-8 font-medium">
          <ArrowLeft size={18} /> Back to Home
        </button>
        <div className="w-16 h-16 bg-[#6366F1]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#6366F1]">
          <UserPlus size={32} />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2 text-center">Create Your Account</h2>
        <p className="text-slate-500 mb-10 text-center">Join thousands of parents building a brighter future.</p>
        
        <form onSubmit={(e) => { e.preventDefault(); onSignup(email); }} className="space-y-6">
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
            <label className="text-sm font-bold text-slate-700 ml-1">Create Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                required
                type="password" 
                placeholder="Choose a strong password"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#6366F1] transition-all"
              />
            </div>
          </div>
          <button className="w-full bg-[#6366F1] text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-[#5558E3] transition-all active:scale-[0.98] mt-4">
            Get Started
          </button>
        </form>
        <p className="mt-8 text-center text-slate-400 text-sm">
          Already have an account? <button className="text-[#6366F1] font-bold hover:underline">Log in</button>
        </p>
      </div>
    </div>
  );
};
