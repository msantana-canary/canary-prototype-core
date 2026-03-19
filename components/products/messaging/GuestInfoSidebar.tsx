/**
 * GuestInfoSidebar Component
 *
 * Right sidebar displaying conversation details: contact number,
 * linked reservations (collapsible table), service tasks, and call history.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LinkedReservation } from '@/lib/products/messaging/types';
import { CanaryTag, TagVariant, TagColor, TagSize } from '@canary-ui/components';
import { colors } from '@canary-ui/components';
import Icon from '@mdi/react';
import {
  mdiPhoneOutline,
  mdiEmailOutline,
  mdiCalendarBlank,
  mdiBedOutline,
  mdiPound,
  mdiLogin,
  mdiLogout,
  mdiClose,
  mdiRefresh,
  mdiPlus,
  mdiOpenInNew,
  mdiChevronDown,
  mdiChevronUp,
  mdiDotsHorizontal,
  mdiAccountMultipleOutline,
} from '@mdi/js';

/** Format date range: strip year from check-in date, keep on check-out. "Jul. 15 – Jul. 18, 2026" */
function formatDateRange(checkIn: string, checkOut: string): string {
  const stripped = checkIn.replace(/,?\s*\d{4}$/, '');
  return `${stripped} - ${checkOut}`;
}

interface GuestInfoSidebarProps {
  contactNumber: string;
  linkedReservations: LinkedReservation[];
  isOpen: boolean;
  onClose: () => void;
  onOpenLinkModal?: () => void;
  onUnlinkReservation?: (reservationId: string) => void;
  /** When true, renders as an inline panel instead of a fixed overlay */
  inline?: boolean;
}

