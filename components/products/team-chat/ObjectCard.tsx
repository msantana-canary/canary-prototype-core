'use client';

/**
 * Team Chat (SPIKE) — ObjectCard
 *
 * A compact Canary-object card dropped INTO a message — the differentiator vs.
 * WhatsApp/Slack. References canonical guests/reservations by id. Kept tight
 * (summary + one action) so several fit in a ~360px panel.
 */

import Icon from '@mdi/react';
import { mdiWrenchOutline, mdiChevronRight } from '@mdi/js';
import { colors } from '@canary-ui/components';
import { guests } from '@/lib/core/data/guests';
import { reservations } from '@/lib/core/data/reservations';
import type { ObjectCardRef } from '@/lib/products/team-chat/types';

const TICKET_STATUS: Record<string, { label: string; bg: string; fg: string }> = {
  'open': { label: 'Open', bg: '#FBE9E7', fg: '#C0392B' },
  'in-progress': { label: 'In progress', bg: '#FFF3E0', fg: '#C2700E' },
  'resolved': { label: 'Resolved', bg: '#E7F6EC', fg: '#1F9D78' },
};

export function ObjectCard({ card }: { card: ObjectCardRef }) {
  if (card.kind === 'ticket' && card.ticket) {
    const s = TICKET_STATUS[card.ticket.status];
    return (
      <div className="mt-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
            style={{ backgroundColor: '#FFF3E0' }}
          >
            <Icon path={mdiWrenchOutline} size={0.7} color="#C2700E" />
          </span>
          <span className="flex-1 text-[13px] font-medium" style={{ color: colors.colorBlack1 }}>
            {card.ticket.title}
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
            style={{ backgroundColor: s.bg, color: s.fg }}
          >
            {s.label}
          </span>
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-[12px]" style={{ color: colors.colorBlack3 }}>
            Service ticket{card.ticket.room ? ` · Room ${card.ticket.room}` : ''}
          </span>
          <button className="flex items-center text-[12px] font-medium" style={{ color: colors.colorBlueDark1 }}>
            Open ticket <Icon path={mdiChevronRight} size={0.6} />
          </button>
        </div>
      </div>
    );
  }

  // guest / reservation card
  const guest = card.guestId ? guests[card.guestId] : undefined;
  const res = card.reservationId ? reservations[card.reservationId] : undefined;
  if (!guest) return null;

  const tag = guest.statusTag;

  return (
    <div className="mt-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5">
      <div className="flex items-center gap-2">
        {guest.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={guest.avatar} alt={guest.name} className="h-7 w-7 shrink-0 rounded-full object-cover" />
        ) : (
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
            style={{ backgroundColor: colors.colorBlueDark1 }}
          >
            {guest.initials}
          </span>
        )}
        <span className="flex-1 truncate text-[13px] font-medium" style={{ color: colors.colorBlack1 }}>
          {guest.name}
        </span>
        {tag && (
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
            style={{ backgroundColor: tag.color, color: tag.textColor ?? 'white' }}
          >
            {tag.label}
          </span>
        )}
      </div>

      {res && (
        <div className="mt-1.5 text-[12px]" style={{ color: colors.colorBlack3 }}>
          Room {res.room ?? res.roomType ?? '—'} · {res.checkInDate} → {res.checkOutDate}
        </div>
      )}

      <div className="mt-1 flex items-center justify-between">
        {res ? (
          <span className="font-mono text-[11px]" style={{ color: colors.colorBlack4 }}>
            {res.confirmationCode}
          </span>
        ) : (
          <span />
        )}
        <button className="flex items-center text-[12px] font-medium" style={{ color: colors.colorBlueDark1 }}>
          View profile <Icon path={mdiChevronRight} size={0.6} />
        </button>
      </div>
    </div>
  );
}
