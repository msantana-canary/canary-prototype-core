/**
 * Conversation Details panel — the shared vocabulary.
 *
 * Every page in the panel is built from these: one header register, one tag
 * register, one label/value row, one section heading, one empty state, one
 * reservation row. The panel has nine pages; without a shared vocabulary it
 * would have nine dialects.
 *
 * TAGS: everything here goes through `<PanelTag>`, which is `CanaryTag` plus the
 * `canary-tag-r4` class. The library hardcodes a 2px radius; at these sizes that
 * reads as a hard rectangle next to the rounded-4/8 objects the panel is made
 * of. Miguel called the change on 2026-08-20 — it is logged for promotion, and
 * until the library moves, the class is how every tag on this surface opts in.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  ButtonSize,
  ButtonType,
  CanaryButton,
  CanaryList,
  CanaryTag,
  colors,
  TagColor,
  TagSize,
  TagVariant,
} from '@canary-ui/components';
import Icon from '@mdi/react';
import {
  mdiArrowLeft,
  mdiClose,
  mdiContentCopy,
  mdiCheck,
  mdiDotsHorizontal,
} from '@mdi/js';
import { Reservation } from '@/lib/core/types/reservation';
import { useEscapeLayer } from '@/lib/products/messaging/escape-stack';

export const PANEL_PAD = 24;

/**
 * A STABLE dom id for an icon button's accessible name.
 *
 * `CanaryButton` carries no `aria-label` and spreads no rest props, so every
 * icon button on this surface takes its name from the mdi `Icon`'s `title`,
 * which the library renders as an `<svg><title>` the button's name computation
 * picks up. `@mdi/react` derives that title element's id from a MODULE-LEVEL
 * COUNTER whenever no `id` is passed, and the counter advances at different
 * points on the server and on the client — the hydration mismatch documented in
 * `ThreadListItem`. Deriving the id from the label never touches the counter,
 * and a label is already unique per control on screen.
 */
