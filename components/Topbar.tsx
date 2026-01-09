
import React, { useState, useEffect } from 'react';
import { Bell, ChevronDown, Zap, Clock, LogOut, User as UserIcon } from 'lucide-react';
import { DBService, supabase } from '../services/db';
import { UserProfile } from '../types';

const Topbar: React.FC = () => {
  const [sessionTime, setSessionTime] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    DBService.getProfile().then(setProfile);

    const interval = setInterval(() => {
      const start = localStorage.getItem('guidex_session_start');
      const active = localStorage.getItem('guidex_session_active') === 'true';
      
      if (active && start) {
        const elapsed = Math.floor((Date.now() - parseInt(start)) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        setSessionTime(`${mins}m ${secs}s`);
      } else {
        setSessionTime(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('guidex_session_start');
    localStorage.removeItem('guidex_session_active');
    window.location.href = '/';
  };

  return (
    <header className="h-20 glass border-b border-white/5 px-4 md:px-8 lg:pl-8 pl-16 flex items-center justify-end sticky top-0 z-30">
      <div className="flex items-center gap-4 md:gap-6">
        {sessionTime && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-accentBlue/10 border border-accentBlue/20 rounded-lg text-accentBlue animate-pulse">
            <Clock size={14} />
            <span className="text-xs font-black tracking-tighter">{sessionTime}</span>
          </div>
        )}

        <button className="relative p-2 text-softGray hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-accentPurple rounded-full border-2 border-background"></span>
        </button>

        <div className="relative border-l border-white/10 pl-4">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 group"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-white">{profile?.name || 'Explorer'}</p>
              <p className="text-xs text-softGray">{profile?.streak || 0} Day Streak</p>
            </div>
            <div className="relative">
              {profile?.avatar ? (
                <img 
                  src={profile.avatar} 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-full border-2 border-accentBlue/30 hover:border-accentBlue transition-colors object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border-2 border-white/10">
                  <UserIcon size={20} className="text-softGray" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-successGreen border-2 border-background rounded-full"></div>
            </div>
            <ChevronDown size={16} className={`text-softGray transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
              <div className="absolute right-0 mt-3 w-48 glass border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100">
                <button 
                  onClick={() => { setShowDropdown(false); window.location.hash = '#/profile'; }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-softGray hover:text-white hover:bg-white/5 transition-all text-left"
                >
                  <UserIcon size={16} /> My Profile
                </button>
                <div className="h-px bg-white/5 mx-2"></div>
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all text-left"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
