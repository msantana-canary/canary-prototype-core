/**
 * BroadcastRoster — variant C's 400px recipient roster.
 *
 * The thesis: confidence comes from seeing the whole audience, including who is
 * NOT receiving and why. So the roster splits into SENDING TO and a collapsed
 * NOT SENDING, and — the deliberate divergence from production — the excluded
 * rows render at FULL opacity. Production dims them to 0.4, which makes the most
 * diagnostic information on the surface the hardest to read. Here exclusion is
 * carried by grouping and a lock glyph instead of by fading.
 *
 * Filter-excluded guests never appear in NOT SENDING: they are outside the
 * audience entirely, and the ledger's filter token already accounts for them.
 * NOT SENDING is only about people inside the audience who aren't receiving.
 */

'use client';

import React, { useMemo, useRef, useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiChevronRight,
  mdiChevronDown,
  mdiLockOutline,
  mdiFilterVariant,
} from '@mdi/js';
import { colors, CanaryCheckbox } from '@canary-ui/components';
import { Avatar } from '../Avatar';
import {
  useBroadcastStore,
  getGuestEntriesForGroup,
  getFilteredGuestEntries,
  isFilterEmpty,
  getActiveFilterCount,
  canMessageGuest,
  bucketForFolder,
} from '@/lib/products/messaging/broadcast-store';
import { isStatusExcluded } from '@/lib/products/messaging/broadcast-audience-facts';
import {
  BroadcastGuestEntry,
  BroadcastBucket,
} from '@/lib/products/messaging/broadcast-types';
import { guests } from '@/lib/core/data/guests';
import { reservations } from '@/lib/core/data/reservations';
import { LedgerReason } from './BroadcastLedgerHeader';

const BUCKET_LABEL: Record<BroadcastBucket, string> = {
  expecting: 'Expecting',
  in: 'Checked In',
  out: 'Checked Out',
};
const BUCKET_ORDER: BroadcastBucket[] = ['expecting', 'in', 'out'];

function lastNameOf(guestId: string): string {
  const name = guests[guestId]?.name ?? '';
  return (name.split(' ').pop() ?? name).toLowerCase();
}

function subtitleFor(entry: BroadcastGuestEntry): string {
  const reservation = reservations[entry.reservationId];
  const room = reservation
    ? `${reservation.room}${reservation.roomType ? ` ${reservation.roomType}` : ''}`
    : '';
  // Production's copy, verbatim — opted-out takes precedence over no-phone.
  if (entry.messagingOptedOut) return `${room} • Opted out from messaging`;
  if (!guests[entry.guestId]?.phone) return `${room} • No phone number`;
  return room;
}

