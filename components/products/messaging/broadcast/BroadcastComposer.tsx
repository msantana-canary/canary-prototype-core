/**
 * BroadcastComposer — brought to EXACT parity with the Conversations composer
 * (batch, 2026-08-26).
 *
 * ⚠ THIS FILE HAD DRIFTED. The header used to claim "same card anatomy as
 * Conversations' `MessageComposer`" — that was aspirational the day it was
 * written and became false the moment `MessageComposer` was rebuilt in later
 * batches (Figma frame 2038:57666) while this file stayed on the July-28
 * baseline: a hand-rolled `<textarea>` with no autosize, a second hairline
 * above the toolbar, padding-6 icon buttons with a hover-wash box, and a
 * 32px text-pill Send. Miguel's 2026-08-26 demo-day review caught the gap
 * directly — "everything underneath [the To: strip] is wrong." This batch
 * re-syncs everything below the strip to what `MessageComposer` actually
 * renders today; the strip itself (`BroadcastToStrip`) is UNTOUCHED.
 *
 * ── WHAT'S SHARED NOW, LITERALLY ────────────────────────────────────────────
 * `ToolIcon` moved out of `MessageComposer.tsx` into `../composer-ui.tsx` so
 * both composers' toolbars render through the same component — Attach and
 * Templates here take the identical bare-18px, gray→blue-on-hover treatment
 * Conversations' six tools use, rather than a second hand-tuned copy of it.
 *
 * ── WHAT'S BROADCAST-ONLY ───────────────────────────────────────────────────
 * The To strip (`topSlot`), the schedule clock (gated on `canSchedule`, absent
 * rather than disabled on built-in folders — production parity), the scheduled
 * pill with its clear ✕, the send-confirm modal, and the schedule-vs-confirm
 * routing in `requestSend`. None of that moved; only the chrome underneath it
 * did.
 *
 * ── THE SEND BUTTON LOST ITS LABEL ──────────────────────────────────────────
 * "Send to N guests" / "Schedule via SMS" / "Send" is gone. The recipient
 * count already lives in the To strip (`BroadcastToStrip`'s live count), and
 * the scheduled pill directly above the button already states WHEN a pinned
 * send goes out — the button repeating either fact was the composer saying
 * the same sentence twice. It is now `MessageComposer`'s exact icon-only
 * square: `CanaryButton` ICON_PRIMARY COMPACT, `icon-btn-28 icon-btn-r8
 * icon-btn-nodim`, a white `mdiSend` at 0.7, full-strength blue even while
 * disabled. The accessible name still says what will happen — "Send
 * broadcast" or "Schedule broadcast" once a time is pinned — it just no
 * longer prints on the button.
 *
 * ── THE CARD SHELL: `CanaryCard` HOSTS THE FULL-BLEED STRIP ────────────────
 * `CanaryCard` wraps every child in ONE `p-3` (12px, at `CardPadding.COMPACT`)
 * div — there is no separate full-bleed slot the way `MessageComposer`'s
 * `topSlot` gets by living OUTSIDE its card entirely. Broadcast's To strip has
 * to stay INSIDE this card (it shares the card's top corners and the hairline
 * under it has to run the card's full width), so it rides a negative-margin
 * bleed wrapper instead: `margin: -12px -12px 16px -12px` cancels the COMPACT
 * padding on three sides and lands the strip flush against the card's own 1px
 * border — exactly where the hand-rolled version had it. `overflow-hidden`
 * alongside the `!rounded-[12px]` override clips the strip's square corners to
 * the card's rounded ones, which is the one thing this trick needs and the
 * hand-rolled shell got for free from `overflow-clip`.
 *
 * ⚠ THE BOTTOM MARGIN IS NOT 0 (Miguel, 2026-08-27 review: "'Type message' is
 * crowding the strip"). It used to be — the reasoning at the time was that a
 * 0 margin would let the card's own padding-top "resume" below the bleed, the
 * same way it does for every other child. That reasoning doesn't survive the
 * box model: padding-top only offsets the FIRST child's start position: once
 * that offset is spent pulling the strip up flush with the border, nothing
 * reintroduces it for the sibling below. A 0 bottom margin measured out to a
 * true 0px gap between the hairline and the textarea, not the 12px inset the
 * comment here used to claim. 16px restores visible air below the line —
 * deliberately more than Conversations' plain 12px inset, since broadcast has
 * a strip + hairline stacked above the field that Conversations doesn't. Sides
 * and the card's bottom padding are untouched, so both composers still match
 * there.
 */

'use client';

