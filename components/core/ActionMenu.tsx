'use client';

/**
 * ActionMenu — the shared kebab, on `CanaryOverflowMenu`.
 *
 * The trigger was already a proper `CanaryButton`; what was hand-rolled was
 * everything behind it — an absolute popover, its own click-outside effect, and
 * hand-styled item rows. All three are the library's now, and the base maps
 * almost one-for-one: `trigger` takes any ReactNode (so the exact same button
 * survives), `items[{id, label, icon, onClick, isDanger}]` carries the danger
 * branch, click-outside is built in, and `placement="bottom-end"` is this
 * menu's right-aligned-below position.
 *
 * ── THREE DELTAS, ALL ACCEPTED ────────────────────────────────────────────
 * The library sets item colour INLINE with no per-item hook — `colorBlack2` for
 * a normal row, `danger` for an `isDanger` one — so the blue rows this menu
 * used to draw are now black. We took the base's register rather than
 * `!important`-ing five properties to keep a colour no other menu in the
 * product uses: an overflow menu is exactly the kind of thing that should look
 * the same everywhere. The item hover wash moves from Tailwind's `gray-50` to
 * the library's `colorBlack7` for the same reason, and the popover loses its
 * 4px top gap (the base hangs it flush under the trigger). Item colour is
 * logged as a library ask, for parity with `CanaryTag.customColor`.
 *
 * ── ONE PROP RETIRED ──────────────────────────────────────────────────────
 * `position="above"` is gone. The base offers `bottom-start` / `bottom-end`
 * only, and no call site ever asked for it — the sole consumer
 * (`CheckOutDetailPanel`) uses the default. Logged as a library ask rather than
 * kept alive as a prop nothing can honour.
 *
 * `minWidth` survives as a custom property rather than a class, because the
 * base hardcodes `min-w-[180px]` on the popover and a width that arrives as a
 * NUMBER can't be a Tailwind class. The `display: contents` wrapper contributes
 * no box — it exists purely so `--overflow-menu-w` has somewhere to inherit
 * from; `.overflow-menu-w` in globals.css reads it.
 */

import React from 'react';
import {
  CanaryButton,
  CanaryOverflowMenu,
  ButtonType,
  ButtonSize,
  colors,
} from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiDotsHorizontal } from '@mdi/js';

export interface ActionMenuItem {
  label: string;
  danger?: boolean;
  onClick: () => void;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  /** Icon size for the trigger button */
  iconSize?: number;
  /** Icon color for the trigger button */
  iconColor?: string;
  /** Minimum width of the dropdown */
  minWidth?: number;
}

export function ActionMenu({
  items,
  iconSize = 0.67,
  iconColor = colors.colorBlack3,
  minWidth = 200,
}: ActionMenuProps) {
  return (
    <div
      className="contents"
      style={{ ['--overflow-menu-w' as string]: `${minWidth}px` } as React.CSSProperties}
    >
      <CanaryOverflowMenu
        className="overflow-menu-w"
        placement="bottom-end"
        trigger={
          <CanaryButton
            type={ButtonType.ICON_SECONDARY}
            size={ButtonSize.COMPACT}
            icon={
              <Icon
                path={mdiDotsHorizontal}
                size={iconSize}
                color={iconColor}
                title="More actions"
                id="action-menu-trigger"
              />
            }
          />
        }
        items={items.map((item) => ({
          id: item.label,
          label: item.label,
          isDanger: item.danger,
          onClick: item.onClick,
        }))}
      />
    </div>
  );
}
