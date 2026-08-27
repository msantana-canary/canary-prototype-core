/**
 * MessageFeed Component — REDESIGN
 *
 * Scrollable container displaying flat message blocks grouped by day.
 * Bottom-anchored via mt-auto on the inner column (NOT justify-end on the
 * scroll container — that breaks scrolling for overflowing content).
 *
 * Auto-scrolls by setting this container's own scrollTop. Deliberately NOT
 * scrollIntoView: that walks every scrollable ancestor up to the document, so
 * whenever the document has any scrollable overflow it drags the whole app
 * shell upward and paints white below it.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MessageBubble } from './MessageBubble';
import { DateSeparator } from './DateSeparator';
import { Message } from '@/lib/products/messaging/types';
import { Guest } from '@/lib/core/types/guest';
import { formatDateSeparator, isSameCalendarDay } from '@/lib/utils/date-helpers';
import { useMessagingStore } from '@/lib/products/messaging/store';

interface MessageFeedProps {
  messages: Message[];
  guest?: Guest | null;
  /** Which thread this feed is showing — see `openSnapshot` below; this is
   *  the ONLY way the feed can tell "just switched here" from "still here". */
  threadId: string;
}

/**
 * How close to the bottom still counts as "at the bottom". A couple of pixels
 * of sub-pixel rounding must not read as "the user scrolled away".
 */
const PIN_TOLERANCE_PX = 24;

