/**
 * BroadcastDeliveryPanel — per-recipient delivery for one sent broadcast.
 *
 * Production renders this as a 420px right-edge slide-over
 * (BroadcastMessageDetailsModal.vue). Here it rides the surface's one panel
 * standard, `<PanelShell>` (2026-08-24 — it was on the deleted `FloatingPanel`
 * before).
 *
 * Anatomy follows production (BroadcastMessageDetails.vue):
 *   title "Message details" + close ×
 *   meta rows: message body · sent timestamp · sender · "(Audience) N"
 *   a bordered list of recipients
 * …in our register: 32px rounded-8 square avatars (not production's circles),
 * rounded-8 container, colorBlack* type ramp.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * THE STATUS IS A CHIP NOW (frame `msgdetails`, 2026-08-24)
 * ═══════════════════════════════════════════════════════════════════════════
 * It used to be right-aligned text carrying production's two-tint rule: FAILED
 * red, Pending RTC amber, everything else plain black. The frame moves it
 * INLINE — a `CanaryTag` OUTLINE chip beside the name — and that move is what
 * changes the colour model, because a chip cannot be "untinted". A neutral
 * outline is still a chip; the question is only which colour it takes.
 *
 * So the ladder is now four registers rather than two, and it answers ONE
 * question: did the message reach the guest?
 *
 *   GREEN  (SUCCESS)  delivered · read      — it arrived.
 *   AMBER  (WARNING)  pending-rtc           — it is waiting on the guest.
 *   RED    (ERROR)    failed                — it did not arrive.
 *   GREY   (DEFAULT)  sending · sent · resent · not-sent ·
 *                     blocked-high-rate-country
 *
 * The frame draws green and amber. RED IS BUILT THOUGH IT IS UNDRAWN: a
 * delivery panel whose whole job is surfacing damage cannot be shipped without
 * its damage state, and the anatomy is identical — same chip, same size, same
 * radius, one enum value apart.
 *
 * ⚠ `blocked-high-rate-country` STAYS GREY, reading "Failed to send" beside a
 * red chip that reads the same words. That is deliberate and it is production's
 * own oddity: its class check is `=== NotificationStatus.FAILED`, so a blocked
 * recipient has never been tinted. An earlier pass diverged on exactly this and
 * was reverted — if it is in production we keep it, and grey is what "untinted"
 * becomes once the text is a chip.
 *
 * Labels are still production's verbatim (FAILED and BLOCKED_HIGH_RATE_COUNTRY
 * deliberately share "Failed to send"); `CanaryTag` uppercases them, which is
 * what the frame draws.
 */

'use client';

import React from 'react';
import { format } from 'date-fns';
import Icon from '@mdi/react';
import {
  mdiClose,
  mdiMessageProcessingOutline,
  mdiClockTimeFourOutline,
  mdiAccountCircleOutline,
  mdiAccountMultipleOutline,
} from '@mdi/js';
import {
  ButtonSize,
  ButtonType,
  CanaryButton,
  CanaryTag,
  colors,
  TagColor,
  TagSize,
  TagVariant,
} from '@canary-ui/components';
import { PanelShell } from '../panel/PanelShell';
import { Avatar } from '../Avatar';
import { useBroadcastStore } from '@/lib/products/messaging/broadcast-store';
import {
  BroadcastMessage,
  BroadcastRecipientStatus,
} from '@/lib/products/messaging/broadcast-types';
import { guests } from '@/lib/core/data/guests';
import { reservations } from '@/lib/core/data/reservations';

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
 * Chip colour per status. See the four-register ladder in the file header for
 * why this is no longer production's two-tint rule, and why
 * `blocked-high-rate-country` is grey rather than red.
 *
 * These are `TagColor` enum values, not hex: the whole point of moving to a
 * chip is that the library owns green, amber, red and grey, and this file only
 * says WHICH.
 */
