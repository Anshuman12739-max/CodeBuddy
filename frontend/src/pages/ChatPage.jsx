import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Sparkles, AlertCircle, Bot } from 'lucide-react';
import ConversationSidebar from '../features/chat/ConversationSidebar';
import ChatMessage from '../features/chat/ChatMessage';
import Button from '../components/common/Button';
import { chatService } from '../services/chatService';
import { aiService } from '../services/aiService';
import { SUPPORTED_LANGUAGES } from '../utils/constants';

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [language, setLanguage] = useState('python');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    }
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const loadConversations = async () => {
    try {
      const res = await chatService.getConversations();
      const list = res.data || [];
      setConversations(list);
      if (list.length > 0 && !activeConversationId) {
        setActiveConversationId(list[0].id);
      } else if (list.length === 0) {
        handleNewChat();
      }
    } catch (err) {
      console.warn('Could not load conversations:', err.message);
      // Fallback local conversation
      handleNewChat();
    }
  };

  const loadMessages = async (id) => {
    try {
      const res = await chatService.getConversationById(id);
      if (res.data) {
        setMessages(res.data.messages || []);
        if (res.data.language) setLanguage(res.data.language);
      }
    } catch (err) {
      console.warn('Could not load conversation messages:', err.message);
    }
  };

  const handleNewChat = async () => {
    try {
      const res = await chatService.createConversation('New Chat', language);
      const newConv = res.data;
      if (newConv) {
        setConversations(prev => [newConv, ...prev]);
        setActiveConversationId(newConv.id);
        setMessages([
          {
            role: 'assistant',
            content: `Hello! I am **CodeBuddy AI**, your programming tutor for **${language.toUpperCase()}**.\n\nAsk me anything! For example:\n- *"Why do we use pointers in C?"*\n- *"What is a list comprehension in Python?"*\n- *"How does event loop work in JavaScript?"*`
          }
        ]);
      }
    } catch (err) {
      // Offline fallback
      const devId = 'conv-offline-' + Date.now();
      const localConv = { id: devId, title: 'New Chat', language };
      setConversations(prev => [localConv, ...prev]);
      setActiveConversationId(devId);
      setMessages([
        {
          role: 'assistant',
          content: `Hello! I am your CodeBuddy AI tutor. Ask me any conceptual or debugging questions about **${language.toUpperCase()}**!`
        }
      ]);
    }
  };

  const handleRename = async (id, newTitle) => {
    try {
      await chatService.updateConversation(id, newTitle);
      setConversations(prev =>
        prev.map(c => (c.id === id ? { ...c, title: newTitle } : c))
      );
    } catch (err) {
      console.warn('Failed to rename conversation:', err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await chatService.deleteConversation(id);
      const remaining = conversations.filter(c => c.id !== id);
      setConversations(remaining);
      if (activeConversationId === id) {
        if (remaining.length > 0) {
          setActiveConversationId(remaining[0].id);
        } else {
          handleNewChat();
        }
      }
    } catch (err) {
      console.warn('Failed to delete conversation:', err.message);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = inputMessage.trim();
    if (!text || sending) return;

    if (text.length > 4000) {
      setError('Message exceeds 4,000 characters.');
      return;
    }

    setError(null);
    setInputMessage('');

    // Append user message to UI immediately
    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setSending(true);

    try {
      const res = await aiService.chat(
        text,
        updatedMessages,
        language,
        activeConversationId
      );

      const replyMsg = { role: 'assistant', content: res.data.reply };
      setMessages([...updatedMessages, replyMsg]);

      // Auto-update title if it's the first message
      if (messages.length <= 1 && text.length > 3) {
        const titleSnippet = text.slice(0, 30);
        handleRename(activeConversationId, titleSnippet);
      }
    } catch (err) {
      setError(err.message || 'Failed to send message. AI service may be temporarily unavailable.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-4rem)] overflow-hidden">
      
      {/* Sidebar: Conversations Management */}
      <ConversationSidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={setActiveConversationId}
        onNew={handleNewChat}
        onRename={handleRename}
        onDelete={handleDelete}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-slate-900/30">
        
        {/* Chat Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">AI Pedagogical Tutor</h2>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 hidden sm:inline">Context:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {SUPPORTED_LANGUAGES.map(l => (
                <option key={l.id} value={l.id}>
                  {l.icon} {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="m-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <ChatMessage key={idx} message={m} />
          ))}

          {sending && (
            <div className="flex items-center space-x-3 text-slate-400 text-xs animate-pulse pl-12">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
              <span>CodeBuddy is formulating explanation...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Box */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask a question about ${language.toUpperCase()} concepts, bugs, or algorithms...`}
              disabled={sending}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!inputMessage.trim() || sending}
              isLoading={sending}
              icon={Send}
            >
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>
        </div>

      </div>

    </div>
  );
}
