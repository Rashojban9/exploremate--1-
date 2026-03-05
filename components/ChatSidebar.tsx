import { Loader, MessageSquare, Plus, Trash2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { clearChatHistory, getConversations } from '../services/aiService';

interface Conversation {
  sessionId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

interface ChatSidebarProps {
  currentSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  refreshKey?: number;
  isOpen: boolean;
  onClose: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  currentSessionId,
  onSelectSession,
  onNewChat,
  refreshKey,
  isOpen,
  onClose
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, [refreshKey]);

  const loadConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    try {
      await clearChatHistory(sessionId);
      loadConversations();
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:translate-x-0 lg:w-64 lg:h-full`}>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <button
            onClick={onNewChat}
            className="flex-1 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Chat
          </button>
          {/* Close button - mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden ml-2 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 text-slate-500 animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No conversations yet. Start a new chat!
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conv) => (
                <div
                  key={conv.sessionId}
                  onClick={() => {
                    onSelectSession(conv.sessionId);
                    onClose();
                  }}
                  className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                    currentSessionId === conv.sessionId
                      ? 'bg-sky-600/20 text-sky-400'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">{conv.title || 'New Conversation'}</p>
                    <p className="text-xs text-slate-500">{formatTime(conv.updatedAt)}</p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, conv.sessionId)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
          <p>AI can make mistakes. Please verify important information.</p>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
