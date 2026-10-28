import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo' }) {
  const colorMap = {
    indigo: 'from-indigo-600/20 to-indigo-900/10 border-indigo-500/20 text-indigo-400',
    violet: 'from-violet-600/20 to-violet-900/10 border-violet-500/20 text-violet-400',
    emerald: 'from-emerald-600/20 to-emerald-900/10 border-emerald-500/20 text-emerald-400',
    amber: 'from-amber-600/20 to-amber-900/10 border-amber-500/20 text-amber-400',
  };

  return (
    <div className={`p-5 rounded-2xl border bg-gradient-to-br ${colorMap[color] || colorMap.indigo} shadow-sm backdrop-blur-sm transition-transform hover:-translate-y-0.5`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">{title}</span>
        {Icon && (
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline space-x-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{value}</span>
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
      )}
    </div>
  );
}
