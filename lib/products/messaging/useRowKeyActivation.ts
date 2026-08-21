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
 * ⚠ DELETE THIS the day `CanaryListItem` handles its own keys. It is a
 * stopgap for a library gap, logged as the sharpest ask this batch produced,
 * and it should not outlive the fix.
 */
export function useRowKeyActivation(onActivate?: () => void) {
  const latest = useRef(onActivate);
  latest.current = onActivate;

  return useCallback((node: HTMLLIElement | null) => {
    if (!node) return;

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
