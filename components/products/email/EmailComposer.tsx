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
import { useEmailStore } from '@/lib/products/email/store';
import { AiOrbButton } from './AiDraftCard';

interface EmailComposerProps {
  /** The thread this composer replies to — scopes draft application + reset. */
  threadId: string;
  onSend: (content: string) => void;
  placeholder?: string;
}

export function EmailComposer({ threadId, onSend, placeholder = 'Reply to this email...' }: EmailComposerProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // AI draft application: the "Use draft" button fires a one-shot store signal
  // (threadId + text + monotonic seq). We inject the text into local state when
  // the signal targets THIS thread and its seq is newer than the last we
  // applied — a clean hand-off that leaves the composer locally stateful (the
  // draft is editable after it lands). `appliedSeq` persists across thread
  // switches so revisiting a thread never re-injects an old draft.
  const draftApplication = useEmailStore((s) => s.draftApplication);
  const appliedSeq = useRef(0);

  const canSend = message.trim().length > 0;

  // Reset the draft when switching threads (each thread gets its own reply).
  useEffect(() => {
    setMessage('');
  }, [threadId]);

  // Apply an incoming draft signal targeting this thread.
  useEffect(() => {
    if (
      draftApplication &&
      draftApplication.threadId === threadId &&
      draftApplication.seq > appliedSeq.current
    ) {
      appliedSeq.current = draftApplication.seq;
      setMessage(draftApplication.text);
      // Focus at the end so staff can immediately edit/send.
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (el) {
          el.focus();
          el.setSelectionRange(el.value.length, el.value.length);
        }
      });
    }
  }, [draftApplication, threadId]);

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
          <div className="flex items-center gap-1">
            <button
              className="rounded-[4px] transition-colors hover:bg-[#eaeef9] active:bg-[#dbe3f5] cursor-pointer"
              style={{ padding: 6 }}
              aria-label="Attach file"
            >
              <Icon path={mdiPaperclip} size={0.83} color={colors.colorBlack3} />
            </button>
          </div>

          {/* Right cluster: the animated "Draft a reply" orb sits immediately
              left of Send (self-gating on eligibility + draft state). */}
          <div className="flex items-center gap-2">
            <AiOrbButton threadId={threadId} />
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
    </div>
  );
}
