import React from 'react';
import { Terminal, CheckCircle, Code2, ArrowRight } from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export default function ProblemCard({ problem, onSelect, isSelected = false }) {
  const difficultyColors = {
    Beginner: 'emerald',
    Intermediate: 'amber',
    Advanced: 'rose'
  };

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border cursor-pointer transition-all ${
        isSelected
          ? 'bg-indigo-950/30 border-indigo-500 shadow-md shadow-indigo-500/10'
          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Badge variant={difficultyColors[problem.difficulty] || 'indigo'}>
            {problem.difficulty}
          </Badge>
          <span className="text-xs font-mono uppercase text-slate-400">
            {problem.language}
          </span>
        </div>
        <span className="text-xs text-indigo-400 font-medium">{problem.topic}</span>
      </div>

      <h4 className="text-sm font-bold text-slate-100 mb-1 truncate">{problem.title}</h4>
      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
        {problem.description}
      </p>

      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
        <span className="text-slate-500 text-[11px]">
          {problem.created_at ? new Date(problem.created_at).toLocaleDateString() : 'New'}
        </span>
        <span className="text-indigo-400 font-medium flex items-center space-x-1 hover:underline">
          <span>Solve Challenge</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}
