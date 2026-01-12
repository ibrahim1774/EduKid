import React, { useState } from 'react';
import { Child, Grade, Subject } from '../types';
import { ChevronRight, ArrowLeft, Check, Star, Shield, User, Sparkles, BookOpen, Clock, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface OnboardingProps {
  onComplete: (child: any) => void;
  user: { email: string };
}

export const OnboardingView: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [childData, setChildData] = useState({
    name: '',
    age: 7,
    grade: Grade.G2,
    subjects: [Subject.Math, Subject.Reading, Subject.Writing, Subject.Science, Subject.History],
    struggles: '',
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleFinish = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('children')
        .insert([
          {
            user_id: user.id,
            name: childData.name,
            age: childData.age,
            grade: childData.grade,
            interests: [], // Can add interests step later if needed
            struggles: childData.struggles,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      onComplete(data);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error saving child profile:', err);
      alert('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3FF] to-white py-12 px-4 font-sans">
      {/* Progress Header */}
      <div className="max-w-xl mx-auto mb-12">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-[#6C63FF] uppercase tracking-widest">Step {step} of 4</span>
          <span className="text-sm font-medium text-slate-400">Progress: {Math.round((step / 4) * 100)}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#6C63FF]"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl p-6 md:p-12 border border-slate-100"
          >
            {step === 1 && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-indigo-50 text-[#6C63FF] rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <User size={40} />
                  </div>
                  <h2 className="text-2xl md:text-4xl font-extrabold text-[#1A1F3A] mb-3">Let's Get to Know Your Child</h2>
                  <p className="text-slate-500 font-medium">We'll create a personalized learning plan that grows with them.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">Child's First Name</label>
                    <input
                      type="text"
                      value={childData.name}
                      onChange={(e) => setChildData({ ...childData, name: e.target.value })}
                      placeholder="e.g. Emma"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 focus:ring-4 focus:ring-[#6C63FF]/10 text-xl font-bold transition-all outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-bold text-slate-700 block mb-2">Age</label>
                      <select
                        value={childData.age}
                        onChange={(e) => setChildData({ ...childData, age: parseInt(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 font-bold"
                      >
                        {[4, 5, 6, 7, 8, 9, 10, 11].map(a => <option key={a} value={a}>{a} years old</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 block mb-2">Grade</label>
                      <select
                        value={childData.grade}
                        onChange={(e) => setChildData({ ...childData, grade: e.target.value as Grade })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 font-bold"
                      >
                        {Object.values(Grade).map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <button
                  disabled={!childData.name}
                  onClick={nextStep}
                  className="w-full bg-[#6C63FF] disabled:opacity-50 text-white py-6 rounded-2xl font-bold text-xl shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                >
                  Continue <ChevronRight size={24} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={32} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-[#1A1F3A] mb-3">Custom Struggles & Needs</h2>
                  <p className="text-slate-500 font-medium leading-relaxed">Describe exactly what {childData.name} is struggling with (e.g., "carrying digits in addition" or "reading comprehension").</p>
                </div>

                <div className="space-y-4">
                  <textarea
                    value={childData.struggles}
                    onChange={(e) => setChildData({ ...childData, struggles: e.target.value })}
                    placeholder="Type here..."
                    className="w-full h-40 bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 focus:ring-4 focus:ring-[#6C63FF]/10 text-lg transition-all outline-none resize-none font-medium"
                  />
                  <p className="text-xs text-slate-400 italic">Our AI will use this specific input to tailor every worksheet for {childData.name}.</p>
                </div>

                <div className="flex gap-4">
                  <button onClick={prevStep} className="flex-1 bg-slate-100 text-slate-500 py-6 rounded-2xl font-bold text-xl">Back</button>
                  <button onClick={nextStep} className="flex-[2] bg-[#6C63FF] text-white py-6 rounded-2xl font-bold text-xl">Continue</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-[#1A1F3A] mb-3">What's Included</h2>
                  <p className="text-slate-500 font-medium">Worksheets are available for these subjects. You can access them anytime.</p>
                </div>

                <div className="grid gap-3">
                  <StaticCurriculumItem label="Math" icon={<BookOpen size={20} />} />
                  <StaticCurriculumItem label="Reading" icon={<FileText size={20} />} />
                  <StaticCurriculumItem label="Writing" icon={<FileText size={20} />} />
                  <StaticCurriculumItem label="Science" icon={<Sparkles size={20} />} />
                  <StaticCurriculumItem label="History" icon={<Clock size={20} />} />
                </div>

                <div className="bg-indigo-50 p-6 md:p-8 rounded-3xl border border-indigo-100 flex justify-between items-center mt-6">
                  <div>
                    <h4 className="font-bold text-indigo-900 text-sm uppercase tracking-widest mb-1">Plan Overview</h4>
                    <p className="text-xs text-indigo-600 font-medium italic">All curriculum areas included in your 3-day free trial</p>
                  </div>
                  <div className="text-2xl font-extrabold text-[#6C63FF]">$10/mo</div>
                </div>

                <div className="flex gap-4">
                  <button onClick={prevStep} className="flex-1 bg-slate-100 text-slate-500 py-6 rounded-2xl font-bold text-xl">Back</button>
                  <button onClick={nextStep} className="flex-[2] bg-[#6C63FF] text-white py-6 rounded-2xl font-bold text-xl">Continue</button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-[#1A1F3A] mb-3">Review & Confirm</h2>
                  <p className="text-slate-500 font-medium">Review your child's personalized setup.</p>
                </div>

                <div className="space-y-4 text-left">
                  <ReviewItem label="Child Profile" value={`${childData.name}, Age ${childData.age}, ${childData.grade}`} onEdit={() => setStep(1)} />
                  <ReviewItem label="Target Struggles" value={childData.struggles || 'None specified'} onEdit={() => setStep(2)} />
                  <ReviewItem label="Plan" value={`Full Curriculum Access`} onEdit={() => setStep(3)} />
                </div>

                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-start gap-4">
                  <div className="bg-emerald-500 text-white p-2 rounded-xl">
                    <Shield size={20} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-emerald-900 text-sm">3 Day Free Trial Starts Now</h4>
                    <p className="text-xs text-emerald-700 leading-relaxed">Cancel anytime in settings.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={prevStep} className="flex-1 bg-slate-100 text-slate-500 py-6 rounded-2xl font-bold text-xl disabled:opacity-50" disabled={loading}>Back</button>
                  <button
                    onClick={handleFinish}
                    disabled={loading}
                    className="flex-[2] bg-[#FF7A59] text-white py-6 rounded-2xl font-bold text-xl shadow-xl shadow-orange-100 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="animate-spin" size={24} /> : 'Start Learning!'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const StaticCurriculumItem = ({ label, icon }: { label: string, icon: React.ReactNode }) => (
  <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-indigo-50 text-[#6C63FF] rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <h4 className="font-bold text-slate-700 text-lg">{label}</h4>
    </div>
    <div className="flex items-center gap-2 text-indigo-500/50">
      <Check size={18} strokeWidth={3} />
      <span className="text-[10px] font-bold uppercase tracking-widest">Included</span>
    </div>
  </div>
);

const ReviewItem = ({ label, value, onEdit }: { label: string, value: string, onEdit: () => void }) => (
  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex justify-between items-center">
    <div className="max-w-[80%]">
      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</h4>
      <p className="font-bold text-slate-800 line-clamp-2">{value}</p>
    </div>
    <button onClick={onEdit} className="text-[#6C63FF] font-bold text-xs uppercase tracking-widest hover:underline">Edit</button>
  </div>
);