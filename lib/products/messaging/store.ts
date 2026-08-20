/**
 * Messaging Store (Zustand)
 *
 * Global state management for the messaging interface.
 * Manages threads, messages, selections, and AI settings.
 * Uses canonical guest/reservation data from lib/core.
 */

import { create } from 'zustand';
import { Thread, Message, ServiceTask, ThreadAssignment } from './types';
import { mockThreads, mockMessages } from './mock-data';
import { serviceTasksByGuest } from './panel-mock';

interface MessagingState {
  // State
  threads: Thread[];
  messages: Record<string, Message[]>;
  selectedThreadId: string | null;
  /**
   * The DEMO auto-response simulation (staff reply + guest reply through
   * `/api/claude`). Global, off by default, and no longer reachable from the
   * composer — the composer's pill now drives `threadAiEnabled` instead. Kept
   * because the simulation is still wired into the page's send handler.
   */
  aiEnabled: boolean;
  /**
   * The AI AGENT switch, PER THREAD — the composer's "AI On / AI Off" pill.
   * Production scopes this to the conversation (an agent paused on an angry
   * thread must stay running on every other one), so a single global flag was
   * always wrong. Sparse map: absent ⇒ ON, which is production's default and
   * the state the frame draws.
   */
  threadAiEnabled: Record<string, boolean>;
  isComposingNew: boolean;
  composingPhoneNumber: string;
  typingThreadId: string | null;
  isGuestInfoOpen: boolean;
  currentView: 'inbox' | 'archived' | 'blocked';
  searchQuery: string;
  /**
   * THE SPOTLIGHT, PER THREAD — which linked reservation's guest the
   * Conversation Details panel puts in its profile header.
   *
   * ⚠ LOAD-BEARING DISTINCTION (decision log: "Primary Is a Spotlight, Not a
   * Link"). This is a DISPLAY preference, not a data operation. When several
   * people share one phone number, Canary cannot know which of them is holding
   * it, so a human tells the panel who they're speaking to. Setting a primary
   * links NOTHING and unlinks NOTHING — the thread's `linkedReservationIds` are
   * untouched. Sparse map: absent ⇒ derive the default (see `panelPrimary`).
   */
  threadPrimaryReservationId: Record<string, string>;
  /**
   * Service tasks by GUEST id, seeded from the mock and mutable because the
   * panel can create one. Tasks follow the person, not the stay.
   */
  serviceTasks: Record<string, ServiceTask[]>;

  // Actions
  selectThread: (threadId: string) => void;
  setAiEnabled: (enabled: boolean) => void;
  isThreadAiEnabled: (threadId: string) => boolean;
  toggleThreadAi: (threadId: string) => void;
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
  linkReservation: (threadId: string, reservationId: string) => void;
  unlinkReservation: (threadId: string, reservationId: string) => void;
  /** Unlink EVERY reservation belonging to one guest (the panel's kebab). */
  unlinkGuest: (threadId: string, reservationIds: string[]) => void;
  setThreadPrimary: (threadId: string, reservationId: string) => void;
  assignThread: (threadId: string, assignment?: ThreadAssignment) => void;
  createServiceTask: (guestId: string, task: Omit<ServiceTask, 'id'>) => void;
  /**
   * Drop a service task off a guest's list. It UNLINKS the association, it does
   * not close the ticket — the ticket's lifecycle belongs to Service Tickets.
   */
  unlinkServiceTask: (guestId: string, taskId: string) => void;
}

