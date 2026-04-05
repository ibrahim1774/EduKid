import React, { useState } from 'react';
import { Grade, Subject } from '../types';
import { ChevronRight, ArrowLeft, Check, Star, Shield, User, Sparkles, BookOpen, FileText, Loader2, Target, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { COMMON_TOPICS } from '../lib/topics';

interface OnboardingProps {
  onComplete: (child: any) => void;
  user: { email: string };
}

export const OnboardingView: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const TOTAL_STEPS = 2;

  const [childData, setChildData] = useState({
    name: '',
    age: 7,
    grade: Grade.G2,
    subjects: [Subject.Math, Subject.Reading, Subject.Writing, Subject.Science],
    struggles: '',
    preferredTopics: {} as Record<string, string[]>,
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const toggleTopic = (subject: Subject, topic: string) => {
    const current = childData.preferredTopics[subject] || [];
    const updated = current.includes(topic)
      ? current.filter(t => t !== topic)
      : [...current, topic];

    setChildData({
      ...childData,
      preferredTopics: {
        ...childData.preferredTopics,
        [subject]: updated
      }
    });
  };

  const handleFinish = async () => {
    if (!user) {
      alert('You must be logged in to save a profile. Please try logging in again.');
      navigate('/login');
      return;
    }
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
            interests: [],
            struggles: [],
            preferred_topics: childData.preferredTopics,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      onComplete(data);

      // Check if user already has an active subscription (Add Child flow)
      try {
        const res = await fetch('/api/check-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user!.email }),
        });
        const subData = await res.json();
        navigate(subData.active ? '/dashboard' : '/subscribe');
      } catch {
        navigate('/subscribe');
      }
    } catch (err: any) {
      console.error('OnboardingView: Error saving profile:', err);
      alert(`Failed to save profile: ${err.message || 'Unknown error'}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3FF] to-white py-12 px-4 font-sans text-left">
      <div className="max-w-xl mx-auto mb-12">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-[#6C63FF] uppercase tracking-widest">Step {step} of {TOTAL_STEPS}</span>
          <span className="text-sm font-medium text-slate-400">Progress: {Math.round((step / TOTAL_STEPS) * 100)}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#6C63FF]"
            initial={{ width: 0 }}
            animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
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
                  <h2 className="text-2xl md:text-3xl font-extrabold text-[#1A1F3A] mb-3">Let's Get to Know Your Child</h2>
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
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Target size={32} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-[#1A1F3A] mb-3">Select Goal Topics</h2>
                  <p className="text-slate-500 font-medium">Pick a few topics for each subject to focus on first.</p>
                </div>

                <div className="space-y-8 overflow-y-auto max-h-[50vh] pr-2 no-scrollbar">
                  {[Subject.Math, Subject.Reading, Subject.Writing, Subject.Science].map(sub => (
                    <div key={sub} className="space-y-3">
                      <h4 className="font-extrabold text-[#1A1F3A] flex items-center gap-2 sticky top-0 bg-white py-2 z-10 uppercase tracking-widest text-xs">
                        {sub === Subject.Math && <BookOpen size={16} className="text-[#6C63FF]" />}
                        {sub === Subject.Reading && <FileText size={16} className="text-[#6C63FF]" />}
                        {sub === Subject.Writing && <Plus size={16} className="text-[#6C63FF]" />}
                        {sub === Subject.Science && <Sparkles size={16} className="text-[#6C63FF]" />}
                        {sub}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {COMMON_TOPICS[sub].map(topic => {
                          const isSelected = (childData.preferredTopics[sub] || []).includes(topic);
                          return (
                            <button
                              key={topic}
                              onClick={() => toggleTopic(sub, topic)}
                              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 ${isSelected ? 'bg-[#6C63FF] text-white border-[#6C63FF] shadow-lg shadow-indigo-100' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'}`}
                            >
                              {topic}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-50">
                  <button onClick={prevStep} className="flex-1 bg-slate-100 text-slate-500 py-6 rounded-2xl font-bold text-xl">Back</button>
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
  <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm flex items-center justify-between text-left">
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
  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex justify-between items-center text-left">
    <div className="max-w-[80%] text-left">
      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-left">{label}</h4>
      <p className="font-bold text-slate-800 line-clamp-2 text-left">{value}</p>
    </div>
    <button onClick={onEdit} className="text-[#6C63FF] font-bold text-xs uppercase tracking-widest hover:underline shrink-0">Edit</button>
  </div>
);