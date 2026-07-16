/**
 * EmailInfoSidebar — Email Channel (Phase 2a)
 *
 * A PORT of Messaging's GuestInfoSidebar into the Email surface. Two styles,
 * chosen via the prototype toggle: PUSH (third body column; thread list
 * collapses 434→334) or DRAWER (Messaging's actual mechanic — fixed to the
 * right screen edge, translate-x slide-in). Toggled by the thread header's
 * info icon (pressed/active state while open).
 *
 * Reused Messaging idioms (visual parity is deliberate — this is a sibling
 * product's panel, not a new invention):
 *  - 400-class right panel with p-6 content padding + scoped overflow-y-auto.
 *  - Section heading typography (font-medium 16/24 colorBlack1) and the
 *    colorBlueDark5 info cards (Assignment, identity).
 *  - The Linked Reservations table anatomy — single bordered white container,
 *    divide-y rows, guest name + AUTO-LINKED tag, collapsed metadata line
 *    (phone + room in-house / dates otherwise), expandable full detail. Its
 *    shape is a settled cross-project decision — NOT redesigned here.
 *
 * Email-native additions (not in Messaging): the top Email identity block that
 * makes the sender→linked-guest auto-link inspectable, the Participants
 * (From/To/CC) section, and the "Open conversation" cross-channel jump.
 *
 * All guest/reservation data comes from the canonical layer (getGuest /
 * getGuestReservations) — never invented inline.
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@mdi/react';
import {
  mdiClose,
  mdiEmailOutline,
  mdiAccountMultipleOutline,
  mdiCalendarBlank,
  mdiBedOutline,
  mdiPound,
  mdiLogin,
  mdiLogout,
  mdiChevronDown,
  mdiChevronUp,
  mdiBellOutline,
  mdiOpenInNew,
  mdiAccountOutline,
} from '@mdi/js';
import {
  colors,
  CanaryTag,
  TagVariant,
  TagColor,
  TagSize,
} from '@canary-ui/components';
import { getGuest, getGuestReservations } from '@/lib/core/data';
import { Reservation } from '@/lib/core/types/reservation';
import { useEmailStore } from '@/lib/products/email/store';

/** Inbound mail lands on the hotel's shared front-desk address (the "To"). */
const HOTEL_ADDRESS = { name: 'The Statler', email: 'frontdesk@thestatler.com' };

/** Format a stay range: strip year from the check-in date. "Mar. 15 - Mar. 17, 2026" */
function formatDateRange(checkIn: string, checkOut: string): string {
  const stripped = checkIn.replace(/,?\s*\d{4}$/, '');
  return `${stripped} - ${checkOut}`;
}

