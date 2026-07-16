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
import { getDraft } from './ai-drafts';

/** How the Email Details panel presents: pushes a third column vs. floats over. */
// 'drawer' = Messaging's actual GuestInfoSidebar mechanic: fixed drawer sliding
// in from the right screen edge (Miguel's reference for "how the sidebar
// currently works in our existing product"). NOT a floating overlay card —
// that variant was built 7/16 and rejected same-day.
export type InfoPanelStyle = 'push' | 'drawer';

// --- AI draft-reply state ---------------------------------------------------
// The AI fork's star: Copilot auto-drafts a reply for a thread awaiting one.
// Never auto-sends — the draft lives in a review card above the composer.
export type AiDraftStatus = 'generating' | 'ready' | 'dismissed' | 'used';

/**
 * Per-thread draft state.
 *  - `variantIndex` — which of the two full variants is showing (Regenerate cycles).
 *  - `isShort`      — showing the ~2-sentence Shorten transform instead of a full variant.
 *  - `status`       — position in the draft lifecycle.
 */
export interface AiDraftEntry {
  variantIndex: number;
  isShort: boolean;
  status: AiDraftStatus;
  /**
   * Local thumbs feedback on the CURRENT draft variant. Mutually exclusive
   * up/down; clicking the selected one clears it. Naturally cleared whenever
   * the entry is rebuilt (Regenerate/Shorten/(re)generate) since the variant
   * changed — those actions construct a fresh entry without a feedback field.
   * Purely local prototype signal — no network.
   */
  feedback?: 'up' | 'down';
}

/**
 * When the draft is generated: 'auto' shimmers a draft the moment a thread is
 * eligible (drafts on arrival — the demo money shot); 'on-demand' waits for the
 * staff to click "Draft a reply". Industry default is on-demand; auto is the
 * aggressive minority — the toggle lets the team compare live in the room.
 */
export type AiDraftTrigger = 'auto' | 'on-demand';

/**
 * A one-shot signal that pushes draft text into the (locally-stateful)
 * composer. The composer applies it when `threadId` matches its thread and
 * `seq` is newer than the last it applied — a clean lift-free hand-off that
 * keeps the composer's own typing state intact. See EmailComposer.
 */
export interface DraftApplicationSignal {
  threadId: string;
  text: string;
  seq: number;
}

/** Generating timings: first draft feels considered; transforms feel snappy. */
const DRAFT_GEN_MS = 1200;
const DRAFT_TRANSFORM_MS = 800;

/**
 * Per-thread generation token. Every (re)generate bumps the thread's token;
 * a scheduled completion only commits if its captured token is still current.
 * Guards against stale timers from rapid Regenerate/Shorten/dismiss clicks.
 * Module-level (not React/Zustand state) — it's a scheduling guard, not UI.
 */
const draftGenToken = new Map<string, number>();
function bumpDraftToken(threadId: string): number {
  const next = (draftGenToken.get(threadId) ?? 0) + 1;
  draftGenToken.set(threadId, next);
  return next;
}

