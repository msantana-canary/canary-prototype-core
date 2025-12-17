/**
 * Messaging Store (Zustand)
 *
 * Global state management for the messaging interface.
 * Manages threads, messages, selections, and AI settings.
 * Uses canonical guest/reservation data from lib/core.
 */

import { create } from 'zustand';
import { Thread, Message } from './types';
import { mockThreads, mockMessages } from './mock-data';
import { guests } from '@/lib/core/data/guests';

interface MessagingState {
  // State
  threads: Thread[];
  messages: Record<string, Message[]>;
  selectedThreadId: string | null;
  aiEnabled: boolean;
  isComposingNew: boolean;
  composingPhoneNumber: string;
  typingThreadId: string | null;
  isGuestInfoOpen: boolean;
  currentView: 'inbox' | 'archived' | 'blocked';
  searchQuery: string;

  // Actions
  selectThread: (threadId: string) => void;
  setAiEnabled: (enabled: boolean) => void;
  sendMessage: (threadId: string, content: string, sender: 'staff' | 'ai' | 'guest') => Promise<void>;
  addMessage: (threadId: string, message: Message) => void;
  updateThreadLastMessage: (threadId: string, message: Message) => void;
  markThreadAsRead: (threadId: string) => void;
  startNewConversation: () => void;
  updateComposingPhone: (phoneNumber: string) => void;
  createThreadFromPhone: (phoneNumber: string) => string | null;
  cancelComposing: () => void;
  setGuestTyping: (threadId: string | null) => void;
  toggleGuestInfo: () => void;
  closeGuestInfo: () => void;
  setCurrentView: (view: 'inbox' | 'archived' | 'blocked') => void;
  archiveThread: (threadId: string) => void;
  reopenThread: (threadId: string) => void;
  blockThread: (threadId: string) => void;
  unblockThread: (threadId: string) => void;
  markThreadAsUnread: (threadId: string) => void;
  setSearchQuery: (query: string) => void;
}

