import React, { useState } from 'react';
import { BookOpen, Sparkles, AlertCircle, Info } from 'lucide-react';
import CodeEditor from '../components/editor/CodeEditor';
import ExplanationPanel from '../features/explainer/ExplanationPanel';
import Button from '../components/common/Button';
import { aiService } from '../services/aiService';
import { STARTER_CODE } from '../utils/constants';

export default function ExplainerPage() {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(STARTER_CODE.python);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(STARTER_CODE[newLang] || '');
    setExplanation(null);
  };

  const handleExplain = async () => {
    if (!code.trim()) {
      setError('Please provide some code to explain.');
      return;
    }

    if (code.length > 12000) {
      setError('Code exceeds 12,000 characters limit. Please submit a shorter snippet.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await aiService.explainCode(language, code);
      setExplanation(res.data);
    } catch (err) {
      setError(err.message || 'Failed to explain code. Please check your AI provider.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">AI Code Explainer</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Demystify complex syntax, algorithms, memory models, and control flow line by line.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleExplain}
          isLoading={loading}
          icon={Sparkles}
        >
          Explain My Code
        </Button>
      </div>

      {/* Safety notice banner */}
      <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
        <Info className="w-4 h-4 text-indigo-400 shrink-0" />
        <span>
          Pedagogical Static Analysis: Code is analyzed semantically by AI without arbitrary server-side execution.
        </span>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Split Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: Code Editor */}
        <div className="h-[620px] flex flex-col">
          <CodeEditor
            language={language}
            value={code}
            onChange={setCode}
            onLanguageChange={handleLanguageChange}
            height="560px"
          />
        </div>

        {/* Right: AI Explanation Panel */}
        <div className="h-[620px] rounded-xl border border-slate-800 bg-slate-950/80 p-4 overflow-y-auto">
          <ExplanationPanel explanation={explanation} isLoading={loading} />
        </div>
      </div>

    </div>
  );
}
