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
import { mdiPaperclip, mdiFormatListBulleted, mdiClockOutline, mdiClose } from '@mdi/js';
import { colors, CanaryModal, CanaryButton, ButtonType } from '@canary-ui/components';
import { ScheduleSendTimeModal } from './ScheduleSendTimeModal';
import { MessageTemplatesModal } from '../MessageTemplatesModal';
import { formatScheduledMessageTime } from '@/lib/products/messaging/broadcast-schedule';
import { ModalFocusScope } from '@/components/products/messaging/ModalFocusScope';

interface BroadcastComposerProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  recipientCount?: number;
  /**
   * Whether this audience can schedule. Production gates the clock on
   * `!isBuiltInBroadcastFolder(currentFolder)` — custom groups only — and hides
   * the affordance entirely rather than disabling it.
   */
  canSchedule?: boolean;
  onSchedule?: (content: string, sendAt: Date) => void;
  /**
   * Challenger variants label the button "Send to {N}" so the recipient count is
   * legible at the moment of commitment. Baseline keeps a plain "Send" so the
   * control arm stays honest.
   */
  showSendCount?: boolean;
  /** Slot above the textarea — variant B's To strip lives here. */
  topSlot?: React.ReactNode;
  /**
   * Replaces the send-confirm body. Receives the draft so a variant can preview
   * what is about to go out (variant B's message preview + avatar strip).
   */
  renderConfirmDetail?: (draft: string) => React.ReactNode;
  /** "Review recipients" link in the confirm; closes it, keeps the draft. */
  onReviewRecipients?: () => void;
}

