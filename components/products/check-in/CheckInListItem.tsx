/**
 * CheckInListItem Component
 *
 * Displays a single check-in submission in the left pane list.
 * 3-column layout: Avatar | Name+Tags | Action Button
 * CTA varies by submission status.
 */

'use client';

import React from 'react';
import { CanaryButton, CanaryTag, ButtonSize, ButtonType, TagSize, TagVariant, colors } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiBedOutline, mdiFlag } from '@mdi/js';
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
  onMessage?: () => void;
}

export function CheckInListItem({
  submission,
  guest,
  reservation,
  onClick,
  onVerify,
  onSendToTablet,
  onMessage,
}: CheckInListItemProps) {
  const loyaltyLabel = guest.statusTag?.label;
  const shortLoyaltyLabel = loyaltyLabel?.replace(' ELITE', '');
  const loyaltyStyle = loyaltyLabel ? loyaltyColors[loyaltyLabel] || loyaltyColors[shortLoyaltyLabel || ''] : null;

  const showTimeTag = submission.status === 'submitted' || submission.status === 'partially_submitted';

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

          {/* Row 2: Arrival Time + Room + Flag */}
          <div className="flex items-center gap-3 mt-0.5">
            {showTimeTag && submission.arrivalTime && (
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
                {/* TODO: re-enable flags when flag workflow is built
                {submission.isFlagged && (
                  <Icon
                    path={mdiFlag}
                    size={0.55}
                    color={colors.error}
                  />
                )} */}
              </div>
            )}
          </div>
        </div>

        {/* Right: Action Button */}
        <div className="shrink-0">
          {submission.status === 'submitted' && (
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
          )}
          {submission.status === 'pending' && (
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
          {(submission.status === 'checked_in' || submission.isArchived) && (
            <CanaryButton
              type={ButtonType.SHADED}
              size={ButtonSize.COMPACT}
              onClick={(e) => {
                e.stopPropagation();
                onMessage?.();
              }}
            >
              Message
            </CanaryButton>
          )}
          {/* partially_submitted: no button */}
        </div>
      </div>
    </li>
  );
}
