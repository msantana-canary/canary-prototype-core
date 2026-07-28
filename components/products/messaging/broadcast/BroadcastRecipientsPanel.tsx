/**
 * BroadcastRecipientsPanel — variant B's recipients surface.
 *
 * In this paradigm the recipient list is not permanent furniture; it is opened
 * from the To strip when you want to check or edit who is receiving. It rides
 * the shared FloatingPanel shell at 480px and carries the baseline recipients
 * experience verbatim — buckets, checkboxes, opted-out and no-phone treatment,
 * sticky selection, sorting, contact popover — via the same
 * <BroadcastGuestList> the baseline renders, with its controls lifted into this
 * header.
 *
 * A persistent footer opens the SUBTRACTION LEDGER on a level-2 slide, using the
 * same translateX drill-in mechanic as the Conversation Details sidebar. The
 * ledger answers "why these guests?" by showing the arithmetic rather than
 * asserting a number.
 *
 * NOTE for the designer: this uses the standard shell scrim for consistency with
 * the other panels. Whether a recipients panel opened from the composer should
 * dim the app behind it — when the thing you're checking is the message you're
 * still writing — is worth an eyeball.
 */

'use client';

import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiClose, mdiChevronRight, mdiChevronLeft, mdiFilterOutline } from '@mdi/js';
import { colors, CanaryCheckbox } from '@canary-ui/components';
import { FloatingPanel } from '../FloatingPanel';
import { BroadcastGuestList } from './BroadcastGuestList';
import { useBroadcastStore } from '@/lib/products/messaging/broadcast-store';
import { AudienceFacts } from '@/lib/products/messaging/broadcast-audience-facts';

function LedgerLine({
  label,
  value,
  tone = 'normal',
}: {
  label: string;
  value: string;
  tone?: 'normal' | 'source' | 'total';
}) {
  const isEmphasis = tone === 'source' || tone === 'total';
  return (
    <div
      className="flex items-center justify-between"
      style={{
        paddingTop: 10,
        paddingBottom: 10,
        borderTop: tone === 'total' ? `1px solid ${colors.colorBlack6}` : undefined,
      }}
    >
      <span
        className={`font-['Roboto',sans-serif] text-[14px] leading-[22px] ${isEmphasis ? 'font-medium' : ''}`}
        style={{ color: isEmphasis ? colors.colorBlack1 : colors.colorBlack2 }}
      >
        {label}
      </span>
      <span
        className={`font-['Roboto',sans-serif] text-[14px] leading-[22px] tabular-nums ${isEmphasis ? 'font-medium' : ''}`}
        style={{ color: isEmphasis ? colors.colorBlack1 : colors.colorBlack3 }}
      >
        {value}
      </span>
    </div>
  );
}

