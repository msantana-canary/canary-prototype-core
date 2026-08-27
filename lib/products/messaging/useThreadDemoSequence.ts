'use client';

import { useEffect, useRef } from 'react';
import { useMessagingStore } from './store';
import {
  MAYA_DEMO_THREAD_ID,
  mayaDemoGuestMessage,
  mayaDemoAiReply,
  mayaDemoThinkingLabels,
} from './mock-data';
import { aiExplanations } from './ai-mock';
import { Message } from './types';

/**
 * Maya Patel's scripted, live "AI thinking" sequence — Miguel's SJ-demo beat,
 * modeled on Claude desktop's crossfading status label.
 *
 * ── TRIGGER ────────────────────────────────────────────────────────────────
 * The FIRST time her thread (`MAYA_DEMO_THREAD_ID`) is selected in a session.
 * "In a session" is `demoSequencePlayed` in the store, which carries no
 * persistence middleware — a page reload resets it, so reloading is how
 * Miguel replays the sequence for rehearsal. Re-selecting her thread later in
 * the SAME session (without a reload) finds it already landed, same as any
 * other conversation.
 *
 * ── SCRIPT (all times relative to selection) ────────────────────────────────
 *   t=0        typing indicator on ("Maya Patel is typing")
 *   t=2500ms   typing off; her guest message lands (`mayaDemoGuestMessage`)
 *   t=3000ms   AI block appears — THINKING state, label[0]
 *   t=4650ms   label[1]   ┐
 *   t=6300ms   label[2]   │ 1.4s hold + 250ms crossfade per label
 *   t=7950ms   label[3]   │ (see `STEP_MS` — MessageBubble owns the fade)
 *   t=9600ms   label[4]   ┘
 *   t=11250ms  COMPLETE — real message lands (content, steps, explanation,
 *              sourceCount), status walks the normal Sending→Sent→Delivered
 *              ladder like any other live send.
 *
 * ── CLEANUP / INTERRUPTION ───────────────────────────────────────────────
 * Switching threads mid-sequence must never strand a half-typed guest message
 * or a half-thought AI block. The effect's cleanup cancels every pending
 * timer and, if the thread whose sequence was running is no longer the
 * SELECTED thread (a real navigation-away, not React StrictMode's dev-only
 * double-invoke — see the guard below), fast-forwards straight to the landed
 * state and marks the sequence played.
 *
 * ⚠ THE STRICTMODE GUARD IS LOAD-BEARING. Next's dev server runs React
 * StrictMode, which mounts this effect, cleans it up, and mounts it again —
 * synchronously, before any of the timers above have fired — purely to
 * surface impure effects. A cleanup that unconditionally fast-forwarded would
 * read that phantom unmount as "the user already left" and skip straight to
 * the completed state on every dev-mode selection, which is exactly the demo
 * this hook exists to animate. The tell: on a real navigation-away, the
 * STORE'S `selectedThreadId` has already changed by the time cleanup runs (React
 * commits the new selection before tearing down the old effect); on
 * StrictMode's phantom pass it has not. Reading the live store rather than
 * the captured argument is what makes that check honest.
 */
