/**
 * LateCheckoutRequestItem Component
 *
 * A row in the "Pending late checkout requests" section.
 * Shows Avatar + Name + bed icon + room on the left,
 * "Late Check Out (time) * $price" + Deny + Approve on the right.
 */

'use client';

import React from 'react';
import {
  CanaryButton,
  ButtonSize,
  ButtonType,
  ButtonColor,
  colors,
} from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiBedOutline } from '@mdi/js';
import { Avatar } from '../messaging/Avatar';
import { CheckOutSubmission } from '@/lib/products/checkout/types';
import { Guest } from '@/lib/core/types/guest';
import { Reservation } from '@/lib/core/types/reservation';

interface LateCheckoutRequestItemProps {
  submission: CheckOutSubmission;
  guest: Guest;
  reservation?: Reservation;
  onApprove: (id: string) => void;
  onDeny: (id: string) => void;
}

export function LateCheckoutRequestItem({
  submission,
  guest,
  reservation,
  onApprove,
  onDeny,
}: LateCheckoutRequestItemProps) {
  return (
    <li className="flex items-center px-4 py-3 gap-3">
      {/* Left: Avatar + Name + Room */}
      <div className="shrink-0">
        <Avatar
          src={guest.avatar}
          initials={guest.initials}
          size="small"
        />
      </div>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span
          className="text-[14px] leading-[1.5] font-medium truncate"
          style={{ color: colors.colorBlack1 }}
        >
          {guest.name}
        </span>

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

      {/* Right: Late checkout info + Deny + Approve */}
      <div className="shrink-0 flex items-center gap-3">
        <span
          className="text-[13px]"
          style={{ color: colors.colorBlack3 }}
        >
          Late Check Out ({submission.lateCheckoutTime})
          {submission.lateCheckoutPrice != null && submission.lateCheckoutPrice > 0
            ? ` \u00B7 $${submission.lateCheckoutPrice}`
            : ''}
        </span>

        <CanaryButton
          type={ButtonType.SHADED}
          size={ButtonSize.COMPACT}
          color={ButtonColor.DANGER}
          onClick={(e) => {
            e.stopPropagation();
            onDeny(submission.id);
          }}
        >
          Deny
        </CanaryButton>

        <CanaryButton
          type={ButtonType.PRIMARY}
          size={ButtonSize.COMPACT}
          onClick={(e) => {
            e.stopPropagation();
            onApprove(submission.id);
          }}
        >
          Approve
        </CanaryButton>
      </div>
    </li>
  );
}
