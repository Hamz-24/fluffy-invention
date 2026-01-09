
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, Save, Sparkles, Activity, Trash2, History, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import GlassCard from '../components/GlassCard';
import { analyzeJournalEntry } from '../services/gemini';
import { DBService } from '../services/db';
import { JournalEntry } from '../types';

const Journal: React.FC = () => {
  const [entry, setEntry] = useState('');
  const [mood, setMood] = useState('Focused');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [history, setHistory] = useState<JournalEntry[]>([]);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{ mood: string, summary: string, sentiment: number } | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await DBService.getJournal();
      setHistory(data);
    } catch (e) {
      console.error("Fetch history failed", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!entry.trim()) return;
    setAnalyzing(true);
    try {
      const result = await analyzeJournalEntry(entry);
      if (result) {
        setAnalysisResult(result);
        if (result.mood) setMood(result.mood);
      }
    } catch (e) {
      console.error("AI Analysis failed", e);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!entry.trim()) return;
    setSaving(true);
    setSaveError(null);
    
    try {
      const newEntry: JournalEntry = {
        id: activeEntryId || Math.random().toString(36).substr(2, 9),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        content: entry,
        mood: analysisResult?.mood || mood,
        sentiment: analysisResult?.sentiment || 75,
        summary: analysisResult?.summary || "Self-reflective session.",
        created_at: new Date().toISOString()
      };

      await DBService.saveJournalEntry(newEntry);
      
      // Refresh local list
      await fetchHistory();
      
      setSaveSuccess(true);
      setEntry('');
      setAnalysisResult(null);
      setActiveEntryId(null);
      
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error("Journal save failed:", error);
      setSaveError(error.message || "Could not save to database. Check connection.");
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Remove this memory?")) return;
    try {
      await DBService.deleteJournalEntry(id);
      await fetchHistory();
      if (activeEntryId === id) {
        setEntry('');
        setActiveEntryId(null);
      }
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  const selectEntry = (h: JournalEntry) => {
    setActiveEntryId(h.id);
    setEntry(h.content);
    setMood(h.mood);
    setAnalysisResult({ mood: h.mood, summary: h.summary, sentiment: h.sentiment });
  };

  // Real chart data from history
  const chartData = useMemo(() => {
    if (history.length === 0) return [];
    // Sort by date to show trend
    return [...history]
      .sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())
      .slice(-7)
      .map(h => ({
        name: h.date.split(',')[0],
        sentiment: h.sentiment,
        mood: h.mood
      }));
  }, [history]);

  if (loading && history.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-accentBlue" size={48} />
        <p className="text-softGray font-bold tracking-widest uppercase">Syncing Memories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Mind Journal</h1>
          <p className="text-softGray">Transform thoughts into clarity with AI guidance.</p>
        </div>
        <div className="flex items-center gap-3 glass border-white/10 px-4 py-2 rounded-xl text-softGray font-bold text-sm">
          <CalendarIcon size={16} />
          <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Area */}
        <div className="lg:col-span-8 space-y-6">
          <GlassCard className="p-0 overflow-hidden flex flex-col min-h-[600px] border-white/5">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/2">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {['Calm', 'Focused', 'Anxious', 'Excited', 'Tired'].map((m) => (
                  <button 
                    key={m}
                    onClick={() => setMood(m)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${mood === m ? 'bg-accentBlue text-white glow-blue' : 'glass border-white/10 text-softGray hover:text-white'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <div className="text-xs text-softGray font-medium px-4 whitespace-nowrap">
                {entry.length > 0 ? `${entry.trim().split(/\s+/).length} words` : 'Empty'}
              </div>
            </div>
            
            <textarea 
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              placeholder="What's the highlight of your journey today? Express freely..."
              className="flex-1 w-full bg-transparent p-8 focus:outline-none resize-none text-lg leading-relaxed placeholder:text-white/5 text-white/90"
            />
            
            <div className="p-6 border-t border-white/5 flex flex-col sm:flex-row gap-4 bg-white/2 relative">
              {saveSuccess && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-successGreen text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in">
                  <CheckCircle size={14} /> Memory Archived!
                </div>
              )}
              
              {saveError && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in">
                  <AlertTriangle size={14} /> {saveError}
                </div>
              )}
              
              <button 
                onClick={handleAnalyze}
                disabled={analyzing || !entry.trim()}
                className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all sm:flex-1 ${analyzing ? 'bg-accentPurple/50 animate-pulse' : 'bg-accentPurple/20 text-accentPurple hover:bg-accentPurple/30 border border-accentPurple/20 glow-purple'}`}
              >
                {analyzing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                {analyzing ? 'AI Decoding...' : 'AI Perspective'}
              </button>
              <button 
                onClick={handleSave}
                disabled={!entry.trim() || saving}
                className="flex items-center justify-center gap-2 bg-accentBlue py-4 rounded-xl font-bold glow-blue hover:opacity-90 transition-opacity px-10 disabled:opacity-50 min-w-[200px]"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? 'Archiving...' : 'Archive Thoughts'}
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Sidebar Context */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard className="space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Activity size={20} className="text-accentBlue" />
              Mind State Trend
            </h3>
            <div className="h-40 relative">
              {chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: '#0B0E14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#4F8BFF', fontSize: '12px' }}
                    />
                    <Bar dataKey="sentiment" radius={[4, 4, 0, 0]}>
                      {chartData.map((e, index) => (
                        <Cell key={`cell-${index}`} fill={e.sentiment > 60 ? '#4F8BFF' : '#8B5CF6'} opacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-white/5 rounded-2xl opacity-40">
                  <p className="text-xs">Archive at least 2 entries to visualize mental trends.</p>
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard className={`border-accentBlue/20 bg-accentBlue/5 transition-all duration-500 ${analysisResult ? 'scale-100 opacity-100' : 'opacity-60 scale-95'}`}>
            <div className="flex items-center justify-between mb-4">
               <div className="w-10 h-10 rounded-xl bg-accentBlue/20 flex items-center justify-center text-accentBlue">
                <Sparkles size={20} />
              </div>
            </div>
            <h3 className="text-lg font-bold mb-2">Mentor's Reflection</h3>
            <p className="text-sm text-softGray leading-relaxed italic">
              {analysisResult?.summary || "Your AI Mentor is waiting for your next entry to provide personalized psychological insights."}
            </p>
          </GlassCard>

          <div className="space-y-3">
             <div className="flex items-center gap-2 px-2 text-softGray font-bold text-xs uppercase tracking-widest">
               <History size={14} />
               <span>Recent Memories</span>
             </div>
             {history.length === 0 ? (
               <div className="p-8 glass rounded-2xl border-white/5 text-center opacity-40">
                 <p className="text-xs">No entries found.</p>
               </div>
             ) : (
               <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                 {history.slice(0, 5).map((h) => (
                   <div 
                    key={h.id}
                    onClick={() => selectEntry(h)}
                    className={`group p-4 glass rounded-2xl border-white/5 hover:border-accentBlue/30 transition-all cursor-pointer flex items-center justify-between ${activeEntryId === h.id ? 'bg-accentBlue/5 border-accentBlue/40' : ''}`}
                   >
                     <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${h.sentiment > 70 ? 'bg-successGreen' : 'bg-accentPurple'}`}></div>
                        <div className="truncate">
                          <p className="text-sm font-bold text-white truncate">{h.content}</p>
                          <p className="text-[10px] text-softGray">{h.date} • {h.mood}</p>
                        </div>
                     </div>
                     <button 
                        onClick={(e) => deleteEntry(h.id, e)}
                        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-400 rounded-lg transition-all shrink-0"
                     >
                       <Trash2 size={14} />
                     </button>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journal;
