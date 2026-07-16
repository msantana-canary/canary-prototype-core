/**
 * Email Channel — Store (Zustand)
 *
 * State + actions for the standalone Email channel. Mirrors the messaging
 * store idioms (selectThread / setView / archive / send) but scoped to the
 * Phase-1 email surface. All mutations are in-store/optimistic — no network.
 */

import { create } from 'zustand';
import { EmailThread, EmailMessage, EmailView } from './types';
import { mockThreads, mockMessages } from './mock-data';

interface EmailState {
  // State
  threads: EmailThread[];
  messages: Record<string, EmailMessage[]>;
  selectedThreadId: string | null;
  view: EmailView;
  searchQuery: string;
  draft: string;

  // Actions
  selectThread: (threadId: string) => void;
  setView: (view: EmailView) => void;
  setSearch: (query: string) => void;
  setDraft: (draft: string) => void;
  archiveThread: (threadId: string) => void;
  sendReply: (threadId: string, body: string) => void;
}

const STAFF_NAME = 'Theresa Webb';

/** Threads in a view, newest activity first (mirrors the list's sort). */
function threadsInViewByRecency(threads: EmailThread[], view: EmailView): EmailThread[] {
  return threads
    .filter((t) => t.status === view)
    .sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime());
}

export const useEmailStore = create<EmailState>((set, get) => ({
  // Initial state — default to the featured Emily thread (matches Figma open state)
  threads: mockThreads,
  messages: mockMessages,
  selectedThreadId: 'email-emily',
  view: 'inbox',
  searchQuery: '',
  draft: '',

  selectThread: (threadId: string) => {
    set((state) => ({
      selectedThreadId: threadId,
      draft: '',
      threads: state.threads.map((t) =>
        t.id === threadId ? { ...t, isUnread: false } : t
      ),
    }));
  },

  setView: (view: EmailView) => {
    // Select the most recent thread in the target view (or none if empty)
    const threadsInView = threadsInViewByRecency(get().threads, view);
    set({
      view,
      selectedThreadId: threadsInView.length > 0 ? threadsInView[0].id : null,
      draft: '',
    });
  },

  setSearch: (query: string) => {
    set({ searchQuery: query });
  },

  setDraft: (draft: string) => {
    set({ draft });
  },

  archiveThread: (threadId: string) => {
    set((state) => ({
      threads: state.threads.map((t) =>
        t.id === threadId ? { ...t, status: 'archived', isUnread: false } : t
      ),
    }));

    // After archiving, select the next inbox thread (if we're on the inbox view)
    const { view } = get();
    if (view === 'inbox') {
      const inboxThreads = threadsInViewByRecency(get().threads, 'inbox');
      set({ selectedThreadId: inboxThreads.length > 0 ? inboxThreads[0].id : null });
    }
  },

  sendReply: (threadId: string, body: string) => {
    const trimmed = body.trim();
    if (!trimmed) return;

    const newMessage: EmailMessage = {
      id: `em-${threadId}-${Date.now()}`,
      threadId,
      direction: 'outbound',
      staffName: STAFF_NAME,
      body: trimmed,
      sentAt: new Date(),
    };

    set((state) => ({
      messages: {
        ...state.messages,
        [threadId]: [...(state.messages[threadId] || []), newMessage],
      },
      threads: state.threads.map((t) =>
        t.id === threadId
          ? { ...t, lastActivityAt: newMessage.sentAt, preview: trimmed }
          : t
      ),
      draft: '',
    }));
  },
}));
