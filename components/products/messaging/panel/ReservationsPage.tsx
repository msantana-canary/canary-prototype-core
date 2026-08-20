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
 */

'use client';

import React, { useState } from 'react';
import { colors } from '@canary-ui/components';
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
              <div key={lr.reservation.id}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : lr.reservation.id)}
                  aria-expanded={isExpanded}
                  className="w-full flex items-center gap-2 text-left rounded-[8px] transition-colors hover:bg-[rgba(0,0,0,0.02)]"
                  style={{ padding: '6px 4px' }}
                >
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
                  <span className="flex-1" />
                  <Icon
                    path={isExpanded ? mdiChevronUp : mdiChevronDown}
                    size={0.8}
                    color={colors.colorBlack1}
                  />
                </button>

                {isExpanded && (
                  <div
                    className="rounded-[8px]"
                    style={{
                      border: `1px solid ${colors.colorBlack6}`,
                      padding: 16,
                      marginTop: 8,
                    }}
                  >
                    <ReservationRecord
                      reservation={lr.reservation}
                      guest={lr.guest}
                      onOpenScheduledMessages={() => onOpenScheduledMessages(lr.reservation.id)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </PanelPage>
  );
}
