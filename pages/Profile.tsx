
import React, { useState, useEffect } from 'react';
import { Camera, Mail, MapPin, Link as LinkIcon, Edit2, BadgeCheck, Save, X, Briefcase, Plus, Trash2, Loader2 } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { DBService } from '../services/db';
import { UserProfile } from '../types';

const Profile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [tempUser, setTempUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const data = await DBService.getProfile();
    if (data) {
      setUser(data);
      setTempUser(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!tempUser) return;
    setLoading(true);
    await DBService.updateProfile(tempUser);
    setUser(tempUser);
    setIsEditing(false);
    setLoading(false);
  };

  const handleCancel = () => {
    setTempUser(user);
    setIsEditing(false);
  };

  const addInterest = () => {
    const newInterest = prompt("Enter a new learning interest:");
    if (newInterest && tempUser && !tempUser.interests.includes(newInterest)) {
      setTempUser({ ...tempUser, interests: [...tempUser.interests, newInterest] });
    }
  };

  const removeInterest = (interest: string) => {
    if (tempUser) {
      setTempUser({ ...tempUser, interests: tempUser.interests.filter(i => i !== interest) });
    }
  };

  if (loading && !user) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-accentBlue" size={48} />
        <p className="text-softGray font-bold tracking-widest uppercase">Loading Profile...</p>
      </div>
    );
  }

  if (!user) return <div className="p-20 text-center glass rounded-2xl">Profile not found. Please log in again.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="relative h-48 rounded-3xl overflow-hidden glass border-white/10 mb-[-4rem]">
        <img 
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200&h=400" 
          className="w-full h-full object-cover opacity-30"
          alt="Cover"
        />
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="absolute bottom-4 right-4 p-2.5 bg-accentBlue text-white rounded-xl hover:scale-105 transition-all glow-blue flex items-center gap-2 font-bold text-sm"
          >
            <Edit2 size={16} />
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-10">
        <div className="lg:col-span-4 space-y-6">
          <GlassCard className="flex flex-col items-center text-center pt-12 relative">
             <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                <div className="relative group">
                   <img 
                    src={tempUser?.avatar || user.avatar} 
                    className="w-32 h-32 rounded-3xl object-cover border-4 border-background ring-4 ring-accentBlue/20"
                    alt="Profile"
                  />
                  {isEditing && (
                    <button className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={24} className="text-white" />
                    </button>
                  )}
                </div>
             </div>

             {isEditing ? (
               <div className="w-full space-y-4 mt-4">
                  <input 
                    type="text" 
                    value={tempUser?.name || ''}
                    onChange={(e) => setTempUser(prev => prev ? {...prev, name: e.target.value} : null)}
                    placeholder="Full Name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-center font-black text-2xl focus:border-accentBlue focus:outline-none"
                  />
                  <input 
                    type="text" 
                    value={tempUser?.title || ''}
                    onChange={(e) => setTempUser(prev => prev ? {...prev, title: e.target.value} : null)}
                    placeholder="Professional Title"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-center text-softGray text-sm focus:border-accentBlue focus:outline-none"
                  />
               </div>
             ) : (
               <div className="mt-4">
                 <h2 className="text-2xl font-black flex items-center justify-center gap-2">
                   {user.name}
                   <BadgeCheck size={20} className="text-accentBlue" />
                 </h2>
                 <p className="text-softGray mt-1">{user.title || 'GuideX Member'}</p>
               </div>
             )}
             
             <div className="w-full flex justify-center gap-4 border-y border-white/5 py-6 my-6">
               <div className="text-center">
                 <p className="text-xl font-black">{user.streak || 0}</p>
                 <p className="text-xs text-softGray uppercase">Streak</p>
               </div>
               <div className="w-px h-10 bg-white/5"></div>
               <div className="text-center">
                 <p className="text-xl font-black">{user.overall_progress || 0}%</p>
                 <p className="text-xs text-softGray uppercase">Mastery</p>
               </div>
             </div>

             <div className="w-full space-y-4 text-sm text-softGray text-left px-2">
               {isEditing ? (
                 <>
                   <div className="flex items-center gap-3">
                     <Mail size={16} className="text-accentBlue" />
                     <input 
                        type="email"
                        value={tempUser?.email || ''}
                        onChange={(e) => setTempUser(prev => prev ? {...prev, email: e.target.value} : null)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg py-1 px-2 focus:border-accentBlue focus:outline-none"
                     />
                   </div>
                   <div className="flex items-center gap-3">
                     <MapPin size={16} className="text-accentBlue" />
                     <input 
                        type="text"
                        value={tempUser?.location || ''}
                        onChange={(e) => setTempUser(prev => prev ? {...prev, location: e.target.value} : null)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg py-1 px-2 focus:border-accentBlue focus:outline-none"
                     />
                   </div>
                   <div className="flex items-center gap-3">
                     <LinkIcon size={16} className="text-accentBlue" />
                     <input 
                        type="text"
                        value={tempUser?.website || ''}
                        onChange={(e) => setTempUser(prev => prev ? {...prev, website: e.target.value} : null)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg py-1 px-2 focus:border-accentBlue focus:outline-none"
                     />
                   </div>
                 </>
               ) : (
                 <>
                   <div className="flex items-center gap-3">
                     <Mail size={16} />
                     <span>{user.email}</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <MapPin size={16} />
                     <span>{user.location || 'Add location'}</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <LinkIcon size={16} />
                     {user.website ? <a href={`https://${user.website}`} target="_blank" rel="noreferrer" className="text-accentBlue hover:underline">{user.website}</a> : <span>Add website</span>}
                   </div>
                 </>
               )}
             </div>

             {isEditing && (
               <div className="grid grid-cols-2 gap-3 w-full mt-8">
                  <button 
                    onClick={handleCancel}
                    className="flex items-center justify-center gap-2 py-3 glass border-white/10 rounded-xl font-bold text-softGray hover:text-white transition-colors"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="flex items-center justify-center gap-2 py-3 bg-accentBlue rounded-xl font-bold glow-blue text-white"
                  >
                    <Save size={18} />
                    Save
                  </button>
               </div>
             )}
          </GlassCard>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <GlassCard>
            <h3 className="text-xl font-black mb-6">Learning Interests</h3>
            <div className="flex flex-wrap gap-3">
              {(isEditing ? tempUser?.interests : user.interests)?.map((interest, i) => (
                <div 
                  key={i} 
                  className="group px-4 py-2 rounded-xl glass border-white/10 text-sm font-medium hover:border-accentBlue/50 transition-all cursor-default flex items-center gap-2"
                >
                  {interest}
                  {isEditing && (
                    <button 
                      onClick={() => removeInterest(interest)}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
              {isEditing && (
                <button 
                  onClick={addInterest}
                  className="px-4 py-2 rounded-xl border border-dashed border-white/20 text-sm text-softGray hover:text-white hover:border-white/40 transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add
                </button>
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-xl font-black mb-6">About & Professional Goals</h3>
            {isEditing ? (
              <textarea 
                value={tempUser?.bio || ''}
                onChange={(e) => setTempUser(prev => prev ? {...prev, bio: e.target.value} : null)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-accentBlue focus:outline-none min-h-[120px] text-softGray text-sm leading-relaxed"
                placeholder="Tell your AI mentor about your long-term goals..."
              />
            ) : (
              <p className="text-softGray text-sm leading-relaxed">
                {user.bio || "No biography provided yet. Edit your profile to add one."}
              </p>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Profile;
