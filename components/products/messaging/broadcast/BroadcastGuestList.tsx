/**
 * BroadcastGuestList — REDESIGN (broadcast step 1 baseline)
 *
 * The recipients zone: the lower half of the combined Audience card. Filters row
 * (built-ins only) + date picker (Arrivals/Departures, knowingly decorative) +
 * Select all + the guest list with EXPECTING / CHECKED IN section labels and the
 * hover Contact Details popover — all preserved from the old middle column, re-
 * dressed in the card-on-canvas register (32px rounded-8 avatars, rounded-6
 * interactive elements, colorBlack* type ramp).
 *
 * Rows are bare — checkbox, avatar, name, room — matching production, which
 * shows no channel tag here.
 *
 * UNMESSAGEABLE guests (production's `canMessageGuest`: no phone OR opted out of
 * messaging) render at 0.4 opacity with a disabled checkbox and production's own
 * subtitle copy — "{room} • Opted out from messaging" / "{room} • No phone
 * number" — and sort to the bottom of their section.
 *
 * Sections mirror production's per-folder bucketing: In-house is one unlabelled
 * list; Arrivals and Departures bucket by stay status under "Expecting" /
 * "Checked In" / "Checked Out".
 */

'use client';

import React, { useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { CanaryCheckbox, colors } from '@canary-ui/components';
import Icon from '@mdi/react';
import {
  mdiAccountOutline,
  mdiPhoneOutline,
  mdiEmailOutline,
  mdiCalendarOutline,
  mdiBedOutline,
  mdiPound,
  mdiLoginVariant,
  mdiLogoutVariant,
  mdiOpenInNew,
  mdiDotsHorizontal,
  mdiFilterOutline,
  mdiClose,
} from '@mdi/js';
import {
  useBroadcastStore,
  getGuestEntriesForGroup,
  getFilteredGuestEntries,
  isFilterEmpty,
  getActiveFilterCount,
  canMessageGuest,
  bucketForFolder,
} from '@/lib/products/messaging/broadcast-store';
import { guests } from '@/lib/core/data/guests';
import { reservations } from '@/lib/core/data/reservations';
import {
  BroadcastGuestEntry,
  BroadcastBucket,
} from '@/lib/products/messaging/broadcast-types';
import { Guest } from '@/lib/core/types/guest';
import { Reservation } from '@/lib/core/types/reservation';
import { Avatar } from '../Avatar';

/** Production's section titles, verbatim (broadcastV2BuiltInGroupGuestList.sectionTitle.*). */
const bucketLabels: Record<BroadcastBucket, string> = {
  expecting: 'Expecting',
  in: 'Checked In',
  out: 'Checked Out',
};

/** Production's header order in `flattenedList`: expecting, then in, then out. */
const bucketOrder: BroadcastBucket[] = ['expecting', 'in', 'out'];

/** Last name, for production's alphabetical sort within each messageable group. */
function lastNameOf(guestId: string): string {
  const name = guests[guestId]?.name ?? '';
  return (name.split(' ').pop() ?? name).toLowerCase();
}

/**
 * Production's `sortedGuests`: unmessageable guests sink to the bottom,
 * alphabetical by last name within each side.
 */
function sortEntries(entries: BroadcastGuestEntry[]): BroadcastGuestEntry[] {
  return [...entries].sort((a, b) => {
    const aOk = canMessageGuest(a);
    const bOk = canMessageGuest(b);
    if (!aOk && !bOk) return lastNameOf(a.guestId).localeCompare(lastNameOf(b.guestId));
    if (!aOk) return 1;
    if (!bOk) return -1;
    return lastNameOf(a.guestId).localeCompare(lastNameOf(b.guestId));
  });
}

/**
 * ONE inset for the whole recipients column. Every box in here — the Filters
 * row, the date control, Select-all, the segment labels and the guest rows —
 * starts at this left edge and ends at the mirrored right edge, so the column
 * reads as a single column instead of four slightly different indents.
 * Guest rows therefore carry NO horizontal padding of their own: their hover
 * background is exactly the Filters row's box.
 */
const COLUMN_INSET = 12;

/**
 * Compact date control (Arrivals / Departures). Knowingly decorative — nothing
 * filters on it — but it stays a real date input so picking a date still works.
 * A slim 32px row (calendar icon + formatted date) with a transparent native
 * input laid over it, replacing the full-height bordered CanaryInputDate box
 * that dominated the column.
 */
function CompactDateControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (date: string) => void;
}) {
  // `value` is YYYY-MM-DD; parse as local time so the label can't slip a day.
  const parsed = value ? new Date(`${value}T00:00:00`) : null;
  const label = parsed && !Number.isNaN(parsed.getTime())
    ? format(parsed, 'MMM d, yyyy')
    : 'Select date';

  return (
    <div
      className="relative flex items-center gap-2 rounded-[6px] transition-colors hover:bg-[#f9fafb]"
      style={{
        height: 32,
        paddingLeft: 12,
        paddingRight: 12,
        border: `1px solid ${colors.colorBlack6}`,
      }}
    >
      <Icon path={mdiCalendarOutline} size={0.67} color={colors.colorBlack3} className="shrink-0" />
      <span
        className="font-['Roboto',sans-serif] text-[12px] leading-[18px] truncate"
        style={{ color: colors.colorBlack1 }}
      >
        {label}
      </span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Broadcast date"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  );
}

function ContactDetailsPopover({ guest, reservation }: { guest: Guest; reservation?: Reservation }) {
  const roomDisplay = reservation
    ? `${reservation.room}${reservation.roomType ? ` ${reservation.roomType}` : ''}`
    : '';

  const dateDisplay = reservation
    ? `${reservation.checkInDate} - ${reservation.checkOutDate}`.replace(/\./g, '')
    : '';

  const rows = [
    { icon: mdiAccountOutline, text: guest.name },
    { icon: mdiPhoneOutline, text: guest.phone || '—' },
    { icon: mdiEmailOutline, text: guest.email || '—' },
    ...(reservation ? [
      { icon: mdiCalendarOutline, text: dateDisplay },
      { icon: mdiBedOutline, text: roomDisplay || '—' },
      { icon: mdiPound, text: reservation.confirmationCode },
      { icon: mdiLoginVariant, text: reservation.checkInStatus || 'Not Started', action: true },
      { icon: mdiLogoutVariant, text: reservation.checkOutStatus || 'Not Started', action: true },
    ] : []),
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <span
          className="font-['Roboto',sans-serif] text-[16px] leading-[24px] font-medium"
          style={{ color: colors.colorBlack1 }}
        >
          Contact Details
        </span>
        <Icon path={mdiDotsHorizontal} size={0.83} color={colors.colorBlack3} />
      </div>

      {/* Rows */}
      <div className="px-5 pb-4">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5">
            <Icon path={row.icon} size={0.83} color={colors.colorBlack3} className="shrink-0" />
            <span
              className="font-['Roboto',sans-serif] text-[14px] leading-[22px] flex-1 truncate"
              style={{ color: colors.colorBlack1 }}
            >
              {row.text}
            </span>
            {row.action && (
              <Icon path={mdiOpenInNew} size={0.67} color={colors.colorBlack3} className="shrink-0" />
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function GuestItem({
  entry,
  isSelected,
  onToggle,
}: {
  entry: BroadcastGuestEntry;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const rowRef = useRef<HTMLDivElement>(null);
  const guest = guests[entry.guestId];
  const reservation = reservations[entry.reservationId];
  const isMessageable = canMessageGuest(entry);

  if (!guest) return null;

  const room = reservation
    ? `${reservation.room}${reservation.roomType ? ` ${reservation.roomType}` : ''}`
    : '';

  /**
   * Production's `guestRoomMethod`, verbatim — opted-out takes precedence over
   * no-phone, and both render as "{room} • reason".
   */
  const subtitle = entry.messagingOptedOut
    ? `${room} • Opted out from messaging`
    : !guest.phone
    ? `${room} • No phone number`
    : room;

  const handleMouseEnter = () => {
    if (rowRef.current) {
      const rect = rowRef.current.getBoundingClientRect();
      const popoverHeight = 380;
      const rowCenterY = rect.top + rect.height / 2;
      let top = rowCenterY - popoverHeight / 2;
      // Clamp within viewport
      top = Math.max(8, Math.min(top, window.innerHeight - popoverHeight - 8));
      setPopoverPos({ top, left: rect.right + 8 });
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      ref={rowRef}
      className="flex items-center gap-3 rounded-[6px] transition-colors hover:bg-[#f9fafb] cursor-pointer"
      style={{
        // Unmessageable = no phone OR opted out; production dims both the same.
        opacity: isMessageable ? 1 : 0.4,
        // No horizontal padding — the column's single inset is on the scroll
        // container, so the checkbox sits flush with the Filters row's edge.
        paddingTop: 8,
        paddingBottom: 8,
      }}
      onClick={() => isMessageable && onToggle()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Checkbox */}
      <div className="shrink-0">
        <CanaryCheckbox
          checked={isSelected}
          onChange={onToggle}
          isDisabled={!isMessageable}
        />
      </div>

      {/* Avatar — 32px rounded-8 square (redesign register) */}
      <Avatar src={guest.avatar} initials={guest.initials} size="small" />

      {/* Name + room/type. The column is narrow — the name truncates rather
          than wrapping; the full name is on the hover popover. */}
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

      {/* Contact Details Popover — rendered via portal to avoid overflow clipping */}
      {isHovered && createPortal(
        <div
          className="fixed z-50 bg-white rounded-[12px] shadow-lg w-[320px] animate-fade-in"
          style={{
            top: popoverPos.top,
            left: popoverPos.left,
            pointerEvents: 'none',
            border: `1px solid ${colors.colorBlack6}`,
          }}
        >
          <ContactDetailsPopover guest={guest} reservation={reservation} />
        </div>,
        document.body
      )}
    </div>
  );
}

export function BroadcastGuestList() {
  const {
    allGroups,
    selectedGroupId,
    selectedDate,
    selectedGuestIds,
    activeFilters,
    setSelectedDate,
    toggleGuestSelection,
    selectAllGuests,
    deselectAllGuests,
    openFilterModal,
    clearAllFilters,
  } = useBroadcastStore();

  const currentGroup = allGroups.find(g => g.id === selectedGroupId);
  const isBuiltIn = currentGroup?.type === 'built-in';
  const hasActiveFilters = isBuiltIn && !isFilterEmpty(activeFilters);
  const filterCount = getActiveFilterCount(activeFilters);

  const guestEntries = useMemo(
    () =>
      hasActiveFilters
        ? getFilteredGuestEntries(selectedGroupId, allGroups, activeFilters)
        : getGuestEntriesForGroup(selectedGroupId, allGroups),
    [selectedGroupId, allGroups, activeFilters, hasActiveFilters]
  );

  // Whether this group shows a date picker (decorative — not wired)
  const showDatePicker = currentGroup?.builtInType === 'arrivals' || currentGroup?.builtInType === 'departures';

  /**
   * Production sorts before bucketing (`sortedGuests` → `guestsByBucket`):
   * unmessageable guests sink to the bottom of whichever section they land in.
   */
  const sortedEntries = useMemo(() => sortEntries(guestEntries), [guestEntries]);

  /**
   * Section buckets. In-house is a single unlabelled list in production; the
   * other two folders bucket by stay status and get headers.
   */
  const builtInType = currentGroup?.builtInType;
  const bucketed = useMemo(() => {
    if (!builtInType || builtInType === 'in-house') return null;

    const grouped: Partial<Record<BroadcastBucket, BroadcastGuestEntry[]>> = {};
    for (const entry of sortedEntries) {
      const bucket = bucketForFolder(builtInType, entry.checkInStatus);
      if (!grouped[bucket]) grouped[bucket] = [];
      grouped[bucket]!.push(entry);
    }
    return grouped;
  }, [sortedEntries, builtInType]);

  // Selectable = messageable (has phone AND not opted out)
  const selectableCount = guestEntries.filter(canMessageGuest).length;
  const selectedCount = selectedGuestIds.length;
  const allSelected = selectedCount === selectableCount && selectableCount > 0;
  const someSelected = selectedCount > 0 && selectedCount < selectableCount;

  const handleSelectAll = () => {
    if (allSelected) {
      deselectAllGuests();
    } else {
      selectAllGuests();
    }
  };

  if (!currentGroup) return null;

  return (
    <div className="h-full flex flex-col min-h-0 broadcast-guest-list">
      {/* Filters row (built-in groups only) */}
      {isBuiltIn && (
        <div
          className="shrink-0"
          style={{ paddingLeft: COLUMN_INSET, paddingRight: COLUMN_INSET, paddingTop: 12 }}
        >
          <div
            onClick={openFilterModal}
            className="flex items-center gap-2 rounded-[6px] cursor-pointer transition-opacity hover:opacity-80"
            style={{
              backgroundColor: colors.colorBlueDark5,
              paddingLeft: 12,
              paddingRight: 8,
              paddingTop: 8,
              paddingBottom: 8,
            }}
          >
            <Icon path={mdiFilterOutline} size={0.83} color={colors.colorBlueDark1} />
            <span
              className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[22px] flex-1 min-w-0"
              style={{ color: colors.colorBlueDark1 }}
            >
              {hasActiveFilters ? `${filterCount} Filter${filterCount !== 1 ? 's' : ''}` : 'Filters'}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                aria-label="Clear filters"
                className="flex items-center justify-center rounded-[4px] cursor-pointer transition-colors hover:bg-[#cdd5eb]"
                style={{ width: 24, height: 24 }}
                onClick={(e) => {
                  e.stopPropagation();
                  clearAllFilters();
                }}
              >
                <Icon path={mdiClose} size={0.67} color={colors.colorBlueDark1} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Date picker (Arrivals / Departures) — knowingly decorative */}
      {showDatePicker && (
        <div
          className="shrink-0"
          style={{ paddingLeft: COLUMN_INSET, paddingRight: COLUMN_INSET, paddingTop: 8 }}
        >
          <CompactDateControl value={selectedDate} onChange={setSelectedDate} />
        </div>
      )}

      {/* Select all */}
      <div
        className="shrink-0"
        style={{
          paddingLeft: COLUMN_INSET,
          paddingRight: COLUMN_INSET,
          paddingTop: 12,
          paddingBottom: 12,
          borderBottom: `1px solid ${colors.colorBlack6}`,
        }}
      >
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <CanaryCheckbox
              checked={allSelected}
              indeterminate={someSelected}
              onChange={handleSelectAll}
            />
          </div>
          <span
            className="font-['Roboto',sans-serif] text-[14px] leading-[22px] font-medium flex-1"
            style={{ color: colors.colorBlack1 }}
          >
            Select all
          </span>
        </div>
      </div>

      {/* Guest list */}
      <div
        className="flex-1 min-h-0 overflow-y-auto scrollbar-invisible"
        style={{ paddingLeft: COLUMN_INSET, paddingRight: COLUMN_INSET, paddingBottom: 16 }}
      >
        {bucketed ? (
          // Bucketed view (Arrivals / Departures) — production's header order
          bucketOrder
            .filter(bucket => bucketed[bucket]?.length)
            .map(bucket => (
              <div key={bucket}>
                {/* Section header */}
                <div style={{ paddingTop: 16, paddingBottom: 4 }}>
                  <span
                    className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase font-medium"
                    style={{ color: colors.colorBlack4, letterSpacing: '0.4px' }}
                  >
                    {bucketLabels[bucket]}
                  </span>
                </div>
                {/* Section guests */}
                {bucketed[bucket]!.map(entry => (
                  <GuestItem
                    key={entry.guestId}
                    entry={entry}
                    isSelected={selectedGuestIds.includes(entry.guestId)}
                    onToggle={() => toggleGuestSelection(entry.guestId)}
                  />
                ))}
              </div>
            ))
        ) : (
          // Single unlabelled list (In-house, custom groups) — production
          // renders no section headers for these.
          <div style={{ paddingTop: 8 }}>
            {sortedEntries.map(entry => (
              <GuestItem
                key={entry.guestId}
                entry={entry}
                isSelected={selectedGuestIds.includes(entry.guestId)}
                onToggle={() => toggleGuestSelection(entry.guestId)}
              />
            ))}
          </div>
        )}

        {guestEntries.length === 0 && (
          <div className="flex items-center justify-center h-32">
            <p
              className="font-['Roboto',sans-serif] text-[14px] text-center"
              style={{ color: colors.colorBlack4 }}
            >
              No guests in this group
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