export function glyphTitleId(label: string) {
  return `glyph-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

/* ─────────────────────────────────────────────────────────────────────────
   Header
   ───────────────────────────────────────────────────────────────────────── */

/**
 * The panel's one header row. The ROOT reads "Conversation Details"; a drill-in
 * REPLACES the whole profile/tab chrome behind "← {Page title}". The X never
 * moves — wherever you are inside the panel, the same corner closes it.
 *
 * Both corner controls are `CanaryButton` ICON_SECONDARY + `isRounded` — the
 * base already draws a transparent, zero-padding round icon button whose
 * `.button-bg` layer washes on hover and press. `.icon-btn-neutral` repaints
 * that layer black (the library's wash is 8% of a ButtonColor, and every
 * non-status colour resolves to blue) and `.icon-btn-30` restores the panel's
 * 30px, two below the ramp's COMPACT 32. See the block in globals.css.
 */
export function PanelHeader({
  title,
  onBack,
  onClose,
}: {
  title: string;
  onBack?: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="flex items-center shrink-0"
      style={{
        height: 64,
        paddingLeft: onBack ? 16 : PANEL_PAD,
        paddingRight: PANEL_PAD,
        borderBottom: `1px solid ${colors.colorBlack6}`,
        gap: onBack ? 8 : 0,
      }}
    >
      {onBack && (
        <CanaryButton
          type={ButtonType.ICON_SECONDARY}
          size={ButtonSize.COMPACT}
          isRounded
          onClick={onBack}
          className="icon-btn-neutral icon-btn-30"
          icon={
            <Icon
              path={mdiArrowLeft}
              size={0.8}
              color={colors.colorBlack1}
              title="Back"
              id="panel-header-back"
            />
          }
        />
      )}
      <h2
        className="flex-1 min-w-0 truncate font-['Roboto',sans-serif] font-medium text-[18px] leading-[27px]"
        style={{ color: colors.colorBlack1 }}
      >
        {title}
      </h2>
      <CanaryButton
        type={ButtonType.ICON_SECONDARY}
        size={ButtonSize.COMPACT}
        isRounded
        onClick={onClose}
        className="icon-btn-neutral icon-btn-30"
        icon={
          <Icon
            path={mdiClose}
            size={0.72}
            color={colors.colorBlack1}
            title="Close conversation details"
            id="panel-header-close"
          />
        }
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Tags
   ───────────────────────────────────────────────────────────────────────── */

export function PanelTag({
  label,
  color,
  uppercase = true,
}: {
  label: string;
  color: TagColor;
  uppercase?: boolean;
}) {
  return (
    <CanaryTag
      label={label}
      color={color}
      variant={TagVariant.OUTLINE}
      size={TagSize.COMPACT}
      uppercase={uppercase}
      className="canary-tag-r4 shrink-0"
    />
  );
}

/**
 * The PMS lifecycle vocabulary — the ONE visual channel for a reservation's
 * state. Our prototype's `upcoming` is production's "Reserved". Cancelled and
 * no-show never reach the panel (they're filtered upstream).
 */
const LIFECYCLE: Record<string, { label: string; color: TagColor }> = {
  upcoming: { label: 'Reserved', color: TagColor.INFO },
  'checked-in': { label: 'Checked-in', color: TagColor.SUCCESS },
  'checked-out': { label: 'Checked out', color: TagColor.DEFAULT },
};

export function LifecycleTag({
  status,
  uppercase = true,
}: {
  status: Reservation['status'];
  uppercase?: boolean;
}) {
  const cfg = LIFECYCLE[status];
  if (!cfg) return null;
  return <PanelTag label={cfg.label} color={cfg.color} uppercase={uppercase} />;
}

/* ─────────────────────────────────────────────────────────────────────────
   Label / value rows
   ───────────────────────────────────────────────────────────────────────── */

export interface DetailRow {
  label: string;
  /** Rendered right-aligned. A node when the value needs an affordance. */
  value: React.ReactNode;
  /** Values that read as an action (Add name / Add email) take the link colour. */
  isLink?: boolean;
  isError?: boolean;
  onClick?: () => void;
  trailing?: React.ReactNode;
}

/**
 * The reservation record's anatomy: gray label left, value right, no dividers.
 * Production's complete block, deliberately — the panel is a verification aid,
 * and a verification aid that hides fields makes you open the PMS.
 */
export function DetailRows({ rows }: { rows: DetailRow[] }) {
  return (
    <div>
      {rows.map((row) => {
        const body = (
          <>
            <span
              className="font-['Roboto',sans-serif] text-[13px] leading-[20px] shrink-0"
              style={{ color: colors.colorBlack3 }}
            >
              {row.label}
            </span>
            <span className="flex-1" />
            <span
              className="flex items-center gap-1.5 min-w-0 font-['Roboto',sans-serif] text-[13px] leading-[20px] text-right truncate"
              style={{
                color: row.isError
                  ? colors.colorRed1
                  : row.isLink
                    ? colors.colorBlueDark1
                    : colors.colorBlack2,
              }}
            >
              {row.value}
              {row.trailing}
            </span>
          </>
        );

        if (row.onClick) {
          return (
            <button
              key={row.label}
              onClick={row.onClick}
              className="w-full flex items-center text-left transition-colors rounded-[4px] hover:bg-[rgba(0,0,0,0.03)]"
              style={{ paddingTop: 3, paddingBottom: 3 }}
            >
              {body}
            </button>
          );
        }
        return (
          <div key={row.label} className="flex items-center" style={{ paddingTop: 3, paddingBottom: 3 }}>
            {body}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Copy affordance — blue, bare, and a no-op stub beyond the clipboard write.
 *
 * The SMALLEST icon button on the surface, and the one the base contributes
 * least to: `ButtonSize.TINY` is 24px, the bottom of the library's ramp, while
 * a DetailRow's 20px line-height budget has room for exactly 20. It still rides
 * `CanaryButton` — the register (transparent at rest, a wash on hover, a 4px
 * radius, a ReactNode glyph whose colour stays ours) is the same one every
 * other icon button here uses, and one register implemented twice is how two
 * icon buttons end up disagreeing about their hover. `.icon-btn-20` supplies
 * the size and releases the library's 20px glyph box so an 18px glyph hugs.
 * "Sub-24px icon button" is logged as the design-system ask.
 *
 * `stopPropagation` stays: the copy icon sits INSIDE clickable rows, and
 * copying a confirmation number must not also open the row behind it.
 */
export function CopyIcon({ value, label }: { value: string; label?: string }) {
  const name = label ?? 'Copy';
  return (
    <CanaryButton
      type={ButtonType.ICON_SECONDARY}
      size={ButtonSize.TINY}
      onClick={(e) => {
        e.stopPropagation();
        void navigator.clipboard?.writeText(value).catch(() => {});
      }}
      className="icon-btn-neutral icon-btn-20"
      icon={
        <Icon
          path={mdiContentCopy}
          size={0.62}
          color={colors.colorBlueDark1}
          title={name}
          id={glyphTitleId(name)}
        />
      }
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Carrier error register
   ───────────────────────────────────────────────────────────────────────── */

/**
 * ONE failed channel: a small gray channel overline, then one red sentence in
 * which ONLY the carrier code is underlined.
 *
 * ⚠ EXTRACTED, not written (batch 4). This anatomy landed inline in the guest
 * -journey scheduled-messages timeline, and the "Message Not Delivered" modal
 * draws the identical thing at a larger size. Two inline copies of a failure
 * register is how two products end up disagreeing about what a carrier said, so
 * it is one component now — and it is already on the promotion list, because
 * every Canary product that sends anything can fail exactly this way.
 *
 * The underline is the code and nothing else: the number is the searchable,
 * quotable, support-ticketable part, and the sentence around it is our own
 * translation of the carrier's wording. There is no "Learn more" and no tint —
 * a hotel cannot fix a carrier failure, but the code on screen saves Canary
 * support the investigation.
 *
 * `channel` renders VERBATIM. "WhatsApp" is brand-cased and "SMS" is an
 * initialism; a `text-transform` here would invent a brand.
 */
export function CarrierErrorLine({
  channel,
  code,
  detail,
  compact = false,
}: {
  channel: string;
  code: string;
  detail: string;
  /** The timeline's tighter 13px setting. The modal draws 14px. */
  compact?: boolean;
}) {
  return (
    <div>
      <span
        className={`block font-['Roboto',sans-serif] text-[12px] ${compact ? 'leading-[16px]' : 'leading-[18px]'}`}
        style={{ color: colors.colorBlack3 }}
      >
        {channel}
      </span>
      <p
        className={`font-['Roboto',sans-serif] ${compact ? 'text-[13px] leading-[19px]' : 'text-[14px] leading-[22px]'}`}
        style={{ color: colors.colorRed1, marginTop: 2 }}
      >
        Error{' '}
        <span
          role="link"
          tabIndex={0}
          className="underline cursor-pointer"
          style={{ textUnderlineOffset: 2 }}
        >
          {code}
        </span>
        : {detail}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Control card
   ───────────────────────────────────────────────────────────────────────── */

/**
 * The root's control card — gray label over blue value, affordance icon at the
 * right edge. Assignment and Reservations are the only two things a hotelier
 * CHANGES from the panel root, and they are the panel's only two cards; they
 * share this component so their hover can never drift apart.
 *
 * HOVER is the SELECTION REGISTER, not a gray wash: `colorBlueDark5` fill +
 * `colorBlueDark1` border, exactly the tint family the selected thread row and
 * the reservation result row already use, and the label darkens #666 → #000.
 * A card whose whole job is "click me to change this" should answer the pointer
 * in the colour the product uses for "this one".
 *
 * ⚠ Hover is STATE, not a `hover:` class. Every colour here is inline, and an
 * inline style outranks any class — the same trap documented in
 * `ThreadListItem`, where an inline `backgroundColor` silently beat the hover
 * class and the row never lit up at all.
 */
export function ControlCard({
  label,
  value,
  iconPath,
  /** Per-glyph optical size: the chevron reads smaller than the ⇅ at equal size. */
  iconSize = 0.8,
  onClick,
  ariaLabel,
  ariaHasPopup,
  ariaExpanded,
}: {
  label: string;
  value: string;
  iconPath: string;
  iconSize?: number;
  onClick: () => void;
  ariaLabel?: string;
  ariaHasPopup?: 'listbox' | 'menu' | 'dialog';
  ariaExpanded?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      aria-haspopup={ariaHasPopup}
      aria-expanded={ariaExpanded}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className="w-full text-left rounded-[8px] cursor-pointer"
      style={{
        border: `1px solid ${isHovered ? colors.colorBlueDark1 : colors.colorBlack6}`,
        backgroundColor: isHovered ? colors.colorBlueDark5 : colors.colorWhite,
        transition: 'background-color 120ms ease-out, border-color 120ms ease-out',
        paddingLeft: 12,
        paddingRight: 10,
        paddingTop: 8,
        paddingBottom: 8,
        minHeight: 56,
      }}
    >
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <span
            className="block truncate font-['Roboto',sans-serif] text-[13px] leading-[20px]"
            style={{
              color: isHovered ? colors.colorBlack1 : colors.colorBlack3,
              transition: 'color 120ms ease-out',
            }}
          >
            {label}
          </span>
          <span
            className="block truncate font-['Roboto',sans-serif] text-[14px] leading-[22px]"
            style={{ color: colors.colorBlueDark1 }}
          >
            {value}
          </span>
        </div>
        <Icon path={iconPath} size={iconSize} color={colors.colorBlack1} />
      </div>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Section furniture
   ───────────────────────────────────────────────────────────────────────── */

/**
 * The in-body section heading. It repeats the active tab's label, which reads
 * redundant in a static frame but is what carries the section's ACTIONS —
 * refresh, "+" — and gives the tab body a top edge to hang off when it scrolls.
 */
export function SectionHeading({
  title,
  actions,
}: {
  title: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between" style={{ marginBottom: 12, minHeight: 30 }}>
      <h3
        className="font-['Roboto',sans-serif] font-medium text-[16px] leading-[24px]"
        style={{ color: colors.colorBlack1 }}
      >
        {title}
      </h3>
      {actions && <div className="flex items-center gap-1">{actions}</div>}
    </div>
  );
}

/**
 * A bare round icon action — the panel's one icon-button register, and the
 * component every section heading's refresh / "+" goes through.
 *
 * `CanaryButton` ICON_SECONDARY + `isRounded` IS this register: transparent at
 * rest, `p-0`, round, with an 8% / 16% wash layer for hover and press that the
 * hand-rolled button never had at all. Two overrides, both shared and both
 * explained in globals.css: `.icon-btn-neutral` repaints the wash black (the
 * library keys it to a ButtonColor, and every non-status colour resolves to
 * blue) and also carries the panel's 40% disabled fade over the library's 50%;
 * `.icon-btn-30` restores the 30px the frames draw, since the ramp stops at
 * COMPACT's 32.
 */
export function IconAction({
  path,
  label,
  onClick,
  disabled,
  isStub = false,
}: {
  path: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  /**
   * A control the FRAMES draw but this branch has no destination for.
   *
   * ⚠ It stays rendered and it stays on this register — deleting it would
   * change the panel's drawn anatomy, and fading it out would claim the action
   * is temporarily unavailable, which is a different (and false) statement.
   * What changes is the POINTER: `cursor-default` instead of `cursor-pointer`,
   * so the control stops promising a click it cannot answer. The tooltip does
   * the rest of the work by naming the product the action belongs to, exactly
   * as the per-row "Open {name} in Upsells" stubs beside it already do.
   *
   * A stub also takes no `onClick`. A handler that does nothing is
   * indistinguishable from a broken one, from the outside AND from the code.
   */
  isStub?: boolean;
}) {
  return (
    <CanaryButton
      type={ButtonType.ICON_SECONDARY}
      size={ButtonSize.COMPACT}
      isRounded
      isDisabled={disabled}
      onClick={onClick}
      className={`icon-btn-neutral icon-btn-30${isStub ? ' !cursor-default' : ''}`}
      icon={
        <Icon
          path={path}
          size={0.72}
          color={colors.colorBlack1}
          title={label}
          id={glyphTitleId(label)}
        />
      }
    />
  );
}

/**
 * The quiet empty state. It is the ~80% case for most of these tabs, so it is
 * deliberately unfurnished — no illustration, no call to action, just the fact.
 */
export function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <span
        className="font-['Roboto',sans-serif] text-[14px] leading-[21px]"
        style={{ color: colors.colorBlack3 }}
      >
        {label}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Expanding regions — RE-EXPORTED, not owned (2026-08-24)

   `ExpandRegion`, `useMountedThrough` and the 220/160 pair moved down to
   `components/products/messaging/motion.tsx` when the message feed's AI steps
   trace became the surface's THIRD expander. The thread must not import the
   panel's vocabulary to get one animation, so the mechanism moved to a module
   both can sit above. These re-exports exist so every call site in the panel is
   unchanged and there is still exactly one implementation.
   ───────────────────────────────────────────────────────────────────────── */

export {
  ExpandRegion,
  useMountedThrough,
  REGION_OPEN_MS,
  REGION_CLOSE_MS,
} from '../motion';

/**
 * A bordered container of hairline-divided rows — the panel's list idiom.
 *
 * `CanaryList hasOuterBorder` is pixel-identical to what this was hand-rolling:
 * a `<ul>` with a 1px `colorBlack6` border, `rounded-lg` (8px), a white ground
 * and `overflow-hidden`.
 *
 * ⚠ IT ALSO DRAWS THE HAIRLINES. Every child is wrapped in a motion div that
 * carries `borderBottom: 1px solid colorBlack6` unless it is the last one, so
 * the `<RowDivider>` this file used to export is GONE rather than swapped for
 * `CanaryDivider` — keeping either would have put a 2px rule between rows.
 * Consumers map their rows STRAIGHT into this component, keyed: the library
 * reads `children` as `Array.isArray(children) ? children : [children]`, so a
 * fragment wrapping the map would count as one child and every divider would
 * disappear with it.
 *
 * ⚠ AND IT ANIMATES. Each wrapper mounts with `opacity 0→1, y −8→0` over 350ms
 * and there is no prop to turn it off — rows fade and slide into place, which
 * the hand-rolled list did not do. Logged as the ask ("an opt-out for
 * CanaryList's per-child mount animation").
 */
export function RowList({ children }: { children: React.ReactNode }) {
  return <CanaryList hasOuterBorder>{children}</CanaryList>;
}

/* ─────────────────────────────────────────────────────────────────────────
   Kebab
   ───────────────────────────────────────────────────────────────────────── */

export interface KebabItem {
  label: string;
  onClick?: () => void;
  /** A disabled item still SHOWS — with the reason underneath. */
  disabled?: boolean;
  /** The production rationale, printed under a disabled item. */
  hint?: string;
  danger?: boolean;
}

/**
 * The ⋯ menu. A disabled item is rendered, not hidden: "you can't unlink this"
 * plus the reason is information; a missing menu item is a mystery.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠ STRUCTURAL EXCEPTION — the POPOVER is hand-rolled; the TRIGGER is not
 * ═══════════════════════════════════════════════════════════════════════════
 * The nearest base is `CanaryOverflowMenu`, and to be clear about the record:
 * v0.6.0 DOES export it — with a custom trigger slot, `placement`, `isDanger`
 * and `isDivider`. Any claim on this branch that the library "exports no
 * equivalent" (REDESIGN_NOTES 7d) is STALE and should be read as describing an
 * older version. The exception below is about the item CONTRACT, not about
 * whether the component exists.
 *
 * What the contract cannot express is the one thing this menu is for. In
 * `CanaryOverflowMenu`, `item.label` is typed `string`; every non-divider item
 * is unconditionally clickable — `cursor-pointer`, a hover wash, and a click
 * handler that closes the menu regardless of what the item does; and there is
 * no per-item `disabled` flag, no hint slot, and no class hook to kill pointer
 * events on one row. The disabled-item-plus-reason row — the phone-matched
 * auto-link in `CompanionRow`, and the profile kebab — needs all four: a
 * two-line ReactNode label, an item that does not respond to the pointer, and
 * a click on it that leaves the menu OPEN so the reason stays on screen.
 *
 * ServiceTasksTab's enabled-only "Unlink" menu could ride the base today, but
 * splitting one register across two implementations recreates exactly the
 * drift this component exists to prevent. So: one hand-rolled popover, and the
 * library ask logged as item-level `disabled` + `hint` + ReactNode `label` +
 * stay-open-on-disabled-click.
 *
 * The TRIGGER is not part of the exception — it is the panel's ordinary 30px
 * round icon button and it rides `CanaryButton` like every other one.
 *
 * ⚠ ONE ARIA LOSS, unavoidable: the hand-rolled trigger carried
 * `aria-expanded={isOpen}`. `CanaryButton` renders a bare `<button>`, spreads
 * no rest props and forwards no ref, so nothing outside can attach it. Logged
 * with the `aria-label` passthrough ask.
 */
export function Kebab({ items, label = 'More actions', width = 248 }: { items: KebabItem[]; label?: string; width?: number }) {
  const [isOpen, setIsOpen] = useState(false);
  // One ref on the ROOT rather than one each on the trigger and the menu:
  // `CanaryButton` forwards no ref, and "inside the root" is the same test —
  // both the trigger and the popover are its descendants.
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocMouseDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [isOpen]);

  /**
   * ESCAPE CLOSES, AND FOCUS GOES BACK TO THE TRIGGER (QA-2, 2026-08-25).
   *
   * This popover listened for an outside MOUSEDOWN and nothing else, so a
   * keyboard user could open it and then had no way to put it away —
   * "Change primary guest" stayed on screen through Escape. It goes through the
   * shared layer stack rather than a document listener of its own, because this
   * menu lives INSIDE `PanelShell`, which now also answers Escape: the stack is
   * what makes the popover close first and the panel stay put.
   *
   * ⚠ `CanaryButton` forwards no ref, so the trigger is found by position: it
   * is the FIRST `<button>` inside the root, and the popover (whose items are
   * also buttons) always renders after it.
   */
  const triggerButton = () => rootRef.current?.querySelector('button') ?? null;

  useEscapeLayer(isOpen, () => {
    setIsOpen(false);
    triggerButton()?.focus();
  });

  /**
   * Arrow navigation over the ENABLED rows. Disabled items render as `<div>`s
   * (they carry a reason and must not be activable), so `button` is exactly the
   * set that should take focus — the arrows skip the reasons rather than
   * parking on something Enter cannot fire.
   */
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      event.preventDefault();
      setIsOpen(true);
      // The rows do not exist until the next commit, so land on one then.
      requestAnimationFrame(() => {
        const rows = Array.from(
          rootRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? []
        ).slice(1);
        (event.key === 'ArrowUp' ? rows[rows.length - 1] : rows[0])?.focus();
      });
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End', 'Tab'].includes(event.key)) return;

    if (event.key === 'Tab') {
      setIsOpen(false);
      return;
    }

    const rows = Array.from(
      rootRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? []
    ).slice(1); // index 0 is the trigger
    if (rows.length === 0) return;

    event.preventDefault();
    const at = rows.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? rows.length - 1
          : event.key === 'ArrowDown'
            ? Math.min(at + 1, rows.length - 1)
            : at <= 0
              ? 0
              : at - 1;
    rows[next]?.focus();
  };

  return (
    <div className="relative shrink-0" ref={rootRef} onKeyDown={onKeyDown}>
      <CanaryButton
        type={ButtonType.ICON_SECONDARY}
        size={ButtonSize.COMPACT}
        isRounded
        className="icon-btn-neutral icon-btn-30"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((v) => !v);
        }}
        icon={
          <Icon
            path={mdiDotsHorizontal}
            size={0.8}
            color={colors.colorBlack1}
            title={label}
            id={glyphTitleId(label)}
          />
        }
      />

      {isOpen && (
        <div
          className="absolute right-0 bg-white rounded-[8px] py-1 z-50"
          style={{ top: 34, width, border: `1px solid ${colors.colorBlack6}` }}
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((item) =>
            item.disabled ? (
              <div key={item.label} className="px-4 py-2 cursor-not-allowed" style={{ opacity: 0.7 }}>
                <p className="font-['Roboto',sans-serif] text-[14px] leading-[21px]" style={{ color: colors.colorBlack4 }}>
                  {item.label}
                </p>
                {item.hint && (
                  <p
                    className="font-['Roboto',sans-serif] text-[11px] leading-[15px]"
                    style={{ color: colors.colorBlack4, marginTop: 2 }}
                  >
                    {item.hint}
                  </p>
                )}
              </div>
            ) : (
              <button
                key={item.label}
                className="w-full text-left px-4 py-2 font-['Roboto',sans-serif] text-[14px] leading-[21px] transition-colors hover:bg-gray-50"
                style={{ color: item.danger ? colors.colorRed1 : colors.colorBlack1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  item.onClick?.();
                }}
              >
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Sticky footer
   ───────────────────────────────────────────────────────────────────────── */

/**
 * The panel's commit bar: full-width, pinned to the panel's bottom edge with a
 * hairline above it. Disabled is a wash-out, not a gray box — the frames keep
 * the same shape and drop the contrast.
 *
 * TWO registers, because the frames draw two and the difference is meaningful:
 *
 *   TONAL (default)  — the panel's own commits. "Submit" a service task, "Give
 *                      AI Feedback". You are still inside the panel afterwards.
 *   PRIMARY          — the solid blue the AI feedback page uses for "Submit
 *                      Feedback". It is the end of a flow, not a step in one,
 *                      and it is the only button on a page whose whole purpose
 *                      is to press it.
 *
 * Both registers are `CanaryButton` and the mapping is exact: SHADED is
 * `colorBlueDark1` at 10% over white, which IS the tonal bar's `colorBlueDark5`
 * with a `colorBlueDark1` label, and PRIMARY is the solid blue with a white
 * one. The base also brings the hover and press states this bar never had —
 * SHADED washes to 25% / 50%, PRIMARY fades its label to 80% / 60%.
 *
 * `.panel-commit-button` is the one override, and it was already blessed:
 * `CanaryButton` NORMAL is h-10 / rounded-4 where the panel draws 44px /
 * rounded-8, and PRIMARY is the one type the library gives a drop shadow, which
 * this branch draws nowhere. `CallDetailsPage`'s "Download Transcript" has been
 * on this exact route since batch 4 — this is the same bar, so it is the same
 * two lines. Disabled needs nothing: the library's own `canary-opacity-50` is
 * precisely the 0.5 wash-out this was setting by hand, and `isDisabled` sets
 * the native `disabled` attribute and `cursor-default` alongside it.
 */
export function PanelFooterAction({
  label,
  onClick,
  disabled,
  variant = 'tonal',
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'tonal' | 'primary';
}) {
  const isPrimary = variant === 'primary';
  return (
    <div
      className="shrink-0"
      style={{
        borderTop: `1px solid ${colors.colorBlack6}`,
        padding: PANEL_PAD,
      }}
    >
      <CanaryButton
        type={isPrimary ? ButtonType.PRIMARY : ButtonType.SHADED}
        size={ButtonSize.NORMAL}
        isDisabled={disabled}
        onClick={onClick}
        className="panel-commit-button w-full"
      >
        {label}
      </CanaryButton>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Page scaffolding
   ───────────────────────────────────────────────────────────────────────── */

/** A drill-in page: fixed header, scrolling body, optional sticky footer. */
export function PanelPage({
  title,
  onBack,
  onClose,
  footer,
  children,
  bodyPadding = PANEL_PAD,
}: {
  title: string;
  onBack: () => void;
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
  bodyPadding?: number;
}) {
  return (
    <div className="w-full h-full shrink-0 flex flex-col min-h-0">
      <PanelHeader title={title} onBack={onBack} onClose={onClose} />
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-invisible" style={{ padding: bodyPadding }}>
        {children}
      </div>
      {footer}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Selection check (link flow / primary picker)
   ───────────────────────────────────────────────────────────────────────── */

export function SelectedCheck() {
  return (
    <span className="shrink-0 flex items-center justify-center" style={{ width: 20, height: 20 }}>
      <Icon path={mdiCheck} size={0.72} color={colors.colorBlueDark1} />
    </span>
  );
}
