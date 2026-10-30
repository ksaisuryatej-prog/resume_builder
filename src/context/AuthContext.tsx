import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Resume } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  activeView: 'landing' | 'user' | 'admin';
  userTab: 'dashboard' | 'builder' | 'resumes' | 'templates' | 'ai-generator' | 'recommendations' | 'skill-gap' | 'roadmap' | 'profile';
  adminTab: 'dashboard' | 'users' | 'resumes' | 'templates' | 'job-roles' | 'skills' | 'activity' | 'settings';
  currentResumeId: number | null;
  authModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  setActiveView: (view: 'landing' | 'user' | 'admin') => void;
  setUserTab: (tab: 'dashboard' | 'builder' | 'resumes' | 'templates' | 'ai-generator' | 'recommendations' | 'skill-gap' | 'roadmap' | 'profile') => void;
  setAdminTab: (tab: 'dashboard' | 'users' | 'resumes' | 'templates' | 'job-roles' | 'skills' | 'activity' | 'settings') => void;
  setCurrentResumeId: (id: number | null) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, confirmPassword?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  navigateToBuilder: (resumeId?: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('rc_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<'landing' | 'user' | 'admin'>('landing');
  const [userTab, setUserTab] = useState<'dashboard' | 'builder' | 'resumes' | 'templates' | 'ai-generator' | 'recommendations' | 'skill-gap' | 'roadmap' | 'profile'>('dashboard');
  const [adminTab, setAdminTab] = useState<'dashboard' | 'users' | 'resumes' | 'templates' | 'job-roles' | 'skills' | 'activity' | 'settings'>('dashboard');
  const [currentResumeId, setCurrentResumeId] = useState<number | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => setAuthModalOpen(false);

  const refreshUser = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/auth/me', {
        headers,
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
          localStorage.removeItem('rc_token');
          setToken(null);
        }
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed.' };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('rc_token', data.token);
      setAuthModalOpen(false);

      if (data.user.role === 'ADMIN') {
        setActiveView('admin');
        setAdminTab('dashboard');
      } else {
        setActiveView('user');
        setUserTab('dashboard');
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login.' };
    }
  };

  const register = async (name: string, email: string, password: string, confirmPassword?: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed.' };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('rc_token', data.token);
      setAuthModalOpen(false);
      setActiveView('user');
      setUserTab('dashboard');

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during registration.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('rc_token');
      setActiveView('landing');
      setCurrentResumeId(null);
    }
  };

  const navigateToBuilder = (resumeId?: number) => {
    if (resumeId) {
      setCurrentResumeId(resumeId);
    } else {
      setCurrentResumeId(null);
    }
    setActiveView('user');
    setUserTab('builder');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        activeView,
        userTab,
        adminTab,
        currentResumeId,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        setActiveView,
        setUserTab,
        setAdminTab,
        setCurrentResumeId,
        login,
        register,
        logout,
        refreshUser,
        navigateToBuilder
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
