/**
 * ArrivalCard Component
 *
 * Displays a guest in the right pane grid (verified or checked-in).
 * Derives from CheckInSubmission — no separate Arrival type.
 *
 * Layout matches production:
 *   - Outer card has border + ~4px padding
 *   - Inner grid: content row + action row (gap, no explicit separator)
 *   - Action area (key+check-in, "Room not assigned", or "Checked In")
 */

'use client';

import React from 'react';
import { CanaryButton, CanaryTag, ButtonSize, ButtonType, TagSize, TagVariant, colors } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiKeyOutline, mdiCheck, mdiBedOutline, mdiFlag } from '@mdi/js';
import { Avatar } from '../messaging/Avatar';
import { CheckInSubmission } from '@/lib/products/check-in/types';
import { Guest } from '@/lib/core/types/guest';
import { Reservation } from '@/lib/core/types/reservation';

interface ArrivalCardProps {
  submission: CheckInSubmission;
  guest: Guest;
  reservation?: Reservation;
  onClick?: () => void;
  onMobileKey?: () => void;
  onCheckIn?: () => void;
}

export function ArrivalCard({
  submission,
  guest,
  reservation,
  onClick,
  onMobileKey,
  onCheckIn,
}: ArrivalCardProps) {
  const isCheckedIn = submission.status === 'checked_in';
  const hasRoom = Boolean(reservation?.room);

  return (
    <div
      onClick={onClick}
      className="w-[180px] shrink-0 bg-white cursor-pointer hover:bg-gray-50 transition-colors border border-gray-200 rounded-lg p-1"
    >
      {/* Content area */}
      <div className="flex flex-col items-center gap-1 px-1 pt-1 pb-2">
        {/* Avatar — larger than default medium for card context */}
        <div className="mb-1">
          <Avatar
            src={guest.avatar}
            initials={guest.initials}
            size="medium"
            className="!w-[80px] !h-[80px] !text-xl"
          />
        </div>

        {/* Guest Name */}
        <p
          className="text-[14px] leading-[22px] font-medium text-center truncate w-full"
          style={{ color: colors.colorBlack1 }}
          title={guest.name}
        >
          {guest.name}
        </p>

        {/* Info Strip: Time/InHouse + Room + Flag */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {isCheckedIn ? (
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
            submission.arrivalTime && (
              <CanaryTag
                label={submission.arrivalTime}
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

          {hasRoom && (
            <div className="flex items-center gap-1">
              <Icon
                path={mdiBedOutline}
                size={0.6}
                color={colors.colorBlack3}
              />
              <span
                className="text-[12px] leading-[18px] font-medium"
                style={{ color: colors.colorBlack3 }}
              >
                {reservation?.room}
              </span>
            </div>
          )}

          {/* Flag — sits inline after room (or after time if no room) */}
          {submission.isFlagged && (
            <Icon
              path={mdiFlag}
              size={0.6}
              color={colors.error}
            />
          )}
        </div>
      </div>

      {/* Separator — for text-only action states (not buttons which self-separate) */}
      {(isCheckedIn || !hasRoom) && (
        <div className="border-t border-gray-200 mx-1" />
      )}

      {/* Action area */}
      <div className="flex items-center justify-center">
        {isCheckedIn ? (
          <div
            className="flex items-center gap-1.5 text-[12px] font-medium"
            style={{ color: colors.colorBlack4 }}
          >
            <Icon path={mdiCheck} size={1} color={colors.success} />
            <span>Checked In</span>
          </div>
        ) : hasRoom ? (
          <div className="flex items-center gap-1 w-full">
            {/* Key button — square, 4px radius, light blue bg, matches button height */}
            <button
              type="button"
              className="flex items-center justify-center w-8 h-8 shrink-0 rounded cursor-pointer"
              style={{ backgroundColor: '#EAEEF9' }}
              onClick={(e) => {
                e.stopPropagation();
                onMobileKey?.();
              }}
            >
              <Icon path={mdiKeyOutline} size={0.65} color={colors.colorBlueDark1} />
            </button>
            <CanaryButton
              type={ButtonType.SHADED}
              size={ButtonSize.COMPACT}
              isExpanded
              onClick={(e) => {
                e.stopPropagation();
                onCheckIn?.();
              }}
            >
              Checked in?
            </CanaryButton>
          </div>
        ) : (
          <span
            className="text-[12px] font-medium"
            style={{ color: colors.colorBlack4 }}
          >
            Room not assigned
          </span>
        )}
      </div>
    </div>
  );
}
