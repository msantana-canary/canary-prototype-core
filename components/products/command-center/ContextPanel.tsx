'use client';

import React from 'react';
import Icon from '@mdi/react';
import {
  mdiAccountOutline,
  mdiCalendarOutline,
  mdiCoffeeOutline,
  mdiRobotOutline,
  mdiTimelineClockOutline,
  mdiPhoneOutline,
  mdiEmailOutline,
  mdiTranslate,
  mdiBedOutline,
  mdiThermometer,
  mdiFoodOutline,
  mdiNoteTextOutline,
  mdiLoginVariant,
  mdiMessageTextOutline,
  mdiArrowUpBoldOutline,
  mdiTicketOutline,
  mdiAlertOutline,
} from '@mdi/js';
import { CommandCenterThread, GuestPreferences, ActivityEvent } from '@/lib/products/command-center/types';
import { guests } from '@/lib/core/data/guests';
import { reservations } from '@/lib/core/data/reservations';
import { guestPreferences, activityEvents } from '@/lib/products/command-center/mock-data';
import { format } from 'date-fns';

const eventIcons: Record<string, string> = {
  check_in: mdiLoginVariant,
  message: mdiMessageTextOutline,
  upsell: mdiArrowUpBoldOutline,
  service_ticket: mdiTicketOutline,
  ai_response: mdiRobotOutline,
  sentiment_flag: mdiAlertOutline,
};

const eventColors: Record<string, string> = {
  check_in: 'text-emerald-500',
  message: 'text-blue-500',
  upsell: 'text-purple-500',
  service_ticket: 'text-orange-500',
  ai_response: 'text-blue-400',
  sentiment_flag: 'text-red-500',
};

interface ContextPanelProps {
  thread: CommandCenterThread;
}

export function ContextPanel({ thread }: ContextPanelProps) {
  const guest = guests[thread.guestId];
  const reservation = reservations[thread.reservationId];
  const prefs = guestPreferences[thread.guestId];
  const events = activityEvents[thread.guestId];

  if (!guest) return null;

  return (
    <div className="w-[300px] h-full border-l border-gray-200 bg-gray-50 overflow-y-auto shrink-0">
      {/* Guest profile */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          {guest.avatar ? (
            <img src={guest.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
              {guest.initials}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-[14px] font-semibold text-gray-900 truncate">{guest.name}</h3>
            {guest.statusTag && (
              <span
                className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase mt-0.5"
                style={{ backgroundColor: guest.statusTag.color, color: guest.statusTag.textColor || 'white' }}
              >
                {guest.statusTag.label}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-1.5 text-[12px]">
          {guest.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <Icon path={mdiPhoneOutline} size={0.55} className="text-gray-400 shrink-0" />
              <span>{guest.phone}</span>
            </div>
          )}
          {guest.email && (
            <div className="flex items-center gap-2 text-gray-600">
              <Icon path={mdiEmailOutline} size={0.55} className="text-gray-400 shrink-0" />
              <span className="truncate">{guest.email}</span>
            </div>
          )}
          {guest.preferredLanguage && (
            <div className="flex items-center gap-2 text-gray-600">
              <Icon path={mdiTranslate} size={0.55} className="text-gray-400 shrink-0" />
              <span>{guest.preferredLanguage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Reservation */}
      {reservation && (
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Icon path={mdiCalendarOutline} size={0.6} className="text-gray-500" />
            <span className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide">Reservation</span>
          </div>
          <div className="space-y-1.5 text-[12px]">
            <div className="flex justify-between">
              <span className="text-gray-500">Room</span>
              <span className="font-medium text-gray-800">{reservation.room || '—'} {reservation.roomType && `(${reservation.roomType})`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Check-in</span>
              <span className="font-medium text-gray-800">{reservation.checkInDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Check-out</span>
              <span className="font-medium text-gray-800">{reservation.checkOutDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Confirmation</span>
              <span className="font-medium text-gray-800 text-[11px]">{reservation.confirmationCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className={`font-medium capitalize ${reservation.status === 'checked-in' ? 'text-emerald-600' : 'text-gray-800'}`}>
                {reservation.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Guest preferences */}
      {prefs && (
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Icon path={mdiAccountOutline} size={0.6} className="text-gray-500" />
            <span className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide">Preferences</span>
          </div>
          <div className="space-y-1.5 text-[12px]">
            {prefs.coffeePreference && (
              <div className="flex items-center gap-2">
                <Icon path={mdiCoffeeOutline} size={0.5} className="text-gray-400" />
                <span className="text-gray-600">{prefs.coffeePreference}</span>
              </div>
            )}
            {prefs.pillow && (
              <div className="flex items-center gap-2">
                <Icon path={mdiBedOutline} size={0.5} className="text-gray-400" />
                <span className="text-gray-600">{prefs.pillow} pillow</span>
              </div>
            )}
            {prefs.roomTemp && (
              <div className="flex items-center gap-2">
                <Icon path={mdiThermometer} size={0.5} className="text-gray-400" />
                <span className="text-gray-600">{prefs.roomTemp}</span>
              </div>
            )}
            {prefs.dietaryRestrictions && (
              <div className="flex items-center gap-2">
                <Icon path={mdiFoodOutline} size={0.5} className="text-gray-400" />
                <span className="text-gray-600">{prefs.dietaryRestrictions}</span>
              </div>
            )}
            {prefs.notes && prefs.notes.map((note, i) => (
              <div key={i} className="flex items-start gap-2">
                <Icon path={mdiNoteTextOutline} size={0.5} className="text-gray-400 mt-0.5" />
                <span className="text-gray-600">{note}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity timeline */}
      {events && events.length > 0 && (
        <div className="p-4 bg-white">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Icon path={mdiTimelineClockOutline} size={0.6} className="text-gray-500" />
            <span className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide">Activity</span>
          </div>
          <div className="space-y-2.5">
            {events.slice().reverse().map((event) => (
              <div key={event.id} className="flex items-start gap-2">
                <div className="mt-0.5">
                  <Icon
                    path={eventIcons[event.type] || mdiNoteTextOutline}
                    size={0.5}
                    className={eventColors[event.type] || 'text-gray-400'}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-gray-700 leading-snug">{event.description}</p>
                  <span className="text-[10px] text-gray-400">{format(event.timestamp, 'MMM d, h:mm a')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
