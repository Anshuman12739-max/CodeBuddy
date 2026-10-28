import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

export default function LanguageRadarChart({ topLanguages = [] }) {
  // Ensure all 4 languages are represented
  const allLangs = ['python', 'c', 'cpp', 'javascript'];
  const langMap = {
    python: 'Python',
    c: 'C',
    cpp: 'C++',
    javascript: 'JavaScript'
  };

  const counts = {};
  topLanguages.forEach(l => {
    counts[l.language] = l.count;
  });

  const data = allLangs.map(l => ({
    subject: langMap[l] || l,
    activities: counts[l] || 0,
    fullMark: Math.max(...Object.values(counts), 10)
  }));

  return (
    <div className="w-full h-64 flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="#475569" tick={{ fill: '#64748b', fontSize: 9 }} />
          <Radar
            name="Activities"
            dataKey="activities"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.4}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
