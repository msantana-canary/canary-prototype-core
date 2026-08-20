/**
 * AiFeedbackForm — the taxonomy and the free-text box, once.
 *
 * The feedback content has TWO homes (Miguel's delineation, 2026-08-20):
 *
 *   SIDEBAR PAGE  reached from the AI Explanation's "Give AI Feedback" footer,
 *                 with a back arrow. You arrived by asking WHY, so the form is
 *                 the next page of the same investigation.
 *   MODAL         reached from 👎 on a message. You arrived by disagreeing, and
 *                 you want to say why and get back to the inbox. A sidebar for
 *                 that would be a detour.
 *
 * Two surfaces, one form. Not because sharing is tidy, but because the TAXONOMY
 * is the artefact — the eight reasons are what the AI actually learns from, and
 * two copies of a taxonomy is one taxonomy plus a future disagreement.
 *
 * ── STATE LIVES OUTSIDE ───────────────────────────────────────────────────
 * The form is controlled. Each host owns the value, because each host owns the
 * commit button that the value gates — the sidebar's is a full-width footer bar,
 * the modal's is a right-aligned button, and a form that owned its own state
 * would have to hand it back up anyway.
 *
 * ── COPY IS THE FRAMES', WARTS INCLUDED ───────────────────────────────────
 * "Do not respond" is sentence case where the other seven are Title Case, and
 * it is an INSTRUCTION sitting in a list of reasons. Both are logged fix-in-post
 * items; both are reproduced exactly, because the build's job this week is to
 * match the file, not to quietly out-vote it.
 */

'use client';

import React from 'react';
import { colors } from '@canary-ui/components';

/**
 * The eight reasons, in the frames' order and casing. Reading order matters:
 * the first four are about the ANSWER, the next three about the READING of the
 * guest, and the last is about whether the AI should have spoken at all.
 */
export const FEEDBACK_REASONS = [
  'Wrong Information',
  'Incomplete Information',
  'Against Hotel Policy',
  'Not Helpful',
  'Wrong Tone/Wording',
  'Misunderstood Guest',
  'Should Have Escalated',
  'Do not respond',
] as const;

export interface FeedbackValue {
  reasons: string[];
  note: string;
}

export const EMPTY_FEEDBACK: FeedbackValue = { reasons: [], note: '' };

/** ≥1 reason. The note is explicitly optional; an unlabelled complaint is not
 *  a signal the loop can learn from, so the chips are the real submission. */
export function canSubmitFeedback(value: FeedbackValue): boolean {
  return value.reasons.length > 0;
}

/**
 * A reason chip. Unselected is the frames' outline register; SELECTED fills
 * with `colorBlueDark1` and flips the label white — the same "this one" blue
 * the thread row and the reservation result row already use, so a selected chip
 * reads as selected everywhere on this surface for the same reason.
 */
function ReasonChip({
  label,
  isSelected,
  onToggle,
}: {
  label: string;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isSelected}
      className="rounded-full font-['Roboto',sans-serif] font-medium text-[13px] leading-[20px] whitespace-nowrap transition-colors cursor-pointer"
      style={{
        height: 34,
        paddingLeft: 14,
        paddingRight: 14,
        border: `1px solid ${colors.colorBlueDark1}`,
        backgroundColor: isSelected ? colors.colorBlueDark1 : colors.colorWhite,
        color: isSelected ? colors.colorWhite : colors.colorBlueDark1,
      }}
    >
      {label}
    </button>
  );
}

export function AiFeedbackForm({
  value,
  onChange,
}: {
  value: FeedbackValue;
  onChange: (next: FeedbackValue) => void;
}) {
  const toggle = (reason: string) => {
    const reasons = value.reasons.includes(reason)
      ? value.reasons.filter((r) => r !== reason)
      : [...value.reasons, reason];
    onChange({ ...value, reasons });
  };

  return (
    <div>
      <span
        className="block font-['Roboto',sans-serif] text-[13px] leading-[20px]"
        style={{ color: colors.colorBlack3, marginBottom: 10 }}
      >
        Why was this response wrong?
      </span>

      {/* MULTI-select. A reply is rarely wrong in exactly one way — "Wrong
          Information" and "Should Have Escalated" are routinely both true, and
          forcing a single pick makes the hotelier throw away the half of the
          signal that doesn't fit. */}
      <div className="flex flex-wrap" style={{ gap: 10 }}>
        {FEEDBACK_REASONS.map((reason) => (
          <ReasonChip
            key={reason}
            label={reason}
            isSelected={value.reasons.includes(reason)}
            onToggle={() => toggle(reason)}
          />
        ))}
      </div>

      <label
        className="block font-['Roboto',sans-serif] font-medium text-[13px] leading-[20px]"
        style={{ color: colors.colorBlack1, marginTop: 24, marginBottom: 6 }}
        htmlFor="ai-feedback-note"
      >
        How do you typically respond to messages like this to improve AI replies? (optional)
      </label>
      <textarea
        id="ai-feedback-note"
        value={value.note}
        onChange={(e) => onChange({ ...value, note: e.target.value })}
        placeholder="E.g. Extra pillows, blankets, and toiletries are available upon request. We can have them ready at the front desk or delivered to your room."
        className="w-full font-['Roboto',sans-serif] text-[14px] leading-[22px] outline-none focus:border-[#2858C4] transition-colors scrollbar-invisible"
        style={{
          minHeight: 72,
          resize: 'vertical',
          border: `1px solid ${colors.colorBlack6}`,
          borderRadius: 8,
          padding: 12,
          color: colors.colorBlack1,
        }}
      />
    </div>
  );
}
