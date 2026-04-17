import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ArrowLeft, Mail, Lock, Loader2,
  Check, Sparkles, BookOpen, UserPlus,
} from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Grade, Subject } from '../types';

const TOTAL_SLIDES = 7;

const ALL_SUBJECTS: { value: Subject; emoji: string }[] = [
  { value: Subject.Math,    emoji: '🔢' },
  { value: Subject.Reading, emoji: '📖' },
  { value: Subject.Writing, emoji: '✏️' },
  { value: Subject.Science, emoji: '🔬' },
  { value: Subject.History, emoji: '🌍' },
];

// ── Shared button classes ─────────────────────────────────────────────────────
const btn = {
  primary: 'w-full bg-gradient-to-r from-[#6366F1] to-[#818CF8] text-white py-4 rounded-full font-bold tracking-wide text-base shadow-lg shadow-indigo-300/40 flex items-center justify-center gap-2 hover:from-[#5558E3] hover:to-[#6366F1] transition-all duration-200 active:scale-[0.98]',
  coral:   'w-full bg-gradient-to-r from-[#FF7A59] to-[#FF5A3C] text-white py-4 rounded-full font-bold tracking-wide text-base shadow-lg shadow-orange-300/40 flex items-center justify-center gap-2 hover:from-[#e8694a] hover:to-[#e84a2a] transition-all duration-200 active:scale-[0.98]',
  white:   'w-full bg-white/95 backdrop-blur-sm text-[#6366F1] border border-white/50 py-4 rounded-full font-bold tracking-wide text-base shadow-lg shadow-black/10 flex items-center justify-center gap-2 hover:bg-white transition-all duration-200 active:scale-[0.98]',
};

// ── Google SVG ───────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.08 24.08 0 0 0 0 21.56l7.98-6.19z" />
    <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

