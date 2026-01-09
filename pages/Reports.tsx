
import React, { useState, useEffect } from 'react';
import { Download, FileText, CheckCircle2, TrendingUp, AlertTriangle, RefreshCcw, Sparkles, Loader2 } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { DBService } from '../services/db';
import { getGeminiResponse } from '../services/gemini';
import { Goal, UserProfile } from '../types';

interface WeeklyReport {
  id: string;
  weekRange: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  aiSummary: string;
  status: 'finalized' | 'draft';
}

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  const [history, setHistory] = useState<WeeklyReport[]>([]);
  const [currentReport, setCurrentReport] = useState<WeeklyReport>({
    id: 'w-curr',
    weekRange: "Current Learning Period",
    score: 0,
    strengths: ["Waiting for analysis..."],
    weaknesses: ["Waiting for analysis..."],
    aiSummary: "Start tracking your goals and journaling to generate a comprehensive AI report.",
    status: 'draft'
  });

  const [activeReport, setActiveReport] = useState<WeeklyReport>(currentReport);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [fetchedGoals, fetchedProfile] = await Promise.all([
        DBService.getGoals(),
        DBService.getProfile()
      ]);
      setGoals(fetchedGoals);
      setProfile(fetchedProfile);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleGenerateAIReport = async () => {
    if (goals.length === 0) {
      alert("Please create some goals first so I have data to analyze.");
      return;
    }
    setIsGenerating(true);
    
    // Prepare context for Gemini
    const goalContext = goals.map(g => `${g.title}: ${Math.round(((g.tasks?.filter(t=>t.c).length || 0)/(g.tasks?.length || 1))*100)}% completed`).join(', ');
    const prompt = `Based on these learning goals for user ${profile?.name || 'Explorer'}: ${goalContext}. 
    Generate a concise weekly progress report. 
    Include 3 specific strengths based on their progress, 2 actual weaknesses/stalls, and a 2-sentence summary/recommendation.
    Format as JSON with keys: strengths (array), weaknesses (array), recommendation (string), score (number 0-100).`;

    try {
      const response = await getGeminiResponse(prompt);
      const cleanJson = response.replace(/```json|```/g, '').trim();
      const data = JSON.parse(cleanJson);
      
      const newReport: WeeklyReport = {
        ...currentReport,
        strengths: data.strengths,
        weaknesses: data.weaknesses,
        aiSummary: data.recommendation,
        score: data.score || 70
      };
      
      setCurrentReport(newReport);
      setActiveReport(newReport);
    } catch (error) {
      console.error("Failed to generate report:", error);
      alert("AI was unable to generate the report. Please check your API key and Supabase configuration.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = (reportId: string) => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        const reportContent = `
GUIDEX PERSONAL MENTOR REPORT
==============================
Report ID: ${activeReport.id}
User: ${profile?.name || 'Explorer'}
Period: ${activeReport.weekRange}
Growth Score: ${activeReport.score}/100
Status: ${activeReport.status.toUpperCase()}

SUMMARY
-------
${activeReport.aiSummary}

KEY STRENGTHS
-------------
${activeReport.strengths.map(s => `[✓] ${s}`).join('\n')}

AREAS FOR GROWTH
----------------
${activeReport.weaknesses.map(w => `[!] ${w}`).join('\n')}

MENTOR RECOMMENDATION
---------------------
Stay focused on your primary learning objectives. 
Consistency is the multiplier of talent.

Generated via GuideX AI on ${new Date().toLocaleString()}
        `.trim();

        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `GuideX_Report_${activeReport.id}.txt`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Export failed", err);
      } finally {
        setIsExporting(false);
      }
    }, 800);
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-accentBlue" size={48} />
        <p className="text-softGray font-bold tracking-widest uppercase">Fetching Reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Weekly Progress Reports</h1>
          <p className="text-softGray">Data-driven insights into your learning journey.</p>
        </div>
        <button 
          onClick={() => handleExport('all')}
          disabled={isExporting}
          className="flex items-center gap-2 bg-white text-background px-6 py-2 rounded-xl font-bold hover:bg-white/90 transition-all disabled:opacity-50"
        >
          {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          <span>{isExporting ? 'Preparing...' : 'Export All Data'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <GlassCard className="p-8 relative overflow-hidden min-h-[500px]">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <FileText size={200} />
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 border-b border-white/5 pb-6 gap-4">
              <div>
                <span className={`font-bold text-xs uppercase tracking-widest ${activeReport.status === 'draft' ? 'text-accentPurple' : 'text-accentBlue'}`}>
                  {activeReport.status === 'draft' ? 'Draft Analysis' : 'Finalized Report'}
                </span>
                <h2 className="text-3xl font-black mt-1">{activeReport.weekRange}</h2>
              </div>
              <div className="flex gap-3">
                {activeReport.id === currentReport.id && (
                   <button 
                    onClick={handleGenerateAIReport}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-4 py-2 glass border-accentPurple/30 text-accentPurple rounded-xl hover:bg-accentPurple/10 transition-all font-bold text-sm disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {isGenerating ? 'Analyzing...' : 'Generate AI Report'}
                  </button>
                )}
                <button 
                  onClick={() => handleExport(activeReport.id)}
                  disabled={isExporting}
                  className="p-3 glass rounded-xl text-softGray hover:text-white transition-colors disabled:opacity-50"
                >
                  {isExporting ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp size={20} className="text-successGreen" />
                  Key Strengths
                </h3>
                <div className="space-y-4">
                  {activeReport.strengths.map((s, i) => (
                    <div key={i} className="flex gap-3 p-4 glass rounded-xl border-successGreen/20">
                      <CheckCircle2 className="text-successGreen shrink-0" size={18} />
                      <p className="text-sm text-softGray">{s}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <AlertTriangle size={20} className="text-orange-500" />
                  Areas for Growth
                </h3>
                <div className="space-y-4">
                  {activeReport.weaknesses.map((w, i) => (
                    <div key={i} className="flex gap-3 p-4 glass rounded-xl border-orange-500/20">
                      <AlertTriangle className="text-orange-500 shrink-0" size={18} />
                      <p className="text-sm text-softGray">{w}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`p-6 glass border-accentBlue/20 bg-accentBlue/5 rounded-2xl transition-all ${isGenerating ? 'opacity-50 animate-pulse' : ''}`}>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-accentBlue">
                AI Recommendation
              </h3>
              <p className="text-sm leading-relaxed text-softGray italic">
                "{activeReport.aiSummary}"
              </p>
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-bold text-softGray uppercase tracking-widest px-2">Report History</h3>
          <GlassCard 
            onClick={() => setActiveReport(currentReport)}
            className={`p-4 cursor-pointer flex items-center justify-between border-l-4 transition-all ${activeReport.id === currentReport.id ? 'border-accentPurple bg-accentPurple/5' : 'border-transparent'}`}
          >
            <div>
              <p className="font-bold text-sm">Active Period</p>
              <p className="text-xs text-softGray">Real-time Data</p>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded bg-accentPurple/20 text-accentPurple">{activeReport.score}</span>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Reports;
