/**
 * EmailComposer
 *
 * Adapted from components/products/messaging/MessageComposer.tsx — stripped to
 * the email variant: attachment + Send only (no AI toggle / translate /
 * templates), new 6px-radius dashboard style. Send is disabled until text is
 * entered. Auto-growing textarea.
 */

'use client';

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import Icon from '@mdi/react';
import { mdiPaperclip } from '@mdi/js';
import { colors } from '@canary-ui/components';

interface EmailComposerProps {
  onSend: (content: string) => void;
  placeholder?: string;
}

export function EmailComposer({ onSend, placeholder = 'Reply to this email...' }: EmailComposerProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = message.trim().length > 0;

  // Auto-grow the textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [message]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed) {
      onSend(trimmed);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ padding: 16 }}>
      {/* Focus-within border matches the messaging composer's focus affordance */}
      <div
        className="rounded-[12px] overflow-hidden transition-all"
        style={{
          backgroundColor: colors.colorWhite,
          border: `1px solid ${isFocused ? colors.colorBlueDark1 : colors.colorBlack6}`,
        }}
      >
        {/* Input row — 8px rhythm matches messaging's p-2 */}
        <div style={{ padding: 8 }}>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            rows={1}
            className="w-full resize-none border-0 outline-none font-['Roboto',sans-serif] text-[14px] leading-[22px] placeholder:text-[#666666]"
            style={{ color: colors.colorBlack1, minHeight: 22, maxHeight: 200, overflowY: 'auto' }}
          />
        </div>

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: colors.colorBlack6 }} />

        {/* Toolbar */}
        <div className="flex items-center justify-between" style={{ padding: 8 }}>
          <button
            className="rounded-[4px] transition-colors hover:bg-[#eaeef9] active:bg-[#dbe3f5] cursor-pointer"
            style={{ padding: 6 }}
            aria-label="Attach file"
          >
            <Icon path={mdiPaperclip} size={0.83} color={colors.colorBlack3} />
          </button>

          <button
            onClick={handleSend}
            disabled={!canSend}
            className={`flex items-center justify-center rounded-[6px] font-['Roboto',sans-serif] font-medium text-[12px] transition-all ${canSend ? 'hover:opacity-90 active:opacity-80' : ''}`}
            style={{
              height: 32,
              paddingLeft: 16,
              paddingRight: 16,
              backgroundColor: canSend ? colors.colorBlueDark1 : colors.colorBlack5,
              color: colors.colorWhite,
              cursor: canSend ? 'pointer' : 'not-allowed',
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
