import React, { useState } from 'react';
import { Child, Grade, Subject, LearningNeeds, ParentPreferences } from '../types';
import { ChevronRight, ArrowLeft, Check, Star, Settings, Shield, User, Sparkles, BookOpen, Clock, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingProps {
  onComplete: (child: Child) => void;
  user: { email: string };
}

const TOPICS_BY_SUBJECT: Record<Subject, string[]> = {
  [Subject.Math]: ["Addition & Subtraction", "Multiplication & Division", "Word Problems", "Fractions & Decimals", "Geometry", "Time & Money"],
  [Subject.Reading]: ["Phonics", "Comprehension", "Vocabulary", "Spelling", "Fluency"],
  [Subject.Writing]: ["Handwriting", "Sentence Structure", "Paragraph Writing", "Creative Writing", "Grammar"],
  [Subject.Science]: ["Life Science", "Earth Science", "Physical Science", "Scientific Method"],
  [Subject.History]: ["Ancient Civilizations", "Local History", "Historical Figures", "Time Periods", "Cultural Heritage"]
};

export const OnboardingView: React.FC<OnboardingProps> = ({ onComplete, user }) => {
  const [step, setStep] = useState(1);
  const [childData, setChildData] = useState<Partial<Child>>({
    name: '',
    age: 7,
    grade: Grade.G2,
    subjects: [Subject.Math, Subject.Reading, Subject.Writing, Subject.Science, Subject.History],
    learningNeeds: { [Subject.Math]: [], [Subject.Reading]: [], [Subject.Writing]: [], [Subject.Science]: [], [Subject.History]: [] },
    preferences: {
      autoGenerate: true,
      generationTime: '06:00',
      notifications: { dailyReady: true, weeklyProgress: true },
      voiceEnabled: true,
      voiceSpeed: 1.0
    }
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const toggleNeed = (subject: Subject, topic: string) => {
    setChildData(prev => {
      const currentNeeds = prev.learningNeeds?.[subject] || [];
      const updatedNeeds = currentNeeds.includes(topic)
        ? currentNeeds.filter(t => t !== topic)
        : [...currentNeeds, topic];
      return {
        ...prev,
        learningNeeds: { ...prev.learningNeeds, [subject]: updatedNeeds }
      };
    });
  };

  const handleFinish = () => {
    onComplete({
      ...(childData as Child),
      id: Math.random().toString(36).substr(2, 9)
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3FF] to-white py-12 px-4">
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
                      onChange={(e) => setChildData({...childData, name: e.target.value})}
                      placeholder="e.g. Emma"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 focus:ring-4 focus:ring-[#6C63FF]/10 text-xl font-bold transition-all outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-bold text-slate-700 block mb-2">Age</label>
                      <select 
                        value={childData.age}
                        onChange={(e) => setChildData({...childData, age: parseInt(e.target.value)})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 font-bold"
                      >
                        {[4,5,6,7,8,9,10,11].map(a => <option key={a} value={a}>{a} years old</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 block mb-2">Grade</label>
                      <select 
                        value={childData.grade}
                        onChange={(e) => setChildData({...childData, grade: e.target.value as Grade})}
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
                  <h2 className="text-2xl md:text-3xl font-extrabold text-[#1A1F3A] mb-3">What Does {childData.name} Need Help With?</h2>
                  <p className="text-slate-500 font-medium">Select areas for targeted practice.</p>
                </div>
                
                <div className="space-y-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {Object.entries(TOPICS_BY_SUBJECT).map(([sub, topics]) => (
                    <div key={sub} className="space-y-4">
                      <h4 className="font-bold text-lg text-indigo-600 flex items-center gap-2">
                         {sub === Subject.Math && "📐"} {sub === Subject.Reading && "📖"} 
                         {sub === Subject.Writing && "✍️"} {sub === Subject.Science && "🔬"} 
                         {sub === Subject.History && "🕰️"} 
                         {sub}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {topics.map(topic => (
                          <button
                            key={topic}
                            onClick={() => toggleNeed(sub as Subject, topic)}
                            className={`p-4 rounded-2xl border-2 text-left transition-all text-sm font-bold ${childData.learningNeeds?.[sub as Subject]?.includes(topic) ? 'border-[#6C63FF] bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'}`}
                          >
                            {topic}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
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
                  <StaticSubjectItem label="Mathematics" icon={<BookOpen size={20} />} />
                  <StaticSubjectItem label="Reading" icon={<FileText size={20} />} />
                  <StaticSubjectItem label="Writing" icon={<FileText size={20} />} />
                  <StaticSubjectItem label="Science" icon={<Sparkles size={20} />} />
                  <StaticSubjectItem label="History" icon={<Clock size={20} />} />
                </div>

                <div className="bg-[#1A1F3A] p-6 md:p-8 rounded-3xl text-white flex justify-between items-center mt-6">
                  <div>
                    <h4 className="font-bold opacity-60 text-xs uppercase tracking-widest mb-1">Monthly Plan</h4>
                    <p className="text-[10px] text-indigo-200">3 Day Free Trial • All Curriculum Included</p>
                  </div>
                  <div className="text-3xl md:text-4xl font-extrabold">$10</div>
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
                
                <div className="space-y-4">
                  <ReviewItem label="Child Profile" value={`${childData.name}, Age ${childData.age}, ${childData.grade}`} onEdit={() => setStep(1)} />
                  <ReviewItem label="Learning Needs" value={Object.values(childData.learningNeeds || {}).flat().slice(0, 3).join(', ') + (Object.values(childData.learningNeeds || {}).flat().length > 3 ? '...' : '')} onEdit={() => setStep(2)} />
                  <ReviewItem label="Plan" value={`Full Access ($10/mo)`} onEdit={() => setStep(3)} />
                </div>

                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-start gap-4">
                  <div className="bg-emerald-500 text-white p-2 rounded-xl">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-900 text-sm">3 Day Free Trial Starts Now</h4>
                    <p className="text-xs text-emerald-700 leading-relaxed">No charge until trial ends. Cancel anytime in settings.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={prevStep} className="flex-1 bg-slate-100 text-slate-500 py-6 rounded-2xl font-bold text-xl">Back</button>
                  <button onClick={handleFinish} className="flex-[2] bg-[#FF7A59] text-white py-6 rounded-2xl font-bold text-xl shadow-xl shadow-orange-100">Start Learning!</button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const StaticSubjectItem = ({ label, icon }: { label: string, icon: React.ReactNode }) => (
  <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-indigo-50 text-[#6C63FF] rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <h4 className="font-bold text-slate-700">{label}</h4>
    </div>
    <div className="flex items-center gap-1.5 text-emerald-500">
      <Check size={16} strokeWidth={3} />
      <span className="text-[10px] font-bold uppercase tracking-widest">Available</span>
    </div>
  </div>
);

const ReviewItem = ({ label, value, onEdit }: { label: string, value: string, onEdit: () => void }) => (
  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex justify-between items-center">
    <div>
      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</h4>
      <p className="font-bold text-slate-800">{value}</p>
    </div>
    <button onClick={onEdit} className="text-[#6C63FF] font-bold text-xs uppercase tracking-widest hover:underline">Edit</button>
  </div>
);
