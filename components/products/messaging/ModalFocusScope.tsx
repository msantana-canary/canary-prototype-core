'use client';

/**
 * ModalFocusScope — the focus management `CanaryModal` does not have.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠ THIS IS A LIBRARY STOPGAP, NOT A DESIGN DELTA (QA-2, 2026-08-25)
 * ═══════════════════════════════════════════════════════════════════════════
 * Measured on `@canary-ui`'s `CanaryModal` (dist/index.mjs ~6192): its entire
 * behaviour is a document-level Escape listener plus a body scroll lock. There
 * is no `role="dialog"`, no `aria-modal`, no initial focus, no trap and no
 * restore. What that costs, verified in a browser:
 *
 *   • Open the templates modal from the keyboard and focus STAYS on the icon
 *     behind the scrim.
 *   • Three tabs later you are on the composer's AI pill — BEHIND the overlay —
 *     and Enter flips it while the modal is still up. The background is fully
 *     operable through a surface that is drawn as modal.
 *   • Keep tabbing and focus passes through the modal and back out into the
 *     page. There is no cycle.
 *   • Escape closes it and drops focus on `<body>`, so a keyboard user who
 *     dismisses a modal loses their place in the page entirely.
 *
 * ── WHY A WRAPPER AND NOT A PROP ──────────────────────────────────────────
 * The fix belongs in the base. Until it lands, it has to be expressible at the
 * CALL SITE without re-plumbing eleven modals' props (`title`, `size`,
 * `footer`, `className` all differ), so this is a wrapper that takes only the
 * one fact it needs — is the modal open — and reaches the modal's DOM through a
 * ref.
 *
 * The wrapper element is `display: contents`. It contributes NOTHING to layout
 * — no box, no line box, no flex/grid participation — while still being a real
 * node in the DOM tree, which is all `.contains()` and `querySelectorAll` need.
 * A plain `<div>` here would have become a flex child of whatever the modal was
 * declared inside and moved things around; `display: contents` cannot.
 *
 * ── WHAT IT DOES, IN ORDER ────────────────────────────────────────────────
 *   1. Remembers the OPENER (`document.activeElement`) before anything moves.
 *   2. Moves focus INTO the dialog on the next frame — first focusable, unless
 *      something inside already claimed focus (a field with `autoFocus` should
 *      win, and does).
 *   3. TRAPS Tab / Shift-Tab in a cycle, at capture phase so nothing else can
 *      see the keystroke first. Focus arriving from outside is pulled back in.
 *   4. Restores focus to the opener on close — but only if the opener is still
 *      in the document, because a modal whose commit removes its own launcher
 *      (an unlink confirm, say) has nowhere honest to go back to.
 *
 * It also registers a NO-OP escape layer. See `escape-stack.ts`: the library
 * already closes the modal on Escape, and the layer exists purely so a panel
 * UNDERNEATH the modal does not close on the same keypress.
 *
 * ⚠ LIBRARY ASK #58: focus management on `CanaryModal` — `role="dialog"`,
 * `aria-modal`, initial focus, a Tab trap and focus restore. Delete this file
 * and its wrappers the day it lands.
 */

import React, { useEffect, useRef } from 'react';
import { useEscapeLayer } from '@/lib/products/messaging/escape-stack';

/**
 * Everything a keyboard can land on. `[tabindex]:not([tabindex="-1"])` is what
 * catches the surface's own hand-rolled controls (the panel's rows, the
 * scheduled-broadcast launcher) alongside the native ones.
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');

function focusablesIn(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    // `offsetParent` is null for anything `display: none` — which is how a
    // closed tab panel's contents hide inside an open modal.
    (el) => el.offsetParent !== null || el.getClientRects().length > 0
  );
}

export function ModalFocusScope({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children: React.ReactNode;
}) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  // Absorb Escape on behalf of the layer below. The library closes the modal;
  // this only stops a panel underneath from closing on the same keystroke.
  useEscapeLayer(isOpen, () => {});

  useEffect(() => {
    if (!isOpen) return;

    openerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    // Next frame: the modal's children mount in this same commit, and anything
    // inside carrying `autoFocus` claims focus during it. Waiting one frame
    // means this never fights a field that has already won.
    const raf = requestAnimationFrame(() => {
      const scope = scopeRef.current;
      if (!scope) return;
      if (document.activeElement && scope.contains(document.activeElement)) return;
      focusablesIn(scope)[0]?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const scope = scopeRef.current;
      if (!scope) return;

      const items = focusablesIn(scope);
      if (items.length === 0) {
        // A modal with nothing focusable in it still must not leak Tab into the
        // page behind the scrim.
        event.preventDefault();
        return;
      }

      const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const inside = !!active && scope.contains(active);
      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey) {
        if (!inside || active === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (!inside || active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown, true);
      const opener = openerRef.current;
      openerRef.current = null;
      // Only if it survived the modal. A commit that deletes its own launcher
      // (unlink, remove) leaves a detached node, and focusing one is a no-op
      // that silently strands focus on <body> — worse than leaving it alone.
      if (opener && document.contains(opener)) opener.focus();
    };
  }, [isOpen]);

  return (
    <div ref={scopeRef} style={{ display: 'contents' }}>
      {children}
    </div>
  );
}
