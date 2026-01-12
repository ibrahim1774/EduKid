import React, { useState, useEffect } from 'react';
import { Subject, Child, Worksheet } from '../types';
import { Plus, Sparkles, FileText, ChevronRight, User, Loader2, BookOpen, Clock, Key, Calendar } from 'lucide-react';
import { generateWorksheetAction } from '../services/geminiService';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  const [dateFilter, setDateFilter] = useState<string>('all'); // 'all', 'today', 'week'

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

  const handleGenerate = async (subject: Subject) => {
    if (!activeChild) return;
    setGenerating(subject);
    try {
      // Use custom struggles in generation
      const result = await generateWorksheetAction(
        activeChild.name,
        activeChild.grade,
        subject,
        activeChild.struggles
      );

      const { data, error } = await supabase
        .from('worksheets')
        .insert([
          {
            child_id: activeChild.id,
            title: result.title || "Today's Lesson",
            topic: result.topic || "General Practice",
            subject: subject,
            content: {
              instructions: result.instructions,
              questions: (result.questions || []).map((q: any) => ({ ...q, id: Math.random().toString(36).substr(2, 9) }))
            }
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setWorksheets(prev => [data, ...prev]);
      onViewWorksheet(data.id);
    } catch (e) {
      console.error(e);
      alert("Failed to generate worksheet. Please try again.");
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

  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    return d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
  };

  const isThisWeek = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    return d >= startOfWeek;
  };

  const filteredByDate = worksheets.filter(w => {
    if (dateFilter === 'today') return isToday(w.created_at);
    if (dateFilter === 'week') return isThisWeek(w.created_at);
    return true;
  });

  const subjectWorksheets = filteredByDate.filter(w => w.subject === activeSubject);
  const todayWorksheet = worksheets.find(w => w.subject === activeSubject && isToday(w.created_at));

  const subjects = [Subject.Math, Subject.Reading, Subject.Writing, Subject.Science, Subject.History];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-16 bg-[#F7F9FC] font-sans">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10 md:mb-16">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1A1F3A]">Welcome back! 🌟</h1>
          </div>
          <p className="text-slate-500 font-medium text-base md:text-lg">Here's {activeChild?.name}'s personalized learning dashboard.</p>
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
              onClick={() => setActiveSubject(sub)}
              className={`px-6 py-3 rounded-full font-bold whitespace-nowrap transition-all border-2 flex items-center gap-2 ${activeSubject === sub ? 'bg-[#1A1F3A] text-white border-[#1A1F3A] shadow-md' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
            >
              {sub === Subject.Math && <BookOpen size={18} />}
              {sub}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-100 shadow-sm">
          <button
            onClick={() => setDateFilter('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${dateFilter === 'all' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
          >
            All Time
          </button>
          <button
            onClick={() => setDateFilter('today')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${dateFilter === 'today' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Today
          </button>
          <button
            onClick={() => setDateFilter('week')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${dateFilter === 'week' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
          >
            This Week
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Main Column */}
        <div className="lg:col-span-8 space-y-12">
          {/* Active Subject Today Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-[#1A1F3A]">Today's {activeSubject}</h2>
            </div>

            {todayWorksheet ? (
              <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border-2 border-[#6C63FF] shadow-2xl shadow-indigo-100/40 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-6 w-full">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-50 text-[#6C63FF] rounded-3xl flex items-center justify-center shrink-0">
                    <FileText size={40} />
                  </div>
                  <div className="text-left">
                    <h4 className="text-2xl md:text-3xl font-extrabold text-[#1A1F3A] mb-1 leading-tight">{todayWorksheet.title}</h4>
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                      <span className="bg-slate-50 px-2 py-1 rounded-md">{activeSubject}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full" />
                      <span>Ready for Practice</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-3 w-full md:w-auto">
                  <button onClick={() => onViewWorksheet(todayWorksheet.id)} className="flex-1 md:flex-none px-8 py-4 bg-[#6C63FF] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 hover:bg-[#5A52E0] transition-all active:scale-95">
                    View
                  </button>
                  <button onClick={() => onViewWorksheet(todayWorksheet.id, true)} className="flex-1 md:flex-none px-8 py-4 bg-amber-50 text-amber-700 border border-amber-200 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-amber-100 transition-all active:scale-95">
                    <Key size={20} /> Key
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-10 md:p-16 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-[2rem] flex items-center justify-center mb-8">
                  <Plus size={48} />
                </div>
                <h4 className="text-2xl font-extrabold text-[#1A1F3A] mb-3 tracking-tight">Generate {activeSubject} Worksheet</h4>
                <p className="text-slate-400 text-lg font-medium mb-10 max-w-sm">A new personalized worksheet for {activeChild?.name} is ready. Start today's lesson with one click.</p>
                <button
                  disabled={generating !== null}
                  onClick={() => handleGenerate(activeSubject)}
                  className="w-full max-w-md bg-[#6C63FF] text-white py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition-all hover:shadow-2xl shadow-indigo-100 active:scale-95 disabled:opacity-70"
                >
                  {generating === activeSubject ? <Loader2 size={28} className="animate-spin" /> : <><Sparkles size={24} /> Create Daily Worksheet</>}
                </button>
              </div>
            )}
          </div>

          {/* Past Worksheets for this Subject */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-[#1A1F3A]">{activeSubject} History</h3>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{subjectWorksheets.length} Total</span>
            </div>
            <div className="space-y-4">
              {subjectWorksheets.filter(w => !isToday(w.created_at)).length > 0 ? subjectWorksheets.filter(w => !isToday(w.created_at)).map(ws => (
                <div key={ws.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-md transition-all">
                  <div className="flex items-center gap-5 w-full overflow-hidden text-left">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-[#6C63FF] shrink-0 border border-slate-100">
                      <FileText size={24} />
                    </div>
                    <div className="overflow-hidden">
                      <h5 className="font-extrabold text-slate-800 text-lg truncate">{ws.title}</h5>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{new Date(ws.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button onClick={() => onViewWorksheet(ws.id)} className="flex-1 sm:flex-none bg-white border-2 border-slate-100 text-slate-600 px-6 py-3 rounded-xl font-bold text-sm hover:border-[#6C63FF] hover:text-[#6C63FF] transition-all">View</button>
                    <button onClick={() => onViewWorksheet(ws.id, true)} className="flex-1 sm:flex-none bg-amber-50 text-amber-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-amber-100 transition-all flex items-center justify-center gap-2">
                      <Key size={16} /> Key
                    </button>
                  </div>
                </div>
              )) : (
                <div className="p-16 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-center text-slate-400 font-bold bg-white/50">
                  No past {activeSubject} worksheets found for this period.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-indigo-50 relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-12 -mt-12 opacity-50" />
            <div className="relative z-10">
              <h3 className="font-extrabold text-[#1A1F3A] mb-4 flex items-center gap-2">
                <Sparkles className="text-amber-500" size={20} /> Curriculum Note
              </h3>
              <p className="text-slate-600 leading-relaxed font-medium text-sm">
                Switch subjects and filter by date to access {activeChild?.name}'s full curriculum history. Our AI uses previous performance to adapt lessons.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-[#6C63FF] font-bold text-xs uppercase">
                  {activeChild?.name?.charAt(0)}
                </div>
                <span className="text-xs font-bold text-[#6C63FF] uppercase tracking-widest">{activeChild?.grade} Student</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button onClick={onAddChild} className="w-full bg-white border-2 border-slate-100 p-6 rounded-3xl flex items-center justify-between group hover:border-[#6C63FF] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-[#6C63FF] rounded-xl flex items-center justify-center">
                  <Plus size={24} />
                </div>
                <span className="font-extrabold text-[#1A1F3A]">Add Another Child</span>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-[#6C63FF]" />
            </button>
            <button className="w-full bg-white border-2 border-slate-100 p-6 rounded-3xl flex items-center justify-between group hover:border-[#6C63FF] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center">
                  <Calendar size={24} />
                </div>
                <span className="font-extrabold text-[#1A1F3A]">Academic Calendar</span>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-[#6C63FF]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
