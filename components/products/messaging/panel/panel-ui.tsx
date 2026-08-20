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
  colors,
  CanaryTag,
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

export const PANEL_PAD = 24;

/* ─────────────────────────────────────────────────────────────────────────
   Header
   ───────────────────────────────────────────────────────────────────────── */

/**
 * The panel's one header row. The ROOT reads "Conversation Details"; a drill-in
 * REPLACES the whole profile/tab chrome behind "← {Page title}". The X never
 * moves — wherever you are inside the panel, the same corner closes it.
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
        <button
          onClick={onBack}
          aria-label="Back"
          className="w-[30px] h-[30px] shrink-0 flex items-center justify-center rounded-full transition-colors hover:bg-[#f0f0f0]"
        >
          <Icon path={mdiArrowLeft} size={0.8} color={colors.colorBlack1} />
        </button>
      )}
      <h2
        className="flex-1 min-w-0 truncate font-['Roboto',sans-serif] font-medium text-[18px] leading-[27px]"
        style={{ color: colors.colorBlack1 }}
      >
        {title}
      </h2>
      <button
        onClick={onClose}
        aria-label="Close conversation details"
        className="w-[30px] h-[30px] shrink-0 flex items-center justify-center rounded-full transition-colors hover:bg-[#f0f0f0]"
      >
        <Icon path={mdiClose} size={0.72} color={colors.colorBlack1} />
      </button>
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

/** Copy affordance — blue, bare, and a no-op stub beyond the clipboard write. */
export function CopyIcon({ value, label }: { value: string; label?: string }) {
  return (
    <button
      aria-label={label ?? 'Copy'}
      onClick={(e) => {
        e.stopPropagation();
        void navigator.clipboard?.writeText(value).catch(() => {});
      }}
      className="shrink-0 flex items-center justify-center rounded-[4px] transition-colors hover:bg-[rgba(0,0,0,0.06)]"
      style={{ width: 20, height: 20 }}
    >
      <Icon path={mdiContentCopy} size={0.62} color={colors.colorBlueDark1} />
    </button>
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

/** A bare round icon action — the panel's one icon-button register. */
export function IconAction({
  path,
  label,
  onClick,
  disabled,
}: {
  path: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="w-[30px] h-[30px] flex items-center justify-center rounded-full transition-colors enabled:hover:bg-[#f0f0f0] disabled:opacity-40"
    >
      <Icon path={path} size={0.72} color={colors.colorBlack1} />
    </button>
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

/** A bordered container of hairline-divided rows — the panel's list idiom. */
export function RowList({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[8px] overflow-hidden" style={{ border: `1px solid ${colors.colorBlack6}` }}>
      {children}
    </div>
  );
}

export function RowDivider({ isFirst }: { isFirst: boolean }) {
  if (isFirst) return null;
  return <div style={{ height: 1, backgroundColor: colors.colorBlack6 }} />;
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
 */
export function Kebab({ items, label = 'More actions', width = 248 }: { items: KebabItem[]; label?: string; width?: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onDocMouseDown = (event: MouseEvent) => {
      if (
        menuRef.current &&
        btnRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !btnRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [isOpen]);

  return (
    <div className="relative shrink-0">
      <button
        ref={btnRef}
        aria-label={label}
        aria-expanded={isOpen}
        className="w-[30px] h-[30px] flex items-center justify-center rounded-full transition-colors hover:bg-[#f0f0f0]"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((v) => !v);
        }}
      >
        <Icon path={mdiDotsHorizontal} size={0.8} color={colors.colorBlack1} />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
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
 * The panel's commit bar: full-width, tonal blue, pinned to the panel's bottom
 * edge with a hairline above it. Disabled is a wash-out, not a gray box — the
 * frames keep the same shape and drop the contrast.
 */
export function PanelFooterAction({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      className="shrink-0"
      style={{
        borderTop: `1px solid ${colors.colorBlack6}`,
        padding: PANEL_PAD,
      }}
    >
      <button
        onClick={onClick}
        disabled={disabled}
        className="w-full rounded-[8px] font-['Roboto',sans-serif] font-medium text-[14px] leading-[22px] transition-colors"
        style={{
          height: 44,
          backgroundColor: colors.colorBlueDark5,
          color: colors.colorBlueDark1,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'default' : 'pointer',
        }}
      >
        {label}
      </button>
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
