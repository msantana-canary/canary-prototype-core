/**
 * ScheduledMessagesPage — one reservation's guest-journey timeline.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WHY A TIMELINE AND NOT A TABLE
 * ═══════════════════════════════════════════════════════════════════════════
 * The previous canon rendered this as a bordered table of rows. A table says
 * "here are some records"; a rail says "here is a sequence, and this is where
 * you are in it". Guest-journey messages ARE a sequence — booking, pre-arrival,
 * check-in, in-house, checkout, post-stay — and the question a hotelier brings
 * to this screen is temporal: what has already gone out, what is still coming,
 * and where did it break. The blue rail answers all three at a glance, and the
 * ONE red dot on it is the answer to the third without reading a word.
 *
 * ANATOMY (frame 2038:56919 + Miguel's addition):
 *   • Vertical blue rail with a dot per touchpoint. The dot turns RED on the
 *     card that has a failure — the rail is the failure's index.
 *   • Card: title + a status TAG beside the name — green "Sent" / red "Failed" /
 *     blue "Scheduled". The tag is Miguel's addition over the drawn frame: the
 *     frame carried status only in the timestamp's wording ("Sent Jul 13" vs a
 *     bare "Jul 14"), which is a real distinction hiding inside a date.
 *   • Right-aligned timestamp caption, then a row of channel icons; a failed
 *     channel is tinted red.
 *   • Per-channel error blocks in the canon's error register: a small gray
 *     channel overline, then ONE red sentence "Error {code}: {curated line}"
 *     with ONLY the carrier code underlined.
 *
 * THE CARD RULE: "Sent" if ANY channel succeeded. A message that reached the
 * guest by email and failed on SMS DID reach the guest — calling the whole card
 * "Failed" would send a hotelier chasing a guest who already has the
 * information. The damage stays per-channel, where it happened.
 */

'use client';

import React from 'react';
import { colors, TagColor } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiEmailOutline, mdiMessageProcessingOutline, mdiWhatsapp } from '@mdi/js';
import { EmptyState, PanelPage, PanelTag } from './panel-ui';
import {
  buildJourneyTimeline,
  GjChannelStatus,
  GjChannelType,
  GjMessageEntry,
  GJ_CHANNEL_LABEL,
} from '@/lib/products/messaging/guest-journey-link';

/** Loud-red for failed anything — colorRed1. */
const FAIL_RED = colors.colorRed1;

/**
 * One delivery channel. email / sms / whatsapp are ~18px glyphs; booking and
 * expedia are tiny OTA letter chips ("B" white-on-navy, "E" black-on-amber),
 * because neither has a glyph and both need to be recognisable at 18px.
 * Status drives colour: failed = red, scheduled = 40% opacity (it hasn't
 * happened yet), sent = colorBlack2.
 */
function ChannelIcon({ type, status }: { type: GjChannelType; status: GjChannelStatus }) {
  const failed = status === 'failed';
  const opacity = status === 'scheduled' ? 0.4 : 1;

  if (type === 'booking' || type === 'expedia') {
    const isBooking = type === 'booking';
    return (
      <span
        title={GJ_CHANNEL_LABEL[type]}
        className="flex items-center justify-center font-['Roboto',sans-serif] font-semibold shrink-0"
        style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          fontSize: 11,
          lineHeight: '18px',
          opacity,
          backgroundColor: failed ? FAIL_RED : isBooking ? '#1a3c8b' : '#ffd43b',
          color: failed ? '#ffffff' : isBooking ? '#ffffff' : '#000000',
        }}
      >
        {isBooking ? 'B' : 'E'}
      </span>
    );
  }

  const path =
    type === 'email' ? mdiEmailOutline : type === 'sms' ? mdiMessageProcessingOutline : mdiWhatsapp;
  return (
    <span
      title={GJ_CHANNEL_LABEL[type]}
      className="flex items-center justify-center shrink-0"
      style={{ width: 18, height: 18, opacity }}
    >
      <Icon path={path} size={0.72} color={failed ? FAIL_RED : colors.colorBlack2} />
    </span>
  );
}