export function EmailInfoSidebar() {
  const router = useRouter();
  const threads = useEmailStore((s) => s.threads);
  const selectedThreadId = useEmailStore((s) => s.selectedThreadId);
  const setInfoOpen = useEmailStore((s) => s.setInfoOpen);
  const infoPanelStyle = useEmailStore((s) => s.infoPanelStyle);
  const isInfoOpen = useEmailStore((s) => s.isInfoOpen);

  const thread = threads.find((t) => t.id === selectedThreadId);
  if (!thread) return null;

  const guest = thread.linkedGuestId ? getGuest(thread.linkedGuestId) : undefined;
  const reservations = guest ? getGuestReservations(guest.id) : [];

  const isDrawer = infoPanelStyle === 'drawer';

  return (
    <div
      className={
        isDrawer
          ? // DRAWER: Messaging's GuestInfoSidebar mechanic verbatim — fixed to the
            // right SCREEN edge below the 52px top bar, slides in via translate-x
            // (300ms ease-in-out), shadow-lg, always mounted so the slide animates.
            `fixed right-0 flex flex-col overflow-y-auto transition-transform duration-300 ease-in-out shadow-lg ${
              isInfoOpen ? 'translate-x-0' : 'translate-x-full'
            }`
          : // PUSH: always-mounted wrapper whose WIDTH animates 0↔360 on the same
            // 200ms curve as the thread list's 434→334 collapse, so panel, list
            // and thread view move as one coordinated motion. (Mounting at full
            // width made the thread view double-snap — janky.)
            'shrink-0 h-full overflow-hidden'
      }
      style={
        isDrawer
          ? {
              width: 400,
              backgroundColor: colors.colorBlack8,
              top: 52,
              height: 'calc(100vh - 52px)',
              zIndex: 40,
            }
          : {
              width: isInfoOpen ? 360 : 0,
              // A 0-width flex child still contributes a flex gap; cancel it
              // while closed so the closed layout is identical to no-panel.
              marginLeft: isInfoOpen ? 0 : -16,
              transition: 'width 200ms ease-out, margin-left 200ms ease-out',
            }
      }
    >
      <div
        className={
          isDrawer
            ? 'flex flex-col'
            : 'flex flex-col overflow-y-auto rounded-[12px] h-full'
        }
        style={
          isDrawer
            ? undefined
            : {
                // Fixed inner width: the wrapper clips during the animation but
                // the content never reflows/squishes mid-flight.
                width: 360,
                backgroundColor: colors.colorWhite,
                border: `1px solid ${colors.colorBlack6}`,
              }
        }
      >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className="font-['Roboto',sans-serif] font-medium text-[18px] leading-[27px]"
            style={{ color: colors.colorBlack1 }}
          >
            Email Details
          </h2>
          <button
            onClick={() => setInfoOpen(false)}
            className="w-[30px] h-[30px] flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors"
            aria-label="Close details"
          >
            <Icon path={mdiClose} size={0.67} color={colors.colorBlack1} />
          </button>
        </div>

        {/* 1. Email identity block (email-native) — sender + inspectable auto-link */}
        <div
          className="rounded-lg p-4 mb-6"
          style={{ backgroundColor: colors.colorBlueDark5 }}
        >
          <div className="flex items-center gap-2">
            <Icon path={mdiEmailOutline} size={0.67} color={colors.colorBlack1} />
            <span
              className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[21px] truncate"
              style={{ color: colors.colorBlack1 }}
            >
              {thread.senderName}
            </span>
          </div>
          <p
            className="font-['Roboto',sans-serif] text-[13px] leading-[20px] mt-0.5 truncate"
            style={{ color: colors.colorBlack3, paddingLeft: 26 }}
          >
            {thread.senderEmail}
          </p>

          {/* Auto-link mapping — sender → linked canonical guest (by sender address) */}
          <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${colors.colorBlueDark4}` }}>
            {guest ? (
              <>
                <div className="flex items-center gap-2 flex-nowrap overflow-hidden">
                  <Icon path={mdiAccountOutline} size={0.67} color={colors.colorBlack1} />
                  <span
                    className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[21px] truncate shrink"
                    style={{ color: colors.colorBlack1 }}
                  >
                    {guest.name}
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
                <p
                  className="font-['Roboto',sans-serif] text-[12px] leading-[18px] mt-1"
                  style={{ color: colors.colorBlack3, paddingLeft: 26 }}
                >
                  Matched to a guest profile by sender address.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Icon path={mdiAccountOutline} size={0.67} color={colors.colorBlack3} />
                  <span
                    className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[21px]"
                    style={{ color: colors.colorBlack3 }}
                  >
                    No linked guest
                  </span>
                </div>
                <p
                  className="font-['Roboto',sans-serif] text-[12px] leading-[18px] mt-1"
                  style={{ color: colors.colorBlack3, paddingLeft: 26 }}
                >
                  Sender address didn&apos;t match a guest profile.
                </p>
              </>
            )}
          </div>
        </div>

        {/* 2. Participants (email-native) — From / To / CC, display-only */}
        <div className="mb-6">
          <h3
            className="font-['Roboto',sans-serif] font-medium text-[16px] leading-[24px] mb-3"
            style={{ color: colors.colorBlack1 }}
          >
            Participants
          </h3>
          <div className="space-y-3">
            <ParticipantRow label="From" name={thread.senderName} email={thread.senderEmail} />
            <ParticipantRow label="To" name={HOTEL_ADDRESS.name} email={HOTEL_ADDRESS.email} />
            {thread.cc && thread.cc.length > 0 && (
              thread.cc.map((p) => (
                <ParticipantRow key={p.email} label="CC" name={p.name} email={p.email} />
              ))
            )}
          </div>
        </div>

        {/* 3. Linked Reservation (ported from Messaging) */}
        <div className="mb-6">
          <h3
            className="font-['Roboto',sans-serif] font-medium text-[16px] leading-[24px] mb-3"
            style={{ color: colors.colorBlack1 }}
          >
            Linked Reservation
          </h3>

          {reservations.length === 0 ? (
            <p
              className="font-['Roboto',sans-serif] text-[14px] leading-[21px] text-center py-2"
              style={{ color: colors.colorBlack3 }}
            >
              No linked reservation
            </p>
          ) : (
            <div
              className="rounded-lg border divide-y divide-[#E5E5E5]"
              style={{ backgroundColor: colors.colorWhite, borderColor: colors.colorBlack6 }}
            >
              {reservations.map((res) => (
                <ReservationRow key={res.id} reservation={res} guestName={guest!.name} />
              ))}
            </div>
          )}
        </div>

        {/* 4. Assignment (ported from Messaging) */}
        <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: colors.colorBlueDark5 }}>
          <p
            className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[21px]"
            style={{ color: colors.colorBlack1 }}
          >
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

        {/* 5. Scheduled Guest Journey Messages (ported from Messaging) */}
        <div className="mb-6">
          <h3
            className="font-['Roboto',sans-serif] font-medium text-[16px] leading-[24px] mb-3"
            style={{ color: colors.colorBlack1 }}
          >
            Scheduled Guest Journey Messages
          </h3>

          {guest ? (
            <>
              <div className="space-y-2">
                {SCHEDULED_GJ_MESSAGES.map((m) => (
                  <div
                    key={m.title}
                    className="flex items-start gap-2 rounded-lg p-3"
                    style={{ backgroundColor: colors.colorBlack8 }}
                  >
                    <Icon path={mdiBellOutline} size={0.67} color={colors.colorBlack3} />
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[21px]"
                        style={{ color: colors.colorBlack1 }}
                      >
                        {m.title}
                      </p>
                      <p
                        className="font-['Roboto',sans-serif] text-[12px] leading-[18px]"
                        style={{ color: colors.colorBlack3 }}
                      >
                        {m.when} · {m.channel}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="font-['Roboto',sans-serif] text-[14px] leading-[21px] mt-3 hover:underline"
                style={{ color: colors.colorBlueDark1 }}
              >
                View channel statuses
              </button>
            </>
          ) : (
            <p
              className="font-['Roboto',sans-serif] text-[14px] leading-[21px] text-center py-2"
              style={{ color: colors.colorBlack3 }}
            >
              No scheduled messages
            </p>
          )}
        </div>

        {/* 6. Cross-channel jump (email-native) */}
        <button
          onClick={() => router.push('/messages')}
          className="w-full flex items-center justify-center gap-2 rounded-[6px] transition-colors hover:bg-[rgba(40,88,196,0.06)]"
          style={{
            height: 40,
            border: `1px solid ${colors.colorBlueDark1}`,
            color: colors.colorBlueDark1,
            cursor: 'pointer',
          }}
        >
          <Icon path={mdiOpenInNew} size={0.67} color={colors.colorBlueDark1} />
          <span className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[21px]">
            Open conversation
          </span>
        </button>
      </div>
      </div>
    </div>
  );
}

/** Upcoming guest-journey sends for the linked guest (email-product mock data). */
const SCHEDULED_GJ_MESSAGES = [
  { title: 'Review Request', when: 'Today 3:00 PM', channel: 'Email' },
  { title: 'Checkout Reminder', when: 'Tomorrow 10:00 AM', channel: 'Email' },
] as const;

/** A single From/To/CC row in the Participants section. */
function ParticipantRow({ label, name, email }: { label: string; name: string; email: string }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="font-['Roboto',sans-serif] font-medium text-[12px] leading-[21px] uppercase shrink-0"
        style={{ color: colors.colorBlack3, width: 32 }}
      >
        {label}
      </span>
      <div className="flex-1 min-w-0">
        <p
          className="font-['Roboto',sans-serif] text-[14px] leading-[21px] truncate"
          style={{ color: colors.colorBlack1 }}
        >
          {name}
        </p>
        <p
          className="font-['Roboto',sans-serif] text-[12px] leading-[18px] truncate"
          style={{ color: colors.colorBlack3 }}
        >
          {email}
        </p>
      </div>
    </div>
  );
}

/**
 * ReservationRow — ported from Messaging's GuestInfoSidebar table row.
 * Collapsed: guest name + AUTO-LINKED tag + metadata line (room in-house /
 * dates otherwise). Expanded: full detail (dates, room, confirmation,
 * check-in/out status). The table shape is a settled cross-project decision.
 */
function ReservationRow({ reservation, guestName }: { reservation: Reservation; guestName: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isInHouse = reservation.status === 'checked-in';

  return (
    <div style={{ borderColor: colors.colorBlack6 }}>
      {/* Row header (always visible) */}
      <div
        className="flex items-start justify-between px-4 py-3 cursor-pointer"
        onClick={() => setIsExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-nowrap overflow-hidden">
            <span
              className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[21px] truncate shrink"
              style={{ color: colors.colorBlack1 }}
            >
              {guestName}
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

          {!isExpanded && (
            <div className="flex items-center gap-3 mt-1">
              {isInHouse && reservation.room ? (
                <div className="flex items-center gap-1">
                  <Icon path={mdiBedOutline} size={0.5} color={colors.colorBlack3} />
                  <span
                    className="font-['Roboto',sans-serif] text-[12px] leading-[18px]"
                    style={{ color: colors.colorBlack3 }}
                  >
                    Room {reservation.room}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Icon path={mdiCalendarBlank} size={0.5} color={colors.colorBlack3} />
                  <span
                    className="font-['Roboto',sans-serif] text-[12px] leading-[18px]"
                    style={{ color: colors.colorBlack3 }}
                  >
                    {formatDateRange(reservation.checkInDate, reservation.checkOutDate)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="w-[28px] h-[28px] flex items-center justify-center shrink-0 ml-2">
          <Icon
            path={isExpanded ? mdiChevronUp : mdiChevronDown}
            size={0.67}
            color={colors.colorBlack3}
          />
        </div>
      </div>

      {/* Expanded details — 12px text, 16px icons */}
      {isExpanded && (
        <div className="px-4 pb-3 space-y-2.5">
          <DetailRow icon={mdiCalendarBlank} text={formatDateRange(reservation.checkInDate, reservation.checkOutDate)} />
          {reservation.room && <DetailRow icon={mdiBedOutline} text={`Room ${reservation.room}`} />}
          {reservation.confirmationCode && <DetailRow icon={mdiPound} text={reservation.confirmationCode} />}
          <DetailRow icon={mdiLogin} text={reservation.checkInStatus || 'Not Started'} />
          <DetailRow icon={mdiLogout} text={reservation.checkOutStatus || '--'} />
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon path={icon} size={0.67} color={colors.colorBlack1} />
      <span
        className="font-['Roboto',sans-serif] text-[12px] leading-[18px]"
        style={{ color: colors.colorBlack1 }}
      >
        {text}
      </span>
    </div>
  );
}
