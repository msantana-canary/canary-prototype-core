/**
 * CheckOutListItem Component
 *
 * Displays a single checkout submission in the scrollable list.
 * Layout: Avatar | Name+Tags+Room | Action Button
 * For processed items: also shows eFolio signed text and star rating.
 */

'use client';

import React from 'react';
import {
  CanaryButton,
  CanaryTag,
  ButtonSize,
  ButtonType,
  TagColor,
  TagSize,
  TagVariant,
  colors,
} from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiBedOutline, mdiStar, mdiStarOutline, mdiDrawPen, mdiTextBoxEditOutline } from '@mdi/js';
import { Avatar } from '../messaging/Avatar';
import { CheckOutSubmission, loyaltyColors } from '@/lib/products/checkout/types';
import { Guest } from '@/lib/core/types/guest';
import { Reservation } from '@/lib/core/types/reservation';

interface CheckOutListItemProps {
  submission: CheckOutSubmission;
  guest: Guest;
  reservation?: Reservation;
  onClick?: () => void;
  onMessage?: () => void;
}

export function CheckOutListItem({
  submission,
  guest,
  reservation,
  onClick,
  onMessage,
}: CheckOutListItemProps) {
  const loyaltyLabel = guest.statusTag?.label;
  const shortLoyaltyLabel = loyaltyLabel?.replace(' ELITE', '');
  const loyaltyStyle = loyaltyLabel
    ? loyaltyColors[loyaltyLabel] || loyaltyColors[shortLoyaltyLabel || '']
    : null;

  const isProcessed = submission.folder === 'processed' || submission.folder === 'archived';

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

        {/* Middle: Name + Tags + Room */}
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

          {/* Row 2: Departure Time + Room + (processed: eFolio signed + Stars) */}
          <div className="flex items-center gap-3 mt-0.5">
            {submission.departureTime && (
              <CanaryTag
                label={submission.departureTime}
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
              </div>
            )}

            {isProcessed && submission.folioStatus === 'signed_on_tablet' && (
              <div className="flex items-center gap-1">
                <Icon
                  path={mdiDrawPen}
                  size={0.55}
                  color={colors.colorBlack1}
                />
                <span
                  className="text-[12px]"
                  style={{ color: colors.colorBlack3 }}
                >
                  eFolio signed
                </span>
              </div>
            )}

            {isProcessed && submission.autoCheckoutStatus && (
              <CanaryTag
                label={submission.autoCheckoutStatus === 'completed' ? 'Auto-checkout' : submission.autoCheckoutStatus === 'failed' ? 'Auto-checkout failed' : 'Auto-checkout scheduled'}
                size={TagSize.COMPACT}
                color={submission.autoCheckoutStatus === 'completed' ? TagColor.SUCCESS : submission.autoCheckoutStatus === 'failed' ? TagColor.ERROR : TagColor.WARNING}
                uppercase={false}
              />
            )}
          </div>
        </div>

        {/* Right: Action Button or Star Rating */}
        <div className="shrink-0 flex items-center gap-3">
          {guest.phone && !isProcessed && (
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
          {/* Review indicators + Star rating for processed items */}
          {isProcessed && (
            <div className="flex items-center gap-2">
              {/* Internal review indicator — only show if no external review */}
              {submission.hasInternalReview && !submission.tripadvisorClicked && !submission.googleReviewClicked && (
                <Icon
                  path={mdiTextBoxEditOutline}
                  size={0.7}
                  color={colors.colorBlack1}
                />
              )}

              {/* Tripadvisor indicator */}
              {submission.tripadvisorClicked && (
                <div
                  className="flex items-center justify-center rounded-full shrink-0"
                  style={{ width: 20, height: 20, backgroundColor: '#34E0A1' }}
                >
                  <img src="/icons/tripadvisor.svg" alt="TripAdvisor" style={{ width: 14, height: 14 }} />
                </div>
              )}

              {/* Google review indicator */}
              {submission.googleReviewClicked && (
                <img src="/icons/google-reviews.svg" alt="Google Reviews" className="shrink-0" style={{ width: 20, height: 20 }} />
              )}

              {/* Star rating */}
              {submission.guestRating != null && submission.guestRating > 0 && (
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icon
                      key={star}
                      path={star <= submission.guestRating! ? mdiStar : mdiStarOutline}
                      size={0.7}
                      color={star <= submission.guestRating! ? '#FAB541' : colors.colorBlack5}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