export function BroadcastRecipientsPanel({
  isOpen,
  onClose,
  audienceName,
  facts,
}: {
  isOpen: boolean;
  onClose: () => void;
  audienceName: string;
  facts: AudienceFacts;
}) {
  const { selectAllGuests, deselectAllGuests, openFilterModal, allGroups, selectedGroupId } =
    useBroadcastStore();
  const [showLedger, setShowLedger] = useState(false);

  const isBuiltIn = allGroups.find((g) => g.id === selectedGroupId)?.type === 'built-in';
  const allSelected =
    facts.selectedCount === facts.messageableCount && facts.messageableCount > 0;
  const someSelected = facts.selectedCount > 0 && facts.selectedCount < facts.messageableCount;

  return (
    <FloatingPanel isOpen={isOpen} onClose={onClose} width={480}>
      {/* Level track: recipients ↔ ledger */}
      <div
        className="flex h-full transition-transform duration-[250ms] ease-in-out"
        style={{ transform: showLedger ? 'translateX(-100%)' : 'translateX(0)' }}
      >
        {/* ── LEVEL 1: recipients ────────────────────────────────────────── */}
        <div className="w-full h-full shrink-0 flex flex-col">
          <div
            className="shrink-0"
            style={{ paddingLeft: 24, paddingRight: 16, paddingTop: 16, paddingBottom: 12 }}
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <h2
                  className="font-['Roboto',sans-serif] font-medium text-[16px] leading-[24px]"
                  style={{ color: colors.colorBlack1 }}
                >
                  Recipients
                </h2>
                <p
                  className="font-['Roboto',sans-serif] text-[12px] leading-[18px]"
                  style={{ color: colors.colorBlack3 }}
                >
                  {facts.selectedCount} of {facts.messageableCount} selected
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close recipients"
                className="w-[30px] h-[30px] flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors cursor-pointer"
              >
                <Icon path={mdiClose} size={0.67} color={colors.colorBlack1} />
              </button>
            </div>

            {/* Controls lifted out of the list */}
            <div className="flex items-center gap-3" style={{ marginTop: 12 }}>
              <div className="flex items-center gap-2 shrink-0">
                <CanaryCheckbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={() => (allSelected ? deselectAllGuests() : selectAllGuests())}
                />
                <span
                  className="font-['Roboto',sans-serif] text-[14px] leading-[22px] font-medium whitespace-nowrap"
                  style={{ color: colors.colorBlack1 }}
                >
                  Select all
                </span>
              </div>
              <span className="flex-1" />
              {isBuiltIn && (
                <button
                  onClick={openFilterModal}
                  className="flex items-center gap-2 rounded-[6px] cursor-pointer transition-colors hover:bg-[#f9fafb] shrink-0"
                  style={{
                    height: 32,
                    paddingLeft: 10,
                    paddingRight: 10,
                    border: `1px solid ${colors.colorBlack5}`,
                  }}
                >
                  <Icon path={mdiFilterOutline} size={0.72} color={colors.colorBlack1} />
                  <span
                    className="font-['Roboto',sans-serif] text-[13px] leading-[20px] whitespace-nowrap"
                    style={{ color: colors.colorBlack1 }}
                  >
                    {facts.filterActive ? `Filters (${facts.filterCount})` : 'Filters'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* The baseline recipients experience, controls hidden */}
          <div className="flex-1 min-h-0" style={{ borderTop: `1px solid ${colors.colorBlack6}` }}>
            <BroadcastGuestList hideControls showBucketAddAll />
          </div>

          {/* Persistent ledger entry point */}
          <button
            onClick={() => setShowLedger(true)}
            className="shrink-0 flex items-center justify-between cursor-pointer hover:bg-[#f9fafb] transition-colors"
            style={{
              paddingLeft: 24,
              paddingRight: 16,
              paddingTop: 12,
              paddingBottom: 12,
              borderTop: `1px solid ${colors.colorBlack6}`,
            }}
          >
            <span
              className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[22px]"
              style={{ color: colors.colorBlueDark1 }}
            >
              Why these guests?
            </span>
            <Icon path={mdiChevronRight} size={0.72} color={colors.colorBlueDark1} />
          </button>
        </div>

        {/* ── LEVEL 2: the subtraction ledger ────────────────────────────── */}
        <div className="w-full h-full shrink-0 flex flex-col">
          <div
            className="shrink-0 flex items-center gap-2"
            style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16, paddingBottom: 12 }}
          >
            <button
              onClick={() => setShowLedger(false)}
              aria-label="Back to recipients"
              className="w-[30px] h-[30px] flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors cursor-pointer"
            >
              <Icon path={mdiChevronLeft} size={0.72} color={colors.colorBlack1} />
            </button>
            <h2
              className="font-['Roboto',sans-serif] font-medium text-[16px] leading-[24px]"
              style={{ color: colors.colorBlack1 }}
            >
              Why these guests?
            </h2>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-invisible" style={{ padding: 24, paddingTop: 0 }}>
            <div
              className="rounded-[8px]"
              style={{ border: `1px solid ${colors.colorBlack6}`, paddingLeft: 16, paddingRight: 16 }}
            >
              <LedgerLine
                tone="source"
                label={
                  facts.filterActive
                    ? `${facts.visibleTotal} match your filters in ${audienceName}`
                    : `${facts.sourceTotal} in ${audienceName}`
                }
                value={`${facts.visibleTotal}`}
              />
              {facts.alreadyCheckedIn > 0 && (
                <LedgerLine label="Already checked in" value={`− ${facts.alreadyCheckedIn}`} />
              )}
              {facts.alreadyCheckedOut > 0 && (
                <LedgerLine label="Already checked out" value={`− ${facts.alreadyCheckedOut}`} />
              )}
              {facts.optedOut > 0 && (
                <LedgerLine label="Opted out from messaging" value={`− ${facts.optedOut}`} />
              )}
              {facts.noPhone > 0 && (
                <LedgerLine label="No phone number" value={`− ${facts.noPhone}`} />
              )}
              {facts.removedByYou > 0 && (
                <LedgerLine label="Removed by you" value={`− ${facts.removedByYou}`} />
              )}
              <LedgerLine tone="total" label="Sending" value={`${facts.selectedCount}`} />
            </div>

            {facts.addedByYou > 0 && (
              <p
                className="font-['Roboto',sans-serif] text-[12px] leading-[18px]"
                style={{ color: colors.colorBlack3, marginTop: 12 }}
              >
                Includes {facts.addedByYou} guest{facts.addedByYou !== 1 ? 's' : ''} you added back
                who would normally be skipped.
              </p>
            )}
          </div>
        </div>
      </div>
    </FloatingPanel>
  );
}
