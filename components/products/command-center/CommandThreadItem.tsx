'use client';

import React from 'react';
import Icon from '@mdi/react';
import {
  mdiMessageTextOutline,
  mdiWhatsapp,
  mdiEmailOutline,
  mdiWeb,
  mdiEarth,
} from '@mdi/js';
import { CommandCenterThread } from '@/lib/products/command-center/types';
import { guests } from '@/lib/core/data/guests';
import { reservations } from '@/lib/core/data/reservations';
import { formatDistanceToNow } from 'date-fns';
import { MessageChannel } from '@/lib/products/messaging/types';

const channelConfig: Record<MessageChannel, { icon: string; color: string; label: string }> = {
  'SMS': { icon: mdiMessageTextOutline, color: '#3B82F6', label: 'SMS' },
  'WhatsApp': { icon: mdiWhatsapp, color: '#25D366', label: 'WhatsApp' },
  'Email': { icon: mdiEmailOutline, color: '#8B5CF6', label: 'Email' },
  'Booking.com': { icon: mdiEarth, color: '#003580', label: 'Booking.com' },
  'Expedia': { icon: mdiEarth, color: '#FBAD18', label: 'Expedia' },
  'Web': { icon: mdiWeb, color: '#6B7280', label: 'Web Chat' },
};

const sentimentColors: Record<string, string> = {
  positive: 'bg-emerald-400',
  neutral: 'bg-gray-300',
  negative: 'bg-amber-400',
  angry: 'bg-red-500',
};

interface CommandThreadItemProps {
  thread: CommandCenterThread;
  isSelected: boolean;
  onClick: () => void;
}

export function CommandThreadItem({ thread, isSelected, onClick }: CommandThreadItemProps) {
  const guest = guests[thread.guestId];
  const reservation = reservations[thread.reservationId];
  const channel = channelConfig[thread.channel];

  if (!guest) return null;

  const timeAgo = formatDistanceToNow(thread.lastMessageAt, { addSuffix: false });
  const firstName = guest.name.split(' ')[0];

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left px-3 py-2.5 transition-colors border-b border-gray-100 group
        ${isSelected ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-gray-50 border-l-2 border-l-transparent'}
        ${thread.isUnread && !isSelected ? 'bg-blue-50/40' : ''}
      `}
    >
      <div className="flex items-start gap-2.5">
        <div className="relative shrink-0">
          {guest.avatar ? (
            <img src={guest.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
              {guest.initials}
            </div>
          )}
          {thread.sentiment && (
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${sentimentColors[thread.sentiment]}`} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={`text-[13px] truncate ${thread.isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'}`}>
                {firstName}
              </span>
              {guest.statusTag && (
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase leading-none shrink-0"
                  style={{
                    backgroundColor: guest.statusTag.color + '15',
                    color: guest.statusTag.color === '#000000' ? '#374151' : guest.statusTag.textColor === 'white' ? guest.statusTag.color : guest.statusTag.textColor,
                  }}
                >
                  {guest.statusTag.label.split(' ')[0]}
                </span>
              )}
            </div>
            <span className="text-[11px] text-gray-400 whitespace-nowrap shrink-0">{timeAgo}</span>
          </div>

          <div className="flex items-center gap-1.5 mb-1">
            <div className="flex items-center gap-1" title={channel.label}>
              <Icon path={channel.icon} size={0.5} style={{ color: channel.color }} />
              <span className="text-[10px] text-gray-400 uppercase font-medium">{channel.label}</span>
            </div>
            {reservation?.room && (
              <>
                <span className="text-[10px] text-gray-300">•</span>
                <span className="text-[10px] text-gray-400">Rm {reservation.room}</span>
              </>
            )}
          </div>

          <p className={`text-[12px] leading-snug line-clamp-2 ${thread.isUnread ? 'text-gray-700' : 'text-gray-500'}`}>
            {thread.lastMessage}
          </p>
        </div>

        {thread.isUnread && (
          <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
        )}
      </div>
    </button>
  );
}
