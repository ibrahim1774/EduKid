import React, { useState, useEffect } from 'react';
import { Subject, Grade, Worksheet } from '../types';
import { Plus, Sparkles, FileText, ChevronRight, User, Loader2, BookOpen, Clock, Key, Calendar, Target, BrainCircuit, GraduationCap } from 'lucide-react';
import { generateWorksheetAction } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LearningCalendar } from '../components/LearningCalendar';
import { isSameDay, format, startOfToday } from 'date-fns';
import { COMMON_TOPICS } from '../lib/topics';

interface DashboardProps {
  onViewWorksheet: (id: string, showAnswerKey?: boolean) => void;
  onAddChild: () => void;
}

export const DashboardView: React.FC<DashboardProps> = ({ onViewWorksheet, onAddChild }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState<any[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [worksheets, setWorksheets] = useState<any[]>([]);
  const [generating, setGenerating] = useState<string | null>(null);
  const [activeSubject, setActiveSubject] = useState<Subject>(Subject.Math);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [manualTopic, setManualTopic] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchChildren();
    }
  }, [user]);

  useEffect(() => {
    if (activeChildId) {
      fetchWorksheets(activeChildId);
    }
  }, [activeChildId]);

  const fetchChildren = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setChildren(data || []);
      if (data && data.length > 0 && !activeChildId) {
        setActiveChildId(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching children:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorksheets = async (childId: string) => {
    try {
      const { data, error } = await supabase
        .from('worksheets')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorksheets(data || []);
    } catch (err) {
      console.error('Error fetching worksheets:', err);
    }
  };

  const activeChild = children.find(c => c.id === activeChildId);

  const handleGenerate = async (subject: Subject, selectedTopic?: string) => {
    if (!activeChild) return;
    setGenerating(subject);
    try {
      const topicToUse = selectedTopic || manualTopic || (activeChild.preferred_topics?.[subject]?.length > 0
        ? activeChild.preferred_topics[subject][Math.floor(Math.random() * activeChild.preferred_topics[subject].length)]
        : undefined);

      const result = await generateWorksheetAction(
        activeChild.name,
        activeChild.grade,
        subject,
        activeChild.struggles,
        topicToUse
      );

      const { data, error } = await supabase
        .from('worksheets')
        .insert([
          {
            child_id: activeChild.id,
            title: result.title || `${topicToUse || "Today's"} Lesson`,
            topic: result.topic || topicToUse || "General Practice",
            subject: subject,
            learning_content: result.learningContent,
            content: {
              instructions: result.instructions,
              questions: (result.questions || []).map((q: any) => ({ ...q, id: q.id || Math.random().toString(36).substr(2, 9) }))
            }
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setWorksheets(prev => [data, ...prev]);
      setManualTopic(null);
    } catch (e: any) {
      console.error('Worksheet generation failed:', e);
      alert(`Failed to generate: ${e.message || "Unknown error"}`);
    } finally {
      setGenerating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#6C63FF]" size={48} />
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white min-h-[70vh]">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 bg-indigo-50 text-[#6C63FF] rounded-[2rem] flex items-center justify-center mb-8">
          <User size={48} />
        </motion.div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Ready to Start Learning?</h2>
        <p className="text-slate-500 mb-10 max-w-sm text-lg font-medium">Add your child's profile to begin generating personalized practice worksheets every day.</p>
        <button onClick={onAddChild} className="bg-[#6C63FF] text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-indigo-100 flex items-center gap-3 hover:-translate-y-1 transition-all">
          <Plus size={24} /> Add Child Profile
        </button>
      </div>
    );
  }

  const isTodaySelected = isSameDay(selectedDate, startOfToday());
  const currentWorksheets = worksheets.filter(w =>
    w.subject === activeSubject && isSameDay(new Date(w.created_at || ''), selectedDate)
  );

  const worksheetDates = worksheets.map(w => w.created_at);
  const subjects = [Subject.Math, Subject.Reading, Subject.Writing, Subject.Science];
  const popularTopics = COMMON_TOPICS[activeSubject] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 bg-[#F7F9FC] font-sans text-left">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A1F3A] mb-2 flex items-center gap-3">
            {isTodaySelected ? "Main Dashboard 🏠" : format(selectedDate, 'MMMM do, yyyy')}
          </h1>
          <p className="text-slate-500 font-medium text-lg text-left">
            {isTodaySelected
              ? `Let's see what ${activeChild?.name} is learning today.`
              : `Reviewing ${activeChild?.name}'s past accomplishments.`
            }
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto max-w-full no-scrollbar">
          {children.map(child => (
            <button
              key={child.id}
              onClick={() => setActiveChildId(child.id)}
              className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${activeChildId === child.id ? 'bg-[#6C63FF] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              {child.name}
            </button>
          ))}
          <button onClick={onAddChild} className="min-w-[48px] h-12 bg-indigo-50 text-[#6C63FF] rounded-xl flex items-center justify-center hover:bg-indigo-100 transition-all">
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Subject Tab Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {subjects.map(sub => (
            <button
              key={sub}
              onClick={() => { setActiveSubject(sub); setManualTopic(null); }}
              className={`px-6 py-3 rounded-full font-bold whitespace-nowrap transition-all border-2 flex items-center gap-2 ${activeSubject === sub ? 'bg-[#1A1F3A] text-white border-[#1A1F3A] shadow-md' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
            >
              {sub === Subject.Math && <BookOpen size={18} />}
              {sub === Subject.Reading && <FileText size={18} />}
              {sub === Subject.Writing && <Plus size={18} />}
              {sub === Subject.Science && <Sparkles size={18} />}
              {sub}
            </button>
          ))}
        </div>

        {!isTodaySelected && (
          <button
            onClick={() => setSelectedDate(startOfToday())}
            className="text-xs font-bold text-[#6C63FF] bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-all font-sans uppercase tracking-[1px]"
          >
            Back to Today
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-8 text-left">
        {/* Main Column */}
        <div className="lg:col-span-8 space-y-8 text-left">
          {currentWorksheets.length > 0 ? (
            <div className="space-y-8 text-left">
              {currentWorksheets.map(ws => (
                <div key={ws.id} className="space-y-8 text-left">
                  {/* Learning Section */}
                  <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden text-left">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 flex items-center justify-center">
                      <BrainCircuit size={40} className="text-amber-300 mt-12 mr-12" />
                    </div>
                    <div className="relative z-10 text-left">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">Part 1: The Lesson</div>
                        <h2 className="text-2xl font-black text-[#1A1F3A] leading-none">{ws.topic || ws.title}</h2>
                      </div>
                      <div className="prose prose-slate max-w-none text-left">
                        <p className="text-lg text-slate-600 leading-relaxed font-medium whitespace-pre-wrap text-left">
                          {ws.learning_content || "Wait while we prepare the lesson content..."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Practice Section */}
                  <div className="bg-[#6C63FF] p-8 md:p-10 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200/40 flex flex-col md:flex-row justify-between items-center gap-8 text-left">
                    <div className="flex items-center gap-6 w-full text-left">
                      <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center shrink-0">
                        <Target size={40} />
                      </div>
                      <div className="text-left">
                        <div className="bg-white/20 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 inline-block">Part 2: Daily Practice</div>
                        <h4 className="text-2xl font-black mb-1 leading-tight text-left">Ready to test your skills?</h4>
                        <p className="text-white/80 font-bold text-left">{ws.content?.questions?.length || 0} Questions related to {ws.topic}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                      <button onClick={() => onViewWorksheet(ws.id)} className="flex-1 md:flex-none px-10 py-5 bg-white text-[#6C63FF] rounded-2xl font-black text-lg shadow-xl hover:-translate-y-1 transition-all active:scale-95 whitespace-nowrap">
                        {isTodaySelected ? 'Go to Practice ✨' : 'Review Work'}
                      </button>
                      {isTodaySelected && (
                        <button onClick={() => onViewWorksheet(ws.id, true)} className="flex-1 md:flex-none px-6 py-5 bg-[#1A1F3A] text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95">
                          <Key size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8 text-left">
              {/* Generation Control */}
              <div className="bg-white p-10 md:p-16 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-indigo-50 text-[#6C63FF] rounded-[2.5rem] flex items-center justify-center mb-8">
                  {isTodaySelected ? <GraduationCap size={48} /> : <Calendar size={48} />}
                </div>
                <h4 className="text-2xl font-black text-[#1A1F3A] mb-3 tracking-tight">
                  {manualTopic ? `Focus: ${manualTopic}` : `Start ${activeSubject} Lesson`}
                </h4>
                <p className="text-slate-400 text-lg font-medium mb-10 max-w-sm text-center">
                  {isTodaySelected
                    ? `Create today's lesson and practice. Pick a topic below or let the AI choose based on previous focus.`
                    : `No ${activeSubject} worksheets were generated on this date.`
                  }
                </p>
                {isTodaySelected && (
                  <button
                    disabled={generating !== null}
                    onClick={() => handleGenerate(activeSubject)}
                    className="w-full max-w-md bg-[#6C63FF] text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all hover:shadow-2xl shadow-indigo-100 active:scale-95 disabled:opacity-70"
                  >
                    {generating === activeSubject ? <Loader2 size={28} className="animate-spin" /> : <><Sparkles size={24} /> Create Daily Lesson</>}
                  </button>
                )}
              </div>

              {/* Popular Topics Section */}
              {isTodaySelected && (
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 text-left">
                  <h3 className="text-xs font-black text-[#1A1F3A] mb-6 flex items-center gap-2 uppercase tracking-widest text-left">
                    <Target className="text-[#6C63FF]" size={18} /> Common Topics Reference
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4 text-left">
                    {popularTopics.map(topic => (
                      <button
                        key={topic}
                        onClick={() => setManualTopic(topic)}
                        className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between text-left group ${manualTopic === topic ? 'bg-indigo-50 border-[#6C63FF] text-[#6C63FF]' : 'bg-white border-slate-50 hover:border-slate-100 text-slate-600'}`}
                      >
                        <span className="font-bold">{topic}</span>
                        <ChevronRight size={18} className={manualTopic === topic ? 'text-[#6C63FF]' : 'text-slate-300 group-hover:text-slate-400'} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8 text-left">
          <LearningCalendar
            currentDate={selectedDate}
            onDateSelect={setSelectedDate}
            worksheetDates={worksheetDates}
          />

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-indigo-50 relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-12 -mt-12 opacity-50" />
            <div className="relative z-10 text-left text-left">
              <h3 className="font-black text-[#1A1F3A] mb-4 flex items-center gap-2 uppercase tracking-widest text-xs text-left">
                <Sparkles className="text-amber-500" size={20} /> Parent Tip
              </h3>
              <p className="text-slate-600 leading-relaxed font-bold text-sm text-left">
                Each lesson starts with Part 1: Learning, followed by Part 2: Practice. This structure helps {activeChild?.name} master concepts systematically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
