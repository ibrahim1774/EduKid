import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Zap, Shield, Sparkles, Printer, Headphones, ArrowRight, Play, Star, Check, BookOpen, Clock, Users, Database, Layout, Lightbulb, Target, FileText } from 'lucide-react';
import { generateAppImage } from '../services/geminiService';
import { Link, useNavigate } from 'react-router-dom';

// Real app screenshots
const APP_IMAGES = {
  hero: "/assets/images/dashboard-full.png",
  worksheet: "/assets/images/worksheet-view.png",
  dashboard: "/assets/images/dashboard-lesson.png",
  lesson: "/assets/images/lesson-modal.png",
  full: "/assets/images/dashboard-full.png",
  features_worksheet: "/assets/images/features-worksheet.png",
  hero_dashboard: "/assets/images/hero-dashboard.png"
};

// Wistia Video Component
const WistiaEmbed: React.FC<{ mediaId: string; aspect?: string }> = ({ mediaId, aspect = "1.7777777777777777" }) => {
  useEffect(() => {
    // Load the specific media script
    const script = document.createElement('script');
    script.src = `https://fast.wistia.com/embed/${mediaId}.js`;
    script.async = true;
    script.type = 'module';
    document.head.appendChild(script);

    return () => {
      // Cleanup script if needed (optional)
      // document.head.removeChild(script);
    };
  }, [mediaId]);

  return (
    <div className="w-full h-full relative overflow-hidden rounded-[inherit]">
      <style>{`
        wistia-player[media-id='${mediaId}']:not(:defined) { 
          background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/${mediaId}/swatch'); 
          display: block; 
          filter: blur(5px); 
          padding-top: ${100 / parseFloat(aspect)}%; 
        }
      `}</style>
      {/* @ts-ignore */}
      <wistia-player
        media-id={mediaId}
        aspect={aspect}
        auto-play="true"
        muted="true"
        play-button="false"
        playbar="false"
        fullscreen-button="false"
        settings-control="false"
        small-play-button="false"
        volume-control="false"
        playback-rate-control="false"
        class="w-full h-full"
      />
    </div>
  );
};

