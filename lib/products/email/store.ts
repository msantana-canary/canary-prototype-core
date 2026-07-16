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

/** How the Email Details panel presents: pushes a third column vs. floats over. */
// 'drawer' = Messaging's actual GuestInfoSidebar mechanic: fixed drawer sliding
// in from the right screen edge (Miguel's reference for "how the sidebar
// currently works in our existing product"). NOT a floating overlay card —
// that variant was built 7/16 and rejected same-day.
export type InfoPanelStyle = 'push' | 'drawer';

interface EmailState {
  // State
  threads: EmailThread[];
  messages: Record<string, EmailMessage[]>;
  selectedThreadId: string | null;
  view: EmailView;
  searchQuery: string;
  draft: string;
  isInfoOpen: boolean;
  infoPanelStyle: InfoPanelStyle;
  /** How far through the scripted inbound-email demo queue we are (see INBOUND_SCRIPT). */
  inboundQueueIndex: number;

  // Actions
  selectThread: (threadId: string) => void;
  setView: (view: EmailView) => void;
  setSearch: (query: string) => void;
  setDraft: (draft: string) => void;
  archiveThread: (threadId: string) => void;
  sendReply: (threadId: string, body: string) => void;
  toggleInfo: () => void;
  setInfoOpen: (open: boolean) => void;
  setInfoPanelStyle: (style: InfoPanelStyle) => void;
  /** Deliver the next scripted inbound email (demo control). No-op when exhausted. */
  simulateInboundEmail: () => void;
}

const STAFF_NAME = 'Theresa Webb';

// --- Simulate-incoming-email demo queue ------------------------------------
// Lets a presenter (Rachel) drive live inbound arrivals during a demo: each
// press of the "Simulate incoming email" control delivers the NEXT scripted
// item. The queue does NOT cycle — it stops when exhausted (the button
// disables and shows a "0 left" state), so a demo can't accidentally replay
// the same beats. Reset only on a full page reload.

/** A scripted inbound: either a reply to an existing thread, or a brand-new thread. */
type ScriptedInbound =
  | { kind: 'reply'; threadId: string; body: string }
  | {
      kind: 'new-thread';
      thread: Pick<EmailThread, 'id' | 'senderName' | 'senderEmail' | 'subject' | 'linkedGuestId'>;
      body: string;
    };

const INBOUND_SCRIPT: ScriptedInbound[] = [
  // 1. Reply to Sarah Martinez's existing late-checkout thread — a thank-you
  //    with one follow-up. Bumps the thread to the top of the list.
  {
    kind: 'reply',
    threadId: 'email-sarah',
    body: 'Amazing — thank you so much! And could we also store our bags at the front desk after checkout, until our evening flight?\n\nSarah',
  },
  // 2. A brand-new inbound thread from a fresh sender, auto-linked to a
  //    canonical guest not used elsewhere in the inbox (Sophia Anderson,
  //    GOLD ELITE). Lands at the top, unread, badge bumps.
  {
    kind: 'new-thread',
    thread: {
      id: 'email-sim-sophia',
      senderName: 'Sophia Anderson',
      senderEmail: 'sophia.anderson@gmail.com',
      subject: 'Re: Your upcoming stay at The Statler — Nov 22',
      linkedGuestId: 'guest-sophia',
    },
    body: "Hi there,\n\nWe're really looking forward to our stay! Would it be possible to arrange an airport shuttle for our arrival on the 22nd? Our flight lands around 3pm.\n\nThank you,\nSophia",
  },
  // 3. A second reply — the escalation beat on Brooklyn Carter's billing
  //    dispute. Pressure without being rude; good for the "unread and waiting"
  //    demo moment.
  {
    kind: 'reply',
    threadId: 'email-brooklyn',
    body: "Sorry to push — could I get an update today? I'm submitting my expenses tonight and need to know whether the $45 will be removed.\n\nBrooklyn",
  },
];

/** Total scripted inbound items — exposed so the demo control can show "N left". */
export const INBOUND_QUEUE_LENGTH = INBOUND_SCRIPT.length;

/** One-line list preview from a multi-paragraph body (collapse whitespace). */
function previewOf(body: string): string {
  return body.replace(/\s+/g, ' ').trim();
}

/** Threads in a view, newest activity first (mirrors the list's sort). */
function threadsInViewByRecency(threads: EmailThread[], view: EmailView): EmailThread[] {
  return threads
    .filter((t) => t.status === view)
    .sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime());
}

