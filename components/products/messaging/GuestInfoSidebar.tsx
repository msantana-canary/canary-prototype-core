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
 * State-vocabulary alignment (2026-07-21): ONE state family → ONE visual channel
 * → ONE vocabulary. Provenance is now STRUCTURAL (the primary card IS the
 * phone-matched group) + a section ⓘ tooltip — the green AUTO-LINKED badge is
 * retired to match production's post-April treatment. Lifecycle is PMS-vocabulary
 * CHIPS (RESERVED / CHECKED-IN / CHECKED-OUT) derived from reservation.status;
 * the invented IN-HOUSE / UPCOMING / PAST text labels are gone; cancelled &
 * no-show reservations are hidden from the panel entirely.
 *
 * Linked Reservations is CARDS, not a table:
 *  - PRIMARY CARD (always first, one) = all auto-linked entries (every stay whose
 *    guest phone matches the thread phone). Header: current guest name + thread
 *    phone (provenance is structural — this card is the phone-matched group). Body:
 *    one stay row per auto-linked reservation (sorted current → upcoming → past),
 *    each with a lifecycle chip + room, a GJ message status line, and a chevron to
 *    expand the detail fields. No unlink (facts).
 *  - SECONDARY CARDS (0+) = each manually-linked entry, with "Linked by staff"
 *    caption (the assertion-side provenance signal) + a kebab "Unlink reservation".
 *
 * Panel mechanic v3 — FLOATING PANEL (replaces push/drawer):
 *  - A fixed 400px white card inset from the window edges (top 72 / right 16 /
 *    bottom 16), floating below the 56px legacy shell header, with a large soft
 *    shadow and internal invisible scroll. Slides + fades in on open (~250ms).
 *  - A subtle scrim tints the app behind it; clicking the scrim closes the panel.
 *
 * Linked Reservations is a one-guest-per-slide pager: slide 0 = the primary
 * phone-grouped card, slides 1+ = each staff-linked guest. The dots+arrows
 * carousel is replaced by a GUEST PAGER ("‹ 👥 N ›", the Check-in idiom) under
 * the heading; when an OFF-SCREEN guest has a failed GJ message the pager's count
 * chip goes RED (the hidden-failure signal the dots used to carry).
 *
 * v5 — PROGRESSIVE DISCLOSURE. GJ scheduled messages are ANCILLARY monitoring
 * (healthy = nearly silent, failure = unmissable). Each reservation's detail
 * block carries a two-intensity <GjBanner> (quiet gray "Scheduled messages ✓" /
 * loud red "N failed to send") instead of an inline table. Tapping it DRILLS IN:
 * the panel navigates WITHIN ITSELF (translate-x track) to a Scheduled Messages
 * detail (<DrillInView>) — back arrow returns with main-panel state preserved.
 * This internal-navigation pattern is a platform primitive (future home for AI
 * explanations). Failed message rows in the drill-in carry production's error
 * register: the raw carrier code + a curated hotelier-readable line + Learn more.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LinkedReservation } from '@/lib/products/messaging/types';
import { gjMessages, getGjSummary } from '@/lib/products/messaging/mock-data';
import { Reservation } from '@/lib/core/types/reservation';
import { Guest } from '@/lib/core/types/guest';
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
  mdiChevronLeft,
  mdiChevronRight,
  mdiArrowLeft,
  mdiDotsHorizontal,
  mdiAccountMultipleOutline,
  mdiAlertCircleOutline,
  mdiInformationOutline,
  mdiMessageProcessingOutline,
  mdiWhatsapp,
} from '@mdi/js';

/**
 * Compact stay date range — collapses the month/year so the range never
 * truncates at any panel width. Same-month stays print the month once
 * ("Jul. 13 - 15, 2026"); cross-month, same-year print both months with a
 * single trailing year ("Sep. 28 - Oct. 2, 2026"); cross-year keeps both years.
 * Inputs are canonical strings like "Jul. 13, 2026".
 */