export const useMessagingStore = create<MessagingState>((set, get) => ({
  // Initial state
  threads: mockThreads,
  messages: mockMessages,
  selectedThreadId: null,
  aiEnabled: false,
  threadAiEnabled: {},
  isComposingNew: false,
  composingPhoneNumber: '',
  typingThreadId: null,
  isGuestInfoOpen: false,
  currentView: 'inbox',
  searchQuery: '',
  threadPrimaryReservationId: {},
  serviceTasks: serviceTasksByGuest,

  // Select a thread
  selectThread: (threadId: string) => {
    set({ selectedThreadId: threadId });
    // Mark as read when selected
    get().markThreadAsRead(threadId);
  },

  // Toggle the demo auto-response simulation (global)
  setAiEnabled: (enabled: boolean) => {
    set({ aiEnabled: enabled });
  },

  // The AI agent's per-thread switch. Absent from the map ⇒ ON.
  isThreadAiEnabled: (threadId: string) => get().threadAiEnabled[threadId] !== false,

  toggleThreadAi: (threadId: string) => {
    set((state) => ({
      threadAiEnabled: {
        ...state.threadAiEnabled,
        [threadId]: state.threadAiEnabled[threadId] === false,
      },
    }));
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

    // Create new thread with phone number only (no guest/reservation linked)
    const newThreadId = `thread-${Date.now()}`;
    const newThread: Thread = {
      id: newThreadId,
      contactNumber: phoneNumber,
      linkedReservationIds: [],
      lastMessage: '',
      lastMessageAt: new Date(),
      isUnread: false,
      status: 'inbox',
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

  // Link a reservation to a thread
  linkReservation: (threadId: string, reservationId: string) => {
    set((state) => ({
      threads: state.threads.map((thread) =>
        thread.id === threadId && !thread.linkedReservationIds.includes(reservationId)
          ? { ...thread, linkedReservationIds: [...thread.linkedReservationIds, reservationId] }
          : thread
      ),
    }));
  },

  // Unlink a reservation from a thread
  unlinkReservation: (threadId: string, reservationId: string) => {
    set((state) => {
      // If the spotlight was on the reservation being removed, drop the
      // preference too — the panel then re-derives its default primary rather
      // than pointing at a reservation this thread no longer carries.
      const primary = { ...state.threadPrimaryReservationId };
      if (primary[threadId] === reservationId) delete primary[threadId];
      return {
        threads: state.threads.map((thread) =>
          thread.id === threadId
            ? { ...thread, linkedReservationIds: thread.linkedReservationIds.filter((id) => id !== reservationId) }
            : thread
        ),
        threadPrimaryReservationId: primary,
      };
    });
  },

  // Unlink a whole guest — every reservation of theirs, in one operation.
  unlinkGuest: (threadId: string, reservationIds: string[]) => {
    const drop = new Set(reservationIds);
    set((state) => {
      const primary = { ...state.threadPrimaryReservationId };
      if (drop.has(primary[threadId])) delete primary[threadId];
      return {
        threads: state.threads.map((thread) =>
          thread.id === threadId
            ? { ...thread, linkedReservationIds: thread.linkedReservationIds.filter((id) => !drop.has(id)) }
            : thread
        ),
        threadPrimaryReservationId: primary,
      };
    });
  },

  /**
   * Set the thread's DISPLAY primary. Deliberately touches nothing but the
   * preference map — see the state comment above. A spotlight is not a link.
   */
  setThreadPrimary: (threadId: string, reservationId: string) => {
    set((state) => ({
      threadPrimaryReservationId: {
        ...state.threadPrimaryReservationId,
        [threadId]: reservationId,
      },
    }));
  },

  // Assign the thread to a user XOR a department (production's rule — the
  // single `assignedTo` field makes the exclusivity structural).
  assignThread: (threadId: string, assignment?: ThreadAssignment) => {
    set((state) => ({
      threads: state.threads.map((thread) =>
        thread.id === threadId ? { ...thread, assignedTo: assignment } : thread
      ),
    }));
  },

  // Append a locally-created service task to a guest's list.
  createServiceTask: (guestId: string, task: Omit<ServiceTask, 'id'>) => {
    set((state) => ({
      serviceTasks: {
        ...state.serviceTasks,
        [guestId]: [{ ...task, id: `task-${Date.now()}` }, ...(state.serviceTasks[guestId] ?? [])],
      },
    }));
  },

  // Unlink a service task from this guest — the row leaves the panel; the
  // ticket itself is untouched.
  unlinkServiceTask: (guestId: string, taskId: string) => {
    set((state) => ({
      serviceTasks: {
        ...state.serviceTasks,
        [guestId]: (state.serviceTasks[guestId] ?? []).filter((task) => task.id !== taskId),
      },
    }));
  },
}));
