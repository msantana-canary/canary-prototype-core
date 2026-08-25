/**
 * UnlinkConfirmModal — the one destructive confirm in the panel.
 *
 * ⚠ This replaces `UnlinkReservationModal`, which carried TWO variants: a
 * confirm, and an "Unable to unlink" explainer for phone-matched links. The
 * explainer is gone because the panel no longer OFFERS the action it explained:
 * a phone-matched link renders its menu item disabled, with the reason printed
 * underneath. Telling someone why after they've committed to an action is worse
 * than telling them before they can — the old modal was an error message
 * pretending to be a dialog.
 *
 * So only the real confirm survives, in two registers: one reservation, or a
 * whole guest (every stay of theirs on this thread).
 *
 * Copy keeps production's reassurance — messages keep going to the contact
 * number. Unlinking changes what the panel SHOWS, never where a message goes,
 * and that is the fear worth defusing at the moment of the click.
 */

'use client';

import React from 'react';
import { CanaryModal, CanaryButton, ButtonType, ButtonColor, ButtonSize, colors } from '@canary-ui/components';
import { ModalFocusScope } from '@/components/products/messaging/ModalFocusScope';
import { formatPhoneForDisplay } from '@/lib/products/messaging/phone';

export interface UnlinkTarget {
  scope: 'reservation' | 'guest';
  guestName: string;
  reservationIds: string[];
}

export function UnlinkConfirmModal({
  target,
  contactNumber,
  onCancel,
  onConfirm,
}: {
  target: UnlinkTarget | null;
  contactNumber: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isGuest = target?.scope === 'guest';
  const count = target?.reservationIds.length ?? 0;

  return (
    <ModalFocusScope isOpen={!!target}>
      <CanaryModal
        isOpen={!!target}
        onClose={onCancel}
        title={isGuest ? 'Unlink guest' : 'Unlink reservation'}
        size="small"
        footer={
          <div className="flex justify-end gap-2">
            <CanaryButton type={ButtonType.OUTLINED} size={ButtonSize.NORMAL} onClick={onCancel}>
              Cancel
            </CanaryButton>
            <CanaryButton
              type={ButtonType.PRIMARY}
              color={ButtonColor.DANGER}
              size={ButtonSize.NORMAL}
              onClick={onConfirm}
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
          {isGuest
            ? `Unlink ${target?.guestName} from this conversation? ${
                count > 1 ? `All ${count} of their reservations` : 'Their reservation'
              } will stop appearing here. Messages will continue going to ${formatPhoneForDisplay(contactNumber)}.`
            : `Unlink ${target?.guestName}'s reservation from this conversation? This reservation's details will no longer appear here. Messages will continue going to ${formatPhoneForDisplay(contactNumber)}.`}
        </p>
      </CanaryModal>
    </ModalFocusScope>
  );
}
