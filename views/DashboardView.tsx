import React, { useState } from 'react';
import { AppState, Child, Subject, Worksheet } from '../types';
import { Plus, Sparkles, FileText, ChevronRight, User, Loader2, BookOpen, Clock, TrendingUp, Star, Settings, Key, Download } from 'lucide-react';
import { generateWorksheetAction } from '../services/geminiService';
import { motion } from 'framer-motion';

interface DashboardProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onViewWorksheet: (id: string, showAnswerKey?: boolean) => void;
  onAddChild: () => void;
}

export const DashboardView: React.FC<DashboardProps> = ({ state, setState, onViewWorksheet, onAddChild }) => {
  const [generating, setGenerating] = useState<string | null>(null);
  const [activeSubject, setActiveSubject] = useState<Subject>(Subject.Math);
  const activeChild = state.children.find(c => c.id === state.activeChildId) || state.children[0];

  const handleGenerate = async (subject: Subject) => {
    if (!activeChild) return;
    setGenerating(subject);
    try {
      const result = await generateWorksheetAction(activeChild.name, activeChild.grade, subject);
      const newWorksheet: Worksheet = {
        id: Math.random().toString(36).substr(2, 9),
        childId: activeChild.id,
        subject,
        grade: activeChild.grade,
        date: new Date().toLocaleDateString(),
        title: result.title || 'Today\'s Lesson',
        instructions: result.instructions || 'Complete the following exercises.',
        questions: (result.questions || []).map((q: any) => ({ ...q, id: Math.random().toString(36).substr(2, 9) })),
        status: 'ready'
      };
      setState(prev => ({
        ...prev,
        worksheets: [newWorksheet, ...prev.worksheets]
      }));
    } catch (e) {
      alert("Failed to generate worksheet. Please try again.");
    } finally {
      setGenerating(null);
    }
  };

  if (!activeChild) {
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

  const childWorksheets = state.worksheets.filter(w => w.childId === activeChild.id);
  const filteredWorksheets = childWorksheets.filter(w => w.subject === activeSubject);
  const todayWorksheet = childWorksheets.find(w => w.subject === activeSubject && w.date === new Date().toLocaleDateString());

  const subjects = [Subject.Math, Subject.Reading, Subject.Writing, Subject.Science, Subject.History];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-16 bg-[#F7F9FC]">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10 md:mb-16">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1A1F3A]">Welcome back! 🌟</h1>
          </div>
          <p className="text-slate-500 font-medium text-base md:text-lg">Here's {activeChild.name}'s personalized learning dashboard.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto max-w-full">
           {state.children.map(child => (
             <button
               key={child.id}
               onClick={() => setState(prev => ({ ...prev, activeChildId: child.id }))}
               className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${activeChild.id === child.id ? 'bg-[#6C63FF] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
             >
               {child.name}
             </button>
           ))}
           <button onClick={onAddChild} className="min-w-[48px] h-12 bg-indigo-50 text-[#6C63FF] rounded-xl flex items-center justify-center hover:bg-indigo-100 transition-all">
             <Plus size={20} />
           </button>
        </div>
      </div>

      {/* Subject Tabs - Scrollable on mobile */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
        {subjects.map(sub => (
          <button
            key={sub}
            onClick={() => setActiveSubject(sub)}
            className={`px-6 py-3 rounded-full font-bold whitespace-nowrap transition-all border-2 ${activeSubject === sub ? 'bg-[#1A1F3A] text-white border-[#1A1F3A] shadow-md' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'}`}
          >
            {sub}
          </button>
        ))}
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
              <div className="bg-white p-8 rounded-[2rem] border-2 border-[#6C63FF] shadow-xl shadow-indigo-100/30 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-indigo-50 text-[#6C63FF] rounded-2xl flex items-center justify-center">
                    <FileText size={32} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-extrabold text-[#1A1F3A] mb-1">{todayWorksheet.title}</h4>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{activeSubject} • Ready to Print</p>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-3 w-full md:w-auto">
                   <button onClick={() => onViewWorksheet(todayWorksheet.id)} className="flex-1 md:flex-none px-6 py-3 bg-[#6C63FF] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100">
                     <FileText size={18} /> Worksheet
                   </button>
                   <button onClick={() => onViewWorksheet(todayWorksheet.id, true)} className="flex-1 md:flex-none px-6 py-3 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl font-bold flex items-center justify-center gap-2">
                     <Key size={18} /> Answer Key
                   </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mb-6">
                   <Plus size={40} />
                </div>
                <h4 className="text-xl font-extrabold text-[#1A1F3A] mb-2 uppercase tracking-tight">Need {activeSubject} Practice?</h4>
                <p className="text-slate-400 text-sm font-medium mb-8 max-w-xs">A new personalized worksheet for {activeChild.name} is ready for generation.</p>
                <button 
                  disabled={generating !== null}
                  onClick={() => handleGenerate(activeSubject)}
                  className="w-full max-w-xs bg-[#6C63FF] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:shadow-lg active:scale-95"
                >
                  {generating === activeSubject ? <Loader2 size={24} className="animate-spin" /> : <><Sparkles size={20} /> Generate Daily Worksheet</>}
                </button>
              </div>
            )}
          </div>

          {/* Past Worksheets for this Subject */}
          <div className="space-y-6">
             <h3 className="text-xl font-extrabold text-[#1A1F3A]">Past {activeSubject} Worksheets</h3>
             <div className="space-y-4">
                {filteredWorksheets.filter(w => w.date !== new Date().toLocaleDateString()).length > 0 ? filteredWorksheets.filter(w => w.date !== new Date().toLocaleDateString()).map(ws => (
                  <div key={ws.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 hover:shadow-md transition-all">
                    <div className="flex items-center gap-5 w-full">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-[#6C63FF] shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="overflow-hidden">
                        <h5 className="font-extrabold text-slate-800 truncate">{ws.title}</h5>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ws.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                       <button onClick={() => onViewWorksheet(ws.id)} className="flex-1 sm:flex-none bg-white border-2 border-slate-100 text-slate-600 px-5 py-2.5 rounded-xl font-bold text-xs hover:border-[#6C63FF] hover:text-[#6C63FF] transition-all">View</button>
                       <button onClick={() => onViewWorksheet(ws.id, true)} className="flex-1 sm:flex-none bg-amber-50 text-amber-600 px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-amber-100 transition-all flex items-center justify-center gap-1">
                         <Key size={14} /> Answer Key
                       </button>
                    </div>
                  </div>
                )) : (
                  <div className="p-10 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-center text-slate-400 font-bold">
                    No past {activeSubject} worksheets yet.
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-indigo-50 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-12 -mt-12 opacity-50" />
             <div className="relative z-10">
                <h3 className="font-extrabold text-[#1A1F3A] mb-4 flex items-center gap-2">
                   <Sparkles className="text-amber-500" size={20} /> Dashboard Tip
                </h3>
                <p className="text-slate-600 leading-relaxed font-medium text-sm">
                   Switch between subjects above to see history or generate new lessons. Every sheet is custom-made for {activeChild.name}!
                </p>
                <div className="mt-6 flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-[#6C63FF] font-bold text-xs">EK</div>
                   <span className="text-xs font-bold text-[#6C63FF] uppercase tracking-widest">Helpful Insight</span>
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
                      <Settings size={24} />
                   </div>
                   <span className="font-extrabold text-[#1A1F3A]">Account Settings</span>
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-[#6C63FF]" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
