import React from 'react';
import { BookOpen, Sparkles, CheckCircle2, Lightbulb, Code2 } from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export default function ExplanationPanel({ explanation, isLoading }) {
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4 rounded-xl border border-slate-800 bg-slate-900/40">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Analyzing Code Structure...</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            CodeBuddy AI is parsing abstract syntax trees, identifying variables, loops, and control flow.
          </p>
        </div>
      </div>
    );
  }

  if (!explanation) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center rounded-xl border border-slate-800/60 bg-slate-900/20 text-slate-400 space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <BookOpen className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200">Ready to Explain</h3>
        <p className="text-xs max-w-sm text-slate-400">
          Write or paste your code in the editor, select the language, and click <span className="text-indigo-400 font-medium">Explain My Code</span> to receive a step-by-step breakdown.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 overflow-y-auto max-h-[700px] pr-1">
      {/* AI Model Header */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-xs">
        <span className="flex items-center space-x-1.5 text-indigo-300 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>AI Pedagogical Analysis</span>
        </span>
        <span className="font-mono text-indigo-400/80">
          {explanation.provider}: {explanation.model}
        </span>
      </div>

      {/* Program Summary */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 shadow-sm">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Program Summary</h4>
        <p className="text-sm text-slate-200 leading-relaxed">{explanation.summary}</p>
        
        {/* Core Concepts */}
        {explanation.concepts && explanation.concepts.length > 0 && (
          <div className="pt-2 flex flex-wrap gap-1.5">
            {explanation.concepts.map((concept, idx) => (
              <Badge key={idx} variant="indigo">
                {concept}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Line-by-Line Breakdown */}
      {explanation.lineByLine && explanation.lineByLine.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Line-by-Line Breakdown
          </h4>
          <div className="space-y-2">
            {explanation.lineByLine.map((step, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center space-x-2 mb-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-400">
                    Line {step.line || idx + 1}
                  </span>
                  <code className="text-xs font-mono text-slate-300 truncate max-w-[280px]">
                    {step.code}
                  </code>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-1">
                  {step.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Example & Takeaway */}
      {explanation.relatedExample && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
              {explanation.relatedExample.title || 'Related Concept & Pattern'}
            </h4>
          </div>

          {explanation.relatedExample.code && (
            <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-300 overflow-x-auto">
              <code>{explanation.relatedExample.code}</code>
            </pre>
          )}

          <p className="text-xs text-slate-300 italic">
            💡 Takeaway: {explanation.relatedExample.takeaway}
          </p>
        </div>
      )}
    </div>
  );
}
