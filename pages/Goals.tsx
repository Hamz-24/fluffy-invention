
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Target, CheckCircle2, Trash2, Loader2, X, ListTodo, Trophy, ChevronRight, Sparkles } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { DBService } from '../services/db';
import { Goal, Task } from '../types';

const CATEGORIES = ['Coding', 'Design', 'Business', 'Health', 'Psychology', 'Marketing'];

const Goals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  
  const [formTitle, setFormTitle] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formCategory, setFormCategory] = useState('Coding');
  const [formTasks, setFormTasks] = useState<string[]>([]);
  const [taskInput, setTaskInput] = useState('');

  const fetchGoals = async () => {
    const data = await DBService.getGoals();
    setGoals(data);
    if (data.length > 0 && !selectedGoalId) {
      const firstActive = data.find(g => g.status === 'active');
      setSelectedGoalId(firstActive ? firstActive.id : data[0].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGoals();
    const subscription = DBService.subscribeToTable('goals', () => {
      fetchGoals();
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const calculateProgress = (goal: Goal) => {
    if (goal.status === 'completed') return 100;
    if (!goal.tasks || goal.tasks.length === 0) return 0;
    const completed = goal.tasks.filter(t => t.c).length;
    return Math.round((completed / goal.tasks.length) * 100);
  };

  // Re-memoize lists based on strictly updated logic
  const activeGoals = useMemo(() => 
    goals.filter(g => g.status === 'active' && calculateProgress(g) < 100), 
  [goals]);
  
  const completedGoals = useMemo(() => 
    goals.filter(g => g.status === 'completed' || calculateProgress(g) === 100), 
  [goals]);

  const selectedGoal = useMemo(() => 
    goals.find(g => g.id === selectedGoalId), 
  [goals, selectedGoalId]);

  const handleToggleTask = async (goalId: string, taskId: string) => {
    const targetGoalIdx = goals.findIndex(g => g.id === goalId);
    if (targetGoalIdx === -1) return;

    const g = goals[targetGoalIdx];
    const updatedTasks = g.tasks.map(t => 
      t.id === taskId ? { ...t, c: !t.c, completedAt: !t.c ? new Date().toISOString() : undefined } : t
    );
    
    // Auto-update status based on task completion
    const allDone = updatedTasks.length > 0 && updatedTasks.every(t => t.c);
    const newStatus: Goal['status'] = allDone ? 'completed' : 'active';
    
    const updatedGoal = { ...g, tasks: updatedTasks, status: newStatus };
    
    // Update local state first for snappiness
    const updatedGoals = [...goals];
    updatedGoals[targetGoalIdx] = updatedGoal;
    setGoals(updatedGoals);

    // Persist to DB
    await DBService.updateGoal(updatedGoal);
  };

  const handleAddMilestoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim() || !selectedGoalId) return;

    const targetGoal = goals.find(g => g.id === selectedGoalId);
    if (!targetGoal) return;

    const updatedTasks = [...(targetGoal.tasks || []), { id: Date.now().toString(), t: newMilestoneTitle.trim(), c: false }];
    const updatedGoal: Goal = {
      ...targetGoal,
      tasks: updatedTasks,
      status: 'active' // Adding a new task makes it active again
    };

    await DBService.updateGoal(updatedGoal);
    setNewMilestoneTitle('');
    setIsAddingMilestone(false);
  };

  const handleDeleteGoal = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this growth map?")) return;
    await DBService.deleteGoal(id);
    const newGoals = goals.filter(g => g.id !== id);
    setGoals(newGoals);
    if (selectedGoalId === id) setSelectedGoalId(newGoals[0]?.id || null);
  };

  const handleAddTaskToForm = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!taskInput.trim()) return;
    setFormTasks([...formTasks, taskInput.trim()]);
    setTaskInput('');
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const tasks: Task[] = formTasks.map((t, idx) => ({
      id: `init-${idx}-${Date.now()}`,
      t,
      c: false
    }));

    const newGoal: Goal = {
      id: Math.random().toString(36).substr(2, 9),
      title: formTitle,
      deadline: formDeadline,
      category: formCategory,
      status: 'active',
      tasks: tasks,
      created_at: new Date().toISOString()
    };
    
    setLoading(true);
    await DBService.saveGoal(newGoal);
    await fetchGoals();
    setSelectedGoalId(newGoal.id);
    setIsModalOpen(false);
    setFormTasks([]);
  };

  if (loading && goals.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-accentBlue" size={48} />
        <p className="text-softGray font-bold tracking-widest uppercase">Aligning Trajectories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Growth Map</h1>
          <p className="text-softGray">Deconstruct your vision into actionable milestones.</p>
        </div>
        <button 
          onClick={() => { setFormTitle(''); setFormDeadline(''); setFormTasks([]); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-accentBlue px-6 py-2 rounded-xl font-bold glow-blue hover:scale-105 transition-all"
        >
          <Plus size={18} />
          <span>New Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-accentBlue uppercase tracking-widest px-2 flex items-center gap-2">
              <Target size={14} /> Current Growth
            </h3>
            <div className="space-y-3">
              {activeGoals.map((goal) => (
                <div 
                  key={goal.id} 
                  onClick={() => setSelectedGoalId(goal.id)}
                  className={`group p-5 glass rounded-2xl cursor-pointer transition-all border-l-4 ${selectedGoalId === goal.id ? 'border-accentBlue bg-accentBlue/5' : 'border-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">{goal.title}</h3>
                    <span className="text-[10px] font-black text-accentBlue bg-accentBlue/10 px-2 py-0.5 rounded uppercase">{goal.category}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full mt-4">
                    <div className="h-full bg-accentBlue rounded-full glow-blue transition-all duration-500" style={{ width: `${calculateProgress(goal)}%` }}></div>
                  </div>
                </div>
              ))}
              {activeGoals.length === 0 && (
                <div className="p-8 text-center glass rounded-2xl opacity-40 border-dashed border-white/5">
                  <p className="text-xs font-medium">All trajectories clear. Launch a new mission?</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 opacity-80">
            <h3 className="text-xs font-black text-successGreen uppercase tracking-widest px-2 flex items-center gap-2">
              <Trophy size={14} /> Mastered & Archived
            </h3>
            <div className="space-y-3">
              {completedGoals.map((goal) => (
                <div 
                  key={goal.id} 
                  onClick={() => setSelectedGoalId(goal.id)}
                  className={`group p-4 glass rounded-2xl cursor-pointer transition-all border-l-4 ${selectedGoalId === goal.id ? 'border-successGreen bg-successGreen/5' : 'border-transparent'}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-1 bg-successGreen/20 rounded text-successGreen">
                        <CheckCircle2 size={12} />
                      </div>
                      <h3 className="font-bold text-sm text-softGray group-hover:text-white transition-colors">{goal.title}</h3>
                    </div>
                    <ChevronRight size={14} className="text-softGray" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          {selectedGoal ? (
            <GlassCard className={`min-h-[500px] border-l-0 ${selectedGoal.status === 'completed' || calculateProgress(selectedGoal) === 100 ? 'border-successGreen/20' : 'border-accentBlue/20'}`}>
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedGoal.status === 'completed' || calculateProgress(selectedGoal) === 100 ? 'bg-successGreen/10 text-successGreen' : 'bg-accentBlue/10 text-accentBlue'}`}>
                    {selectedGoal.status === 'completed' || calculateProgress(selectedGoal) === 100 ? <Trophy size={24} /> : <Target size={24} />}
                  </div>
                  <div>
                    <h2 className="text-xl font-black flex items-center gap-2">
                      {selectedGoal.title}
                      {(selectedGoal.status === 'completed' || calculateProgress(selectedGoal) === 100) && <span className="text-[10px] bg-successGreen/20 text-successGreen px-2 py-0.5 rounded uppercase">Mastered</span>}
                    </h2>
                    <p className="text-xs text-softGray">{selectedGoal.category} • {(selectedGoal.status === 'completed' || calculateProgress(selectedGoal) === 100) ? 'Achieved' : `Due ${selectedGoal.deadline}`}</p>
                  </div>
                </div>
                <button onClick={(e) => handleDeleteGoal(selectedGoal.id, e)} className="p-2 text-red-400/50 hover:text-red-400 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                {selectedGoal.tasks?.map(t => (
                  <div key={t.id} className="flex items-center gap-3 group">
                    <button 
                      onClick={() => handleToggleTask(selectedGoal.id, t.id)}
                      className={`p-1 rounded border transition-all ${t.c ? 'bg-successGreen border-successGreen' : 'border-white/10 group-hover:border-accentBlue/50'}`}
                    >
                      <CheckCircle2 size={14} className={t.c ? 'text-white' : 'text-transparent'} />
                    </button>
                    <span className={`text-sm transition-all ${t.c ? 'text-softGray line-through' : 'text-white'}`}>{t.t}</span>
                  </div>
                ))}
                
                {isAddingMilestone ? (
                  <form onSubmit={handleAddMilestoneSubmit} className="mt-4">
                    <input 
                      autoFocus
                      value={newMilestoneTitle}
                      onChange={(e) => setNewMilestoneTitle(e.target.value)}
                      placeholder="Next step..."
                      className="w-full bg-white/5 border border-accentBlue/30 rounded-xl py-2 px-4 text-sm focus:outline-none"
                    />
                  </form>
                ) : (
                  <button onClick={() => setIsAddingMilestone(true)} className="text-xs font-bold text-accentBlue flex items-center gap-2 mt-4 hover:underline transition-all">
                    <Plus size={14} /> ADD MILESTONE
                  </button>
                )}
              </div>
              
              {(selectedGoal.status === 'completed' || calculateProgress(selectedGoal) === 100) && (
                <div className="mt-12 p-6 glass bg-successGreen/5 border-successGreen/10 rounded-2xl flex items-center gap-4 animate-in zoom-in-95 duration-500">
                   <div className="w-10 h-10 rounded-full bg-successGreen/20 flex items-center justify-center text-successGreen">
                      <Sparkles size={20} />
                   </div>
                   <div>
                     <p className="font-bold text-successGreen">Trajectory Mastered!</p>
                     <p className="text-xs text-softGray">This vision has been fully materialized.</p>
                   </div>
                </div>
              )}
            </GlassCard>
          ) : (
            <div className="p-20 h-full flex items-center justify-center glass rounded-2xl opacity-40 border-2 border-dashed border-white/5">
              Select a map to view trajectories
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <GlassCard className="w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black">Launch Growth Map</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-softGray hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-black text-softGray ml-1">Title</label>
                <input required placeholder="Learn Quantum Physics" className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-accentBlue focus:outline-none transition-colors" value={formTitle} onChange={e => setFormTitle(e.target.value)} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-black text-softGray ml-1">Deadline</label>
                  <input type="date" required className="w-full bg-white/5 border border-white/10 p-3 rounded-xl color-scheme-dark focus:border-accentBlue focus:outline-none transition-colors" value={formDeadline} onChange={e => setFormDeadline(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-black text-softGray ml-1">Category</label>
                  <select className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-accentBlue focus:outline-none transition-colors" value={formCategory} onChange={e => setFormCategory(e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-background">{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-softGray ml-1">Initial Milestones (Optional)</label>
                <div className="flex gap-2">
                  <input 
                    placeholder="Read Chapter 1..." 
                    className="flex-1 bg-white/5 border border-white/10 p-3 rounded-xl focus:border-accentBlue focus:outline-none transition-colors"
                    value={taskInput}
                    onChange={e => setTaskInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddTaskToForm(e)}
                  />
                  <button 
                    type="button"
                    onClick={() => handleAddTaskToForm()}
                    className="bg-white/5 border border-white/10 px-4 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                
                {formTasks.length > 0 && (
                  <div className="bg-white/5 rounded-xl p-3 space-y-2 max-h-32 overflow-y-auto">
                    {formTasks.map((t, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white/5 p-2 rounded-lg text-sm border border-white/5 group">
                        <span className="truncate flex-1">{t}</span>
                        <button 
                          type="button"
                          onClick={() => setFormTasks(formTasks.filter((_, i) => i !== idx))}
                          className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="w-full py-4 bg-accentBlue rounded-xl font-black glow-blue hover:opacity-90 transition-all uppercase tracking-[0.2em] mt-4">
                Deploy Goal
              </button>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default Goals;
