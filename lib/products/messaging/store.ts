/**
 * Messaging Store (Zustand)
 *
 * Global state management for the messaging interface.
 * Manages threads, messages, selections, and AI settings.
 * Uses canonical guest/reservation data from lib/core.
 */

import { create } from 'zustand';
import { AiDraft, Thread, Message, ServiceTask, SuggestedFact, ThreadAssignment, TicketSuggestion } from './types';
import { mockThreads, mockMessages } from './mock-data';
import { serviceTasksByGuest } from './panel-mock';
import {
  draftsByThread,
  factsByThread,
  ticketSuggestionsByThread,
  unansweredMinutesByThread,
} from './ai-mock';

/** The property's answering posture. Away is what turns the amber band on. */
export type WorkspaceStatus = 'online' | 'away' | 'offline';

/**
 * A command aimed at the Conversation Details panel from OUTSIDE it.
 *
 * The panel owns its own navigation stack, which is right — nothing else should
 * be able to reach into it and push a page. But the recommended-ticket band's
 * "Review" has to land on the Create-service-task drill-in with the room and
 * issue already filled, and the band lives above the composer, two components
 * away. So the band states an INTENT and the panel decides how to honour it;
 * the `nonce` makes two identical Reviews two events rather than one.
 */
export interface PanelIntent {
  kind: 'create-task';
  room?: string;
  issue?: string;
  nonce: number;
}

/** Text pushed into the composer from elsewhere (the draft card's "Edit"). */
export interface ComposerInjection {
  threadId: string;
  text: string;
  nonce: number;
}

/**
 * Digits-only view of a phone number, for IDENTITY comparisons.
 *
 * A thread is 1:1 with a contact number, so "+1 (650) 766-5555" and
 * "+16507665555" are the same conversation. Formatting is a rendering choice;
 * the digits are the fact. Used by `createThreadFromPhone` to refuse to fork a
 * second thread onto a number the inbox already carries.
 */
