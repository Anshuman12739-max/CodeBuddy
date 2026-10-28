import React, { useState } from 'react';
import { User, Bot, Copy, Check } from 'lucide-react';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Simple and safe parser for code blocks within markdown responses
  const renderContent = (content) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const lang = lines[0].trim();
        const code = (lang && !lang.includes(' ') && lines.length > 1)
          ? lines.slice(1).join('\n')
          : lines.join('\n');

        const handleCopyCode = () => {
          navigator.clipboard.writeText(code);
          setCopiedIndex(index);
          setTimeout(() => setCopiedIndex(null), 2000);
        };

        return (
          <div key={index} className="my-2.5 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 text-xs font-mono text-slate-400">
              <span>{lang || 'code'}</span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center space-x-1 text-slate-300 hover:text-white"
              >
                {copiedIndex === index ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 text-[11px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 text-xs font-mono text-indigo-200 overflow-x-auto leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      return (
        <span key={index} className="whitespace-pre-wrap leading-relaxed">
          {part}
        </span>
      );
    });
  };

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
          isUser
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
            : 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/20'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div
        className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm shadow-sm ${
          isUser
            ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-100 rounded-tr-none'
            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
        }`}
      >
        {renderContent(message.content)}
      </div>
    </div>
  );
}
