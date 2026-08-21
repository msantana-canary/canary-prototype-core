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
      {/* `.textarea-boxed` is the 8px radius and the focus-answers-on-the-BORDER
          register — the base draws a 4px radius and a 2px focus OUTLINE, and
          every other field on this surface answers focus on the border. The
          rest are this field's own metrics: a `colorBlack5` hairline where the
          base's is #666, 140px of floor, 14px of padding, and a 15px/24px type
          size for a box you are meant to write a sentence into.

          `rows={2}` restores the HTML default the hand-rolled textarea had. The
          base defaults to `rows={4}`; it makes no difference at this floor, but
          it is what keeps the height MIN-HEIGHT-driven rather than a race
          between two numbers.

          ⚠ `focus:!border-[#2858C4]` IS NOT REDUNDANT with `.textarea-boxed`.
          `.textarea-boxed:focus` names that same colour, but it lives UNLAYERED
          in globals.css while `!border-[#CCCCCC]` is a Tailwind utility inside
          `@layer utilities` — and for `!important` declarations the cascade's
          layer order REVERSES: layered important beats unlayered important, no
          matter the specificity. Without this the resting border colour wins
          the focus state and the box never turns blue. Same layer, extra
          `:focus`, honest win. */}
      <CanaryTextArea
        id="ai-knowledge-update"
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoFocus
        rows={2}
        resize="vertical"
        className="textarea-boxed scrollbar-invisible !border-[#CCCCCC] focus:!border-[#2858C4] !min-h-[140px] !p-[14px] !text-[15px] !leading-[24px] !text-black"
      />
    </CanaryModal>
  );
}
