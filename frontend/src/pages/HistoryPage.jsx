import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, CheckCircle2, Clock, Code2, ArrowRight, Lightbulb } from 'lucide-react';
import { practiceService } from '../services/practiceService';
import { Badge } from '../components/common/Badge';
import Button from '../components/common/Button';

export default function HistoryPage() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLang, setFilterLang] = useState('all');

  useEffect(() => {
    loadAttempts();
  }, []);

  const loadAttempts = async () => {
    try {
      setLoading(true);
      const res = await practiceService.getAttempts();
      setAttempts(res.data || []);
    } catch (err) {
      console.warn('Failed to load attempts:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = attempts.filter(a => {
    if (filterLang === 'all') return true;
    const lang = a.practice_problems?.language || 'python';
    return lang === filterLang;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <History className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-extrabold text-white">Learning History &amp; Submissions</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review your past practice attempts, unlocked hints, and completed problems.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Filter:</span>
          <select
            value={filterLang}
            onChange={(e) => setFilterLang(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Languages</option>
            <option value="python">Python</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="javascript">JavaScript</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
          Loading learning history...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/30 space-y-3">
          <History className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No attempts found</h3>
          <p className="text-xs text-slate-500">
            Generate and solve practice challenges to build your portfolio of learning history!
          </p>
          <Link to="/practice">
            <Button size="sm" variant="primary">Go to Practice</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((att) => (
            <div
              key={att.id}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <Badge variant={att.completed ? 'emerald' : 'amber'}>
                    {att.completed ? 'Completed' : 'In Progress'}
                  </Badge>
                  <span className="text-xs font-mono uppercase text-slate-400">
                    {att.practice_problems?.language || 'Code'}
                  </span>
                  {att.practice_problems?.difficulty && (
                    <Badge variant="indigo">{att.practice_problems.difficulty}</Badge>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white">
                  {att.practice_problems?.title || 'Practice Challenge Attempt'}
                </h4>

                <div className="flex items-center space-x-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center space-x-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>{att.hints_used || 0}/5 hints unlocked</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{new Date(att.updated_at || att.created_at).toLocaleDateString()}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Link to={`/workspace?problemId=${att.problem_id}`}>
                  <Button size="sm" variant="secondary" icon={ArrowRight}>
                    Resume / Review
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