/** 48px row. `locked` swaps the checkbox for a lock — unreachable, not unchecked. */
function RosterRow({
  entry,
  checked,
  locked,
  onToggle,
}: {
  entry: BroadcastGuestEntry;
  checked: boolean;
  locked?: boolean;
  onToggle?: () => void;
}) {
  const guest = guests[entry.guestId];
  if (!guest) return null;
  const subtitle = subtitleFor(entry);

  return (
    <div
      className={`flex items-center gap-3 transition-colors ${
        locked ? '' : 'hover:bg-[#f9fafb] cursor-pointer'
      }`}
      style={{ height: 48, paddingLeft: 12, paddingRight: 12 }}
      onClick={() => !locked && onToggle?.()}
    >
      <div className="shrink-0 w-5 flex items-center justify-center">
        {locked ? (
          <Icon path={mdiLockOutline} size={0.67} color={colors.colorBlack4} />
        ) : (
          <CanaryCheckbox checked={checked} onChange={() => onToggle?.()} />
        )}
      </div>
      <Avatar src={guest.avatar} initials={guest.initials} size="small" />
      <div className="flex-1 min-w-0">
        <div
          className="font-['Roboto',sans-serif] text-[14px] leading-[22px] font-medium truncate"
          style={{ color: colors.colorBlack1 }}
          title={guest.name}
        >
          {guest.name}
        </div>
        {subtitle && (
          <div
            className="font-['Roboto',sans-serif] text-[12px] leading-[18px] truncate"
            style={{ color: colors.colorBlack3 }}
            title={subtitle}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

export function BroadcastRoster({
  jumpTarget,
  onJumpHandled,
}: {
  jumpTarget: LedgerReason | null;
  onJumpHandled: () => void;
}) {
  const {
    allGroups,
    selectedGroupId,
    selectedGuestIds,
    activeFilters,
    toggleGuestSelection,
    addGuestsToSelection,
    deselectAllGuests,
    openFilterModal,
  } = useBroadcastStore();

  const [notSendingOpen, setNotSendingOpen] = useState(false);
  const notSendingRef = useRef<HTMLDivElement>(null);
  const scrollBoxRef = useRef<HTMLDivElement>(null);

  const group = allGroups.find((g) => g.id === selectedGroupId);
  const builtInType = group?.builtInType;
  const filterActive = !isFilterEmpty(activeFilters);

  const visible = useMemo(
    () =>
      filterActive
        ? getFilteredGuestEntries(selectedGroupId, allGroups, activeFilters)
        : getGuestEntriesForGroup(selectedGroupId, allGroups),
    [filterActive, selectedGroupId, allGroups, activeFilters]
  );

  const selected = useMemo(() => new Set(selectedGuestIds), [selectedGuestIds]);

  // Split the audience: receiving vs held back, and why.
  const { sending, unreachable, statusHeld, userRemoved } = useMemo(() => {
    const sendingList: BroadcastGuestEntry[] = [];
    const unreachableList: BroadcastGuestEntry[] = [];
    const statusList: BroadcastGuestEntry[] = [];
    const removedList: BroadcastGuestEntry[] = [];

    for (const entry of visible) {
      if (!canMessageGuest(entry)) {
        unreachableList.push(entry);
        continue;
      }
      if (selected.has(entry.guestId)) {
        sendingList.push(entry);
        continue;
      }
      if (isStatusExcluded(entry, builtInType)) statusList.push(entry);
      else removedList.push(entry);
    }

    const byName = (a: BroadcastGuestEntry, b: BroadcastGuestEntry) =>
      lastNameOf(a.guestId).localeCompare(lastNameOf(b.guestId));

    return {
      sending: sendingList.sort(byName),
      unreachable: unreachableList.sort(byName),
      statusHeld: statusList.sort(byName),
      userRemoved: removedList.sort(byName),
    };
  }, [visible, selected, builtInType]);

  // Ledger tokens jump here.
  React.useEffect(() => {
    if (!jumpTarget) return;
    setNotSendingOpen(true);
    requestAnimationFrame(() => {
      // Scroll the roster's own box — NOT scrollIntoView, which walks every
      // scrollable ancestor up to the document and can slide the whole app.
      const box = scrollBoxRef.current;
      const target = notSendingRef.current;
      if (box && target) {
        box.scrollTop += target.getBoundingClientRect().top - box.getBoundingClientRect().top;
      }
      onJumpHandled();
    });
  }, [jumpTarget, onJumpHandled]);

  const sendingBuckets = useMemo(() => {
    const grouped: Partial<Record<BroadcastBucket, BroadcastGuestEntry[]>> = {};
    for (const entry of sending) {
      const bucket = builtInType ? bucketForFolder(builtInType, entry.checkInStatus) : 'in';
      (grouped[bucket] ??= []).push(entry);
    }
    return grouped;
  }, [sending, builtInType]);

  const notSendingCount = unreachable.length + statusHeld.length + userRemoved.length;
  const allSending = sending.length > 0 && statusHeld.length === 0 && userRemoved.length === 0;

  /**
   * Variant-gated: checking the master box here also pulls status-rule-excluded
   * guests INTO sending (the ledger then reads "+ N you added"). Baseline and
   * variant B keep production's semantics, where Select-all never overrides the
   * folder's status rule.
   */
  const handleMasterToggle = () => {
    if (allSending) {
      deselectAllGuests();
      return;
    }
    addGuestsToSelection(
      visible.filter(canMessageGuest).map((e) => e.guestId)
    );
  };

  const summaryParts: string[] = [];
  if (unreachable.length) summaryParts.push(`${unreachable.length} unreachable`);
  if (statusHeld.length) {
    summaryParts.push(
      `${statusHeld.length} already checked ${
        statusHeld.filter((e) => e.checkInStatus === 'checked-out').length > statusHeld.length / 2
          ? 'out'
          : 'in'
      }`
    );
  }
  if (userRemoved.length) summaryParts.push(`${userRemoved.length} you unchecked`);

  return (
    <div className="h-full flex flex-col min-h-0 broadcast-guest-list">
      {/* Control row */}
      <div
        className="shrink-0 flex items-center gap-2"
        style={{ padding: 12, borderBottom: `1px solid ${colors.colorBlack6}` }}
      >
        <button
          onClick={openFilterModal}
          className="flex items-center gap-2 rounded-[6px] cursor-pointer transition-colors hover:bg-[#f9fafb]"
          style={{
            height: 32,
            paddingLeft: 10,
            paddingRight: 10,
            border: `1px solid ${colors.colorBlack5}`,
          }}
        >
          <Icon path={mdiFilterVariant} size={0.72} color={colors.colorBlack1} />
          <span
            className="font-['Roboto',sans-serif] text-[13px] leading-[20px] whitespace-nowrap"
            style={{ color: colors.colorBlack1 }}
          >
            Filters
            {filterActive ? ` (${getActiveFilterCount(activeFilters)})` : ''}
          </span>
          <Icon path={mdiChevronDown} size={0.6} color={colors.colorBlack3} />
        </button>
      </div>

      <div ref={scrollBoxRef} className="flex-1 min-h-0 overflow-y-auto scrollbar-invisible">
        {/* ── SENDING TO ─────────────────────────────────────────────────── */}
        <div
          className="sticky top-0 z-10 flex items-center gap-2"
          style={{
            height: 32,
            paddingLeft: 12,
            paddingRight: 12,
            backgroundColor: colors.colorWhite,
            borderBottom: `1px solid ${colors.colorBlack6}`,
          }}
        >
          <div className="shrink-0 w-5 flex items-center justify-center">
            <CanaryCheckbox
              checked={allSending}
              indeterminate={sending.length > 0 && !allSending}
              onChange={handleMasterToggle}
            />
          </div>
          <span
            className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase font-medium"
            style={{ color: colors.colorBlack3, letterSpacing: '0.4px' }}
          >
            Sending to · {sending.length}
          </span>
        </div>

        {sending.length === 0 ? (
          <div className="flex items-center justify-center" style={{ padding: 24 }}>
            <p
              className="font-['Roboto',sans-serif] text-[13px] leading-[20px] text-center"
              style={{ color: colors.colorBlack4 }}
            >
              No one selected — this can&apos;t send.
            </p>
          </div>
        ) : (
          BUCKET_ORDER.filter((b) => sendingBuckets[b]?.length).map((bucket) => {
            const rows = sendingBuckets[bucket]!;
            const bucketIds = rows.map((e) => e.guestId);
            const allInBucket = bucketIds.every((id) => selected.has(id));
            return (
              <div key={bucket}>
                {builtInType !== 'in-house' && (
                  <div
                    className="flex items-center gap-2"
                    style={{ height: 28, paddingLeft: 12, paddingRight: 12 }}
                  >
                    <div className="shrink-0 w-5 flex items-center justify-center">
                      <CanaryCheckbox
                        checked={allInBucket}
                        onChange={() =>
                          allInBucket
                            ? bucketIds.forEach((id) => toggleGuestSelection(id))
                            : addGuestsToSelection(bucketIds)
                        }
                      />
                    </div>
                    <span
                      className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase font-medium"
                      style={{ color: colors.colorBlack4, letterSpacing: '0.4px' }}
                    >
                      {BUCKET_LABEL[bucket]} · {rows.length}
                    </span>
                  </div>
                )}
                {rows.map((entry) => (
                  <RosterRow
                    key={entry.guestId}
                    entry={entry}
                    checked
                    onToggle={() => toggleGuestSelection(entry.guestId)}
                  />
                ))}
              </div>
            );
          })
        )}

        {/* ── NOT SENDING ────────────────────────────────────────────────── */}
        {notSendingCount > 0 && (
          <div ref={notSendingRef} style={{ marginTop: 8 }}>
            <button
              onClick={() => setNotSendingOpen((v) => !v)}
              className="w-full flex items-center gap-2 cursor-pointer transition-colors hover:bg-[#f9fafb]"
              style={{
                height: 36,
                paddingLeft: 12,
                paddingRight: 12,
                borderTop: `1px solid ${colors.colorBlack6}`,
                borderBottom: `1px solid ${colors.colorBlack6}`,
              }}
            >
              <Icon
                path={notSendingOpen ? mdiChevronDown : mdiChevronRight}
                size={0.67}
                color={colors.colorBlack3}
              />
              <span
                className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase font-medium"
                style={{ color: colors.colorBlack3, letterSpacing: '0.4px' }}
              >
                Not sending · {notSendingCount}
              </span>
              <span className="flex-1" />
              <span
                className="font-['Roboto',sans-serif] text-[12px] leading-[18px] truncate"
                style={{ color: colors.colorBlack4 }}
              >
                {summaryParts.join(' · ')}
              </span>
            </button>

            {notSendingOpen && (
              <>
                <ReasonGroup
                  title="Opted out of messaging"
                  entries={unreachable.filter((e) => e.messagingOptedOut)}
                  locked
                />
                <ReasonGroup
                  title="No phone number"
                  entries={unreachable.filter((e) => !e.messagingOptedOut)}
                  locked
                />
                <ReasonGroup
                  title={
                    statusHeld.filter((e) => e.checkInStatus === 'checked-out').length >
                    statusHeld.length / 2
                      ? 'Already checked out'
                      : 'Already checked in'
                  }
                  entries={statusHeld}
                  onIncludeAll={() =>
                    addGuestsToSelection(statusHeld.map((e) => e.guestId))
                  }
                  onToggle={toggleGuestSelection}
                />
                <ReasonGroup
                  title="You unchecked"
                  entries={userRemoved}
                  onIncludeAll={() =>
                    addGuestsToSelection(userRemoved.map((e) => e.guestId))
                  }
                  onToggle={toggleGuestSelection}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ReasonGroup({
  title,
  entries,
  locked,
  onIncludeAll,
  onToggle,
}: {
  title: string;
  entries: BroadcastGuestEntry[];
  locked?: boolean;
  onIncludeAll?: () => void;
  onToggle?: (guestId: string) => void;
}) {
  if (entries.length === 0) return null;
  return (
    <div>
      <div
        className="flex items-center gap-2"
        style={{ height: 28, paddingLeft: 12, paddingRight: 12 }}
      >
        {locked && <Icon path={mdiLockOutline} size={0.5} color={colors.colorBlack4} />}
        <span
          className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase font-medium"
          style={{ color: colors.colorBlack4, letterSpacing: '0.4px' }}
        >
          {title} · {entries.length}
        </span>
        <span className="flex-1" />
        {onIncludeAll && (
          <button
            type="button"
            onClick={onIncludeAll}
            className="font-['Roboto',sans-serif] font-medium text-[12px] leading-[18px] cursor-pointer hover:underline"
            style={{ color: colors.colorBlueDark1 }}
          >
            Include all
          </button>
        )}
      </div>
      {entries.map((entry) => (
        <RosterRow
          key={entry.guestId}
          entry={entry}
          checked={false}
          locked={locked}
          onToggle={onToggle ? () => onToggle(entry.guestId) : undefined}
        />
      ))}
    </div>
  );
}
