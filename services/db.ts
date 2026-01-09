
import { createClient } from '@supabase/supabase-js';
import { Goal, JournalEntry, UserProfile } from '../types';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://dganhjfuhmtbfjadtyzl.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnYW5oamZ1aG10YmZqYWR0eXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MTMzOTUsImV4cCI6MjA4MzQ4OTM5NX0.FQAVVtr2LQXGDCyDg9fUQwfrvJLR8YdhRbP_lneAk_U';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const DBService = {
  async getUserId() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) return session.user.id;
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
    } catch (e) {
      return null;
    }
  },

  async ensureProfile(): Promise<UserProfile | null> {
    const userId = await this.getUserId();
    if (!userId) return null;

    try {
      const { data: existing } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (existing) return existing;

      const { data: { user } } = await supabase.auth.getUser();
      const newProfile = {
        id: userId,
        name: user?.email?.split('@')[0] || 'Explorer',
        email: user?.email || '',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        streak: 1,
        overall_progress: 0,
        interests: []
      };

      const { data, error } = await supabase.from('profiles').insert(newProfile).select().single();
      if (error) throw error;
      return data;
    } catch (e) {
      return null;
    }
  },

  // --- GOALS ---
  async getGoals(): Promise<Goal[]> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching goals:', error);
      return [];
    }
  },

  async saveGoal(goal: Goal): Promise<void> {
    const userId = await this.getUserId();
    if (!userId) throw new Error("Not authenticated");
    const { error } = await supabase.from('goals').upsert({ ...goal, user_id: userId });
    if (error) throw error;
  },

  async updateGoal(goal: Goal): Promise<void> {
    await this.saveGoal(goal);
  },

  async deleteGoal(id: string): Promise<void> {
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) throw error;
  },

  // Real-time subscription helper
  subscribeToTable(table: string, callback: () => void) {
    return supabase
      .channel(`${table}-changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        callback();
      })
      .subscribe();
  },

  // --- JOURNAL ---
  async getJournal(): Promise<JournalEntry[]> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching journal:', error);
      return [];
    }
  },

  async saveJournalEntry(entry: JournalEntry): Promise<void> {
    const userId = await this.getUserId();
    if (!userId) throw new Error("Not authenticated");
    
    const cleanedEntry = { ...entry };
    delete (cleanedEntry as any).user_id;

    const { error } = await supabase.from('journal_entries').upsert({ 
      ...cleanedEntry, 
      user_id: userId,
      created_at: entry.created_at || new Date().toISOString()
    });
    
    if (error) throw error;
  },

  async deleteJournalEntry(id: string): Promise<void> {
    const { error } = await supabase.from('journal_entries').delete().eq('id', id);
    if (error) throw error;
  },

  // --- USER PROFILE ---
  async getProfile(): Promise<UserProfile | null> {
    const profile = await this.ensureProfile();
    return profile;
  },

  async updateProfile(profile: UserProfile): Promise<void> {
    const userId = await this.getUserId();
    if (!userId) throw new Error("Not authenticated");
    const { error } = await supabase.from('profiles').upsert({ ...profile, id: userId });
    if (error) throw error;
  },

  async getSessionState() {
    return {
      active: localStorage.getItem('guidex_session_active') === 'true',
      startTime: localStorage.getItem('guidex_session_start')
    };
  }
};
