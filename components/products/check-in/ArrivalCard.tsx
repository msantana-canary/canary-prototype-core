/**
 * ArrivalCard Component
 *
 * Displays a guest arrival card in the right pane grid.
 * Shows guest photo, name, arrival time, room, and action buttons.
 */

'use client';

import React from 'react';
import { CanaryTag, CanaryButton, TagSize, TagVariant, ButtonSize, ButtonType, colors } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiCellphoneKey, mdiCheckCircleOutline } from '@mdi/js';
import { Avatar } from '../messaging/Avatar';
import { Arrival } from '@/lib/products/check-in/types';
import { Guest } from '@/lib/core/types/guest';
import { Reservation } from '@/lib/core/types/reservation';

interface ArrivalCardProps {
  arrival: Arrival;
  guest: Guest;
  reservation?: Reservation;
  onClick?: () => void;
  onMobileKey?: () => void;
  onCheckIn?: () => void;
}

export function ArrivalCard({
  arrival,
  guest,
  reservation,
  onClick,
  onMobileKey,
  onCheckIn,
}: ArrivalCardProps) {
  const isCheckedIn = arrival.arrivalStatus === 'checked-in';

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-lg border border-gray-200 p-4 cursor-pointer
        hover:shadow-md transition-shadow
        ${isCheckedIn ? 'opacity-75' : ''}
      `}
    >
      {/* Guest Photo */}
      <div className="flex justify-center mb-3">
        <Avatar
          src={guest.avatar}
          initials={guest.initials}
          size="large"
        />
      </div>

      {/* Guest Name */}
      <p
        className="text-sm font-medium text-center truncate mb-2"
        style={{ color: colors.colorBlack1 }}
        title={guest.name}
      >
        {guest.name}
      </p>

      {/* Badges Row */}
      <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
        {/* Arrival Time Badge */}
        {arrival.arrivalTime && (
          <CanaryTag
            label={isCheckedIn ? `In: ${arrival.checkInTime || arrival.arrivalTime}` : arrival.arrivalTime}
            size={TagSize.COMPACT}
            variant={TagVariant.OUTLINE}
            customColor={{
              backgroundColor: isCheckedIn ? colors.colorLightGreen5 : colors.colorBlack7,
              borderColor: isCheckedIn ? colors.success : colors.colorBlack5,
              fontColor: isCheckedIn ? colors.success : colors.colorBlack2,
            }}
            uppercase={false}
          />
        )}

        {/* Room Number */}
        {reservation?.room && (
          <span
            className="text-[11px] uppercase"
            style={{ color: colors.colorBlack3 }}
          >
            {reservation.room}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-2">
        {/* Mobile Key Button */}
        {!isCheckedIn && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMobileKey?.();
            }}
            className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 transition-colors"
            title="Send mobile key"
          >
            <Icon path={mdiCellphoneKey} size={0.7} color={colors.colorBlack3} />
          </button>
        )}

        {/* Checked In Button */}
        {!isCheckedIn ? (
          <CanaryButton
            type={ButtonType.OUTLINED}
            size={ButtonSize.COMPACT}
            onClick={(e) => {
              e.stopPropagation();
              onCheckIn?.();
            }}
          >
            Checked in?
          </CanaryButton>
        ) : (
          <div className="flex items-center gap-1 text-xs" style={{ color: colors.success }}>
            <Icon path={mdiCheckCircleOutline} size={0.6} />
            <span>Checked in</span>
          </div>
        )}
      </div>
    </div>
  );
}
