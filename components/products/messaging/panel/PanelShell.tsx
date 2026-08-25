/**
 * PanelShell — the surface's ONE floating panel.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * THE PANEL STANDARD (Miguel's ruling, 2026-08-20; extended 2026-08-24)
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
 * ── `FloatingPanel` IS GONE (2026-08-24) ──────────────────────────────────
 * This file used to carry a note explaining why the broadcast panels kept their
 * own shell: 480px, tucked under the top bar, shadowed, "genuinely different
 * jobs". They do not have different jobs. All four are the same object — a
 * right-hand card that holds one list you opened from the surface behind it —
 * and the differences were the accidents of having been written months apart.
 *
 * Two shells meant two widths, two z-index pairs, two insets, two mount
 * mechanics kept "in step deliberately" by hand, and a shadow on one branch of
 * a surface whose standing rule is that nothing casts one. So the three
 * broadcast panels (filter/recipients, Message details, scheduled detail) went
 * on THIS shell and `FloatingPanel` was deleted rather than left orphaned.
 *
 * ⚠ FILTER/RECIPIENTS MOVED OFF THIS SHELL (2026-08-25) — it is a `CanaryModal`
 * now (`BroadcastFilterPanel`'s own header explains why: Miguel's ruling was a
 * modal all along, and the panel shape here was a spec miss from this very
 * consolidation). Message details (`BroadcastDeliveryPanel`) and scheduled
 * detail (`BroadcastScheduledPanel`) are still the two broadcast panels on this
 * shell.
 *
 * What changed for them, and all of it is the standard asserting itself:
 * 480 → 600px, under-the-top-bar → over everything, 16px insets → 12px,
 * rounded-12 → 16, z 40/39 → 45/44, and the shadow is gone. Their CONTENTS and
 * behaviour are untouched — this was a shell swap, not a redesign.
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

import React, { useEffect, useRef, useState } from 'react';
import { colors } from '@canary-ui/components';
import { useReducedMotion } from '../motion';
import { useEscapeLayer } from '@/lib/products/messaging/escape-stack';

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
  /**
   * The dialog's accessible name. FOUR panels use this shell now — Conversation
   * Details, the call-details drill-in, and the two remaining broadcast ones
   * (filter/recipients moved to a `CanaryModal`, see above) — so the default is
   * only a fallback, never a description.
   */
  label?: string;
}

/**
 * `prefers-reduced-motion: reduce` — RE-EXPORTED, not owned (2026-08-24). It
 * lives in `../motion` now, beside the expand register that reads it, because
 * the message feed's steps trace needs the same answer and must not import the
 * panel to get it. Existing call sites are unchanged.
 */
export { useReducedMotion } from '../motion';

export function PanelShell({ isOpen, onClose, children, label = 'Conversation Details' }: PanelShellProps) {
  const reduced = useReducedMotion();

  /**
   * ESCAPE = SCRIM CLICK (QA-2, 2026-08-25).
   *
   * This shell used to register no key handler at all, so all five panels
   * ignored Escape while every `CanaryModal` on the same surface honoured it —
   * two dismissal grammars on one screen, and the one that ignored the key was
   * the one presenting itself as `role="dialog"` behind a full-viewport scrim.
   *
   * ⚠ IT MUST NOT BE A BARE DOCUMENT LISTENER, and that is the whole reason
   * `escape-stack` exists. Three things stack over this shell — the unlink
   * confirm `CanaryModal` at z 50, the panel's own kebab popovers and the
   * assign listbox — and a listener of our own here would have closed the panel
   * UNDERNEATH each of them on the same keypress. The stack hands Escape to the
   * topmost layer only, so the popover goes, then the panel.
   *
   * Gated on `isOpen` rather than `mounted`: a panel already playing its exit
   * transition is not a layer anybody is looking at.
   */
  useEscapeLayer(isOpen, onClose);

  /**
   * …AND ESCAPE PUTS FOCUS BACK WHERE IT CAME FROM (QA-3, 2026-08-25).
   *
   * Wiring Escape into the panel above delivered half a behaviour. Before it,
   * a panel could not be closed out from under in-panel focus, because it could
   * not be closed by key at all; after it, Escape unmounted the panel while
   * focus was sitting on the "Close conversation details" button inside it, and
   * focus fell to `<body>` — the keyboard user re-Tabs from the top of the
   * document to get back to a conversation they never left.
   *
   * The pattern is already in this repo: `ModalFocusScope` captures
   * `document.activeElement` on open and restores it on close, skipping a node
   * the commit deleted. This is that half, and only that half — the panel still
   * does not trap Tab and still takes no initial focus, both of which are
   * deliberate (it is a companion to the conversation, not a takeover of it).
   *
   * ⚠ IT RESTORES ONLY WHEN FOCUS WAS STRANDED — inside the panel, or already
   * on `<body>`. A hotelier who closed the panel by clicking something else on
   * the page is looking at that something else, and yanking focus back to the
   * ⓘ trigger would be its own bug.
   */
  const openerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    openerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    return () => {
      const opener = openerRef.current;
      openerRef.current = null;
      if (!opener || !document.contains(opener)) return;
      const active = document.activeElement;
      const stranded =
        !active ||
        active === document.body ||
        (panelRef.current ? panelRef.current.contains(active) : false);
      if (stranded) opener.focus();
    };
  }, [isOpen]);

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
        ref={panelRef}
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