import React, { useEffect, useRef, useState, KeyboardEvent } from 'react';
import Icon from '@mdi/react';
import { mdiPaperclip, mdiFormatListBulleted, mdiClockOutline, mdiClose, mdiSend } from '@mdi/js';
import {
  colors,
  CanaryModal,
  CanaryButton,
  CanaryCard,
  CanaryTextArea,
  ButtonType,
  ButtonSize,
  CardPadding,
} from '@canary-ui/components';
import { ToolIcon } from '../composer-ui';
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = !!message.trim() && !disabled && recipientCount > 0;

  /**
   * Autosize — the identical measuring `MessageComposer` uses: collapse to
   * one row, then grow to content, capped so the composer can't swallow the
   * feed. See that component's fuller note on why `CanaryTextArea`'s own
   * `autoExpand` isn't usable here (it floors at 40px; this field rests at one
   * 22px line).
   */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [message]);

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

  return (
    <>
      <div style={{ padding: 16 }}>
        {/* The input card. `CanaryCard` at COMPACT padding is exactly this
            card's 12px inset, and it already draws white / 1px / `colorBlack6`;
            the 12px radius, `overflow-hidden` (for the bled strip below) and
            the blue focus-within border are the deltas. The base sets its
            border colour INLINE, so the focus swap has to be an `!important`
            utility — nothing else outranks an inline style. */}
        <CanaryCard
          cardPadding={CardPadding.COMPACT}
          hasBorder
          className={`transition-colors !rounded-[12px] overflow-hidden ${
            isFocused ? '!border-[#2858C4]' : ''
          }`}
        >
          {/* Addressing slot (the To strip) — BLED to the card's own edges.
              See the header note: this negative margin cancels the card's own
              12px padding on three sides so the strip and its hairline reach
              the card's 1px border exactly as the hand-rolled shell drew them;
              the 16px bottom margin is deliberate breathing room below the
              hairline, not the card's ordinary inset resuming on its own. */}
          {topSlot && (
            <div style={{ margin: '-12px -12px 16px -12px' }}>
              {topSlot}
              <div className="w-full h-[1px]" style={{ backgroundColor: colors.colorBlack6 }} />
            </div>
          )}

          {/* Input — `CanaryTextArea`, `.field-chromeless` + `.textarea-composer`
              + `.scrollbar-invisible`, same as Conversations. Placeholder STAYS
              channel-neutral: a broadcast has no single thread's channel to
              name the way a 1:1 conversation does. */}
          <CanaryTextArea
            ref={textareaRef}
            rows={1}
            resize="none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Type message..."
            disabled={disabled}
            maxLength={1600}
            className="field-chromeless textarea-composer scrollbar-invisible !text-[14px] !leading-[22px] placeholder:!text-[#666666]"
            style={{ color: colors.colorBlack1 }}
          />

          {/* Scheduled pill — production's composer drawer. Clicking the label
              reopens the modal to edit; the ✕ clears the schedule. Broadcast-only,
              so it has no Conversations equivalent to mirror. */}
          {scheduledAt && (
            <div style={{ marginTop: 12 }}>
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

          {/* Toolbar — NO hairline above it (the second rule QA caught is gone).
              `flex items-center justify-between` with `marginTop: 12` inside the
              card's own 12px inset, matching Conversations exactly. */}
          <div className="flex items-center justify-between" style={{ marginTop: 12 }}>
            {/* Left: bare tool icons, same `ToolIcon` Conversations uses. */}
            <div className="flex items-center" style={{ gap: 12 }}>
              <ToolIcon path={mdiPaperclip} label="Attach file" id="broadcast-tool-attach" />
              <ToolIcon
                path={mdiFormatListBulleted}
                label="Templates"
                id="broadcast-tool-templates"
                onClick={() => setIsTemplatesOpen(true)}
              />
              {/* Schedule — custom-group audiences only (production's gate is on
                  render, not on a disabled state). Blue while a time is pinned. */}
              {canSchedule && (
                <ToolIcon
                  path={mdiClockOutline}
                  label="Schedule send time"
                  id="broadcast-tool-schedule"
                  onClick={() => setIsScheduleModalOpen(true)}
                  isActive={!!scheduledAt}
                />
              )}
            </div>

            {/* Send. `MessageComposer`'s exact icon-only square — see the header
                note on why the label left the button. */}
            <CanaryButton
              type={ButtonType.ICON_PRIMARY}
              size={ButtonSize.COMPACT}
              onClick={requestSend}
              isDisabled={!canSend}
              className="icon-btn-28 icon-btn-r8 icon-btn-nodim"
              icon={
                <Icon
                  path={mdiSend}
                  size={0.7}
                  color={colors.colorWhite}
                  title={scheduledAt ? 'Schedule broadcast' : 'Send broadcast'}
                  id="broadcast-send"
                />
              }
            />
          </div>
        </CanaryCard>
      </div>

      {/* Send confirmation (production parity).
          JOINING THE MODAL FAMILY (Miguel, 2026-08-27 review) — this one was
          already `ModalFocusScope`-wrapped (so the 18px title override in
          `.modal-focus-scope` already applied), but it was missing the family's
          header/footer hairlines every other content modal carries — see
          `ai/AddInformationModal.tsx`'s `CanaryModal` call, copied verbatim
          below MINUS its `!max-w-[800px]`: Miguel's call is this modal keeps
          its own `size="small"` rather than growing to the family's 800px. */}
      <ModalFocusScope isOpen={isConfirmOpen}>
        <CanaryModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          title={`Send to ${recipientCount} guest${recipientCount !== 1 ? 's' : ''}?`}
          size="small"
          className="[&>div:first-child]:border-b [&>div:first-child]:border-[#E5E5E5] [&>div:last-child]:border-t [&>div:last-child]:border-[#E5E5E5]"
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

      {/* Templates — preset list only, literal merge tags (broadcast has no
          Apple session and no single guest to resolve a tag against). */}
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
