import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Cpu, ShieldCheck, Save, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import Button from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { authService } from '../services/authService';
import { SUPPORTED_LANGUAGES } from '../utils/constants';

export default function ProfilePage() {
  const { user, aiStatus, logout, refreshUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferredLanguage || 'python');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      if (user.preferredLanguage) setPreferredLanguage(user.preferredLanguage);
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await authService.updateProfile({
        displayName,
        preferredLanguage
      });
      await refreshUser();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <User className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-extrabold text-white">Student Profile &amp; Settings</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage your account preferences and view connected AI telemetry.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={logout}
          icon={LogOut}
          className="text-rose-400 hover:text-rose-300 border-rose-500/20 hover:bg-rose-500/10"
        >
          Sign Out
        </Button>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Account Preferences</h3>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Student Name"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || 'student@codebuddy.local'}
                className="w-full bg-slate-950/50 border border-slate-800/60 rounded-xl px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Default Learning Language
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SUPPORTED_LANGUAGES.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setPreferredLanguage(l.id)}
                  className={`flex items-center space-x-2 p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    preferredLanguage === l.id
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/30'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{l.icon}</span>
                  <span>{l.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={saving}
              icon={Save}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* AI Telemetry & Diagnostics Card (Read-only) */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Configured AI Engine</h3>
          </div>
          <Badge variant={aiStatus.isHealthy ? 'emerald' : 'rose'}>
            {aiStatus.isHealthy ? 'Service Online' : 'Provider Offline'}
          </Badge>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Provider selection is configured server-side via backend environment variables. The frontend dynamically discovers the active model without exposing any private API credentials.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Active Provider</span>
            <span className="text-xs font-mono font-bold text-indigo-400 capitalize">{aiStatus.provider}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Model Identifier</span>
            <span className="text-xs font-mono font-bold text-slate-200">{aiStatus.model}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Health Status</span>
            <span className="text-xs font-mono text-emerald-400">
              {aiStatus.isHealthy ? 'Operational' : 'Check backend logs'}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
