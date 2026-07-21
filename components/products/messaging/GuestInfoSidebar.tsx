/**
 * GuestInfoSidebar Component — REDESIGN v2: grouped verification cards
 *
 * Conversation Details is a VERIFICATION AID. Linked Reservations moves to the
 * TOP and becomes the star. Grouping rule: group by "same phone as this thread"
 * (the auto-link fact) — NEVER by asserted person identity. Names are never
 * collapsed across stays (Sudarshan's identity constraint).
 *
 * Section order: (1) Linked Reservations, (2) Assignment, (3) Service Tasks,
 * (4) Call History. The standalone Contact Number card is GONE — the phone folds
 * into the primary card as its anchor.
 *
 * Linked Reservations is CARDS, not a table:
 *  - PRIMARY CARD (always first, one) = all auto-linked entries (every stay whose
 *    guest phone matches the thread phone). Header: current guest name, green
 *    AUTO-LINKED outline tag, thread phone. Body: one stay row per auto-linked
 *    reservation (sorted in-house → upcoming → past), each with a GJ message
 *    status line and a chevron to expand the detail fields. No unlink (facts).
 *  - SECONDARY CARDS (0+) = each manually-linked entry, with "Linked by staff"
 *    caption + a kebab "Unlink reservation".
 *
 * Two panel styles (PrototypeVariantToggle):
 *  - PUSH: a third body column; the wrapper's width animates 0↔440.
 *  - DRAWER: the current product's fixed right-edge slide-in, 440px.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LinkedReservation } from '@/lib/products/messaging/types';
import { gjMessageStatus } from '@/lib/products/messaging/mock-data';
import { Reservation } from '@/lib/core/types/reservation';
import { Guest } from '@/lib/core/types/guest';
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
  mdiAlertCircleOutline,
} from '@mdi/js';

/** Format date range: strip year from check-in date, keep on check-out. "Jul. 15 – Jul. 18, 2026" */
function formatDateRange(checkIn: string, checkOut: string): string {
  const stripped = checkIn.replace(/,?\s*\d{4}$/, '');
  return `${stripped} - ${checkOut}`;
}

/** Parse a canonical date string ("Jul. 13, 2026") into a comparable timestamp. */
function parseResDate(s?: string): number {
  if (!s) return 0;
  const t = new Date(s.replace(/\./g, '')).getTime();
  return Number.isNaN(t) ? 0 : t;
}

type StayState = 'in-house' | 'upcoming' | 'past';

/**
 * Derive the stay state from reservation status (+ dates as a fallback).
 * Status is primary: checked-in → in-house. This keeps the demo's current stay
 * anchored regardless of the ambiguous prototype "today".
 */
function deriveStayState(res: Reservation): StayState {
  if (res.status === 'checked-in') return 'in-house';
  if (res.status === 'checked-out' || res.status === 'cancelled' || res.status === 'no-show') return 'past';
  return 'upcoming';
}

const STATE_ORDER: Record<StayState, number> = { 'in-house': 0, upcoming: 1, past: 2 };
const STATE_LABEL: Record<StayState, string> = { 'in-house': 'IN-HOUSE', upcoming: 'UPCOMING', past: 'PAST' };

/**
 * Sort stays: in-house/current first, then upcoming (soonest first), then past
 * (most recent first). Dates are the disambiguator within each group.
 */
function sortStays(list: LinkedReservation[]): LinkedReservation[] {
  return [...list].sort((a, b) => {
    const sa = deriveStayState(a.reservation);
    const sb = deriveStayState(b.reservation);
    if (STATE_ORDER[sa] !== STATE_ORDER[sb]) return STATE_ORDER[sa] - STATE_ORDER[sb];
    const da = parseResDate(a.reservation.checkInDate);
    const db = parseResDate(b.reservation.checkInDate);
    return sa === 'upcoming' ? da - db : db - da;
  });
}

interface GuestInfoSidebarProps {
  contactNumber: string;
  linkedReservations: LinkedReservation[];
  isOpen: boolean;
  onClose: () => void;
  onOpenLinkModal?: () => void;
  onUnlinkReservation?: (reservationId: string) => void;
  /** PUSH = third body column; DRAWER = current product's fixed slide-in. */
  panelStyle?: 'push' | 'drawer';
}