export function MessageFeed({ messages, guest, threadId }: MessageFeedProps) {
  // Maya's live "AI thinking" demo sequence (see `useThreadDemoSequence`) —
  // read once here rather than inside every `MessageBubble`, and handed down
  // only to the ONE message it names. Null on every other thread/message.
  const demoThinkingMessageId = useMessagingStore((s) => s.demoThinkingMessageId);
  const demoThinkingLabel = useMessagingStore((s) => s.demoThinkingLabel);

  /**
   * NEW-MESSAGE ARRIVAL — which ids get a gentle entrance (`.message-arrival-
   * enter` in `globals.css`) vs. render static. See Miguel's polish-pass fix
   * #1 (2026-08-27): the demo sequence's guest message and AI block used to
   * pop into the feed with no transition, but a thread's EXISTING history
   * must never cascade in when you open it.
   *
   * `openSnapshot` is "the message ids that were already here the moment
   * THIS thread was opened" — captured once per `threadId`, the same
   * "adjust state while rendering" pattern React documents for resetting
   * state when a prop changes (https://react.dev/reference/react/useState
   * #storing-information-from-previous-renders): read during render, so the
   * very first paint of a newly-opened thread already has the right
   * snapshot, no one-frame flash where last thread's snapshot is still live.
   *
   * Deliberately NOT a `useMemo` — this is a piece of remembered STATE (what
   * was here when we arrived), not a derived value safe to recompute from
   * current inputs; React is allowed to discard a memo and recompute it later
   * from `messages`, which would silently forget the snapshot and misclassify
   * every already-landed message as a fresh arrival.
   *
   * A message id NOT in the snapshot is "new" — arrived after the thread was
   * already on screen — and that flag is READ ONLY ONCE, at the render where
   * that id's row first mounts (a one-shot CSS `animation`, not a `transition`,
   * so there is nothing to keep in sync on later re-renders; see the class
   * itself). It is never written back into the snapshot, so it stays "new"
   * for the rest of this thread-open session — harmless, since the class only
   * plays once on mount regardless of how many times the row's props change
   * afterward.
   */
  const [openSnapshot, setOpenSnapshot] = useState<{ threadId: string; seenIds: Set<string> }>(
    () => ({ threadId, seenIds: new Set(messages.map((m) => m.id)) })
  );
  if (threadId !== openSnapshot.threadId) {
    setOpenSnapshot({ threadId, seenIds: new Set(messages.map((m) => m.id)) });
  }
  const isNewArrival = (messageId: string) =>
    openSnapshot.threadId === threadId && !openSnapshot.seenIds.has(messageId);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  /** Is the feed resting at the bottom? */
  const isPinnedRef = useRef(true);
  /**
   * The scrollTop THIS COMPONENT last assigned.
   *
   * ⚠ Load-bearing, and the reason the naive version of this did not work.
   * Scroll events are delivered asynchronously, so a `scrollTop = scrollHeight`
   * during a 220ms expansion is followed — several frames later, after the
   * content has grown further — by a scroll event measuring a gap that is no
   * longer zero. Read literally, that event says "the user scrolled away", and
   * the feed unpins itself halfway through following its own growth.
   *
   * Comparing against the value we set tells the two apart: a scroll event that
   * agrees with the last assignment is our own echo and changes nothing; one
   * that disagrees is a hand on the wheel.
   */
  const selfScrollTopRef = useRef<number | null>(null);

  const pinToBottom = (el: HTMLDivElement) => {
    el.scrollTop = el.scrollHeight;
    selfScrollTopRef.current = el.scrollTop;
  };

  // Auto-scroll to bottom when messages change — container-scoped.
  useEffect(() => {
    if (containerRef.current) {
      pinToBottom(containerRef.current);
      isPinnedRef.current = true;
    }
  }, [messages]);

  /**
   * THE FEED FOLLOWS ITS OWN GROWTH.
   *
   * The only auto-scroll used to fire on the MESSAGE ARRAY changing, so
   * anything that grew a message in place — the AI steps trace, which is the
   * demo's hero observability click — pushed itself and the answer under the
   * composer and left them there. Opening an 8-step trace on the newest message
   * made the reply disappear.
   *
   * So the content column is observed, and a feed that WAS at the bottom is
   * kept at the bottom while it grows. Two things this deliberately is not:
   *
   *  • It is not `scrollIntoView` on the trace. That walks every scrollable
   *    ancestor to the document and drags the whole app shell (the reason the
   *    original auto-scroll is container-scoped in the first place).
   *  • It is not unconditional. A hotelier who has scrolled UP to read history
   *    is reading history; yanking her back down because a trace opened
   *    somewhere below would be the feed overruling her.
   *
   * Pinning is a position assignment, not an animation, so it adds no motion of
   * its own — nothing here to reduce under `prefers-reduced-motion`. The trace's
   * own 220ms open is already reduced-motion-aware in `ExpandRegion`, and the
   * observer simply tracks whatever height it lands on, frame by frame.
   */
  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => {
      if (!isPinnedRef.current) return;
      pinToBottom(container);
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    // Our own echo — see `selfScrollTopRef`. Never let it unpin the feed.
    if (selfScrollTopRef.current !== null && Math.abs(el.scrollTop - selfScrollTopRef.current) < 1) {
      return;
    }
    selfScrollTopRef.current = null;
    isPinnedRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight <= PIN_TOLERANCE_PX;
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-gray-400 text-center font-['Roboto',sans-serif] text-[14px]">
          No messages yet.<br />
          Start a conversation with this guest.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto flex flex-col"
      style={{ paddingTop: 16 }}
    >
      <div ref={contentRef} className="flex flex-col mt-auto">
        {messages.map((message, index) => {
          const showDateSeparator =
            index === 0 ||
            !isSameCalendarDay(
              new Date(message.timestamp),
              new Date(messages[index - 1].timestamp)
            );

          // Read once per id — see `isNewArrival` above for why re-reading it
          // on later renders would be harmless anyway (a CSS animation only
          // plays when the class is present at the row's OWN mount).
          const arrivalClass = isNewArrival(message.id) ? 'message-arrival-enter' : undefined;

          return (
            <React.Fragment key={message.id}>
              {showDateSeparator && (
                <DateSeparator label={formatDateSeparator(new Date(message.timestamp))} />
              )}
              <div className={arrivalClass}>
                <MessageBubble
                  message={message}
                  guest={guest}
                  thinkingLabel={message.id === demoThinkingMessageId ? demoThinkingLabel ?? undefined : undefined}
                />
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