export function useThreadDemoSequence(selectedThreadId: string | null) {
  const timeoutIdsRef = useRef<number[]>([]);

  useEffect(() => {
    if (selectedThreadId !== MAYA_DEMO_THREAD_ID) return;

    const store = useMessagingStore;
    if (store.getState().demoSequencePlayed[MAYA_DEMO_THREAD_ID]) return;

    const schedule = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms);
      timeoutIdsRef.current.push(id);
    };

    // t=0 — typing starts immediately, the moment the thread is selected.
    store.getState().setGuestTyping(MAYA_DEMO_THREAD_ID);

    const TYPING_MS = 2500;
    const BEAT_MS = 500;
    // 250ms crossfade + 1.4s hold, per label (see the file header's script).
    const STEP_MS = 1650;

    schedule(() => {
      const s = store.getState();
      s.setGuestTyping(null);
      addMayaMessageIfAbsent(mayaDemoGuestMessage);
      s.updateThreadLastMessage(MAYA_DEMO_THREAD_ID, mayaDemoGuestMessage);
    }, TYPING_MS);

    schedule(() => {
      addMayaMessageIfAbsent({ ...mayaDemoAiReply, content: '', aiSteps: [] });
      store.getState().setDemoThinking(mayaDemoAiReply.id, mayaDemoThinkingLabels[0]);
    }, TYPING_MS + BEAT_MS);

    mayaDemoThinkingLabels.forEach((label, i) => {
      if (i === 0) return; // set above, the moment the block appears
      schedule(() => {
        store.getState().setDemoThinking(mayaDemoAiReply.id, label);
      }, TYPING_MS + BEAT_MS + STEP_MS * i);
    });

    schedule(() => {
      completeMayaSequence();
    }, TYPING_MS + BEAT_MS + STEP_MS * mayaDemoThinkingLabels.length);

    return () => {
      timeoutIdsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutIdsRef.current = [];

      // Real abandonment vs. StrictMode's synchronous phantom cleanup — see
      // the file header. If the store still thinks Maya's thread is selected,
      // this is the phantom pass (or an unrelated re-render): do nothing, and
      // let the very next mount pick the script back up from t=0.
      if (store.getState().selectedThreadId === MAYA_DEMO_THREAD_ID) return;

      // A genuine switch-away. Nothing stays half-rendered: land the whole
      // sequence now, silently, so the thread reads as "done" whenever
      // anyone opens it again this session.
      const played = store.getState().demoSequencePlayed[MAYA_DEMO_THREAD_ID];
      const hasAnyMayaMessage = (store.getState().messages[MAYA_DEMO_THREAD_ID] ?? []).some(
        (m) => m.id === mayaDemoGuestMessage.id || m.id === mayaDemoAiReply.id
      );
      if (!played && (hasAnyMayaMessage || store.getState().typingThreadId === MAYA_DEMO_THREAD_ID)) {
        store.getState().setGuestTyping(null);
        addMayaMessageIfAbsent(mayaDemoGuestMessage);
        completeMayaSequence();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedThreadId]);
}

/** Adds a message to Maya's thread only if that id isn't already there —
 *  guards every insertion point against StrictMode / re-entry duplicating a
 *  step that already landed. */
function addMayaMessageIfAbsent(message: Message) {
  const store = useMessagingStore;
  const existing = store.getState().messages[MAYA_DEMO_THREAD_ID] ?? [];
  if (existing.some((m) => m.id === message.id)) return;
  store.getState().addMessage(MAYA_DEMO_THREAD_ID, message);
}

/**
 * Lands the real reply — content, steps, the `ai-mock.ts` explanation and its
 * derived `sourceCount` (the same invariant `mock-data.ts`'s decoration pass
 * enforces at load time, applied here at sequence-completion instead) — then
 * clears the thinking state, walks the normal delivery ladder, and marks the
 * sequence played so it can never replay this session.
 */
function completeMayaSequence() {
  const store = useMessagingStore;
  const explanation = aiExplanations[mayaDemoAiReply.id];
  const finalMessage: Message = {
    ...mayaDemoAiReply,
    aiExplanation: explanation,
    sourceCount: explanation?.sources.length,
  };

  store.setState((state) => {
    const existing = state.messages[MAYA_DEMO_THREAD_ID] ?? [];
    const hasPlaceholder = existing.some((m) => m.id === finalMessage.id);
    return {
      messages: {
        ...state.messages,
        [MAYA_DEMO_THREAD_ID]: hasPlaceholder
          ? existing.map((m) => (m.id === finalMessage.id ? finalMessage : m))
          : [...existing, finalMessage],
      },
      demoThinkingMessageId: null,
      demoThinkingLabel: null,
      demoSequencePlayed: { ...state.demoSequencePlayed, [MAYA_DEMO_THREAD_ID]: true },
    };
  });

  const s = store.getState();
  s.updateThreadLastMessage(MAYA_DEMO_THREAD_ID, finalMessage);
  s.walkDeliveryLadder(MAYA_DEMO_THREAD_ID, finalMessage.id);
}
