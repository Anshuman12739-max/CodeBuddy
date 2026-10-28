import React from 'react';
import { BookOpen, Bug, Terminal, CheckCircle2, Lightbulb, Clock } from 'lucide-react';

export default function ActivityStream({ activities = [] }) {
  if (activities.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        No recent activity logged. Use the explainer, debugger, or solve practice problems to track your learning journey!
      </div>
    );
  }

  const iconMap = {
    code_explained: { icon: BookOpen, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    debug_assisted: { icon: Bug, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
    problem_generated: { icon: Terminal, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
    hint_viewed: { icon: Lightbulb, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    problem_completed: { icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  };

  const labelMap = {
    code_explained: 'Explained Code',
    debug_assisted: 'Debugged Code',
    problem_generated: 'Generated Practice Problem',
    hint_viewed: 'Unlocked Hint',
    problem_completed: 'Completed Practice Problem',
  };

  return (
    <div className="space-y-3">
      {activities.map((act) => {
        const item = iconMap[act.activity_type] || iconMap.code_explained;
        const Icon = item.icon;

        return (
          <div
            key={act.id}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${item.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-semibold text-slate-200">
                  {labelMap[act.activity_type] || act.activity_type}
                </h5>
                <p className="text-[11px] text-slate-400">
                  {act.topic ? `${act.topic} • ` : ''}
                  <span className="uppercase font-mono">{act.language}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1 text-[11px] text-slate-500">
              <Clock className="w-3 h-3" />
              <span>
                {act.created_at ? new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