export function GuestInfoSidebar({ contactNumber, linkedReservations, isOpen, onClose, onOpenLinkModal, onUnlinkReservation, inline = false }: GuestInfoSidebarProps) {
  const [expandedResId, setExpandedResId] = useState<string | null>(null);

  const toggleExpand = (resId: string) => {
    setExpandedResId((prev) => (prev === resId ? null : resId));
  };

  // Inline mode: renders as a normal flow element (for 3-panel layout)
  if (inline) {
    return (
      <div
        className="h-full overflow-y-auto"
        style={{ backgroundColor: colors.colorBlack8 }}
      >
        <div className="p-6">
          {/* Header — no close button in inline mode */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-['Roboto',sans-serif] font-medium text-[18px] leading-[27px]" style={{ color: colors.colorBlack1 }}>
              Conversation Details
            </h2>
          </div>

          {/* Contact Number Card */}
          <div
            className="rounded-lg p-4 mb-6"
            style={{ backgroundColor: colors.colorBlueDark5 }}
          >
            <p className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[21px]" style={{ color: colors.colorBlack1 }}>
              Contact Number
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Icon path={mdiPhoneOutline} size={0.67} color={colors.colorBlack1} />
              <span className="font-['Roboto',sans-serif] text-[14px] leading-[21px]" style={{ color: colors.colorBlack1 }}>
                {contactNumber}
              </span>
            </div>
          </div>

          {/* Assignment Card */}
          <div
            className="rounded-lg p-4 mb-6"
            style={{ backgroundColor: colors.colorBlueDark5 }}
          >
            <p className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[21px]" style={{ color: colors.colorBlack1 }}>
              Assignment
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Icon path={mdiAccountMultipleOutline} size={0.67} color={colors.colorBlack1} />
              <span
                className="font-['Roboto',sans-serif] text-[14px] leading-[21px] cursor-pointer"
                style={{ color: colors.colorBlueDark1 }}
              >
                Assign Staff or Department
              </span>
            </div>
          </div>

          {/* Linked Reservations Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-['Roboto',sans-serif] font-medium text-[16px] leading-[24px]" style={{ color: colors.colorBlack1 }}>
                Linked Reservations
              </h3>
              <div className="flex gap-1">
                <button className="w-[30px] h-[30px] flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors">
                  <Icon path={mdiRefresh} size={0.67} color={colors.colorBlack1} />
                </button>
                <button
                  className="w-[30px] h-[30px] flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors"
                  onClick={onOpenLinkModal}
                >
                  <Icon path={mdiPlus} size={0.67} color={colors.colorBlack1} />
                </button>
              </div>
            </div>

            {linkedReservations.length === 0 ? (
              <p className="font-['Roboto',sans-serif] text-[14px] leading-[21px] text-center py-2" style={{ color: colors.colorBlack3 }}>
                No linked reservations
              </p>
            ) : (
              <>
                <div
                  className="rounded-lg border divide-y divide-[#E5E5E5]"
                  style={{
                    backgroundColor: colors.colorWhite,
                    borderColor: colors.colorBlack6,
                  }}
                >
                  {linkedReservations.map((lr) => (
                    <ReservationRow
                      key={lr.reservation.id}
                      linkedReservation={lr}
                      isExpanded={expandedResId === lr.reservation.id}
                      onToggle={() => toggleExpand(lr.reservation.id)}
                      onUnlink={onUnlinkReservation}
                    />
                  ))}
                </div>

                {linkedReservations.length > 4 && (
                  <button
                    className="font-['Roboto',sans-serif] text-[14px] leading-[21px] mt-3 hover:underline"
                    style={{ color: colors.colorBlueDark1 }}
                  >
                    View more reservations
                  </button>
                )}
              </>
            )}
          </div>

          {/* Service Tasks Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-['Roboto',sans-serif] font-medium text-[16px] leading-[24px]" style={{ color: colors.colorBlack1 }}>
                Service Tasks
              </h3>
              <div className="flex gap-1">
                <button className="w-[30px] h-[30px] flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors">
                  <Icon path={mdiRefresh} size={0.67} color={colors.colorBlack1} />
                </button>
                <button className="w-[30px] h-[30px] flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors">
                  <Icon path={mdiClose} size={0.67} color={colors.colorBlack1} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center py-4">
              <span className="font-['Roboto',sans-serif] text-[14px] leading-[21px]" style={{ color: colors.colorBlack3 }}>
                No service tickets
              </span>
            </div>
          </div>

          {/* Call History Section */}
          <div className="mt-8">
            <div className="mb-4">
              <h3 className="font-['Roboto',sans-serif] font-medium text-[16px] leading-[24px]" style={{ color: colors.colorBlack1 }}>
                Call History
              </h3>
            </div>
            <div className="flex items-center justify-center py-4">
              <span className="font-['Roboto',sans-serif] text-[14px] leading-[21px]" style={{ color: colors.colorBlack3 }}>
                No call history
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fixed overlay mode (original behavior)
  return (
    <div
      className={`fixed right-0 top-[56px] overflow-y-auto transition-transform duration-300 ease-in-out shadow-lg ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{
        width: '400px',
        height: 'calc(100vh - 56px)',
        backgroundColor: colors.colorBlack8,
        zIndex: 40
      }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-['Roboto',sans-serif] font-medium text-[18px] leading-[27px]" style={{ color: colors.colorBlack1 }}>
            Conversation Details
          </h2>
          <button
            onClick={onClose}
            className="w-[30px] h-[30px] flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors"
          >
            <Icon path={mdiClose} size={0.67} color={colors.colorBlack1} />
          </button>
        </div>

        {/* Contact Number Card */}
        <div
          className="rounded-lg p-4 mb-6"
          style={{ backgroundColor: colors.colorBlueDark5 }}
        >
          <p className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[21px]" style={{ color: colors.colorBlack1 }}>
            Contact Number
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Icon path={mdiPhoneOutline} size={0.67} color={colors.colorBlack1} />
            <span className="font-['Roboto',sans-serif] text-[14px] leading-[21px]" style={{ color: colors.colorBlack1 }}>
              {contactNumber}
            </span>
          </div>
        </div>

        {/* Assignment Card */}
        <div
          className="rounded-lg p-4 mb-6"
          style={{ backgroundColor: colors.colorBlueDark5 }}
        >
          <p className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[21px]" style={{ color: colors.colorBlack1 }}>
            Assignment
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Icon path={mdiAccountMultipleOutline} size={0.67} color={colors.colorBlack1} />
            <span
              className="font-['Roboto',sans-serif] text-[14px] leading-[21px] cursor-pointer"
              style={{ color: colors.colorBlueDark1 }}
            >
              Assign Staff or Department
            </span>
          </div>
        </div>

        {/* Linked Reservations Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-['Roboto',sans-serif] font-medium text-[16px] leading-[24px]" style={{ color: colors.colorBlack1 }}>
              Linked Reservations
            </h3>
            <div className="flex gap-1">
              <button className="w-[30px] h-[30px] flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors">
                <Icon path={mdiRefresh} size={0.67} color={colors.colorBlack1} />
              </button>
              <button
                className="w-[30px] h-[30px] flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors"
                onClick={onOpenLinkModal}
              >
                <Icon path={mdiPlus} size={0.67} color={colors.colorBlack1} />
              </button>
            </div>
          </div>

          {linkedReservations.length === 0 ? (
            <p className="font-['Roboto',sans-serif] text-[14px] leading-[21px] text-center py-2" style={{ color: colors.colorBlack3 }}>
              No linked reservations
            </p>
          ) : (
            <>
              {/* Reservation table — single bordered container with dividers */}
              <div
                className="rounded-lg border divide-y divide-[#E5E5E5]"
                style={{
                  backgroundColor: colors.colorWhite,
                  borderColor: colors.colorBlack6,
                }}
              >
                {linkedReservations.map((lr) => (
                  <ReservationRow
                    key={lr.reservation.id}
                    linkedReservation={lr}
                    isExpanded={expandedResId === lr.reservation.id}
                    onToggle={() => toggleExpand(lr.reservation.id)}
                    onUnlink={onUnlinkReservation}
                  />
                ))}
              </div>

              {/* View more link (overflow state — only when >4 reservations) */}
              {linkedReservations.length > 4 && (
                <button
                  className="font-['Roboto',sans-serif] text-[14px] leading-[21px] mt-3 hover:underline"
                  style={{ color: colors.colorBlueDark1 }}
                >
                  View more reservations
                </button>
              )}
            </>
          )}
        </div>

        {/* Service Tasks Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-['Roboto',sans-serif] font-medium text-[16px] leading-[24px]" style={{ color: colors.colorBlack1 }}>
              Service Tasks
            </h3>
            <div className="flex gap-1">
              <button className="w-[30px] h-[30px] flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors">
                <Icon path={mdiRefresh} size={0.67} color={colors.colorBlack1} />
              </button>
              <button className="w-[30px] h-[30px] flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors">
                <Icon path={mdiClose} size={0.67} color={colors.colorBlack1} />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center py-4">
            <span className="font-['Roboto',sans-serif] text-[14px] leading-[21px]" style={{ color: colors.colorBlack3 }}>
              No service tickets
            </span>
          </div>
        </div>

        {/* Call History Section */}
        <div className="mt-8">
          <div className="mb-4">
            <h3 className="font-['Roboto',sans-serif] font-medium text-[16px] leading-[24px]" style={{ color: colors.colorBlack1 }}>
              Call History
            </h3>
          </div>
          <div className="flex items-center justify-center py-4">
            <span className="font-['Roboto',sans-serif] text-[14px] leading-[21px]" style={{ color: colors.colorBlack3 }}>
              No call history
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ReservationRow — a single row in the linked reservations table.
 *
 * Collapsed: guest name (+ AUTO-LINKED tag if applicable) + phone + room OR dates + menu + chevron
 *   - In-house (checked-in): show room number (bed icon)
 *   - Not in-house: show stay dates (calendar icon)
 *
 * Expanded: full detail rows (phone, email, dates, room, confirmation, check-in/out)
 *
 * 3-dot menu: "Unlink reservation" option — triggers callback to page-level modal
 */
function ReservationRow({
  linkedReservation,
  isExpanded,
  onToggle,
  onUnlink,
}: {
  linkedReservation: LinkedReservation;
  isExpanded: boolean;
  onToggle: () => void;
  onUnlink?: (reservationId: string) => void;
}) {
  const { reservation, guest, isAutoLinked } = linkedReservation;
  const isInHouse = reservation.status === 'checked-in';

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        menuBtnRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !menuBtnRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleUnlinkClick = () => {
    setIsMenuOpen(false);
    onUnlink?.(reservation.id);
  };

  return (
    <div style={{ borderColor: colors.colorBlack6 }}>
      {/* Row header (always visible) */}
      <div
        className="flex items-start justify-between px-4 py-3 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          {/* Name + AUTO-LINKED tag — name truncates, tag never wraps */}
          <div className="flex items-center gap-2 flex-nowrap overflow-hidden">
            <span className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[21px] truncate shrink" style={{ color: colors.colorBlack1 }}>
              {guest.name}
            </span>
            {isAutoLinked && (
              <span className="shrink-0">
                <CanaryTag
                  label="AUTO-LINKED"
                  variant={TagVariant.OUTLINE}
                  color={TagColor.SUCCESS}
                  size={TagSize.COMPACT}
                />
              </span>
            )}
          </div>

          {/* Metadata line: always phone, then room (in-house) OR dates (not in-house) */}
          {!isExpanded && (
            <div className="flex items-center gap-3 mt-1">
              {guest.phone && (
                <div className="flex items-center gap-1">
                  <Icon path={mdiPhoneOutline} size={0.5} color={colors.colorBlack3} />
                  <span className="font-['Roboto',sans-serif] text-[12px] leading-[18px]" style={{ color: colors.colorBlack3 }}>
                    {guest.phone}
                  </span>
                </div>
              )}
              {isInHouse && reservation.room ? (
                <div className="flex items-center gap-1">
                  <Icon path={mdiBedOutline} size={0.5} color={colors.colorBlack3} />
                  <span className="font-['Roboto',sans-serif] text-[12px] leading-[18px]" style={{ color: colors.colorBlack3 }}>
                    {reservation.room}
                  </span>
                </div>
              ) : (
                reservation.checkInDate && reservation.checkOutDate && (
                  <div className="flex items-center gap-1">
                    <Icon path={mdiCalendarBlank} size={0.5} color={colors.colorBlack3} />
                    <span className="font-['Roboto',sans-serif] text-[12px] leading-[18px]" style={{ color: colors.colorBlack3 }}>
                      {formatDateRange(reservation.checkInDate, reservation.checkOutDate)}
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Actions: menu + chevron */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <div className="relative">
            <button
              ref={menuBtnRef}
              className="w-[28px] h-[28px] flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
            >
              <Icon path={mdiDotsHorizontal} size={0.67} color={colors.colorBlack3} />
            </button>

            {/* Dropdown menu */}
            {isMenuOpen && (
              <div
                ref={menuRef}
                className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
              >
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                  style={{ color: '#E40046' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnlinkClick();
                  }}
                >
                  Unlink reservation
                </button>
              </div>
            )}
          </div>
          <div className="w-[28px] h-[28px] flex items-center justify-center">
            <Icon
              path={isExpanded ? mdiChevronUp : mdiChevronDown}
              size={0.67}
              color={colors.colorBlack3}
            />
          </div>
        </div>
      </div>

      {/* Expanded Details — 12px text, 16px icons */}
      {isExpanded && (
        <div className="px-4 pb-3 space-y-2.5">
          {/* Phone */}
          <div className="flex items-center gap-3">
            <Icon path={mdiPhoneOutline} size={0.67} color={colors.colorBlack1} />
            <span className="font-['Roboto',sans-serif] text-[12px] leading-[18px]" style={{ color: colors.colorBlack1 }}>
              {guest.phone || 'No number assigned'}
            </span>
          </div>

          {/* Email */}
          <div className="flex items-center gap-3">
            <Icon path={mdiEmailOutline} size={0.67} color={colors.colorBlack1} />
            <span className="font-['Roboto',sans-serif] text-[12px] leading-[18px]" style={{ color: colors.colorBlack1 }}>
              {guest.email || 'No email assigned'}
            </span>
          </div>

          {/* Dates */}
          {reservation.checkInDate && reservation.checkOutDate && (
            <div className="flex items-center gap-3">
              <Icon path={mdiCalendarBlank} size={0.67} color={colors.colorBlack1} />
              <span className="font-['Roboto',sans-serif] text-[12px] leading-[18px]" style={{ color: colors.colorBlack1 }}>
                {formatDateRange(reservation.checkInDate, reservation.checkOutDate)}
              </span>
            </div>
          )}

          {/* Room */}
          {reservation.room && (
            <div className="flex items-center gap-3">
              <Icon path={mdiBedOutline} size={0.67} color={colors.colorBlack1} />
              <span className="font-['Roboto',sans-serif] text-[12px] leading-[18px]" style={{ color: colors.colorBlack1 }}>
                {reservation.room}
              </span>
            </div>
          )}

          {/* Confirmation Code */}
          {reservation.confirmationCode && (
            <div className="flex items-center gap-3">
              <Icon path={mdiPound} size={0.67} color={colors.colorBlack1} />
              <span className="font-['Roboto',sans-serif] text-[12px] leading-[18px]" style={{ color: colors.colorBlack1 }}>
                {reservation.confirmationCode}
              </span>
            </div>
          )}

          {/* Check-in Status */}
          <div className="flex items-center gap-3">
            <Icon path={mdiLogin} size={0.67} color={colors.colorBlack1} />
            <span className="font-['Roboto',sans-serif] text-[12px] leading-[18px] flex-1" style={{ color: colors.colorBlack1 }}>
              {reservation.checkInStatus || 'Not Started'}
            </span>
            {reservation.checkInStatus && (
              <button className="w-[24px] h-[24px] flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors">
                <Icon path={mdiOpenInNew} size={0.5} color={colors.colorBlack1} />
              </button>
            )}
          </div>

          {/* Check-out Status */}
          <div className="flex items-center gap-3">
            <Icon path={mdiLogout} size={0.67} color={colors.colorBlack1} />
            <span className="font-['Roboto',sans-serif] text-[12px] leading-[18px] flex-1" style={{ color: colors.colorBlack1 }}>
              {reservation.checkOutStatus || '--'}
            </span>
            {reservation.checkOutStatus && (
              <button className="w-[24px] h-[24px] flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors">
                <Icon path={mdiOpenInNew} size={0.5} color={colors.colorBlack1} />
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
