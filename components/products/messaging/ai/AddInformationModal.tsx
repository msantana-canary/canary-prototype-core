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
      <label
        className="block font-['Roboto',sans-serif] text-[14px] leading-[22px]"
        style={{ color: colors.colorBlack2, marginBottom: 8 }}
        htmlFor="ai-knowledge-update"
      >
        AI knowledge update
      </label>
      <textarea
        id="ai-knowledge-update"
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoFocus
        className="w-full font-['Roboto',sans-serif] text-[15px] leading-[24px] outline-none focus:border-[#2858C4] transition-colors scrollbar-invisible"
        style={{
          minHeight: 140,
          resize: 'vertical',
          border: `1px solid ${colors.colorBlack5}`,
          borderRadius: 8,
          padding: 14,
          color: colors.colorBlack1,
        }}
      />
    </CanaryModal>
  );
}
