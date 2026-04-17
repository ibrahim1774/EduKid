import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ArrowLeft, Mail, Lock, Loader2,
  Check, Star, Sparkles, BookOpen, Pencil, FlaskConical, Globe,
} from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Grade, Subject } from '../types';

const TOTAL_SLIDES = 5;
const ALL_SUBJECTS: { value: Subject; emoji: string; color: string }[] = [
  { value: Subject.Math,    emoji: '🔢', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { value: Subject.Reading, emoji: '📖', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { value: Subject.Writing, emoji: '✏️', color: 'bg-pink-50 border-pink-200 text-pink-700' },
  { value: Subject.Science, emoji: '🔬', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { value: Subject.History, emoji: '🌍', color: 'bg-amber-50 border-amber-200 text-amber-700' },
];

// ── Shared Progress Bar ──────────────────────────────────────────────────────
const ProgressBar = ({ slide }: { slide: number }) => (
  <div className="fixed top-0 left-0 w-full h-1 bg-white/20 z-50">
    <motion.div
      className="h-full bg-[#6C63FF]"
      initial={false}
      animate={{ width: `${(slide / TOTAL_SLIDES) * 100}%` }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    />
  </div>
);

// ── Back Button ──────────────────────────────────────────────────────────────
const BackButton = ({ onClick, light = false }: { onClick: () => void; light?: boolean }) => (
  <motion.button
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClick}
    className={`fixed top-5 left-4 z-40 p-2 rounded-xl transition-colors ${
      light
        ? 'text-white/70 hover:text-white hover:bg-white/10'
        : 'text-slate-400 hover:text-[#6C63FF] hover:bg-indigo-50'
    }`}
  >
    <ArrowLeft size={22} />
  </motion.button>
);

// ── CTA Button ───────────────────────────────────────────────────────────────
const CTAButton = ({
  onClick, disabled = false, loading = false, children, variant = 'primary',
}: {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'coral' | 'white';
}) => {
  const styles = {
    primary: 'bg-[#6C63FF] text-white shadow-xl shadow-indigo-200 hover:bg-[#5a52e8]',
    coral:   'bg-[#FF7A59] text-white shadow-xl shadow-orange-100 hover:bg-[#e8694a]',
    white:   'bg-white text-[#6C63FF] shadow-xl shadow-indigo-100 hover:bg-indigo-50',
  };
  return (
    <button
      type={onClick ? 'button' : 'submit'}
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 ${styles[variant]}`}
    >
      {loading ? <Loader2 className="animate-spin" size={24} /> : children}
    </button>
  );
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
  const navigate = useNavigate();
  const { user } = useAuth();

  const [slide, setSlide]       = useState(1);
  const [direction, setDir]     = useState(1);
  const [authedUser, setAuthed] = useState<{ id: string; email: string } | null>(null);

  // Child profile state
  const [childName,     setChildName]     = useState('');
  const [childAge,      setChildAge]      = useState(7);
  const [childGrade,    setChildGrade]    = useState<Grade>(Grade.G2);
  const [childSubjects, setChildSubjects] = useState<Subject[]>([Subject.Math, Subject.Reading]);

  // Auth state (slide 4)
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError,   setAuthError]   = useState<string | null>(null);

  // If already logged in, skip slide 4 when we reach it
  useEffect(() => {
    if (user && slide === 4) {
      setAuthed({ id: user.id, email: user.email! });
      advance();
    }
  }, [slide, user]);

  const advance = () => { setDir(1);  setSlide(s => Math.min(s + 1, TOTAL_SLIDES)); };
  const back    = () => { setDir(-1); setSlide(s => Math.max(s - 1, 1)); };
  const toggleSubject = (sub: Subject) =>
    setChildSubjects(prev => prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]);

  // ── After auth: set authed user and advance to slide 5 ───────────────────
  const onAuthSuccess = (id: string, email: string) => {
    setAuthed({ id, email });
    setAuthLoading(false);
    advance(); // go to slide 5
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (token) => {
      setAuthLoading(true);
      setAuthError(null);
      try {
        const res  = await fetch('/api/google-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: token.access_token }),
        });
        const data = await res.json();
        if (data.access_token && data.refresh_token) {
          const { data: sd } = await supabase.auth.setSession({
            access_token: data.access_token,
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
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (data.session && data.user) {
        onAuthSuccess(data.user.id, data.user.email!);
      } else if (data.user) {
        setAuthError('Account created! Check your email to confirm, then log in.');
        setAuthLoading(false);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Sign up failed. Please try again.');
      setAuthLoading(false);
    }
  };

  // ── Slide 5 submit: save child → navigate to paywall ─────────────────────
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError,   setSaveError]   = useState<string | null>(null);

  const handleSaveChild = async () => {
    const uid   = authedUser?.id   ?? user?.id;
    const umail = authedUser?.email ?? user?.email;
    if (!uid || !umail) { setSaveError('Session expired. Please go back and sign in again.'); return; }
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
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: umail }),
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

  // ── Slide transition variants ─────────────────────────────────────────────
  const variants = {
    enter:  (d: number) => ({ opacity: 0, y: d > 0 ? 28 : -28 }),
    center: { opacity: 1, y: 0 },
    exit:   (d: number) => ({ opacity: 0, y: d > 0 ? -28 : 28 }),
  };

  return (
    <div className="min-h-screen overflow-hidden font-sans">
      <ProgressBar slide={slide} />

      <AnimatePresence initial={false}>
        {slide > 1 && (
          <BackButton
            key="back"
            onClick={back}
            light={slide === 1}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={slide}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.21, ease: 'easeOut' }}
        >

          {/* ══════════════════════════════════════════════════════════════
              SLIDE 1 — Emotional Hook
          ══════════════════════════════════════════════════════════════ */}
          {slide === 1 && (
            <div className="min-h-screen bg-gradient-to-br from-[#4F46E5] via-[#6C63FF] to-[#8B5CF6] flex flex-col items-center justify-between pt-10 pb-10 px-6 text-center">
              <div className="flex-1 flex flex-col items-center justify-center gap-8 max-w-lg w-full">

                {/* Social proof */}
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <span className="text-white/90 text-sm font-semibold">Trusted by 10,000+ parents</span>
                </div>

                {/* Hero image */}
                <div className="relative w-full max-w-sm">
                  <div className="absolute inset-0 bg-white/20 rounded-3xl blur-2xl scale-95 translate-y-4" />
                  <img
                    src="/assets/images/hero-dashboard.png"
                    alt="EduKid Dashboard"
                    className="relative w-full rounded-3xl shadow-2xl border border-white/20"
                  />
                </div>

                {/* Copy */}
                <div className="space-y-3">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                    Give your child the daily learning edge.
                  </h1>
                  <p className="text-white/75 text-lg font-medium leading-relaxed">
                    Personalized AI worksheets matched to their exact grade — generated fresh every day.
                  </p>
                </div>
              </div>

              <div className="w-full max-w-sm mt-6">
                <CTAButton variant="white" onClick={advance}>
                  Let's Get Started <ChevronRight size={22} />
                </CTAButton>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              SLIDE 2 — Daily Practice (Video)
          ══════════════════════════════════════════════════════════════ */}
          {slide === 2 && (
            <div className="min-h-screen bg-white flex flex-col items-center justify-between pt-14 pb-10 px-6 text-center">
              <div className="flex-1 flex flex-col items-center justify-center gap-7 max-w-lg w-full">

                {/* Video */}
                <div
                  className="w-full rounded-3xl overflow-hidden shadow-2xl shadow-indigo-100 border border-slate-100 bg-slate-50"
                  style={{ aspectRatio: '16/9' }}
                >
                  <iframe
                    src="https://fast.wistia.net/embed/iframe/ro3mwosmus?autoPlay=0&videoFoam=true&playerColor=6C63FF"
                    title="Daily Custom Practice"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                    className="w-full h-full"
                    style={{ border: 'none', display: 'block' }}
                  />
                </div>

                {/* Copy */}
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 bg-indigo-50 text-[#6C63FF] rounded-full px-4 py-1.5 text-sm font-bold">
                    <Sparkles size={14} /> AI-Generated Daily
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-[#1A1F3A] leading-tight">
                    Fresh worksheets. Every single day.
                  </h2>
                  <p className="text-slate-500 font-medium text-lg leading-relaxed">
                    Tailored to your child's grade, subjects, and focus areas — ready each morning in seconds.
                  </p>
                </div>
              </div>

              <div className="w-full max-w-sm mt-6">
                <CTAButton onClick={advance}>
                  Next <ChevronRight size={22} />
                </CTAButton>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              SLIDE 3 — How It Works
          ══════════════════════════════════════════════════════════════ */}
          {slide === 3 && (
            <div className="min-h-screen bg-indigo-50 flex flex-col items-center justify-between pt-14 pb-10 px-6">
              <div className="flex-1 flex flex-col items-center justify-center gap-7 max-w-lg w-full">

                {/* Copy */}
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-2 bg-white text-[#6C63FF] border border-indigo-100 rounded-full px-4 py-1.5 text-sm font-bold shadow-sm">
                    How It Works
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-[#1A1F3A] leading-tight">
                    Designed for how parents actually use it.
                  </h2>
                  <p className="text-slate-500 font-medium">Four simple steps to your child's daily worksheet.</p>
                </div>

                {/* Steps */}
                <div className="w-full space-y-3">
                  {[
                    { num: '01', label: 'Create your free account',     accent: 'bg-indigo-600 text-white',  bar: 'bg-indigo-100' },
                    { num: '02', label: "Set up your child's profile",  accent: 'bg-purple-600 text-white',  bar: 'bg-purple-100' },
                    { num: '03', label: 'Choose subjects & focus topics', accent: 'bg-pink-500 text-white',  bar: 'bg-pink-100' },
                    { num: '04', label: "Generate today's worksheet",    accent: 'bg-emerald-600 text-white', bar: 'bg-emerald-100' },
                  ].map(({ num, label, accent, bar }, i) => (
                    <motion.div
                      key={num}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.3 }}
                      className={`flex items-center gap-4 ${bar} rounded-2xl px-5 py-4 border border-white`}
                    >
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm flex-shrink-0 ${accent}`}>
                        {num}
                      </span>
                      <span className="font-bold text-[#1A1F3A] text-base">{label}</span>
                      <Check size={18} className="ml-auto text-emerald-500 flex-shrink-0" strokeWidth={3} />
                    </motion.div>
                  ))}
                </div>

                {/* Feature image */}
                <img
                  src="/assets/images/features-worksheet.png"
                  alt="Worksheet example"
                  className="w-full max-w-xs rounded-2xl shadow-xl border border-white"
                />
              </div>

              <div className="w-full max-w-sm mt-6">
                <CTAButton onClick={advance}>
                  Get Started <ChevronRight size={22} />
                </CTAButton>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              SLIDE 4 — Create Account (AUTH)
          ══════════════════════════════════════════════════════════════ */}
          {slide === 4 && (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center pt-14 pb-10 px-6">
              <div className="w-full max-w-md">

                {authLoading ? (
                  <div className="flex flex-col items-center gap-4 py-24">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
                      <Loader2 size={32} className="animate-spin text-[#6C63FF]" />
                    </div>
                    <p className="text-slate-500 font-semibold">Signing you in…</p>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-8">
                      <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#6C63FF]">
                        <Sparkles size={28} />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-extrabold text-[#1A1F3A] mb-2">
                        Create your free account.
                      </h2>
                      <p className="text-slate-500 font-medium">
                        Join thousands of parents building a brighter future.
                      </p>
                    </div>

                    {authError && (
                      <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium mb-5 border border-red-100">
                        {authError}
                      </div>
                    )}

                    {/* Google */}
                    <button
                      onClick={() => googleLogin()}
                      disabled={authLoading}
                      className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 py-4 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] shadow-sm disabled:opacity-60 mb-5"
                    >
                      <GoogleIcon />
                      Continue with Google
                    </button>

                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex-1 h-px bg-slate-200" />
                      <span className="text-slate-400 text-sm font-medium">or</span>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    <form onSubmit={handleEmailSignup} className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                        <input
                          required
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="parent@example.com"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-[#6C63FF]/10 focus:border-[#6C63FF] transition-all"
                        />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                        <input
                          required
                          type="password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="Create a strong password"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-[#6C63FF]/10 focus:border-[#6C63FF] transition-all"
                        />
                      </div>
                      <CTAButton loading={authLoading}>
                        Get Started →
                      </CTAButton>
                    </form>

                    <p className="mt-6 text-center text-slate-400 text-sm">
                      Already have an account?{' '}
                      <a href="/login" className="text-[#6C63FF] font-bold hover:underline">Log in</a>
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              SLIDE 5 — Child Profile
          ══════════════════════════════════════════════════════════════ */}
          {slide === 5 && (
            <div className="min-h-screen bg-white flex flex-col items-center justify-between pt-14 pb-10 px-6">
              {/* Indigo accent strip */}
              <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-indigo-50 to-transparent pointer-events-none" />

              <div className="relative flex-1 flex flex-col justify-center gap-6 max-w-lg w-full">
                <div className="text-center">
                  <div className="w-14 h-14 bg-[#6C63FF] rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-indigo-200">
                    <BookOpen size={26} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-[#1A1F3A] mb-2">
                    Tell us about your child.
                  </h2>
                  <p className="text-slate-500 font-medium">
                    We'll personalize their daily worksheets from day one.
                  </p>
                </div>

                {saveError && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium border border-red-100">
                    {saveError}
                  </div>
                )}

                <div className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">Child's First Name</label>
                    <input
                      type="text"
                      value={childName}
                      onChange={e => setChildName(e.target.value)}
                      placeholder="e.g. Emma"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-xl font-bold focus:outline-none focus:ring-4 focus:ring-[#6C63FF]/10 focus:border-[#6C63FF] transition-all"
                    />
                  </div>

                  {/* Age + Grade */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-slate-700 block mb-2">Age</label>
                      <select
                        value={childAge}
                        onChange={e => setChildAge(parseInt(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 font-bold focus:outline-none focus:ring-4 focus:ring-[#6C63FF]/10 transition-all"
                      >
                        {[4, 5, 6, 7, 8, 9, 10, 11].map(a => (
                          <option key={a} value={a}>{a} yrs old</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 block mb-2">Grade</label>
                      <select
                        value={childGrade}
                        onChange={e => setChildGrade(e.target.value as Grade)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 font-bold focus:outline-none focus:ring-4 focus:ring-[#6C63FF]/10 transition-all"
                      >
                        {Object.values(Grade).map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Subjects */}
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-3">
                      Subjects to Focus On
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ALL_SUBJECTS.map(({ value: sub, emoji, color }) => {
                        const selected = childSubjects.includes(sub);
                        return (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => toggleSubject(sub)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all active:scale-95 ${
                              selected
                                ? 'bg-[#6C63FF] text-white border-[#6C63FF] shadow-lg shadow-indigo-200'
                                : `${color} hover:border-slate-300`
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

              <div className="relative w-full max-w-sm mt-6">
                <CTAButton
                  variant="coral"
                  disabled={!childName.trim()}
                  loading={saveLoading}
                  onClick={handleSaveChild}
                >
                  Start Learning →
                </CTAButton>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
};
