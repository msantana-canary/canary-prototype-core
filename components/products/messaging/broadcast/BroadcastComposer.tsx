/**
 * BroadcastComposer Component
 *
 * Simplified message composer for broadcast messages.
 * No AI toggle, simplified toolbar, "Send" button.
 */

'use client';

import React, { useState, KeyboardEvent } from 'react';
import Icon from '@mdi/react';
import { mdiAttachment, mdiFormatListBulleted } from '@mdi/js';

interface BroadcastComposerProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  recipientCount?: number;
}

export function BroadcastComposer({ onSend, disabled = false, recipientCount = 0 }: BroadcastComposerProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed && !disabled && recipientCount > 0) {
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

  const canSend = message.trim() && !disabled && recipientCount > 0;

  return (
    <div className="p-6">
      <div
        className="rounded overflow-hidden transition-all"
        style={{
          border: `1px solid ${isFocused ? '#2858c4' : '#666666'}`,
        }}
      >
        {/* Input Area */}
        <div className="p-2">
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
            style={{ color: '#000000', minHeight: '22px' }}
          />
        </div>

        {/* Divider */}
        <div className="w-full h-[1px]" style={{ backgroundColor: '#e5e5e5' }} />

        {/* Toolbar */}
        <div className="p-2 flex items-center justify-between">
          {/* Left: Tool Icons */}
          <div className="flex gap-2 items-center">
            <button className="composer-icon-btn p-1.5 hover:bg-[#eaeef9] rounded transition-colors">
              <span className="icon-wrapper">
                <Icon path={mdiAttachment} size={0.83} />
              </span>
            </button>
            <button className="composer-icon-btn p-1.5 hover:bg-[#eaeef9] rounded transition-colors">
              <span className="icon-wrapper">
                <Icon path={mdiFormatListBulleted} size={0.83} />
              </span>
            </button>
          </div>

          {/* Right: Send Button */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="px-4 h-8 rounded flex items-center justify-center font-['Roboto',sans-serif] font-medium text-[12px] leading-[18px] transition-opacity"
            style={{
              backgroundColor: '#2858c4',
              color: '#ffffff',
              opacity: canSend ? 1 : 0.5,
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
