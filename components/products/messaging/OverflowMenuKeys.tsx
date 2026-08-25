'use client';

/**
 * OverflowMenuKeys — the keyboard `CanaryOverflowMenu` does not have.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠ LIBRARY STOPGAP, NOT A DESIGN DELTA (QA-2, 2026-08-25)
 * ═══════════════════════════════════════════════════════════════════════════
 * Measured on `@canary-ui`'s `CanaryOverflowMenu` (dist/index.mjs ~8932): items
 * are plain `<div onClick>` — no `role`, no `tabindex`, no key handling — and
 * the only dismissal is a document CLICK-outside listener. So a keyboard user
 * can OPEN the thread header's kebab (the trigger is a real button, so Enter
 * fires its click) and then neither operate it nor close it: Tab skips both
 * items and lands in the feed behind the open menu, and Escape does nothing.
 * A menu you can open and cannot dismiss is the worst of the three states.
 *
 * ── WHY A WRAPPER ─────────────────────────────────────────────────────────
 * The base keeps `isOpen` private and exposes no ref, no callbacks and no item
 * refs, so nothing can be handed in. What it DOES give is a stable DOM shape:
 *
 *     root  .relative.inline-block        ← takes our className
 *       ├─ [0] trigger wrapper  (onClick = toggle)
 *       └─ [1] popover          ← EXISTS ONLY WHILE OPEN
 *
 * That second child is the whole state machine, readable from outside. So this
 * wrapper reads open/closed off the DOM and drives the base through the two
 * doors it does expose: a click on the trigger wrapper toggles, a click on an
 * item runs it and closes. No private state is guessed at and nothing is
 * re-implemented — the base still owns opening, closing and dismissal.
 *
 * ── THE CONTRACT IT RESTORES ──────────────────────────────────────────────
 *   Enter / Space / ↓ / ↑ on the trigger   open, and land on the first item
 *   ↓ ↑ Home End                           move between items
 *   Enter / Space                          activate (the base then closes)
 *   Escape                                 close AND RETURN FOCUS TO THE TRIGGER
 *                                          — through the shared layer stack, so
 *                                            a panel underneath does not go too
 *   Tab                                    close, and let focus move on
 *
 * Items get `role="menuitem"` and `tabIndex={-1}` as they are focused, and the
 * highlight is written with the base's OWN hover colour (`colorBlack7`, set
 * inline by its `onMouseEnter`) so the keyboard highlight and the pointer
 * highlight are the same paint rather than two registers.
 *
 * ── TRIGGERS THAT ARE NOT BUTTONS ─────────────────────────────────────────
 * `trigger` is a free slot, and one call site hands it a `CanaryTag` (the
 * workspace status pill) — a `<span>`, which cannot take focus at all, so that
 * menu was unreachable by keyboard rather than merely unusable. When the
 * trigger wrapper contains nothing focusable this makes the WRAPPER the control
 * (`tabindex=0`, `role="button"`, `aria-haspopup="menu"`) rather than reaching
 * into the caller's node.
 *
 * ⚠ LIBRARY ASK #57: keyboard operation on `CanaryOverflowMenu` — focusable
 * items with `role="menuitem"`, arrow navigation, Escape-closes-and-restores,
 * and a focusable trigger wrapper when the trigger slot is not itself a
 * control. Delete this file the day it lands.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useEscapeLayer } from '@/lib/products/messaging/escape-stack';

/** The base's popover is the root's second child, and only while open. */
function popoverOf(root: HTMLElement | null): HTMLElement | null {
  const el = root?.children[1];
  return el instanceof HTMLElement ? el : null;
}

function triggerWrapperOf(root: HTMLElement | null): HTMLElement | null {
  const el = root?.children[0];
  return el instanceof HTMLElement ? el : null;
}

/** Item rows only — the base renders dividers as childless divs. */
function itemsOf(popover: HTMLElement | null): HTMLElement[] {
  if (!popover) return [];
  return Array.from(popover.children).filter(
    (el): el is HTMLElement => el instanceof HTMLElement && el.childElementCount > 0
  );
}

/** The focusable thing the user tabs to — the caller's control, or the wrapper. */
function focusTargetOf(root: HTMLElement | null): HTMLElement | null {
  const wrapper = triggerWrapperOf(root);
  if (!wrapper) return null;
  const native = wrapper.querySelector<HTMLElement>(
    'button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])'
  );
  return native ?? wrapper;
}

