import React, { useState } from 'react';
import { Bug, Sparkles, AlertCircle, Wrench, RefreshCw, HelpCircle } from 'lucide-react';
import CodeEditor from '../components/editor/CodeEditor';
import DebugResultPanel from '../features/debugger/DebugResultPanel';
import Button from '../components/common/Button';
import { aiService } from '../services/aiService';

const BUGGY_EXAMPLES = {
  python: {
    code: `def calculate_average(grades):\n    total = 0\n    for g in grades:\n        total += g\n    return total / len(grades)\n\n# Test with empty list\nstudent_grades = []\nprint("Average:", calculate_average(student_grades))`,
    error: `ZeroDivisionError: division by zero`,
    expected: `Should handle empty list safely and return 0 or None.`
  },
  c: {
    code: `#include <stdio.h>\n\nint main() {\n    int *ptr = NULL;\n    *ptr = 42; // Dereferencing NULL\n    printf("%d\\n", *ptr);\n    return 0;\n}`,
    error: `Segmentation fault (core dumped)`,
    expected: `Safely assign an integer address before writing to ptr.`
  },
  cpp: {
    code: `#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> nums = {1, 2, 3};\n    // Out of bounds index\n    std::cout << nums[5] << std::endl;\n    return 0;\n}`,
    error: `Undefined behavior / crash on accessing index 5 of size 3 vector`,
    expected: `Validate index is within [0, nums.size() - 1].`
  },
  javascript: {
    code: `const users = [{ name: "Alice" }, { name: "Bob" }];\n\nfunction getFirstEmail(userList) {\n    return userList[0].contact.email;\n}\n\nconsole.log(getFirstEmail(users));`,
    error: `TypeError: Cannot read properties of undefined (reading 'email')`,
    expected: `Safely check for optional contact before reading email.`
  }
};

export default function DebuggerPage() {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(BUGGY_EXAMPLES.python.code);
  const [errorMessage, setErrorMessage] = useState(BUGGY_EXAMPLES.python.error);
  const [expectedBehavior, setExpectedBehavior] = useState(BUGGY_EXAMPLES.python.expected);
  const [debugResult, setDebugResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const sample = BUGGY_EXAMPLES[newLang] || BUGGY_EXAMPLES.python;
    setCode(sample.code);
    setErrorMessage(sample.error);
    setExpectedBehavior(sample.expected);
    setDebugResult(null);
  };

  const handleDebug = async () => {
    if (!code.trim()) {
      setError('Please provide source code to debug.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await aiService.debugCode(language, code, errorMessage, expectedBehavior);
      setDebugResult(res.data);
    } catch (err) {
      setError(err.message || 'Failed to analyze bug. Check your AI service.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFix = (fixCode) => {
    setCode(fixCode);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Bug className="w-6 h-6 text-rose-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">AI Debugging Assistant</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Isolate segmentation faults, runtime exceptions, wild pointers, and syntax discrepancies with educational fixes.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleLanguageChange(language)}
            icon={RefreshCw}
          >
            Load Bug Example
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleDebug}
            isLoading={loading}
            icon={Sparkles}
          >
            Debug Code
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: Inputs on Left, AI Diagnosis on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Left Column: Code + Error Message + Expected Behavior */}
        <div className="space-y-4">
          <div className="h-[420px]">
            <CodeEditor
              language={language}
              value={code}
              onChange={setCode}
              onLanguageChange={handleLanguageChange}
              height="360px"
              title="Buggy Code"
            />
          </div>

          <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Compiler / Runtime Error Message (Optional)
              </label>
              <textarea
                value={errorMessage}
                onChange={(e) => setErrorMessage(e.target.value)}
                placeholder="e.g., IndexError: list index out of range or Segmentation Fault"
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-rose-200 placeholder-slate-600 font-mono focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                What were you trying to achieve? (Expected Behavior)
              </label>
              <input
                type="text"
                value={expectedBehavior}
                onChange={(e) => setExpectedBehavior(e.target.value)}
                placeholder="e.g., Sum elements without crashing on empty inputs"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                onClick={handleDebug}
                isLoading={loading}
              >
                Explain Error
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDebug}
                isLoading={loading}
              >
                Suggest a Fix
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDebug}
                isLoading={loading}
              >
                Try Another Approach
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Debug Result Panel */}
        <div className="h-[640px] rounded-xl border border-slate-800 bg-slate-950/80 p-4 overflow-y-auto">
          <DebugResultPanel
            debugResult={debugResult}
            isLoading={loading}
            onApplyFix={handleApplyFix}
          />
        </div>

      </div>

    </div>
  );
}
