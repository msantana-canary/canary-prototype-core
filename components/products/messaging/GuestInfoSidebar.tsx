/**
 * GuestInfoSidebar Component — REDESIGN v6: card anatomy corrections
 *
 * Conversation Details is a VERIFICATION AID. Linked Reservations is the star.
 * Grouping rule: group by "same phone as this thread" (the auto-link fact) —
 * NEVER by asserted person identity. Names are never collapsed across stays
 * (Sudarshan's identity constraint).
 *
 * Section order: (1) Linked Reservations, (2) Assignment, (3) Service Tasks,
 * (4) Call History. The standalone Contact Number card is GONE — the phone folds
 * into the card header.
 *
 * v7 — GUEST CARD ANATOMY (primary AND secondary share ONE structure, <GuestCard>):
 *  - CARD HEADER: guest name (15–16px medium, left, truncating) shares its line
 *    with the multi-guest pager, right-aligned (see below); second line = phone
 *    icon + number. Room is NOT in the header — "one fact, one home": the room's
 *    only home is the stay row ("RM {room}"), always visible for the current stay.
 *  - INSET SUB-TABLE ("table IN the card", not table AS the card): a bordered
 *    (colorBlack6) rounded-[8px] container INSET within the card padding, hairline
 *    dividers. Row = [dates (14px medium) + lifecycle chip + "RM {room}" inline
 *    BESIDE the dates, left-aligned flex] · [kebab ⋯] · [expand chevron]. A
 *    differing guest name (Sarah Smith on the shared phone) renders as a second
 *    line under the dates. NO per-row GJ cells — the signal lives in the card
 *    banner now. COLLAPSED BY DEFAULT: only the CURRENT (checked-in) stay + the
 *    SINGLE next upcoming stay show; every remaining stay (further-future + past)
 *    hides behind a "View N more reservations" text link (colorBlueDark1, 13px) as
 *    the sub-table's last row ("View fewer" collapses back). No current stay → the
 *    single visible row is the next upcoming, else the most recent past. Drill-in
 *    still covers ALL stays regardless of collapse state.
 *  - Kebab per row: staff-linked → "Unlink reservation" (wired to unlink flow);
 *    phone-matched (auto) → a DISABLED item whose subtitle carries the production
 *    rationale ("Can't unlink — phone number matches this conversation").
 *  - EXPANDED row detail: the row header stays (dates + chip + RM inline, flex
 *    left-aligned — no fixed grid columns); below it render ONLY the fields that
 *    live nowhere else — email, confirmation code, check-in status, check-out
 *    status. Phone (card header), dates + room (row header) are NOT repeated here.
 *  - CARD-LEVEL GJ BANNER at the card bottom (replaces v5's per-stay banners): a
 *    full-width rounded-[8px] gray-tinted box, "Guest Scheduled Messages" + chevron.
 *    FAILURE variant when ANY of the card's reservations has failed messages: red
 *    tint + alert icon + "N message(s) failed to send" in colorRed1. Tap → drill-in.
 *
 * DRILL-IN is GUEST-level (the tapped card's guest): the Scheduled Messages detail
 * shows ALL that guest's reservations, SECTIONED per reservation (section header =
 * compact date range + lifecycle chip in a small-caps caption register), sections
 * in stay-sort order. Failed rows keep production's Twilio error register (code +
 * curated line + Learn more). Subtitle under the title = the guest name.
 *
 * Panel mechanic — FLOATING PANEL, now the shared `<FloatingPanel>` shell (a
 * fixed 600px white card inset top 72 / right 16 / bottom 16, floating below the
 * 56px legacy shell header, large soft shadow, scrim-to-close, 240ms slide+fade,
 * reduced-motion aware). The shell was extracted verbatim from this component so
 * the broadcast delivery panel could reuse it; behaviour here is unchanged.
 * Inside the shell this panel navigates WITHIN ITSELF (translate-x track) into
 * the drill-in detail — a platform primitive (future home for AI explanations).
 *
 * Linked Reservations is a one-guest-per-slide pager: slide 0 = the primary
 * phone-grouped card, slides 1+ = each staff-linked guest. The pager ("‹ 👥 N ›",
 * the Check-in idiom) now lives INSIDE the active card's header, right-aligned on
 * the guest-name line (single-guest threads show no pager); when an OFF-SCREEN
 * guest card has a failed GJ message a small red dot appears at the pager count-
 * chip's corner (the hidden-failure signal — the chip itself stays neutral).
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FloatingPanel } from './FloatingPanel';
import { LinkedReservation } from '@/lib/products/messaging/types';
import { gjMessages, getGjSummary } from '@/lib/products/messaging/mock-data';
import { Reservation } from '@/lib/core/types/reservation';
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
  mdiLinkVariant,
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
 * order (current first, then future, then past). Not a display label; lifecycle
 * is shown via <LifecycleChip> (PMS vocabulary).
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

/** A drilled-in card: the guest name that headers the card + its reservations. */
interface DrillTarget {
  guestName: string;
  stays: LinkedReservation[];
}

