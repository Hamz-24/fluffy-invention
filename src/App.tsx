
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Goals from '../pages/Goals';
import Journal from '../pages/Journal';
import AIMentor from '../pages/AIMentor';
import Progress from '../pages/Progress';
import Reports from '../pages/Reports';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { supabase, DBService } from '../services/db';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const isPublicRoute = location.pathname === '/' || location.pathname === '/login';

  useEffect(() => {
    // 1. Immediate Session Check (Synchronous/Fast)
    const checkInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);

        // Non-blocking profile check
        if (session) {
          DBService.ensureProfile().catch(err => console.error("Background profile sync failed:", err));
        }
      } catch (err) {
        console.error("Session check failed:", err);
      } finally {
        setLoading(false);
      }
    };

    checkInitialSession();

    // 2. Auth Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        DBService.ensureProfile().catch(err => console.error("Auth change sync failed:", err));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-accentBlue/20 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-accentBlue border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-softGray font-black tracking-[0.3em] uppercase text-sm">Initializing GuideX</p>
          <p className="text-[10px] text-softGray/40 italic">Syncing with neural network...</p>
        </div>
      </div>
    );
  }

  if (!session && !isPublicRoute) {
    return <Navigate to="/login" replace />;
  }

  if (isPublicRoute && !session) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login onLogin={() => { }} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  if (session && isPublicRoute) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/mentor" element={<AIMentor />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
