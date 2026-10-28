import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Copy, Check, RotateCcw, Trash2, Code, Maximize2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES, STARTER_CODE } from '../../utils/constants';

export default function CodeEditor({
  language = 'python',
  value = '',
  onChange,
  onLanguageChange,
  readOnly = false,
  height = '480px',
  title = 'Code Editor'
}) {
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState(14);

  const selectedLang = SUPPORTED_LANGUAGES.find(l => l.id === language) || SUPPORTED_LANGUAGES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    if (onChange) {
      onChange(STARTER_CODE[language] || '');
    }
  };

  const handleClear = () => {
    if (onChange) {
      onChange('');
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl">
      {/* Editor Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 gap-2">
        
        {/* Left: Language Selector */}
        <div className="flex items-center space-x-2">
          {onLanguageChange ? (
            <div className="relative">
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="bg-slate-950 text-slate-200 text-xs font-semibold rounded-lg pl-3 pr-8 py-1.5 border border-slate-700/80 focus:border-indigo-500 focus:outline-none appearance-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.id} value={lang.id}>
                    {lang.icon} {lang.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <span>{selectedLang.icon}</span>
              <span>{selectedLang.name}</span>
            </div>
          )}

          <span className="text-xs text-slate-400 hidden sm:inline font-mono">
            {value.split('\n').length} lines
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={handleCopy}
            title="Copy code to clipboard"
            className="flex items-center space-x-1 px-2.5 py-1 rounded text-xs text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          {!readOnly && (
            <>
              <button
                type="button"
                onClick={handleReset}
                title="Reset to starter example"
                className="flex items-center space-x-1 px-2.5 py-1 rounded text-xs text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                title="Clear code"
                className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

      </div>

      {/* Editor Body */}
      <div className="flex-1 w-full bg-[#1e1e1e] min-h-[350px]">
        <Editor
          height={height}
          language={selectedLang.monacoLang}
          value={value}
          theme="vs-dark"
          onChange={(val) => onChange && onChange(val || '')}
          options={{
            readOnly,
            fontSize,
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 4,
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            padding: { top: 12, bottom: 12 }
          }}
          loading={
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              Loading Monaco Editor...
            </div>
          }
        />
      </div>
    </div>
  );
}