function phoneKey(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * The list's ONE sort: newest last message first.
 *
 * ⚠ This exists because the store used to auto-select `threads.filter(...)[0]`
 * — insertion order — while the page rendered the list recency-sorted, so a
 * folder switch (or an archive, or a block) highlighted a row in the MIDDLE of
 * the list. The page's sort and the store's landing have to be the same sort or
 * they will keep drifting apart; this is that sort, and `messages/page.tsx`
 * calls it too.
 */
export function sortByRecency<T extends { lastMessageAt: Date }>(list: T[]): T[] {
  return [...list].sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
}

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
   * Service tasks by OWNER key, seeded from the mock and mutable because the
   * panel can create one. Tasks follow the person, not the stay — so the key is
   * a GUEST id wherever the conversation has a guest.
   *
   * ⚠ An ANONYMOUS thread has no guest, and it used to have no key either: the
   * panel guarded the write with `if (primary)`, so a task raised on an
   * unlinked number was silently dropped while the form said it had been
   * raised. Those threads now key on the THREAD (`thread:{id}`) — see
   * `serviceTaskOwnerKey` in `panel-selectors.ts`. The conversation is the only
   * durable subject there is until someone links a guest.
   */
  serviceTasks: Record<string, ServiceTask[]>;

  /**
   * COMPOSER TEXT, PER THREAD — an unsent reply is not a property of the box,
   * it is a property of the conversation.
   *
   * The composer used to hold its text in component state keyed by thread id,
   * which stopped one guest's draft bleeding into another's box but threw the
   * text away on every switch. Production keeps per-thread drafts; so does this
   * now, and that is also what makes an AI draft survive "Edit → look at
   * something else → come back" (Edit consumes the card, so the composer is the
   * only copy left).
   *
   * Absent ⇒ empty. Cleared on send.
   */
  composerDrafts: Record<string, string>;

  /**
   * Facts a human accepted into the AI's knowledge, newest first.
   *
   * Nothing renders this yet — there is no KB surface in this branch. It exists
   * because the "Add Information to AI" modal is an EDITOR: it hands back the
   * text the hotelier actually approved, and dropping that text on the floor
   * made edit-then-add byte-identical to add-unedited. The queue event and the
   * committed sentence are two different facts; this holds the second one.
   */
  knowledgeAdditions: string[];

  /* ── THE AI LOOP ─────────────────────────────────────────────────────────
     Observability opens in a SIDEBAR, quick actions open in a MODAL (Miguel's
     ruling). Both are addressed by MESSAGE id rather than by a payload: the
     message is already the single source of the explanation, the carrier
     receipts and the text a feedback form quotes, so passing the id keeps the
     surfaces from carrying stale copies of what they show. */

  /** The AI Explanation sidebar's subject. Null ⇒ closed. */
  aiExplanationMessageId: string | null;
  /** The standalone feedback modal's subject (👎). Null ⇒ closed. */
  feedbackModalMessageId: string | null;
  /** The carrier-error modal's subject (a failed send). Null ⇒ closed. */
  carrierErrorMessageId: string | null;

  /** The property's answering posture — drives the away band. */
  workspaceStatus: WorkspaceStatus;

  /** Drafted-but-unsent AI replies, per thread. */
  drafts: Record<string, AiDraft>;
  /** Suggested-fact QUEUES, per thread. Head of the list is the visible band. */
  facts: Record<string, SuggestedFact[]>;
  /** Detected service-ticket suggestions, per thread. */
  ticketSuggestions: Record<string, TicketSuggestion>;
  /** Minutes a guest has been left waiting, per thread. */
  unansweredMinutes: Record<string, number>;

  /** Text the draft card pushed at the composer. */
  composerInjection: ComposerInjection | null;
  /** A command for the Conversation Details panel (the ticket band's Review). */
  panelIntent: PanelIntent | null;

  /** One toast for the whole surface. Set a message; it clears itself. */
  toast: string | null;

  // Actions
  /**
   * A DELIBERATE OPEN — someone clicked the row. Marks the thread read, because
   * a person is now looking at it.
   */
  selectThread: (threadId: string) => void;
  /**
   * A PROGRAMMATIC LANDING — the selection had to go somewhere after a folder
   * switch, an archive or a block. Selects WITHOUT marking read.
   *
   * ⚠ This split is the fix for an unread guest message vanishing from the
   * badge because someone peeked at Archived and came back. Nobody read that
   * thread; the app just had to point at something. Read is a claim about a
   * HUMAN, and only `selectThread` may make it.
   */
  focusThread: (threadId: string) => void;
  /**
   * Put the selection on the top RECENCY-SORTED row of a folder, or clear it
   * when the folder is empty. The one landing every non-user selection uses.
   */
  landOnTopOf: (view: 'inbox' | 'archived' | 'blocked') => void;
  setAiEnabled: (enabled: boolean) => void;
  isThreadAiEnabled: (threadId: string) => boolean;
  toggleThreadAi: (threadId: string) => void;
  sendMessage: (threadId: string, content: string, sender: 'staff' | 'ai' | 'guest') => Promise<void>;
  addMessage: (threadId: string, message: Message) => void;
  updateThreadLastMessage: (threadId: string, message: Message) => void;
  markThreadAsRead: (threadId: string) => void;
  startNewConversation: () => void;
  updateComposingPhone: (phoneNumber: string) => void;
  /**
   * Commit the compose pane's "To:" address.
   *
   * Returns the id of the thread the first message should land in — an EXISTING
   * thread when the number already has one, otherwise a newly created thread.
   * Null only when the number is unusable.
   */
  createThreadFromPhone: (phoneNumber: string) => string | null;
  cancelComposing: () => void;
  setComposerDraft: (threadId: string, text: string) => void;
  clearComposerDraft: (threadId: string) => void;
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
  /** `ownerId` is a guest id, or `thread:{id}` on an anonymous conversation. */
  createServiceTask: (ownerId: string, task: Omit<ServiceTask, 'id'>) => void;
  /**
   * Drop a service task off an owner's list. It UNLINKS the association, it does
   * not close the ticket — the ticket's lifecycle belongs to Service Tickets.
   */
  unlinkServiceTask: (ownerId: string, taskId: string) => void;

  /* ── THE AI LOOP ─────────────────────────────────────────────────────── */
  openAiExplanation: (messageId: string) => void;
  closeAiExplanation: () => void;
  openFeedbackModal: (messageId: string) => void;
  closeFeedbackModal: () => void;
  openCarrierErrors: (messageId: string) => void;
  closeCarrierErrors: () => void;
  setWorkspaceStatus: (status: WorkspaceStatus) => void;
  /** Drop the draft with no feedback prompt — see the note on the action. */
  dismissDraft: (threadId: string) => void;
  /** Approve and send the draft as the signed-in staff member's own message. */
  sendDraft: (threadId: string) => void;
  /** Consume the head of a thread's fact queue (added, edited-then-added, or skipped). */
  resolveFact: (threadId: string, factId: string) => void;
  /**
   * ACCEPT a suggested fact into the AI's knowledge, in the words the hotelier
   * approved. Records the text, then consumes the queue entry.
   */
  addFactToKnowledge: (threadId: string, factId: string, text: string) => void;
  dismissTicketSuggestion: (threadId: string) => void;
  injectIntoComposer: (threadId: string, text: string) => void;
  clearComposerInjection: () => void;
  requestCreateTask: (room?: string, issue?: string) => void;
  clearPanelIntent: () => void;
  showToast: (message: string) => void;
  clearToast: () => void;
  /** Find a message anywhere in the log. The AI surfaces address by id. */
  findMessage: (messageId: string) => Message | undefined;
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
  composerDrafts: {},
  knowledgeAdditions: [],

  // The AI loop
  aiExplanationMessageId: null,
  feedbackModalMessageId: null,
  carrierErrorMessageId: null,
  workspaceStatus: 'online',
  drafts: draftsByThread,
  facts: factsByThread,
  ticketSuggestions: ticketSuggestionsByThread,
  unansweredMinutes: unansweredMinutesByThread,
  composerInjection: null,
  panelIntent: null,
  toast: null,

  // Open a thread deliberately — a person is looking at it, so it is read.
  //
  // Compose is dropped here too: clicking a conversation while the "To:" pane
  // is up used to select the row and mark it read while the pane kept showing
  // compose, so the click looked dead and quietly spent an unread dot on a
  // thread nobody could see.
  selectThread: (threadId: string) => {
    set({ selectedThreadId: threadId, isComposingNew: false, composingPhoneNumber: '' });
    get().markThreadAsRead(threadId);
  },

  // Land the selection somewhere after a folder switch / archive / block.
  // Deliberately does NOT mark read — see the note on the action.
  focusThread: (threadId: string) => {
    set({ selectedThreadId: threadId });
  },

  landOnTopOf: (view: 'inbox' | 'archived' | 'blocked') => {
    const top = sortByRecency(get().threads.filter((t) => t.status === view))[0];
    if (top) get().focusThread(top.id);
    else set({ selectedThreadId: null });
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
    /**
     * ⚠ THE ARCHIVE'S ONLY WAY BACK, AND THAT IS THE DESIGN (Miguel, QA-1).
     *
     * There is deliberately NO "re-open" button anywhere — not in the header,
     * not in the kebab, not on the row. Re-open is not a filing action a
     * hotelier performs; it is what HAPPENS when the conversation starts again.
     * "Re-open is basically if we start chatting in the archived thread again,
     * and then it goes back into the regular inbox."
     *
     * So this side effect is the feature: sending into an archived thread
     * returns it to the inbox, and sending into a blocked one unblocks it.
     * `reopenThread` exists for exactly this caller — it is not dead code, and
     * it must not be wired to a button.
     */
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
    // The draft became a message; it is no longer a draft.
    if (sender === 'staff') get().clearComposerDraft(threadId);
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

  // Resolve the compose pane's address to a thread (returns null if unusable)
  createThreadFromPhone: (phoneNumber: string) => {
    // Validate: at least 10 digits
    const digitsOnly = phoneKey(phoneNumber);
    if (digitsOnly.length < 10) {
      return null;
    }

    /**
     * ⚠ ONE NUMBER, ONE THREAD (Miguel, QA-1).
     *
     * "New message" to a number the inbox already carries lands IN that
     * conversation — it never forks a second, identity-less thread beside the
     * named one. SMS has no other model: the guest's phone will show one
     * conversation whatever this app does, and two rows for one number reads as
     * broken threading to anyone who has ever sent a text.
     *
     * The linkage already existed — the inbox SEARCH resolves this number to
     * the named thread — so compose was the only surface ignoring it.
     *
     * The match wins whatever folder the thread is in: composing to an archived
     * number re-opens it through the send (see `sendMessage`), which is exactly
     * the journey back the archive is supposed to have.
     */
    const existing = get().threads.find((t) => phoneKey(t.contactNumber) === digitsOnly);
    if (existing) {
      set({
        selectedThreadId: existing.id,
        isComposingNew: false,
        composingPhoneNumber: '',
      });
      get().markThreadAsRead(existing.id);
      return existing.id;
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

  // Per-thread composer text. Empty is stored as absence so the map does not
  // fill up with blanks for every thread anyone has ever clicked into.
  setComposerDraft: (threadId: string, text: string) => {
    set((state) => {
      const composerDrafts = { ...state.composerDrafts };
      if (text) composerDrafts[threadId] = text;
      else delete composerDrafts[threadId];
      return { composerDrafts };
    });
  },
  clearComposerDraft: (threadId: string) => {
    set((state) => {
      if (!(threadId in state.composerDrafts)) return {};
      const composerDrafts = { ...state.composerDrafts };
      delete composerDrafts[threadId];
      return { composerDrafts };
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
    // Land on the TOP VISIBLE row — the list is recency-sorted, so that is the
    // most recent thread, not the first one the mock happens to declare. And
    // `focusThread`, not `selectThread`: nobody opened this, so nothing is read.
    get().landOnTopOf(view);
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

    // Land on the inbox's top visible row, without reading it.
    get().landOnTopOf('inbox');
  },

  /**
   * Return an archived thread to the inbox.
   *
   * ⚠ DELIBERATELY UNREACHABLE FROM THE UI. Its one caller is `sendMessage` —
   * see the ruling quoted there. Do not wire this to a button; the absence of a
   * re-open control is the design, not a gap.
   */
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

    // Land on the inbox's top visible row, without reading it.
    get().landOnTopOf('inbox');
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

  // Append a locally-created service task to an owner's list.
  createServiceTask: (ownerId: string, task: Omit<ServiceTask, 'id'>) => {
    set((state) => ({
      serviceTasks: {
        ...state.serviceTasks,
        [ownerId]: [{ ...task, id: `task-${Date.now()}` }, ...(state.serviceTasks[ownerId] ?? [])],
      },
    }));
  },

  // Unlink a service task from this owner — the row leaves the panel; the
  // ticket itself is untouched.
  unlinkServiceTask: (ownerId: string, taskId: string) => {
    set((state) => ({
      serviceTasks: {
        ...state.serviceTasks,
        [ownerId]: (state.serviceTasks[ownerId] ?? []).filter((task) => task.id !== taskId),
      },
    }));
  },

  /* ═════════════════════════════════════════════════════════════════════
     THE AI LOOP
     ═════════════════════════════════════════════════════════════════════ */

  /**
   * Opening the explanation CLOSES the Conversation Details panel. Both are
   * 600px cards pinned to the same three viewport edges, so two open at once
   * would be one card hiding another — and the answer to "why did it say that?"
   * is not something to read through a stack.
   */
  openAiExplanation: (messageId: string) => {
    set({ aiExplanationMessageId: messageId, isGuestInfoOpen: false });
  },
  closeAiExplanation: () => set({ aiExplanationMessageId: null }),

  openFeedbackModal: (messageId: string) => set({ feedbackModalMessageId: messageId }),
  closeFeedbackModal: () => set({ feedbackModalMessageId: null }),

  openCarrierErrors: (messageId: string) => set({ carrierErrorMessageId: messageId }),
  closeCarrierErrors: () => set({ carrierErrorMessageId: null }),

  setWorkspaceStatus: (status: WorkspaceStatus) => set({ workspaceStatus: status }),

  /**
   * ⚠ DELIBERATE DEVIATION FROM PRODUCTION (Miguel's call).
   *
   * Production asks WHY when you throw a draft away — dismissing opens the
   * feedback taxonomy, on the reasoning that a rejected draft is the cheapest
   * training signal the product will ever get. This prototype just dismisses.
   *
   * The reason is that the batch already has two feedback surfaces (the 👎 modal
   * and the explanation's drill-in), and a third mouth asking the same question
   * at the moment someone is trying to clear their screen turns the AI from an
   * assistant into a form. If the loop needs the signal, the honest place to ask
   * for it is once, later — not as a toll on every dismissal.
   */
  dismissDraft: (threadId: string) => {
    set((state) => {
      const drafts = { ...state.drafts };
      delete drafts[threadId];
      return { drafts };
    });
  },

  /**
   * Approve-and-send. The message lands as the SIGNED-IN STAFF MEMBER's, not as
   * the AI's: a human read it and chose to send it, so the property owns the
   * words. Attributing an approved draft to "Canary" would let the AI take
   * credit for a sentence a person is accountable for — and would make the
   * feed's three sender registers lie about who is speaking.
   */
  sendDraft: (threadId: string) => {
    const draft = get().drafts[threadId];
    if (!draft) return;
    const message: Message = {
      id: `m${Date.now()}`,
      threadId,
      sender: 'staff',
      content: draft.content,
      timestamp: new Date(),
      channel: 'SMS',
      status: 'delivered',
    };
    get().addMessage(threadId, message);
    get().updateThreadLastMessage(threadId, message);
    get().dismissDraft(threadId);
  },

  /**
   * Take the fact off the queue. Add-to-AI, edit-then-add and skip all land
   * here, because from the QUEUE's point of view they are the same event: this
   * one has been answered, show the next. The queue never auto-advances on a
   * timer and never hides itself — an unanswered suggestion staying on screen is
   * the whole reason it is a band and not a toast.
   */
  resolveFact: (threadId: string, factId: string) => {
    set((state) => ({
      facts: {
        ...state.facts,
        [threadId]: (state.facts[threadId] ?? []).filter((fact) => fact.id !== factId),
      },
    }));
  },

  /**
   * Accept the fact — in the hotelier's OWN words.
   *
   * `text` is the sentence that was actually approved: the band's Add sends the
   * suggestion verbatim, and the "Add Information to AI" modal sends whatever
   * the hotelier edited it into. The commit consumes its argument now; it used
   * to drop it, which made an edited fact and an un-edited one the same event.
   */
  addFactToKnowledge: (threadId: string, factId: string, text: string) => {
    const trimmed = text.trim();
    if (trimmed) set((state) => ({ knowledgeAdditions: [trimmed, ...state.knowledgeAdditions] }));
    get().resolveFact(threadId, factId);
  },

  dismissTicketSuggestion: (threadId: string) => {
    set((state) => {
      const ticketSuggestions = { ...state.ticketSuggestions };
      delete ticketSuggestions[threadId];
      return { ticketSuggestions };
    });
  },

  injectIntoComposer: (threadId: string, text: string) => {
    set({ composerInjection: { threadId, text, nonce: Date.now() } });
  },
  clearComposerInjection: () => set({ composerInjection: null }),

  /** Open the details panel AND tell it where to go. Order matters not; the
   *  panel reads the intent on mount and on change. */
  requestCreateTask: (room?: string, issue?: string) => {
    set({ isGuestInfoOpen: true, panelIntent: { kind: 'create-task', room, issue, nonce: Date.now() } });
  },
  clearPanelIntent: () => set({ panelIntent: null }),

  showToast: (message: string) => set({ toast: message }),
  clearToast: () => set({ toast: null }),

  findMessage: (messageId: string) => {
    const messages = get().messages;
    for (const list of Object.values(messages)) {
      const found = list.find((message) => message.id === messageId);
      if (found) return found;
    }
    return undefined;
  },
}));
