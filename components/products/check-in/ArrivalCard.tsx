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

import React, { useState } from 'react';
import { CanaryButton, CanaryTag, ButtonSize, ButtonType, TagSize, TagVariant, colors } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiKeyOutline, mdiCheck, mdiBedOutline, mdiFlag, mdiClose } from '@mdi/js';
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
  const [showKeyOverlay, setShowKeyOverlay] = useState(false);
  const [showCheckInOverlay, setShowCheckInOverlay] = useState(false);

  return (
    <div
      onClick={onClick}
      className="w-[180px] shrink-0 bg-white cursor-pointer hover:bg-gray-50 transition-colors border border-gray-200 rounded-lg p-1 relative overflow-hidden"
    >
      {/* Key activation overlay */}
      {showKeyOverlay && (
        <div
          className="absolute inset-0 z-10 bg-white rounded-lg flex flex-col animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <div className="flex justify-end p-1">
            <CanaryButton
              type={ButtonType.ICON_SECONDARY}
              size={ButtonSize.COMPACT}
              icon={<Icon path={mdiClose} size={0.7} color={colors.colorBlueDark1} />}
              onClick={() => setShowKeyOverlay(false)}
            />
          </div>

          {/* Key icon + message */}
          <div className="flex-1 flex flex-col items-center justify-start gap-2 px-3">
            <Icon path={mdiKeyOutline} size={0.9} color={colors.colorBlack1} />
            <p
              className="text-[13px] text-center leading-[18px]"
              style={{ color: colors.colorBlack2 }}
            >
              Activate mobile key. {guest.name.split(' ')[0]}&rsquo;s reservation will be marked as checked in.
            </p>
          </div>

          {/* Activate button — flush with card edges */}
          <div className="px-1 pb-1 flex">
            <CanaryButton
              type={ButtonType.PRIMARY}
              size={ButtonSize.COMPACT}
              isExpanded
              onClick={(e) => {
                e.stopPropagation();
                setShowKeyOverlay(false);
                onCheckIn?.();
              }}
            >
              Activate mobile key
            </CanaryButton>
          </div>
        </div>
      )}

      {/* Check-in confirmation overlay */}
      {showCheckInOverlay && (
        <div
          className="absolute inset-0 z-10 bg-white rounded-lg flex flex-col animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <div className="flex justify-end p-1">
            <CanaryButton
              type={ButtonType.ICON_SECONDARY}
              size={ButtonSize.COMPACT}
              icon={<Icon path={mdiClose} size={0.7} color={colors.colorBlueDark1} />}
              onClick={() => setShowCheckInOverlay(false)}
            />
          </div>

          {/* Luggage + door illustration + message */}
          <div className="flex-1 flex flex-col items-center justify-start gap-2 px-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="82" height="57" fill="none" viewBox="0 0 82 57"><path stroke="#2858C4" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.83" d="M34.889 56V4.438c0-1.899 1.51-3.438 3.375-3.438h31.5c1.864 0 3.375 1.54 3.375 3.438V56m-4.5 0V6.156a.57.57 0 0 0-.563-.573H39.951a.57.57 0 0 0-.562.573V56m-12.375 0h54m-36-26.354h6.75m-6.75 5.729v1.604m0-8.479c-.622 0-1.125.513-1.125 1.146s.503 1.146 1.125 1.146c.621 0 1.125-.513 1.125-1.146s-.504-1.146-1.125-1.146"/><path fill="#fff" d="M13.876 49.185V34.676c0-.722.58-1.308 1.295-1.308h13.39c.716 0 1.296.586 1.296 1.308v19.99c0 .722-.58 1.308-1.296 1.308H13.653"/><path stroke="#2858C4" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.83" d="M13.876 49.185V34.676c0-.722.58-1.308 1.295-1.308h13.39c.716 0 1.296.586 1.296 1.308v19.99c0 .722-.58 1.308-1.296 1.308H13.653M24.61 33.368V22.937h-5.488v10.431M17.538 22.937h8.657M26.053 37.617v14.108M21.866 37.617v14.108M17.68 37.617v14.108"/><path fill="#fff" stroke="#2858C4" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.83" d="M13.145 56H3.016C1.831 56 .898 54.98.993 53.787l.954-12.039a2.684 2.684 0 0 1 2.665-2.484h6.937a2.684 2.684 0 0 1 2.665 2.484l.954 12.04C15.264 54.98 14.33 56 13.146 56"/><path fill="#fff" d="M1.95 41.748v2.985a2.12 2.12 0 0 0 2.11 2.13h8.04a2.12 2.12 0 0 0 2.111-2.13v-2.985"/><path stroke="#2858C4" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.83" d="M1.95 41.748v2.985a2.12 2.12 0 0 0 2.11 2.13h8.04a2.12 2.12 0 0 0 2.111-2.13v-2.985M5.086 46.863v3.582M11.076 46.863v3.582"/><path fill="#fff" d="M9.404 39.264V37.8a.727.727 0 0 0-.724-.73H7.481c-.4 0-.723.327-.723.73v1.465"/><path stroke="#2858C4" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.83" d="M9.404 39.264V37.8a.727.727 0 0 0-.724-.73H7.481c-.4 0-.723.327-.723.73v1.465"/></svg>
            <p
              className="text-[13px] text-center leading-[18px]"
              style={{ color: colors.colorBlack2 }}
            >
              Did {guest.name.split(' ')[0]} check in?
            </p>
          </div>

          {/* Yes button */}
          <div className="px-1 pb-1 flex">
            <CanaryButton
              type={ButtonType.PRIMARY}
              size={ButtonSize.COMPACT}
              isExpanded
              onClick={(e) => {
                e.stopPropagation();
                setShowCheckInOverlay(false);
                onCheckIn?.();
              }}
            >
              Yes
            </CanaryButton>
          </div>
        </div>
      )}

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

          {/* TODO: re-enable flags when flag workflow is built
          {submission.isFlagged && (
            <Icon
              path={mdiFlag}
              size={0.6}
              color={colors.error}
            />
          )} */}
        </div>
      </div>

      {/* Separator — for text-only action states (not buttons which self-separate) */}
      {(isCheckedIn || !hasRoom) && (
        <div className="border-t border-gray-200" />
      )}

      {/* Action area */}
      <div className="flex items-center justify-center h-8">
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
            <div style={{ backgroundColor: '#EAEEF9', borderRadius: 4 }}>
              <CanaryButton
                type={ButtonType.ICON_SECONDARY}
                size={ButtonSize.COMPACT}
                icon={<Icon path={mdiKeyOutline} size={0.65} color={colors.colorBlueDark1} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowKeyOverlay(true);
                }}
              />
            </div>
            <CanaryButton
              type={ButtonType.SHADED}
              size={ButtonSize.COMPACT}
              isExpanded
              onClick={(e) => {
                e.stopPropagation();
                setShowCheckInOverlay(true);
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