export function GuestInfoSidebar({ contactNumber, linkedReservations, isOpen, onClose, onOpenLinkModal, onUnlinkReservation, panelStyle = 'drawer' }: GuestInfoSidebarProps) {
  // Which reservation's details are expanded (shared across all cards/rows).
  const [expandedResId, setExpandedResId] = useState<string | null>(null);

  const toggleExpand = (resId: string) => {
    setExpandedResId((prev) => (prev === resId ? null : resId));
  };

  const isDrawer = panelStyle === 'drawer';

  // Split by the auto-link FACT (never by person identity).
  const autoLinked = sortStays(linkedReservations.filter((lr) => lr.isAutoLinked));
  const manualLinked = linkedReservations.filter((lr) => !lr.isAutoLinked);

  return (
    <div
      className={
        isDrawer
          ? // DRAWER: current product mechanic — fixed right edge below the 56px
            // shell header, translate-x slide-in, always mounted so it animates.
            `fixed right-0 top-[56px] overflow-y-auto scrollbar-invisible transition-transform duration-300 ease-in-out shadow-lg ${
              isOpen ? 'translate-x-0' : 'translate-x-full'
            }`
          : // PUSH: always-mounted wrapper whose WIDTH animates 0↔440; a 0-width
            // flex child still contributes a flex gap, so cancel it while closed.
            'shrink-0 h-full overflow-hidden'
      }
      style={
        isDrawer
          ? {
              width: '440px',
              height: 'calc(100vh - 56px)',
              backgroundColor: colors.colorBlack8,
              zIndex: 40,
            }
          : {
              width: isOpen ? 440 : 0,
              marginLeft: isOpen ? 0 : -16,
              transition: 'width 200ms ease-out, margin-left 200ms ease-out',
            }
      }
    >
      <div
        className={isDrawer ? 'p-6' : 'p-6 h-full overflow-y-auto scrollbar-invisible rounded-[12px]'}
        style={
          isDrawer
            ? undefined
            : { width: 440, backgroundColor: colors.colorWhite, border: `1px solid ${colors.colorBlack6}` }
        }
      >
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

        {/* Linked Reservations Section (top — the star) */}
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
            <div className="flex flex-col gap-2">
              {/* PRIMARY CARD — all auto-linked stays (the phone-match fact) */}
              {autoLinked.length > 0 && (
                <PrimaryCard
                  contactNumber={contactNumber}
                  stays={autoLinked}
                  expandedResId={expandedResId}
                  onToggle={toggleExpand}
                />
              )}

              {/* SECONDARY CARDS — one per manually-linked entry (staff assertion) */}
              {manualLinked.map((lr) => (
                <SecondaryCard
                  key={lr.reservation.id}
                  linkedReservation={lr}
                  isExpanded={expandedResId === lr.reservation.id}
                  onToggle={() => toggleExpand(lr.reservation.id)}
                  onUnlink={onUnlinkReservation}
                />
              ))}
            </div>
          )}
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
 * GjStatusLine — one-line Guest-Journey scheduled-message status (visual-only).
 * Failures are the LOUDEST thing in the card (red + alert icon); otherwise a
 * quiet gray delivered/scheduled line.
 */
function GjStatusLine({ reservationId }: { reservationId: string }) {
  const status = gjMessageStatus[reservationId];
  if (!status) return null;

  if (status.failed > 0) {
    return (
      <div className="flex items-center gap-1 mt-1.5">
        <Icon path={mdiAlertCircleOutline} size={0.55} color={colors.colorRed1} />
        <span className="font-['Roboto',sans-serif] font-medium text-[12px] leading-[18px]" style={{ color: colors.colorRed1 }}>
          {status.failed} message{status.failed > 1 ? 's' : ''} failed to send
        </span>
      </div>
    );
  }

  return (
    <div className="mt-1.5">
      <span className="font-['Roboto',sans-serif] text-[12px] leading-[18px]" style={{ color: colors.colorBlack3 }}>
        ✓ {status.delivered} delivered · {status.scheduled} scheduled
      </span>
    </div>
  );
}

/**
 * ExpandedDetails — the settled detail fields (email, confirmation, check-in/out
 * status, etc.). Reused verbatim by both primary stay rows and secondary cards.
 */
function ExpandedDetails({ reservation, guest }: { reservation: Reservation; guest: Guest }) {
  return (
    <div className="pt-2 space-y-2.5">
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
  );
}

/**
 * Column template for the primary card's stay mini-table. Fixed widths on the
 * right three columns (state / GJ / chevron) guarantee they line up across every
 * row even though each row is its own grid; dates take the flexible remainder so
 * the disambiguating field breathes. Rows use px-3 (vs the header's px-4) to buy
 * back width — content is only ~390px inside the card.
 */