/**
 * The thread auto-opened in the read pane on first load: the most recent inbox
 * thread — the same one the sorted list renders on top. Derived (no hardcoded
 * id) so the open thread always matches the list's first row even if mock data
 * changes. Null only if the inbox is empty.
 */
const INITIAL_SELECTED_THREAD_ID: string | null =
  threadsInViewByRecency(mockThreads, 'inbox')[0]?.id ?? null;

/**
 * Mark a single thread read. Selecting a thread opens it in the read pane, and
 * the invariant is "the open thread is never unread" — so this is applied both
 * on selectThread AND to the initial state's auto-selected thread. Marking read
 * happens at the store level, never by editing the thread's mock flag.
 */
function markThreadRead(threads: EmailThread[], threadId: string | null): EmailThread[] {
  if (!threadId) return threads;
  return threads.map((t) => (t.id === threadId ? { ...t, isUnread: false } : t));
}

export const useEmailStore = create<EmailState>((set, get) => ({
  // Initial state — auto-open the most recent inbox thread (the list's top row).
  // The auto-selected thread is marked read the same way selectThread does, so
  // the list never shows an unread dot on the thread that's already open.
  threads: markThreadRead(mockThreads, INITIAL_SELECTED_THREAD_ID),
  messages: mockMessages,
  selectedThreadId: INITIAL_SELECTED_THREAD_ID,
  view: 'inbox',
  searchQuery: '',
  draft: '',
  isInfoOpen: false,
  infoPanelStyle: 'push',
  inboundQueueIndex: 0,

  selectThread: (threadId: string) => {
    set((state) => ({
      selectedThreadId: threadId,
      draft: '',
      threads: markThreadRead(state.threads, threadId),
    }));
  },

  setView: (view: EmailView) => {
    // Select the most recent thread in the target view (or none if empty)
    const threadsInView = threadsInViewByRecency(get().threads, view);
    const nextSelectedId = threadsInView.length > 0 ? threadsInView[0].id : null;
    set((state) => ({
      view,
      selectedThreadId: nextSelectedId,
      draft: '',
      // Keep the "open thread is never unread" invariant across view switches.
      threads: markThreadRead(state.threads, nextSelectedId),
    }));
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

  simulateInboundEmail: () => {
    const { inboundQueueIndex, selectedThreadId } = get();
    if (inboundQueueIndex >= INBOUND_SCRIPT.length) return; // queue exhausted — no-op

    const item = INBOUND_SCRIPT[inboundQueueIndex];
    const now = new Date();

    if (item.kind === 'reply') {
      const { threadId } = item;
      const newMessage: EmailMessage = {
        id: `em-${threadId}-sim-${now.getTime()}`,
        threadId,
        direction: 'inbound',
        body: item.body,
        sentAt: now,
      };

      set((state) => ({
        inboundQueueIndex: state.inboundQueueIndex + 1,
        messages: {
          ...state.messages,
          [threadId]: [...(state.messages[threadId] || []), newMessage],
        },
        threads: state.threads.map((t) =>
          t.id === threadId
            ? {
                ...t,
                // A reply always lands the thread back in the inbox (in case it
                // had been archived) and bumps it to the top of the list.
                status: 'inbox',
                lastActivityAt: now,
                preview: previewOf(item.body),
                // Respect the "open thread is never unread" invariant: only mark
                // unread if the arriving thread isn't the one already open.
                isUnread: threadId !== selectedThreadId,
              }
            : t
        ),
      }));
      return;
    }

    // kind === 'new-thread' — a brand-new inbound arrives at the top, unread.
    const { thread, body } = item;
    const newThread: EmailThread = {
      ...thread,
      status: 'inbox',
      isUnread: true, // never the open thread on arrival
      lastActivityAt: now,
      preview: previewOf(body),
    };
    const newMessage: EmailMessage = {
      id: `em-${thread.id}-sim-${now.getTime()}`,
      threadId: thread.id,
      direction: 'inbound',
      body,
      sentAt: now,
    };

    set((state) => ({
      inboundQueueIndex: state.inboundQueueIndex + 1,
      threads: [...state.threads, newThread],
      messages: { ...state.messages, [thread.id]: [newMessage] },
    }));
  },

  toggleInfo: () => {
    set((state) => ({ isInfoOpen: !state.isInfoOpen }));
  },

  setInfoOpen: (open: boolean) => {
    set({ isInfoOpen: open });
  },

  setInfoPanelStyle: (style: InfoPanelStyle) => {
    set({ infoPanelStyle: style });
  },
}));