// ════════════════════════════════════════════════════════════════════════════
export const OnboardingFlowView: React.FC = () => {
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const [slide,       setSlide]     = useState(1);
  const [direction,   setDir]       = useState(1);
  const [authedUser,  setAuthed]    = useState<{ id: string; email: string } | null>(null);

  // Child profile
  const [childName,     setChildName]     = useState('');
  const [childAge,      setChildAge]      = useState(7);
  const [childGrade,    setChildGrade]    = useState<Grade>(Grade.G2);
  const [childSubjects, setChildSubjects] = useState<Subject[]>([Subject.Math, Subject.Reading]);

  // Auth (slide 6)
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError,   setAuthError]   = useState<string | null>(null);

  // Save (slide 7)
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError,   setSaveError]   = useState<string | null>(null);

  // Skip auth slide if already logged in
  useEffect(() => {
    if (user && slide === 6) {
      setAuthed({ id: user.id, email: user.email! });
      advance();
    }
  }, [slide, user]);

  const advance = () => { setDir(1);  setSlide(s => Math.min(s + 1, TOTAL_SLIDES)); };
  const back    = () => { setDir(-1); setSlide(s => Math.max(s - 1, 1)); };
  const toggle  = (sub: Subject) =>
    setChildSubjects(prev => prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]);

  const onAuthSuccess = (id: string, email: string) => {
    setAuthed({ id, email });
    setAuthLoading(false);
    advance();
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (token) => {
      setAuthLoading(true);
      setAuthError(null);
      try {
        const res  = await fetch('/api/google-auth', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ access_token: token.access_token }),
        });
        const data = await res.json();
        if (data.access_token && data.refresh_token) {
          const { data: sd } = await supabase.auth.setSession({
            access_token:  data.access_token,
            refresh_token: data.refresh_token,
          });
          if (sd.user) onAuthSuccess(sd.user.id, sd.user.email!);
          else { setAuthError('Could not establish session. Try again.'); setAuthLoading(false); }
        } else {
          setAuthError(data.error || 'Google sign-in failed.'); setAuthLoading(false);
        }
      } catch {
        setAuthError('Google sign-in failed. Please try again.'); setAuthLoading(false);
      }
    },
    onError: () => { setAuthError('Google sign-in was cancelled.'); setAuthLoading(false); },
  });

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + '/dashboard' },
      });
      if (error) throw error;
      if (data.session && data.user) {
        onAuthSuccess(data.user.id, data.user.email!);
      } else if (data.user) {
        setAuthError('Account created! Please check your email to confirm before logging in.');
        setAuthLoading(false);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Sign up failed. Please try again.');
      setAuthLoading(false);
    }
  };

  const handleSaveChild = async () => {
    const uid   = authedUser?.id    ?? user?.id;
    const umail = authedUser?.email ?? user?.email;
    if (!uid || !umail) { setSaveError('Session expired. Please go back and sign in.'); return; }
    setSaveLoading(true);
    setSaveError(null);
    try {
      const { error } = await supabase.from('children').insert([{
        user_id:          uid,
        name:             childName,
        age:              childAge,
        grade:            childGrade,
        interests:        [],
        struggles:        [],
        preferred_topics: {},
      }]);
      if (error) throw error;
      try {
        const res     = await fetch('/api/check-subscription', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email: umail }),
        });
        const subData = await res.json();
        navigate(subData.active ? '/dashboard' : '/subscribe');
      } catch {
        navigate('/subscribe');
      }
    } catch (err: any) {
      setSaveError(`Couldn't save profile: ${err.message || 'Unknown error'}.`);
      setSaveLoading(false);
    }
  };

  const variants = {
    enter:  (d: number) => ({ opacity: 0, y: d > 0 ? 20 : -20 }),
    center: { opacity: 1, y: 0 },
    exit:   (d: number) => ({ opacity: 0, y: d > 0 ? -20 : 20 }),
  };

  return (
    // No font-sans — inherits Urbanist from body
    <div className="h-screen overflow-hidden select-none">

      {/* ── Progress bar ─────────────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 w-full h-[3px] bg-black/10 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-[#6366F1] to-[#818CF8]"
          initial={false}
          animate={{ width: `${(slide / TOTAL_SLIDES) * 100}%` }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      </div>

      {/* ── Back button ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {slide > 1 && (
          <motion.button
            key="back"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={back}
            className={`fixed top-4 left-4 z-40 p-2 rounded-xl transition-colors ${
              slide === 1 || slide === 5
                ? 'text-white/70 hover:text-white hover:bg-white/10'
                : 'text-slate-400 hover:text-[#6366F1] hover:bg-indigo-50'
            }`}
          >
            <ArrowLeft size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Slides ───────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={slide}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="h-screen"
        >

          {/* ══ SLIDE 1 — Emotional Hook ═══════════════════════════════════ */}
          {slide === 1 && (
            <div className="h-screen bg-gradient-to-br from-[#4F46E5] via-[#6C63FF] to-[#8B5CF6] flex flex-col items-center justify-center pt-12 pb-6 px-5 gap-6">
              <div className="flex flex-col items-center gap-5 w-full max-w-sm">
                <div className="relative w-full">
                  <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl scale-90 translate-y-3" />
                  <img
                    src="/assets/images/hero-dashboard.png"
                    alt="EduKid Dashboard"
                    className="relative w-full max-h-52 object-contain rounded-2xl shadow-2xl border border-white/20"
                  />
                </div>
                <div className="text-center space-y-2">
                  <h1 className="text-[1.6rem] font-extrabold text-white leading-tight tracking-tight">
                    Your child's school gives everyone the same worksheet.
                    <span className="block text-white/90 italic">Yours deserves better.</span>
                  </h1>
                  <p className="text-white/65 text-sm leading-relaxed">
                    EduKid creates personalized daily practice built around exactly where your child is — not the average student.
                  </p>
                </div>
              </div>
              <button onClick={advance} className={btn.white} style={{ maxWidth: '24rem' }}>
                Show Me How <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* ══ SLIDE 2 — Daily Practice Video ════════════════════════════ */}
          {slide === 2 && (
            <div className="h-screen bg-white flex flex-col items-center justify-center pt-12 pb-6 px-5 gap-5">
              <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                <div
                  className="w-full rounded-2xl overflow-hidden shadow-xl shadow-indigo-100 border border-slate-100 bg-slate-50"
                  style={{ aspectRatio: '16/9' }}
                >
                  <iframe
                    src="https://fast.wistia.net/embed/iframe/ro3mwosmus?autoPlay=0&videoFoam=true&playerColor=6366F1"
                    title="Daily Custom Practice"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                    className="w-full h-full"
                    style={{ border: 'none', display: 'block' }}
                  />
                </div>
                <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-[#6366F1] rounded-full px-3 py-1 text-xs font-semibold">
                  <Sparkles size={12} /> AI-Generated Daily
                </div>
                <div className="text-center space-y-1.5">
                  <h2 className="text-xl font-extrabold text-[#1A1F3A] leading-tight tracking-tight">
                    Most kids practice the wrong things.
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Generic homework doesn't target your child's actual gaps. EduKid generates focused practice every day — matched to their exact grade and struggles.
                  </p>
                </div>
              </div>
              <button onClick={advance} className={btn.primary} style={{ maxWidth: '24rem' }}>
                Next <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* ══ SLIDE 3 — How It Works ════════════════════════════════════ */}
          {slide === 3 && (
            <div className="h-screen bg-indigo-50 flex flex-col items-center justify-center pt-12 pb-6 px-5 gap-5">
              <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                <div className="text-center space-y-1">
                  <div className="inline-flex items-center gap-1.5 bg-white text-[#6366F1] border border-indigo-100 rounded-full px-3 py-1 text-xs font-semibold shadow-sm">
                    How It Works
                  </div>
                  <h2 className="text-xl font-extrabold text-[#1A1F3A] tracking-tight">Stop searching. Start seeing results.</h2>
                  <p className="text-slate-500 text-sm">In four steps, your child gets practice that actually moves the needle.</p>
                </div>
                <div className="w-full space-y-2">
                  {[
                    { num: '01', label: 'Create your free account',       accent: 'bg-indigo-600 text-white', row: 'bg-indigo-100/60' },
                    { num: '02', label: "Set up your child's profile",    accent: 'bg-purple-600 text-white', row: 'bg-purple-100/60' },
                    { num: '03', label: 'Choose subjects & focus topics',  accent: 'bg-pink-500 text-white',  row: 'bg-pink-100/60' },
                    { num: '04', label: "Generate today's worksheet",      accent: 'bg-emerald-600 text-white',row: 'bg-emerald-100/60' },
                  ].map(({ num, label, accent, row }, i) => (
                    <motion.div
                      key={num}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07, duration: 0.25 }}
                      className={`flex items-center gap-3 ${row} rounded-xl px-4 py-3 border border-white`}
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs flex-shrink-0 ${accent}`}>
                        {num}
                      </span>
                      <span className="font-semibold text-[#1A1F3A] text-sm">{label}</span>
                      <Check size={15} className="ml-auto text-emerald-500 flex-shrink-0" strokeWidth={3} />
                    </motion.div>
                  ))}
                </div>
              </div>
              <button onClick={advance} className={btn.primary} style={{ maxWidth: '24rem' }}>
                Sounds Good <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* ══ SLIDE 4 — Targeted Practice ══════════════════════════════ */}
          {slide === 4 && (
            <div className="h-screen bg-white flex flex-col items-center justify-center pt-12 pb-6 px-5 gap-5">
              <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                <img
                  src="/assets/images/dashboard-full.png"
                  alt="Daily custom worksheets"
                  className="w-full max-h-44 object-contain rounded-2xl shadow-lg shadow-indigo-50 border border-slate-100"
                />
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-extrabold text-[#1A1F3A] tracking-tight leading-tight">
                    Practice that targets where they actually struggle.
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Stop guessing what your child needs. Every worksheet is built around their specific grade, subjects, and focus areas — not the whole class.
                  </p>
                </div>
                <div className="w-full space-y-2">
                  {[
                    "Built around their grade & focus areas — not the class average",
                    'Covers Math, Reading, Writing, Science & History',
                    'Printable PDFs — no prep needed',
                  ].map((label) => (
                    <div key={label} className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
                      <Check size={14} className="text-emerald-500 flex-shrink-0" strokeWidth={3} />
                      <span className="text-sm font-semibold text-[#1A1F3A]">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={advance} className={btn.primary} style={{ maxWidth: '24rem' }}>
                Next <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* ══ SLIDE 5 — Families ════════════════════════════════════════ */}
          {slide === 5 && (
            <div className="h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex flex-col items-center justify-center pt-12 pb-6 px-5 gap-5">
              <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                <img
                  src="/assets/images/dashboard-lesson.png"
                  alt="Built for families"
                  className="w-full max-h-44 object-contain rounded-2xl shadow-lg shadow-orange-100 border border-slate-100"
                />
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-extrabold text-[#1A1F3A] tracking-tight leading-tight">
                    The practice that fits — no prep, no planning, no stress.
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    You shouldn't have to spend evenings hunting for the right material. EduKid does the work so you can focus on being present.
                  </p>
                </div>
                <div className="w-full space-y-2">
                  {[
                    'Add multiple children — each gets their own plan',
                    'Track their progress over time',
                    'Works on any device — phone, tablet, desktop',
                  ].map((label) => (
                    <div key={label} className="flex items-center gap-3 bg-white border border-orange-100 rounded-xl px-4 py-2.5 shadow-sm">
                      <Check size={14} className="text-orange-400 flex-shrink-0" strokeWidth={3} />
                      <span className="text-sm font-semibold text-[#1A1F3A]">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={advance} className={btn.coral} style={{ maxWidth: '24rem' }}>
                Create My Free Account <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* ══ SLIDE 6 — Create Account (Auth) ═══════════════════════════
              Matches SignupView.tsx exactly                                 */}
          {slide === 6 && (
            <div className="h-screen bg-slate-50 flex items-center justify-center pt-6 pb-6 px-4">
              <div className="bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-slate-100 overflow-y-auto max-h-full">
                {authLoading ? (
                  <div className="flex flex-col items-center gap-4 py-16">
                    <Loader2 size={36} className="animate-spin text-[#6366F1]" />
                    <p className="text-slate-500 font-semibold">Signing you in…</p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-[#6366F1]/10 rounded-2xl flex items-center justify-center mx-auto mb-5 text-[#6366F1]">
                      <UserPlus size={32} />
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900 mb-1 text-center tracking-tight">Create Your Account</h2>
                    <p className="text-slate-500 mb-6 text-center text-sm">Start building the habit that changes everything.</p>

                    {authError && (
                      <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-medium mb-5 animate-in fade-in slide-in-from-top-2">
                        {authError}
                      </div>
                    )}

                    {/* Google — identical to SignupView */}
                    <button
                      onClick={() => googleLogin()}
                      disabled={authLoading}
                      className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 py-4 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98] shadow-sm disabled:opacity-60"
                    >
                      <GoogleIcon />
                      Continue with Google
                    </button>

                    <div className="flex items-center gap-3 my-5">
                      <div className="flex-1 h-px bg-slate-200" />
                      <span className="text-slate-400 text-sm font-medium">or</span>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* Email form — identical to SignupView */}
                    <form onSubmit={handleEmailSignup} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                          <input
                            required
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="parent@example.com"
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#6366F1] transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 ml-1">Create Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                          <input
                            required
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Choose a strong password"
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#6366F1] transition-all"
                          />
                        </div>
                      </div>
                      <button
                        disabled={authLoading}
                        className="w-full bg-[#6366F1] text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-[#5558E3] transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                        {authLoading ? <Loader2 className="animate-spin" size={22} /> : 'Get Started'}
                      </button>
                    </form>

                    <p className="mt-5 text-center text-slate-400 text-sm">
                      Already have an account?{' '}
                      <a href="/login" className="text-[#6366F1] font-bold hover:underline">Log in</a>
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ══ SLIDE 7 — Child Profile ════════════════════════════════════ */}
          {slide === 7 && (
            <div className="h-screen bg-white flex flex-col items-center justify-between pt-10 pb-8 px-5">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-50 to-transparent pointer-events-none" />

              <div className="relative flex-1 flex flex-col justify-center gap-4 w-full max-w-sm">
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#6366F1] rounded-xl flex items-center justify-center mx-auto mb-3 text-white shadow-lg shadow-indigo-200">
                    <BookOpen size={22} />
                  </div>
                  <h2 className="text-xl font-extrabold text-[#1A1F3A] mb-1 tracking-tight">
                    One last thing — tell us about your child.
                  </h2>
                  <p className="text-slate-500 text-sm">
                    We'll use this to build a worksheet that fits them perfectly, starting today.
                  </p>
                </div>

                {saveError && (
                  <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-medium border border-red-100">
                    {saveError}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1.5">Child's First Name</label>
                    <input
                      type="text"
                      value={childName}
                      onChange={e => setChildName(e.target.value)}
                      placeholder="e.g. Emma"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1.5">Age</label>
                      <select
                        value={childAge}
                        onChange={e => setChildAge(parseInt(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] transition-all"
                      >
                        {[4, 5, 6, 7, 8, 9, 10, 11].map(a => (
                          <option key={a} value={a}>{a} yrs old</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1.5">Grade</label>
                      <select
                        value={childGrade}
                        onChange={e => setChildGrade(e.target.value as Grade)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] transition-all"
                      >
                        {Object.values(Grade).map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-2">Subjects to Focus On</label>
                    <div className="flex flex-wrap gap-2">
                      {ALL_SUBJECTS.map(({ value: sub, emoji }) => {
                        const selected = childSubjects.includes(sub);
                        return (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => toggle(sub)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-bold border-2 transition-all active:scale-95 ${
                              selected
                                ? 'bg-[#6366F1] text-white border-[#6366F1] shadow-md shadow-indigo-200'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span>{emoji}</span> {sub}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative w-full max-w-sm">
                <button
                  disabled={!childName.trim() || saveLoading}
                  onClick={handleSaveChild}
                  className={`${btn.coral} disabled:opacity-50 disabled:pointer-events-none`}
                >
                  {saveLoading ? <Loader2 className="animate-spin" size={22} /> : 'Start Learning →'}
                </button>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
};
