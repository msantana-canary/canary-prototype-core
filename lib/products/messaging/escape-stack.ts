'use client';

import { useEffect, useRef } from 'react';

/**
 * ONE DISMISSAL GRAMMAR FOR THE WHOLE SURFACE (QA-2, 2026-08-25).
 *
 * ── THE PROBLEM ───────────────────────────────────────────────────────────
 * Escape used to mean four different things depending on what you had open.
 * `CanaryModal` handles it (a document listener of the library's own), so every
 * modal closed. `PanelShell` handled nothing, so all five slide-in panels
 * ignored it — including the ones that present as `role="dialog"` over a
 * full-viewport scrim, which is a surface announcing modality and then refusing
 * the modal keystroke. The panel's own popovers (the hand-rolled `Kebab`, the
 * `AssignSelect` listbox) each had their own answer, or none.
 *
 * ── WHY A STACK AND NOT A LISTENER PER SURFACE ────────────────────────────
 * Because these surfaces NEST. The unlink confirm is a `CanaryModal` at z 50
 * opened from inside a panel at z 45; a kebab popover opens inside that same
 * panel. If each surface registered its own document listener, one Escape would
 * close ALL of them at once — the popover and the panel underneath it, or the
 * modal and the panel that launched it — which is worse than the bug it fixes.
 *
 * So there is exactly ONE document listener, and a LIFO stack of layers on top
 * of it. Escape reaches the topmost layer and nobody else. Open a popover
 * inside a panel and Escape closes the popover; press it again and the panel
 * goes. That is the grammar every desktop app has, and it is now stated once
 * rather than re-derived per component.
 *
 * ── THE MODAL LAYER IS DELIBERATELY A NO-OP ───────────────────────────────
 * `CanaryModal` owns its own Escape and we cannot take it off. So a modal
 * registers a layer that does NOTHING: its only job is to sit on top of the
 * stack and absorb the keypress, so the panel underneath does not also close
 * while the library is busy closing the modal. Both listeners fire on the same
 * Escape; exactly one surface goes away.
 *
 * ⚠ LIBRARY ASK #59: a dismissal contract on the base surfaces — `CanaryModal` and
 * a (still-unbuilt) inset side-panel variant should share one layer stack so
 * the app does not have to own this. Delete this module the day it lands.
 */

interface EscapeLayer {
  id: number;
  onEscape: () => void;
}

let layers: EscapeLayer[] = [];
let nextLayerId = 1;
let isListening = false;

function handleDocumentKeyDown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return;
  const top = layers[layers.length - 1];
  if (!top) return;
  top.onEscape();
}

function ensureListener() {
  if (isListening || typeof document === 'undefined') return;
  document.addEventListener('keydown', handleDocumentKeyDown);
  isListening = true;
}

/** How many dismissible layers are open. Read by nothing yet; kept for debugging. */
export function openLayerCount(): number {
  return layers.length;
}

/**
 * Register a dismissible surface for as long as `isActive`.
 *
 * `onEscape` is read through a ref, so an inline arrow at the call site cannot
 * churn the layer — the effect depends on `isActive` alone, which is what keeps
 * the stack ORDER meaningful (a layer must not silently re-push itself to the
 * top every render).
 */
export function useEscapeLayer(isActive: boolean, onEscape: () => void) {
  const latest = useRef(onEscape);
  latest.current = onEscape;

  useEffect(() => {
    if (!isActive) return;
    ensureListener();

    const layer: EscapeLayer = {
      id: nextLayerId++,
      onEscape: () => latest.current(),
    };
    layers.push(layer);

    return () => {
      layers = layers.filter((l) => l.id !== layer.id);
    };
  }, [isActive]);
}
