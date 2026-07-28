/**
 * BroadcastDeliveryPanel — per-recipient delivery for one sent broadcast.
 *
 * Production renders this as a 420px right-edge slide-over
 * (BroadcastMessageDetailsModal.vue). Here it rides OUR floating-panel mechanic
 * — the same `<FloatingPanel>` shell the Conversation Details sidebar uses —
 * per the "leverage the new sidebar" call.
 *
 * Anatomy follows production (BroadcastMessageDetails.vue):
 *   title "Broadcast message" + a right-arrow close (it slides back out right)
 *   meta rows: message body · sent timestamp · sender · "(Audience) N"
 *   a bordered list of recipients, status right-aligned
 * …in our register: 32px rounded-8 square avatars (not production's circles),
 * rounded-8 container, colorBlack* type ramp.
 *
 * Status vocabulary is production's `NotificationStatus` set with production's
 * own English labels — note FAILED and BLOCKED_HIGH_RATE_COUNTRY deliberately
 * share the string "Failed to send" there, and we keep that.
 */

'use client';

import React from 'react';
import { format } from 'date-fns';
import Icon from '@mdi/react';
import {
  mdiArrowRight,
  mdiMessageProcessingOutline,
  mdiClockTimeFourOutline,
  mdiAccountCircleOutline,
  mdiAccountMultipleOutline,
} from '@mdi/js';
import { colors } from '@canary-ui/components';
import { FloatingPanel } from '../FloatingPanel';
import { Avatar } from '../Avatar';
import { useBroadcastStore } from '@/lib/products/messaging/broadcast-store';
import {
  BroadcastMessage,
  BroadcastRecipientStatus,
} from '@/lib/products/messaging/broadcast-types';
import { guests } from '@/lib/core/data/guests';
import { reservations } from '@/lib/core/data/reservations';

/** Failed red — $error-color in production; colorRed1 here. */
const STATUS_RED = colors.colorRed1;

/**
 * Production's labels, verbatim (broadcastMessageDetails.* in en.json).
 * FAILED and BLOCKED_HIGH_RATE_COUNTRY intentionally share one string.
 */
const STATUS_LABEL: Record<BroadcastRecipientStatus, string> = {
  'not-sent': 'Not sent',
  sending: 'Sending',
  sent: 'Sent',
  resent: 'Resent',
  delivered: 'Delivered',
  read: 'Read',
  failed: 'Failed to send',
  'blocked-high-rate-country': 'Failed to send',
  'pending-rtc': 'Pending RTC',
};

/**
 * Colour per status. Production only tints two states — FAILED red and
 * RTC-pending amber — and leaves everything else the row's inherited black,
 * including BLOCKED_HIGH_RATE_COUNTRY (its class check is `=== FAILED`, so a
 * blocked recipient reads "Failed to send" in plain black). We deliberately
 * diverge on two points, per the build spec: blocked is RED (it is a failure,
 * and production's black looks like an oversight of that `=== FAILED` check),
 * and "Not sent" is colorBlack3 gray (it is a non-event, not a delivery).
 */
const STATUS_COLOR: Record<BroadcastRecipientStatus, string> = {
  'not-sent': colors.colorBlack3,
  sending: colors.colorBlack1,
  sent: colors.colorBlack1,
  resent: colors.colorBlack1,
  delivered: colors.colorBlack1,
  read: colors.colorBlack1,
  failed: STATUS_RED,
  'blocked-high-rate-country': STATUS_RED,
  'pending-rtc': colors.warning,
};

/**
 * Production stamps the hotel's timezone via DatetimeFormats.TZ_AWARE_DATETIME
 * ("MMM DD, YYYY [at] h:mm A z"). The prototype has no hotel timezone, so the
 * abbreviation is a fixed display string — enough to read as production.
 */
const TZ_LABEL = 'EDT';

