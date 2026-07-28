/**
 * FloatingPanel — the messaging surface's floating right-side panel mechanic.
 *
 * Extracted verbatim from GuestInfoSidebar (Conversation Details) so the
 * broadcast delivery panel can reuse the exact same shell rather than growing a
 * second, drifting copy. Behaviour is unchanged from the v3 sidebar:
 *
 *  - A fixed white card inset from the window edges — top 72 / right 16 /
 *    bottom 16 — so it floats BELOW the 56px legacy shell header. rounded-12,
 *    1px colorBlack6 border, large soft shadow.
 *  - A subtle scrim (rgba(0,0,0,0.10)) covers the app below the shell header,
 *    fades in with the panel, and closes it on click.
 *  - Two-phase mount: `mounted` keeps the panel in the DOM through the exit
 *    transition so the slide-out is visible; `entered` drives the open/closed
 *    styles, flipped on the second animation frame so the browser paints the
 *    off-screen start position first. Rapid toggling can't wedge it half-open.
 *  - prefers-reduced-motion downgrades to a near-instant fade, no translate.
 *  - Panel z-index 40 / scrim 39, both BELOW @canary-ui's `zIndex.modal` (50),
 *    so any CanaryModal opened from inside the panel stacks above it.
 *
 * No animation libraries.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { colors } from '@canary-ui/components';

export const PANEL_ANIM_MS = 240;
export const PANEL_ENTER_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
export const PANEL_EXIT_EASE = 'cubic-bezier(0.4, 0, 1, 1)';
export const PANEL_REDUCED_MS = 120;

interface FloatingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  /** Panel width in px. 600 is the Conversation Details register. */
  width?: number;
  children: React.ReactNode;
}

export function FloatingPanel({ isOpen, onClose, width = 600, children }: FloatingPanelProps) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const [mounted, setMounted] = useState(isOpen);
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (isOpen) {
      // Mount first, then flip to the open state on the next frame so the browser
      // paints the off-screen start position and the transition actually runs.
      setMounted(true);
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setEntered(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }
    // Closing: play the exit, then unmount once it finishes. Clearing this timer
    // on re-open keeps rapid toggling from wedging the panel in a half state.
    setEntered(false);
    const t = setTimeout(() => setMounted(false), reduced ? PANEL_REDUCED_MS : PANEL_ANIM_MS);
    return () => clearTimeout(t);
  }, [isOpen, reduced]);

  // Once the exit transition has finished the panel leaves the DOM entirely.
  if (!mounted) return null;

  const ease = entered ? PANEL_ENTER_EASE : PANEL_EXIT_EASE;
  const panelTransition = reduced
    ? `opacity ${PANEL_REDUCED_MS}ms linear`
    : `transform ${PANEL_ANIM_MS}ms ${ease}, opacity ${PANEL_ANIM_MS}ms ${ease}`;
  const scrimTransition = reduced
    ? `opacity ${PANEL_REDUCED_MS}ms linear`
    : `opacity ${PANEL_ANIM_MS}ms ${ease}`;
  const panelTransform = reduced ? undefined : entered ? 'translateX(0)' : 'translateX(calc(100% + 16px))';

  return (
    <>
      {/* Scrim — subtle tint over the app behind the panel; click closes. Fades
          in/out in lockstep with the panel slide. */}
      <div
        aria-hidden
        onClick={onClose}
        className="fixed left-0 right-0 bottom-0"
        style={{
          top: 56,
          backgroundColor: 'rgba(0,0,0,0.10)',
          opacity: entered ? 1 : 0,
          pointerEvents: entered ? 'auto' : 'none',
          transition: scrimTransition,
          zIndex: 39,
        }}
      />

      {/* Floating panel — slides in from off-screen-right to its resting inset on
          open, and back out on close (see the two-phase mount/visible state). */}
      <div
        className="fixed overflow-hidden"
        style={{
          top: 72,
          right: 16,
          bottom: 16,
          width,
          backgroundColor: colors.colorWhite,
          border: `1px solid ${colors.colorBlack6}`,
          borderRadius: 12,
          boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
          zIndex: 40,
          transform: panelTransform,
          opacity: entered ? 1 : 0,
          pointerEvents: entered ? 'auto' : 'none',
          transition: panelTransition,
          willChange: 'transform, opacity',
        }}
      >
        {children}
      </div>
    </>
  );
}
