/**
 * CheckInListItem Component
 *
 * Displays a single check-in submission in the left pane list.
 * 3-column layout: Avatar | Name+Tags | Action Button
 */

'use client';

import React from 'react';
import { CanaryButton, CanaryTag, ButtonSize, ButtonType, TagSize, TagVariant, colors } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiBedOutline } from '@mdi/js';
import { Avatar } from '../messaging/Avatar';
import { CheckInSubmission, loyaltyColors } from '@/lib/products/check-in/types';
import { Guest } from '@/lib/core/types/guest';
import { Reservation } from '@/lib/core/types/reservation';

interface CheckInListItemProps {
  submission: CheckInSubmission;
  guest: Guest;
  reservation?: Reservation;
  onClick?: () => void;
  onVerify?: () => void;
  onSendToTablet?: () => void;
}

export function CheckInListItem({
  submission,
  guest,
  reservation,
  onClick,
  onVerify,
  onSendToTablet,
}: CheckInListItemProps) {
  // Get loyalty tier info
  const loyaltyLabel = guest.statusTag?.label;
  const shortLoyaltyLabel = loyaltyLabel?.replace(' ELITE', '');
  const loyaltyStyle = loyaltyLabel ? loyaltyColors[loyaltyLabel] || loyaltyColors[shortLoyaltyLabel || ''] : null;

  const isCompleted = submission.status === 'completed';

  return (
    <li
      role="button"
      tabIndex={0}
      onClick={onClick}
      className="cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center px-4 py-3 gap-3">
        {/* Left: Avatar */}
        <div className="shrink-0">
          <Avatar
            src={guest.avatar}
            initials={guest.initials}
            size="small"
          />
        </div>

        {/* Middle: Name + Tags */}
        <div className="flex-1 min-w-0">
          {/* Row 1: Name + Loyalty Badge */}
          <div className="flex items-center gap-2">
            <span
              className="text-[14px] leading-[1.5] font-medium truncate"
              style={{ color: colors.colorBlack1 }}
            >
              {guest.name}
            </span>
            {/* Loyalty Badge - inline */}
            {loyaltyStyle && shortLoyaltyLabel && (
              <CanaryTag
                label={shortLoyaltyLabel}
                size={TagSize.COMPACT}
                variant={TagVariant.OUTLINE}
                customColor={{
                  backgroundColor: loyaltyStyle.background,
                  borderColor: loyaltyStyle.border,
                  fontColor: loyaltyStyle.text,
                }}
                uppercase={false}
              />
            )}
          </div>

          {/* Row 2: Arrival Time + Room */}
          <div className="flex items-center gap-3 mt-0.5">
            {/* Arrival Time - only on completed */}
            {isCompleted && submission.arrivalTime && (
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
            )}

            {/* Room with bed icon */}
            {reservation?.room && (
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
                  {reservation.room}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Action Button */}
        <div className="shrink-0">
          {isCompleted ? (
            <CanaryButton
              type={ButtonType.SHADED}
              size={ButtonSize.COMPACT}
              onClick={(e) => {
                e.stopPropagation();
                onVerify?.();
              }}
            >
              Verify
            </CanaryButton>
          ) : (
            <CanaryButton
              type={ButtonType.SHADED}
              size={ButtonSize.COMPACT}
              onClick={(e) => {
                e.stopPropagation();
                onSendToTablet?.();
              }}
            >
              Send to Tablet
            </CanaryButton>
          )}
        </div>
      </div>
    </li>
  );
}