export const HomeView: React.FC = () => {
  const navigate = useNavigate();
  const isAiGenerated = true;

  useEffect(() => {
    // Images are now static for performance and consistency
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 15 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: "easeOut" as const }
  };

  const scrollToPricing = () => {
    document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-[#F7F9FC]">
      {/* Section 1: Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 md:pt-20 md:pb-26 bg-gradient-to-br from-[#F5F3FF] via-white to-white">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-8 items-center">
          <motion.div {...fadeIn} className="z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6C63FF]/10 text-[#6C63FF] font-bold text-xs mb-4 uppercase tracking-widest">
              <span>LEARN FROM TODAY</span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-[1.2] mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#4F46E5] via-[#9333EA] to-[#DB2777]">
              Give Your K-5 Child Personalized Daily Learning Practice To Help Sharpen Their Skills
            </h1>
            <p className="text-base md:text-lg text-slate-500 mb-6 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Daily worksheets in various subjects — tailored to their exact grade level. Print, practice, & help your child succeed
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <button
                onClick={scrollToPricing}
                className="bg-[#6C63FF] hover:bg-[#5A52E0] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-indigo-200 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
              >
                Start 3 Day Free Trial <ArrowRight size={20} />
              </button>
              <button className="bg-white hover:bg-slate-50 text-[#1A1F3A] border border-slate-200 px-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:-translate-y-1 active:scale-95 shadow-sm">
                <Play size={20} fill="currentColor" /> See How It Works
              </button>
            </div>
            <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
              <div className="flex items-center gap-2">🔒 Secure</div>
              <div className="flex items-center gap-2">👪 Parent Approved</div>
              <div className="flex items-center gap-2">⭐ 4.9/5 Rating</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-40"></div>
            <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-2xl bg-white border border-slate-100 transform hover:scale-[1.02] transition-transform duration-500">
              <img
                src={APP_IMAGES.hero_dashboard}
                alt="EduKid Dashboard"
                className="w-full h-auto"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* NEW SECTION: Custom Daily Generated Worksheets */}
      <section className="py-20 bg-white relative overflow-hidden text-left border-y border-slate-50">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeIn} className="relative z-10 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[10px] uppercase tracking-widest mb-6">
              <Zap size={14} className="fill-current" /> Personalized Practice
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-[#1A1F3A] mb-6 leading-[1.1] tracking-tight text-left">
              Create Custom Daily Generated Worksheets
            </h2>
            <p className="text-xl text-slate-500 mb-8 leading-relaxed font-medium text-left">
              Based on current issues your child is facing for each subject. Our AI identifies gaps and builds the perfect practice path.
            </p>

            <div className="space-y-5 mb-10">
              <div className="flex gap-4 items-start">
                <div className="mt-1 w-6 h-6 bg-indigo-50 text-[#6C63FF] rounded-lg flex items-center justify-center shrink-0">
                  <Check size={14} strokeWidth={3} />
                </div>
                <p className="text-slate-600 font-bold text-lg">Target specific struggles in Math, Reading, & Science</p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="mt-1 w-6 h-6 bg-indigo-50 text-[#6C63FF] rounded-lg flex items-center justify-center shrink-0">
                  <Check size={14} strokeWidth={3} />
                </div>
                <p className="text-slate-600 font-bold text-lg">Adjust difficulty levels as your child improves</p>
              </div>
            </div>

            <button
              onClick={scrollToPricing}
              className="bg-[#1A1F3A] hover:bg-black text-white px-10 py-5 rounded-2xl font-black text-xl transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center gap-3"
            >
              Start Custom Path <ArrowRight size={22} />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-indigo-100/50 rounded-[3rem] blur-3xl -z-10 rotate-6 translate-x-10 translate-y-10"></div>
            <div className="relative z-10 rounded-[2.5rem] bg-white p-3 shadow-2xl border border-slate-100 shadow-indigo-100/50 transform hover:scale-[1.02] transition-transform duration-500">
              <img
                src={APP_IMAGES.features_worksheet}
                alt="Custom Worksheet Generator"
                className="w-full h-auto rounded-[2rem] shadow-sm"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 2: How It Works */}
      <section className="py-12 md:py-16 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div {...fadeIn} className="text-center mb-10 md:mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#1A1F3A] mb-3 tracking-tight">How It Works</h2>
            <p className="text-lg md:text-xl text-slate-500 max-w-xl mx-auto font-medium leading-relaxed">Get started in less than 5 minutes and transform your morning routine.</p>
          </motion.div>

          <div className="relative flex flex-col md:flex-row justify-between items-center md:items-start gap-10 md:gap-4">
            <div className="absolute top-[30px] left-0 w-full h-0.5 border-t-2 border-dashed border-slate-100 hidden md:block z-0"></div>

            <StepCard step={1} color="bg-[#10B981]" icon={<Star className="w-6 h-6" />} title="Create Account" desc="Simple email signup to start your trial." />
            <StepCard step={2} color="bg-[#EC4899]" icon={<Users className="w-6 h-6" />} title="Profile Setup" desc="Enter name, age, and grade." />
            <StepCard step={3} color="bg-[#6366F1]" icon={<Target className="w-6 h-6" />} title="Focus Areas" desc="Target where your child needs help most." />
            <StepCard step={4} color="bg-[#38BDF8]" icon={<BookOpen className="w-6 h-6" />} title="Daily Subjects" desc="Pick Math, Reading, Writing, Science." />
            <StepCard step={5} color="bg-[#FBBF24]" icon={<FileText className="w-6 h-6" />} title="Get Worksheets" desc="Fresh practice appears every morning." />
          </div>
        </div>
      </section>

      {/* NEW MID-PAGE CTA */}
      <section className="py-12 bg-[#F5F3FF]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div {...fadeIn}>
            <h3 className="text-2xl md:text-3xl font-black text-[#1A1F3A] mb-6">
              Ready to give your child the best learning experience?
            </h3>
            <button
              onClick={scrollToPricing}
              className="bg-[#6C63FF] hover:bg-[#5A52E0] text-white px-10 py-5 rounded-2xl font-black text-xl transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center gap-3 mx-auto"
            >
              Start 3 Day Free Trial <ArrowRight size={22} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* NEW SECTION 2: Designed for Daily, Custom Practice */}
      <section className="py-16 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeIn} className="order-2 lg:order-1">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1F3A] mb-6 leading-tight">Designed for Daily, Custom Practice</h2>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed font-medium">
              Every child's learning journey is different. EduKid allows parents to generate fresh worksheets each day, tailored specifically to each child's unique learning profile based on their grade level, selected subjects, and parent-chosen focus areas.
            </p>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h4 className="font-extrabold text-[#1A1F3A] mb-2 flex items-center gap-2">
                  <Zap size={18} className="text-amber-500" /> Flexible Generation
                </h4>
                <p className="text-slate-500 text-sm font-medium">Parents can generate new worksheets whenever they need them, ensuring practice fits easily into daily routines.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h4 className="font-extrabold text-[#1A1F3A] mb-2 flex items-center gap-2">
                  <Target size={18} className="text-[#6C63FF]" /> Tailored Specifically
                </h4>
                <p className="text-slate-500 text-sm font-medium">Each child receives worksheets created specifically for their level, keeping daily practice consistent and effective.</p>
              </div>
            </div>
          </motion.div>
          <motion.div {...fadeIn} className="order-1 lg:order-2 relative">
            <div className="absolute inset-0 bg-[#5A52E0]/5 rounded-[2rem] rotate-2 scale-105"></div>
            <div className="relative z-10 aspect-[4/3] rounded-[2rem] overflow-hidden shadow-lg bg-slate-50">
              <WistiaEmbed mediaId="ro3mwosmus" aspect="1.33333333" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* NEW SECTION 3: How Parents Generate Daily Worksheets */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div {...fadeIn} className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#1A1F3A] mb-4">How Parents Generate Daily Worksheets</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">Parents can generate new educational material each day in just a few seconds using their child's saved profile.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#F8FAFC] p-8 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:translate-y-[-4px]">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-[#6C63FF] font-extrabold text-xl">1</div>
              <h4 className="text-xl font-extrabold text-[#1A1F3A] mb-3">Profile Match</h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">Generation takes into account your child's exact grade and saved profile data.</p>
            </div>
            <div className="bg-[#F8FAFC] p-8 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:translate-y-[-4px]">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-[#6C63FF] font-extrabold text-xl">2</div>
              <h4 className="text-xl font-extrabold text-[#1A1F3A] mb-3">Topic Selection</h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">Worksheets focus on the specific subjects (Math, Reading, etc.) and focus areas you've chosen.</p>
            </div>
            <div className="bg-[#F8FAFC] p-8 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:translate-y-[-4px]">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-[#6C63FF] font-extrabold text-xl">3</div>
              <h4 className="text-xl font-extrabold text-[#1A1F3A] mb-3">Daily Variation</h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">The system introduces variety within your settings so practice stays engaging without feeling repetitive.</p>
            </div>
            <div className="bg-[#F8FAFC] p-8 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:translate-y-[-4px]">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-[#6C63FF] font-extrabold text-xl">4</div>
              <h4 className="text-xl font-extrabold text-[#1A1F3A] mb-3">Parent Control</h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">Worksheets are created only when you choose to generate them, putting you in full control.</p>
            </div>
          </div>

          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-indigo-50 rounded-[2.5rem] blur-xl opacity-50"></div>
            <div className="relative z-10 bg-[#1A1F3A] rounded-[2.5rem] p-8 md:p-12 overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-10 items-center">
                <div className="text-white">
                  <h3 className="text-2xl md:text-3xl font-extrabold mb-4">Complete Flexibility</h3>
                  <p className="text-indigo-100 text-lg mb-6 font-medium">Each subject can have its own daily worksheet, and parents can update subjects or focus areas at any time as the child progresses.</p>
                  <button onClick={scrollToPricing} className="bg-[#6C63FF] hover:bg-[#5A52E0] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all">Start Now <ArrowRight size={20} /></button>
                </div>
                <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl bg-[#1d2342]">
                  <WistiaEmbed mediaId="aepfpq0du0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Features Grid */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div {...fadeIn} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1F3A] mb-3">Everything for Daily Learning</h2>
            <p className="text-lg text-slate-500">Premium features designed for consistent learning growth.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard img={APP_IMAGES.dashboard} icon="📅" title="Fresh Practice" desc="Daily worksheets matched perfectly to grade and focus." />
            <FeatureCard videoId="dcm3t8p8ap" icon="🎯" title="Topic Mastery" desc="Structured subtopics ensure your child masters one concept at a time." />
            <FeatureCard img={APP_IMAGES.worksheet} icon="🖨️" title="Printable PDFs" desc="High-quality layouts designed for offline practice." />
            <FeatureCard img={APP_IMAGES.full} icon="🎓" title="Custom Plans" desc="Target struggles specifically with every daily sheet." />
          </div>
        </div>
      </section>

      {/* Section 4: Structured Lesson Plans */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-10 items-center">
          <motion.div {...fadeIn} className="order-2 lg:order-1 relative">
            <div className="absolute inset-0 bg-indigo-50 rounded-[2rem] scale-105 -rotate-2"></div>
            <div className="relative z-10 aspect-video rounded-[2rem] overflow-hidden shadow-xl bg-slate-100 flex items-center justify-center">
              <WistiaEmbed mediaId="ggwj6mbnze" />
            </div>
          </motion.div>
          <motion.div {...fadeIn} className="order-1 lg:order-2">
            <div className="text-[#6C63FF] font-black text-[10px] tracking-[0.2em] mb-3 uppercase">Guided Growth Structure</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1F3A] mb-4 leading-tight">Lesson Plans Built by Subject & Subtopic</h2>
            <div className="space-y-6 text-slate-600 text-base leading-relaxed text-left">
              <p className="font-medium text-lg text-slate-700">Daily practice is intentional and progressive, following a clear curriculum for every subject.</p>

              <div className="space-y-4">
                <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 items-center">
                  <div className="w-10 h-10 bg-indigo-100 text-[#6C63FF] rounded-xl flex items-center justify-center shrink-0">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-[#1A1F3A] text-sm uppercase tracking-wider mb-1 leading-none">Structured Progress</h4>
                    <p className="text-sm font-medium text-slate-500">Each subject follows a sequential lesson plan designed to build skills daily.</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 items-center">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                    <Target size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-[#1A1F3A] text-sm uppercase tracking-wider mb-1 leading-none">Focused Subtopics</h4>
                    <p className="text-sm font-medium text-slate-500">Break down big subjects into manageable topics like Addition or Phonics.</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 items-center">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-[#1A1F3A] text-sm uppercase tracking-wider mb-1 leading-none">Grade-Level Mastery</h4>
                    <p className="text-sm font-medium text-slate-500">Every worksheet is generated specifically for your child's exact skill level and topic.</p>
                  </div>
                </div>
              </div>

              <button onClick={scrollToPricing} className="bg-[#6C63FF] text-white px-10 py-5 rounded-2xl font-bold text-base hover:shadow-xl hover:shadow-indigo-100 transition-all mt-4 w-full md:w-auto">
                Start Learning Plan
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 5: Multi-Child Management */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div {...fadeIn} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1F3A] mb-3">Built for Families</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Each child gets their own personalized learning journey.</p>
          </motion.div>

          <motion.div {...fadeIn} className="relative mb-12 max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-transparent rounded-[2rem] -z-10 blur-xl"></div>
            <div className="aspect-video rounded-[2rem] overflow-hidden shadow-xl border border-white bg-slate-100 flex items-center justify-center">
              <motion.img
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                src={APP_IMAGES.full}
                alt="Multi-Child Showcase"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center mx-auto mb-4 text-[#6C63FF]">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-extrabold text-[#1A1F3A] mb-2">Separate Profiles</h3>
              <p className="text-slate-500 leading-relaxed font-medium text-sm">Individual dashboards and unique worksheets for every child.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center mx-auto mb-4 text-[#5DCEA0]">
                <Printer size={24} />
              </div>
              <h3 className="text-xl font-extrabold text-[#1A1F3A] mb-2">Screen-Free Focus</h3>
              <p className="text-slate-500 leading-relaxed font-medium text-sm">Print daily worksheets to keep learning tactile and reduce total screen time.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center mx-auto mb-4 text-[#FFD97D]">
                <Layout size={24} />
              </div>
              <h3 className="text-xl font-extrabold text-[#1A1F3A] mb-2">Full Flexibility</h3>
              <p className="text-slate-500 leading-relaxed font-medium text-sm">Add or remove subjects per child at any time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* NEW SECTION 1: What Children Build Over Time */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeIn} className="relative">
            <div className="absolute inset-0 bg-indigo-50 rounded-[2rem] -rotate-1 scale-105"></div>
            <div className="relative z-10 aspect-[4/3] rounded-[2rem] overflow-hidden shadow-lg bg-slate-50">
              <WistiaEmbed mediaId="j8krn7mri1" aspect="1.33333333" />
            </div>
          </motion.div>
          <motion.div {...fadeIn}>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1F3A] mb-6 leading-tight">What Children Build Over Time</h2>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed font-medium">
              Daily learning is most effective when it becomes a natural part of a child's day. EduKid supports steady learning habits by providing parent-generated worksheets customized to your child's specific grade and subjects.
            </p>
            <ul className="space-y-4">
              {[
                "Consistency through short daily practice",
                "Familiarity with grade-level material",
                "Reduced overwhelm by focusing only on selected subjects",
                "Confidence built through repetition and routine",
                "Independent problem-solving habits over time"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 bg-[#6C63FF]/10 text-[#6C63FF] rounded-full flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-slate-700 font-bold text-sm tracking-tight">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-slate-500 text-sm italic font-medium">
              Parents can generate new worksheets each day in just a few seconds, matched to their child's exact grade level and chosen focus areas.
            </p>
          </motion.div>
        </div>
      </section>


      {/* Section 6: Pricing Section */}
      <section id="pricing-section" className="py-16 bg-[#1A1F3A] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#6C63FF]/5 -skew-x-12"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <motion.div {...fadeIn} className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-3">Simple Pricing</h2>
            <p className="text-lg text-indigo-200">Start with essentials. Add subjects as you go.</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-[2rem] p-8 md:p-12 text-[#1A1F3A] shadow-2xl relative"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FFD97D] text-[#1A1F3A] px-4 py-1.5 rounded-full font-extrabold text-[10px] tracking-widest shadow-md">
              3 DAY FREE TRIAL
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-slate-100 pb-8">
              <div>
                <h3 className="text-2xl font-extrabold mb-1">Base Plan</h3>
                <p className="text-slate-500 font-medium text-base">Daily essentials for strong foundations.</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-extrabold text-[#6C63FF]">$10</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">per child / month</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <ul className="space-y-3">
                <li className="flex items-center gap-2 font-bold text-slate-700 text-sm"><CheckCircle className="text-emerald-500" size={16} /> Daily Math & Reading</li>
                <li className="flex items-center gap-2 font-bold text-slate-700 text-sm"><CheckCircle className="text-emerald-500" size={16} /> Structured Lesson Plans</li>
                <li className="flex items-center gap-2 font-bold text-slate-700 text-sm"><CheckCircle className="text-emerald-500" size={16} /> Custom Learning Plans</li>
              </ul>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 font-bold text-slate-700 text-sm"><CheckCircle className="text-emerald-500" size={16} /> PDF Downloads & Print</li>
                <li className="flex items-center gap-2 font-bold text-slate-700 text-sm"><CheckCircle className="text-emerald-500" size={16} /> Progress Tracking</li>
                <li className="flex items-center gap-2 font-bold text-slate-700 text-sm"><CheckCircle className="text-emerald-500" size={16} /> Parent Dashboard</li>
              </ul>
            </div>

            <button
              onClick={() => window.location.href = 'https://buy.stripe.com/6oU00i3XK4iq7V82zY3cc09'}
              className="w-full bg-[#6C63FF] text-white py-5 rounded-xl font-bold text-xl shadow-xl shadow-indigo-100 hover:bg-[#5A52E0] transition-all"
            >
              Start 3 Day Free Trial
            </button>
            <p className="mt-4 text-center text-slate-400 font-bold text-xs uppercase tracking-wide">Cancel anytime</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

const StepCard = ({ step, color, icon, title, desc }: { step: number, color: string, icon: any, title: string, desc: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="relative z-10 flex flex-col items-center text-center max-w-[240px] md:max-w-[160px]"
  >
    <div className={`w-14 h-14 md:w-16 md:h-16 ${color} text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg relative group transition-transform hover:scale-105 duration-300`}>
      {icon}
      <span className="absolute -top-2 -right-2 w-7 h-7 bg-white border-2 border-slate-50 rounded-full flex items-center justify-center text-[#1A1F3A] font-extrabold text-[10px] shadow-sm">
        {step}
      </span>
    </div>
    <h4 className="text-base md:text-lg font-extrabold text-[#1A1F3A] mb-2 leading-tight tracking-tight">{title}</h4>
    <p className="text-slate-500 text-sm md:text-xs leading-relaxed font-medium">{desc}</p>
  </motion.div>
);

const FeatureCard = ({ img, videoId, icon, title, desc }: { img?: string, videoId?: string, icon: string, title: string, desc: string }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="bg-white rounded-[1.5rem] overflow-hidden shadow-md shadow-slate-200/50 border border-slate-100 flex flex-col h-full"
  >
    <div className="relative h-48 bg-slate-100 flex items-center justify-center">
      {videoId ? (
        <WistiaEmbed mediaId={videoId} />
      ) : (
        <motion.img initial={{ opacity: 0.8 }} animate={{ opacity: 1 }} src={img} alt={title} className="w-full h-full object-cover" />
      )}
      <div className="absolute top-2 right-2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-lg shadow-md flex items-center justify-center text-lg z-10">
        {icon}
      </div>
    </div>
    <div className="p-5">
      <h3 className="text-lg font-extrabold text-[#1A1F3A] mb-2">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-sm mb-4 font-medium">{desc}</p>
      <button className="text-[#6C63FF] font-extrabold text-[10px] uppercase tracking-widest hover:underline">Learn More →</button>
    </div>
  </motion.div>
);
