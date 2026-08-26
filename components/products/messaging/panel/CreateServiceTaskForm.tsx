/**
 * CreateServiceTaskForm — the create-a-ticket fields, shared by two shells.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ONE FORM, TWO SHELLS (Miguel, 2026-08-26 demo-day review: "Composer = modal")
 * ═══════════════════════════════════════════════════════════════════════════
 * This used to be the whole body of `CreateServiceTaskPage` — a panel drill-in
 * reached three ways (Tasks tab's Create, the amber band's Review, and the
 * composer's service-ticket cloche). Miguel's ruling drew a line through that
 * third door: anything the composer's tool row launches is a MODAL, the same
 * family as Templates. The panel drill-in stays for the other two entrances —
 * only the cloche moves.
 *
 * So the fields, the prefill props, the validation and the submit-building
 * logic live HERE, and the two call sites — `CreateServiceTaskPage` (the panel
 * shell) and `CreateServiceTaskModal` (the new composer shell) — are each a
 * thin wrapper that supplies its OWN chrome: `PanelHeader` + a sticky
 * `PanelFooterAction` for the panel, `CanaryModal`'s title + a Cancel/Submit
 * footer pair for the modal. Two different footers is exactly why this
 * component does not render its own: the panel's footer sits OUTSIDE the
 * scrolling body as a fixed bar, the modal's sits in `CanaryModal`'s `footer`
 * prop, and neither shell's Submit button lives inside this component's own
 * DOM subtree. `onCanSubmitChange` mirrors the gate out to whichever shell
 * owns that button; the imperative `submit()` on the ref is how that button
 * fires the same submit this form would otherwise fire on itself.
 *
 * See the original page's comment (now on `CreateServiceTaskPage`) for why the
 * three fields are shaped the way they are — that reasoning didn't move.
 */

'use client';

import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { colors, CanaryInput, InputSize, InputType } from '@canary-ui/components';

export interface CreateServiceTaskSubmission {
  room: string;
  issue: string;
  quantity?: number;
}

export interface CreateServiceTaskFormHandle {
  /**
   * Validates and, if valid, fires `onSubmit`. A no-op otherwise — the same
   * guard `canSubmit` puts on the shell's own button, restated here so a
   * stale ref can never bypass it.
   */
  submit: () => void;
}

export interface CreateServiceTaskFormProps {
  defaultRoom?: string;
  /**
   * Prefilled when the form is reached from the recommended-ticket band's
   * "Review" — the band already showed the room and the issue, so arriving at
   * an empty form would ask the hotelier to re-type what they just read and
   * approved. Review is a hand-off; this is what gets handed over. Absent on
   * the composer modal, which has no suggested issue to hand off.
   */
  defaultIssue?: string;
  onSubmit: (task: CreateServiceTaskSubmission) => void;
  /**
   * The shell's own Submit control renders OUTSIDE this component (a fixed
   * panel footer, a modal footer prop) — so its `disabled` state has to be
   * mirrored out rather than read off this component's own render.
   */
  onCanSubmitChange?: (canSubmit: boolean) => void;
}

export const CreateServiceTaskForm = forwardRef<CreateServiceTaskFormHandle, CreateServiceTaskFormProps>(
  function CreateServiceTaskForm({ defaultRoom, defaultIssue, onSubmit, onCanSubmitChange }, ref) {
    const [room, setRoom] = useState(defaultRoom ?? '');
    const [issue, setIssue] = useState(defaultIssue ?? '');
    const [quantity, setQuantity] = useState('');

    const canSubmit = room.trim().length > 0 && issue.trim().length > 0;

    useEffect(() => {
      onCanSubmitChange?.(canSubmit);
    }, [canSubmit, onCanSubmitChange]);

    useImperativeHandle(
      ref,
      () => ({
        submit: () => {
          if (!canSubmit) return;
          const parsed = Number(quantity);
          onSubmit({
            room: room.trim(),
            issue: issue.trim(),
            quantity: Number.isFinite(parsed) && parsed > 0 ? parsed : undefined,
          });
        },
      }),
      [canSubmit, room, issue, quantity, onSubmit]
    );

    return (
      <>
        <CanaryInput
          label="Room Number"
          type={InputType.TEXT}
          size={InputSize.NORMAL}
          placeholder="Enter room number"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <CanaryInput
          label="Issue type"
          type={InputType.TEXT}
          size={InputSize.NORMAL}
          placeholder="Write Issue here"
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
        />
        <CanaryInput
          label="Quantity"
          type={InputType.NUMBER}
          size={InputSize.NORMAL}
          placeholder="Enter Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <span
          className="font-['Roboto',sans-serif] text-[12px] leading-[18px]"
          style={{ color: colors.colorBlack4 }}
        >
          The ticket is raised against this conversation&apos;s guest and appears under Service
          Tasks.
        </span>
      </>
    );
  }
);
