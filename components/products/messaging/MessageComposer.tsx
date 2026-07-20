/**
 * MessageComposer Component — REDESIGN (Figma "Messaging" frame 29:2099, node 29:2304)
 *
 * Quiet card register: white rounded-12 container with a colorBlack6 border
 * (blue focus-within — the Figma draws no focus state, so the product's focus
 * treatment carries over). Toolbar: emoji / attachment / templates / concierge
 * ghost icon buttons; gray rounded-6 AI-switch pill; 32px "Send via SMS"
 * split button (left/right-only radii, 1px seam).
 *
 * vs old build: emoji replaces Translate (per the Figma — Translate presumably
 * returns via a future toolbar pass), border was #666 rounded-4.
 */

'use client';

import React, { useState, KeyboardEvent } from 'react';
import { colors, CanarySwitch } from '@canary-ui/components';
import Icon from '@mdi/react';
import {
  mdiEmoticonOutline,
  mdiPaperclip,
  mdiFormatListBulleted,
  mdiRoomServiceOutline,
  mdiUnfoldMoreHorizontal,
} from '@mdi/js';

interface MessageComposerProps {
  onSend: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
  aiEnabled?: boolean;
  onAiToggle?: (enabled: boolean) => void;
  onFocus?: () => void;
}

export function MessageComposer({
  onSend,
  placeholder = 'Type SMS message...',
  disabled = false,
  aiEnabled = false,
  onAiToggle,
  onFocus,
}: MessageComposerProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = !disabled && !!message.trim();

  const toolIcons = [
    { path: mdiEmoticonOutline, label: 'Emoji' },
    { path: mdiPaperclip, label: 'Attach file' },
    { path: mdiFormatListBulleted, label: 'Templates' },
    { path: mdiRoomServiceOutline, label: 'Service requests' },
  ];

  return (
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
            onFocus={() => {
              setIsFocused(true);
              onFocus?.();
            }}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
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
          {/* Left: tool icons */}
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

          {/* Right: AI switch pill + split send */}
          <div className="flex gap-3 items-center">
            <div
              className="flex items-center rounded-[6px] self-stretch"
              style={{ backgroundColor: colors.colorBlack7, paddingLeft: 8, paddingRight: 16, paddingTop: 4, paddingBottom: 4 }}
            >
              <CanarySwitch
                checked={aiEnabled}
                onChange={onAiToggle || (() => {})}
                label=""
              />
              <span
                className="font-['Roboto',sans-serif] font-medium text-[12px] leading-[18px]"
                style={{ color: colors.colorBlack1 }}
              >
                AI
              </span>
            </div>

            {/* Split send button — 1px seam, side-only radii */}
            <div className="flex items-center" style={{ gap: 1 }}>
              <button
                onClick={handleSend}
                disabled={!canSend}
                className="flex items-center justify-center font-['Roboto',sans-serif] font-medium text-[12px] transition-opacity"
                style={{
                  height: 32,
                  paddingLeft: 16,
                  paddingRight: 16,
                  borderTopLeftRadius: 6,
                  borderBottomLeftRadius: 6,
                  backgroundColor: colors.colorBlueDark1,
                  color: colors.colorWhite,
                  opacity: canSend ? 1 : 0.5,
                  cursor: canSend ? 'pointer' : 'not-allowed',
                }}
              >
                Send via SMS
              </button>
              <button
                onClick={() => console.log('Open channel picker')}
                aria-label="Choose channel"
                className="flex items-center justify-center transition-opacity hover:opacity-80 cursor-pointer"
                style={{
                  width: 32,
                  height: 32,
                  borderTopRightRadius: 6,
                  borderBottomRightRadius: 6,
                  backgroundColor: colors.colorBlueDark1,
                }}
              >
                <Icon path={mdiUnfoldMoreHorizontal} size={0.83} color={colors.colorWhite} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
