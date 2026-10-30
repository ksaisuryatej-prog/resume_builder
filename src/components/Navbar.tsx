import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Sparkles, Compass, ShieldCheck, LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, openAuthModal, activeView, setActiveView, setUserTab, setAdminTab } = useAuth();

  const handleNav = (targetView: 'landing' | 'user' | 'admin', subTab?: string) => {
    setActiveView(targetView);
    if (targetView === 'user' && subTab) {
      setUserTab(subTab as any);
    } else if (targetView === 'admin' && subTab) {
      setAdminTab(subTab as any);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveView('landing')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-indigo-900 to-purple-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-extrabold text-xl tracking-tight text-slate-900">
              Resume<span className="text-purple-600">Craft</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded-sm">AI</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium hidden sm:block -mt-0.5">
              Build Your Future, One Resume at a Time
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveView('landing')}
            className={`transition-colors hover:text-purple-600 ${activeView === 'landing' ? 'text-purple-600 font-semibold' : ''}`}
          >
            Home
          </button>
          <button
            onClick={() => {
              if (user) {
                handleNav('user', 'templates');
              } else {
                setActiveView('landing');
                const el = document.getElementById('template-gallery');
                el?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="hover:text-purple-600 transition-colors"
          >
            Templates
          </button>
          <button
            onClick={() => {
              if (user) {
                handleNav('user', 'recommendations');
              } else {
                setActiveView('landing');
                const el = document.getElementById('career-guidance');
                el?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="hover:text-purple-600 transition-colors flex items-center gap-1"
          >
            <Compass className="w-4 h-4 text-purple-600" />
            AI Career Guidance
          </button>
          <button
            onClick={() => {
              setActiveView('landing');
              const el = document.getElementById('features');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-purple-600 transition-colors"
          >
            Features
          </button>
        </nav>

        {/* Right Auth Area */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* User / Admin Portal Button */}
              {user.role === 'ADMIN' ? (
                <button
                  onClick={() => handleNav('admin', 'dashboard')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs ${
                    activeView === 'admin'
                      ? 'bg-purple-900 text-white'
                      : 'bg-purple-100 text-purple-900 hover:bg-purple-200'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Admin Portal</span>
                </button>
              ) : null}

              <button
                onClick={() => handleNav('user', 'dashboard')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs ${
                  activeView === 'user'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-purple-500" />
                <span>My Dashboard</span>
              </button>

              {/* User Profile Badge */}
              <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-purple-600/10 text-purple-700 flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left text-xs">
                  <div className="font-semibold text-slate-900 truncate max-w-[120px]">{user.name}</div>
                  <div className="text-[10px] text-slate-500 capitalize">{user.role.toLowerCase()}</div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Log out"
                className="p-2 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-purple-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-600 hover:opacity-95 rounded-lg shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span>Get Started</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
