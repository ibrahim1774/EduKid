import React, { useState, useEffect, useRef } from 'react';
import { Worksheet } from '../types';
import { ArrowLeft, Printer, Download, Sparkles, FileText, CheckCircle, Star, Key, Loader2, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const WorksheetView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [showAnswerKey, setShowAnswerKey] = useState(searchParams.get('key') === 'true');
  const [isExporting, setIsExporting] = useState(false);
  const worksheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      fetchWorksheet(id);
    }
  }, [id]);

  const fetchWorksheet = async (wsId: string) => {
    try {
      const { data, error } = await supabase
        .from('worksheets')
        .select('*')
        .eq('id', wsId)
        .single();

      if (error) throw error;

      // Map Supabase content to Worksheet structure
      const formattedWs: Worksheet = {
        ...data,
        instructions: data.content?.instructions || '',
        questions: data.content?.questions || [],
        answers: data.answers || {},
        date: new Date(data.created_at).toLocaleDateString(),
        learningContent: data.learning_content
      };

      setWorksheet(formattedWs);
      setAnswers(data.answers || {});
    } catch (err) {
      console.error('Error fetching worksheet:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = async (questionId: string, value: string) => {
    if (showAnswerKey) return;

    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    // Auto-save to Supabase
    try {
      const { error } = await supabase
        .from('worksheets')
        .update({ answers: newAnswers })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Failed to auto-save answer:', err);
    }
  };

  const downloadPDF = async () => {
    if (!worksheetRef.current || !worksheet) return;
    setIsExporting(true);

    try {
      const element = worksheetRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${worksheet.title.replace(/\s+/g, '_')}_${showAnswerKey ? 'AnswerKey' : 'Worksheet'}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-[#6C63FF]" size={48} />
      </div>
    );
  }

  if (!worksheet) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <FileText size={64} className="text-slate-200 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Worksheet not found</h2>
        <button onClick={() => navigate('/dashboard')} className="mt-4 text-[#6C63FF] font-bold">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] py-4 md:py-16 px-2 md:px-4 font-sans text-left">
      {/* Navigation & Actions */}
      <div className="max-w-[21cm] mx-auto mb-6 flex flex-col md:flex-row items-center justify-between gap-4 no-print">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-3 text-slate-500 hover:text-[#6C63FF] font-extrabold transition-colors w-full md:w-auto p-2">
          <ArrowLeft size={24} /> <span>Back to Dashboard</span>
        </button>
        <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
          <button
            onClick={() => setShowAnswerKey(!showAnswerKey)}
            className={`flex-1 md:flex-none px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 ${showAnswerKey ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            <Key size={20} /> <span className="whitespace-nowrap">{showAnswerKey ? 'Hide Answers' : 'Answer Key'}</span>
          </button>
          <button
            disabled={isExporting}
            onClick={downloadPDF}
            className="flex-1 md:flex-none px-6 md:px-8 py-3 md:py-4 bg-[#6C63FF] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#5A52E0] transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-70"
          >
            {isExporting ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
            <span className="whitespace-nowrap">Download PDF</span>
          </button>
          <button
            onClick={() => window.print()}
            className="hidden md:flex flex-none px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <Printer size={20} /> <span className="whitespace-nowrap">Print</span>
          </button>
        </div>
      </div>

      {/* Premium Worksheet Paper */}
      <div className="relative">
        <motion.div
          ref={worksheetRef}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-[21cm] min-h-[29.7cm] mx-auto bg-white shadow-2xl p-8 md:p-16 rounded-2xl md:rounded-[3rem] border border-slate-100 relative print:shadow-none print:border-none print:p-8 print:rounded-none print:max-w-none overflow-x-hidden flex flex-col h-auto text-left"
        >
          {/* Branding Decor */}
          <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-[#6C63FF] via-[#A599FF] to-[#5DCEA0] rounded-t-2xl md:rounded-t-[3rem] no-print"></div>

          {/* Paper Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-8 mb-10 md:mb-12 border-b-2 border-slate-50 pb-8 md:pb-12 shrink-0 text-left">
            <div className="w-full md:w-auto text-left">
              <div className="flex items-center gap-2 md:gap-3 text-[#6C63FF] font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] mb-2 md:mb-3">
                <FileText size={16} /> Daily {worksheet.subject} Lesson & Practice
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#1A1F3A] leading-tight mb-2 uppercase tracking-tighter break-words text-left">
                {worksheet.title} {showAnswerKey && <span className="text-amber-500">(KEY)</span>}
              </h1>
              <div className="flex items-center flex-wrap gap-2 md:gap-4 text-slate-400 font-bold text-xs md:text-sm">
                <span className="bg-slate-50 px-2 md:px-3 py-1 rounded-lg">{worksheet.grade}</span>
                <span className="w-1 md:w-1.5 h-1 md:h-1.5 bg-slate-200 rounded-full" />
                <span>{worksheet.date}</span>
                <span className="w-1 md:w-1.5 h-1 md:h-1.5 bg-slate-200 rounded-full" />
                <span className="text-indigo-400 font-extrabold">Student: ____________________</span>
              </div>
            </div>
            <div className="text-right hidden md:block">
              <div className="w-16 md:w-20 h-16 md:h-20 border-2 border-dashed border-slate-100 rounded-2xl md:rounded-3xl flex items-center justify-center mb-2 ml-auto">
                <div className="w-8 md:w-10 h-8 md:h-10 bg-[#6C63FF] rounded-xl" />
              </div>
              <p className="text-[10px] text-slate-300 font-extrabold uppercase tracking-widest text-right">EduKid Learning Platform</p>
            </div>
          </div>

          {/* Learning Section (New) */}
          {worksheet.learningContent && (
            <div className="mb-8 md:mb-12 bg-amber-50/30 p-8 md:p-12 rounded-2xl md:rounded-[3rem] border border-amber-100/50 relative overflow-hidden shrink-0 text-left">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <Star size={100} fill="currentColor" className="text-amber-400" />
              </div>
              <p className="text-[10px] md:text-xs font-black text-amber-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <BrainCircuit size={16} /> Part 1: Today's Lesson
              </p>
              <div className="prose prose-slate max-w-none text-left">
                <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-medium whitespace-pre-wrap text-left">
                  {worksheet.learningContent}
                </p>
              </div>
            </div>
          )}

          {/* Instructions Box */}
          <div className="mb-10 md:mb-16 bg-indigo-50/40 p-6 md:p-8 rounded-2xl md:rounded-[2rem] border border-indigo-100/50 relative overflow-hidden shrink-0 text-left">
            <p className="text-[10px] md:text-xs font-black text-[#6C63FF] uppercase tracking-[0.2em] mb-2 flex items-center gap-2 text-left">
              <Sparkles size={14} /> Part 2: Practice Instructions
            </p>
            <p className="text-base md:text-lg text-indigo-900 leading-relaxed font-bold italic text-left">
              "{worksheet.instructions}"
            </p>
          </div>

          {/* Problems List */}
          <div className="space-y-12 md:space-y-20 flex-grow h-auto">
            {worksheet.questions.map((q, idx) => {
              const currentAnswer = answers[q.id || `q-${idx}`] || '';

              return (
                <div key={q.id || idx} className="relative group text-left">
                  <div className="flex flex-col md:flex-row items-start gap-4 md:gap-8">
                    {/* Number Badge */}
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-[#1A1F3A] text-white rounded-xl md:rounded-2xl flex items-center justify-center font-extrabold text-lg md:text-xl shrink-0 shadow-lg mt-1">
                      {idx + 1}
                    </div>

                    <div className="flex-grow space-y-6 md:space-y-8 w-full">
                      <h3 className="text-xl md:text-2xl font-extrabold text-[#1A1F3A] leading-tight pt-1 break-words">
                        {q.text}
                      </h3>

                      {/* Subject Specific Inputs */}
                      {q.type === 'multiple-choice' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
                          {q.options?.map((opt, i) => (
                            <button
                              key={i}
                              disabled={showAnswerKey}
                              onClick={() => handleAnswerChange(q.id || `q-${idx}`, opt)}
                              className={`flex items-center gap-4 p-4 md:p-6 border-2 rounded-2xl md:rounded-3xl transition-all text-left ${showAnswerKey
                                ? opt === q.correctAnswer ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100'
                                : currentAnswer === opt ? 'border-[#6C63FF] bg-indigo-50/30' : 'border-slate-100 hover:border-slate-200'
                                }`}
                            >
                              <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full border-4 shrink-0 transition-all ${showAnswerKey
                                ? opt === q.correctAnswer ? 'border-emerald-500 bg-emerald-500' : 'border-slate-100'
                                : currentAnswer === opt ? 'border-[#6C63FF] bg-[#6C63FF]' : 'border-slate-100'
                                }`} />
                              <span className={`text-base md:text-lg font-bold ${showAnswerKey
                                ? opt === q.correctAnswer ? 'text-emerald-700' : 'text-slate-400'
                                : currentAnswer === opt ? 'text-[#6C63FF]' : 'text-slate-700'
                                }`}>{opt}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {q.type === 'text' && (
                        <div className="w-full space-y-4">
                          <textarea
                            disabled={showAnswerKey}
                            value={showAnswerKey ? q.correctAnswer : currentAnswer}
                            onChange={(e) => handleAnswerChange(q.id || `q-${idx}`, e.target.value)}
                            placeholder="Type your answer here..."
                            className={`w-full min-h-[8rem] p-6 md:p-8 border-2 border-dashed rounded-2xl md:rounded-[2rem] text-lg md:text-xl font-bold transition-all focus:outline-none focus:ring-4 focus:ring-indigo-100 resize-none ${showAnswerKey
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 italic'
                              : 'bg-slate-50/30 border-slate-100 focus:border-[#6C63FF] text-[#1A1F3A]'
                              }`}
                          />
                          {showAnswerKey && (
                            <p className="text-emerald-600 font-extrabold text-xs uppercase tracking-widest pl-4">Correct Answer Above</p>
                          )}
                        </div>
                      )}

                      {q.type === 'true-false' && (
                        <div className="flex flex-col sm:flex-row gap-4 md:gap-10">
                          {['True', 'False'].map((val) => (
                            <button
                              key={val}
                              disabled={showAnswerKey}
                              onClick={() => handleAnswerChange(q.id || `q-${idx}`, val)}
                              className={`flex items-center gap-4 p-4 md:p-6 border-2 rounded-2xl md:rounded-3xl min-w-[120px] md:min-w-[160px] justify-center transition-all ${showAnswerKey
                                ? q.correctAnswer?.toLowerCase() === val.toLowerCase() ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 opacity-50'
                                : currentAnswer.toLowerCase() === val.toLowerCase() ? 'border-[#6C63FF] bg-indigo-50/30' : 'border-slate-100 hover:border-slate-200'
                                }`}
                            >
                              <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full border-4 shrink-0 transition-all ${showAnswerKey
                                ? q.correctAnswer?.toLowerCase() === val.toLowerCase() ? 'border-emerald-500 bg-emerald-500' : 'border-slate-100'
                                : currentAnswer.toLowerCase() === val.toLowerCase() ? 'border-[#6C63FF] bg-[#6C63FF]' : 'border-slate-100'
                                }`} />
                              <span className={`font-extrabold text-lg md:text-xl ${showAnswerKey
                                ? q.correctAnswer?.toLowerCase() === val.toLowerCase() ? 'text-emerald-700' : 'text-slate-400'
                                : currentAnswer.toLowerCase() === val.toLowerCase() ? 'text-[#6C63FF]' : 'text-slate-700'
                                }`}>{val.toUpperCase()}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Divider Decor */}
                  {idx < worksheet.questions.length - 1 && (
                    <div className="mt-10 md:mt-16 h-px bg-slate-50 w-full" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Paper Footer */}
          <div className="mt-20 md:mt-24 pt-8 md:pt-12 border-t-2 border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 text-slate-300 font-extrabold text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] shrink-0">
            <div className="flex items-center gap-2 md:gap-3">
              <CheckCircle size={12} className="text-[#5DCEA0]" /> Verified Content
            </div>
            <span className="text-center">© 2024 EduKid Learning Platform</span>
            <div className="flex items-center gap-2">
              Page 01 of 01
            </div>
          </div>
        </motion.div>
      </div>

      {/* Encouragement Toast */}
      <div className="fixed bottom-4 left-4 hidden lg:flex items-center gap-4 bg-[#1A1F3A] text-white p-5 rounded-3xl shadow-2xl no-print animate-in slide-in-from-left-20">
        <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center">
          <Star size={24} fill="currentColor" />
        </div>
        <div>
          <p className="font-bold text-sm">Keep it up!</p>
          <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest">Progress starts here</p>
        </div>
      </div>
    </div>
  );
};