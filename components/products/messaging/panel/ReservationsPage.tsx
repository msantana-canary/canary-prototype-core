/**
 * ReservationsPage — the primary guest's own stays, as an accordion.
 *
 * Reached from the "{First}'s Reservations → N" control card. This is the
 * guest-profile-first move in one screen: a person is not one reservation, she
 * is a history of them, and the panel's job is to let a hotelier find the right
 * one fast. Header rows are date-range-first (the disambiguator) with the
 * lifecycle tag beside it; the record only unfolds for the stay you ask about.
 *
 * A stay with a failed guest-journey send carries a RED outlined alert glyph on
 * its COLLAPSED header, so the failure is visible without opening anything. It
 * is the outline rather than the filled disc: red is already doing the alarm,
 * and a solid dot at that size reads as a status the row owns rather than a
 * flag raised on it — outline is also the house icon register. Inside,
 * the "Guest Scheduled Messages" row is the entry to that stay's timeline.
 *
 * The spotlight stay opens first — you almost always came here about the stay
 * you were already looking at.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * THE EXPANDER IS `CanaryExpand`
 * ═══════════════════════════════════════════════════════════════════════════
 * Its shape is exactly this one: a controlled `isExpanded` / `onToggle` pair, a
 * header ReactNode slot, and a body that mounts beneath it — Enter and Space
 * included. What it dresses that shape for is a settings list, so the whole
 * delta rides `.panel-accordion` in globals.css, deliberately as ONE class: it
 * kills the inline hairline under the header, re-pads the header from the
 * library's `py-3 px-2` to the frame's 6px/4px, zeroes the body's padding,
 * restores the hover wash, and HIDES the library's own 16px stroked chevron so
 * the header can carry the frame's filled mdi one at its own size. When the
 * library grows class hooks or a borderless variant, that block is the whole
 * thing to delete.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * IT EASES, IT DOESN'T SNAP
 * ═══════════════════════════════════════════════════════════════════════════
 * `CanaryExpand` mounts and unmounts its body outright, so on its own this
 * accordion popped open and vanished shut while the companion rows two tabs
 * over eased. Same fix, same primitives, same 220/160 pair as everything else
 * on the surface: `useMountedThrough` keeps the record alive through its close,
 * `ExpandRegion` animates the height, and `prefers-reduced-motion` still gets
 * an instant open. The stay's 8px card gap moved INSIDE that region — it has to
 * shrink with the record or a closing stay leaves a band of empty space behind.
 * One stay open at a time is untouched: `expandedId` is still a single value.
 *
 * ⚠ ONE ARIA REGRESSION, reported rather than papered over: `CanaryExpand`'s
 * header is a `div[role="button"]` and it sets NO `aria-expanded` — the
 * `<button aria-expanded>` this replaces did. Nothing outside the component can
 * add it, so a screen reader no longer hears whether a stay is open. Logged as
 * the library ask alongside the class hooks.
 */

'use client';

import React, { useState } from 'react';
import { CanaryExpand, colors } from '@canary-ui/components';
import Icon from '@mdi/react';
import {
  mdiAlertCircleOutline,
  mdiCalendarBlankOutline,
  mdiChevronDown,
  mdiChevronUp,
} from '@mdi/js';
import {
  EmptyState,
  ExpandRegion,
  LifecycleTag,
  PanelPage,
  useMountedThrough,
} from './panel-ui';
import { formatStayRangeLong } from './panel-format';
import { ReservationRecord } from './ReservationRecord';
import { getGjSummary } from '@/lib/products/messaging/guest-journey-link';
import { LinkedReservation } from '@/lib/products/messaging/types';

