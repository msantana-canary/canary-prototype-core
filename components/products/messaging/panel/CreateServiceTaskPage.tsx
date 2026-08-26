/**
 * CreateServiceTaskPage — the panel-drill-in SHELL around `CreateServiceTaskForm`.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * THIN WRAPPER, NOT THE FORM (Miguel, 2026-08-26 — "Composer = modal")
 * ═══════════════════════════════════════════════════════════════════════════
 * The fields, prefill props, validation and submit-building logic moved to
 * `CreateServiceTaskForm` — this file now owns only PANEL behaviour: the
 * header (title, back/close), the scrolling body's chrome, and the sticky
 * footer button. Two of this page's three entrances still land here exactly
 * as before — the Tasks tab's Create (a `push`, keeps the back arrow) and the
 * amber ticket band's Review (`panelIntent` direct entry, prefilled, no back
 * arrow). The THIRD — the composer's service-ticket cloche — now opens
 * `CreateServiceTaskModal` instead; see that file and `MessageComposer.tsx`.
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
 * no room and no issue is a ticket nobody can action. That gate now lives in
 * `CreateServiceTaskForm`; this shell only reads it back through
 * `onCanSubmitChange` to disable its own footer button.
 */

'use client';

import React, { useRef, useState } from 'react';
import { PanelFooterAction, PanelHeader, PANEL_PAD } from './panel-ui';
import {
  CreateServiceTaskForm,
  CreateServiceTaskFormHandle,
  CreateServiceTaskSubmission,
} from './CreateServiceTaskForm';

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
  /**
   * Absent on DIRECT entry (the amber band "Review" — the composer cloche no
   * longer routes here, see the modal above): the page is the panel's entry
   * point there, nothing sits beneath it in the stack, so there's nothing to
   * walk back to (Miguel, 2026-08-26 demo-day review). `PanelHeader` already
   * renders no back arrow when `onBack` is omitted.
   */
  onBack?: () => void;
  onClose: () => void;
  onSubmit: (task: CreateServiceTaskSubmission) => void;
}) {
  const formRef = useRef<CreateServiceTaskFormHandle>(null);
  const [canSubmit, setCanSubmit] = useState(false);

  return (
    <div className="w-full h-full shrink-0 flex flex-col min-h-0">
      <PanelHeader title="Create service task" onBack={onBack} onClose={onClose} />

      <div
        className="flex-1 min-h-0 overflow-y-auto scrollbar-invisible flex flex-col"
        style={{ padding: PANEL_PAD, gap: 16 }}
      >
        <CreateServiceTaskForm
          ref={formRef}
          defaultRoom={defaultRoom}
          defaultIssue={defaultIssue}
          onSubmit={onSubmit}
          onCanSubmitChange={setCanSubmit}
        />
      </div>

      <PanelFooterAction
        label="Submit"
        disabled={!canSubmit}
        onClick={() => formRef.current?.submit()}
      />
    </div>
  );
}