const STATUS_TONE: Record<BroadcastRecipientStatus, TagColor> = {
  'not-sent': TagColor.DEFAULT,
  sending: TagColor.DEFAULT,
  sent: TagColor.DEFAULT,
  resent: TagColor.DEFAULT,
  delivered: TagColor.SUCCESS,
  read: TagColor.SUCCESS,
  failed: TagColor.ERROR,
  'blocked-high-rate-country': TagColor.DEFAULT,
  'pending-rtc': TagColor.WARNING,
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
        {/* Name and status on ONE line. The chip sits beside the name rather
            than at the row's far edge because it is a fact ABOUT this person,
            and a right-aligned column made the eye travel the row's full width
            to pair two things that belong together. `min-w-0` + `truncate` on
            the name and `shrink-0` on the chip means a long name gives way and
            the status never does — the status is why the panel is open. */}
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="font-['Roboto',sans-serif] text-[14px] leading-[22px] font-medium truncate min-w-0"
            style={{ color: colors.colorBlack1 }}
            title={guest.name}
          >
            {guest.name}
          </span>
          {/* `canary-tag-r4` is the branch-wide opt-in to the 4px radius Miguel
              called on 2026-08-20 (the library hardcodes 2px). OUTLINE is the
              library's own "light ground, coloured border, coloured text",
              which is exactly the chip the frame draws. */}
          <CanaryTag
            label={STATUS_LABEL[status]}
            color={STATUS_TONE[status]}
            variant={TagVariant.OUTLINE}
            size={TagSize.COMPACT}
            uppercase
            className="canary-tag-r4 shrink-0"
          />
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

      {/* THE JUMP. Production opens this recipient's own 1:1 conversation, which
          is the only thing a hotelier can DO about a failed or pending row —
          the panel tells her it did not arrive, and the thread is where she
          fixes it.
          ⚠ INERT IN THIS BRANCH, and deliberately so: the jump crosses from the
          broadcast store into the messaging store AND has to flip the page's
          Conversations/Broadcast tab, which is local state one level above both.
          Wiring it is a small, clearly-shaped piece of work (a store action that
          owns the active tab) and it is not what this batch was scoped to
          change. Logged in REDESIGN_NOTES' stub inventory. */}
      <CanaryButton
        type={ButtonType.ICON_SECONDARY}
        size={ButtonSize.COMPACT}
        className="icon-btn-neutral icon-btn-28 icon-btn-r6 shrink-0"
        icon={
          <Icon
            path={mdiMessageProcessingOutline}
            size={0.75}
            color={colors.colorBlack1}
            title={`Open the conversation with ${guest.name}`}
            id={`delivery-jump-${guestId}`}
          />
        }
      />
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
    <PanelShell isOpen={!!deliveryPanelMessageId} onClose={closeDeliveryPanel} label="Message details">
      {message && (
        <div className="h-full flex flex-col">
          {/* Header — title + close, ruled off from the list below it as the
              frame draws. */}
          <div
            className="flex items-center justify-between shrink-0"
            style={{
              paddingLeft: 24,
              paddingRight: 16,
              paddingTop: 16,
              paddingBottom: 12,
              borderBottom: `1px solid ${colors.colorBlack6}`,
            }}
          >
            {/* "Message details", not "Broadcast message" (frame `msgdetails`).
                The panel is opened FROM a broadcast block, so naming it after
                the broadcast restated where you already were; what it actually
                holds is the delivery detail of that one message. */}
            <h2
              className="font-['Roboto',sans-serif] font-medium text-[16px] leading-[24px]"
              style={{ color: colors.colorBlack1 }}
            >
              Message details
            </h2>
            {/* Close matches the Conversation Details panel: a round 30px
                neutral icon button, not production's slide-back-out arrow. It
                is `CanaryButton` ICON_SECONDARY now rather than the hand-rolled
                div this file carried — the base's own 8%/16% wash ladder on
                `.icon-btn-neutral`, `isRounded` for the circle, and the name on
                the mdi `<title>` with a stable id. */}
            <CanaryButton
              type={ButtonType.ICON_SECONDARY}
              size={ButtonSize.COMPACT}
              onClick={closeDeliveryPanel}
              isRounded
              className="icon-btn-neutral icon-btn-30"
              icon={
                <Icon
                  path={mdiClose}
                  size={0.67}
                  color={colors.colorBlack1}
                  title="Close message details"
                  id="delivery-panel-close"
                />
              }
            />
          </div>

          {/* Meta rows — the message's own body, when it went, who sent it, and
              which audience.
              ⚠ THE FRAME DRAWS NONE OF THIS: `msgdetails` goes header → hairline
              → list. They are KEPT because they are the only place the
              broadcast's own text is readable once the panel is open, and
              because the brief's restyle list named the title, the chips, the
              subtitle and the jump icon and did not name them. If Miguel meant
              the frame literally this block is a clean delete — flagged as an
              eyeball item rather than decided here. */}
          <div
            className="shrink-0 flex flex-col gap-2"
            style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 16, paddingBottom: 16 }}
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
    </PanelShell>
  );
}