/** Resolve the text a draft entry currently displays (short vs. full variant). */
export function draftTextFor(threadId: string, entry: AiDraftEntry | undefined): string | null {
  const draft = getDraft(threadId);
  if (!draft || !entry) return null;
  if (entry.isShort) return draft.short;
  return draft.variants[entry.variantIndex] ?? draft.variants[0];
}

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

  // AI draft-reply state
  /** Per-thread AI draft state, keyed by threadId. Absent = never generated. */
  aiDrafts: Record<string, AiDraftEntry>;
  /** Auto-draft-on-arrival vs. draft-on-demand (prototype toggle). */
  aiDraftTrigger: AiDraftTrigger;
  /** One-shot signal handing draft text to the composer (see DraftApplicationSignal). */
  draftApplication: DraftApplicationSignal | null;
  /** Prototype toggle (DEFAULT OFF): show the detected-intent → suggested-action row on eligible draft cards. */
  showIntentActions: boolean;
  /** Per-thread "action taken" flag for the intent-action button (local; flips to an Added state). */
  intentActionsDone: Record<string, boolean>;

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

  // AI draft-reply actions
  /** Cached generate: shimmer → first draft. No-op if the thread already has an entry. */
  generateDraft: (threadId: string) => void;
  /** Forced generate: re-shimmer → fresh first draft even over an existing entry (demo money shot). */
  forceGenerateDraft: (threadId: string) => void;
  /** Regenerate: brief shimmer → the OTHER full variant (cycles the two). */
  regenerateDraft: (threadId: string) => void;
  /** Shorten: brief shimmer → the ~2-sentence variant (directed transform). */
  shortenDraft: (threadId: string) => void;
  /** Dismiss the card for a thread (re-summonable from the composer toolbar). */
  dismissDraft: (threadId: string) => void;
  /** Bring a dismissed draft back: brief shimmer → current variant. */
  restoreDraft: (threadId: string) => void;
  /** Accept the draft: push its text to the composer and mark the card 'used'. */
  useDraft: (threadId: string) => void;
  /** Switch auto/on-demand draft trigger (prototype toggle). */
  setAiDraftTrigger: (trigger: AiDraftTrigger) => void;
  /** Set/toggle thumbs feedback on the current draft variant (mutually exclusive; re-click clears). */
  setDraftFeedback: (threadId: string, feedback: 'up' | 'down') => void;
  /** Toggle the intent-action prototype feature on/off. */
  setShowIntentActions: (show: boolean) => void;
  /** Mark a thread's suggested intent action as taken (flips the button to Added). */
  markIntentActionDone: (threadId: string) => void;
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
  aiDrafts: {},
  // On-demand is the default: the staff summons a draft from the composer's
  // "Draft a reply" orb. Auto (draft-on-arrival) is the aggressive minority the
  // prototype toggle can flip to for a live in-the-room comparison.
  aiDraftTrigger: 'on-demand',
  draftApplication: null,
  // Intent → suggested action is a lukewarm exploration: default OFF, flipped on
  // from the prototype toggle's "AI actions" section for a live in-room look.
  showIntentActions: false,
  intentActionsDone: {},

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

      // Money shot: a reply landing on the OPEN thread force-drafts a suggested
      // reply for the just-arrived message. "Simulate incoming email" is an
      // explicit presenter action (not ambient auto-drafting), so this fires in
      // BOTH trigger modes — including on-demand, where an ordinary arrival
      // would never pop a card unbidden.
      if (threadId === selectedThreadId) {
        get().forceGenerateDraft(threadId);
      }
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

  // --- AI draft-reply actions ----------------------------------------------
  // Timers live in the actions (setTimeout); each schedules a completion that
  // only commits if its captured token is still the thread's current token AND
  // the entry is still 'generating' — so a superseding click never gets
  // clobbered by an earlier timer.

  generateDraft: (threadId: string) => {
    if (!getDraft(threadId)) return; // no scripted content for this thread
    if (get().aiDrafts[threadId]) return; // cache — no re-shimmer on revisit
    const token = bumpDraftToken(threadId);
    set((state) => ({
      aiDrafts: {
        ...state.aiDrafts,
        [threadId]: { variantIndex: 0, isShort: false, status: 'generating' },
      },
    }));
    setTimeout(() => {
      if (draftGenToken.get(threadId) !== token) return;
      set((state) => {
        const cur = state.aiDrafts[threadId];
        if (!cur || cur.status !== 'generating') return {};
        return { aiDrafts: { ...state.aiDrafts, [threadId]: { ...cur, status: 'ready' } } };
      });
    }, DRAFT_GEN_MS);
  },

  forceGenerateDraft: (threadId: string) => {
    if (!getDraft(threadId)) return;
    const token = bumpDraftToken(threadId);
    // Reset to a fresh first draft (variant 0), re-shimmering even over a
    // cached entry — used when a new inbound arrives on the open thread.
    set((state) => ({
      aiDrafts: {
        ...state.aiDrafts,
        [threadId]: { variantIndex: 0, isShort: false, status: 'generating' },
      },
    }));
    setTimeout(() => {
      if (draftGenToken.get(threadId) !== token) return;
      set((state) => {
        const cur = state.aiDrafts[threadId];
        if (!cur || cur.status !== 'generating') return {};
        return { aiDrafts: { ...state.aiDrafts, [threadId]: { ...cur, status: 'ready' } } };
      });
    }, DRAFT_GEN_MS);
  },

  regenerateDraft: (threadId: string) => {
    const draft = getDraft(threadId);
    if (!draft) return;
    const cur = get().aiDrafts[threadId];
    const nextIndex = ((cur?.variantIndex ?? 0) + 1) % draft.variants.length;
    const token = bumpDraftToken(threadId);
    // Keep showing the current variant during the shimmer; flip on completion.
    set((state) => ({
      aiDrafts: {
        ...state.aiDrafts,
        [threadId]: { variantIndex: cur?.variantIndex ?? 0, isShort: false, status: 'generating' },
      },
    }));
    setTimeout(() => {
      if (draftGenToken.get(threadId) !== token) return;
      set((state) => {
        const c = state.aiDrafts[threadId];
        if (!c || c.status !== 'generating') return {};
        return {
          aiDrafts: {
            ...state.aiDrafts,
            [threadId]: { variantIndex: nextIndex, isShort: false, status: 'ready' },
          },
        };
      });
    }, DRAFT_TRANSFORM_MS);
  },

  shortenDraft: (threadId: string) => {
    const draft = getDraft(threadId);
    if (!draft) return;
    const cur = get().aiDrafts[threadId];
    const token = bumpDraftToken(threadId);
    set((state) => ({
      aiDrafts: {
        ...state.aiDrafts,
        [threadId]: { variantIndex: cur?.variantIndex ?? 0, isShort: false, status: 'generating' },
      },
    }));
    setTimeout(() => {
      if (draftGenToken.get(threadId) !== token) return;
      set((state) => {
        const c = state.aiDrafts[threadId];
        if (!c || c.status !== 'generating') return {};
        return {
          aiDrafts: {
            ...state.aiDrafts,
            [threadId]: { variantIndex: c.variantIndex, isShort: true, status: 'ready' },
          },
        };
      });
    }, DRAFT_TRANSFORM_MS);
  },

  dismissDraft: (threadId: string) => {
    bumpDraftToken(threadId); // cancel any in-flight generation
    set((state) => {
      const cur = state.aiDrafts[threadId];
      return {
        aiDrafts: {
          ...state.aiDrafts,
          [threadId]: {
            variantIndex: cur?.variantIndex ?? 0,
            isShort: cur?.isShort ?? false,
            status: 'dismissed',
          },
        },
      };
    });
  },

  restoreDraft: (threadId: string) => {
    if (!getDraft(threadId)) return;
    const cur = get().aiDrafts[threadId];
    const token = bumpDraftToken(threadId);
    set((state) => ({
      aiDrafts: {
        ...state.aiDrafts,
        [threadId]: {
          variantIndex: cur?.variantIndex ?? 0,
          isShort: cur?.isShort ?? false,
          status: 'generating',
        },
      },
    }));
    setTimeout(() => {
      if (draftGenToken.get(threadId) !== token) return;
      set((state) => {
        const c = state.aiDrafts[threadId];
        if (!c || c.status !== 'generating') return {};
        return { aiDrafts: { ...state.aiDrafts, [threadId]: { ...c, status: 'ready' } } };
      });
    }, DRAFT_TRANSFORM_MS);
  },

  useDraft: (threadId: string) => {
    const cur = get().aiDrafts[threadId];
    const text = draftTextFor(threadId, cur);
    if (!cur || text == null) return;
    bumpDraftToken(threadId); // cancel any in-flight generation
    set((state) => ({
      aiDrafts: { ...state.aiDrafts, [threadId]: { ...cur, status: 'used' } },
      draftApplication: {
        threadId,
        text,
        seq: (state.draftApplication?.seq ?? 0) + 1,
      },
    }));
  },

  setAiDraftTrigger: (trigger: AiDraftTrigger) => {
    // Switching TO on-demand should cleanly remove any auto-generated cards so
    // the composer orb takes over: drop every 'generating'/'ready' entry (and
    // bump its token so an in-flight timer can't resurrect it). 'used' and
    // 'dismissed' entries are user history — keep them. Switching TO auto needs
    // no clearing; EmailThreadView's auto-draft effect (aiDraftTrigger is in its
    // deps) regenerates for the open thread.
    if (trigger === 'on-demand') {
      set((state) => {
        const next: Record<string, AiDraftEntry> = {};
        for (const [threadId, entry] of Object.entries(state.aiDrafts)) {
          if (entry.status === 'generating' || entry.status === 'ready') {
            bumpDraftToken(threadId); // cancel any in-flight completion timer
            continue; // drop the live entry
          }
          next[threadId] = entry; // keep 'used' / 'dismissed' history
        }
        return { aiDraftTrigger: trigger, aiDrafts: next };
      });
      return;
    }
    set({ aiDraftTrigger: trigger });
  },

  setDraftFeedback: (threadId: string, feedback: 'up' | 'down') => {
    set((state) => {
      const cur = state.aiDrafts[threadId];
      if (!cur) return {};
      // Mutually exclusive: re-clicking the selected thumb clears it.
      const next = cur.feedback === feedback ? undefined : feedback;
      return { aiDrafts: { ...state.aiDrafts, [threadId]: { ...cur, feedback: next } } };
    });
  },

  setShowIntentActions: (show: boolean) => {
    set({ showIntentActions: show });
  },

  markIntentActionDone: (threadId: string) => {
    set((state) => ({
      intentActionsDone: { ...state.intentActionsDone, [threadId]: true },
    }));
  },
}));
