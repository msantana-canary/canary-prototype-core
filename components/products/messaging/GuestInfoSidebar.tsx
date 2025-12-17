/**
 * GuestInfoSidebar Component
 *
 * Right sidebar displaying guest/reservation details,
 * service tasks, and call history.
 */

'use client';

import React from 'react';
import { Guest } from '@/lib/core/types/guest';
import { Reservation } from '@/lib/core/types/reservation';
import Icon from '@mdi/react';
import {
  mdiAccountOutline,
  mdiPhoneOutline,
  mdiEmailOutline,
  mdiTranslate,
  mdiCalendarBlank,
  mdiBedOutline,
  mdiPound,
  mdiLogin,
  mdiLogout,
  mdiClose,
  mdiRefresh,
  mdiPlus,
  mdiAccountMultipleOutline,
  mdiOpenInNew,
} from '@mdi/js';

interface GuestInfoSidebarProps {
  guest: Guest;
  reservation: Reservation | null;
  isOpen: boolean;
  onClose: () => void;
}

export function GuestInfoSidebar({ guest, reservation, isOpen, onClose }: GuestInfoSidebarProps) {
  return (
    <div
      className={`fixed right-0 top-[56px] overflow-y-auto transition-transform duration-300 ease-in-out shadow-lg ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{
        width: '400px',
        height: 'calc(100vh - 56px)',
        backgroundColor: '#fafafa',
        zIndex: 40
      }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-['Roboto',sans-serif] font-medium text-[18px] leading-[27px] text-black">
            Reservation details
          </h2>
          <button
            onClick={onClose}
            className="w-[30px] h-[30px] flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors"
          >
            <Icon path={mdiClose} size={0.67} color="#000000" />
          </button>
        </div>

        {/* Contact Information Section */}
        <div className="space-y-3">
          {/* Guest Name */}
          <div className="flex items-center gap-4">
            <Icon path={mdiAccountOutline} size={0.83} color="#000000" />
            <span className="font-['Roboto',sans-serif] text-[14px] leading-[21px] text-black">
              {guest.name}
            </span>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-4">
            <Icon path={mdiPhoneOutline} size={0.83} color="#000000" />
            <span className="font-['Roboto',sans-serif] text-[14px] leading-[21px] text-black">
              {guest.phone || 'No number assigned'}
            </span>
          </div>

          {/* Email */}
          <div className="flex items-center gap-4">
            <Icon path={mdiEmailOutline} size={0.83} color="#000000" />
            <span className="font-['Roboto',sans-serif] text-[14px] leading-[21px] text-black">
              {guest.email || 'No email assigned'}
            </span>
          </div>

          {/* Language */}
          <div className="flex items-center gap-4">
            <Icon path={mdiTranslate} size={0.83} color="#000000" />
            <span className="font-['Roboto',sans-serif] text-[14px] leading-[21px] text-black">
              {guest.preferredLanguage || 'English'} (preferred language)
            </span>
          </div>

          {/* Dates */}
          {reservation?.checkInDate && reservation?.checkOutDate && (
            <div className="flex items-center gap-4">
              <Icon path={mdiCalendarBlank} size={0.83} color="#000000" />
              <span className="font-['Roboto',sans-serif] text-[14px] leading-[21px] text-black">
                {reservation.checkInDate} - {reservation.checkOutDate}
              </span>
            </div>
          )}

          {/* Room */}
          {reservation?.room && (
            <div className="flex items-center gap-4">
              <Icon path={mdiBedOutline} size={0.83} color="#000000" />
              <span className="font-['Roboto',sans-serif] text-[14px] leading-[21px] text-black">
                {reservation.room}
              </span>
            </div>
          )}

          {/* Confirmation Code */}
          {reservation?.confirmationCode && (
            <div className="flex items-center gap-4">
              <Icon path={mdiPound} size={0.83} color="#000000" />
              <span className="font-['Roboto',sans-serif] text-[14px] leading-[21px] text-black">
                {reservation.confirmationCode}
              </span>
            </div>
          )}

          {/* Check-in Status */}
          <div className="flex items-center gap-4">
            <Icon path={mdiLogin} size={0.83} color="#000000" />
            <span className="font-['Roboto',sans-serif] text-[14px] leading-[21px] text-black flex-1">
              {reservation?.checkInStatus || 'Not Started'}
            </span>
            {reservation?.checkInStatus && (
              <button className="w-[30px] h-[30px] flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors">
                <Icon path={mdiOpenInNew} size={0.67} color="#000000" />
              </button>
            )}
          </div>

          {/* Check-out Status */}
          <div className="flex items-center gap-4">
            <Icon path={mdiLogout} size={0.83} color="#000000" />
            <span className="font-['Roboto',sans-serif] text-[14px] leading-[21px] text-black flex-1">
              {reservation?.checkOutStatus || '--'}
            </span>
            {reservation?.checkOutStatus && (
              <button className="w-[30px] h-[30px] flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors">
                <Icon path={mdiOpenInNew} size={0.67} color="#000000" />
              </button>
            )}
          </div>

          {/* Assign to Staff */}
          <div className="flex items-center gap-4">
            <Icon path={mdiAccountMultipleOutline} size={0.83} color="#000000" />
            <button
              className="font-['Roboto',sans-serif] text-[14px] leading-[21px] text-[#2858c4] hover:underline"
              onClick={() => console.log('Assign to staff')}
            >
              Assign to staff
            </button>
          </div>
        </div>

        {/* Service Tasks Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-['Roboto',sans-serif] font-medium text-[18px] leading-[27px] text-black">
              Service Tasks
            </h3>
            <div className="flex gap-1">
              <button
                className="w-[30px] h-[30px] flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors"
                onClick={() => console.log('Refresh service tasks')}
              >
                <Icon path={mdiRefresh} size={0.67} color="#000000" />
              </button>
              <button
                className="w-[30px] h-[30px] flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors"
                onClick={() => console.log('Add service task')}
              >
                <Icon path={mdiPlus} size={0.67} color="#000000" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center py-4">
            <span className="font-['Roboto',sans-serif] text-[14px] leading-[21px] text-[#666666]">
              No service tickets
            </span>
          </div>
        </div>

        {/* Call History Section */}
        <div className="mt-8">
          <div className="mb-4">
            <h3 className="font-['Roboto',sans-serif] font-medium text-[18px] leading-[27px] text-black">
              Call History
            </h3>
          </div>
          <div className="flex items-center justify-center py-4">
            <span className="font-['Roboto',sans-serif] text-[14px] leading-[21px] text-[#666666]">
              No call history
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
