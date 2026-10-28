import React from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Terminal,
  Bug,
  BookOpen,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Cpu,
  Layers
} from 'lucide-react';
import Button from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export default function LandingPage() {
  const features = [
    {
      icon: BookOpen,
      title: 'Line-by-Line Code Explainer',
      description: 'Break down complex logic into step-by-step beginner-friendly explanations. Understand scopes, memory, and control flow in Python, C, C++, and JS.',
      color: 'indigo',
      link: '/explainer'
    },
    {
      icon: Bug,
      title: 'AI Debugging Assistant',
      description: 'Pinpoint tricky bugs without guessing. Differentiate compiler syntax issues from runtime segmentation faults, with targeted minimal fixes.',
      color: 'rose',
      link: '/debugger'
    },
    {
      icon: Terminal,
      title: '5-Level Progressive Hints',
      description: 'Never spoil the answer! Unlock hints progressively: Conceptual -> Approach -> Pseudocode -> Partial Code -> Full Solution.',
      color: 'amber',
      link: '/practice'
    },
    {
      icon: MessageSquare,
      title: 'Context-Aware AI Tutor',
      description: 'Ask questions freely to your personalized CS mentor. Powered by local Gemma 3:1B or Google Gemini with persistent chat history.',
      color: 'violet',
      link: '/chat'
    }
  ];

  const languages = [
    { name: 'Python', icon: '🐍', desc: 'Indentation, list comprehensions, OOP & algorithms' },
    { name: 'C', icon: '⚙️', desc: 'Pointers, memory allocation, arrays & structs' },
    { name: 'C++', icon: '⚡', desc: 'STL vectors, references, templates & classes' },
    { name: 'JavaScript', icon: '🟨', desc: 'Closures, asynchronous promises, DOM & modern ES6+' },
  ];

  return (
    <div className="space-y-24 py-12 md:py-20 overflow-hidden">
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        {/* Glowing backdrop blurs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>The Pedagogical AI Coding Tutor for BTech CSE</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
          Learn to Code. <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-300">
            Understand the Logic.
          </span> <br />
          Build Confidence.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Don't just copy-paste solutions. CodeBuddy AI teaches you the foundational mental models behind Python, C, C++, and JavaScript through progressive guidance.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link to="/workspace">
            <Button size="lg" variant="primary">
              <span>Open Coding Workspace</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link to="/explainer">
            <Button size="lg" variant="secondary">
              <BookOpen className="w-4 h-4 mr-2" />
              <span>Try Code Explainer</span>
            </Button>
          </Link>
        </div>

        {/* Live Feature Teaser Cards */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          {languages.map((l) => (
            <div
              key={l.name}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md hover:border-indigo-500/40 transition-colors"
            >
              <span className="text-2xl mb-1 block">{l.icon}</span>
              <h4 className="text-sm font-bold text-slate-100">{l.name}</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">{l.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="indigo" className="mb-3">Master Core Competencies</Badge>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Designed for Real Conceptual Mastery
          </h2>
          <p className="text-sm text-slate-400 mt-3">
            Traditional AI gives away complete answers instantly, robbing students of learning opportunities. CodeBuddy AI coaches you through struggle to true comprehension.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="p-8 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md hover:border-slate-700 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  {f.description}
                </p>
                <Link
                  to={f.link}
                  className="inline-flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 space-x-1"
                >
                  <span>Launch Tool</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Progressive Hint Callout */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/40 via-slate-950 to-slate-950 text-center space-y-6 shadow-2xl">
          <Badge variant="amber">Pedagogical Guardrails</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            The 5-Level Progressive Hint Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Our backend enforces strict level-by-level hint revelation. The full solution is never transmitted until you make an explicit decision to unlock it.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-6 text-left">
            {[
              { lvl: '1', title: 'Conceptual', desc: 'Core CS principle' },
              { lvl: '2', title: 'Approach', desc: 'Step-by-step strategy' },
              { lvl: '3', title: 'Pseudocode', desc: 'High-level algorithm' },
              { lvl: '4', title: 'Partial Code', desc: 'Starting skeleton' },
              { lvl: '5', title: 'Full Solution', desc: 'Walkthrough & edges' },
            ].map((step) => (
              <div key={step.lvl} className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs font-mono font-bold text-indigo-400">Step {step.lvl}</span>
                <h4 className="text-xs font-bold text-slate-200 mt-0.5">{step.title}</h4>
                <p className="text-[10px] text-slate-400 mt-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
