'use client';

/**
 * Toast — the product's receipt register, on `CanaryToast`.
 *
 * This is a THIN WRAPPER, not a component: everything a toast does — the
 * message, the position, the lifetime — is the library's. Two things are ours,
 * and both are structural rather than decorative.
 *
 * ── 1. THE PORTAL ─────────────────────────────────────────────────────────
 * `CanaryToast` positions itself `fixed` but does NOT portal. Every caller here
 * sits inside a transform-animated surface (the Conversation Details panel
 * slides in on a `translateX`), and a transformed ancestor becomes the
 * containing block for `position: fixed` — so an un-portaled toast would anchor
 * to the PANEL and slide with it instead of sitting on the viewport. The
 * `createPortal` to `document.body` is the fix, and it is why this wrapper
 * exists at all rather than every call site rendering `CanaryToast` directly.
 *
 * ── 2. THE SOLID REGISTER ─────────────────────────────────────────────────
 * The library's toast is TINTED — pale ground, coloured border, coloured text,
 * plus a close ×. This product's receipt is a SOLID bar with white text and no
 * dismiss, because it disappears on its own and a receipt you have to close is
 * a dialog. The palette is inline on the component, so the register lives in
 * `.toast-solid` (+ one modifier per variant) in globals.css with `!important`.
 * Logged for promotion as the "solid toast register".
 *
 * `duration={0}` disables the library's own auto-dismiss: every caller already
 * owns a timer, because the toast's visibility is store state that other things
 * read. One timer, at the source.
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { CanaryToast } from '@canary-ui/components';

type ToastVariant = 'success' | 'error' | 'info';

/** Our three registers, mapped onto the library's type vocabulary. `info` has
 *  no library analogue in this palette — it is the neutral #333 bar — so it
 *  borrows the `info` type and overrides the fill. */
const VARIANT_TYPE: Record<ToastVariant, 'success' | 'error' | 'info'> = {
  success: 'success',
  error: 'error',
  info: 'info',
};

const VARIANT_CLASS: Record<ToastVariant, string> = {
  success: 'toast-solid-success',
  error: 'toast-solid-error',
  info: 'toast-solid-info',
};

interface ToastProps {
  message: string;
  isOpen: boolean;
  variant?: ToastVariant;
}

export function Toast({ message, isOpen, variant = 'success' }: ToastProps) {
  if (!isOpen) return null;

  return createPortal(
    <CanaryToast
      message={message}
      type={VARIANT_TYPE[variant]}
      isOpen
      duration={0}
      position="bottom-center"
      className={`toast-solid ${VARIANT_CLASS[variant]}`}
    />,
    document.body
  );
}
