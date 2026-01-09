
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Mail, Lock, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { supabase } from '../services/db';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegistering) {
        // 1. Sign Up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          // 2. Create Initial Profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              name: fullName || email.split('@')[0],
              email: email,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
              streak: 0,
              overall_progress: 0,
              interests: []
            });
          
          if (profileError) console.error("Profile creation error:", profileError);
          alert("Account created! Please check your email for verification if enabled, or sign in now.");
          setIsRegistering(false);
        }
      } else {
        // Sign In
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accentBlue/5 rounded-full blur-[100px]"></div>
      
      <GlassCard className="w-full max-w-md relative z-10 border-white/10">
        <button 
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 text-softGray hover:text-white transition-colors flex items-center gap-1 text-xs font-bold"
        >
          <ArrowLeft size={14} /> BACK
        </button>

        <div className="text-center mb-8 pt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accentBlue to-accentPurple mb-4 glow-blue">
            <Rocket size={32} />
          </div>
          <h1 className="text-3xl font-black mb-2">{isRegistering ? 'Create Account' : 'Welcome Back'}</h1>
          <p className="text-softGray">
            {isRegistering ? 'Start your growth journey today' : 'Continue your growth journey with GuideX'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-3">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {isRegistering && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-softGray ml-1">Full Name</label>
              <input 
                type="text" 
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-accentBlue transition-all"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-softGray ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-softGray" size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-accentBlue transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-sm font-medium text-softGray">Password</label>
              {!isRegistering && (
                <button type="button" className="text-xs text-accentBlue hover:underline">Forgot password?</button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-softGray" size={18} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-accentBlue transition-all"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-accentBlue to-accentPurple py-4 rounded-xl font-bold text-lg glow-blue hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : (isRegistering ? 'Register Now' : 'Sign In')}
          </button>
        </form>

        <p className="text-center mt-8 text-softGray text-sm">
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button 
            onClick={() => setIsRegistering(!isRegistering)} 
            className="text-accentBlue font-bold hover:underline"
          >
            {isRegistering ? 'Sign In' : 'Register'}
          </button>
        </p>
      </GlassCard>
    </div>
  );
};

export default Login;
