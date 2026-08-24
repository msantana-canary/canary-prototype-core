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
 * is the artefact — the reasons are what the AI actually learns from, and two
 * copies of a taxonomy is one taxonomy plus a future disagreement.
 *
 * ── AND TWO SUBJECTS (design review 2026-08-21) ───────────────────────────
 * `context` switches the form between critiquing an ANSWER and arguing with a
 * SILENCE. It is one form with three substitutions, not two forms: see
 * `FeedbackContext` for why the chips cannot be shared and why everything else
 * must be.
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
import { CanaryChip, CanaryTextArea, ChipType, colors } from '@canary-ui/components';

/**
 * WHICH FEEDBACK THIS IS. The form has two subjects, and they are not the same
 * question asked twice:
 *
 *   'response'      the AI SPOKE and you disagree with what it said. Every chip
 *                   is a fault in an artefact that exists on screen.
 *   'non-response'  the AI STAYED SILENT and you think it shouldn't have. There
 *                   is no artefact; the eight critique chips are unanswerable
 *                   ("Wrong Tone/Wording" about nothing), and the useful signal
 *                   is the opposite shape — the CONDITIONS that were met.
 *
 * One form, because the surrounding machinery (multi-select, the ≥1 gate, the
 * optional note, Submit, the toast) is identical and two copies of it would
 * drift. Only the three things that are genuinely about the subject move.
 */
export type FeedbackContext = 'response' | 'non-response';

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

/**
 * The non-response taxonomy (design review 2026-08-21). Five, and they are
 * PRECONDITIONS rather than faults: a hotelier who thinks the AI should have
 * answered is asserting that the bar was cleared, and each chip names one bar.
 *
 * The order is the decision's own order — could it answer (did it have the
 * information, was the question clear), was it allowed to (safe, no human
 * needed), and then the cost of not having (the guest sat there). The last one
 * is the only chip that is about the GUEST rather than the agent, and it is
 * last because it is the consequence, not the reason.
 */
export const NON_RESPONSE_REASONS = [
  'Had the Information',
  'Question Was Clear',
  'Safe to Answer',
  "Didn't Need a Human",
  'Guest Left Waiting',
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
 *
 * That register IS `CanaryChip`'s SELECTABLE register, colour for colour, so
 * the base carries this outright: blue hairline and blue label unselected,
 * solid `colorBlueDark1` and a white label selected, `rounded-full`, and the
 * keyboard handling (Enter / Space) that the hand-rolled `<button>` got from
 * being a button. Only the metrics differ — the chip ramp is 32/12px or
 * 40/14px and the frames draw 34/13 — and they are inline styles, which is what
 * `.chip-reason` is for.
 *
 * ── FOUR THINGS THE BASE COSTS US, ALL LOGGED ─────────────────────────────
 *   1. `aria-pressed` is GONE. `CanaryChip` renders `role="button"` on a div
 *      and exposes no way to say a toggle is on. A screen reader now hears
 *      eight buttons where it used to hear eight toggles. Filed as a library
 *      ask; it is the only real regression in this batch.
 *   2. The base ADDS a hover/press tint the hand-roll did not have — an 8%/16%
 *      blue wash unselected, a label shift to colorBlueDark4/3 selected. At
 *      REST the two are identical, which is the state the frames draw.
 *   3. The unselected fill is TRANSPARENT where the hand-roll painted opaque
 *      white. Both surfaces that host this form — the panel's feedback page and
 *      the 👎 modal — are white behind the chips, so nothing moves; it would
 *      show the day someone drops the form onto a tinted ground.
 *   4. No font-family. The chip is the one base component that does not set
 *      `font-['Roboto']`, and this app's `font-sans` is the Tailwind default
 *      stack, so the family has to be said here or the eight chips render in
 *      system sans while everything around them is Roboto.
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
    <CanaryChip
      label={label}
      chipType={ChipType.SELECTABLE}
      isSelected={isSelected}
      isRounded
      onClick={onToggle}
      className="chip-reason font-['Roboto',sans-serif] whitespace-nowrap"
    />
  );
}

