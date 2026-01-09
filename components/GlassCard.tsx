
import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  hoverEffect = false,
  ...props 
}) => {
  return (
    <div 
      {...props}
      className={`glass rounded-2xl p-6 transition-all duration-300 ${hoverEffect ? 'hover:border-accentBlue/30 hover:bg-white/10' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;
