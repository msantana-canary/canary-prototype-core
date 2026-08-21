/**
 * ReservationsPage — the primary guest's own stays, as an accordion.
 *
 * Reached from the "{First}'s Reservations → N" control card. This is the
 * guest-profile-first move in one screen: a person is not one reservation, she
 * is a history of them, and the panel's job is to let a hotelier find the right
 * one fast. Header rows are date-range-first (the disambiguator) with the
 * lifecycle tag beside it; the record only unfolds for the stay you ask about.
 *
 * A stay with a failed guest-journey send carries a RED alert dot on its
 * COLLAPSED header, so the failure is visible without opening anything. Inside,
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
 * kills the inline hairline under the header, re-pads both halves from the
 * library's `py-3 px-2` to the frame's 6px/4px header and 8px body gap,
 * restores the hover wash, and HIDES the library's own 16px stroked chevron so
 * the header can carry the frame's filled mdi one at its own size. When the
 * library grows class hooks or a borderless variant, that block is the whole
 * thing to delete.
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
  mdiAlertCircle,
  mdiCalendarBlankOutline,
  mdiChevronDown,
  mdiChevronUp,
} from '@mdi/js';
import { EmptyState, LifecycleTag, PanelPage } from './panel-ui';
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

  return (
    <PanelPage title="Reservations" onBack={onBack} onClose={onClose}>
      {stays.length === 0 ? (
        <EmptyState label="No reservations" />
      ) : (
        <div className="flex flex-col" style={{ gap: 8 }}>
          {stays.map((lr) => {
            const isExpanded = expandedId === lr.reservation.id;
            const hasFailure = getGjSummary(lr.reservation.id).failed > 0;
            return (
              <CanaryExpand
                key={lr.reservation.id}
                className="panel-accordion"
                isExpanded={isExpanded}
                onToggle={() => setExpandedId(isExpanded ? null : lr.reservation.id)}
                header={
                  <div className="flex items-center gap-2">
                    <Icon path={mdiCalendarBlankOutline} size={0.86} color={colors.colorBlack1} />
                    <span
                      className="font-['Roboto',sans-serif] font-medium text-[16px] leading-[24px]"
                      style={{ color: colors.colorBlack1 }}
                    >
                      {formatStayRangeLong(lr.reservation.checkInDate, lr.reservation.checkOutDate)}
                    </span>
                    {/* The drill-in draws lifecycle in sentence case — it sits
                        beside a 16px date line here, not inside a dense row, and
                        an all-caps chip at that scale shouts over the date. */}
                    <LifecycleTag status={lr.reservation.status} uppercase={false} />
                    {hasFailure && (
                      <span
                        className="flex items-center shrink-0"
                        title="A scheduled message failed to send on this stay"
                      >
                        <Icon path={mdiAlertCircle} size={0.75} color={colors.colorRed1} />
                      </span>
                    )}
                    {/* The frame's chevron, inside the header slot after a
                        spacer, because `.panel-accordion` hides the library's
                        own — a 16px stroked glyph is a different drawing from
                        the filled mdi one, not just a smaller size. */}
                    <span className="flex-1" />
                    <Icon
                      path={isExpanded ? mdiChevronUp : mdiChevronDown}
                      size={0.8}
                      color={colors.colorBlack1}
                    />
                  </div>
                }
              >
                <div
                  className="rounded-[8px]"
                  style={{
                    border: `1px solid ${colors.colorBlack6}`,
                    padding: 16,
                  }}
                >
                  <ReservationRecord
                    reservation={lr.reservation}
                    guest={lr.guest}
                    onOpenScheduledMessages={() => onOpenScheduledMessages(lr.reservation.id)}
                  />
                </div>
              </CanaryExpand>
            );
          })}
        </div>
      )}
    </PanelPage>
  );
}
