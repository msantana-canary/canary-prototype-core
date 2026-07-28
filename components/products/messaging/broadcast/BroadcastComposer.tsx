/**
 * BroadcastComposer — REDESIGN (broadcast step 1 baseline)
 *
 * Same card anatomy as the Conversations MessageComposer: white rounded-12
 * container with a colorBlack6 border (blue focus-within), textarea, hairline
 * divider, toolbar with decorative ghost icon buttons on the left and a 32px
 * rounded-6 Send button on the right. No AI switch — broadcasts don't have one.
 *
 * PARITY: sending now goes through a "Send to N guests?" confirmation, matching
 * production. The draft is preserved if the send is cancelled.
 */

'use client';

import React, { useState, KeyboardEvent } from 'react';
import Icon from '@mdi/react';
import { mdiPaperclip, mdiFormatListBulleted } from '@mdi/js';
import { colors, CanaryModal, CanaryButton, ButtonType } from '@canary-ui/components';

interface BroadcastComposerProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  recipientCount?: number;
}

export function BroadcastComposer({ onSend, disabled = false, recipientCount = 0 }: BroadcastComposerProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const canSend = !!message.trim() && !disabled && recipientCount > 0;

  const requestSend = () => {
    if (canSend) setIsConfirmOpen(true);
  };

  const confirmSend = () => {
    const trimmed = message.trim();
    setIsConfirmOpen(false);
    if (!trimmed) return;
    onSend(trimmed);
    setMessage('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      requestSend();
    }
  };

  const toolIcons = [
    { path: mdiPaperclip, label: 'Attach file' },
    { path: mdiFormatListBulleted, label: 'Templates' },
  ];

  return (
    <>
      <div style={{ padding: 16 }}>
        <div
          className="overflow-clip rounded-[12px] transition-colors"
          style={{
            backgroundColor: colors.colorWhite,
            border: `1px solid ${isFocused ? colors.colorBlueDark1 : colors.colorBlack6}`,
          }}
        >
          {/* Input Area */}
          <div style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 12, paddingBottom: 12 }}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Type message..."
              disabled={disabled}
              maxLength={1600}
              rows={1}
              className="w-full resize-none border-0 outline-none font-['Roboto',sans-serif] text-[14px] leading-[22px] placeholder:text-[#666666]"
              style={{ color: colors.colorBlack1, minHeight: '22px' }}
            />
          </div>

          {/* Divider */}
          <div className="w-full h-[1px]" style={{ backgroundColor: colors.colorBlack6 }} />

          {/* Toolbar */}
          <div className="flex items-center justify-between" style={{ padding: 8 }}>
            {/* Left: decorative tool icons */}
            <div className="flex gap-3 items-center">
              {toolIcons.map((tool) => (
                <button
                  key={tool.label}
                  aria-label={tool.label}
                  className="rounded-[4px] hover:bg-[#f0f0f0] transition-colors cursor-pointer"
                  style={{ padding: 6 }}
                >
                  <Icon path={tool.path} size={0.83} color={colors.colorBlack3} />
                </button>
              ))}
            </div>

            {/* Right: Send */}
            <button
              onClick={requestSend}
              disabled={!canSend}
              className="flex items-center justify-center font-['Roboto',sans-serif] font-medium text-[12px] transition-opacity"
              style={{
                height: 32,
                paddingLeft: 16,
                paddingRight: 16,
                borderRadius: 6,
                backgroundColor: colors.colorBlueDark1,
                color: colors.colorWhite,
                opacity: canSend ? 1 : 0.5,
                cursor: canSend ? 'pointer' : 'not-allowed',
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Send confirmation (production parity) */}
      <CanaryModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={`Send to ${recipientCount} guest${recipientCount !== 1 ? 's' : ''}?`}
        size="small"
        footer={
          <div className="flex justify-end gap-2">
            <CanaryButton type={ButtonType.OUTLINED} onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </CanaryButton>
            <CanaryButton type={ButtonType.PRIMARY} onClick={confirmSend}>
              Send
            </CanaryButton>
          </div>
        }
      >
        <p
          className="font-['Roboto',sans-serif] text-[14px] leading-[22px]"
          style={{ color: colors.colorBlack1 }}
        >
          This message goes out to everyone selected right away. It can&apos;t be unsent.
        </p>
      </CanaryModal>
    </>
  );
}
