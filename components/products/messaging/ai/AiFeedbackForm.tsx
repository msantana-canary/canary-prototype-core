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
      {/* ⚠ STOCK `CanaryTextArea` — de-dressed 2026-08-21.
          Miguel, at the review: *"that's not our component."* It always WAS the
          base; what it was wearing wasn't. The frames draw an 8px radius and a
          pale `colorBlack6` hairline that answers focus on the BORDER, and the
          build reproduced all three — so the field rendered at a radius, a
          border colour and a focus register that no other Canary textarea has.
          A base component wearing a private costume is worse than a hand-rolled
          one: it looks sanctioned.

          Gone, therefore: `.textarea-boxed` (the 8px radius + border-focus),
          `!border-[#E5E5E5]` and the `focus:!border-[#2858C4]` that existed only
          to win the cascade fight the first two started. The field now draws the
          library's own 4px radius, `#666666` hairline and 2px inset blue focus
          OUTLINE. That delta is logged in REDESIGN_NOTES as frame drift, and the
          frames want redrawing against the stock control.

          THE FOCUS IS ENTIRELY THE BASE'S NOW. With the dress off, the base
          turned out to name its focus colour in Tailwind ARBITRARY-value classes
          this app's build never compiled (node_modules is not a scanned source),
          so `focus:outline-2` was landing as a 2px TRANSPARENT ring, and
          `.field-focus-blue` restated the two values by hand. The build now
          scans the library's bundle (`@source` in globals.css), the library's
          own declaration reaches the page, and the patch class is DELETED.
          Nothing here names a focus state any more, which is the point.

          WHAT STAYS, because it is metric and not costume:
          `!min-h-[72px]` — the base floors an un-autoexpanding textarea at 80px
          and the frames draw 72. `rows={2}` — the base defaults to `rows={4}`,
          and four lines at 22px plus padding is 114px of INTRINSIC height that
          no min-height can pull back down. `resize="vertical"`, the note's own
          line-height, and the black ink. */}
      <CanaryTextArea
        id="ai-feedback-note"
        value={value.note}
        onChange={(e) => onChange({ ...value, note: e.target.value })}
        placeholder="E.g. Extra pillows, blankets, and toiletries are available upon request. We can have them ready at the front desk or delivered to your room."
        rows={2}
        resize="vertical"
        className="scrollbar-invisible !min-h-[72px] !leading-[22px] !text-black"
      />
    </div>
  );
}