export const useMessagingStore = create<MessagingState>((set, get) => ({
  // Initial state
  threads: mockThreads,
  messages: mockMessages,
  selectedThreadId: null,
  aiEnabled: false,
  isComposingNew: false,
  composingPhoneNumber: '',
  typingThreadId: null,
  isGuestInfoOpen: false,
  currentView: 'inbox',
  searchQuery: '',

  // Select a thread
  selectThread: (threadId: string) => {
    set({ selectedThreadId: threadId });
    // Mark as read when selected
    get().markThreadAsRead(threadId);
  },

  // Toggle AI assistant
  setAiEnabled: (enabled: boolean) => {
    set({ aiEnabled: enabled });
  },

  // Send a message (staff, AI, or guest)
  sendMessage: async (threadId: string, content: string, sender: 'staff' | 'ai' | 'guest') => {
    // If sending to an archived or blocked thread, reopen/unblock it
    const thread = get().threads.find((t) => t.id === threadId);
    if (thread && thread.status === 'archived') {
      get().reopenThread(threadId);
    } else if (thread && thread.status === 'blocked') {
      get().unblockThread(threadId);
    }

    const newMessage: Message = {
      id: `m${Date.now()}`,
      threadId,
      sender,
      content,
      timestamp: new Date(),
      channel: 'SMS',
      status: 'delivered',
    };

    // Add the message
    get().addMessage(threadId, newMessage);
    get().updateThreadLastMessage(threadId, newMessage);
  },

  // Add a message to a thread
  addMessage: (threadId: string, message: Message) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [threadId]: [...(state.messages[threadId] || []), message],
      },
    }));
  },

  // Update thread's last message preview
  updateThreadLastMessage: (threadId: string, message: Message) => {
    set((state) => ({
      threads: state.threads.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              lastMessage: message.content,
              lastMessageAt: message.timestamp,
              isUnread: message.sender === 'guest',
            }
          : thread
      ),
    }));
  },

  // Mark thread as read
  markThreadAsRead: (threadId: string) => {
    set((state) => ({
      threads: state.threads.map((thread) =>
        thread.id === threadId ? { ...thread, isUnread: false } : thread
      ),
    }));
  },

  // Start composing a new conversation
  startNewConversation: () => {
    set({
      isComposingNew: true,
      composingPhoneNumber: '',
      selectedThreadId: null,
    });
  },

  // Update phone number as user types
  updateComposingPhone: (phoneNumber: string) => {
    set({ composingPhoneNumber: phoneNumber });
  },

  // Create thread from phone number (returns threadId if valid, null if invalid)
  createThreadFromPhone: (phoneNumber: string) => {
    // Validate: at least 10 digits
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      return null;
    }

    // Create a temporary guest ID for the new phone number
    const tempGuestId = `guest-phone-${Date.now()}`;

    // Create new thread
    const newThreadId = `thread-${Date.now()}`;
    const newThread: Thread = {
      id: newThreadId,
      guestId: tempGuestId,
      reservationId: '',
      lastMessage: '',
      lastMessageAt: new Date(),
      isUnread: false,
      status: 'inbox',
    };

    // Add a temporary guest to the store for display purposes
    // In a real app, this would create a guest in the backend
    (guests as Record<string, typeof guests[keyof typeof guests]>)[tempGuestId] = {
      id: tempGuestId,
      name: phoneNumber,
      initials: '',
      phone: phoneNumber,
    };

    // Add thread to beginning of list
    set((state) => ({
      threads: [newThread, ...state.threads],
      messages: {
        ...state.messages,
        [newThreadId]: [],
      },
      selectedThreadId: newThreadId,
      isComposingNew: false,
      composingPhoneNumber: '',
    }));

    return newThreadId;
  },

  // Cancel composing mode
  cancelComposing: () => {
    set({
      isComposingNew: false,
      composingPhoneNumber: '',
    });
  },

  // Set guest typing indicator
  setGuestTyping: (threadId: string | null) => {
    set({ typingThreadId: threadId });
  },

  // Toggle guest info sidebar
  toggleGuestInfo: () => {
    set((state) => ({ isGuestInfoOpen: !state.isGuestInfoOpen }));
  },

  // Close guest info sidebar
  closeGuestInfo: () => {
    set({ isGuestInfoOpen: false });
  },

  // Switch between inbox views
  setCurrentView: (view: 'inbox' | 'archived' | 'blocked') => {
    set({ currentView: view });

    // Select most recent thread in the new view
    const threadsInView = get().threads.filter((t) => t.status === view);
    if (threadsInView.length > 0) {
      get().selectThread(threadsInView[0].id);
    } else {
      set({ selectedThreadId: null });
    }
  },

  // Archive a thread
  archiveThread: (threadId: string) => {
    set((state) => ({
      threads: state.threads.map((thread) =>
        thread.id === threadId
          ? { ...thread, status: 'archived', isUnread: false }
          : thread
      ),
    }));

    get().closeGuestInfo();

    // Select most recent thread in inbox
    const inboxThreads = get().threads.filter((t) => t.status === 'inbox');
    if (inboxThreads.length > 0) {
      get().selectThread(inboxThreads[0].id);
    } else {
      set({ selectedThreadId: null });
    }
  },

  // Reopen an archived thread
  reopenThread: (threadId: string) => {
    set((state) => ({
      threads: state.threads.map((thread) =>
        thread.id === threadId
          ? { ...thread, status: 'inbox' }
          : thread
      ),
    }));
  },

  // Block a thread
  blockThread: (threadId: string) => {
    set((state) => ({
      threads: state.threads.map((thread) =>
        thread.id === threadId
          ? { ...thread, status: 'blocked', isUnread: false }
          : thread
      ),
    }));

    get().closeGuestInfo();

    // Select most recent thread in inbox
    const inboxThreads = get().threads.filter((t) => t.status === 'inbox');
    if (inboxThreads.length > 0) {
      get().selectThread(inboxThreads[0].id);
    } else {
      set({ selectedThreadId: null });
    }
  },

  // Unblock a thread
  unblockThread: (threadId: string) => {
    set((state) => ({
      threads: state.threads.map((thread) =>
        thread.id === threadId
          ? { ...thread, status: 'inbox' }
          : thread
      ),
    }));
  },

  // Mark thread as unread
  markThreadAsUnread: (threadId: string) => {
    set((state) => ({
      threads: state.threads.map((thread) =>
        thread.id === threadId ? { ...thread, isUnread: true } : thread
      ),
    }));
  },

  // Set search query
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },
}));
