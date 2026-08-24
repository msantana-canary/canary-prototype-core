/**
 * Motion primitives — the surface's ONE expand register, and the media query
 * that governs it.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WHY THIS FILE EXISTS
 * ═══════════════════════════════════════════════════════════════════════════
 * `ExpandRegion` and `useMountedThrough` were born in the Conversation Details
 * panel (batch 3.1, extracted into `panel/panel-ui.tsx` in batch 6) because two
 * accordions in one panel had started easing differently. The MESSAGE FEED now
 * has a third expander — the AI steps trace — and it is not part of the panel.
 *
 * Importing `panel-ui` into `MessageBubble` to get one animation would have
 * dragged the whole panel vocabulary (PanelHeader, PanelTag, DetailRows,
 * RowList, the copy affordance) into the thread, which is the wrong layering:
 * the thread does not belong to the panel and must not depend on it. So the
 * mechanism moves DOWN to a module both can sit above, rather than sideways.
 *
 * `panel/panel-ui.tsx` and `panel/PanelShell.tsx` re-export what they used to
 * own, so every existing import site is untouched and there is still exactly
 * one implementation.
 */

'use client';

import React, { useEffect, useState } from 'react';

/**
 * `prefers-reduced-motion: reduce`, live.
 *
 * Every animated surface reads it from here rather than re-implementing the
 * listener: the panel's slide, the panel's expanders and the thread's steps
 * trace must all agree about whether motion is on.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return reduced;
}

/**
 * Opening is the slower of the two: it is the motion that has to be READ (a
 * block of record appearing under your click). Closing is a dismissal, and a
 * dismissal that lingers reads sticky. ONE pair of numbers for the whole
 * surface — the reservation-details band, Linked Reservations, and the thread's
 * steps trace all open at the same speed, because they are all the same gesture.
 */
export const REGION_OPEN_MS = 220;
export const REGION_CLOSE_MS = 160;

/**
 * A block that grows and shrinks to the height of its OWN content.
 *
 * WHY `grid-template-rows`. Height cannot be transitioned from `auto`, and a
 * measured max-height has to guess a number that a two-line summary and a
 * nine-row reservation record do not share. `0fr → 1fr` on a one-row grid
 * animates to the content's own height, whatever it is, with `overflow: hidden`
 * on the track so nothing flashes a scrollbar on the way.
 *
 * `animateOnMount` is for a region whose PARENT decides when it exists —
 * `CanaryExpand` mounts its body only while expanded, so that body arrives
 * already open and would otherwise snap. With the flag it paints closed for one
 * frame and then grows. A region that is permanently mounted (the companion
 * row's summary line, which merely inverts) leaves it off and mounts in its
 * current state. The thread's steps trace uses it too, for the same reason:
 * `MessageBubble` renders the trace under `isStepsOpen &&`.
 *
 * `inert` while closed keeps whatever is inside a shut region out of the tab
 * order.
 */
export function ExpandRegion({
  isOpen,
  animateOnMount = false,
  children,
}: {
  isOpen: boolean;
  animateOnMount?: boolean;
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  const [isRevealed, setIsRevealed] = useState(animateOnMount ? false : isOpen);

  useEffect(() => {
    if (!isOpen) {
      setIsRevealed(false);
      return;
    }
    if (reduced) {
      setIsRevealed(true);
      return;
    }
    // One frame at 0fr, so the browser has a height to transition FROM.
    const frame = window.requestAnimationFrame(() => setIsRevealed(true));
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen, reduced]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: isRevealed ? '1fr' : '0fr',
        transition: reduced
          ? 'none'
          : isRevealed
            ? `grid-template-rows ${REGION_OPEN_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`
            : `grid-template-rows ${REGION_CLOSE_MS}ms cubic-bezier(0.4, 0, 1, 1)`,
      }}
    >
      <div
        style={{
          minHeight: 0,
          overflow: 'hidden',
          opacity: isRevealed ? 1 : 0,
          transition: reduced
            ? 'none'
            : isRevealed
              ? 'opacity 170ms ease-out 60ms'
              : 'opacity 110ms ease-in',
        }}
      >
        <div inert={!isRevealed}>{children}</div>
      </div>
    </div>
  );
}

/**
 * Keeps content mounted through its own CLOSE animation.
 *
 * The general problem: a parent that renders its body under `isOpen &&` throws
 * that body away on the first frame of closing, so there is nothing left to
 * animate out. Feeding the parent THIS value instead of the raw flag keeps
 * `isOpen`'s meaning honest — "the body is on screen" — for the extra 160ms it
 * still is.
 *
 * Two callers: `CanaryExpand` in the panel, which owns its own mounting, and
 * `MessageBubble`'s steps trace, which owns its own.
 *
 * Under `prefers-reduced-motion` there is no animation to wait for, so the body
 * goes immediately.
 */
export function useMountedThrough(isOpen: boolean, closeMs = REGION_CLOSE_MS): boolean {
  const reduced = useReducedMotion();
  const [isMounted, setIsMounted] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      return;
    }
    if (reduced) {
      setIsMounted(false);
      return;
    }
    const timer = window.setTimeout(() => setIsMounted(false), closeMs);
    return () => window.clearTimeout(timer);
  }, [isOpen, reduced, closeMs]);

  return isMounted;
}