const STAY_ROW_GRID = 'minmax(0, 1fr) 104px 78px 22px';

/**
 * GjStatusCell — the compact, in-table variant of the GJ status line. Failures
 * are the loudest thing (red alert icon + "N failed"); otherwise a quiet gray
 * "✓ D" delivered count, with "· S queued" appended only when messages are still
 * scheduled. Truncates rather than wrapping so row height stays uniform.
 */
function GjStatusCell({ reservationId }: { reservationId: string }) {
  const status = gjMessageStatus[reservationId];
  if (!status) return <span />;

  if (status.failed > 0) {
    return (
      <div className="flex items-center gap-1 min-w-0">
        <span className="shrink-0 flex items-center">
          <Icon path={mdiAlertCircleOutline} size={0.5} color={colors.colorRed1} />
        </span>
        <span className="truncate font-['Roboto',sans-serif] font-medium text-[12px] leading-[18px]" style={{ color: colors.colorRed1 }}>
          {status.failed} failed
        </span>
      </div>
    );
  }

  return (
    <span className="block truncate font-['Roboto',sans-serif] text-[12px] leading-[18px]" style={{ color: colors.colorBlack3 }}>
      ✓ {status.delivered}
      {status.scheduled > 0 ? ` · ${status.scheduled} queued` : ''}
    </span>
  );
}

/**
 * PrimaryCard — one card holding ALL auto-linked stays. The header carries the
 * current guest name, the green AUTO-LINKED provenance tag, and the thread phone
 * (the card's anchor). Each stay is a chevron-expandable row; no unlink (facts).
 */
