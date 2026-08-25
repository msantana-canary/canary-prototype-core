'use client';

import { useCallback, useRef } from 'react';

/**
 * Gives a `CanaryListItem` back its keyboard.
 *
 * ── WHY THIS EXISTS ───────────────────────────────────────────────────────
 * `CanaryListItem` announces itself as a button — it renders
 * `<li role="button" tabIndex={0}>` whenever `isClickable` — but it puts
 * `onClick` on an INNER div and registers no key handler anywhere. So the row
 * takes focus, tells a screen reader it is a button, and then does nothing when
 * you press Enter or Space. That is worse than an inert row: it is a promise
 * the component does not keep.
 *
 * Every clickable row on this surface used to be a real `<button>` (the panel's
 * call-history and reservation-result rows) or a plain div with no focus at all
 * (the thread row). Moving them onto the base was right — the hover, selection
 * and colour registers are the library's now — but it must not cost the rows
 * their keyboard, so this puts it back.
 *
 * ── HOW ───────────────────────────────────────────────────────────────────
 * `CanaryListItem` forwards its ref to the `<li>`, which is the element that
 * actually has focus, so a `keydown` listener there is the whole fix. The
 * returned value is a REF CALLBACK with a stable identity: React 19 calls the
 * cleanup it returns when the node detaches, and holding the handler in a ref
 * means an inline arrow at the call site cannot churn the listener on every
 * render.
 *
 * `event.target !== node` is the one guard that matters. A row can contain its
 * own controls — the panel's copy affordance, a kebab — and their Enter and
 * Space belong to them; only a keypress landing on the row ITSELF should open
 * the row.
 *
 * ── AND IT COLLAPSES THE DOUBLE BUTTON (QA-2, 2026-08-25) ─────────────────
 * The base puts `role="button"` on the `<li>` AND on the inner div it hangs
 * `onClick` from, so every row announced itself as *a button inside a button*
 * with the same accessible name — read twice in a screen reader's browse mode,
 * and the outer of the two is the one that is click-inert (React's handler is
 * on the inner div only, so an AT that dispatches a DOM click at the focused
 * element hits nothing). One row is one control; the anatomy underneath it is
 * not the user's business.
 *
 * The `<li>` is the one that KEEPS the role, deliberately: it is the focusable
 * node, it is what `tabIndex` is on, and it is what the hook above teaches to
 * answer Enter and Space. Stripping the inner div's role leaves exactly one
 * announced control per row, still focusable, still activable, with the click
 * path untouched for the pointer.
 *
 * Safe because React only writes an attribute it is diffing: `isClickable`
 * never changes on these rows, so `role` is written once at mount — after which
 * this callback removes it — and no later render puts it back.
 *
 * ⚠ DELETE THIS the day `CanaryListItem` handles its own keys and stops
 * doubling its own role. It is a stopgap for a library gap, logged as the
 * sharpest ask that batch produced, and it should not outlive the fix.
 */
export function useRowKeyActivation(onActivate?: () => void) {
  const latest = useRef(onActivate);
  latest.current = onActivate;

  return useCallback((node: HTMLLIElement | null) => {
    if (!node) return;

    // One interactive element per row — see the note above.
    const inner = node.firstElementChild;
    if (inner?.getAttribute('role') === 'button') inner.removeAttribute('role');

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      // Let anything inside the row keep its own keyboard.
      if (event.target !== node) return;
      event.preventDefault();
      latest.current?.();
    };

    node.addEventListener('keydown', handleKeyDown);
    return () => node.removeEventListener('keydown', handleKeyDown);
  }, []);
}
