/**
 * BroadcastToStrip — the composer's addressing row. TEAM JAM CANON.
 *
 * A broadcast is a message TO someone, so the recipient is an address line, not
 * a permanently-open list. Two states:
 *
 *   Fresh folder — "To: All In-house guests (21)" plus, on date-scoped folders,
 *                  an inline editable date token: "Jul 30 ▾".
 *   Narrowed     — the audience token is joined by WRAPPING dismissible chips,
 *                  one per applied constraint ("Gold ×", "Departs on July 30,
 *                  2026 ×"), with the live count and the funnel right-aligned.
 *
 * The date token is a REAL filter: Arrivals and Departures are date-scoped, so
 * changing it changes the audience and the count.
 *
 * Clicking anywhere that isn't a sub-target opens the filter panel — the strip
 * and the funnel lead to the same one recipients surface.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import Icon from '@mdi/react';
import {
  mdiLoginVariant,
  mdiBedOutline,
  mdiLogoutVariant,
  mdiAccountMultipleOutline,
  mdiFilterVariant,
  mdiClose,
  mdiMenuDown,
  mdiCalendarOutline,
} from '@mdi/js';
import { colors } from '@canary-ui/components';
import { AudienceFacts } from '@/lib/products/messaging/broadcast-audience-facts';
import {
  BuiltInGroupType,
  LoyaltyTier,
  BroadcastFilterCriteria,
} from '@/lib/products/messaging/broadcast-types';

const FOLDER_ICON: Record<BuiltInGroupType, string> = {
  arrivals: mdiLoginVariant,
  'in-house': mdiBedOutline,
  departures: mdiLogoutVariant,
};

const TIER_LABEL: Record<LoyaltyTier, string> = {
  'non-member': 'Non-member',
  'club-member': 'Club Member',
  'silver-elite': 'Silver',
  'gold-elite': 'Gold',
  'platinum-elite': 'Platinum',
  'diamond-elite': 'Diamond',
};

/** yyyy-MM-dd → local Date, so the label can't slip a day. */
function parseDay(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function Chip({
  label,
  tone = 'neutral',
  iconPath,
  onDismiss,
}: {
  label: string;
  tone?: 'audience' | 'neutral' | 'danger';
  iconPath?: string;
  onDismiss?: () => void;
}) {
  const palette =
    tone === 'danger'
      ? { bg: colors.colorRed5, fg: colors.colorRed1 }
      : tone === 'audience'
      ? { bg: colors.colorBlueDark5, fg: colors.colorBlueDark1 }
      : { bg: colors.colorBlack7, fg: colors.colorBlack1 };

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-[6px] shrink-0"
      style={{
        height: 24,
        paddingLeft: iconPath ? 8 : 10,
        paddingRight: onDismiss ? 4 : 10,
        backgroundColor: palette.bg,
      }}
    >
      {iconPath && <Icon path={iconPath} size={0.55} color={palette.fg} />}
      <span
        className="font-['Roboto',sans-serif] font-medium text-[12px] leading-[18px] whitespace-nowrap"
        style={{ color: palette.fg }}
      >
        {label}
      </span>
      {onDismiss && (
        <button
          type="button"
          aria-label={`Remove ${label}`}
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="flex items-center justify-center rounded-[4px] cursor-pointer hover:bg-black/5"
          style={{ width: 18, height: 18 }}
        >
          <Icon path={mdiClose} size={0.5} color={palette.fg} />
        </button>
      )}
    </span>
  );
}

/** Inline date token — part of the address, with a small calendar popover. */
function DateToken({
  value,
  verb,
  isDefault,
  onChange,
  onReset,
}: {
  value: string;
  verb: string;
  isDefault: boolean;
  onChange: (date: string) => void;
  onReset: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  const day = parseDay(value);
  const shortLabel = day ? format(day, 'MMM d') : 'Pick a date';
  const longLabel = day ? format(day, 'MMMM d, yyyy') : '';

  return (
    <span className="relative inline-flex shrink-0" ref={rootRef}>
      {isDefault ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          className="inline-flex items-center gap-1 rounded-[6px] cursor-pointer transition-colors hover:bg-[#f0f0f0]"
          style={{ height: 24, paddingLeft: 6, paddingRight: 4 }}
        >
          <span
            className="font-['Roboto',sans-serif] text-[12px] leading-[18px] whitespace-nowrap"
            style={{ color: colors.colorBlack3 }}
          >
            {shortLabel}
          </span>
          <Icon path={mdiMenuDown} size={0.6} color={colors.colorBlack3} />
        </button>
      ) : (
        <span onClick={(e) => e.stopPropagation()}>
          <Chip
            iconPath={mdiCalendarOutline}
            label={`${verb} on ${longLabel}`}
            onDismiss={onReset}
          />
        </span>
      )}

      {open && (
        <span
          className="absolute left-0 z-50 rounded-[8px] bg-white"
          style={{
            top: 28,
            padding: 8,
            border: `1px solid ${colors.colorBlack6}`,
            boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="date"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setOpen(false);
            }}
            className="font-['Roboto',sans-serif] text-[13px] outline-none"
            style={{ color: colors.colorBlack1 }}
          />
        </span>
      )}
    </span>
  );
}

