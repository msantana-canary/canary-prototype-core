import { create } from 'zustand';
import { CommandCenterThread, CommandCenterMessage, AIThreadStatus } from './types';
import { mockCommandCenterThreads, mockCommandCenterMessages } from './mock-data';

interface CommandCenterStore {
  threads: CommandCenterThread[];
  messages: Record<string, CommandCenterMessage[]>;
  selectedThreadId: string | null;
  searchQuery: string;
  expandedSections: Record<AIThreadStatus, boolean>;

  selectThread: (threadId: string) => void;
  clearSelection: () => void;
  markAsCompleted: (threadId: string) => void;
  setSearchQuery: (query: string) => void;
  toggleSection: (section: AIThreadStatus) => void;
  sendMessage: (threadId: string, content: string) => void;
}

export const useCommandCenterStore = create<CommandCenterStore>((set) => ({
  threads: mockCommandCenterThreads,
  messages: mockCommandCenterMessages,
  selectedThreadId: null,
  searchQuery: '',
  expandedSections: {
    needs_response: true,
    needs_attention: true,
    ai_handled: true,
    escalated: true,
  },

  selectThread: (threadId) => {
    set((state) => ({
      selectedThreadId: threadId,
      threads: state.threads.map((t) =>
        t.id === threadId ? { ...t, isUnread: false } : t
      ),
    }));
  },

  clearSelection: () => set({ selectedThreadId: null }),

  markAsCompleted: (threadId) => {
    set((state) => ({
      threads: state.threads.map((t) =>
        t.id === threadId ? { ...t, isCompleted: true } : t
      ),
      selectedThreadId: null,
    }));
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleSection: (section) => {
    set((state) => ({
      expandedSections: {
        ...state.expandedSections,
        [section]: !state.expandedSections[section],
      },
    }));
  },

  sendMessage: (threadId, content) => {
    const newMessage: CommandCenterMessage = {
      id: `cc-m-${Date.now()}`,
      threadId,
      sender: 'staff',
      content,
      timestamp: new Date(),
    };
    set((state) => ({
      messages: {
        ...state.messages,
        [threadId]: [...(state.messages[threadId] || []), newMessage],
      },
      threads: state.threads.map((t) =>
        t.id === threadId ? { ...t, lastMessage: content, lastMessageAt: new Date() } : t
      ),
    }));
  },
}));
