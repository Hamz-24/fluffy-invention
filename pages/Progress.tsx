
import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { LineChart as LineChartIcon, PieChart as PieIcon, TrendingUp, Clock, Target, Loader2, Sparkles } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { DBService } from '../services/db';
import { Goal, JournalEntry, UserProfile } from '../types';

const Progress: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [fetchedGoals, fetchedJournal, fetchedProfile] = await Promise.all([
          DBService.getGoals(),
          DBService.getJournal(),
          DBService.getProfile()
        ]);
        setGoals(fetchedGoals);
        setJournal(fetchedJournal);
        setProfile(fetchedProfile);
      } catch (error) {
        console.error("Error fetching progress data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate Hours Over Last 7 Days
  const chartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const dayName = days[d.getDay()];

      const reflectionCount = journal.filter((j: any) => j.date === dateStr).length;
      const reflection = reflectionCount * 0.5;

      let deepWork = 0;
      goals.forEach((g: any) => {
        g.tasks?.forEach((t: any) => {
          if (t.c && t.completedAt) {
            const completedDate = new Date(t.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            if (completedDate === dateStr) deepWork += 1.5;
          }
        });
      });

      result.push({ name: dayName, hours: reflection + deepWork, deepWork, reflection });
    }
    return result;
  }, [goals, journal]);

  // Mood Trend Data
  const moodTrendData = useMemo(() => {
    return [...journal]
      .sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())
      .slice(-10)
      .map(j => ({
        date: new Date(j.created_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sentiment: j.sentiment,
        mood: j.mood
      }));
  }, [journal]);

  // Calculate Focus Distribution (by Goal Category)
  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    goals.forEach((g: any) => {
      counts[g.category] = (counts[g.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [goals]);

  // Calculate Summary Stats
  const stats = useMemo(() => {
    const totalMilestones = goals.reduce((acc: number, g: any) => acc + (g.tasks?.length || 0), 0);
    const completedMilestones = goals.reduce((acc: number, g: any) => acc + (g.tasks?.filter((t: any) => t.c).length || 0), 0);
    const completionRate = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
    const totalHours = chartData.reduce((acc, curr) => acc + curr.hours, 0);

    return { 
      totalHours: totalHours.toFixed(1), 
      completionRate, 
      streak: profile?.streak || 0 
    };
  }, [goals, chartData, profile]);

  const COLORS = ['#4F8BFF', '#8B5CF6', '#22C55E', '#F59E0B', '#EF4444', '#EC4899'];

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-accentBlue" size={48} />
        <p className="text-softGray font-bold tracking-widest uppercase">Calculating Metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black">Growth Analytics</h1>
          <p className="text-softGray">Derived from your milestones and mental reflections.</p>
        </div>
        <div className="p-3 glass rounded-xl border-white/10 text-accentBlue">
          <TrendingUp size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="h-[400px] flex flex-col">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <LineChartIcon size={20} className="text-accentBlue" />
            Estimated Learning Hours
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F8BFF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4F8BFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#4B5563" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#4B5563" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="hours" stroke="#4F8BFF" strokeWidth={3} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="h-[400px] flex flex-col">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Sparkles size={20} className="text-accentPurple" />
            Emotional Velocity
          </h3>
          <div className="flex-1">
            {moodTrendData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodTrendData}>
                   <defs>
                    <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#4B5563" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#4B5563" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '12px' }}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sentiment" 
                    stroke="#8B5CF6" 
                    strokeWidth={4} 
                    dot={{ fill: '#8B5CF6', r: 4 }}
                    activeDot={{ r: 8, stroke: '#FFF', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-softGray opacity-50 italic">
                Log at least 2 entries in your journal to see mood trends.
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="p-8 text-center border-accentBlue/20">
          <Clock className="mx-auto mb-2 text-accentBlue" size={24} />
          <p className="text-softGray text-xs font-bold uppercase tracking-widest mb-2">Weekly Effort</p>
          <p className="text-5xl font-black tracking-tighter">{stats.totalHours}h</p>
        </GlassCard>

        <GlassCard className="p-8 text-center border-accentPurple/20">
          <Target className="mx-auto mb-2 text-accentPurple" size={24} />
          <p className="text-softGray text-xs font-bold uppercase tracking-widest mb-2">Efficiency</p>
          <p className="text-5xl font-black tracking-tighter">{stats.completionRate}%</p>
        </GlassCard>

        <GlassCard className="p-8 text-center border-successGreen/20">
          <TrendingUp className="mx-auto mb-2 text-successGreen" size={24} />
          <p className="text-softGray text-xs font-bold uppercase tracking-widest mb-2">Current Streak</p>
          <p className="text-5xl font-black tracking-tighter">{stats.streak}</p>
        </GlassCard>
      </div>

      <GlassCard className="h-[300px] flex flex-col">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <PieIcon size={20} className="text-white" />
          Growth Distribution
        </h3>
        <div className="flex-1">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={10} dataKey="value" stroke="none">
                  {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '12px' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-full flex items-center justify-center text-softGray opacity-50">Launch goals to analyze distribution</div>}
        </div>
      </GlassCard>
    </div>
  );
};

export default Progress;
