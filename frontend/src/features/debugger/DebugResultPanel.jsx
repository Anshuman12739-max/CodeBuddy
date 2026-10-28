import React, { useState } from 'react';
import { Bug, Check, Copy, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export default function DebugResultPanel({ debugResult, isLoading, onApplyFix }) {
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4 rounded-xl border border-slate-800 bg-slate-900/40">
        <div className="w-10 h-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Investigating Bug...</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Analyzing stack traces, variable initialization, pointer boundaries, and syntax rules.
          </p>
        </div>
      </div>
    );
  }

  if (!debugResult) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center rounded-xl border border-slate-800/60 bg-slate-900/20 text-slate-400 space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <Bug className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200">Debug Assistant Ready</h3>
        <p className="text-xs max-w-sm text-slate-400">
          Paste your code and any compiler or runtime error message. CodeBuddy will find the root cause and provide a targeted correction.
        </p>
      </div>
    );
  }

  const handleCopyFix = () => {
    if (debugResult.suggestedFix) {
      navigator.clipboard.writeText(debugResult.suggestedFix);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4 overflow-y-auto max-h-[700px] pr-1">
      {/* Header Badge */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          {debugResult.isSyntaxError ? (
            <Badge variant="rose">Syntax Error</Badge>
          ) : (
            <Badge variant="amber">Logical / Runtime Issue</Badge>
          )}
          {debugResult.line && (
            <span className="text-slate-400 font-mono text-[11px]">
              Around Line {debugResult.line}
            </span>
          )}
        </div>
        <span className="font-mono text-slate-400 text-[11px]">
          {debugResult.provider}: {debugResult.model}
        </span>
      </div>

      {/* Problem Summary */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
        <div className="flex items-center space-x-2 text-rose-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <h4 className="text-sm font-bold text-slate-100">{debugResult.problem}</h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed pl-6">
          <span className="font-semibold text-slate-200">Root Cause: </span>
          {debugResult.cause}
        </p>
      </div>

      {/* Suggested Fix */}
      {debugResult.suggestedFix && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Recommended Correction</span>
            </h4>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleCopyFix}
                className="flex items-center space-x-1 px-2.5 py-1 rounded text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              {onApplyFix && (
                <button
                  type="button"
                  onClick={() => onApplyFix(debugResult.suggestedFix)}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded text-xs text-indigo-300 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Apply to Editor</span>
                </button>
              )}
            </div>
          </div>

          <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs font-mono text-emerald-300 overflow-x-auto">
            <code>{debugResult.suggestedFix}</code>
          </pre>

          <p className="text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-slate-200">Why this works: </span>
            {debugResult.explanation}
          </p>
        </div>
      )}

      {/* Prevention Tip */}
      {debugResult.preventionTip && (
        <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/30 space-y-1.5">
          <div className="flex items-center space-x-2 text-indigo-400">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <h4 className="text-xs font-semibold uppercase tracking-wider">Prevention Tip for Future</h4>
          </div>
          <p className="text-xs text-indigo-200 leading-relaxed pl-6">
            {debugResult.preventionTip}
          </p>
        </div>
      )}
    </div>
  );
}