function PrimaryCard({
  contactNumber,
  stays,
  expandedResId,
  onToggle,
}: {
  contactNumber: string;
  stays: LinkedReservation[];
  expandedResId: string | null;
  onToggle: (resId: string) => void;
}) {
  // Header name = the most-current stay's guest (stays are pre-sorted).
  const headerName = stays[0]?.guest.name ?? '';

  return (
    <div
      className="rounded-[8px] overflow-hidden"
      style={{ backgroundColor: colors.colorWhite, border: `1px solid ${colors.colorBlack6}` }}
    >
      {/* Card header — name + AUTO-LINKED tag, then the anchor phone */}
      <div className="px-4 pt-3 pb-2.5" style={{ borderBottom: `1px solid ${colors.colorBlack6}` }}>
        <div className="flex items-center gap-2 flex-nowrap overflow-hidden">
          <span className="font-['Roboto',sans-serif] font-medium text-[16px] leading-[24px] truncate shrink" style={{ color: colors.colorBlack1 }}>
            {headerName}
          </span>
          <span className="shrink-0">
            <CanaryTag
              label="AUTO-LINKED"
              variant={TagVariant.OUTLINE}
              color={TagColor.SUCCESS}
              size={TagSize.COMPACT}
            />
          </span>
        </div>
        {/* Thread phone — the card's anchor, displayed prominently */}
        <div className="flex items-center gap-1.5 mt-1">
          <Icon path={mdiPhoneOutline} size={0.6} color={colors.colorBlack2} />
          <span className="font-['Roboto',sans-serif] text-[14px] leading-[21px]" style={{ color: colors.colorBlack2 }}>
            {contactNumber}
          </span>
        </div>
      </div>

      {/* Stay mini-table — aligned columns, hairline dividers between rows */}
      <div>
        {stays.map((lr, i) => (
          <PrimaryStayRow
            key={lr.reservation.id}
            linkedReservation={lr}
            headerName={headerName}
            isFirst={i === 0}
            isExpanded={expandedResId === lr.reservation.id}
            onToggle={() => onToggle(lr.reservation.id)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * PrimaryStayRow — one stay row of the primary card's mini-table. The row is an
 * aligned grid: (a) STAY DATES (the disambiguator, 14px Medium) with the guest
 * name stacked beneath ONLY when it differs from the header (shared-phone rule —
 * never collapse differing names); (c) state (IN-HOUSE / UPCOMING / PAST, with
 * "· RM 504" appended when in-house); (d) a compact GJ status cell; (e) the
 * expand chevron. A hairline (colorBlack6) top border divides it from the row
 * above. The full-width detail section still expands below the row.
 *
 * Note: the never-collapse name (spec column b) rides in column (a) beneath the
 * dates rather than in a permanent middle column — a dedicated name column would
 * steal fixed width from every row for a field only shared-phone rows use, which
 * would squeeze the dates/GJ columns the reviewer wanted to let breathe. The
 * right-hand columns (state / GJ / chevron) stay perfectly aligned regardless.
 */
function PrimaryStayRow({
  linkedReservation,
  headerName,
  isFirst,
  isExpanded,
  onToggle,
}: {
  linkedReservation: LinkedReservation;
  headerName: string;
  isFirst: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { reservation, guest } = linkedReservation;
  const state = deriveStayState(reservation);
  const isInHouse = state === 'in-house';
  const nameDiffers = guest.name !== headerName;

  const stateText =
    isInHouse && reservation.room ? `${STATE_LABEL[state]} · RM ${reservation.room}` : STATE_LABEL[state];

  return (
    <div style={isFirst ? undefined : { borderTop: `1px solid ${colors.colorBlack6}` }}>
      {/* Row (clickable) — aligned mini-table grid */}
      <div
        className="grid items-start px-3 py-3 cursor-pointer"
        style={{ gridTemplateColumns: STAY_ROW_GRID, columnGap: 8 }}
        onClick={onToggle}
      >
        {/* (a) Stay dates (+ differing name beneath) */}
        <div className="min-w-0">
          <span className="block truncate font-['Roboto',sans-serif] font-medium text-[14px] leading-[21px]" style={{ color: colors.colorBlack1 }}>
            {reservation.checkInDate && reservation.checkOutDate
              ? formatDateRange(reservation.checkInDate, reservation.checkOutDate)
              : 'No dates'}
          </span>
          {nameDiffers && (
            <span className="block truncate font-['Roboto',sans-serif] text-[12px] leading-[18px] mt-0.5" style={{ color: colors.colorBlack3 }}>
              {guest.name}
            </span>
          )}
        </div>

        {/* (c) State (+ room when in-house) */}
        <div className="min-w-0 pt-[3px]">
          <span
            className="block truncate font-['Roboto',sans-serif] font-medium uppercase"
            style={{ fontSize: 10, lineHeight: '14px', letterSpacing: '0.4px', color: colors.colorBlack3 }}
          >
            {stateText}
          </span>
        </div>

        {/* (d) Compact GJ status */}
        <div className="min-w-0 pt-[1px]">
          <GjStatusCell reservationId={reservation.id} />
        </div>

        {/* (e) Chevron (no unlink — auto-linked stays are facts) */}
        <div className="flex items-center justify-center" style={{ height: 20 }}>
          <Icon path={isExpanded ? mdiChevronUp : mdiChevronDown} size={0.67} color={colors.colorBlack3} />
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-3 pb-3">
          <ExpandedDetails reservation={reservation} guest={guest} />
        </div>
      )}
    </div>
  );
}

/**
 * SecondaryCard — a single manually-linked reservation (a staff ASSERTION, not a
 * phone-match fact). "Linked by staff" caption is the assertion signal; the kebab
 * offers "Unlink reservation" (auto-linked stays never get this).
 */
function SecondaryCard({
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
  const { reservation, guest } = linkedReservation;
  const state = deriveStayState(reservation);
  const isInHouse = state === 'in-house';

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

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
    <div
      className="rounded-[8px] overflow-hidden"
      style={{ backgroundColor: colors.colorWhite, border: `1px solid ${colors.colorBlack6}` }}
    >
      {/* Header (clickable to expand) */}
      <div className="flex items-start justify-between px-4 py-3 cursor-pointer" onClick={onToggle}>
        <div className="flex-1 min-w-0">
          {/* Guest name */}
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[21px] truncate" style={{ color: colors.colorBlack1 }}>
              {guest.name}
            </span>
          </div>

          {/* "Linked by staff" caption — the assertion signal */}
          <span className="font-['Roboto',sans-serif] text-[12px] leading-[18px]" style={{ color: colors.colorBlack3 }}>
            Linked by staff
          </span>

          {/* Metadata: phone, then room (in-house) OR dates */}
          {!isExpanded && (
            <div className="flex items-center gap-3 mt-1 flex-wrap">
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
                    Room {reservation.room}
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

          {/* GJ scheduled-message status line */}
          <GjStatusLine reservationId={reservation.id} />
        </div>

        {/* Actions: kebab (unlink) + chevron */}
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

            {isMenuOpen && (
              <div
                ref={menuRef}
                className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
              >
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                  style={{ color: colors.colorRed1 }}
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
            <Icon path={isExpanded ? mdiChevronUp : mdiChevronDown} size={0.67} color={colors.colorBlack3} />
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-4 pb-3">
          <ExpandedDetails reservation={reservation} guest={guest} />
        </div>
      )}
    </div>
  );
}