/** Sent if anything landed; Failed if nothing did; Scheduled if it hasn't run. */
function cardStatus(entry: GjMessageEntry): { label: string; color: TagColor; failed: boolean } {
  const anyFailed = entry.channels.some((c) => c.status === 'failed');
  const anySucceeded = entry.channels.some((c) => c.status === 'sent');
  if (anySucceeded) return { label: 'Sent', color: TagColor.SUCCESS, failed: anyFailed };
  if (anyFailed) return { label: 'Failed', color: TagColor.ERROR, failed: true };
  return { label: 'Scheduled', color: TagColor.INFO, failed: false };
}

const CARD_GAP = 12;

export function ScheduledMessagesPage({
  reservationId,
  onBack,
  onClose,
}: {
  reservationId: string;
  onBack: () => void;
  onClose: () => void;
}) {
  const entries = buildJourneyTimeline(reservationId);

  return (
    <PanelPage title="Guest Scheduled Messages" onBack={onBack} onClose={onClose}>
      {entries.length === 0 ? (
        <EmptyState label="No scheduled messages" />
      ) : (
        <div>
          {entries.map((entry, i) => {
            const status = cardStatus(entry);
            const isFirst = i === 0;
            const isLast = i === entries.length - 1;
            const timestamp = entry.sentAt ? `Sent ${entry.sentAt}` : entry.scheduledFor ?? '';

            return (
              <div className="flex" key={`${entry.title}-${i}`}>
                {/* RAIL — the line spans the card AND the gap below it, so the
                    sequence is continuous; the dot is centred on the CARD, not
                    on card+gap, hence the (100% - gap)/2 arithmetic. */}
                <div className="relative shrink-0" style={{ width: 24 }}>
                  <div
                    aria-hidden
                    style={{
                      position: 'absolute',
                      left: 4,
                      width: 2,
                      top: isFirst ? `calc((100% - ${CARD_GAP}px) / 2)` : 0,
                      bottom: isLast ? `calc((100% + ${CARD_GAP}px) / 2)` : 0,
                      backgroundColor: colors.colorBlueDark1,
                    }}
                  />
                  <div
                    aria-hidden
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: `calc((100% - ${CARD_GAP}px) / 2 - 5px)`,
                      width: 10,
                      height: 10,
                      borderRadius: 9999,
                      backgroundColor: status.failed ? FAIL_RED : colors.colorBlueDark1,
                    }}
                  />
                </div>

                {/* CARD */}
                <div
                  className="flex-1 min-w-0 rounded-[8px]"
                  style={{
                    border: `1px solid ${colors.colorBlack6}`,
                    padding: '12px 14px',
                    marginBottom: CARD_GAP,
                    marginLeft: 12,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="truncate font-['Roboto',sans-serif] font-medium text-[14px] leading-[22px]"
                        style={{ color: colors.colorBlack1 }}
                      >
                        {entry.title}
                      </span>
                      <PanelTag label={status.label} color={status.color} uppercase={false} />
                    </div>
                    <span className="flex-1" />
                    <span
                      className="shrink-0 font-['Roboto',sans-serif] text-[13px] leading-[22px] whitespace-nowrap"
                      style={{ color: colors.colorBlack3 }}
                    >
                      {timestamp}
                    </span>
                  </div>

                  <div className="flex items-center gap-2" style={{ marginTop: 6 }}>
                    {entry.channels.map((c, j) => (
                      <ChannelIcon key={`${c.type}-${j}`} type={c.type} status={c.status} />
                    ))}
                  </div>

                  {/* ERROR REGISTER — one block per failed channel. Mirrors
                      production's messaging failure copy: a small gray channel
                      overline, then ONE red sentence where only the carrier code
                      is underlined (the Twilio-docs link). No tint, no separate
                      "Learn more" — a hotel can't fix a carrier failure, but the
                      code on screen saves Canary support the investigation. */}
                  {entry.channels
                    .filter((c) => c.status === 'failed' && c.errorCode)
                    .map((c, j) => (
                      <div key={`err-${j}`} style={{ marginTop: 8 }}>
                        <span
                          className="block font-['Roboto',sans-serif] text-[12px] leading-[16px]"
                          style={{ color: colors.colorBlack3 }}
                        >
                          {GJ_CHANNEL_LABEL[c.type]}
                        </span>
                        <p
                          className="font-['Roboto',sans-serif] text-[13px] leading-[19px]"
                          style={{ color: FAIL_RED, marginTop: 2 }}
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
              </div>
            );
          })}
        </div>
      )}
    </PanelPage>
  );
}
