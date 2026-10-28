import React, { useState } from 'react';
import { Lightbulb, Lock, Unlock, Eye, Sparkles, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import Button from '../../components/common/Button';
import { aiService } from '../../services/aiService';

const HINT_LEVELS = [
  { level: 1, name: 'Conceptual Hint', description: 'Underlying programming concept without algorithm details' },
  { level: 2, name: 'Approach Hint', description: 'Step-by-step strategic algorithm thought process' },
  { level: 3, name: 'Pseudocode', description: 'High-level algorithmic pseudocode structure' },
  { level: 4, name: 'Partial Code Skeleton', description: 'Starter code snippet showing key loop or condition' },
  { level: 5, name: 'Full Solution', description: 'Complete working solution with step-by-step walkthrough' }
];

export default function HintProgression({
  problem,
  studentCode,
  onHintUnlocked,
  initialHints = {},
  initialLevel = 0
}) {
  const [unlockedLevel, setUnlockedLevel] = useState(initialLevel);
  const [hints, setHints] = useState(initialHints); // { 1: hintData, 2: hintData, ... }
  const [solution, setSolution] = useState(null);
  const [loadingLevel, setLoadingLevel] = useState(null);
  const [solutionModalOpen, setSolutionModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchNextHint = async (targetLevel) => {
    if (targetLevel > 4) return;
    setError(null);
    setLoadingLevel(targetLevel);

    try {
      const res = await aiService.getHint(
        targetLevel,
        {
          title: problem.title,
          description: problem.description,
          language: problem.language
        },
        studentCode,
        problem.id
      );

      const hintData = res.data;
      setHints(prev => ({ ...prev, [targetLevel]: hintData }));
      setUnlockedLevel(prev => Math.max(prev, targetLevel));

      if (onHintUnlocked) {
        onHintUnlocked(targetLevel, { ...hints, [targetLevel]: hintData });
      }
    } catch (err) {
      setError(err.message || 'Failed to generate hint. Please retry.');
    } finally {
      setLoadingLevel(null);
    }
  };

  const fetchFullSolution = async () => {
    setError(null);
    setLoadingLevel(5);
    setSolutionModalOpen(false);

    try {
      const res = await aiService.getFullSolution(
        {
          title: problem.title,
          description: problem.description,
          language: problem.language
        },
        problem.id
      );

      const solData = res.data;
      setSolution(solData);
      setUnlockedLevel(5);

      if (onHintUnlocked) {
        onHintUnlocked(5, { ...hints, 5: solData });
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve full solution.');
    } finally {
      setLoadingLevel(null);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-100">Progressive Hint System</h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Unlocked: {unlockedLevel}/5
        </span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        Hints are calibrated sequentially. Try to solve the problem after each hint to maximize learning retention.
      </p>

      {error && (
        <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/40 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Levels 1 to 4 */}
      <div className="space-y-2.5">
        {HINT_LEVELS.slice(0, 4).map((lvl) => {
          const isUnlocked = unlockedLevel >= lvl.level;
          const isNext = unlockedLevel === lvl.level - 1;
          const hintData = hints[lvl.level];
          const isLoading = loadingLevel === lvl.level;

          return (
            <div
              key={lvl.level}
              className={`rounded-lg border transition-all ${
                isUnlocked
                  ? 'bg-slate-950/80 border-slate-700/80'
                  : isNext
                  ? 'bg-slate-900/80 border-indigo-500/30'
                  : 'bg-slate-950/30 border-slate-800/50 opacity-60'
              }`}
            >
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isUnlocked
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isNext
                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isUnlocked ? <CheckCircle className="w-3.5 h-3.5" /> : lvl.level}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">
                      Level {lvl.level}: {lvl.name}
                    </h4>
                    <p className="text-[11px] text-slate-400">{lvl.description}</p>
                  </div>
                </div>

                <div>
                  {!isUnlocked && isNext && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => fetchNextHint(lvl.level)}
                      isLoading={isLoading}
                    >
                      <Unlock className="w-3.5 h-3.5 mr-1" />
                      Reveal Hint {lvl.level}
                    </Button>
                  )}

                  {!isUnlocked && !isNext && (
                    <span className="flex items-center text-xs text-slate-500 space-x-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Locked</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Unlocked Hint Content */}
              {isUnlocked && hintData && (
                <div className="px-3.5 pb-3.5 pt-1 text-xs text-slate-300 border-t border-slate-800/60 mt-1 space-y-2">
                  <p className="leading-relaxed">{hintData.hint}</p>
                  {hintData.codeSnippet && (
                    <pre className="p-2 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-indigo-300 overflow-x-auto">
                      <code>{hintData.codeSnippet}</code>
                    </pre>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Level 5: Full Solution (Explicit Gate) */}
      <div className="pt-2 border-t border-slate-800">
        {unlockedLevel < 5 && !solution ? (
          <div className="p-3.5 rounded-lg border border-amber-500/20 bg-amber-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>Level 5: Full Solution (Reveals Complete Code)</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Only unlock if you are completely stuck. Will walk through the full code.
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setSolutionModalOpen(true)}
              className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 shrink-0"
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              Request Full Solution
            </Button>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-indigo-500/30 bg-slate-950 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-indigo-400 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Level 5: Full Solution</span>
              </h4>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(solution?.solutionCode || '');
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
              <code>{solution?.solutionCode}</code>
            </pre>

            <p className="text-xs text-slate-300 leading-relaxed">
              {solution?.explanation}
            </p>

            {solution?.timeComplexity && (
              <div className="flex items-center space-x-4 text-[11px] text-slate-400 font-mono">
                <span>Time: {solution.timeComplexity}</span>
                <span>Space: {solution.spaceComplexity || 'O(1)'}</span>
              </div>
            )}

            <p className="text-[10px] text-slate-500 italic">
              Disclaimer: {solution?.disclaimer || 'AI-generated code may contain nuances. Always test your code.'}
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Solution */}
      {solutionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-2 text-amber-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Reveal Full Solution?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              We strongly encourage trying hints 1 through 4 first! Independent debugging is the fastest way to build programming confidence.
              <br /><br />
              Are you sure you want to view the complete solution now?
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSolutionModalOpen(false)}
              >
                Keep Trying
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={fetchFullSolution}
                isLoading={loadingLevel === 5}
              >
                Yes, Reveal Solution
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
