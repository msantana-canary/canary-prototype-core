/**
 * BroadcastFilterControls — the attribute controls for the filter surface.
 *
 * Extracted from the Builder modal before it was deleted. The team jam settled
 * on a PANEL rather than a modal (later corrected back to a modal, 2026-08-25),
 * but the Builder's control anatomy and its live-match logic won, so they
 * survive here as primitives the modal composes.
 *
 * Sized for a panel column rather than a 760px modal: the loyalty chips are
 * smaller. The code fields (Rate code / Group code / Room number) used to run
 * a hand-rolled `TypeToChipInput` with its chips in a tray above the field —
 * deleted 2026-08-26 in favour of the library's own `CanaryInputMultiple`,
 * which draws the chips INSIDE the bordered field per Figma 1435-17906.
 */

'use client';

import React, { useState } from 'react';
import { colors } from '@canary-ui/components';
import {
  BroadcastFilterCriteria,
  LoyaltyTier,
} from '@/lib/products/messaging/broadcast-types';

export const LOYALTY_TIERS: { value: LoyaltyTier; label: string }[] = [
  { value: 'non-member', label: 'Non-member' },
  { value: 'club-member', label: 'Club Member' },
  { value: 'silver-elite', label: 'Silver Elite' },
  { value: 'gold-elite', label: 'Gold Elite' },
  { value: 'platinum-elite', label: 'Platinum Elite' },
  { value: 'diamond-elite', label: 'Diamond Elite' },
];

/**
 * Section label above each non-input attribute group (Loyalty status, Length
 * of stay, Guest recurrence). Restyled 2026-08-26 to be pixel-identical to the
 * base label `CanaryInputMultiple`/`CanaryInput` render internally at
 * `InputSize.NORMAL` (`dist/index.mjs` `LABEL_CLASSES.normal`) — Miguel:
 * "you'll notice that the label styling will be different so the other
 * non-inputs should match." Deltas from the old style: weight 500 → 400 (no
 * `font-medium`), `colors.colorBlack1` → Tailwind `text-black` (the base
 * hardcodes `text-black`, not the token), bottom gap 8px → 4px (`mb-1`).
 *
 * `CanaryFormLabel` (the OTHER exported label) does not fit: it renders 14px
 * at NORMAL with `font-weight: 500` and `colors.colorBlack2` — a different,
 * more prominent register meant for standalone labeled fields, not this
 * compact one. Hand-rolled here on purpose, not a base-component gap.
 */
export function FilterSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="block text-black font-['Roboto',sans-serif] text-[12px] leading-[18px] mb-1">
      {children}
    </p>
  );
}

/**
 * Small selectable chip — loyalty tiers and the binary attributes both use it.
 * Deliberately smaller than the modal's 40px pills: the panel is one narrow
 * column, and six tiers have to sit in it without becoming the whole view.
 */
export function FilterChip({
  label,
  isSelected,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  /**
   * ⚠ THIS CHIP ANSWERS THE POINTER NOW — it never did.
   *
   * All ten of these (six loyalty tiers, two length-of-stay, two recurrence)
   * carried `transition-colors` and `cursor-pointer` over inline colours and no
   * hover mechanism of any kind: zero computed change on hover, in both states,
   * on the filter panel's most-touched controls, while every neighbour in the
   * same dialog — the close button, the guest rows, the band buttons — painted
   * one. Clicks worked; the cluster just felt dead under the hand.
   *
   * ── WHY IT IS STILL HAND-ROLLED ───────────────────────────────────────────
   * The register being matched is `CanaryChip`'s SELECTABLE: an 8% wash on
   * hover, 16% on press, solid `colorBlueDark1` and a white label when on. What
   * the base cannot express is this chip's UNSELECTED state — SELECTABLE
   * hardwires a blue hairline and a blue label, written INLINE and rewritten on
   * every pointer event, and these chips draw a neutral `colorBlack5` hairline
   * with a `colorBlack2` label. Overriding that would mean `!important`-ing
   * every state the component owns, which is fighting its state model rather
   * than layering on it — the same conclusion the panel's ExpanderPill reached
   * for the same reason, logged with the same ask (a NEUTRAL OUTLINE register,
   * or `customColor` on `CanaryChip` for parity with `CanaryTag`).
   *
   * So the base's BEHAVIOUR is reproduced exactly, colour ladder and all, and
   * the ask stays on the list. The 8%/16% blue is `colorBlueDark1` at those
   * opacities — the chip warms toward the colour it is about to become. The
   * SELECTED chip, already solid blue, darkens with a black inset instead: a
   * blue wash over blue is not a state change anyone can see.
   */
  const wash = isPressed ? 0.16 : isHovered ? 0.08 : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      className="rounded-[6px] font-['Roboto',sans-serif] text-[12px] font-medium leading-[18px] transition-colors cursor-pointer"
      style={{
        height: 28,
        paddingLeft: 10,
        paddingRight: 10,
        ...(isSelected
          ? {
              backgroundColor: colors.colorBlueDark1,
              color: colors.colorWhite,
              border: '1px solid transparent',
              boxShadow: wash ? `inset 0 0 0 999px rgba(0,0,0,${wash})` : undefined,
            }
          : {
              backgroundColor: wash ? `rgba(40,88,196,${wash})` : colors.colorWhite,
              color: colors.colorBlack2,
              border: `1px solid ${colors.colorBlack5}`,
            }),
      }}
    >
      {label}
    </button>
  );
}

/**
 * Binary attribute as a chip pair — the jam replaced the modal's radios with
 * chips so every attribute in the stack reads the same way. Re-clicking the
 * selected chip clears it, preserving the old deselectable-radio behaviour.
 */
export function BinaryChipRow<T extends string>({
  options,
  selected,
  onChange,
}: {
  options: [T, string][];
  selected: T | null;
  onChange: (value: T | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([value, label]) => (
        <FilterChip
          key={value}
          label={label}
          isSelected={selected === value}
          onClick={() => onChange(selected === value ? null : value)}
        />
      ))}
    </div>
  );
}

/** Which attributes a criteria object actually uses. */
export function isCriteriaEmptyFor(
  criteria: BroadcastFilterCriteria,
  key: keyof BroadcastFilterCriteria
): boolean {
  const v = criteria[key];
  return Array.isArray(v) ? v.length === 0 : v === null;
}