/**
 * GuestPager — the multi-guest carousel control ("‹ 👥 N ›", Check-in's idiom),
 * now living INSIDE the card header (right-aligned beside the guest name) instead
 * of a floating row above the card. Arrows disable at the ends. When an OFF-SCREEN
 * guest card has a failed GJ message a small red dot pins to the count chip's
 * top-right corner (the hidden-failure signal — the chip stays neutral otherwise);
 * `hiddenFailure` is computed by the parent across all NON-visible slides. The
 * parent only renders this when there is more than one guest card.
 */
function GuestPager({
  index,
  total,
  hiddenFailure,
  onPrev,
  onNext,
}: {
  index: number;
  total: number;
  hiddenFailure: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center gap-1" style={{ height: 28 }}>
      <button
        onClick={onPrev}
        disabled={index === 0}
        aria-label="Previous guest"
        className="w-[28px] h-[28px] flex items-center justify-center rounded-full transition-colors disabled:opacity-30 disabled:cursor-default enabled:hover:bg-[#f0f0f0]"
      >
        <Icon path={mdiChevronLeft} size={0.83} color={colors.colorBlack1} />
      </button>

      <span
        className="relative inline-flex items-center gap-1 px-2 rounded-full"
        style={{
          height: 24,
          backgroundColor: colors.colorBlack7,
        }}
      >
        <Icon path={mdiAccountMultipleOutline} size={0.6} color={colors.colorBlack2} />
        <span
          className="font-['Roboto',sans-serif] font-medium text-[13px] leading-[18px]"
          style={{ color: colors.colorBlack2 }}
        >
          {total}
        </span>
        {/* Hidden-failure signal — a small red dot pinned just outside the chip's
            top-right corner (absolute, so it never shifts layout), with a subtle
            white ring for separation. Neutral chip stays neutral. */}
        {hiddenFailure && (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 7,
              height: 7,
              borderRadius: 9999,
              backgroundColor: GJ_FAIL_RED,
              boxShadow: `0 0 0 1.5px ${colors.colorWhite}`,
            }}
          />
        )}
      </span>

      <button
        onClick={onNext}
        disabled={index === total - 1}
        aria-label="Next guest"
        className="w-[28px] h-[28px] flex items-center justify-center rounded-full transition-colors disabled:opacity-30 disabled:cursor-default enabled:hover:bg-[#f0f0f0]"
      >
        <Icon path={mdiChevronRight} size={0.83} color={colors.colorBlack1} />
      </button>
    </div>
  );
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
  // Drill-in: the GUEST-level Scheduled Messages detail for a tapped card.
  // `null` = main panel; a DrillTarget = the panel has navigated into itself.
  const [drillTarget, setDrillTarget] = useState<DrillTarget | null>(null);
  // Hold the last drilled card so the drill pane keeps its content while sliding
  // back out (drillTarget goes null the instant Back is pressed).
  const lastDrillRef = useRef<DrillTarget | null>(null);
  if (drillTarget) lastDrillRef.current = drillTarget;
  const activeDrill = drillTarget ?? lastDrillRef.current;

  // The floating-panel mechanic (mount/enter phases, scrim, slide, reduced
  // motion) now lives in the shared <FloatingPanel> shell.
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

  const cardFailed = (stays: LinkedReservation[]) =>
    stays.reduce((sum, lr) => sum + (getGjSummary(lr.reservation.id)?.failed ?? 0), 0);

  // v4 default: the CURRENT (in-house) auto-linked stay opens expanded.
  const defaultExpandedResId =
    autoLinked.find((lr) => deriveStayState(lr.reservation) === 'in-house')?.reservation.id ??
    autoLinked[0]?.reservation.id ??
    null;

  // Pager slides: slide 0 = the primary phone-grouped card (all auto-linked
  // stays); slides 1+ = each staff-linked guest card. `hasFailure` lets a HIDDEN
  // slide surface a corner dot on the pager chip so a failed GJ message stays loud
  // off-screen. `isPrimary` marks the phone-matched card — only it shows the
  // auto-link 🔗 provenance icon beside the phone. Slides carry card DATA (not
  // pre-built nodes) — only the active card renders, and it receives the pager as
  // a header slot (see below).
  const slides: { key: string; hasFailure: boolean; isPrimary: boolean; headerName: string; headerPhone: string; stays: LinkedReservation[] }[] = [];
  if (autoLinked.length > 0) {
    slides.push({
      key: 'primary',
      hasFailure: cardFailed(autoLinked) > 0,
      isPrimary: true,
      headerName: autoLinked[0]?.guest.name ?? '',
      headerPhone: contactNumber,
      stays: autoLinked,
    });
  }
  manualLinked.forEach((lr) => {
    slides.push({
      key: lr.reservation.id,
      hasFailure: cardFailed([lr]) > 0,
      isPrimary: false,
      headerName: lr.guest.name,
      headerPhone: lr.guest.phone || '',
      stays: [lr],
    });
  });

  // Reset to the first slide whenever the set of linked reservations changes
  // (i.e. the user switched threads).
  const slideKey = slides.map((s) => s.key).join('|');
  useEffect(() => {
    setActiveSlide(0);
    setExpandedResId(defaultExpandedResId);
    setDrillTarget(null);
  }, [slideKey, defaultExpandedResId]);

  const activeIndex = Math.min(activeSlide, Math.max(0, slides.length - 1));
  // Any OFF-SCREEN guest card with a failed GJ message → a small red dot appears
  // at the pager count-chip's corner (the hidden-failure signal).
  const hiddenFailure = slides.some((s, i) => i !== activeIndex && s.hasFailure);

  return (
    <FloatingPanel isOpen={isOpen} onClose={onClose} width={600}>
        {/* Internal-navigation track: MAIN state ↔ GUEST-level DRILL-IN detail. */}
        <div
          className="flex h-full transition-transform duration-[250ms] ease-in-out"
          style={{ transform: drillTarget ? 'translateX(-100%)' : 'translateX(0)' }}
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
              {/* Provenance is structural + the link icon beside the phone in the
                  PRIMARY (phone-matched) card header — no section-header ⓘ, no
                  AUTO-LINKED badge. One provenance channel, not two. */}
              <div className="flex items-center gap-1.5">
                <h3 className="font-['Roboto',sans-serif] font-medium text-[16px] leading-[24px]" style={{ color: colors.colorBlack1 }}>
                  Linked Reservations
                </h3>
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
              /* Active guest card (one slide at a time). The pager now lives IN
                 the card header (right of the name), rendered only when the thread
                 has more than one guest. */
              <div>
                {slides[activeIndex] && (
                  <GuestCard
                    headerName={slides[activeIndex].headerName}
                    headerPhone={slides[activeIndex].headerPhone}
                    isPrimary={slides[activeIndex].isPrimary}
                    stays={slides[activeIndex].stays}
                    expandedResId={expandedResId}
                    onToggle={toggleExpand}
                    onDrillIn={setDrillTarget}
                    onUnlink={onUnlinkReservation}
                    pager={
                      slides.length > 1 ? (
                        <GuestPager
                          index={activeIndex}
                          total={slides.length}
                          hiddenFailure={hiddenFailure}
                          onPrev={() => setActiveSlide(activeIndex - 1)}
                          onNext={() => setActiveSlide(activeIndex + 1)}
                        />
                      ) : null
                    }
                  />
                )}
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
        {/* DRILL-IN PANE — GUEST-level Scheduled Messages detail */}
        <div className="w-full h-full shrink-0 overflow-y-auto scrollbar-invisible">
          <div className="p-6">
            {activeDrill && (
              <DrillInView
                guestName={activeDrill.guestName}
                stays={activeDrill.stays}
                onBack={() => setDrillTarget(null)}
              />
            )}
          </div>
        </div>
        </div>
    </FloatingPanel>
  );
}