function formatCompactDateRange(checkIn?: string, checkOut?: string): string {
  if (!checkIn || !checkOut) return checkIn || checkOut || '';
  const re = /^([A-Za-z]+)\.?\s+(\d+),?\s*(\d{4})$/;
  const a = checkIn.match(re);
  const b = checkOut.match(re);
  if (!a || !b) return `${checkIn} - ${checkOut}`;
  const [, mA, dA, yA] = a;
  const [, mB, dB, yB] = b;
  if (mA === mB && yA === yB) return `${mA}. ${dA} - ${dB}, ${yB}`;
  if (yA === yB) return `${mA}. ${dA} - ${mB}. ${dB}, ${yB}`;
  return `${mA}. ${dA}, ${yA} - ${mB}. ${dB}, ${yB}`;
}

/** Parse a canonical date string ("Jul. 13, 2026") into a comparable timestamp. */
function parseResDate(s?: string): number {
  if (!s) return 0;
  const t = new Date(s.replace(/\./g, '')).getTime();
  return Number.isNaN(t) ? 0 : t;
}

type StayState = 'in-house' | 'upcoming' | 'past';

/**
 * Derive the TEMPORAL stay state from reservation status — used ONLY for sort
 * order + the current/upcoming/past grouping (current first, then future, then
 * past). This is not a display label; lifecycle is shown via <LifecycleChip>
 * (PMS vocabulary) instead. Status is primary: checked-in → current (in-house).
 */
function deriveStayState(res: Reservation): StayState {
  if (res.status === 'checked-in') return 'in-house';
  if (res.status === 'checked-out' || res.status === 'cancelled' || res.status === 'no-show') return 'past';
  return 'upcoming';
}

const STATE_ORDER: Record<StayState, number> = { 'in-house': 0, upcoming: 1, past: 2 };

/**
 * PMS lifecycle vocabulary chip — the ONE visual channel for the lifecycle state
 * family. Maps reservation.status to production's vocabulary + chip register
 * (10px uppercase). Our prototype's 'upcoming' is production's "reserved".
 * cancelled / no-show never reach here (filtered out of the panel entirely).
 */
const LIFECYCLE_CHIP: Record<string, { label: string; bg: string; color: string; border: string }> = {
  'upcoming': { label: 'RESERVED', bg: colors.colorBlueDark5, color: colors.colorBlueDark1, border: colors.colorBlueDark3 },
  'checked-in': { label: 'CHECKED-IN', bg: 'rgba(0,128,64,0.1)', color: colors.colorLightGreen1, border: 'transparent' },
  'checked-out': { label: 'CHECKED-OUT', bg: colors.colorBlack7, color: colors.colorBlack3, border: 'transparent' },
};

function LifecycleChip({ status }: { status: Reservation['status'] }) {
  const cfg = LIFECYCLE_CHIP[status];
  if (!cfg) return null;
  return (
    <span
      className="inline-flex items-center font-['Roboto',sans-serif] font-medium uppercase whitespace-nowrap shrink-0"
      style={{
        fontSize: 10,
        lineHeight: '14px',
        letterSpacing: '0.4px',
        padding: '1px 6px',
        borderRadius: 4,
        backgroundColor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
      }}
    >
      {cfg.label}
    </span>
  );
}

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
}

