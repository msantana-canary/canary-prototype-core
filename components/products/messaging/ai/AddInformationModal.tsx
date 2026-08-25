/**
 * AddInformationModal — "Add Information to AI".
 *
 * The suggested-fact band's Edit. A MODAL, per the delineation: editing a
 * one-sentence fact is a quick action with a commit and a cancel, and it has no
 * context outside itself worth keeping on screen.
 *
 * The textarea opens PREFILLED with the fact as the AI proposed it, because the
 * common case is a small correction — a room number, a set of hours — and
 * making a hotelier retype a sentence they mostly agree with is how you teach
 * them to press Dismiss instead.
 *
 * Committing is the SAME EVENT as pressing "Add to AI" on the band: the fact
 * leaves the queue and the toast is the receipt. Edit is a detour on the way to
 * Add, not a second outcome.
 */

'use client';

import React, { useEffect, useState } from 'react';
import {
  CanaryModal,
  CanaryButton,
  CanaryTextArea,
  ButtonType,
  ButtonSize,
  colors,
} from '@canary-ui/components';
import { ModalFocusScope } from '@/components/products/messaging/ModalFocusScope';

export function AddInformationModal({
  isOpen,
  initialText,
  onCancel,
  onCommit,
}: {
  isOpen: boolean;
  initialText: string;
  onCancel: () => void;
  onCommit: (text: string) => void;
}) {
  const [text, setText] = useState(initialText);

  // Re-seed on every open. A stale edit of the PREVIOUS fact appearing in the
  // box would be a quiet way to teach the AI something nobody typed.
  useEffect(() => {
    if (isOpen) setText(initialText);
  }, [isOpen, initialText]);

  const canCommit = text.trim().length > 0;

  return (
    <ModalFocusScope isOpen={isOpen}>
      <CanaryModal
        isOpen={isOpen}
        onClose={onCancel}
        title="Add Information to AI"
        size="medium"
        showCloseButton={false}
        footer={
          <div className="flex justify-end" style={{ gap: 12 }}>
            <CanaryButton type={ButtonType.OUTLINED} size={ButtonSize.NORMAL} onClick={onCancel}>
              Cancel
            </CanaryButton>
            <CanaryButton
              type={ButtonType.PRIMARY}
              size={ButtonSize.NORMAL}
              isDisabled={!canCommit}
              onClick={() => canCommit && onCommit(text.trim())}
            >
              Add to AI
            </CanaryButton>
          </div>
        }
      >
        {/* ⚠ THE LABEL STAYS OURS, ON PURPOSE. `CanaryTextArea` has a `label`
            prop, and it is the wrong tool twice over: its `<label>` is pinned at
            12px/18px black with a 4px gap and is unreachable from `className`
            (which lands on the `<textarea>`) — the frame draws 14px/22px
            `colorBlack2` with an 8px gap — and it carries NO `htmlFor` while the
            base generates no id for the field, so the prop would also cost this
            label its association with the box it names. Logged as a library ask:
            wire label↔field, and let the label be styled or passed as a node. */}
        <label
          className="block font-['Roboto',sans-serif] text-[14px] leading-[22px]"
          style={{ color: colors.colorBlack2, marginBottom: 8 }}
          htmlFor="ai-knowledge-update"
        >
          AI knowledge update
        </label>
        {/* ⚠ STOCK `CanaryTextArea` — de-dressed 2026-08-21, the same pass that
            undressed the feedback note. The 8px radius, the pale `colorBlack5`
            hairline and the focus-answers-on-the-BORDER register were frame drift
            rather than a sanctioned design-system change: they made a base
            component render at a radius, a border and a focus treatment no other
            Canary textarea has. It now draws the library's 4px radius, `#666666`
            hairline and 2px inset blue focus OUTLINE, and the frames are flagged
            for a redraw against the stock control (REDESIGN_NOTES).

            `focus:!border-[#2858C4]` went with them. In its place, `.field-focus-
            blue` restates the base's OWN focus values: the library names them in
            Tailwind arbitrary-value classes this app's build never compiled
            (node_modules is not a scanned source), so `focus:outline-2` was
            landing as a 2px TRANSPARENT ring. The build now scans the library's
            bundle (`@source` in globals.css), so the base's own focus reaches the
            page and the `.field-focus-blue` patch is gone.

            WHAT STAYS is metric: 140px of floor, 14px of padding, and a 15px/24px
            type size for a box you are meant to write a sentence into. `rows={2}`
            over the base's 4 keeps the height MIN-HEIGHT-driven rather than a race
            between two numbers. */}
        <CanaryTextArea
          id="ai-knowledge-update"
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
          rows={2}
          resize="vertical"
          className="scrollbar-invisible !min-h-[140px] !p-[14px] !text-[15px] !leading-[24px] !text-black"
        />
      </CanaryModal>
    </ModalFocusScope>
  );
}
