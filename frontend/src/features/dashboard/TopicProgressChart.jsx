import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function TopicProgressChart({ recentTopics = [] }) {
  if (recentTopics.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-500">
        No topic activity logged yet. Practice problems to view mastery!
      </div>
    );
  }

  const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

  const data = recentTopics.map(t => ({
    topic: t.topic.length > 14 ? t.topic.slice(0, 14) + '...' : t.topic,
    fullTopic: t.topic,
    exercises: t.count
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <XAxis
            dataKey="topic"
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            angle={-15}
            textAnchor="end"
            interval={0}
          />
          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value, name, item) => [value, item.payload.fullTopic]}
          />
          <Bar dataKey="exercises" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
