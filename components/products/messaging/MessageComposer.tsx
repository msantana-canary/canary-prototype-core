/**
 * MessageComposer Component
 *
 * Text input area for composing and sending messages.
 * Includes toolbar with icons, AI toggle, and send button.
 */

'use client';

import React, { useState, KeyboardEvent } from 'react';
import { CanarySwitch } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiAttachment, mdiTranslate, mdiRoomServiceOutline, mdiFormatListBulleted, mdiUnfoldMoreHorizontal } from '@mdi/js';

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

  // Color tokens
  const colorBlack1 = '#000000';
  const colorBlack3 = '#666666';
  const colorBlack4 = '#999999';
  const colorBlack6 = '#e5e5e5';
  const colorBlack7 = '#f0f0f0';
  const colorBlueDark1 = '#2858c4';
  const colorWhite = '#ffffff';

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

  return (
    <div className="p-6">
      <div
        className="rounded overflow-hidden transition-all"
        style={{
          border: `1px solid ${isFocused ? colorBlueDark1 : colorBlack3}`,
        }}
      >
        {/* Input Area */}
        <div className="p-2">
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
            style={{
              color: colorBlack1,
              minHeight: '22px',
            }}
          />
        </div>

        {/* Divider */}
        <div
          className="w-full h-[1px]"
          style={{ backgroundColor: colorBlack6 }}
        />

        {/* Toolbar */}
        <div className="p-2 flex items-center justify-between">
          {/* Left: Tool Icons */}
          <div className="flex gap-2 items-center">
            {/* Attachment Button */}
            <button className="composer-icon-btn p-1.5 hover:bg-[#eaeef9] rounded transition-colors">
              <span className="icon-wrapper">
                <Icon path={mdiAttachment} size={0.83} />
              </span>
            </button>

            {/* Translate Button */}
            <button className="composer-icon-btn p-1.5 hover:bg-[#eaeef9] rounded transition-colors">
              <span className="icon-wrapper">
                <Icon path={mdiTranslate} size={0.83} />
              </span>
            </button>

            {/* List/Template Button */}
            <button className="composer-icon-btn p-1.5 hover:bg-[#eaeef9] rounded transition-colors">
              <span className="icon-wrapper">
                <Icon path={mdiFormatListBulleted} size={0.83} />
              </span>
            </button>

            {/* Room Service Button */}
            <button className="composer-icon-btn p-1.5 hover:bg-[#eaeef9] rounded transition-colors">
              <span className="icon-wrapper">
                <Icon path={mdiRoomServiceOutline} size={0.83} />
              </span>
            </button>
          </div>

          {/* Right: AI Toggle + Send Buttons */}
          <div className="flex gap-2 items-center">
            {/* AI Toggle */}
            <div
              className="flex items-center gap-2 px-2 py-1 rounded-full"
              style={{ backgroundColor: colorBlack7 }}
            >
              <CanarySwitch
                checked={aiEnabled}
                onChange={onAiToggle || (() => {})}
                label=""
              />
              <span
                className="font-['Roboto',sans-serif] font-medium text-[12px] leading-[18px]"
                style={{ color: colorBlack1 }}
              >
                AI
              </span>
            </div>

            {/* Send Button Container - 2px gap between buttons */}
            <div className="flex items-center gap-0.5">
              {/* Send via SMS Button */}
              <button
                onClick={handleSend}
                disabled={disabled || !message.trim()}
                className="relative px-4 h-8 rounded flex items-center justify-center font-['Roboto',sans-serif] font-medium text-[12px] leading-[18px] transition-opacity"
                style={{
                  backgroundColor: colorBlueDark1,
                  color: colorWhite,
                  opacity: disabled || !message.trim() ? 0.5 : 1,
                  cursor: disabled || !message.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                Send via SMS
              </button>

              {/* Dropdown Button */}
              <button
                onClick={() => console.log('Open dropdown')}
                className="w-8 h-8 rounded flex items-center justify-center transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: colorBlueDark1,
                  color: colorWhite,
                }}
              >
                <Icon path={mdiUnfoldMoreHorizontal} size={0.83} color={colorWhite} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
