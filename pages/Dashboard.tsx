
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Flame, Target, Quote, ArrowRight, Zap, BookOpen, ChevronRight, Play, Square, Clock, Loader2, Sparkles, X, Brain } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { DBService } from '../services/db';
import { Goal, UserProfile, JournalEntry } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [latestJournal, setLatestJournal] = useState<JournalEntry | null>(null);
  
  const [sessionActive, setSessionActive] = useState(() => localStorage.getItem('guidex_session_active') === 'true');
  const [seconds, setSeconds] = useState(0);

  const fetchDashboardData = async () => {
    try {
      const [fetchedGoals, fetchedProfile, journalHistory] = await Promise.all([
        DBService.getGoals(),
        DBService.getProfile(),
        DBService.getJournal()
      ]);
      setGoals(fetchedGoals);
      setProfile(fetchedProfile);
      if (journalHistory.length > 0) {
        const latest = journalHistory[0];
        setLatestJournal(latest);
        updateTheme(latest.mood);
      }
      
      const session = await DBService.getSessionState();
      if (session.active && session.startTime) {
        setSeconds(Math.floor((Date.now() - parseInt(session.startTime)) / 1000));
      }
    } catch (err) {
      console.error("Dashboard refresh error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Real-time listener for goals and journal updates
    const goalsSub = DBService.subscribeToTable('goals', fetchDashboardData);
    const journalSub = DBService.subscribeToTable('journal_entries', fetchDashboardData);

    return () => {
      goalsSub.unsubscribe();
      journalSub.unsubscribe();
    };
  }, []);

  const updateTheme = (mood: string) => {
    const root = document.documentElement;
    const moodMap: Record<string, {p: string, s: string, g: string}> = {
      'Calm': { p: '#4F8BFF', s: '#8B5CF6', g: '79, 139, 255' },
      'Focused': { p: '#8B5CF6', s: '#EC4899', g: '139, 92, 246' },
      'Anxious': { p: '#F59E0B', s: '#EF4444', g: '245, 158, 11' },
      'Excited': { p: '#22C55E', s: '#4F8BFF', g: '34, 197, 94' },
      'Tired': { p: '#9CA3AF', s: '#4B5563', g: '156, 163, 175' }
    };

    const config = moodMap[mood] || moodMap['Calm'];
    root.style.setProperty('--accent-primary', config.p);
    root.style.setProperty('--accent-secondary', config.s);
    root.style.setProperty('--glow-rgb', config.g);
  };

  // Helper to calculate progress for filtering
  const calculateGoalProgress = (goal: Goal) => {
    if (!goal.tasks || goal.tasks.length === 0) return 0;
    const completed = goal.tasks.filter(t => t.c).length;
    return Math.round((completed / goal.tasks.length) * 100);
  };

  // Filter for strictly active goals (status is active AND progress < 100%)
  const activeGoals = useMemo(() => 
    goals.filter(g => g.status === 'active' && calculateGoalProgress(g) < 100), 
  [goals]);

  const dashboardGoals = useMemo(() => activeGoals.slice(0, 3), [activeGoals]);

  const completedTasks = goals.reduce((acc: number, g: any) => acc + (g.tasks?.filter((t: any) => t.c).length || 0), 0);
  const totalTasks = goals.reduce((acc: number, g: any) => acc + (g.tasks?.length || 0), 0);
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  useEffect(() => {
    let interval: any;
    if (sessionActive) {
      interval = setInterval(() => {
        const startTime = parseInt(localStorage.getItem('guidex_session_start') || Date.now().toString());
        setSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionActive]);

  const toggleSession = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !sessionActive;
    setSessionActive(newState);
    localStorage.setItem('guidex_session_active', newState.toString());
    if (newState) {
      localStorage.setItem('guidex_session_start', Date.now().toString());
    } else {
      localStorage.removeItem('guidex_session_start');
      setSeconds(0);
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}m ${secs}s`;
  };

  const pieData = [
    { name: 'Completed', value: overallProgress || 0 },
    { name: 'Remaining', value: 100 - (overallProgress || 0) },
  ];
  const COLORS = ['var(--accent-primary)', '#1F2933'];

  if (loading && goals.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-accentBlue" size={48} />
        <p className="text-softGray font-black tracking-widest animate-pulse uppercase">Syncing Universe...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Focus Flow Overlay */}
      {sessionActive && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8 animate-in fade-in duration-700">
          <button 
            onClick={toggleSession}
            className="absolute top-10 right-10 p-4 rounded-full glass border-white/10 text-softGray hover:text-white transition-all"
          >
            <X size={24} />
          </button>
          
          <div className="text-center space-y-12">
            <div className="relative">
              <div className="w-64 h-64 rounded-full border border-white/5 flex items-center justify-center animate-pulse">
                <div className="w-48 h-48 rounded-full border border-accentBlue/20 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-accentBlue/5 flex items-center justify-center glow-blue">
                    <Brain size={48} className="text-accentBlue animate-float" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-5xl font-black tracking-tighter">Flow State Active</h2>
              <p className="text-accentBlue font-bold tracking-[0.3em] uppercase text-sm">Session: {formatTime(seconds)}</p>
              <p className="text-softGray max-w-sm mx-auto italic">"The secret of getting ahead is getting started."</p>
            </div>

            <button 
              onClick={toggleSession}
              className="px-12 py-4 bg-accentBlue text-white rounded-2xl font-black glow-blue hover:opacity-90 transition-all uppercase tracking-widest"
            >
              Finish Session
            </button>
          </div>
        </div>
      )}

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="cursor-pointer group" onClick={() => navigate('/profile')}>
            <h1 className="text-3xl md:text-4xl font-black">Welcome back, {profile?.name || 'Explorer'} 👋</h1>
            <p className="text-softGray mt-2 flex items-center gap-2 group-hover:text-white transition-colors">
              Your mind state is currently <span className="text-accentBlue font-bold">{latestJournal?.mood || 'Calm'}</span>.
              <ChevronRight size={14} className="text-accentBlue" />
            </p>
          </div>
          
          <button 
            onClick={toggleSession}
            className="flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-sm transition-all duration-300 bg-accentBlue/10 text-accentBlue border border-accentBlue/20 glow-blue hover:bg-accentBlue/20"
          >
            <Play size={16} fill="currentColor" />
            <span>Start Focus Session</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard onClick={() => navigate('/progress')} hoverEffect className="flex flex-col items-center justify-center py-10 relative overflow-hidden cursor-pointer group">
            <div className="absolute top-4 right-4 text-softGray group-hover:text-accentBlue transition-colors">
              <Zap size={20} />
            </div>
            <div className="w-48 h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black">{overallProgress}%</span>
                <span className="text-[10px] font-bold text-softGray uppercase tracking-widest">Mastery</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="flex flex-col justify-between overflow-hidden relative group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Flame size={24} />
              </div>
              <span className="text-3xl font-black">{profile?.streak || 0} Days</span>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Consistency Streak</h3>
              <p className="text-softGray text-sm">Every day you show up is a victory.</p>
            </div>
          </GlassCard>

          {/* AI Daily Quest Card - Points to first STRICTLY active goal */}
          <GlassCard className="flex flex-col justify-between border-accentPurple/20 bg-accentPurple/5 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
              <Sparkles size={120} className="text-accentPurple" />
            </div>
            <div className="flex items-center gap-2 text-accentPurple mb-6">
              <Sparkles size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">Today's AI Quest</span>
            </div>
            <p className="text-xl font-medium leading-relaxed text-white/90">
              {activeGoals.length > 0 
                ? `Review the milestones for "${activeGoals[0].title}" and complete just one today.` 
                : "All current maps are mastered. Create a new growth map to unlock daily AI quests."}
            </p>
            <div className="mt-6">
              <button 
                onClick={() => navigate('/goals')}
                className="text-xs font-bold text-accentPurple flex items-center gap-1 hover:underline"
              >
                {activeGoals.length > 0 ? "Go to Goals" : "Start New Map"} <ChevronRight size={14} />
              </button>
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard onClick={() => navigate('/goals')} hoverEffect className="space-y-6 cursor-pointer group">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black flex items-center gap-2">
                <Target size={20} className="text-accentBlue" />
                Growth Maps
              </h3>
            </div>
            <div className="space-y-4">
              {dashboardGoals.length > 0 ? dashboardGoals.map((goal: Goal) => {
                const p = calculateGoalProgress(goal);
                return (
                  <div key={goal.id} className="p-4 glass rounded-xl border-white/5 bg-white/[0.01]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-sm">{goal.title}</span>
                      <span className="text-[10px] font-black text-accentBlue bg-accentBlue/10 px-2 py-0.5 rounded uppercase">{goal.category}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-accentBlue glow-blue" style={{ width: `${p}%` }}></div>
                    </div>
                  </div>
                );
              }) : (
                <div className="py-10 text-center text-softGray border-2 border-dashed border-white/5 rounded-2xl">
                  <p className="text-sm font-medium">All active goals completed.</p>
                  <p className="text-[10px] uppercase tracking-widest mt-2">Ready for a new mission?</p>
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard onClick={() => navigate('/journal')} hoverEffect className="flex flex-col justify-center items-center text-center p-8 cursor-pointer group relative overflow-hidden">
            <div className="w-20 h-20 rounded-2xl bg-accentPurple/10 flex items-center justify-center text-accentPurple mb-6 glow-purple border border-accentPurple/20 transition-all group-hover:scale-110">
              <BookOpen size={40} />
            </div>
            <h3 className="text-2xl font-black mb-2">Mind Clarity</h3>
            <p className="text-softGray mb-8 text-sm max-w-xs">Last mood: {latestJournal?.mood || 'Calm'}. Reflect on your progress.</p>
            <button className="px-12 py-3.5 bg-accentPurple text-white rounded-2xl font-black text-xs tracking-widest glow-purple hover:opacity-90 transition-all uppercase">
              Reflect Now
            </button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
