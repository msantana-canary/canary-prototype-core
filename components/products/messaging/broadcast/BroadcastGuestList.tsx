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
 * NEW (parity): each row carries a small preferred-channel indicator
 * (SMS / WhatsApp / Email). Guests with no phone on file keep the existing
 * treatment — 0.4 opacity, disabled checkbox, "No phone number".
 */

'use client';

import React, { useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CanaryCheckbox, CanaryInputDate, colors } from '@canary-ui/components';
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
  mdiMessageTextOutline,
  mdiWhatsapp,
} from '@mdi/js';
import {
  useBroadcastStore,
  getGuestEntriesForGroup,
  getFilteredGuestEntries,
  isFilterEmpty,
  getActiveFilterCount,
} from '@/lib/products/messaging/broadcast-store';
import { guests } from '@/lib/core/data/guests';
import { reservations } from '@/lib/core/data/reservations';
import {
  BroadcastGuestEntry,
  GuestSegment,
  PreferredChannel,
} from '@/lib/products/messaging/broadcast-types';
import { Guest } from '@/lib/core/types/guest';
import { Reservation } from '@/lib/core/types/reservation';
import { Avatar } from '../Avatar';

const segmentLabels: Record<GuestSegment, string> = {
  expecting: 'Expecting',
  'checked-in': 'Checked In',
  'checked-out': 'Checked Out',
  departing: 'Departing',
};

const segmentOrder: GuestSegment[] = ['expecting', 'checked-in', 'departing', 'checked-out'];

/** Preferred-channel indicator meta — the channel the broadcast actually goes out on. */
const CHANNEL_META: Record<PreferredChannel, { icon: string; label: string }> = {
  sms: { icon: mdiMessageTextOutline, label: 'SMS' },
  whatsapp: { icon: mdiWhatsapp, label: 'WhatsApp' },
  email: { icon: mdiEmailOutline, label: 'Email' },
};

function ChannelIndicator({ channel }: { channel: PreferredChannel }) {
  const meta = CHANNEL_META[channel];
  return (
    <div className="flex items-center gap-1 shrink-0" title={`Preferred channel: ${meta.label}`}>
      <Icon path={meta.icon} size={0.58} color={colors.colorBlack3} />
      <span
        className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase whitespace-nowrap"
        style={{ color: colors.colorBlack3 }}
      >
        {meta.label}
      </span>
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
  const hasPhone = !!guest?.phone;

  if (!guest) return null;

  const roomDisplay = reservation
    ? `${reservation.room}${reservation.roomType ? ` ${reservation.roomType}` : ''}`
    : '';

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
      className="flex items-center gap-2 rounded-[6px] transition-colors hover:bg-[#f9fafb] cursor-pointer"
      style={{
        opacity: hasPhone ? 1 : 0.4,
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 8,
        paddingBottom: 8,
      }}
      onClick={() => hasPhone && onToggle()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Checkbox */}
      <div className="shrink-0">
        <CanaryCheckbox
          checked={isSelected}
          onChange={onToggle}
          isDisabled={!hasPhone}
        />
      </div>

      {/* Avatar — 32px rounded-8 square (redesign register) */}
      <Avatar src={guest.avatar} initials={guest.initials} size="small" />

      {/* Name + room/type. The column is narrow (212px) — the name truncates
          rather than wrapping; the full name is on the hover popover. */}
      <div className="flex-1 min-w-0">
        <div
          className="font-['Roboto',sans-serif] text-[14px] leading-[22px] font-medium truncate"
          style={{ color: colors.colorBlack1 }}
          title={guest.name}
        >
          {guest.name}
        </div>
        {(roomDisplay || !hasPhone) && (
          <div
            className="font-['Roboto',sans-serif] text-[12px] leading-[18px] truncate"
            style={{ color: colors.colorBlack3 }}
          >
            {roomDisplay}
            {!hasPhone && (
              <>
                {roomDisplay && ' · '}
                No phone number
              </>
            )}
          </div>
        )}
      </div>

      {/* Preferred channel — what this guest would actually receive on */}
      {hasPhone && entry.preferredChannel && (
        <ChannelIndicator channel={entry.preferredChannel} />
      )}

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

  // Whether this group has segments
  const hasSegments = guestEntries.some(e => e.segment);

  // Group entries by segment
  const segmentedEntries = useMemo(() => {
    if (!hasSegments) return null;

    const grouped: Partial<Record<GuestSegment, BroadcastGuestEntry[]>> = {};
    for (const entry of guestEntries) {
      const seg = entry.segment || 'expecting';
      if (!grouped[seg]) grouped[seg] = [];
      grouped[seg]!.push(entry);
    }
    return grouped;
  }, [guestEntries, hasSegments]);

  // Selectable count (guests with phone)
  const selectableCount = guestEntries.filter(e => guests[e.guestId]?.phone).length;
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
        <div className="shrink-0" style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 8 }}>
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
        <div className="shrink-0" style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 8 }}>
          <CanaryInputDate
            value={selectedDate}
            onChange={(date) => setSelectedDate(date)}
          />
        </div>
      )}

      {/* Select all */}
      <div
        className="shrink-0"
        style={{
          paddingLeft: 16,
          paddingRight: 16,
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
        style={{ paddingLeft: 8, paddingRight: 8, paddingBottom: 16 }}
      >
        {hasSegments && segmentedEntries ? (
          // Segmented view (Arrivals / Departures)
          segmentOrder
            .filter(seg => segmentedEntries[seg]?.length)
            .map(seg => (
              <div key={seg}>
                {/* Segment header */}
                <div style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 16, paddingBottom: 4 }}>
                  <span
                    className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase font-medium"
                    style={{ color: colors.colorBlack4, letterSpacing: '0.4px' }}
                  >
                    {segmentLabels[seg]}
                  </span>
                </div>
                {/* Segment guests */}
                {segmentedEntries[seg]!.map(entry => (
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
          // Flat list (In-house, custom groups)
          <div style={{ paddingTop: 8 }}>
            {guestEntries.map(entry => (
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
