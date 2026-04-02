/**
 * BroadcastMessageBubble Component
 *
 * Displays a broadcast message in the thread.
 * Right-aligned with antenna icon, sender name, and recipient count.
 * Shows filter annotation when message was sent with filters.
 */

'use client';

import React, { useState } from 'react';
import { BroadcastMessage, BroadcastMessageFilterSnapshot, LoyaltyTier } from '@/lib/products/messaging/broadcast-types';
import { format } from 'date-fns';
import Icon from '@mdi/react';
import { mdiVideoInputAntenna, mdiAccountMultipleOutline, mdiFilterOutline } from '@mdi/js';
import { CanaryModal } from '@canary-ui/components';

const LOYALTY_LABELS: Record<LoyaltyTier, string> = {
  'non-member': 'Non-member',
  'club-member': 'Club Member',
  'silver-elite': 'Silver Elite',
  'gold-elite': 'Gold Elite',
  'platinum-elite': 'Platinum Elite',
  'diamond-elite': 'Diamond Elite',
};

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
      <div className="border border-[#e5e5e5] rounded-[8px] overflow-hidden">
        {rows.map((row, i) => (
          <div
            key={i}
            className={`bg-white px-6 py-3${i < rows.length - 1 ? ' border-b border-[#e5e5e5]' : ''}`}
          >
            <p
              className="font-['Roboto',sans-serif] text-[14px] font-medium leading-[22px]"
              style={{ color: '#000000' }}
            >
              {row.label}
            </p>
            <p
              className="font-['Roboto',sans-serif] text-[14px] leading-[22px]"
              style={{ color: '#666666' }}
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

  const filterLabel = message.filterSnapshot
    ? message.filterSnapshot.type === 'saved' && message.filterSnapshot.savedFilterName
      ? message.filterSnapshot.savedFilterName.toUpperCase()
      : `${message.filterSnapshot.attributeCount} FILTER${message.filterSnapshot.attributeCount !== 1 ? 'S' : ''} APPLIED`
    : null;

  return (
    <div className="flex gap-2 items-start mb-4">
      {/* Timestamp */}
      <p
        className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase w-[48px] shrink-0"
        style={{ color: '#999999' }}
      >
        {formattedTime}
      </p>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Message Container */}
      <div className="flex flex-col items-end max-w-[70%]">
        {/* Message Bubble */}
        <div
          className="w-full px-4 py-2 rounded-bl-2xl rounded-br-2xl rounded-tl-2xl"
          style={{ backgroundColor: '#eaeef9' }}
        >
          {/* Sender Name */}
          <p
            className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase mb-1 text-right"
            style={{ color: '#666666' }}
          >
            {message.senderName}
          </p>

          <p
            className="font-['Roboto',sans-serif] text-[14px] leading-[22px] whitespace-pre-wrap"
            style={{ color: '#000000' }}
          >
            {message.content}
          </p>

          {/* Filter annotation + Recipient count */}
          <div className="flex items-center justify-end gap-2 mt-1">
            {/* Filter link */}
            {message.filterSnapshot && (
              <div className="flex items-center gap-1">
                <Icon path={mdiFilterOutline} size={0.5} color="#2858c4" />
                <button
                  type="button"
                  className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase underline cursor-pointer"
                  style={{ color: '#2858c4', background: 'none', border: 'none', padding: 0 }}
                  onClick={() => setShowFilterModal(true)}
                >
                  {filterLabel}
                </button>
              </div>
            )}

            {/* Recipient count */}
            <div className="flex items-center gap-1">
              <Icon path={mdiAccountMultipleOutline} size={0.5} color="#666666" />
              <span
                className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase"
                style={{ color: '#666666' }}
              >
                {message.recipientCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast Icon (instead of avatar) */}
      <div
        className="w-8 h-8 rounded-2xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: '#eaeef9' }}
      >
        <Icon path={mdiVideoInputAntenna} size={0.67} color="#2858c4" />
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
