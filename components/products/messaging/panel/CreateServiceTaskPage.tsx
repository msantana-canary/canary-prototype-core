/**
 * CreateServiceTaskPage — raise a ticket without leaving the conversation.
 *
 * Three fields, and the interesting thing about them is what they are NOT:
 *
 *   ROOM NUMBER is PREFILLED from the guest's current stay. The room is the one
 *   fact the panel already knows for certain and the one a hotelier would
 *   otherwise re-type from the band two inches above the form.
 *
 *   ISSUE TYPE is FREE TEXT, not a picker. Miguel, on the production behaviour:
 *   "as of now all of it is free text in production." A select here would be a
 *   design fiction — it would demo a taxonomy that does not exist, and the demo
 *   would be the thing people remember.
 *
 *   QUANTITY is optional. "Two towels" is a quantity; "HVAC is broken" is not.
 *
 * Submit stays disabled until Room and Issue both carry something: a ticket with
 * no room and no issue is a ticket nobody can action.
 */

'use client';

import React, { useState } from 'react';
import { colors, CanaryInput, InputSize, InputType } from '@canary-ui/components';
import { PanelFooterAction, PanelHeader, PANEL_PAD } from './panel-ui';

export function CreateServiceTaskPage({
  defaultRoom,
  defaultIssue,
  onBack,
  onClose,
  onSubmit,
}: {
  defaultRoom?: string;
  /**
   * Prefilled when the page is reached from the recommended-ticket band's
   * "Review" — the band already showed the room and the issue, so arriving at
   * an empty form would ask the hotelier to re-type what they just read and
   * approved. Review is a hand-off; this is what gets handed over.
   */
  defaultIssue?: string;
  onBack: () => void;
  onClose: () => void;
  onSubmit: (task: { room: string; issue: string; quantity?: number }) => void;
}) {
  const [room, setRoom] = useState(defaultRoom ?? '');
  const [issue, setIssue] = useState(defaultIssue ?? '');
  const [quantity, setQuantity] = useState('');

  const canSubmit = room.trim().length > 0 && issue.trim().length > 0;

  return (
    <div className="w-full h-full shrink-0 flex flex-col min-h-0">
      <PanelHeader title="Create service task" onBack={onBack} onClose={onClose} />

      <div
        className="flex-1 min-h-0 overflow-y-auto scrollbar-invisible flex flex-col"
        style={{ padding: PANEL_PAD, gap: 16 }}
      >
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
      </div>

      <PanelFooterAction
        label="Submit"
        disabled={!canSubmit}
        onClick={() => {
          if (!canSubmit) return;
          const parsed = Number(quantity);
          onSubmit({
            room: room.trim(),
            issue: issue.trim(),
            quantity: Number.isFinite(parsed) && parsed > 0 ? parsed : undefined,
          });
        }}
      />
    </div>
  );
}
