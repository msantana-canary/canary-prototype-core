/**
 * ArrivalCard Component
 *
 * Displays a guest arrival in the right pane grid.
 * Compact layout: Avatar | Name + Time + Room | Actions
 */

'use client';

import React from 'react';
import { CanaryButton, CanaryTag, ButtonSize, ButtonType, TagSize, TagVariant, colors } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiKey, mdiCheck, mdiBedOutline } from '@mdi/js';
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
  const hasRoom = Boolean(reservation?.room);

  return (
    <div
      onClick={onClick}
      className="cursor-pointer hover:bg-gray-50 transition-colors p-3"
    >
      {/* Main Content Grid */}
      <div className="flex flex-col gap-1">
        {/* Avatar */}
        <div className="flex justify-center mb-1">
          <Avatar
            src={guest.avatar}
            initials={guest.initials}
            size="medium"
          />
        </div>

        {/* Guest Name */}
        <p
          className="text-[14px] leading-[1.5] font-medium text-center truncate"
          style={{ color: colors.colorBlack1 }}
          title={guest.name}
        >
          {guest.name}
        </p>

        {/* Arrival Strip: Time + Room */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {isCheckedIn ? (
            /* In house tag for checked-in guests */
            <CanaryTag
              label="In house"
              size={TagSize.COMPACT}
              variant={TagVariant.FILLED}
              customColor={{
                backgroundColor: colors.colorBlack6,
                borderColor: colors.colorBlack4,
                fontColor: colors.colorBlack2,
              }}
              uppercase={false}
            />
          ) : (
            /* Arrival time badge */
            arrival.arrivalTime && (
              <CanaryTag
                label={arrival.arrivalTime}
                size={TagSize.COMPACT}
                variant={TagVariant.FILLED}
                customColor={{
                  backgroundColor: colors.colorBlack6,
                  fontColor: colors.colorBlack2,
                }}
                uppercase={false}
              />
            )
          )}

          {/* Room Number */}
          {hasRoom && (
            <div className="flex items-center gap-1">
              <Icon
                path={mdiBedOutline}
                size={0.6}
                color={colors.colorBlack3}
              />
              <span
                className="text-[12px] leading-[1.5] font-medium"
                style={{ color: colors.colorBlack3 }}
              >
                {reservation?.room}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-2 mt-2">
          {isCheckedIn ? (
            /* Checked in state */
            <div
              className="flex items-center gap-1 text-[12px] font-medium"
              style={{ color: colors.success }}
            >
              <Icon path={mdiCheck} size={0.6} color={colors.success} />
              <span>Checked In</span>
            </div>
          ) : hasRoom ? (
            /* Has room - show action buttons */
            <>
              <CanaryButton
                type={ButtonType.ICON_SECONDARY}
                size={ButtonSize.COMPACT}
                onClick={(e) => {
                  e.stopPropagation();
                  onMobileKey?.();
                }}
                icon={<Icon path={mdiKey} size={0.8} color={colors.colorBlueDark1} />}
              />
              <CanaryButton
                type={ButtonType.SHADED}
                size={ButtonSize.COMPACT}
                onClick={(e) => {
                  e.stopPropagation();
                  onCheckIn?.();
                }}
              >
                Checked in?
              </CanaryButton>
            </>
          ) : (
            /* No room assigned */
            <span
              className="text-[12px] font-medium"
              style={{ color: colors.colorBlack3 }}
            >
              Room not assigned
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
