import React from 'react';

export function Badge({ children, variant = 'indigo', className = '' }) {
  const variants = {
    indigo: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    violet: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant] || variants.indigo} ${className}`}>
      {children}
    </span>
  );
}

export function Alert({ type = 'info', title, message, onClose, className = '' }) {
  const types = {
    info: 'bg-indigo-950/40 border-indigo-500/40 text-indigo-200',
    success: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200',
    warning: 'bg-amber-950/40 border-amber-500/40 text-amber-200',
    error: 'bg-rose-950/40 border-rose-500/40 text-rose-200',
  };

  return (
    <div className={`p-4 rounded-xl border ${types[type]} ${className}`}>
      {title && <h4 className="font-semibold text-sm mb-1">{title}</h4>}
      <p className="text-xs leading-relaxed">{message}</p>
    </div>
  );
}

export function LoadingSpinner({ text = 'Thinking...', size = 'md' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className={`${sizes[size]} border-2 border-indigo-500 border-t-transparent rounded-full animate-spin`} />
      {text && <span className="text-xs text-slate-400 font-medium animate-pulse">{text}</span>}
    </div>
  );
}
