/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { UserPortal } from './pages/UserPortal';
import { AdminPortal } from './pages/AdminPortal';
import { AuthModal } from './pages/AuthModal';

function MainAppContent() {
  const { activeView, user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 selection:bg-purple-600 selection:text-white font-sans">
      <Navbar />

      <div className="flex-1">
        {activeView === 'landing' && (
          <>
            <LandingPage />
            <Footer />
          </>
        )}

        {activeView === 'user' && <UserPortal />}

        {activeView === 'admin' && (
          user?.role === 'ADMIN' ? (
            <AdminPortal />
          ) : (
            <div className="p-12 text-center space-y-3">
              <div className="text-xl font-bold text-red-600">Access Denied</div>
              <p className="text-xs text-slate-600">You must be logged in as an administrator to access the admin portal.</p>
            </div>
          )
        )}
      </div>

      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