export function AiFeedbackForm({
  value,
  onChange,
  context = 'response',
}: {
  value: FeedbackValue;
  onChange: (next: FeedbackValue) => void;
  /** Which subject this form is about. See `FeedbackContext`. */
  context?: FeedbackContext;
}) {
  const isNonResponse = context === 'non-response';

  const toggle = (reason: string) => {
    const reasons = value.reasons.includes(reason)
      ? value.reasons.filter((r) => r !== reason)
      : [...value.reasons, reason];
    onChange({ ...value, reasons });
  };

  /**
   * THE THREE THINGS THAT MOVE. Everything else on this form — the multi-select,
   * the ≥1 gate, the optional note, the commit its host owns — is identical in
   * both contexts, which is why this is a variant and not a second component.
   *
   * The heading flips from a VERDICT ("this was wrong") to an ARGUMENT ("it
   * should have spoken"), and the note's label follows it: critiquing a reply
   * asks how you usually phrase this kind of answer, while arguing with a
   * silence asks for the reply that is missing. Same placeholder either way —
   * an example of a real hotel answer is what both are fishing for.
   */
  const heading = isNonResponse ? 'Why should AI have responded?' : 'Why was this response wrong?';
  const noteLabel = isNonResponse
    ? 'How would you have responded? (optional)'
    : 'How do you typically respond to messages like this to improve AI replies? (optional)';
  const reasons: readonly string[] = isNonResponse ? NON_RESPONSE_REASONS : FEEDBACK_REASONS;

  return (
    <div>
      <span
        className="block font-['Roboto',sans-serif] text-[13px] leading-[20px]"
        style={{ color: colors.colorBlack3, marginBottom: 10 }}
      >
        {heading}
      </span>

      {/* MULTI-select. A reply is rarely wrong in exactly one way — "Wrong
          Information" and "Should Have Escalated" are routinely both true, and
          forcing a single pick makes the hotelier throw away the half of the
          signal that doesn't fit. The non-response chips stack even harder: the
          preconditions are cumulative by nature, and "Had the Information" plus
          "Safe to Answer" is the commonest complaint there is. */}
      <div className="flex flex-wrap" style={{ gap: 10 }}>
        {reasons.map((reason) => (
          <ReasonChip
            key={reason}
            label={reason}
            isSelected={value.reasons.includes(reason)}
            onToggle={() => toggle(reason)}
          />
        ))}
      </div>

      {/* ⚠ THE LABEL STAYS OURS, ON PURPOSE. `CanaryTextArea` has a `label`
          prop, and it is the wrong tool twice over: its `<label>` is pinned at
          12px/18px black with a 4px gap and is unreachable from `className`
          (which lands on the `<textarea>`), and it carries NO `htmlFor` while
          the base generates no id for the field — so the prop would cost both
          this label's typography AND its association with the box it names.
          Logged as a library ask: wire label↔field, and let the label be
          styled or passed as a node. */}
      <label
        className="block font-['Roboto',sans-serif] font-medium text-[13px] leading-[20px]"
        style={{ color: colors.colorBlack1, marginTop: 24, marginBottom: 6 }}
        htmlFor="ai-feedback-note"
      >
        {noteLabel}
      </label>
      {/* `.textarea-boxed` is the 8px radius and the focus-answers-on-the-BORDER
          register; the rest are this field's own metrics. Two are load-bearing:

          `!min-h-[72px]` is MANDATORY, not dress — the base floors an
          un-autoexpanding textarea at `min-h-[80px]` and the frames draw 72.

          `rows={2}` is mandatory for the same reason from the other side. The
          base defaults to `rows={4}`, and four lines at 22px plus 24px of
          padding is 114px of INTRINSIC height, which no min-height can pull
          back down. The hand-rolled textarea had no `rows` at all, i.e. the
          HTML default of 2 — which is what this restores.

          Padding is NOT overridden: the base's `px-3 py-3` is already the
          frames' 12.

          ⚠ `focus:!border-[#2858C4]` IS NOT REDUNDANT with `.textarea-boxed`.
          `.textarea-boxed:focus` names that same colour, but it lives UNLAYERED
          in globals.css while `!border-[#E5E5E5]` is a Tailwind utility inside
          `@layer utilities` — and for `!important` declarations the cascade's
          layer order REVERSES: layered important beats unlayered important, no
          matter the specificity. So the resting border colour was winning the
          focus state and the box never turned blue (measured in the browser:
          on focus the outline was suppressed by `.textarea-boxed` while the
          border stayed #E5E5E5). Re-asserting the focus colour as a utility
          puts it in the same layer, where its extra `:focus` wins honestly.

          The hand-rolled textarea this replaces had the same bug from the other
          direction — an inline `border` shorthand outranks a non-important
          `focus:border-[#2858C4]` class — so the focus register has in fact
          never painted on this field until now. */}
      <CanaryTextArea
        id="ai-feedback-note"
        value={value.note}
        onChange={(e) => onChange({ ...value, note: e.target.value })}
        placeholder="E.g. Extra pillows, blankets, and toiletries are available upon request. We can have them ready at the front desk or delivered to your room."
        rows={2}
        resize="vertical"
        className="textarea-boxed scrollbar-invisible !border-[#E5E5E5] focus:!border-[#2858C4] !min-h-[72px] !leading-[22px] !text-black"
      />
    </div>
  );
}