const HIGHLIGHT = '#F0F0F0'; // colors.colorBlack7 — the base's own hover fill.

function highlight(items: HTMLElement[], index: number) {
  items.forEach((item, i) => {
    item.style.backgroundColor = i === index ? HIGHLIGHT : 'transparent';
    if (i === index) {
      item.setAttribute('role', 'menuitem');
      item.tabIndex = -1;
      item.focus();
    }
  });
}

export function OverflowMenuKeys({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const scopeRef = useRef<HTMLDivElement>(null);

  /** The base's root is our only child. */
  const root = () => {
    const el = scopeRef.current?.firstElementChild;
    return el instanceof HTMLElement ? el : null;
  };

  /** Make a non-focusable trigger slot focusable, once, on first render. */
  const adoptTrigger = (node: HTMLDivElement | null) => {
    scopeRef.current = node;
    if (!node) return;
    const wrapper = triggerWrapperOf(root());
    if (!wrapper) return;
    if (focusTargetOf(root()) !== wrapper) return; // the caller supplied a real control
    wrapper.tabIndex = 0;
    wrapper.setAttribute('role', 'button');
    wrapper.setAttribute('aria-haspopup', 'menu');
  };

  const closeAndRestore = () => {
    // The base toggles on a click anywhere in its trigger wrapper. Clicking the
    // WRAPPER (not the caller's node inside it) closes without re-firing
    // whatever the caller put there.
    triggerWrapperOf(root())?.click();
    focusTargetOf(root())?.focus();
  };

  /**
   * ── AND IT JOINS THE ESCAPE STACK (QA-3, 2026-08-25) ──────────────────────
   *
   * This wrapper answered Escape in its own React handler, which is a SECOND
   * listener beside the shared one — and `preventDefault` does not suppress a
   * separate document listener. So opening this menu over a `PanelShell` and
   * pressing Escape once closed the menu AND the panel underneath it: exactly
   * the double-dismissal `escape-stack`'s own note calls "worse than the bug it
   * fixes", reached by the one popover that had not registered.
   *
   * ⚠ THE OPEN STATE IS READ OFF THE DOM, not held here — same as everything
   * else in this file. The base keeps `isOpen` private, but the popover's
   * PRESENCE is that state, so a `MutationObserver` on the base's root reports
   * it for free and covers the mouse path as well as the keyboard one.
   */
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const r = root();
    if (!r) return;
    const read = () => setIsOpen(!!popoverOf(r));
    read();
    const observer = new MutationObserver(read);
    observer.observe(r, { childList: true });
    return () => observer.disconnect();
  }, []);

  useEscapeLayer(isOpen, closeAndRestore);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const r = root();
    if (!r) return;

    const popover = popoverOf(r);
    const items = itemsOf(popover);

    /* ── CLOSED ─────────────────────────────────────────────────────────── */
    if (!popover) {
      if (!['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) return;
      // Driven explicitly rather than left to the button's native activation:
      // Space activates a <button> on key UP, so "click, then focus the first
      // item next frame" only lands deterministically if we fire the click.
      event.preventDefault();
      triggerWrapperOf(r)?.click();
      requestAnimationFrame(() => {
        const opened = itemsOf(popoverOf(root()));
        if (opened.length) highlight(opened, event.key === 'ArrowUp' ? opened.length - 1 : 0);
      });
      return;
    }

    /* ── OPEN ───────────────────────────────────────────────────────────── */
    const active = document.activeElement;
    const index = items.findIndex((item) => item === active);

    switch (event.key) {
      // Escape is NOT handled here — see the layer registration above. Two
      // handlers for one keypress is the bug, not the fix.
      case 'Tab':
        // Close, then let the browser move focus normally from the trigger.
        triggerWrapperOf(r)?.click();
        focusTargetOf(r)?.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        highlight(items, Math.min(index + 1, items.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        highlight(items, index <= 0 ? 0 : index - 1);
        break;
      case 'Home':
        event.preventDefault();
        highlight(items, 0);
        break;
      case 'End':
        event.preventDefault();
        highlight(items, items.length - 1);
        break;
      case 'Enter':
      case ' ':
        if (index < 0) return; // focus is on the trigger — let it toggle.
        event.preventDefault();
        // The base's own item handler runs the action AND closes the menu.
        items[index].click();
        focusTargetOf(r)?.focus();
        break;
    }
  };

  return (
    <div ref={adoptTrigger} className={className} style={style} onKeyDown={onKeyDown}>
      {children}
    </div>
  );
}
