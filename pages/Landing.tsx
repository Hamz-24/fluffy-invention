
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Target, BookOpen, MessageSquare, BarChart3, Zap } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accentBlue/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accentPurple/10 rounded-full blur-[120px]"></div>

      {/* Nav */}
      <nav className="container mx-auto px-6 py-8 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accentBlue to-accentPurple flex items-center justify-center glow-blue">
            <Rocket size={20} />
          </div>
          <span className="text-2xl font-bold tracking-tight">GuideX</span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/login')} className="text-softGray hover:text-white transition-colors">Login</button>
          <button onClick={() => navigate('/login')} className="bg-white text-background px-6 py-2 rounded-full font-bold hover:bg-opacity-90 transition-all shadow-xl">Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-6 pt-20 pb-32 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 text-accentBlue text-sm font-semibold mb-8 glow-blue animate-float">
          <Zap size={16} />
          <span>New: AI Voice Mentoring beta</span>
        </div>
        <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter leading-tight">
          GuideX — Your AI <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-accentBlue via-accentPurple to-accentBlue bg-[length:200%_auto] animate-gradient">Personal Learning Mentor</span>
        </h1>
        <p className="text-xl text-softGray max-w-2xl mx-auto mb-12 leading-relaxed">
          The ultimate dashboard for high achievers. Stay consistent, stay motivated, and stay guided with advanced AI goal analysis and journaling.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-accentBlue to-accentPurple rounded-2xl font-bold text-lg glow-blue hover:scale-105 transition-transform"
          >
            Start Your Journey
          </button>
          <button className="w-full sm:w-auto px-8 py-4 glass border-white/10 rounded-2xl font-bold text-lg hover:bg-white/5 transition-colors">
            View Live Demo
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            icon={<Target className="text-accentBlue" />}
            title="Goal Tracking"
            desc="Visual progress tracking with AI task decomposition."
          />
          <FeatureCard 
            icon={<MessageSquare className="text-accentPurple" />}
            title="AI Mentor"
            desc="A world-class mentor in your pocket available 24/7."
          />
          <FeatureCard 
            icon={<BookOpen className="text-successGreen" />}
            title="Smart Journaling"
            desc="Emotional analysis to track your psychological state."
          />
          <FeatureCard 
            icon={<BarChart3 className="text-accentBlue" />}
            title="Weekly Reports"
            desc="Data-driven insights into your learning habits."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 text-center text-softGray text-sm">
        <p>&copy; 2024 GuideX AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, desc: string }> = ({ icon, title, desc }) => (
  <GlassCard hoverEffect className="flex flex-col items-center text-center">
    <div className="w-12 h-12 rounded-xl glass border-white/10 flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-softGray text-sm">{desc}</p>
  </GlassCard>
);

export default Landing;
