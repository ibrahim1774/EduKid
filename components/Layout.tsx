import React from 'react';
import { LogOut, User, Menu, X, BookOpen } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: { email: string } | null;
  onNavigate: (view: any) => void;
  onLogout: () => void;
  activeView: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onNavigate, onLogout, activeView }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const NavLink = ({ view, label }: { view: string, label: string }) => (
    <button
      onClick={() => { onNavigate(view); setMobileMenuOpen(false); }}
      className={`px-4 py-2 rounded-full transition-all duration-200 ${
        activeView === view 
          ? 'bg-[#6366F1] text-white shadow-lg' 
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 no-print">
        <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => onNavigate('home')}
          >
            <div className="w-10 h-10 bg-[#6366F1] rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-800">EduKid<span className="text-[#6366F1]">.ai</span></span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {!user ? (
              <>
                <button onClick={() => onNavigate('home')} className="text-slate-600 hover:text-[#6366F1] font-medium">Home</button>
                <button onClick={() => onNavigate('home')} className="text-slate-600 hover:text-[#6366F1] font-medium">About</button>
                <button onClick={() => onNavigate('login')} className="text-slate-600 hover:text-[#6366F1] font-medium">Login</button>
                <button 
                  onClick={() => onNavigate('signup')}
                  className="bg-[#FF7A59] hover:bg-[#ff6a42] text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-md active:scale-95"
                >
                  Join Now
                </button>
              </>
            ) : (
              <>
                <NavLink view="dashboard" label="Dashboard" />
                <button 
                  onClick={onLogout}
                  className="flex items-center gap-2 text-slate-500 hover:text-red-500 font-medium px-4"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            )}
          </nav>

          {/* Mobile Toggle */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 p-6 flex flex-col gap-4 shadow-xl animate-in slide-in-from-top duration-300">
            {!user ? (
              <>
                <button onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }} className="text-left py-2 font-medium">Home</button>
                <button onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }} className="text-left py-2 font-medium">Login</button>
                <button onClick={() => { onNavigate('signup'); setMobileMenuOpen(false); }} className="bg-[#FF7A59] text-white py-3 rounded-xl font-bold">Sign Up</button>
              </>
            ) : (
              <>
                <button onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }} className="text-left py-2 font-medium">Dashboard</button>
                <button onClick={onLogout} className="text-left py-2 font-medium text-red-500 flex items-center gap-2">
                  <LogOut size={18} /> Logout
                </button>
              </>
            )}
          </div>
        )}
      </header>

      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
};