/**
 * UnlinkReservationModal Component
 *
 * Two variants based on isAutoLinked:
 * - Auto-linked: "Unable to unlink" explanation with Back/Go to PMS buttons
 * - Manually linked: Confirmation prompt with Cancel/Unlink buttons
 */

'use client';

import React from 'react';
import {
  CanaryModal,
  CanaryButton,
  ButtonType,
  ButtonSize,
  colors,
} from '@canary-ui/components';

interface UnlinkReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmUnlink: () => void;
  guestName: string;
  contactNumber: string;
  isAutoLinked: boolean;
}

export function UnlinkReservationModal({
  isOpen,
  onClose,
  onConfirmUnlink,
  guestName,
  contactNumber,
  isAutoLinked,
}: UnlinkReservationModalProps) {
  if (isAutoLinked) {
    return (
      <CanaryModal
        isOpen={isOpen}
        onClose={onClose}
        title="Unable to unlink reservation"
        size="small"
        footer={
          <div className="flex justify-end gap-2">
            <CanaryButton
              type={ButtonType.OUTLINED}
              size={ButtonSize.NORMAL}
              onClick={onClose}
            >
              Back to conversation
            </CanaryButton>
            <CanaryButton
              type={ButtonType.PRIMARY}
              size={ButtonSize.NORMAL}
              isDisabled
            >
              Go to PMS
            </CanaryButton>
          </div>
        }
      >
        <p
          className="font-['Roboto',sans-serif] text-[14px] leading-[22px]"
          style={{ color: colors.colorBlack1 }}
        >
          This reservation can&apos;t be unlinked because its phone number matches the contact number for this conversation ({contactNumber}). To unlink, update the guest&apos;s phone number in your PMS; the reservation will be removed automatically once the numbers no longer match.
        </p>
      </CanaryModal>
    );
  }

  return (
    <CanaryModal
      isOpen={isOpen}
      onClose={onClose}
      title="Unlink reservation"
      size="small"
      footer={
        <div className="flex justify-end gap-2">
          <CanaryButton
            type={ButtonType.OUTLINED}
            size={ButtonSize.NORMAL}
            onClick={onClose}
          >
            Cancel
          </CanaryButton>
          <CanaryButton
            type={ButtonType.PRIMARY}
            size={ButtonSize.NORMAL}
            onClick={onConfirmUnlink}
          >
            Unlink
          </CanaryButton>
        </div>
      }
    >
      <p
        className="font-['Roboto',sans-serif] text-[14px] leading-[22px]"
        style={{ color: colors.colorBlack1 }}
      >
        Are you sure you want to unlink {guestName}&apos;s reservation from this conversation? This reservation&apos;s details will no longer appear here. Messages will continue going to {contactNumber}
      </p>
    </CanaryModal>
  );
}