export function BroadcastToStrip({
  audienceName,
  builtInType,
  facts,
  activeFilters,
  selectedDate,
  defaultDate,
  onOpenRecipients,
  onOpenFilters,
  onSetDate,
  onRemoveFilter,
}: {
  audienceName: string;
  builtInType?: BuiltInGroupType;
  facts: AudienceFacts;
  activeFilters: BroadcastFilterCriteria;
  selectedDate: string;
  defaultDate: string;
  onOpenRecipients: () => void;
  onOpenFilters: () => void;
  onSetDate: (date: string) => void;
  onRemoveFilter: (next: BroadcastFilterCriteria) => void;
}) {
  const { selectedCount } = facts;
  const isEmpty = selectedCount === 0;
  const isDateScoped = builtInType === 'arrivals' || builtInType === 'departures';
  const dateVerb = builtInType === 'departures' ? 'Departs' : 'Arrives';
  const isDefaultDate = selectedDate === defaultDate;

  // One dismissible chip per applied constraint.
  const chips: { key: string; label: string; onDismiss: () => void }[] = [];
  for (const tier of activeFilters.loyaltyTiers) {
    chips.push({
      key: `tier-${tier}`,
      label: TIER_LABEL[tier],
      onDismiss: () =>
        onRemoveFilter({
          ...activeFilters,
          loyaltyTiers: activeFilters.loyaltyTiers.filter((t) => t !== tier),
        }),
    });
  }
  const listFields: ['rateCodes' | 'groupCodes' | 'roomNumbers', string][] = [
    ['rateCodes', 'Rate'],
    ['groupCodes', 'Group'],
    ['roomNumbers', 'Room'],
  ];
  for (const [field, prefix] of listFields) {
    for (const value of activeFilters[field]) {
      chips.push({
        key: `${field}-${value}`,
        label: `${prefix} ${value}`,
        onDismiss: () =>
          onRemoveFilter({
            ...activeFilters,
            [field]: activeFilters[field].filter((v) => v !== value),
          }),
      });
    }
  }
  if (activeFilters.lengthOfStay) {
    chips.push({
      key: 'los',
      label: activeFilters.lengthOfStay === 'one-night' ? 'One night' : 'Multiple nights',
      onDismiss: () => onRemoveFilter({ ...activeFilters, lengthOfStay: null }),
    });
  }
  if (activeFilters.guestRecurrence) {
    chips.push({
      key: 'rec',
      label: activeFilters.guestRecurrence === 'first-time' ? 'First-time' : 'Recurring',
      onDismiss: () => onRemoveFilter({ ...activeFilters, guestRecurrence: null }),
    });
  }

  const isNarrowed = chips.length > 0 || (isDateScoped && !isDefaultDate);

  return (
    <div
      onClick={onOpenRecipients}
      role="button"
      tabIndex={0}
      aria-label="Review recipients"
      className="flex items-start gap-2 cursor-pointer transition-colors hover:bg-[#f9fafb]"
      style={{ minHeight: 36, paddingLeft: 12, paddingRight: 8, paddingTop: 6, paddingBottom: 6 }}
    >
      <span
        className="font-['Roboto',sans-serif] text-[12px] leading-[18px] shrink-0 whitespace-nowrap"
        style={{ color: colors.colorBlack3, paddingTop: 3 }}
      >
        To:
      </span>

      {/* Address — wraps once it becomes chips */}
      <div className="flex-1 min-w-0 flex flex-wrap items-center" style={{ gap: 6 }}>
        <Chip
          iconPath={builtInType ? FOLDER_ICON[builtInType] : mdiAccountMultipleOutline}
          label={
            isEmpty
              ? `${audienceName} · no one to send to`
              : isNarrowed
              ? audienceName
              : `All ${audienceName} guests (${selectedCount})`
          }
          tone={isEmpty ? 'danger' : 'audience'}
        />

        {isDateScoped && (
          <DateToken
            value={selectedDate}
            verb={dateVerb}
            isDefault={isDefaultDate}
            onChange={onSetDate}
            onReset={() => onSetDate(defaultDate)}
          />
        )}

        {chips.map((c) => (
          <Chip key={c.key} label={c.label} onDismiss={c.onDismiss} />
        ))}
      </div>

      {/* Live count + funnel, right-aligned */}
      {isNarrowed && !isEmpty && (
        <span
          className="font-['Roboto',sans-serif] text-[12px] leading-[18px] whitespace-nowrap shrink-0"
          style={{ color: colors.colorBlack3, paddingTop: 3 }}
        >
          {selectedCount} guest{selectedCount !== 1 ? 's' : ''}
        </span>
      )}

      <button
        type="button"
        aria-label="Filter guests"
        onClick={(e) => {
          e.stopPropagation();
          onOpenFilters();
        }}
        className="flex items-center justify-center rounded-[4px] hover:bg-[#f0f0f0] transition-colors cursor-pointer shrink-0"
        style={{ padding: 6 }}
      >
        <Icon
          path={mdiFilterVariant}
          size={0.72}
          color={facts.filterActive ? colors.colorBlueDark1 : colors.colorBlack3}
        />
      </button>
    </div>
  );
}
