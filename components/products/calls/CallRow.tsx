/**
 * CallRow Component
 *
 * A single row in the calls list displaying guest info, summary, and forward category.
 * Adapts layout based on view type (missed_by_front_desk vs completed).
 */

'use client';

import React, { useState } from 'react';
import { CanaryTag, TagSize, TagVariant, colors } from '@canary-ui/components';
import type { CallSummary, CallFilter, CallTerminalState } from '@/lib/products/calls/dashboard-types';
import { formatCallDate } from '@/lib/products/calls/dashboard-mock-data';

interface CallRowProps {
  call: CallSummary;
  onClick: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  viewType?: CallFilter;
}

function getStatusTagProps(state?: CallTerminalState): {
  label: string;
  customColor: { backgroundColor: string; fontColor: string };
} {
  switch (state) {
    case 'handled':
      return {
        label: 'HANDLED',
        customColor: { backgroundColor: colors.colorLightGreen5, fontColor: colors.colorLightGreen1 },
      };
    case 'transferred':
      return {
        label: 'TRANSFERRED',
        customColor: { backgroundColor: colors.colorBlueDark5, fontColor: colors.colorBlueDark1 },
      };
    default:
      return {
        label: 'NO CONVERSATION',
        customColor: { backgroundColor: colors.colorBlack6, fontColor: colors.colorBlack3 },
      };
  }
}

export function CallRow({ call, onClick, isFirst = false, isLast = false, viewType = 'missed_by_front_desk' }: CallRowProps) {
  const [isHovered, setIsHovered] = useState(false);
  const guestName = call.guest?.name || '';
  const phoneNumber = call.phone_number;
  const callDate = formatCallDate(call.call_start_date);
  const summary = call.call?.summary || '';
  const forwardCategory = call.call?.forward_category || '';
  const forwardReason = call.call?.forward_reason || '';

  const isCompletedView = viewType === 'completed';
  const statusTagProps = getStatusTagProps(call.terminal_state);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`grid gap-4 p-4 items-center cursor-pointer transition-colors ${
        isCompletedView ? 'grid-cols-[0.5fr_1.5fr_0.5fr_1fr]' : 'grid-cols-[0.5fr_1.5fr_1fr]'
      }`}
      style={{
        backgroundColor: isHovered ? colors.colorBlack8 : colors.colorWhite,
        borderTop: isFirst ? 'none' : `1px solid ${colors.colorBlack6}`,
        borderRadius: isFirst ? '7px 7px 0 0' : isLast ? '0 0 7px 7px' : '0',
      }}
    >
      {/* Guest Information */}
      <div className="flex flex-col gap-0.5">
        {guestName && (
          <div
            className="font-['Roboto',sans-serif] font-medium text-[14px]"
            style={{ color: colors.colorBlack1 }}
          >
            {guestName}
          </div>
        )}
        <div
          className="font-['Roboto',sans-serif] text-[14px]"
          style={{ color: colors.colorBlack1 }}
        >
          {phoneNumber}
        </div>
        <div
          className="font-['Roboto',sans-serif] text-[12px]"
          style={{ color: colors.colorBlack3 }}
        >
          {callDate}
        </div>
      </div>

      {/* Summary */}
      <div
        className="font-['Roboto',sans-serif] text-[14px] leading-[22px] line-clamp-3"
        style={{ color: colors.colorBlack1 }}
      >
        {summary}
      </div>

      {/* Handle Status - Only for completed view */}
      {isCompletedView && (
        <div>
          <CanaryTag
            label={statusTagProps.label}
            size={TagSize.COMPACT}
            variant={TagVariant.FILLED}
            customColor={statusTagProps.customColor}
          />
        </div>
      )}

      {/* Forward Category and Reason */}
      <div className="flex flex-col gap-1">
        {forwardCategory ? (
          <>
            <div
              className="font-['Roboto',sans-serif] font-medium text-[14px]"
              style={{ color: colors.colorBlack1 }}
            >
              {forwardCategory}
            </div>
            {forwardReason && (
              <div
                className="font-['Roboto',sans-serif] text-[14px] leading-[22px] line-clamp-2"
                style={{ color: colors.colorBlack3 }}
              >
                {forwardReason}
              </div>
            )}
          </>
        ) : (
          isCompletedView && (
            <div
              className="font-['Roboto',sans-serif] text-[14px]"
              style={{ color: colors.colorBlack3 }}
            >
              ∅
            </div>
          )
        )}
      </div>
    </div>
  );
}
