import React, { useState } from 'react';
import { Plus, MessageSquare, Edit2, Trash2, Check, X } from 'lucide-react';
import Button from '../../components/common/Button';

export default function ConversationSidebar({
  conversations = [],
  activeId,
  onSelect,
  onNew,
  onRename,
  onDelete
}) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const startRename = (conv, e) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveRename = (id, e) => {
    e.stopPropagation();
    if (editTitle.trim() && onRename) {
      onRename(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelRename = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <div className="w-full md:w-64 flex flex-col h-full bg-slate-950 border-r border-slate-800 p-3 space-y-3">
      {/* New Conversation Button */}
      <Button
        variant="primary"
        size="sm"
        onClick={onNew}
        className="w-full justify-center"
      >
        <Plus className="w-4 h-4 mr-1.5" />
        New Tutoring Chat
      </Button>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500">
            No previous chats. Start a new conversation to ask programming questions!
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = conv.id === activeId;
            const isEditing = editingId === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`group flex items-center justify-between p-2.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {isEditing ? (
                  <div className="flex items-center space-x-1 w-full" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 bg-slate-900 border border-indigo-500 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={(e) => saveRename(conv.id, e)}
                      className="p-1 text-emerald-400 hover:text-emerald-300"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={cancelRename}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-2 truncate">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{conv.title || 'Conversation'}</span>
                    </div>

                    <div className="hidden group-hover:flex items-center space-x-1 shrink-0">
                      <button
                        onClick={(e) => startRename(conv, e)}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Rename"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this conversation?')) onDelete(conv.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-400"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