/** Loud-red for failed anything; matches colorRed1 (#E40046). */
const GJ_FAIL_RED = '#E40046';

/** Human channel label for the error register's overline (production register). */
const CHANNEL_LABEL: Record<'email' | 'sms' | 'whatsapp' | 'booking' | 'expedia', string> = {
  email: 'Email',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  booking: 'Booking.com',
  expedia: 'Expedia',
};

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
 * GjMessagesTable — a reservation's guest-journey message log, rendered inside a
 * drill-in section. A rounded-8, colorBlack6-bordered container of hairline-divided
 * rows. Each row = one GJ message: title (left) + right-aligned timestamp caption,
 * with a row of channel icons beneath. Any failed channel turns that row's caption
 * red + adds an alert icon, and appends production's error register.
 */
function GjMessagesTable({ reservationId }: { reservationId: string }) {
  const msgs = gjMessages[reservationId];
  if (!msgs || msgs.length === 0) {
    return (
      <div className="rounded-[8px] px-3 py-4 text-center" style={{ border: `1px solid ${colors.colorBlack6}` }}>
        <span className="font-['Roboto',sans-serif] text-[13px] leading-[18px]" style={{ color: colors.colorBlack3 }}>
          No scheduled messages
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-[8px] overflow-hidden" style={{ border: `1px solid ${colors.colorBlack6}` }}>
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
                messaging failure copy: a small gray channel overline, then ONE red
                sentence "Error {code}: {curated note}" where ONLY the carrier code
                is underlined (the Twilio-docs link). No tint, no separate Learn-more. */}
            {m.channels
              .filter((c) => c.status === 'failed' && c.errorCode)
              .map((c, j) => (
                <div key={`err-${j}`} className="mt-2">
                  <span
                    className="block font-['Roboto',sans-serif] text-[12px] leading-[16px]"
                    style={{ color: colors.colorBlack3 }}
                  >
                    {CHANNEL_LABEL[c.type]}
                  </span>
                  <p
                    className="font-['Roboto',sans-serif] text-[13px] leading-[18px] mt-0.5"
                    style={{ color: colors.colorRed1 }}
                  >
                    Error{' '}
                    <span role="link" tabIndex={0} className="underline cursor-pointer">
                      {c.errorCode}
                    </span>
                    : {c.errorNote}
                  </p>
                </div>
              ))}
          </div>
        );
      })}
    </div>
  );
}

