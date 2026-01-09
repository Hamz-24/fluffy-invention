
import React, { useState } from 'react';
import { Bell, Moon, Sun, Shield, User, Globe, MessageSquare, Zap } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Settings: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [mentorVoice, setMentorVoice] = useState('Empathic');

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black">System Settings</h1>
        <p className="text-softGray">Manage your account, privacy, and mentor preferences.</p>
      </div>

      <div className="space-y-6">
        <GlassCard>
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <User size={20} className="text-accentBlue" />
            Account Preferences
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Public Profile</p>
                <p className="text-xs text-softGray">Allow other users to see your learning stats</p>
              </div>
              <Toggle checked={true} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Data Sync</p>
                <p className="text-xs text-softGray">Automatically sync progress across devices</p>
              </div>
              <Toggle checked={true} />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <MessageSquare size={20} className="text-accentPurple" />
            AI Mentor Configuration
          </h3>
          <div className="space-y-6">
             <div className="space-y-2">
                <label className="text-sm font-medium text-softGray">Mentor Personality</label>
                <select 
                  value={mentorVoice}
                  onChange={(e) => setMentorVoice(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-accentPurple"
                >
                  <option className="bg-background">Empathic & Supportive</option>
                  <option className="bg-background">Direct & Disciplined</option>
                  <option className="bg-background">Philosophical & Reflective</option>
                  <option className="bg-background">Data-Driven & Analytical</option>
                </select>
             </div>
             <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Daily AI Summaries</p>
                <p className="text-xs text-softGray">Receive a motivation boost every morning</p>
              </div>
              <Toggle checked={notifications} onChange={() => setNotifications(!notifications)} />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="border-red-500/20 bg-red-500/5">
          <h3 className="text-lg font-bold mb-6 text-red-500">Danger Zone</h3>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-xs text-softGray">Permanently remove all your goals, journals, and data.</p>
            </div>
            <button className="px-6 py-2 bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all">
              Delete Forever
            </button>
          </div>
        </GlassCard>
      </div>

      <div className="flex justify-end gap-4">
         <button className="px-6 py-3 glass border-white/10 rounded-xl font-bold text-softGray hover:text-white transition-colors">
            Discard Changes
         </button>
         <button className="px-8 py-3 bg-accentBlue rounded-xl font-bold glow-blue hover:opacity-90 transition-opacity">
            Save Settings
         </button>
      </div>
    </div>
  );
};

const Toggle: React.FC<{ checked: boolean, onChange?: () => void }> = ({ checked, onChange }) => (
  <button 
    onClick={onChange}
    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${checked ? 'bg-accentBlue' : 'bg-white/10'}`}
  >
    <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`}></div>
  </button>
);

export default Settings;