export function ReservationsPage({
  stays,
  initialExpandedId,
  onBack,
  onClose,
  onOpenScheduledMessages,
}: {
  stays: LinkedReservation[];
  initialExpandedId?: string;
  onBack: () => void;
  onClose: () => void;
  onOpenScheduledMessages: (reservationId: string) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(
    initialExpandedId ?? stays[0]?.reservation.id ?? null
  );

  /**
   * THE ARRIVAL DOES NOT ANIMATE, only the toggles do.
   *
   * The spotlight stay is open the moment this page mounts, and growing it open
   * while the pane is still sliding in reads as the page settling rather than as
   * an answer to anything — nobody asked for it to open, it was already open.
   * The other accordion on this surface never has the problem because companion
   * rows start closed.
   *
   * `animateOnMount` is read once, when a region first mounts, so flipping this
   * after the first click leaves the already-open region alone and applies to
   * every body that mounts from then on — which is exactly the set the user
   * asked for.
   */
  const [hasToggled, setHasToggled] = useState(false);

  return (
    <PanelPage title="Reservations" onBack={onBack} onClose={onClose}>
      {stays.length === 0 ? (
        <EmptyState label="No reservations" />
      ) : (
        <div className="flex flex-col" style={{ gap: 8 }}>
          {stays.map((lr) => (
            <StayAccordion
              key={lr.reservation.id}
              lr={lr}
              isExpanded={expandedId === lr.reservation.id}
              animateOnMount={hasToggled}
              onToggle={() => {
                setHasToggled(true);
                setExpandedId((id) => (id === lr.reservation.id ? null : lr.reservation.id));
              }}
              onOpenScheduledMessages={() => onOpenScheduledMessages(lr.reservation.id)}
            />
          ))}
        </div>
      )}
    </PanelPage>
  );
}

/**
 * One stay, collapsed or open.
 *
 * It is a component rather than an inline map body because the smooth-height
 * expand needs a HOOK per row (`useMountedThrough`), and hooks cannot live in a
 * loop. Same shape as `CompanionRow` in `PanelTabs` — deliberately, since the
 * panel has ONE expand register and these are its two users.
 */
function StayAccordion({
  lr,
  isExpanded,
  animateOnMount,
  onToggle,
  onOpenScheduledMessages,
}: {
  lr: LinkedReservation;
  isExpanded: boolean;
  animateOnMount: boolean;
  onToggle: () => void;
  onOpenScheduledMessages: () => void;
}) {
  const hasFailure = getGjSummary(lr.reservation.id).failed > 0;

  /* `CanaryExpand` renders its body under `isExpanded &&`, so handing it the raw
     flag deletes the record on the first frame of the close and leaves nothing
     to animate out. `useMountedThrough` keeps it alive for the 160ms it is still
     on screen; `ExpandRegion` inside does the actual height easing. Toggling
     from one stay to another still closes the other — `expandedId` is a single
     value and this only affects how long the outgoing body lingers. */
  const isBodyMounted = useMountedThrough(isExpanded);

  return (
    <CanaryExpand
      className="panel-accordion"
      isExpanded={isBodyMounted}
      onToggle={onToggle}
      header={
        <div className="flex items-center gap-2">
          <Icon path={mdiCalendarBlankOutline} size={0.86} color={colors.colorBlack1} />
          <span
            className="font-['Roboto',sans-serif] font-medium text-[16px] leading-[24px]"
            style={{ color: colors.colorBlack1 }}
          >
            {formatStayRangeLong(lr.reservation.checkInDate, lr.reservation.checkOutDate)}
          </span>
          {/* The drill-in draws lifecycle in sentence case — it sits beside a
              16px date line here, not inside a dense row, and an all-caps chip
              at that scale shouts over the date. */}
          <LifecycleTag status={lr.reservation.status} uppercase={false} />
          {hasFailure && (
            <span
              className="flex items-center shrink-0"
              title="A scheduled message failed to send on this stay"
            >
              {/* OUTLINE, not the filled disc. Red already carries the alarm;
                  a solid red dot beside a date line reads as a status BADGE
                  the row owns, where the outline reads as a flag ON it. It
                  also puts this glyph in the same register as every other
                  icon on the surface (outline is the house rule). */}
              <Icon path={mdiAlertCircleOutline} size={0.75} color={colors.colorRed1} />
            </span>
          )}
          {/* The frame's chevron, inside the header slot after a spacer,
              because `.panel-accordion` hides the library's own — a 16px
              stroked glyph is a different drawing from the filled mdi one,
              not just a smaller size. */}
          <span className="flex-1" />
          <Icon
            path={isExpanded ? mdiChevronUp : mdiChevronDown}
            size={0.8}
            color={colors.colorBlack1}
          />
        </div>
      }
    >
      {/* The 8px gap under the header lives INSIDE the animated region, not on
          the body wrapper: padding out there does not collapse with the content
          and would leave a band of empty card behind a closing accordion. */}
      <ExpandRegion isOpen={isExpanded} animateOnMount={animateOnMount}>
        <div
          className="rounded-[8px]"
          style={{
            marginTop: 8,
            border: `1px solid ${colors.colorBlack6}`,
            padding: 16,
          }}
        >
          <ReservationRecord
            reservation={lr.reservation}
            guest={lr.guest}
            onOpenScheduledMessages={onOpenScheduledMessages}
          />
        </div>
      </ExpandRegion>
    </CanaryExpand>
  );
}
