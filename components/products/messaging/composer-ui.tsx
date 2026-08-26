/**
 * composer-ui.tsx — the toolbar icon shared by every message composer.
 *
 * ⚠ EXTRACTED, not written (batch, 2026-08-26). `ToolIcon` was born inside
 * `MessageComposer.tsx` for the Conversations composer; `BroadcastComposer`
 * stayed on its own hand-rolled `<button>` (padding 6, a `hover:bg-[#f0f0f0]`
 * box wash, mdi size 0.83) through the batches that rebuilt Conversations
 * underneath it, and the two toolbars drifted. One component now, so a future
 * icon-treatment change can't drift between the two composers again the way
 * this one did.
 */

'use client';

import React, { useState } from 'react';
import { ButtonSize, ButtonType, CanaryButton, colors } from '@canary-ui/components';
import Icon from '@mdi/react';

/**
 * Bare toolbar icon — no box, no padding; gray → blue on hover.
 *
 * `CanaryButton` ICON_SECONDARY at TINY, shrunk from the ramp's 24px floor to
 * 18px by `.icon-btn-18` (which also releases the library's fixed 20px glyph
 * box so an 18px button doesn't carry a 20px child). `.icon-btn-bare` deletes
 * the `.button-bg` wash layer outright: this register has no box at rest, on
 * hover or on press, because its entire state ladder is the GLYPH's colour.
 *
 * That colour stays on a local hover flag rather than on `currentColor`,
 * deliberately — it keeps the exact rest/hover tints (`colorBlack3` →
 * `colorBlueDark1`) that the message feedback icons also use, with no dependence
 * on what the button happens to be painting its content.
 *
 * ⚠ THE WRAPPING SPAN EXISTS ONLY TO CARRY THE MOUSE HANDLERS. `CanaryButton`
 * declares no DOM event props beyond `onClick` and spreads no rest props, so
 * there is nowhere else to hang `onMouseEnter`/`onMouseLeave`. Logged as a
 * foundation ask.
 *
 * ⚠ The native `title` attribute is gone — `CanaryButton` has no `title` prop
 * either. Its OS tooltip is replaced by the mdi `Icon`'s `<title>` ELEMENT,
 * which browsers also surface on hover over the glyph, and which is what gives
 * the button its accessible name in the first place (see the stable-`id` note
 * on the thread header's IconAction).
 *
 * `onClick` is OPTIONAL: a tool with nothing behind it yet passes nothing
 * rather than a no-op — a button with a handler that does nothing is
 * indistinguishable from a broken one. `isActive` pins the hover tint on for a
 * tool whose surface is open (Conversations' Translate; Broadcast's Schedule
 * once a time is pinned).
 */
export function ToolIcon({
  path,
  label,
  id,
  onClick,
  isActive = false,
}: {
  path: string;
  label: string;
  id: string;
  onClick?: () => void;
  isActive?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <span
      className="inline-flex"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CanaryButton
        type={ButtonType.ICON_SECONDARY}
        size={ButtonSize.TINY}
        onClick={onClick}
        className="icon-btn-bare icon-btn-18"
        icon={
          <Icon
            path={path}
            size={0.75}
            color={isHovered || isActive ? colors.colorBlueDark1 : colors.colorBlack3}
            title={label}
            id={id}
          />
        }
      />
    </span>
  );
}
