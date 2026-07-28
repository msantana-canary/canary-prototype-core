/**
 * BroadcastToStrip — variant B's addressing row.
 *
 * The thesis: a broadcast is a message TO someone, so the recipient belongs in
 * the composer as an address, the way it works in every mail client — not in a
 * permanently-open list occupying half the surface. The strip states who is
 * receiving in a sentence, flags anything surprising, and opens the full
 * recipients list on click.
 *
 * Anatomy: 36px row · "To:" label · audience token (folder icon + grammar) ·
 * filter/segment token when active (dismissible) · a quiet note on the right
 * when something is being held back · a ghost filter button on built-ins.
 *
 * Grammar:
 *   "In-house · all 34"    selection is the whole messageable folder
 *   "Arrivals · 18 of 26"  narrowed
 *   "Arrivals · 0 of 26 — no one to send to"   red, Send disabled
 */

'use client';

import React from 'react';
import Icon from '@mdi/react';
import {
  mdiLoginVariant,
  mdiBedOutline,
  mdiLogoutVariant,
  mdiAccountMultipleOutline,
  mdiFilterOutline,
  mdiClose,
} from '@mdi/js';
import { colors } from '@canary-ui/components';
import { AudienceFacts } from '@/lib/products/messaging/broadcast-audience-facts';
import { BuiltInGroupType } from '@/lib/products/messaging/broadcast-types';

const FOLDER_ICON: Record<BuiltInGroupType, string> = {
  arrivals: mdiLoginVariant,
  'in-house': mdiBedOutline,
  departures: mdiLogoutVariant,
};

function Token({
  iconPath,
  label,
  tone,
  onDismiss,
}: {
  iconPath: string;
  label: string;
  tone: 'audience' | 'neutral' | 'danger';
  onDismiss?: () => void;
}) {
  const palette =
    tone === 'danger'
      ? { bg: colors.colorRed5, fg: colors.colorRed1 }
      : tone === 'neutral'
      ? { bg: colors.colorBlack8, fg: colors.colorBlack1 }
      : { bg: colors.colorBlueDark5, fg: colors.colorBlueDark1 };

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-[6px] shrink-0"
      style={{ height: 24, paddingLeft: 8, paddingRight: onDismiss ? 4 : 8, backgroundColor: palette.bg }}
    >
      <Icon path={iconPath} size={0.58} color={palette.fg} />
      <span
        className="font-['Roboto',sans-serif] font-medium text-[12px] leading-[18px] whitespace-nowrap"
        style={{ color: palette.fg }}
      >
        {label}
      </span>
      {onDismiss && (
        <button
          type="button"
          aria-label="Clear filters"
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

export function BroadcastToStrip({
  audienceName,
  builtInType,
  facts,
  segmentName,
  onOpenRecipients,
  onOpenFilters,
  onClearFilters,
}: {
  audienceName: string;
  builtInType?: BuiltInGroupType;
  facts: AudienceFacts;
  segmentName?: string;
  onOpenRecipients: () => void;
  onOpenFilters?: () => void;
  onClearFilters: () => void;
}) {
  const { selectedCount, messageableCount } = facts;
  const isEmpty = selectedCount === 0;
  const isAll = selectedCount === messageableCount && messageableCount > 0;

  const audienceLabel = isEmpty
    ? `${audienceName} · 0 of ${messageableCount} — no one to send to`
    : isAll
    ? `${audienceName} · all ${selectedCount}`
    : `${audienceName} · ${selectedCount} of ${messageableCount}`;

  // The right-hand note surfaces ONE thing, most-actionable first: what the user
  // did, then what the system held back, then who simply can't be reached.
  const unreachable = facts.optedOut + facts.noPhone;
  const systemHeld = facts.alreadyCheckedIn + facts.alreadyCheckedOut;
  const note =
    facts.removedByYou > 0
      ? `${facts.removedByYou} removed`
      : systemHeld > 0
      ? `${systemHeld} already checked ${facts.alreadyCheckedOut > facts.alreadyCheckedIn ? 'out' : 'in'}`
      : unreachable > 0
      ? `${unreachable} can't receive texts`
      : null;

  return (
    <div
      onClick={onOpenRecipients}
      role="button"
      tabIndex={0}
      aria-label="Review recipients"
      className="flex items-center gap-2 cursor-pointer transition-colors hover:bg-[#f9fafb]"
      style={{ height: 36, paddingLeft: 12, paddingRight: 8 }}
    >
      <span
        className="font-['Roboto',sans-serif] text-[12px] leading-[18px] shrink-0"
        style={{ color: colors.colorBlack3 }}
      >
        To:
      </span>

      <Token
        iconPath={builtInType ? FOLDER_ICON[builtInType] : mdiAccountMultipleOutline}
        label={audienceLabel}
        tone={isEmpty ? 'danger' : 'audience'}
      />

      {facts.filterActive && (
        <Token
          iconPath={mdiFilterOutline}
          label={
            segmentName ??
            `${facts.filterCount} filter${facts.filterCount !== 1 ? 's' : ''}`
          }
          tone="neutral"
          onDismiss={onClearFilters}
        />
      )}

      <span className="flex-1 min-w-0" />

      {note && (
        <span
          className="font-['Roboto',sans-serif] text-[12px] leading-[18px] whitespace-nowrap shrink-0"
          style={{ color: colors.colorBlack3 }}
        >
          {note}
        </span>
      )}

      {onOpenFilters && (
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
          <Icon path={mdiFilterOutline} size={0.72} color={colors.colorBlack3} />
        </button>
      )}
    </div>
  );
}