export function BroadcastComposer({
  onSend,
  disabled = false,
  recipientCount = 0,
  canSchedule = false,
  onSchedule,
  showSendCount = false,
  topSlot,
  renderConfirmDetail,
  onReviewRecipients,
}: BroadcastComposerProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);

  const canSend = !!message.trim() && !disabled && recipientCount > 0;

  /**
   * Production routes the Send click to `schedule()` when a time is pinned, and
   * skips any confirmation. We do the same — the send-confirm only guards an
   * immediate blast.
   */
  const requestSend = () => {
    if (!canSend) return;
    if (scheduledAt && onSchedule) {
      onSchedule(message.trim(), scheduledAt);
      setMessage('');
      setScheduledAt(null);
      return;
    }
    setIsConfirmOpen(true);
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

  /**
   * ⚠ TEMPLATES IS LIVE HERE NOW; ATTACH IS STILL DECORATIVE.
   *
   * The bulleted-list glyph went live in the Conversations composer and this
   * one — the identical icon, one tab away — stayed inert with a hover wash and
   * a pointer cursor still inviting the click. A demo driver who has just used
   * templates in Conversations will try it here, and silence from a control
   * that looks live is worse than no control at all.
   *
   * It opens the SAME `MessageTemplatesModal`, with two differences that are
   * both production's:
   *   • NO APPLE TAB. A broadcast has no Apple Messages for Business session
   *     to send an Apple-hosted payload into.
   *   • MERGE TAGS STAY LITERAL. A broadcast has no single guest to resolve
   *     `{{ guest_first_name }}` against — production interpolates per
   *     recipient at send time, so the composer must show the tag, not a name.
   *     (The 1:1 composer resolves at insert; that deviation is documented on
   *     `interpolateMergeTags`.) Passing no `resolveBody` is what expresses it.
   */
  const toolIcons: { path: string; label: string; onClick?: () => void }[] = [
    { path: mdiPaperclip, label: 'Attach file' },
    {
      path: mdiFormatListBulleted,
      label: 'Templates',
      onClick: () => setIsTemplatesOpen(true),
    },
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
          {/* Addressing slot (variant B's To strip) — first child, hairline below */}
          {topSlot && (
            <>
              {topSlot}
              <div className="w-full h-[1px]" style={{ backgroundColor: colors.colorBlack6 }} />
            </>
          )}

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

          {/* Scheduled pill — production's composer drawer. Clicking the label
              reopens the modal to edit; the ✕ clears the schedule. */}
          {scheduledAt && (
            <div style={{ paddingLeft: 8, paddingRight: 8, paddingBottom: 12 }}>
              <div
                className="inline-flex items-center transition-colors"
                style={{
                  gap: 8,
                  padding: 8,
                  borderRadius: 24,
                  width: 'fit-content',
                  border: `1px solid ${colors.colorBlack6}`,
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Icon path={mdiClockOutline} size={0.83} color={colors.colorBlack4} />
                  <span
                    className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[22px] whitespace-nowrap"
                    style={{ color: colors.colorBlueDark1 }}
                  >
                    {formatScheduledMessageTime(scheduledAt)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setScheduledAt(null)}
                  aria-label="Clear scheduled time"
                  className="flex items-center cursor-pointer"
                >
                  <Icon path={mdiClose} size={0.83} color={colors.colorBlack4} />
                </button>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="w-full h-[1px]" style={{ backgroundColor: colors.colorBlack6 }} />

          {/* Toolbar */}
          <div className="flex items-center justify-between" style={{ padding: 8 }}>
            {/* Left: decorative tool icons */}
            <div className="flex gap-3 items-center">
              {toolIcons.map((tool) => (
                <button
                  key={tool.label}
                  type="button"
                  onClick={tool.onClick}
                  aria-label={tool.label}
                  className="rounded-[4px] hover:bg-[#f0f0f0] transition-colors cursor-pointer"
                  style={{ padding: 6 }}
                >
                  <Icon path={tool.path} size={0.83} color={colors.colorBlack3} />
                </button>
              ))}

              {/* Schedule — custom-group audiences only (production's gate is on
                  render, not on a disabled state). */}
              {canSchedule && (
                <button
                  onClick={() => setIsScheduleModalOpen(true)}
                  aria-label="Schedule send time"
                  className="rounded-[4px] hover:bg-[#f0f0f0] transition-colors cursor-pointer"
                  style={{ padding: 6 }}
                >
                  <Icon
                    path={mdiClockOutline}
                    size={0.83}
                    color={scheduledAt ? colors.colorBlueDark1 : colors.colorBlack3}
                  />
                </button>
              )}
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
              {/* ⚠ THE BUTTON NAMES WHAT IT WILL DO (QA-2). With a time pinned,
                  `requestSend` routes to `onSchedule` and skips the send
                  confirmation entirely (production parity, see the note there)
                  — but the label went on reading "Send to 3 guests", promising
                  an immediate blast while performing a queue. The routing was
                  right and only the words were wrong.

                  "Schedule via SMS" is production's, and it is the same shape
                  as the 1:1 composer's "Send via SMS": the verb changes, the
                  channel stays. The recipient count drops out of the label
                  because the pill directly above already states the WHEN, and
                  a scheduled blast is read as "when does this go" rather than
                  "how many" — the count is still one glance away on the
                  audience rail. */}
              {scheduledAt
                ? 'Schedule via SMS'
                : showSendCount
                  ? `Send to ${recipientCount} guest${recipientCount !== 1 ? 's' : ''}`
                  : 'Send'}
            </button>
          </div>
        </div>
      </div>

      {/* Send confirmation (production parity) */}
      <ModalFocusScope isOpen={isConfirmOpen}>
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
          {renderConfirmDetail ? (
            renderConfirmDetail(message.trim())
          ) : (
            <p
              className="font-['Roboto',sans-serif] text-[14px] leading-[22px]"
              style={{ color: colors.colorBlack1 }}
            >
              This message goes out to everyone selected right away. It can&apos;t be unsent.
            </p>
          )}
          {onReviewRecipients && (
            <button
              type="button"
              onClick={() => {
                // Close the confirm only — `message` is untouched, so the draft survives.
                setIsConfirmOpen(false);
                onReviewRecipients();
              }}
              className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[22px] cursor-pointer hover:underline"
              style={{ color: colors.colorBlueDark1, marginTop: 12 }}
            >
              Review recipients
            </button>
          )}
        </CanaryModal>
      </ModalFocusScope>

      {/* Templates — preset list only, literal merge tags. See `toolIcons`. */}
      <MessageTemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onUse={(body) => setMessage(body)}
      />

      {/* Schedule send time */}
      <ScheduleSendTimeModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onConfirm={(sendAt) => {
          setScheduledAt(sendAt);
          setIsScheduleModalOpen(false);
        }}
        initialSendAt={scheduledAt ?? undefined}
        reschedule={!!scheduledAt}
      />
    </>
  );
}
