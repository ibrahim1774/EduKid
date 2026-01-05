import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Zap, Shield, Sparkles, Printer, Headphones, ArrowRight, Play, Star, Check, BookOpen, Clock, Users, Database, Layout, Lightbulb, Target, FileText } from 'lucide-react';
import { generateAppImage } from '../services/geminiService';

// Fast-loading, high-quality defaults for immediate first-paint
const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=1200", // Hero
  "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=800",  // Feature 1
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800",  // Feature 2
  "https://images.unsplash.com/photo-1454165833767-027ffea9e77b?auto=format&fit=crop&q=80&w=800",  // Feature 3
  "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=1200", // Showcase
  "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&q=80&w=800"   // Feature 4
];

const DB_NAME = 'edukid_assets';
const STORE_NAME = 'brand_images';

// Helper for IndexedDB as localStorage is too small for images
const getCachedImages = (): Promise<string[] | null> => {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const getReq = store.get('brand_set');
        getReq.onsuccess = () => resolve(getReq.result || null);
        getReq.onerror = () => resolve(null);
      };
      request.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
};

const cacheImages = (urls: string[]): Promise<void> => {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(urls, 'brand_set');
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      };
      request.onerror = () => resolve();
    } catch (e) {
      resolve();
    }
  });
};

export const HomeView: React.FC<{ onStart: () => void, onLogin: () => void }> = ({ onStart, onLogin }) => {
  const [images, setImages] = useState<string[]>(DEFAULT_IMAGES);
  const [isAiGenerated, setIsAiGenerated] = useState(false);

  useEffect(() => {
    const loadImages = async () => {
      // 1. Check IndexedDB for existing AI assets (No 5MB limit here)
      const cached = await getCachedImages();
      if (cached && Array.isArray(cached) && cached.length === 6) {
        setImages(cached);
        setIsAiGenerated(true);
        return;
      }

      // 2. Background generate if not found (or if previous storage failed)
      try {
        const urls = await Promise.all([0, 1, 2, 3, 4, 5].map(id => generateAppImage(id)));
        setImages(urls);
        setIsAiGenerated(true);
        await cacheImages(urls); // Uses IndexedDB for much larger quota
      } catch (err) {
        console.error("Background AI generation failed, using high-quality defaults:", err);
      }
    };
    loadImages();
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 15 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: "easeOut" as const }
  };

  return (
    <div className="w-full bg-[#F7F9FC]">
      {/* Section 1: Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 md:pt-20 md:pb-26 bg-gradient-to-br from-[#F5F3FF] via-white to-white">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-8 items-center">
          <motion.div {...fadeIn} className="z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6C63FF]/10 text-[#6C63FF] font-bold text-xs mb-4">
              <span className="bg-[#6C63FF] text-white text-[9px] px-1.5 py-0.5 rounded-full mr-1">50% OFF</span>
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
                onClick={onStart}
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
            animate={{ opacity: 1, scale: 1, rotate: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-40"></div>
            <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-xl p-2 bg-white border border-slate-100 aspect-video flex items-center justify-center group">
                <AnimatePresence mode='wait'>
                  <motion.img 
                    key={images[0]}
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    src={images[0]} 
                    alt="Children Learning" 
                    className="rounded-[1.75rem] w-full h-full object-cover shadow-inner"
                  />
                </AnimatePresence>
                {!isAiGenerated && (
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 text-[9px] font-bold text-indigo-600 shadow-lg border border-indigo-100">
                    <Sparkles size={12} className="animate-pulse" />
                    AI DESIGNING UNIQUE ART...
                  </div>
                )}
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

      {/* Section 3: Features Grid */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div {...fadeIn} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1F3A] mb-3">Everything for Daily Learning</h2>
            <p className="text-lg text-slate-500">Premium features designed for consistent learning growth.</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard img={images[1]} icon="📅" title="Fresh Practice" desc="Daily worksheets matched perfectly to grade and focus." />
            <FeatureCard img={images[2]} icon="💡" title="Helpful Hints" desc="Built-in guidance to help your child understand the 'why'." />
            <FeatureCard img={images[3]} icon="🖨️" title="Printable PDFs" desc="High-quality layouts designed for offline practice." />
            <FeatureCard img={images[5]} icon="🎓" title="Custom Plans" desc="Target struggles specifically with every daily sheet." />
          </div>
        </div>
      </section>

      {/* Section 4: Learning Support Spotlight */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-10 items-center">
          <motion.div {...fadeIn} className="order-2 lg:order-1 relative">
            <div className="absolute inset-0 bg-indigo-50 rounded-[2rem] scale-105 -rotate-2"></div>
            <div className="relative z-10 aspect-video rounded-[2rem] overflow-hidden shadow-xl bg-slate-100 flex items-center justify-center">
               <motion.img 
                key={images[2]}
                initial={{ opacity: 0.5 }} 
                animate={{ opacity: 1 }} 
                src={images[2]} 
                alt="Hints System" 
                className="w-full h-full object-cover" 
               />
            </div>
          </motion.div>
          <motion.div {...fadeIn} className="order-1 lg:order-2">
            <div className="text-[#6C63FF] font-bold text-[10px] tracking-[0.2em] mb-2">GUIDED LEARNING SYSTEM</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1F3A] mb-4 leading-tight">Built-In Hints That Teach</h2>
            <div className="space-y-4 text-slate-600 text-base leading-relaxed">
              <p>Every worksheet includes optional problem-solving hints that help children understand the process independently.</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2"><div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0"><Check size={12} /></div> Guided questions for every problem</li>
                <li className="flex items-center gap-2"><div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0"><Check size={12} /></div> Step-by-step concept breakdowns</li>
                <li className="flex items-center gap-2"><div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0"><Check size={12} /></div> Independent confidence building</li>
              </ul>
              <button onClick={onStart} className="bg-[#5DCEA0] text-white px-10 py-5 rounded-2xl font-bold text-base hover:shadow-xl hover:shadow-emerald-100 transition-all mt-4">
                See Sample Worksheets
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
                 key={images[4]}
                 initial={{ opacity: 0.5 }}
                 animate={{ opacity: 1 }}
                 src={images[4]} 
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

      {/* Section 6: Pricing Section */}
      <section className="py-16 bg-[#1A1F3A] text-white relative overflow-hidden">
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
                <li className="flex items-center gap-2 font-bold text-slate-700 text-sm"><CheckCircle className="text-emerald-500" size={16} /> Unlimited Hints</li>
                <li className="flex items-center gap-2 font-bold text-slate-700 text-sm"><CheckCircle className="text-emerald-500" size={16} /> Custom Learning Plans</li>
              </ul>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 font-bold text-slate-700 text-sm"><CheckCircle className="text-emerald-500" size={16} /> PDF Downloads & Print</li>
                <li className="flex items-center gap-2 font-bold text-slate-700 text-sm"><CheckCircle className="text-emerald-500" size={16} /> Progress Tracking</li>
                <li className="flex items-center gap-2 font-bold text-slate-700 text-sm"><CheckCircle className="text-emerald-500" size={16} /> Parent Dashboard</li>
              </ul>
            </div>

            <button onClick={onStart} className="w-full bg-[#6C63FF] text-white py-5 rounded-xl font-bold text-xl shadow-xl shadow-indigo-100 hover:bg-[#5A52E0] transition-all">
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

const FeatureCard = ({ img, icon, title, desc }: { img: string, icon: string, title: string, desc: string }) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className="bg-white rounded-[1.5rem] overflow-hidden shadow-md shadow-slate-200/50 border border-slate-100 flex flex-col h-full"
  >
    <div className="relative h-48 bg-slate-100 flex items-center justify-center">
      <motion.img initial={{ opacity: 0.8 }} animate={{ opacity: 1 }} src={img} alt={title} className="w-full h-full object-cover" />
      <div className="absolute top-2 right-2 w-9 h-9 bg-white rounded-lg shadow-md flex items-center justify-center text-lg z-10">
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