/**
 * ExpandedRowDetail — production's COMPLETE reservation-details block for one
 * reservation, rendered below the row header when a stay row is expanded. This is
 * the familiar full record (phone, email, dates, room, confirmation, check-in/out
 * status) — the dates + room deliberately echo the row header one line above; the
 * expanded block is intentionally the whole anatomy, not a de-duped subset. No GJ
 * table here — GJ monitoring is card-level (the banner + drill-in).
 */
function ExpandedRowDetail({ reservation, phone, email }: { reservation: Reservation; phone?: string; email?: string }) {
  return (
    <div className="pt-2 space-y-2.5">
      {/* Phone */}
      <div className="flex items-center gap-3">
        <Icon path={mdiPhoneOutline} size={0.67} color={colors.colorBlack1} />
        <span className="font-['Roboto',sans-serif] text-[12px] leading-[18px]" style={{ color: colors.colorBlack1 }}>
          {phone || 'No number assigned'}
        </span>
      </div>

      {/* Email */}
      <div className="flex items-center gap-3">
        <Icon path={mdiEmailOutline} size={0.67} color={colors.colorBlack1} />
        <span className="font-['Roboto',sans-serif] text-[12px] leading-[18px]" style={{ color: colors.colorBlack1 }}>
          {email || 'No email assigned'}
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
    </div>
  );
}

/**
 * StayRowKebab — the per-row ⋯ menu. For a staff-linked reservation it offers
 * "Unlink reservation" (wired to the existing unlink flow). For a phone-matched
 * (auto-linked) reservation the item renders DISABLED, carrying the production
 * rationale as its subtitle — a fact can't be unlinked.
 */
