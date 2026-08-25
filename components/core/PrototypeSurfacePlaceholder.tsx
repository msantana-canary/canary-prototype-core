'use client';

/**
 * PrototypeSurfacePlaceholder — what a nav item points at when this branch does
 * not carry that product.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WHY THIS EXISTS
 * ═══════════════════════════════════════════════════════════════════════════
 * The V2 shell ships the whole Canary product nav — Upsells, F&B, Digital Tips,
 * Authorizations, Contracts, Clients on File — and this branch builds none of
 * them. Five of those items were mapped to routes that had never been created,
 * so clicking one during a demo dropped the presenter onto Next's unthemed
 * default 404: no sidebar, no top bar, no property name, no way back except the
 * browser's Back button. A chrome-less dead end is the single worst thing a
 * prototype can do in front of an executive, because for one beat it is
 * indistinguishable from the product being broken.
 *
 * ⚠ THE FIX IS NOT "UNMAP THEM". An unmapped item is a nav row that does
 * nothing when clicked, which reads as a broken button — the same doubt, just
 * quieter. The shell has to stay on screen and the app has to say plainly what
 * it does and does not contain. So every unbuilt item routes HERE, inside the
 * shell, and the sidebar keeps its selection: the click is answered, the
 * chrome never blinks, and the answer is true.
 *
 * ⚠ AND IT IS NOT A FAKE. Nothing here mocks a dashboard, an empty state, or a
 * "coming soon" marketing promise. This is a statement about the PROTOTYPE, not
 * about the product — Upsells exists, it is simply not in this build — and the
 * copy says exactly that. A plausible-looking empty Upsells screen would be a
 * worse lie than the 404 was, because nobody would catch it.
 *
 * The register is the one the surface already uses for its own empty states:
 * centred, quiet, `colorBlack3`/`colorBlack4`, no illustration, no button. It
 * is a wall, and it should look like a wall rather than like a room.
 */

import React from 'react';
import Icon from '@mdi/react';
import { mdiToolboxOutline } from '@mdi/js';
import { colors } from '@canary-ui/components';

export function PrototypeSurfacePlaceholder({ title }: { title: string }) {
  return (
    <div className="flex-1 h-full flex items-center justify-center" style={{ padding: 24 }}>
      <div className="flex flex-col items-center text-center" style={{ maxWidth: 420, gap: 12 }}>
        <Icon path={mdiToolboxOutline} size={1.6} color={colors.colorBlack5} />

        <h2
          className="font-['Roboto',sans-serif] font-medium text-[16px] leading-[24px]"
          style={{ color: colors.colorBlack1 }}
        >
          {title}
        </h2>

        {/* Names the PROTOTYPE as the thing that stops here, not the product.
            "Isn't built yet" would be a claim about Canary and would be false. */}
        <p
          className="font-['Roboto',sans-serif] text-[14px] leading-[22px]"
          style={{ color: colors.colorBlack3 }}
        >
          This surface isn&apos;t part of the messaging prototype. {title} is a real Canary
          product — it just isn&apos;t built into this branch.
        </p>

        <p
          className="font-['Roboto',sans-serif] text-[13px] leading-[20px]"
          style={{ color: colors.colorBlack4 }}
        >
          Messages, Calls, Check-in and Checkout are the surfaces this build carries.
        </p>
      </div>
    </div>
  );
}
