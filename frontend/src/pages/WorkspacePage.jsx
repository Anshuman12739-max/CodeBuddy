import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Code2,
  Terminal,
  BookOpen,
  Bug,
  Lightbulb,
  CheckCircle2,
  Sparkles,
  Layers,
  Check,
  AlertCircle
} from 'lucide-react';
import CodeEditor from '../components/editor/CodeEditor';
import HintProgression from '../features/practice/HintProgression';
import ExplanationPanel from '../features/explainer/ExplanationPanel';
import DebugResultPanel from '../features/debugger/DebugResultPanel';
import Button from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { practiceService } from '../services/practiceService';
import { aiService } from '../services/aiService';
import { STARTER_CODE } from '../utils/constants';

export default function WorkspacePage() {
  const [searchParams] = useSearchParams();
  const problemId = searchParams.get('problemId');

  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(STARTER_CODE.python);
  const [problem, setProblem] = useState(null);
  const [activeTab, setActiveTab] = useState('problem'); // 'problem' | 'hints' | 'explain' | 'debug'
  
  // AI Results
  const [explanation, setExplanation] = useState(null);
  const [debugResult, setDebugResult] = useState(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isDebugging, setIsDebugging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    if (problemId) {
      loadProblem(problemId);
    }
  }, [problemId]);

  const loadProblem = async (id) => {
    try {
      const res = await practiceService.getProblemById(id);
      const probData = res.data;
      if (probData) {
        setProblem(probData);
        setLanguage(probData.language || 'python');
        if (probData.attempt?.submitted_code) {
          setCode(probData.attempt.submitted_code);
        } else {
          setCode(STARTER_CODE[probData.language] || '');
        }
        if (probData.attempt?.completed) {
          setCompleted(true);
        }
      }
    } catch (err) {
      console.warn('Could not load specific problem:', err.message);
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(STARTER_CODE[newLang] || '');
  };

  const handleExplain = async () => {
    setActiveTab('explain');
    setIsExplaining(true);
    setStatusMessage(null);
    try {
      const res = await aiService.explainCode(language, code);
      setExplanation(res.data);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to explain code.' });
    } finally {
      setIsExplaining(false);
    }
  };

  const handleDebug = async () => {
    setActiveTab('debug');
    setIsDebugging(true);
    setStatusMessage(null);
    try {
      const res = await aiService.debugCode(language, code, '', 'Expected correct algorithmic solution');
      setDebugResult(res.data);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to debug code.' });
    } finally {
      setIsDebugging(false);
    }
  };

  const handleSubmitAttempt = async (isComplete = false) => {
    if (!problem?.id) {
      setStatusMessage({ type: 'info', text: 'Practice problem is not saved. Save it from Practice Generator to log completions.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await practiceService.submitAttempt(problem.id, {
        submittedCode: code,
        completed: isComplete
      });
      if (isComplete) {
        setCompleted(true);
        setStatusMessage({ type: 'success', text: 'Problem marked as completed! Stats updated in dashboard.' });
      } else {
        setStatusMessage({ type: 'success', text: 'Progress draft saved successfully.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save attempt.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 flex-1">
      
      {/* Top Workspace Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
              <span>{problem ? problem.title : 'Interactive Coding Workspace'}</span>
              {completed && (
                <Badge variant="emerald" className="text-[10px]">
                  Completed
                </Badge>
              )}
            </h1>
            <p className="text-xs text-slate-400">
              {problem ? `${problem.topic} • ${problem.difficulty}` : 'Freeform experimentation and AI guided debugging'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExplain}
            isLoading={isExplaining}
            icon={BookOpen}
          >
            Explain
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDebug}
            isLoading={isDebugging}
            icon={Bug}
          >
            Debug
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleSubmitAttempt(false)}
            isLoading={isSubmitting}
          >
            Save Draft
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleSubmitAttempt(true)}
            isLoading={isSubmitting}
            icon={CheckCircle2}
          >
            Mark Solved
          </Button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center justify-between ${
            statusMessage.type === 'error'
              ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              : statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-300'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Monaco Editor (7 Cols on desktop) */}
        <div className="lg:col-span-7 h-[680px]">
          <CodeEditor
            language={language}
            value={code}
            onChange={setCode}
            onLanguageChange={problem ? null : handleLanguageChange}
            height="620px"
          />
        </div>

        {/* Right Tabbed Panel (5 Cols on desktop) */}
        <div className="lg:col-span-5 h-[680px] rounded-xl border border-slate-800 bg-slate-950/80 flex flex-col overflow-hidden">
          
          {/* Tabs Navigation */}
          <div className="flex items-center border-b border-slate-800 bg-slate-900/90 px-2 pt-2 gap-1 overflow-x-auto">
            {problem && (
              <button
                type="button"
                onClick={() => setActiveTab('problem')}
                className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center space-x-1.5 ${
                  activeTab === 'problem'
                    ? 'bg-slate-950 text-indigo-400 border-t-2 border-indigo-500'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Problem</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('hints')}
              className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center space-x-1.5 ${
                activeTab === 'hints'
                  ? 'bg-slate-950 text-indigo-400 border-t-2 border-indigo-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Progressive Hints</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('explain')}
              className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center space-x-1.5 ${
                activeTab === 'explain'
                  ? 'bg-slate-950 text-indigo-400 border-t-2 border-indigo-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Explanation</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('debug')}
              className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center space-x-1.5 ${
                activeTab === 'debug'
                  ? 'bg-slate-950 text-rose-400 border-t-2 border-rose-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bug className="w-3.5 h-3.5" />
              <span>Debugger</span>
            </button>
          </div>

          {/* Tab Body */}
          <div className="flex-1 p-4 overflow-y-auto">
            {activeTab === 'problem' && problem && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="indigo">{problem.difficulty}</Badge>
                  <span className="text-xs text-indigo-400 font-medium">{problem.topic}</span>
                </div>
                <h3 className="text-base font-bold text-white">{problem.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{problem.description}</p>

                {(problem.input_description || problem.inputDescription) && (
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Input</span>
                    <p className="text-xs text-slate-200">{problem.input_description || problem.inputDescription}</p>
                  </div>
                )}

                {(problem.output_description || problem.outputDescription) && (
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Output</span>
                    <p className="text-xs text-slate-200">{problem.output_description || problem.outputDescription}</p>
                  </div>
                )}

                {(problem.sample_input || problem.sampleInput) && (
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Sample Case</span>
                    <pre className="text-xs font-mono text-indigo-300">{problem.sample_input || problem.sampleInput}</pre>
                    {(problem.sample_output || problem.sampleOutput) && (
                      <pre className="text-xs font-mono text-emerald-300 mt-2">{problem.sample_output || problem.sampleOutput}</pre>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'hints' && (
              <HintProgression
                problem={
                  problem || {
                    id: 'adhoc-prob',
                    title: 'Current Code Practice',
                    description: 'Freeform practice problem in workspace',
                    language
                  }
                }
                studentCode={code}
              />
            )}

            {activeTab === 'explain' && (
              <ExplanationPanel explanation={explanation} isLoading={isExplaining} />
            )}

            {activeTab === 'debug' && (
              <DebugResultPanel
                debugResult={debugResult}
                isLoading={isDebugging}
                onApplyFix={(fix) => setCode(fix)}
              />
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