export function GuestInfoSidebar({ contactNumber, linkedReservations, isOpen, onClose, onOpenLinkModal, onUnlinkReservation }: GuestInfoSidebarProps) {
  // Which reservation's details are expanded (shared across all cards/rows).
  const [expandedResId, setExpandedResId] = useState<string | null>(null);
  // Which guest card (pager position) is currently visible.
  const [activeSlide, setActiveSlide] = useState(0);
  // Drill-in: which reservation's Scheduled Messages detail is open. `null` =
  // main panel state; a resId = the panel has navigated into itself (the
  // internal-navigation platform pattern). The main pane's state is preserved.
  const [drillInResId, setDrillInResId] = useState<string | null>(null);
  // Hold the last drilled reservation so the drill pane keeps its content while
  // sliding back out (drillInResId goes null the instant Back is pressed).
  const lastDrillRef = useRef<string | null>(null);
  if (drillInResId) lastDrillRef.current = drillInResId;

  const toggleExpand = (resId: string) => {
    setExpandedResId((prev) => (prev === resId ? null : resId));
  };

  // Hide cancelled / no-show reservations from the panel entirely (matches
  // production's April fix) — the lifecycle vocabulary only covers live stays.
  const visibleLinked = linkedReservations.filter(
    (lr) => lr.reservation.status !== 'cancelled' && lr.reservation.status !== 'no-show'
  );

  // Split by the auto-link FACT (never by person identity).
  const autoLinked = sortStays(visibleLinked.filter((lr) => lr.isAutoLinked));
  const manualLinked = visibleLinked.filter((lr) => !lr.isAutoLinked);

  const hasFailure = (resId: string) => (getGjSummary(resId)?.failed ?? 0) > 0;

  // Reservation lookup for the drill-in view (subtitle + table both need it).
  const entryById: Record<string, LinkedReservation> = {};
  visibleLinked.forEach((lr) => {
    entryById[lr.reservation.id] = lr;
  });
  const drillEntry = entryById[drillInResId ?? lastDrillRef.current ?? ''];

  // v4 default: the CURRENT (in-house) auto-linked stay opens expanded — its full
  // detail block + nested GJ table is the thing staff want to see first.
  const defaultExpandedResId =
    autoLinked.find((lr) => deriveStayState(lr.reservation) === 'in-house')?.reservation.id ??
    autoLinked[0]?.reservation.id ??
    null;

  // Carousel slides: slide 0 = the primary phone-grouped card (all auto-linked
  // stays); slides 1+ = each staff-linked guest card. `hasFailure` lets a HIDDEN
  // slide's dot render red so a failed GJ message stays loud even off-screen.
  const slides: { key: string; hasFailure: boolean; node: React.ReactNode }[] = [];
  if (autoLinked.length > 0) {
    slides.push({
      key: 'primary',
      hasFailure: autoLinked.some((lr) => hasFailure(lr.reservation.id)),
      node: (
        <PrimaryCard
          contactNumber={contactNumber}
          stays={autoLinked}
          expandedResId={expandedResId}
          onToggle={toggleExpand}
          onDrillIn={setDrillInResId}
        />
      ),
    });
  }
  manualLinked.forEach((lr) => {
    slides.push({
      key: lr.reservation.id,
      hasFailure: hasFailure(lr.reservation.id),
      node: (
        <SecondaryCard
          linkedReservation={lr}
          isExpanded={expandedResId === lr.reservation.id}
          onToggle={() => toggleExpand(lr.reservation.id)}
          onUnlink={onUnlinkReservation}
          onDrillIn={setDrillInResId}
        />
      ),
    });
  });

  // Reset to the first slide whenever the set of linked reservations changes
  // (i.e. the user switched threads).
  const slideKey = slides.map((s) => s.key).join('|');
  useEffect(() => {
    setActiveSlide(0);
    setExpandedResId(defaultExpandedResId);
    setDrillInResId(null);
  }, [slideKey, defaultExpandedResId]);
  const activeIndex = Math.min(activeSlide, Math.max(0, slides.length - 1));
  // Any OFF-SCREEN guest card with a failed GJ message → the pager count chip
  // goes red (the hidden-failure signal the carousel dots used to carry).
  const hiddenFailure = slides.some((s, i) => i !== activeIndex && s.hasFailure);

  return (
    <>
      {/* Scrim — subtle tint over the app behind the panel; click closes. */}
      <div
        aria-hidden
        onClick={onClose}
        className="fixed left-0 right-0 bottom-0 transition-opacity duration-[250ms] ease-in-out"
        style={{
          top: 56,
          backgroundColor: 'rgba(0,0,0,0.10)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          zIndex: 39,
        }}
      />

      {/* Floating Conversation Details panel — fixed, inset from the window edges,
          floating below the 56px legacy shell header. Slides + fades in on open. */}
      <div
        className={`fixed overflow-hidden transition-[transform,opacity] duration-[250ms] ease-in-out ${
          isOpen ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0 pointer-events-none'
        }`}
        style={{
          top: 72,
          right: 16,
          bottom: 16,
          width: 600,
          backgroundColor: colors.colorWhite,
          border: `1px solid ${colors.colorBlack6}`,
          borderRadius: 12,
          boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
          zIndex: 40,
        }}
      >
        {/* Internal-navigation track: the panel slides between its MAIN state and
            a per-reservation DRILL-IN detail (the platform pattern — future home
            for AI explanations). translateX(-100%) reveals the drill-in pane. */}
        <div
          className="flex h-full transition-transform duration-[250ms] ease-in-out"
          style={{ transform: drillInResId ? 'translateX(-100%)' : 'translateX(0)' }}
        >
        {/* MAIN PANE */}
        <div className="w-full h-full shrink-0 overflow-y-auto scrollbar-invisible">
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

          {/* Linked Reservations Section (top — the star) */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <h3 className="font-['Roboto',sans-serif] font-medium text-[16px] leading-[24px]" style={{ color: colors.colorBlack1 }}>
                  Linked Reservations
                </h3>
                {/* Provenance is now structural + this tooltip — the AUTO-LINKED
                    badge is retired (production's post-April treatment). */}
                <span
                  className="flex items-center cursor-help"
                  title="Reservations link automatically when the guest's phone number in your PMS matches this conversation. If it's missing, check the phone number in your PMS, or search & link a reservation manually here."
                >
                  <Icon path={mdiInformationOutline} size={0.67} color={colors.colorBlack3} />
                </span>
              </div>
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

            {visibleLinked.length === 0 ? (
              <p className="font-['Roboto',sans-serif] text-[14px] leading-[21px] text-center py-2" style={{ color: colors.colorBlack3 }}>
                No linked reservations
              </p>
            ) : (
              <div>
                {/* Guest pager — the idiom carried from Check-in's multi-guest
                    control ("‹ 👥 N ›"). Left-aligned under the heading; arrows
                    disable at the ends (no wrap). The count chip renders RED when
                    an OFF-SCREEN guest has a failed GJ message — the hidden-failure
                    signal the carousel dots used to carry. */}
                {slides.length > 1 && (
                  <div className="flex items-center gap-1 mb-3" style={{ height: 28 }}>
                    <button
                      onClick={() => setActiveSlide(activeIndex - 1)}
                      disabled={activeIndex === 0}
                      aria-label="Previous guest"
                      className="w-[28px] h-[28px] flex items-center justify-center rounded-full transition-colors disabled:opacity-30 disabled:cursor-default enabled:hover:bg-[#f0f0f0]"
                    >
                      <Icon path={mdiChevronLeft} size={0.83} color={colors.colorBlack1} />
                    </button>

                    <span
                      className="inline-flex items-center gap-1 px-2 rounded-full"
                      style={{
                        height: 24,
                        backgroundColor: hiddenFailure ? 'rgba(228,0,70,0.08)' : colors.colorBlack7,
                      }}
                    >
                      <Icon
                        path={mdiAccountMultipleOutline}
                        size={0.6}
                        color={hiddenFailure ? colors.colorRed1 : colors.colorBlack2}
                      />
                      <span
                        className="font-['Roboto',sans-serif] font-medium text-[13px] leading-[18px]"
                        style={{ color: hiddenFailure ? colors.colorRed1 : colors.colorBlack2 }}
                      >
                        {slides.length}
                      </span>
                    </span>

                    <button
                      onClick={() => setActiveSlide(activeIndex + 1)}
                      disabled={activeIndex === slides.length - 1}
                      aria-label="Next guest"
                      className="w-[28px] h-[28px] flex items-center justify-center rounded-full transition-colors disabled:opacity-30 disabled:cursor-default enabled:hover:bg-[#f0f0f0]"
                    >
                      <Icon path={mdiChevronRight} size={0.83} color={colors.colorBlack1} />
                    </button>
                  </div>
                )}

                {/* Active guest card (one slide at a time) */}
                <div>{slides[activeIndex]?.node}</div>
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
        {/* DRILL-IN PANE — Scheduled Messages detail for one reservation */}
        <div className="w-full h-full shrink-0 overflow-y-auto scrollbar-invisible">
          <div className="p-6">
            {drillEntry && (
              <DrillInView
                reservation={drillEntry.reservation}
                guest={drillEntry.guest}
                onBack={() => setDrillInResId(null)}
              />
            )}
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

/**
 * GjStatusLine — one-line Guest-Journey scheduled-message status (visual-only).
 * Failures are the LOUDEST thing in the card (red + alert icon); otherwise a
 * quiet gray delivered/scheduled line.
 */
function GjStatusLine({ reservationId }: { reservationId: string }) {
  const status = getGjSummary(reservationId);
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

/** Loud-red for failed anything; matches colorRed1 (#E40046). */
const GJ_FAIL_RED = '#E40046';

/**
 * ChannelIcon — one delivery channel inside a GJ message row. email / sms /
 * whatsapp render as ~18px mdi glyphs; booking / expedia render as tiny rounded
 * OTA letter chips ("B" white-on-navy, "E" black-on-amber). Status drives color:
 * failed = red, scheduled = 40% opacity (a future send), sent = colorBlack2.
 */
function ChannelIcon({ type, status }: { type: 'email' | 'sms' | 'whatsapp' | 'booking' | 'expedia'; status: 'sent' | 'failed' | 'scheduled' }) {
  const failed = status === 'failed';
  const opacity = status === 'scheduled' ? 0.4 : 1;

  if (type === 'booking' || type === 'expedia') {
    const isBooking = type === 'booking';
    return (
      <span
        className="flex items-center justify-center font-['Roboto',sans-serif] font-semibold shrink-0"
        style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          fontSize: 11,
          lineHeight: '18px',
          opacity,
          backgroundColor: failed ? GJ_FAIL_RED : isBooking ? '#1a3c8b' : '#ffd43b',
          color: failed ? '#ffffff' : isBooking ? '#ffffff' : '#000000',
        }}
      >
        {isBooking ? 'B' : 'E'}
      </span>
    );
  }

  const path = type === 'email' ? mdiEmailOutline : type === 'sms' ? mdiMessageProcessingOutline : mdiWhatsapp;
  return (
    <span className="flex items-center justify-center shrink-0" style={{ width: 18, height: 18, opacity }}>
      <Icon path={path} size={0.72} color={failed ? GJ_FAIL_RED : colors.colorBlack2} />
    </span>
  );
}

/**
 * GjMessagesTable — the "table in a table": the reservation's guest-journey
 * message log, rendered INSIDE the detail block. A rounded-8, colorBlack6-bordered
 * container of hairline-divided rows. Each row = one GJ message: title (left) +
 * right-aligned timestamp caption ("Sent Jul 11 · 9:00 AM" for sent, bare time for
 * scheduled), with a row of channel icons beneath. Any failed channel turns that
 * row's caption red + adds an alert icon — failures stay the loudest thing.
 */
function GjMessagesTable({ reservationId }: { reservationId: string }) {
  const msgs = gjMessages[reservationId];
  if (!msgs || msgs.length === 0) return null;

  return (
    <div className="mt-3 rounded-[8px] overflow-hidden" style={{ border: `1px solid ${colors.colorBlack6}` }}>
      {msgs.map((m, i) => {
        const failed = m.channels.some((c) => c.status === 'failed');
        const timestamp = m.sentAt ? `Sent ${m.sentAt}` : m.scheduledFor ?? '';
        return (
          <div
            key={`${m.title}-${i}`}
            className="px-3 py-2.5"
            style={i === 0 ? undefined : { borderTop: `1px solid ${colors.colorBlack6}` }}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[21px] min-w-0 truncate" style={{ color: colors.colorBlack1 }}>
                {m.title}
              </span>
              <span className="flex items-center gap-1 shrink-0">
                {failed && <Icon path={mdiAlertCircleOutline} size={0.5} color={GJ_FAIL_RED} />}
                <span
                  className="font-['Roboto',sans-serif] text-[12px] leading-[18px] whitespace-nowrap"
                  style={{ color: failed ? GJ_FAIL_RED : colors.colorBlack3 }}
                >
                  {timestamp}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              {m.channels.map((c, j) => (
                <ChannelIcon key={`${c.type}-${j}`} type={c.type} status={c.status} />
              ))}
            </div>

            {/* Error register — one block per failed channel. Mirrors production's
                MessageErrorDetailsModal: the raw carrier code + a curated,
                hotelier-readable line + a Learn-more link into the Twilio docs.
                Hotels can't fix a carrier failure, but the on-screen code saves
                Canary support the investigation. */}
            {m.channels
              .filter((c) => c.status === 'failed' && c.errorCode)
              .map((c, j) => (
                <div
                  key={`err-${j}`}
                  className="mt-2 rounded-[6px] px-2.5 py-2"
                  style={{ backgroundColor: 'rgba(228,0,70,0.06)' }}
                >
                  <span
                    className="text-[12px] leading-[16px]"
                    style={{ color: colors.colorRed1, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
                  >
                    Error {c.errorCode}
                  </span>
                  <p className="font-['Roboto',sans-serif] text-[12px] leading-[17px] mt-0.5" style={{ color: colors.colorBlack2 }}>
                    {c.errorNote}
                  </p>
                  <button
                    className="font-['Roboto',sans-serif] text-[12px] leading-[17px] underline mt-1"
                    style={{ color: colors.colorBlueDark1 }}
                  >
                    Learn more
                  </button>
                </div>
              ))}
          </div>
        );
      })}
    </div>
  );
}

/**
 * ExpandedDetails — the settled detail fields (email, confirmation, check-in/out
 * status, etc.) followed by the reservation's nested GJ messages table. Reused
 * verbatim by both primary stay rows and secondary cards.
 */
function ExpandedDetails({ reservation, guest, onDrillIn }: { reservation: Reservation; guest: Guest; onDrillIn: (resId: string) => void }) {
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
            {formatCompactDateRange(reservation.checkInDate, reservation.checkOutDate)}
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

      {/* GJ scheduled-messages banner — two intensities (healthy silent / failure
          loud). Tap → drill into the Scheduled Messages detail for this stay. */}
      <GjBanner reservationId={reservation.id} onClick={() => onDrillIn(reservation.id)} />
    </div>
  );
}

/**
 * GjBanner — the compact, tappable one-line summary of a reservation's
 * guest-journey scheduled messages. GJ is ANCILLARY monitoring: healthy = nearly
 * silent, failure = unmissable. Two intensities:
 *  - HEALTHY: quiet gray "Scheduled messages ✓" with a chevron-right affordance.
 *  - FAILURE: promoted red banner (subtle red tint bg) + alert icon + "N message(s)
 *    failed to send" in colorRed1 medium — the loudest element in the card.
 * Both variants tap through to the drill-in Scheduled Messages detail.
 */
function GjBanner({ reservationId, onClick }: { reservationId: string; onClick: () => void }) {
  const status = getGjSummary(reservationId);
  if (!status) return null;
  const failed = status.failed > 0;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 mt-1.5 rounded-[6px] transition-colors text-left"
      style={{
        padding: failed ? '8px 10px' : '6px 8px',
        backgroundColor: failed ? 'rgba(228,0,70,0.06)' : 'transparent',
      }}
    >
      {failed ? (
        <>
          <Icon path={mdiAlertCircleOutline} size={0.6} color={colors.colorRed1} />
          <span className="flex-1 font-['Roboto',sans-serif] font-medium text-[13px] leading-[18px]" style={{ color: colors.colorRed1 }}>
            {status.failed} message{status.failed > 1 ? 's' : ''} failed to send
          </span>
          <Icon path={mdiChevronRight} size={0.7} color={colors.colorRed1} />
        </>
      ) : (
        <>
          <span className="flex-1 font-['Roboto',sans-serif] text-[13px] leading-[18px]" style={{ color: colors.colorBlack3 }}>
            Scheduled messages ✓
          </span>
          <Icon path={mdiChevronRight} size={0.7} color={colors.colorBlack3} />
        </>
      )}
    </button>
  );
}

/**
 * DrillInView — the internal-navigation detail: the panel has slid to a
 * per-reservation "Scheduled messages" view. Back arrow returns to the main panel
 * (whose state is preserved). Content = the full-width GJ messages table, with
 * failed rows carrying production's error register (carrier code + curated line).
 */
function DrillInView({ reservation, guest, onBack }: { reservation: Reservation; guest: Guest; onBack: () => void }) {
  return (
    <div>
      <div className="flex items-start gap-2 mb-5">
        <button
          onClick={onBack}
          aria-label="Back"
          className="w-[30px] h-[30px] shrink-0 flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors -ml-1"
        >
          <Icon path={mdiArrowLeft} size={0.75} color={colors.colorBlack1} />
        </button>
        <div className="min-w-0">
          <h2 className="font-['Roboto',sans-serif] font-medium text-[18px] leading-[27px]" style={{ color: colors.colorBlack1 }}>
            Scheduled messages
          </h2>
          <p className="font-['Roboto',sans-serif] text-[13px] leading-[18px]" style={{ color: colors.colorBlack3 }}>
            {guest.name}
            {reservation.checkInDate && reservation.checkOutDate
              ? ` · ${formatCompactDateRange(reservation.checkInDate, reservation.checkOutDate)}`
              : ''}
          </p>
        </div>
      </div>
      <GjMessagesTable reservationId={reservation.id} />
    </div>
  );
}

/**
 * Column template for the primary card's stay mini-table. Fixed widths on the
 * right three columns (lifecycle chip + room / GJ / chevron) guarantee they line
 * up across every row even though each row is its own grid; dates take the
 * flexible remainder so the disambiguating field breathes. Widened at 600px so
 * the chip ("CHECKED-IN") + room ("RM 504") + GJ status ("✓ 1 sent · 3
 * scheduled") all fit without truncation. Rows use px-3 (vs the header's px-4).
 */
const STAY_ROW_GRID = 'minmax(0, 1fr) 140px 148px 22px';

/**
 * GjStatusCell — the compact, in-table variant of the GJ status line. Failures
 * are the loudest thing (red alert icon + "N failed"); otherwise a quiet gray
 * "✓ N sent" count, with "· N scheduled" appended only when messages are still
 * pending. Copy spelled out (hotelier-readable — "✓ 1 · 3 queued" failed the
 * designer's own read test). Truncates rather than wrapping.
 */
function GjStatusCell({ reservationId }: { reservationId: string }) {
  const status = getGjSummary(reservationId);
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
      ✓ {status.delivered} sent
      {status.scheduled > 0 ? ` · ${status.scheduled} scheduled` : ''}
    </span>
  );
}

/**
 * PrimaryCard — one card holding ALL auto-linked stays. The header carries the
 * current guest name and the thread phone (the card's anchor). Provenance is
 * STRUCTURAL — this card IS the phone-matched group — so the AUTO-LINKED badge is
 * retired; the "how did these link?" explanation lives in the section ⓘ tooltip.
 *
 * v4 disclosure model — "current open, next collapsed, link for the rest":
 *  - stays[0] (the CURRENT in-house stay, pre-sorted first) is expanded by default
 *    via the shared `expandedResId` — a full detail block + nested GJ table.
 *  - stays[1] (the NEXT reservation) is a COLLAPSED row; expanding shows the same
 *    detail-block anatomy.
 *  - everything else (further-future + past) hides behind a "View N more
 *    reservations" text link that reveals them as collapsed rows.
 * All rows share the same anatomy — only their default open/hidden state differs.
 */
function PrimaryCard({
  contactNumber,
  stays,
  expandedResId,
  onToggle,
  onDrillIn,
}: {
  contactNumber: string;
  stays: LinkedReservation[];
  expandedResId: string | null;
  onToggle: (resId: string) => void;
  onDrillIn: (resId: string) => void;
}) {
  // Header name = the most-current stay's guest (stays are pre-sorted).
  const headerName = stays[0]?.guest.name ?? '';

  // Default state grouping is re-derived from reservation.status: current
  // (checked-in) + upcoming (reserved) stays stay visible; PAST (checked-out)
  // stays hide behind the "View N more reservations" link. Stays are pre-sorted
  // (current → upcoming → past), so the visible set is a contiguous prefix.
  const alwaysVisible = stays.filter((lr) => lr.reservation.status !== 'checked-out');
  const rest = stays.filter((lr) => lr.reservation.status === 'checked-out');
  const [showRest, setShowRest] = useState(false);
  const visibleStays = showRest ? [...alwaysVisible, ...rest] : alwaysVisible;

  return (
    <div
      className="rounded-[8px] overflow-hidden"
      style={{ backgroundColor: colors.colorWhite, border: `1px solid ${colors.colorBlack6}` }}
    >
      {/* Card header — guest name, then the anchor phone. Provenance is
          structural (this card is the phone-matched group), so no badge. */}
      <div className="px-4 pt-3 pb-2.5" style={{ borderBottom: `1px solid ${colors.colorBlack6}` }}>
        <div className="flex items-center gap-2 flex-nowrap overflow-hidden">
          <span className="font-['Roboto',sans-serif] font-medium text-[16px] leading-[24px] truncate shrink" style={{ color: colors.colorBlack1 }}>
            {headerName}
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

      {/* Stays — current (open) + next (collapsed) + revealed rest */}
      <div>
        {visibleStays.map((lr, i) => (
          <PrimaryStayRow
            key={lr.reservation.id}
            linkedReservation={lr}
            headerName={headerName}
            isFirst={i === 0}
            isExpanded={expandedResId === lr.reservation.id}
            onToggle={() => onToggle(lr.reservation.id)}
            onDrillIn={onDrillIn}
          />
        ))}
      </div>

      {/* Reveal / hide the remaining reservations in place */}
      {rest.length > 0 && (
        <div className="px-3 py-2.5" style={{ borderTop: `1px solid ${colors.colorBlack6}` }}>
          <button
            onClick={() => setShowRest((v) => !v)}
            className="font-['Roboto',sans-serif] font-medium text-[13px] leading-[18px] cursor-pointer hover:underline"
            style={{ color: colors.colorBlueDark1 }}
          >
            {showRest
              ? 'View fewer'
              : `View ${rest.length} more reservation${rest.length > 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * PrimaryStayRow — one stay row of the primary card's mini-table. The row is an
 * aligned grid: (a) STAY DATES (the disambiguator, 14px Medium) with the guest
 * name stacked beneath ONLY when it differs from the header (shared-phone rule —
 * never collapse differing names); (c) a PMS lifecycle CHIP (RESERVED /
 * CHECKED-IN / CHECKED-OUT) with "RM 504" as its own small text beside it when
 * checked-in; (d) a compact GJ status cell; (e) the expand chevron. A hairline
 * (colorBlack6) top border divides it from the row above. The full-width detail
 * section still expands below the row.
 *
 * Note: the never-collapse name (spec column b) rides in column (a) beneath the
 * dates rather than in a permanent middle column — a dedicated name column would
 * steal fixed width from every row for a field only shared-phone rows use, which
 * would squeeze the dates/GJ columns the reviewer wanted to let breathe. The
 * right-hand columns (chip+room / GJ / chevron) stay perfectly aligned regardless.
 */
function PrimaryStayRow({
  linkedReservation,
  headerName,
  isFirst,
  isExpanded,
  onToggle,
  onDrillIn,
}: {
  linkedReservation: LinkedReservation;
  headerName: string;
  isFirst: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onDrillIn: (resId: string) => void;
}) {
  const { reservation, guest } = linkedReservation;
  const isCheckedIn = reservation.status === 'checked-in';
  const nameDiffers = guest.name !== headerName;

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
              ? formatCompactDateRange(reservation.checkInDate, reservation.checkOutDate)
              : 'No dates'}
          </span>
          {nameDiffers && (
            <span className="block truncate font-['Roboto',sans-serif] text-[12px] leading-[18px] mt-0.5" style={{ color: colors.colorBlack3 }}>
              {guest.name}
            </span>
          )}
        </div>

        {/* (c) Lifecycle chip (+ room as its own text when checked-in) */}
        <div className="flex items-center gap-1.5 min-w-0 pt-[2px]">
          <LifecycleChip status={reservation.status} />
          {isCheckedIn && reservation.room && (
            <span
              className="font-['Roboto',sans-serif] text-[12px] leading-[18px] whitespace-nowrap"
              style={{ color: colors.colorBlack3 }}
            >
              RM {reservation.room}
            </span>
          )}
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
          <ExpandedDetails reservation={reservation} guest={guest} onDrillIn={onDrillIn} />
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
  onDrillIn,
}: {
  linkedReservation: LinkedReservation;
  isExpanded: boolean;
  onToggle: () => void;
  onUnlink?: (reservationId: string) => void;
  onDrillIn: (resId: string) => void;
}) {
  const { reservation, guest } = linkedReservation;
  const isInHouse = reservation.status === 'checked-in';

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
          {/* Guest name + lifecycle chip (same PMS vocabulary as primary rows) */}
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[21px] truncate" style={{ color: colors.colorBlack1 }}>
              {guest.name}
            </span>
            <LifecycleChip status={reservation.status} />
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
                      {formatCompactDateRange(reservation.checkInDate, reservation.checkOutDate)}
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
          <ExpandedDetails reservation={reservation} guest={guest} onDrillIn={onDrillIn} />
        </div>
      )}
    </div>
  );
}
