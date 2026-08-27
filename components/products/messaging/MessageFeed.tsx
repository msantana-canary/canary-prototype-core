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

import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { DateSeparator } from './DateSeparator';
import { Message } from '@/lib/products/messaging/types';
import { Guest } from '@/lib/core/types/guest';
import { formatDateSeparator, isSameCalendarDay } from '@/lib/utils/date-helpers';
import { useMessagingStore } from '@/lib/products/messaging/store';

interface MessageFeedProps {
  messages: Message[];
  guest?: Guest | null;
}

/**
 * How close to the bottom still counts as "at the bottom". A couple of pixels
 * of sub-pixel rounding must not read as "the user scrolled away".
 */
const PIN_TOLERANCE_PX = 24;

export function MessageFeed({ messages, guest }: MessageFeedProps) {
  // Maya's live "AI thinking" demo sequence (see `useThreadDemoSequence`) —
  // read once here rather than inside every `MessageBubble`, and handed down
  // only to the ONE message it names. Null on every other thread/message.
  const demoThinkingMessageId = useMessagingStore((s) => s.demoThinkingMessageId);
  const demoThinkingLabel = useMessagingStore((s) => s.demoThinkingLabel);

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

          return (
            <React.Fragment key={message.id}>
              {showDateSeparator && (
                <DateSeparator label={formatDateSeparator(new Date(message.timestamp))} />
              )}
              <MessageBubble
                message={message}
                guest={guest}
                thinkingLabel={message.id === demoThinkingMessageId ? demoThinkingLabel ?? undefined : undefined}
              />
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
