import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Flame,
  CheckCircle2,
  HelpCircle,
  Code2,
  BookOpen,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Terminal
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import StatCard from '../features/dashboard/StatCard';
import LanguageRadarChart from '../features/dashboard/LanguageRadarChart';
import TopicProgressChart from '../features/dashboard/TopicProgressChart';
import ActivityStream from '../features/dashboard/ActivityStream';
import Button from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [statsRes, actRes] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getActivity()
        ]);
        setStats(statsRes.data);
        setActivities(actRes.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400 animate-pulse">Computing your learning analytics...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <LayoutDashboard className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-extrabold text-white">Student Learning Dashboard</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real telemetry derived from your code explanations, debugging sessions, and practice challenges.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link to="/workspace">
            <Button size="sm" variant="primary">
              <Code2 className="w-4 h-4 mr-1.5" />
              Open Coding Workspace
            </Button>
          </Link>
          <Link to="/practice">
            <Button size="sm" variant="secondary">
              <Terminal className="w-4 h-4 mr-1.5" />
              Practice Problems
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Learning Streak"
          value={`${stats?.streakDays || 0} Days`}
          subtitle="Consecutive active days"
          icon={Flame}
          color="amber"
        />
        <StatCard
          title="Problems Completed"
          value={stats?.problemsCompleted || 0}
          subtitle={`Out of ${stats?.totalAttempts || 0} total attempts`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Questions Asked"
          value={stats?.questionsAsked || 0}
          subtitle="AI tutoring interactions"
          icon={HelpCircle}
          color="indigo"
        />
        <StatCard
          title="Practice Attempts"
          value={stats?.totalAttempts || 0}
          subtitle="Code submissions & evaluations"
          icon={TrendingUp}
          color="violet"
        />
      </div>

      {/* Empty State for brand new users */}
      {stats?.isEmpty && (
        <div className="p-8 rounded-2xl border border-indigo-500/20 bg-indigo-950/20 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Welcome to CodeBuddy AI!</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            You haven't recorded any practice attempts or questions yet. Start exploring the tools below to watch your learning statistics grow in real time!
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link to="/explainer">
              <Button size="sm" variant="primary">Explain Some Code</Button>
            </Link>
            <Link to="/practice">
              <Button size="sm" variant="secondary">Solve a Problem</Button>
            </Link>
          </div>
        </div>
      )}

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Language Mastery Radar */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Language Engagement</h3>
              <p className="text-xs text-slate-400">Distribution of activities across Python, C, C++, and JS</p>
            </div>
            <Badge variant="indigo">Telemetry</Badge>
          </div>
          <LanguageRadarChart topLanguages={stats?.topLanguages || []} />
        </div>

        {/* Topic Mastery Bar Chart */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Topic Progression</h3>
              <p className="text-xs text-slate-400">Computer Science topics practiced recently</p>
            </div>
            <Badge variant="violet">Mastery</Badge>
          </div>
          <TopicProgressChart recentTopics={stats?.recentTopics || []} />
        </div>

      </div>

      {/* Suggested Topics & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Suggested Next Topics */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold text-white">Recommended Next Topics</h3>
          <p className="text-xs text-slate-400">
            Based on foundational CS curricula, consider mastering these next:
          </p>

          <div className="space-y-2.5">
            {(stats?.suggestedNextTopics || ['Variables', 'Conditional statements', 'Loops']).map((topic, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                    {i + 1}
                  </span>
                  <span className="text-slate-200 font-medium">{topic}</span>
                </div>
                <Link
                  to={`/practice?topic=${encodeURIComponent(topic)}`}
                  className="text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Generate &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Learning Activity Log */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Recent Learning Stream</h3>
            <span className="text-xs text-slate-400">Last 20 events</span>
          </div>
          <ActivityStream activities={activities} />
        </div>

      </div>

    </div>
  );
}
