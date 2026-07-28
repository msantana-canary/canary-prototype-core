/**
 * BroadcastMessageBubble — REDESIGN: flat blocks, not bubbles
 * (broadcast step 1 baseline — the Conversations MessageBubble register)
 *
 * A sent broadcast is a LEFT-ALIGNED flat block, like every other message on the
 * redesigned surface: 32px rounded-8 sender avatar · title row (sender name +
 * right-aligned 10px uppercase time) · 14px body · meta row (antenna icon +
 * recipient count, then the "N FILTERS APPLIED" / segment-name chip that opens
 * the filters-applied modal).
 *
 * The old right-aligned tinted bubble with the trailing antenna tile is gone.
 */

'use client';

import React, { useState } from 'react';
import { BroadcastMessage, BroadcastMessageFilterSnapshot, LoyaltyTier } from '@/lib/products/messaging/broadcast-types';
import { format } from 'date-fns';
import Icon from '@mdi/react';
import { mdiVideoInputAntenna, mdiFilterOutline } from '@mdi/js';
import { CanaryModal, colors } from '@canary-ui/components';
import { Avatar } from '../Avatar';

const LOYALTY_LABELS: Record<LoyaltyTier, string> = {
  'non-member': 'Non-member',
  'club-member': 'Club Member',
  'silver-elite': 'Silver Elite',
  'gold-elite': 'Gold Elite',
  'platinum-elite': 'Platinum Elite',
  'diamond-elite': 'Diamond Elite',
};

/** Mock sender names are stored uppercase; the flat-block register renders names
 *  in sentence case (matching the Conversations staff name). */
function toTitleCase(name: string): string {
  return name
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function initialsFor(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
}

function FiltersAppliedModal({
  snapshot,
  isOpen,
  onClose,
}: {
  snapshot: BroadcastMessageFilterSnapshot;
  isOpen: boolean;
  onClose: () => void;
}) {
  const rows: { label: string; value: string }[] = [];

  if (snapshot.criteria.loyaltyTiers.length > 0) {
    rows.push({
      label: 'Loyalty status',
      value: snapshot.criteria.loyaltyTiers.map(t => LOYALTY_LABELS[t]).join(', '),
    });
  }
  if (snapshot.criteria.rateCodes.length > 0) {
    rows.push({ label: 'Rate Code', value: snapshot.criteria.rateCodes.join(', ') });
  }
  if (snapshot.criteria.groupCodes.length > 0) {
    rows.push({ label: 'Group Code', value: snapshot.criteria.groupCodes.join(', ') });
  }
  if (snapshot.criteria.roomNumbers.length > 0) {
    rows.push({ label: 'Room Number', value: snapshot.criteria.roomNumbers.join(', ') });
  }
  if (snapshot.criteria.lengthOfStay) {
    rows.push({ label: 'Length of Stay', value: snapshot.criteria.lengthOfStay === 'one-night' ? 'One night' : 'Multiple nights' });
  }
  if (snapshot.criteria.guestRecurrence) {
    rows.push({ label: 'Guest Recurrence', value: snapshot.criteria.guestRecurrence === 'first-time' ? 'First-time guest' : 'Recurring guest' });
  }

  return (
    <CanaryModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        snapshot.type === 'saved' && snapshot.savedFilterName
          ? `Filters applied — ${snapshot.savedFilterName}`
          : 'Filters applied'
      }
      size="small"
    >
      <div className="-my-4 py-6 -mx-6 px-6">
      <div className="rounded-[8px] overflow-hidden" style={{ border: `1px solid ${colors.colorBlack6}` }}>
        {rows.map((row, i) => (
          <div
            key={i}
            className="bg-white px-6 py-3"
            style={i < rows.length - 1 ? { borderBottom: `1px solid ${colors.colorBlack6}` } : undefined}
          >
            <p
              className="font-['Roboto',sans-serif] text-[14px] font-medium leading-[22px]"
              style={{ color: colors.colorBlack1 }}
            >
              {row.label}
            </p>
            <p
              className="font-['Roboto',sans-serif] text-[14px] leading-[22px]"
              style={{ color: colors.colorBlack3 }}
            >
              {row.value}
            </p>
          </div>
        ))}
      </div>
      </div>
    </CanaryModal>
  );
}

interface BroadcastMessageBubbleProps {
  message: BroadcastMessage;
}

export function BroadcastMessageBubble({ message }: BroadcastMessageBubbleProps) {
  const formattedTime = format(message.sentAt, 'h:mm a').toUpperCase();
  const [showFilterModal, setShowFilterModal] = useState(false);

  const displayName = toTitleCase(message.senderName);

  const filterLabel = message.filterSnapshot
    ? message.filterSnapshot.type === 'saved' && message.filterSnapshot.savedFilterName
      ? message.filterSnapshot.savedFilterName.toUpperCase()
      : `${message.filterSnapshot.attributeCount} FILTER${message.filterSnapshot.attributeCount !== 1 ? 'S' : ''} APPLIED`
    : null;

  return (
    <div
      className="flex items-start gap-3"
      style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8 }}
    >
      {/* Sender avatar */}
      <Avatar initials={initialsFor(message.senderName)} size="small" className="shrink-0" />

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col pt-1">
        {/* Title row — sender + timestamp */}
        <div className="flex items-center gap-2">
          <span
            className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[22px] truncate"
            style={{ color: colors.colorBlack1 }}
          >
            {displayName}
          </span>
          <span className="flex-1" />
          <span
            className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase whitespace-nowrap shrink-0"
            style={{ color: colors.colorBlack3 }}
          >
            {formattedTime}
          </span>
        </div>

        {/* Body */}
        <p
          className="font-['Roboto',sans-serif] text-[14px] leading-[22px] whitespace-pre-wrap"
          style={{ color: colors.colorBlack1 }}
        >
          {message.content}
        </p>

        {/* Meta row — reach + the filter/segment chip */}
        <div className="flex items-center gap-2 flex-wrap" style={{ paddingTop: 2 }}>
          <div className="flex items-center gap-1">
            <Icon path={mdiVideoInputAntenna} size={0.58} color={colors.colorBlack3} />
            <span
              className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase"
              style={{ color: colors.colorBlack3 }}
            >
              {message.recipientCount} recipient{message.recipientCount !== 1 ? 's' : ''}
            </span>
          </div>

          {message.filterSnapshot && (
            <button
              type="button"
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-1 rounded-[6px] cursor-pointer transition-opacity hover:opacity-80"
              style={{
                backgroundColor: colors.colorBlueDark5,
                paddingLeft: 6,
                paddingRight: 6,
                paddingTop: 2,
                paddingBottom: 2,
              }}
            >
              <Icon path={mdiFilterOutline} size={0.5} color={colors.colorBlueDark1} />
              <span
                className="font-['Roboto',sans-serif] font-medium text-[10px] leading-[16px] uppercase"
                style={{ color: colors.colorBlueDark1 }}
              >
                {filterLabel}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Filters applied modal */}
      {message.filterSnapshot && (
        <FiltersAppliedModal
          snapshot={message.filterSnapshot}
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
        />
      )}
    </div>
  );
}
