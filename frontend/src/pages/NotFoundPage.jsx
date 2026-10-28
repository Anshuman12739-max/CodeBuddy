import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, ArrowLeft, Compass } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
        <Compass className="w-8 h-8 animate-pulse" />
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-white">404 - Page Not Found</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          The programming route or resource you are looking for does not exist in CodeBuddy AI.
        </p>
      </div>

      <Link to="/">
        <Button variant="primary" size="md" icon={ArrowLeft}>
          Return to Home
        </Button>
      </Link>
    </div>
  );
}
