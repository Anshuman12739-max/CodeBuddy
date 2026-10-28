import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Code2,
  Terminal,
  Bug,
  BookOpen,
  MessageSquare,
  LayoutDashboard,
  User,
  LogOut,
  Cpu,
  Menu,
  X,
  History
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, aiStatus } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Explainer', path: '/explainer', icon: BookOpen },
    { name: 'Debugger', path: '/debugger', icon: Bug },
    { name: 'Practice', path: '/practice', icon: Terminal },
    { name: 'Workspace', path: '/workspace', icon: Code2 },
    { name: 'AI Tutor', path: '/chat', icon: MessageSquare },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-300">
            <Code2 className="w-6 h-6 text-white transition-transform group-hover:scale-110" />
          </div>
          <div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-300">
              CodeBuddy<span className="text-indigo-400">.AI</span>
            </span>
            <span className="hidden sm:block text-[10px] text-slate-400 tracking-wider uppercase font-medium">
              Intelligent CS Tutor
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Bar: AI Provider Pill & User Profile */}
        <div className="hidden sm:flex items-center space-x-3">
          
          {/* AI Provider Status Pill */}
          <div
            title={`Active Provider: ${aiStatus.provider} (${aiStatus.model})`}
            className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span className="capitalize font-mono font-medium">{aiStatus.provider}:</span>
            <span className="text-slate-400 font-mono truncate max-w-[90px]">{aiStatus.model}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                aiStatus.isHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
          </div>

          {user ? (
            <div className="flex items-center space-x-2">
              <Link
                to="/history"
                title="Learning History"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <History className="w-4 h-4" />
              </Link>
              <Link
                to="/profile"
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
                <span className="text-xs font-medium text-slate-200 max-w-[100px] truncate">
                  {user.displayName || 'Profile'}
                </span>
              </Link>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>AI Provider:</span>
              <span className="text-white font-mono">{aiStatus.provider} ({aiStatus.model})</span>
            </div>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                aiStatus.isHealthy ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 p-2.5 rounded-lg text-sm font-medium ${
                    active ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800">
            {user ? (
              <div className="flex items-center justify-between">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 text-sm text-slate-200"
                >
                  <User className="w-4 h-4 text-indigo-400" />
                  <span>{user.displayName || user.email}</span>
                </Link>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="flex items-center space-x-1 text-xs text-rose-400 hover:text-rose-300"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 rounded-lg text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