function MetaRow({ iconPath, children }: { iconPath: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="shrink-0" style={{ paddingTop: 3 }}>
        <Icon path={iconPath} size={0.67} color={colors.colorBlack3} />
      </span>
      <div
        className="flex-1 min-w-0 font-['Roboto',sans-serif] text-[14px] leading-[22px]"
        style={{ color: colors.colorBlack1, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      >
        {children}
      </div>
    </div>
  );
}

function RecipientRow({
  guestId,
  status,
  isLast,
}: {
  guestId: string;
  status: BroadcastRecipientStatus;
  isLast: boolean;
}) {
  const guest = guests[guestId];
  if (!guest) return null;

  // Room comes from whichever reservation this guest holds in the demo data.
  const reservation = Object.values(reservations).find((r) => r.guestId === guestId);
  const roomDisplay = reservation
    ? `${reservation.room}${reservation.roomType ? ` ${reservation.roomType}` : ''}`
    : '';

  return (
    <div
      className="flex items-center gap-3 transition-colors hover:bg-[#f9fafb]"
      style={{
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 8,
        paddingBottom: 8,
        borderBottom: isLast ? undefined : `1px solid ${colors.colorBlack6}`,
      }}
    >
      <Avatar src={guest.avatar} initials={guest.initials} size="small" />

      <div className="flex-1 min-w-0">
        <div
          className="font-['Roboto',sans-serif] text-[14px] leading-[22px] font-medium truncate"
          style={{ color: colors.colorBlack1 }}
          title={guest.name}
        >
          {guest.name}
        </div>
        {roomDisplay && (
          <div
            className="font-['Roboto',sans-serif] text-[12px] leading-[18px] truncate"
            style={{ color: colors.colorBlack3 }}
          >
            {roomDisplay}
          </div>
        )}
      </div>

      <span
        className="font-['Roboto',sans-serif] text-[14px] leading-[22px] shrink-0 whitespace-nowrap"
        style={{ color: STATUS_COLOR[status] }}
      >
        {STATUS_LABEL[status]}
      </span>
    </div>
  );
}

export function BroadcastDeliveryPanel() {
  const { allGroups, messages, deliveryPanelMessageId, closeDeliveryPanel } = useBroadcastStore();

  // Find the broadcast across every group's feed — the panel outlives a group
  // switch only until the exit transition finishes, so a missing message just
  // renders the shell empty rather than throwing.
  let message: BroadcastMessage | undefined;
  for (const list of Object.values(messages)) {
    const found = list.find((m) => m.id === deliveryPanelMessageId);
    if (found) {
      message = found;
      break;
    }
  }

  const groupName = message
    ? allGroups.find((g) => g.id === message!.groupId)?.name ?? ''
    : '';

  const recipients = message?.recipients ?? [];

  return (
    <FloatingPanel isOpen={!!deliveryPanelMessageId} onClose={closeDeliveryPanel} width={480}>
      {message && (
        <div className="h-full flex flex-col">
          {/* Header — title + right-arrow close (production's affordance: the
              panel slides back out to the right). */}
          <div
            className="flex items-center justify-between shrink-0"
            style={{ paddingLeft: 24, paddingRight: 16, paddingTop: 16, paddingBottom: 8 }}
          >
            <h2
              className="font-['Roboto',sans-serif] font-medium text-[16px] leading-[24px]"
              style={{ color: colors.colorBlack1 }}
            >
              Broadcast message
            </h2>
            <button
              onClick={closeDeliveryPanel}
              aria-label="Close broadcast message"
              className="flex items-center justify-center rounded-[4px] hover:bg-[#f0f0f0] transition-colors cursor-pointer"
              style={{ padding: 8 }}
            >
              <Icon path={mdiArrowRight} size={0.83} color={colors.colorBlack3} />
            </button>
          </div>

          {/* Meta rows */}
          <div
            className="shrink-0 flex flex-col gap-2"
            style={{ paddingLeft: 24, paddingRight: 24, paddingBottom: 16 }}
          >
            <MetaRow iconPath={mdiMessageProcessingOutline}>{message.content}</MetaRow>
            <MetaRow iconPath={mdiClockTimeFourOutline}>
              {`${format(message.sentAt, "MMM d, yyyy 'at' h:mm a")} ${TZ_LABEL}`}
            </MetaRow>
            <MetaRow iconPath={mdiAccountCircleOutline}>
              {message.senderName
                .toLowerCase()
                .split(' ')
                .filter(Boolean)
                .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
                .join(' ')}
            </MetaRow>
            <MetaRow iconPath={mdiAccountMultipleOutline}>
              {`(${groupName}) ${message.recipientCount}`}
            </MetaRow>
          </div>

          {/* Recipient list */}
          <div
            className="flex-1 min-h-0"
            style={{ paddingLeft: 24, paddingRight: 24, paddingBottom: 24 }}
          >
            <div
              className="h-full overflow-y-auto scrollbar-invisible rounded-[8px]"
              style={{ border: `1px solid ${colors.colorBlack6}` }}
            >
              {recipients.length === 0 ? (
                <div className="flex items-center justify-center" style={{ padding: 24 }}>
                  <p
                    className="font-['Roboto',sans-serif] text-[14px] leading-[22px] text-center"
                    style={{ color: colors.colorBlack4 }}
                  >
                    No delivery details for this broadcast
                  </p>
                </div>
              ) : (
                recipients.map((r, i) => (
                  <RecipientRow
                    key={r.guestId}
                    guestId={r.guestId}
                    status={r.status}
                    isLast={i === recipients.length - 1}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </FloatingPanel>
  );
}
