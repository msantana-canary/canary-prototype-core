/**
 * BroadcastGuestList Component
 *
 * Middle column of the broadcast view.
 * Shows guest list with checkboxes, date picker (for arrivals/departures),
 * "Select all" toggle, and segmented sections.
 * Hover on guest tile shows Contact Details popover.
 */

'use client';

import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CanaryCheckbox, CanaryInputDate, CanaryListItem } from '@canary-ui/components';
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
} from '@/lib/products/messaging/broadcast-store';
import { guests } from '@/lib/core/data/guests';
import { reservations } from '@/lib/core/data/reservations';
import { BroadcastGuestEntry, GuestSegment } from '@/lib/products/messaging/broadcast-types';
import { Guest } from '@/lib/core/types/guest';
import { Reservation } from '@/lib/core/types/reservation';

const segmentLabels: Record<GuestSegment, string> = {
  expecting: 'Expecting',
  'checked-in': 'Checked In',
  'checked-out': 'Checked Out',
  departing: 'Departing',
};

const segmentOrder: GuestSegment[] = ['expecting', 'checked-in', 'departing', 'checked-out'];

function GuestAvatar({ initials, size = 40 }: { initials: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 font-medium font-['Roboto',sans-serif]"
      style={{
        width: size,
        height: size,
        backgroundColor: '#e5e7eb',
        color: '#6b7280',
        fontSize: size * 0.3,
      }}
    >
      {initials}
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
          className="font-['Roboto',sans-serif] text-[16px] leading-[24px] font-bold"
          style={{ color: '#333333' }}
        >
          Contact Details
        </span>
        <Icon path={mdiDotsHorizontal} size={0.83} color="#666666" />
      </div>

      {/* Rows */}
      <div className="px-5 pb-4">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5">
            <Icon path={row.icon} size={0.83} color="#666666" className="shrink-0" />
            <span
              className="font-['Roboto',sans-serif] text-[14px] leading-[20px] flex-1 truncate"
              style={{ color: '#333333' }}
            >
              {row.text}
            </span>
            {row.action && (
              <Icon path={mdiOpenInNew} size={0.67} color="#666666" className="shrink-0" />
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
      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 cursor-pointer"
      style={{ opacity: hasPhone ? 1 : 0.4 }}
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

      {/* Avatar */}
      <GuestAvatar initials={guest.initials} />

      {/* Name + Room */}
      <div className="flex-1 min-w-0">
        <div
          className="font-['Roboto',sans-serif] text-[14px] leading-[20px] font-medium truncate"
          style={{ color: '#333333' }}
        >
          {guest.name}
        </div>
        {(roomDisplay || !hasPhone) && (
          <div
            className="font-['Roboto',sans-serif] text-[12px] leading-[16px] truncate"
            style={{ color: '#999999' }}
          >
            {roomDisplay}
            {!hasPhone && (
              <>
                {roomDisplay && ' \u00B7 '}
                No phone number
              </>
            )}
          </div>
        )}
      </div>

      {/* Contact Details Popover — rendered via portal to avoid overflow clipping */}
      {isHovered && createPortal(
        <div
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 w-[320px] animate-fade-in"
          style={{ top: popoverPos.top, left: popoverPos.left, pointerEvents: 'none' }}
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

  // Whether this group shows a date picker
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
    <div className="h-full flex flex-col border-r border-gray-200 broadcast-guest-list" style={{ backgroundColor: '#f0f0f0' }}>
      {/* Filter Row (top of column, only for built-in groups) */}
      {isBuiltIn && (
        <CanaryListItem
          icon={<Icon path={mdiFilterOutline} size={1} color="#2858c4" />}
          title={
            <span
              className="font-['Roboto',sans-serif] text-[14px] font-medium"
              style={{ color: '#2858c4' }}
            >
              {hasActiveFilters ? `${filterCount} Filter${filterCount !== 1 ? 's' : ''}` : 'Filters'}
            </span>
          }
          backgroundColor="#eaeef9"
          hoverColor="#dde4f5"
          isClickable
          onClick={openFilterModal}
          rightContent={
            hasActiveFilters ? (
              <button
                type="button"
                className="flex items-center justify-center w-[24px] h-[24px] rounded cursor-pointer hover:bg-[#cdd5eb] transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  clearAllFilters();
                }}
              >
                <Icon path={mdiClose} size={0.75} color="#2858c4" />
              </button>
            ) : undefined
          }
        />
      )}

      {/* Date Picker (for arrivals/departures) */}
      {showDatePicker && (
        <div className="px-4 pt-4 pb-2">
          <CanaryInputDate
            value={selectedDate}
            onChange={(date) => setSelectedDate(date)}
          />
        </div>
      )}

      {/* Select All */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <CanaryCheckbox
              checked={allSelected}
              indeterminate={someSelected}
              onChange={handleSelectAll}
            />
          </div>
          <span
            className="font-['Roboto',sans-serif] text-[14px] leading-[20px] font-medium flex-1"
            style={{ color: '#333333' }}
          >
            Select all
          </span>
        </div>
      </div>

      {/* Guest List */}
      <div className="flex-1 overflow-y-auto">
        {hasSegments && segmentedEntries ? (
          // Segmented view (Arrivals/Departures)
          segmentOrder
            .filter(seg => segmentedEntries[seg]?.length)
            .map(seg => (
              <div key={seg}>
                {/* Segment Header */}
                <div className="px-4 pt-4">
                  <span
                    className="font-['Roboto',sans-serif] text-[10px] leading-[14px] uppercase font-medium"
                    style={{ color: '#999999' }}
                  >
                    {segmentLabels[seg]}
                  </span>
                </div>
                {/* Segment Guests */}
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
          guestEntries.map(entry => (
            <GuestItem
              key={entry.guestId}
              entry={entry}
              isSelected={selectedGuestIds.includes(entry.guestId)}
              onToggle={() => toggleGuestSelection(entry.guestId)}
            />
          ))
        )}

        {guestEntries.length === 0 && (
          <div className="flex items-center justify-center h-32">
            <p
              className="font-['Roboto',sans-serif] text-[14px] text-center"
              style={{ color: '#999999' }}
            >
              No guests in this group
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
