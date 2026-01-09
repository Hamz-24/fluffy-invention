
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Rocket } from 'lucide-react';
import { NAV_ITEMS } from '../constants';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle - Disappears when menu is open to avoid overlap */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="lg:hidden fixed top-5 left-4 z-[60] p-2.5 bg-accentBlue/90 backdrop-blur-md rounded-xl shadow-lg glow-blue text-white hover:scale-105 active:scale-95 transition-all border border-white/10 animate-in fade-in zoom-in duration-200"
          aria-label="Open Menu"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Backdrop - Clicking this will close the menu */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 glass border-r border-white/10
        transition-transform duration-300 ease-out transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accentBlue to-accentPurple flex items-center justify-center glow-blue">
              <Rocket size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-softGray">
              GuideX
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300
                  ${isActive 
                    ? 'bg-accentBlue/10 text-accentBlue border border-accentBlue/20 glow-blue' 
                    : 'text-softGray hover:text-white hover:bg-white/5'}
                `}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Bottom section */}
          <div className="p-4">
            <div className="p-4 glass rounded-xl border-accentPurple/20 bg-accentPurple/5">
              <p className="text-xs text-accentPurple font-bold uppercase tracking-wider mb-2">Mentor Pro</p>
              <p className="text-sm text-white font-medium mb-3">Upgrade for 1-on-1 voice coaching</p>
              <button className="w-full py-2 bg-gradient-to-r from-accentBlue to-accentPurple rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity glow-purple">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
