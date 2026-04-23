import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { Shield, LogOut, Menu, X, LayoutDashboard, History as HistoryIcon, Sliders } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import Particles from './Particles';
import { AnimatePresence, motion } from 'motion/react';

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
}

export default function DashboardLayout({ user, onLogout }: DashboardLayoutProps) {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: '/neuroglaze-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: '/protect', label: 'Protect Asset', icon: Shield },
    { id: '/history', label: 'History', icon: HistoryIcon },
    { id: '/settings', label: 'Settings', icon: Sliders }
  ];

  return (
    <div className="min-h-screen bg-bg text-white flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
      <Particles />

      {/* Desktop Navbar (lg and up) */}
      <header className="hidden lg:flex glass-panel border-b border-border sticky top-0 z-50 h-16 px-6 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-accent/20 flex items-center justify-center border border-accent/50 flex-shrink-0">
            <Shield className="text-accent w-5 h-5" />
          </div>
          <span className="font-bold tracking-wider uppercase text-gradient text-xl truncate">NeuroGlaze</span>
        </div>
        
        <nav className="flex items-center gap-8">
          {navItems.map(tab => (
            <NavLink 
              key={tab.id}
              to={tab.id}
              className={({ isActive }) => 
                `text-sm font-medium transition-colors ${isActive ? 'text-accent text-glow' : 'text-text-muted hover:text-text'}`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-right max-w-[200px]">
              <div className="text-sm font-medium truncate">{user.displayName || 'Operator'}</div>
              <div className="text-xs text-text-muted font-mono truncate">{user.email}</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-surface border border-border overflow-hidden flex items-center justify-center flex-shrink-0">
              {user.photoURL ? (
                <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold">{user.email?.charAt(0).toUpperCase() || 'O'}</span>
              )}
            </div>
          </div>
          <button onClick={onLogout} className="text-text-muted hover:text-text transition-colors flex-shrink-0" title="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Tablet/Mobile Header (< lg) */}
      <header className="lg:hidden glass-panel border-b border-border sticky top-0 z-40 h-16 flex items-center justify-between px-4 sm:px-6 relative">
        {/* Left: Hamburger Menu */}
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="text-text hover:text-accent transition-colors flex-shrink-0 z-10 p-1 -ml-1"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        {/* Center: App Name (Perfectly Centered) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
          <div className="w-6 h-6 md:w-7 md:h-7 rounded bg-accent/20 flex items-center justify-center border border-accent/50 flex-shrink-0">
            <Shield className="text-accent w-4 h-4 md:w-5 md:h-5" />
          </div>
          <span className="font-bold tracking-wider uppercase text-gradient text-base md:text-lg truncate">NeuroGlaze</span>
        </div>

        {/* Right: User + Logout Button */}
        <div className="flex flex-row items-center gap-3 ml-auto z-10">
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right max-w-[150px]">
              <div className="text-sm font-medium truncate">{user.displayName || 'Operator'}</div>
              <div className="text-xs text-text-muted font-mono truncate">{user.email}</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-surface border border-border overflow-hidden flex items-center justify-center flex-shrink-0">
              {user.photoURL ? (
                <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold">{user.email?.charAt(0).toUpperCase() || 'O'}</span>
              )}
            </div>
          </div>
          <button onClick={onLogout} className="text-text-muted hover:text-white transition-colors flex-shrink-0" title="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Tablet/Mobile Sidebar Drawer (< lg) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            {/* Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-72 bg-surface overflow-hidden border-r border-border z-50 flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.5)] lg:hidden"
            >
              {/* Logo Area */}
              <div className="h-16 flex items-center justify-between px-6 border-b border-border bg-black/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-accent/20 flex items-center justify-center border border-accent/50 flex-shrink-0">
                    <Shield className="text-accent w-5 h-5" />
                  </div>
                  <span className="font-bold tracking-wider uppercase text-gradient text-lg">NeuroGlaze</span>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-text-muted hover:text-white transition-colors flex-shrink-0"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                {navItems.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <NavLink
                      key={tab.id}
                      to={tab.id}
                      onClick={() => setIsSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                          isActive 
                            ? 'bg-accent/10 border border-accent/30 text-accent shadow-[inset_0_0_20px_rgba(0,242,255,0.1)]' 
                            : 'text-text-muted hover:bg-surface-glass hover:text-white border border-transparent'
                        }`
                      }
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {tab.label}
                    </NavLink>
                  );
                })}
              </nav>

              {/* User Section */}
              <div className="p-4 border-t border-border bg-black/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-surface border border-border overflow-hidden flex items-center justify-center flex-shrink-0">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold">{user.email?.charAt(0).toUpperCase() || 'O'}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-white truncate">{user.displayName || 'Operator'}</div>
                    <div className="text-xs text-text-muted font-mono truncate">{user.email}</div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsSidebarOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-red-400 bg-red-400/10 border border-red-400/20 hover:bg-red-400/20 transition-colors font-bold text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  LOGOUT
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 md:py-8 relative z-10 flex flex-col min-h-0">
        <Outlet />
      </main>
    </div>
  );
}