function StayRowKebab({ reservation, isAutoLinked, onUnlink }: { reservation: Reservation; isAutoLinked: boolean; onUnlink?: (reservationId: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        btnRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !btnRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        aria-label="Reservation actions"
        className="w-[28px] h-[28px] flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((v) => !v);
        }}
      >
        <Icon path={mdiDotsHorizontal} size={0.67} color={colors.colorBlack3} />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
          style={{ width: 232 }}
          onClick={(e) => e.stopPropagation()}
        >
          {isAutoLinked ? (
            <div className="px-4 py-2 cursor-not-allowed" style={{ opacity: 0.6 }}>
              <p className="font-['Roboto',sans-serif] text-sm" style={{ color: colors.colorBlack3 }}>
                Unlink reservation
              </p>
              <p className="font-['Roboto',sans-serif] text-[11px] leading-[15px] mt-0.5" style={{ color: colors.colorBlack4 }}>
                Can&apos;t unlink — phone number matches this conversation
              </p>
            </div>
          ) : (
            <button
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
              style={{ color: colors.colorRed1 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onUnlink?.(reservation.id);
              }}
            >
              Unlink reservation
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * StayRow — one row of a card's inset sub-table. The row header (dates + lifecycle
 * chip + "RM {room}" inline, left-aligned flex; differing guest name stacked
 * beneath) stays rendered whether collapsed or expanded — expanding just appends
 * the detail fields below it. Right side = per-row kebab + expand chevron.
 */
function StayRow({
  linkedReservation,
  headerName,
  isFirst,
  isExpanded,
  onToggle,
  onUnlink,
}: {
  linkedReservation: LinkedReservation;
  headerName: string;
  isFirst: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onUnlink?: (reservationId: string) => void;
}) {
  const { reservation, guest, isAutoLinked } = linkedReservation;
  const nameDiffers = guest.name !== headerName;

  return (
    <div style={isFirst ? undefined : { borderTop: `1px solid ${colors.colorBlack6}` }}>
      {/* Row header (clickable). The FIRST line (dates + chip + RM) shares one
          vertically-centered row with the kebab + chevron controls; a differing
          guest name drops to a second line BELOW, so the controls stay centered on
          the first line rather than on the two-line block. */}
      <div className="px-3 py-3 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
            <span className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[21px]" style={{ color: colors.colorBlack1 }}>
              {reservation.checkInDate && reservation.checkOutDate
                ? formatCompactDateRange(reservation.checkInDate, reservation.checkOutDate)
                : 'No dates'}
            </span>
            <LifecycleChip status={reservation.status} />
            {reservation.room && (
              <span
                className="font-['Roboto',sans-serif] text-[12px] leading-[18px] whitespace-nowrap"
                style={{ color: colors.colorBlack3 }}
              >
                RM {reservation.room}
              </span>
            )}
          </div>

          {/* Right side: kebab + chevron — centered on the first line */}
          <div className="flex items-center gap-0.5 shrink-0">
            <StayRowKebab reservation={reservation} isAutoLinked={isAutoLinked} onUnlink={onUnlink} />
            <div className="w-[28px] h-[28px] flex items-center justify-center">
              <Icon path={isExpanded ? mdiChevronUp : mdiChevronDown} size={0.67} color={colors.colorBlack3} />
            </div>
          </div>
        </div>

        {nameDiffers && (
          <span className="block truncate font-['Roboto',sans-serif] text-[12px] leading-[18px] mt-0.5" style={{ color: colors.colorBlack3 }}>
            {guest.name}
          </span>
        )}
      </div>

      {/* Expanded detail fields */}
      {isExpanded && (
        <div className="px-3 pb-3">
          <ExpandedRowDetail reservation={reservation} phone={guest.phone} email={guest.email} />
        </div>
      )}
    </div>
  );
}

/**
 * GuestCardBanner — the CARD-LEVEL guest-journey banner at the card bottom. A
 * full-width rounded-8 gray-tinted box: "Guest Scheduled Messages" + chevron-right.
 * FAILURE variant when ANY of the card's reservations has failed messages: red
 * tint + alert icon + "N message(s) failed to send" in colorRed1. Tap → drill-in.
 */
function GuestCardBanner({ failedCount, onClick }: { failedCount: number; onClick: () => void }) {
  const failed = failedCount > 0;
  const [isHovered, setIsHovered] = useState(false);
  const backgroundColor = failed
    ? isHovered ? 'rgba(228,0,70,0.10)' : 'rgba(228,0,70,0.06)'
    : isHovered ? '#e9eaec' : '#f4f5f6';
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full flex items-center gap-2 mt-3 rounded-[8px] transition-colors text-left"
      style={{
        padding: '10px 12px',
        backgroundColor,
        transitionDuration: '150ms',
      }}
    >
      {failed ? (
        <>
          <Icon path={mdiAlertCircleOutline} size={0.7} color={colors.colorRed1} />
          <span className="flex-1 font-['Roboto',sans-serif] font-medium text-[14px] leading-[20px]" style={{ color: colors.colorRed1 }}>
            {failedCount} message{failedCount > 1 ? 's' : ''} failed to send
          </span>
          <Icon path={mdiChevronRight} size={0.75} color={colors.colorRed1} />
        </>
      ) : (
        <>
          <span className="flex-1 font-['Roboto',sans-serif] font-medium text-[14px] leading-[20px]" style={{ color: colors.colorBlack1 }}>
            Guest Scheduled Messages
          </span>
          <Icon path={mdiChevronRight} size={0.75} color={colors.colorBlack2} />
        </>
      )}
    </button>
  );
}

/**
 * Default-visible stays for a card's inset sub-table. The sub-table doesn't list
 * every stay flat — by default it shows only (1) the CURRENT (checked-in) stay(s)
 * and (2) the SINGLE next upcoming stay; every remaining stay (further-future +
 * past) hides behind a "View N more reservations" link. When the guest has NO
 * current stay, the single visible row is the next upcoming — or, if none is
 * upcoming, the most recent past stay. `stays` arrives pre-sorted (current →
 * upcoming soonest-first → past most-recent-first), so the slices stay in order.
 */
function defaultVisibleStays(stays: LinkedReservation[]): LinkedReservation[] {
  const inHouse = stays.filter((lr) => deriveStayState(lr.reservation) === 'in-house');
  const upcoming = stays.filter((lr) => deriveStayState(lr.reservation) === 'upcoming');
  const past = stays.filter((lr) => deriveStayState(lr.reservation) === 'past');
  if (inHouse.length > 0) return [...inHouse, ...upcoming.slice(0, 1)];
  if (upcoming.length > 0) return upcoming.slice(0, 1);
  return past.slice(0, 1);
}

/**
 * GuestCard — ONE anatomy for both the primary phone-grouped card and each
 * staff-linked card. Header (name + the multi-guest pager right-aligned on the
 * same line, then phone below — room is NOT here; its only home is the stay row),
 * an inset sub-table of stay rows, and a card-level GJ banner. Provenance is
 * structural (primary = the phone-matched group) + per-row kebab rules (auto rows
 * hard-block unlink) + the auto-link 🔗 icon beside the phone on the PRIMARY card
 * ONLY (production's own vocabulary; carries the auto-link explanation as its
 * tooltip). `pager` is the parent's guest carousel control, injected into the
 * header; it's null for single-guest threads (no pager rendered).
 */
function GuestCard({
  headerName,
  headerPhone,
  isPrimary,
  stays,
  expandedResId,
  onToggle,
  onDrillIn,
  onUnlink,
  pager,
}: {
  headerName: string;
  headerPhone: string;
  isPrimary?: boolean;
  stays: LinkedReservation[];
  expandedResId: string | null;
  onToggle: (resId: string) => void;
  onDrillIn: (target: DrillTarget) => void;
  onUnlink?: (reservationId: string) => void;
  pager?: React.ReactNode;
}) {
  const failedCount = stays.reduce((sum, lr) => sum + (getGjSummary(lr.reservation.id)?.failed ?? 0), 0);

  // Collapse: default shows current + single-next-upcoming; the rest (further-
  // future + past) hide behind a "View N more reservations" row. Drill-in still
  // covers ALL stays regardless of this collapse state.
  const [showAll, setShowAll] = useState(false);
  const defaultVisible = defaultVisibleStays(stays);
  const hiddenCount = stays.length - defaultVisible.length;
  const rows = showAll ? stays : defaultVisible;
  // Reset the collapse whenever the stay set changes (thread / pager switch).
  const staysKey = stays.map((lr) => lr.reservation.id).join('|');
  useEffect(() => {
    setShowAll(false);
  }, [staysKey]);

  return (
    <div
      className="rounded-[8px]"
      style={{ backgroundColor: colors.colorWhite, border: `1px solid ${colors.colorBlack6}` }}
    >
      {/* Card header — name (left, truncating) + the guest pager (right, when the
          thread has more than one guest) share one line; phone drops below. Room
          is intentionally absent — its only home is the stay row. */}
      <div className="px-4 pt-3 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex-1 min-w-0 truncate font-['Roboto',sans-serif] font-medium text-[16px] leading-[24px]" style={{ color: colors.colorBlack1 }}>
            {headerName}
          </span>
          {pager && <div className="shrink-0">{pager}</div>}
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <Icon path={mdiPhoneOutline} size={0.6} color={colors.colorBlack2} />
          <span className="font-['Roboto',sans-serif] text-[14px] leading-[21px]" style={{ color: colors.colorBlack2 }}>
            {headerPhone || 'No number'}
          </span>
          {/* Auto-link provenance — PRIMARY (phone-matched) card only; never on
              staff-linked cards. Carries production's verbatim explanation copy. */}
          {isPrimary && (
            <span
              className="flex items-center cursor-help"
              title="Reservations link automatically when the guest's phone number in your PMS matches this conversation. If it's missing, check the phone number in your PMS, or search & link a reservation manually here."
            >
              <Icon path={mdiLinkVariant} size={0.55} color={colors.colorBlack3} />
            </span>
          )}
        </div>
      </div>

      {/* Card body: inset sub-table + card-level GJ banner */}
      <div className="px-4 pb-4">
        {/* INSET SUB-TABLE — a table IN the card */}
        <div className="rounded-[8px] overflow-hidden" style={{ border: `1px solid ${colors.colorBlack6}` }}>
          {rows.map((lr, i) => (
            <StayRow
              key={lr.reservation.id}
              linkedReservation={lr}
              headerName={headerName}
              isFirst={i === 0}
              isExpanded={expandedResId === lr.reservation.id}
              onToggle={() => onToggle(lr.reservation.id)}
              onUnlink={onUnlink}
            />
          ))}

          {/* Collapse toggle — last row of the sub-table when stays are hidden. */}
          {hiddenCount > 0 && (
            <div style={{ borderTop: `1px solid ${colors.colorBlack6}` }}>
              <button
                onClick={() => setShowAll((v) => !v)}
                className="w-full text-left px-3 py-2.5 transition-colors hover:bg-[#f7f8f9]"
              >
                <span
                  className="font-['Roboto',sans-serif] font-medium text-[13px] leading-[18px]"
                  style={{ color: colors.colorBlueDark1 }}
                >
                  {showAll
                    ? 'View fewer'
                    : `View ${hiddenCount} more reservation${hiddenCount > 1 ? 's' : ''}`}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* CARD-LEVEL GJ BANNER */}
        <GuestCardBanner
          failedCount={failedCount}
          onClick={() => onDrillIn({ guestName: headerName, stays })}
        />
      </div>
    </div>
  );
}

/**
 * DrillInView — the internal-navigation, GUEST-level Scheduled Messages detail.
 * Back arrow returns to the main panel (state preserved). The view shows ALL the
 * tapped card's reservations, SECTIONED per reservation (section header = compact
 * date range + lifecycle chip, small-caps caption register), in stay-sort order.
 * Failed rows carry production's error register (carrier code + curated line).
 */
function DrillInView({ guestName, stays, onBack }: { guestName: string; stays: LinkedReservation[]; onBack: () => void }) {
  const sorted = sortStays(stays);
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
            {guestName}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {sorted.map((lr) => (
          <div key={lr.reservation.id}>
            {/* Section header — small-caps caption: date range + lifecycle chip */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className="font-['Roboto',sans-serif] font-medium uppercase"
                style={{ fontSize: 11, letterSpacing: '0.4px', color: colors.colorBlack3 }}
              >
                {lr.reservation.checkInDate && lr.reservation.checkOutDate
                  ? formatCompactDateRange(lr.reservation.checkInDate, lr.reservation.checkOutDate)
                  : 'No dates'}
              </span>
              <LifecycleChip status={lr.reservation.status} />
            </div>
            <GjMessagesTable reservationId={lr.reservation.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
