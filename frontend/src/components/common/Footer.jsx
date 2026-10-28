import React from 'react';
import { Code2, Heart, Github, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 text-slate-400 text-xs py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center space-x-2">
          <Code2 className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-slate-300">CodeBuddy AI</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Learn to Code. Understand the Logic. Build Confidence.</span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1 text-slate-400">
            <span>Powered by</span>
            <span className="text-indigo-400 font-mono">Gemma 3:1B</span>
            <span>&amp;</span>
            <span className="text-violet-400 font-mono">Gemini</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center space-x-1">
            <span>Built for BTech CSE Students</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </span>
        </div>

      </div>
    </footer>
  );
}
