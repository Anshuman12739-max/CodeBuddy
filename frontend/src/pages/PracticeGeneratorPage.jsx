import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Terminal, Sparkles, AlertCircle, BookmarkPlus, ArrowRight, Layers } from 'lucide-react';
import Button from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import ProblemCard from '../features/practice/ProblemCard';
import { aiService } from '../services/aiService';
import { practiceService } from '../services/practiceService';
import { TOPICS, DIFFICULTIES, SUPPORTED_LANGUAGES } from '../utils/constants';

export default function PracticeGeneratorPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [language, setLanguage] = useState('python');
  const [topic, setTopic] = useState(searchParams.get('topic') || TOPICS[0]);
  const [difficulty, setDifficulty] = useState('Beginner');
  const [generating, setGenerating] = useState(false);
  const [generatedProblem, setGeneratedProblem] = useState(null);
  const [savedProblems, setSavedProblems] = useState([]);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadSavedProblems();
  }, []);

  const loadSavedProblems = async () => {
    try {
      const res = await practiceService.getProblems();
      setSavedProblems(res.data || []);
    } catch (err) {
      console.warn('Could not load saved problems:', err.message);
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setSaveSuccess(false);
    setGenerating(true);

    try {
      const res = await aiService.generatePracticeProblem(language, topic, difficulty);
      setGeneratedProblem(res.data);
    } catch (err) {
      setError(err.message || 'Failed to generate practice challenge.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveAndSolve = async () => {
    if (!generatedProblem) return;

    try {
      const res = await practiceService.saveProblem({
        language: generatedProblem.language,
        topic: generatedProblem.topic,
        difficulty: generatedProblem.difficulty,
        title: generatedProblem.title,
        description: generatedProblem.description,
        inputDescription: generatedProblem.inputDescription,
        outputDescription: generatedProblem.outputDescription,
        constraints: generatedProblem.constraints,
        sampleInput: generatedProblem.sampleInput,
        sampleOutput: generatedProblem.sampleOutput,
        conceptPracticed: generatedProblem.conceptPracticed
      });

      const savedId = res.data?.id;
      if (savedId) {
        navigate(`/workspace?problemId=${savedId}`);
      } else {
        // Dev fallback
        navigate('/workspace');
      }
    } catch (err) {
      setError(err.message || 'Failed to save problem.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Terminal className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-extrabold text-white">AI Practice Problem Generator</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Target specific computer science concepts and generate customized challenges with automated test cases.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Generator Form */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Configure Challenge</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          {/* Language Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Language
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SUPPORTED_LANGUAGES.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLanguage(l.id)}
                  className={`flex items-center space-x-2 p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    language === l.id
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500 shadow-sm shadow-indigo-500/20'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{l.icon}</span>
                  <span>{l.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Topic Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Topic
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              {TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Difficulty
            </label>
            <div className="flex space-x-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    difficulty === d
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/30'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

        </div>

        <div className="flex justify-end pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={handleGenerate}
            isLoading={generating}
            icon={Sparkles}
          >
            Generate Challenge
          </Button>
        </div>
      </div>

      {/* Generated Problem Preview */}
      {generatedProblem && (
        <div className="p-6 rounded-2xl border border-indigo-500/30 bg-slate-900/90 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Badge variant="indigo">{generatedProblem.difficulty}</Badge>
                <span className="text-xs font-mono uppercase text-slate-400">
                  {generatedProblem.language}
                </span>
                <span className="text-xs text-indigo-400 font-medium">
                  {generatedProblem.topic}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">{generatedProblem.title}</h2>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveAndSolve}
              icon={ArrowRight}
            >
              Solve in Workspace
            </Button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {generatedProblem.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Input Format</span>
              <p className="text-xs text-slate-300">{generatedProblem.inputDescription || 'Standard input'}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Output Format</span>
              <p className="text-xs text-slate-300">{generatedProblem.outputDescription || 'Standard output'}</p>
            </div>
          </div>

          {generatedProblem.sampleInput && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Sample Input</span>
                <pre className="text-xs font-mono text-indigo-300">{generatedProblem.sampleInput}</pre>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Sample Output</span>
                <pre className="text-xs font-mono text-emerald-300">{generatedProblem.sampleOutput}</pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Saved / Recent Practice Problems */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Your Generated Practice Library</span>
          </h3>
          <span className="text-xs text-slate-500">{savedProblems.length} saved</span>
        </div>

        {savedProblems.length === 0 ? (
          <div className="p-8 rounded-xl border border-slate-800/60 bg-slate-900/30 text-center text-xs text-slate-500">
            No saved practice problems yet. Generate a challenge above to begin solving!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedProblems.map((prob) => (
              <ProblemCard
                key={prob.id}
                problem={prob}
                onSelect={() => navigate(`/workspace?problemId=${prob.id}`)}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
