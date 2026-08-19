/**
 * MessageComposer Component — REDESIGN (Figma "Messaging" frame 2038:57666)
 *
 * One quiet card: white rounded-12 with a colorBlack6 hairline (blue
 * focus-within — the Figma draws no focus state, so the product's focus
 * treatment carries over). No internal divider: the textarea and the toolbar
 * share one field, so the composer reads as a single place to type rather than
 * a form with a footer.
 *
 * Toolbar (left): emoji / attachment / translate / templates / service-ticket
 * as BARE 16px icons — zero padding, no background boxes, gray at rest, blue on
 * hover. They are still decorative in this branch (no flows behind them), and
 * the smaller/tighter treatment is what keeps five inert affordances from
 * out-weighing the two live controls on the right.
 *
 * Right cluster: the AI pill, then a single square blue send button.
 *
 * ── WHAT DIED HERE ────────────────────────────────────────────────────────
 *  - The "Send via SMS" split button + channel chevron. The channel is already
 *    named twice (the placeholder says "Type SMS message...", every inbound
 *    message is captioned SMS) and the picker had nothing to pick — production
 *    routes on the thread, not on a per-send choice. It is now one send icon.
 *  - The `CanarySwitch`-in-a-gray-pill AI toggle → the AI pill below.
 *
 * ── THE AI PILL ───────────────────────────────────────────────────────────
 * ON:  "AI On" in the shared AI gradient, white fill, static pink→lavender
 *      hairline. The agent is working; it does not need to ask for attention.
 * OFF: "AI Off" in plain gray, and the 1px border carries a slowly REVOLVING
 *      hue wheel (`.ai-pill-off` — a conic gradient whose start angle
 *      animates). Colour moves, geometry does not: no wobble, no pulse, no
 *      scale. It reads as "this is off, and it would like to be on" without
 *      becoming the loudest thing on the screen. Under `prefers-reduced-motion`
 *      the same gradient renders static.
 */

'use client';

import React, { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { colors } from '@canary-ui/components';
import Icon from '@mdi/react';
import {
  mdiEmoticonOutline,
  mdiPaperclip,
  mdiTranslate,
  mdiFormatListBulleted,
  mdiRoomServiceOutline,
  mdiSend,
} from '@mdi/js';

interface MessageComposerProps {
  onSend: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
  aiEnabled?: boolean;
  onAiToggle?: () => void;
  onFocus?: () => void;
}

/** Bare toolbar icon — no box, no padding; gray → blue on hover. */
function ToolIcon({ path, label }: { path: string; label: string }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <button
      aria-label={label}
      title={label}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex items-center justify-center cursor-pointer"
      style={{ padding: 0, width: 18, height: 18 }}
    >
      <Icon path={path} size={0.75} color={isHovered ? colors.colorBlueDark1 : colors.colorBlack3} />
    </button>
  );
}

export function MessageComposer({
  onSend,
  placeholder = 'Type SMS message...',
  disabled = false,
  aiEnabled = true,
  onAiToggle,
  onFocus,
}: MessageComposerProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Autosize: collapse to one row, then grow to content (capped so the composer
  // can't swallow the feed).
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [message]);

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
    { path: mdiTranslate, label: 'Translate' },
    { path: mdiFormatListBulleted, label: 'Templates' },
    { path: mdiRoomServiceOutline, label: 'Service ticket' },
  ];

  return (
    <div style={{ padding: 16 }}>
      <div
        className="rounded-[12px] transition-colors"
        style={{
          backgroundColor: colors.colorWhite,
          border: `1px solid ${isFocused ? colors.colorBlueDark1 : colors.colorBlack6}`,
          padding: 12,
        }}
      >
        {/* Input */}
        <textarea
          ref={textareaRef}
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
          className="w-full resize-none border-0 outline-none font-['Roboto',sans-serif] text-[14px] leading-[22px] placeholder:text-[#666666] scrollbar-invisible"
          style={{ color: colors.colorBlack1, minHeight: 22 }}
        />

        {/* Toolbar */}
        <div className="flex items-center justify-between" style={{ marginTop: 12 }}>
          {/* Left: bare tool icons */}
          <div className="flex items-center" style={{ gap: 12 }}>
            {toolIcons.map((tool) => (
              <ToolIcon key={tool.label} path={tool.path} label={tool.label} />
            ))}
          </div>

          {/* Right: AI pill + send */}
          <div className="flex items-center" style={{ gap: 8 }}>
            <button
              onClick={onAiToggle}
              aria-pressed={aiEnabled}
              aria-label={aiEnabled ? 'Turn the AI agent off for this conversation' : 'Turn the AI agent on for this conversation'}
              className={`${aiEnabled ? 'ai-pill-on' : 'ai-pill-off'} flex items-center justify-center cursor-pointer`}
              style={{ height: 28, paddingLeft: 10, paddingRight: 10 }}
            >
              <span
                className={`font-['Roboto',sans-serif] font-medium text-[12px] leading-[18px] whitespace-nowrap ${
                  aiEnabled ? 'ai-gradient-text' : ''
                }`}
                style={aiEnabled ? undefined : { color: colors.colorBlack3 }}
              >
                {aiEnabled ? 'AI On' : 'AI Off'}
              </span>
            </button>

            <button
              onClick={handleSend}
              disabled={!canSend}
              aria-label="Send message"
              /* Stays full-strength blue when empty — the frame draws it that
                 way in the idle state, and it is the composer's only anchor on
                 the right. It is still `disabled`, so an empty Enter/click is
                 a no-op; only the cursor gives that away. */
              className="flex items-center justify-center rounded-[8px]"
              style={{
                width: 28,
                height: 28,
                padding: 0,
                backgroundColor: colors.colorBlueDark1,
                cursor: canSend ? 'pointer' : 'default',
              }}
            >
              <Icon path={mdiSend} size={0.7} color={colors.colorWhite} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
