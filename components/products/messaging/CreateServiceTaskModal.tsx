/**
 * CreateServiceTaskModal — "Create service task", the composer cloche's door.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * "COMPOSER = MODAL" (Miguel, 2026-08-26 demo-day review)
 * ═══════════════════════════════════════════════════════════════════════════
 * Anything launched from the composer's tool row opens a MODAL — Templates
 * already did; the service-ticket cloche was the one violator, opening the
 * Conversation Details panel straight to its create-task drill-in. Production
 * agrees: ticket creation is a centred `CanaryDialog` from every entry point.
 *
 * This modal is that door for the cloche specifically. The panel drill-in
 * (`CreateServiceTaskPage`) is UNCHANGED and still serves its other two
 * entrances — the Tasks tab's Create and the amber ticket band's Review — so
 * there are now two shells around one shared form (`CreateServiceTaskForm`):
 * a panel push/pop shell and this modal. Same fields, same validation, same
 * submit-building logic; only the chrome around it differs.
 *
 * JOINING THE CONTENT-MODAL FAMILY — the same three deltas every sibling on
 * this surface carries (Message templates, Add Information to AI, Create
 * group): `size="large"` + `!max-w-[800px]` over the base's `size="medium"`,
 * plus the header/footer hairlines the base doesn't draw. Copied verbatim from
 * `ai/AddInformationModal.tsx`'s `CanaryModal` call — the 18px title comes free
 * from `ModalFocusScope`'s title-size CSS hook, not from anything here.
 *
 * FOOTER is Cancel (outlined) + Submit (primary, disabled until the form is
 * valid) — the same pair `AddInformationModal` and `CreateGroupModal` draw.
 * Submit fires the SAME create logic the panel version fires
 * (`createServiceTask`, supplied by the caller), and unlike the panel — which
 * has no post-submit toast today — this shell fires one: "Service task
 * created", matching the register of "Thread archived" / "Feedback submitted".
 *
 * REMOUNTS THE FORM ON EVERY OPEN (`key={openCount}`). Unlike the panel's
 * drill-in, which is a fresh push/pop mount every time, this modal — like
 * every sibling in the family — stays MOUNTED (inert) while closed, so its
 * internal field state would otherwise survive a Cancel and reappear as a
 * stale draft on the next open. Bumping `openCount` on every open→close→open
 * cycle forces a clean remount, the same guarantee `AddInformationModal` gets
 * from re-seeding its textarea on every `isOpen` transition.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ButtonSize, ButtonType, CanaryButton, CanaryModal } from '@canary-ui/components';
import { ModalFocusScope } from './ModalFocusScope';
import {
  CreateServiceTaskForm,
  CreateServiceTaskFormHandle,
  CreateServiceTaskSubmission,
} from './panel/CreateServiceTaskForm';

export function CreateServiceTaskModal({
  isOpen,
  defaultRoom,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  /** The thread's room — the only prefill the cloche ever carried. */
  defaultRoom?: string;
  onClose: () => void;
  onSubmit: (task: CreateServiceTaskSubmission) => void;
}) {
  const formRef = useRef<CreateServiceTaskFormHandle>(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [openCount, setOpenCount] = useState(0);

  // See the file note on remounting: bump on every open so a Cancelled or
  // submitted draft never resurfaces on the next open.
  useEffect(() => {
    if (isOpen) setOpenCount((n) => n + 1);
  }, [isOpen]);

  return (
    <ModalFocusScope isOpen={isOpen}>
      <CanaryModal
        isOpen={isOpen}
        onClose={onClose}
        title="Create service task"
        size="large"
        className="!max-w-[800px] [&>div:first-child]:border-b [&>div:first-child]:border-[#E5E5E5] [&>div:last-child]:border-t [&>div:last-child]:border-[#E5E5E5]"
        footer={
          <div className="flex justify-end" style={{ gap: 12 }}>
            <CanaryButton type={ButtonType.OUTLINED} size={ButtonSize.NORMAL} onClick={onClose}>
              Cancel
            </CanaryButton>
            <CanaryButton
              type={ButtonType.PRIMARY}
              size={ButtonSize.NORMAL}
              isDisabled={!canSubmit}
              onClick={() => formRef.current?.submit()}
            >
              Submit
            </CanaryButton>
          </div>
        }
      >
        <div className="flex flex-col" style={{ gap: 16 }}>
          <CreateServiceTaskForm
            key={openCount}
            ref={formRef}
            defaultRoom={defaultRoom}
            onSubmit={onSubmit}
            onCanSubmitChange={setCanSubmit}
          />
        </div>
      </CanaryModal>
    </ModalFocusScope>
  );
}
