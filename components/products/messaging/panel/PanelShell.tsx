/**
 * PanelShell — the Conversation Details panel's floating card.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * THE PANEL STANDARD (Miguel's ruling, 2026-08-20)
 * ═══════════════════════════════════════════════════════════════════════════
 *   • FIXED 600px wide. Not a percentage, not a range: the panel's contents are
 *     a two-column control row, a label/value band and a four-tab strip, all of
 *     which have one right layout. A resizable panel would buy nothing and cost
 *     four breakpoints.
 *   • 12px to the TOP, RIGHT and BOTTOM of the VIEWPORT — the same gap on all
 *     three sides, so the card reads as one object floating over the app rather
 *     than as a drawer hinged to an edge. Height is whatever the viewport
 *     leaves; content scrolls INSIDE.
 *   • It overlays EVERYTHING, the app top bar included. The previous panel
 *     tucked itself under the top bar (top = topBarHeight + 16), which made it
 *     read as part of the page. This one is above the chrome.
 *   • rounded-16, 1px colorBlack6 border, NO shadow — the branch-wide rule. The
 *     border and the scrim do the separating.
 *
 * ⚠ This is deliberately NOT `<FloatingPanel>`. That shell is still the right
 * one for the BROADCAST panels (480px, tucked under the top bar, shadowed) and
 * they are untouched. The two panels have genuinely different jobs; forcing one
 * component to be both would mean five props that each mean "be the other one".
 * The MECHANIC below — two-phase mount, reduced-motion downgrade, scrim — is
 * the same idea, kept in step deliberately.
 *
 * ⚠ AND IT IS NOT `<CanarySideSheet>` EITHER — a STRUCTURAL EXCEPTION, not a
 * preference. The library's side sheet is EDGE-HINGED (`right-0 top-0
 * bottom-0`, no viewport inset, no corner radius), which is the one thing the
 * standard above rules out. It renders and unmounts with NO animation at all —
 * no slide, no two-phase mount, no reduced-motion path. It hardwires its own
 * header row, its own close button and `shadows.xl`, where this branch draws no
 * shadows anywhere and owns its header. And it mounts at `zIndex.modal + 1`,
 * with no prop to change it, which would stack the panel ABOVE the unlink
 * confirm `CanaryModal` (50) and invert the exact z-order the Z-ORDER note
 * below exists to guarantee.
 *
 * Every one of those is load-bearing here, so the panel standard cannot be
 * expressed on the base. It is already seeded on the promotion list as the
 * "side-panel standard" — the ask being an inset/floating variant of
 * `CanarySideSheet` with a mount transition, an optional header, and a
 * settable z-index.
 *
 * Z-ORDER: panel 45 / scrim 44. Both above the V2 top bar (which takes no
 * z-index of its own) and both BELOW `zIndex.modal` (50), so a CanaryModal
 * opened from inside the panel — the unlink confirm — stacks above it.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { colors } from '@canary-ui/components';

/** The one number that defines the standard: the viewport gap on all three sides. */
export const PANEL_INSET = 12;
export const PANEL_WIDTH = 600;
export const PANEL_RADIUS = 16;

export const PANEL_ANIM_MS = 240;
export const PANEL_ENTER_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
export const PANEL_EXIT_EASE = 'cubic-bezier(0.4, 0, 1, 1)';
export const PANEL_REDUCED_MS = 120;

interface PanelShellProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** The dialog's accessible name. Two panels now use this shell. */
  label?: string;
}

/**
 * `prefers-reduced-motion: reduce`, live. Every animated surface in the panel
 * reads it from here rather than re-implementing the listener: the shell's
 * slide, and the details band's expand, must agree about whether motion is on.
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

export function PanelShell({ isOpen, onClose, children, label = 'Conversation Details' }: PanelShellProps) {
  const reduced = useReducedMotion();

  // Two-phase mount: `mounted` keeps the panel in the DOM through its exit
  // transition; `entered` drives the open/closed styles and flips on the second
  // animation frame, so the browser paints the off-screen start position first.
  // Rapid toggling can't wedge it half-open.
  const [mounted, setMounted] = useState(isOpen);
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (isOpen) {
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
    setEntered(false);
    const t = setTimeout(() => setMounted(false), reduced ? PANEL_REDUCED_MS : PANEL_ANIM_MS);
    return () => clearTimeout(t);
  }, [isOpen, reduced]);

  if (!mounted) return null;

  const ease = entered ? PANEL_ENTER_EASE : PANEL_EXIT_EASE;
  const panelTransition = reduced
    ? `opacity ${PANEL_REDUCED_MS}ms linear`
    : `transform ${PANEL_ANIM_MS}ms ${ease}, opacity ${PANEL_ANIM_MS}ms ${ease}`;
  const scrimTransition = reduced
    ? `opacity ${PANEL_REDUCED_MS}ms linear`
    : `opacity ${PANEL_ANIM_MS}ms ${ease}`;
  const panelTransform = reduced
    ? undefined
    : entered
      ? 'translateX(0)'
      : `translateX(calc(100% + ${PANEL_INSET}px))`;

  return (
    <>
      {/* Scrim — now FULL viewport, because the panel clears the top bar too.
          Click closes, in lockstep with the slide. */}
      <div
        aria-hidden
        onClick={onClose}
        className="fixed inset-0"
        style={{
          backgroundColor: 'rgba(0,0,0,0.10)',
          opacity: entered ? 1 : 0,
          pointerEvents: entered ? 'auto' : 'none',
          transition: scrimTransition,
          zIndex: 44,
        }}
      />

      <div
        role="dialog"
        aria-label={label}
        className="fixed overflow-hidden flex flex-col"
        style={{
          top: PANEL_INSET,
          right: PANEL_INSET,
          bottom: PANEL_INSET,
          width: PANEL_WIDTH,
          backgroundColor: colors.colorWhite,
          border: `1px solid ${colors.colorBlack6}`,
          borderRadius: PANEL_RADIUS,
          zIndex: 45,
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
