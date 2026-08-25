'use client';

/**
 * ComposeHeader — new-message compose lives in the THREAD PANE (right side),
 * matching the real product and the vaporware (ThreadView "To:" header), NOT in
 * the thread list. Rendered in the right pane when isComposingNew.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * THE COMPOSER IS GATED ON A COMMITTED NUMBER (Miguel, 2026-08-24)
 * ═══════════════════════════════════════════════════════════════════════════
 * *"No composer would appear until a number gets put in."*
 *
 * The pane has two states and the seam between them is a COMMIT, not a
 * keystroke:
 *
 *   BEFORE  "To: [        ]" and one line of instruction. No composer. There is
 *           nothing to send TO, and a live message box over an empty address
 *           field invites a hotelier to type a message she cannot send.
 *   AFTER   the same header with the number in it, and the full `MessageComposer`
 *           underneath. Sending creates the thread and posts the message into
 *           it in one step.
 *
 * COMMIT is Enter or BLUR, and it is only a commit if the number is plausible —
 * the same ≥10-digit test `createThreadFromPhone` applies, restated here so the
 * gate and the create agree. Blur counts because a hotelier who types a number
 * and then reaches for the message box has finished addressing; making her
 * press Enter first would be a rule she has to learn from a dead composer.
 *
 * ⚠ THE THREAD IS NOT CREATED AT COMMIT. It used to be: Enter called
 * `createThreadFromPhone` immediately, which dropped compose mode and handed the
 * user a normal ThreadView. That made the composer's appearance a side effect of
 * LEAVING this pane, so the gate could not be expressed here at all — and it
 * also left an empty thread in the inbox for every number anyone typed and
 * thought better of. Now the pane holds the address until there is a message to
 * put in it, and `onSendFirstMessage` does both at once.
 *
 * The number stays editable after commit; typing it back below ten digits
 * retracts the composer, because at that moment there is again nothing to send
 * to.
 */

import { useState } from 'react';
import Icon from '@mdi/react';
import { mdiClose } from '@mdi/js';
import {
  ButtonSize,
  ButtonType,
  CanaryButton,
  CanaryInput,
  colors,
} from '@canary-ui/components';
import { MessageComposer } from './MessageComposer';

/**
 * The commit test. Production validates server-side; the prototype's
 * `createThreadFromPhone` uses "at least ten digits", and this restates it so
 * the gate can never open on a number the create would then reject.
 */
function isCommittable(phone: string): boolean {
  return phone.replace(/\D/g, '').length >= 10;
}

/**
 * ⚠ REJECTION HAS TO BE VISIBLE (QA-2, 2026-08-25).
 *
 * `commit()` was `if (isCommittable(phone)) setIsCommitted(true)` with no else
 * branch, so typing "ZZZ-garbage-!!!" or "123" and pressing Enter did NOTHING —
 * no error, no shake, no hint, the garbage still sitting in the To: line. The
 * gate itself is right and deliberate; what was missing is the product saying
 * so. A dead-end that looks identical to a broken app is worse than a rule.
 *
 * The message names the FIX rather than the failure, and it is one line because
 * the field is a single line: "Enter a valid phone number." Two shapes fail —
 * too short, and not a number at all — and they get the same sentence, because
 * from the hotelier's side there is one thing to do about either.
 */
const PHONE_ERROR = 'Enter a valid phone number';

export function ComposeHeader({
  composingPhoneNumber = '',
  onComposingPhoneChange,
  onSendFirstMessage,
  onCancelComposing,
}: {
  composingPhoneNumber?: string;
  onComposingPhoneChange?: (value: string) => void;
  /** Creates the thread for this number and posts the first message into it. */
  onSendFirstMessage?: (phone: string, content: string) => void;
  onCancelComposing?: () => void;
}) {
  /**
   * COMMITTED, not "valid". They are different facts: a number becomes valid on
   * the tenth keystroke, but it becomes an ADDRESS when the hotelier says so by
   * pressing Enter or leaving the field. Gating on validity alone would pop the
   * composer open mid-typing, which is the thing this whole state exists to
   * avoid.
   */
  const [isCommitted, setIsCommitted] = useState(false);
  const isOpen = isCommitted && isCommittable(composingPhoneNumber);

  /**
   * The AI pill's state for a conversation that does not exist yet. It is local
   * rather than left on the composer's default because the pill is a real
   * control and an inert one would be the only dead affordance in this pane;
   * the value is dropped on send, at which point the new thread takes the
   * store's own per-thread default.
   */
  const [isAiOn, setIsAiOn] = useState(true);

  /**
   * The rejection, held only after an ATTEMPTED commit. Never while typing: a
   * number is un-committable for its first nine keystrokes and an error that
   * appears on keystroke one is an error about nothing.
   */
  const [error, setError] = useState<string | null>(null);

  const commit = () => {
    if (isCommittable(composingPhoneNumber)) {
      setIsCommitted(true);
      setError(null);
      return;
    }
    // An empty field is not a mistake — it is the state this pane opens in.
    setError(composingPhoneNumber.trim() ? PHONE_ERROR : null);
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* "To:" header — sits in the same slot as the normal thread header while
          composing. The hairline was a raw `border-gray-200`; it is the
          `colorBlack6` token now, like every other hairline on this surface. */}
      <div className="bg-white px-6 py-4" style={{ borderBottom: `1px solid ${colors.colorBlack6}` }}>
        <div className="flex items-center gap-2">
          <span className="text-base font-medium" style={{ color: colors.colorBlack1 }}>
            To:
          </span>
          {/* An EMBEDDED field: the header row owns the chrome, so the base has
              to contribute its behaviour and none of its paint. `CanaryInput`
              (not `CanaryInputPhone` — that one adds country formatting this
              flow does not want) spreads `autoFocus` / `placeholder` /
              `onKeyDown` / `onBlur` straight onto the native input, so Enter and
              blur both reach the commit and Escape still cancels.
              `.field-chromeless` strips the base's border, its 8px padding, its
              40px height, its white fill and its 2px focus outline — all of
              which are set INLINE by the component, which is why the class does
              it with `!important`. The base already paints text `colorBlack1`;
              only the 16px type and the placeholder grey are ours. */}
          <div className="flex-1 min-w-0">
            <CanaryInput
              autoFocus
              placeholder="Enter phone number"
              value={composingPhoneNumber}
              onChange={(e) => {
                // Editing IS the retry. Clearing on the first keystroke stops
                // the message shouting at someone already fixing it.
                if (error) setError(null);
                onComposingPhoneChange?.(e.target.value);
              }}
              /* The base's own error register: red hairline, the ⓘ glyph inside
                 the field's right edge, and the pink chip underneath. Only the
                 first of those survives `.field-chromeless` (this field is
                 embedded — the header row owns the chrome), which is why the
                 helper line below carries the sentence too. */
              error={error ?? undefined}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit();
                if (e.key === 'Escape') onCancelComposing?.();
              }}
              /* `!h-auto` is not in `.field-chromeless`: that class is shared
                 with the composer's textarea, whose autosize writes an INLINE
                 height an `!important` height would silently kill. An input
                 sizes itself with an `h-[40px]` CLASS, so it says so here. */
              className="field-chromeless !h-auto !text-[16px] placeholder:!text-[#999999]"
            />
          </div>
          {/* Cancel. Same neutral 28px/6px icon register as the thread header's
              three actions — it was a ~27px, 4px-radius button with a
              `gray-100` hover, which was the only place on this surface still
              spending a raw Tailwind grey on a wash. The name rides the mdi
              `Icon`'s `title` + a stable `id`; `CanaryButton` has no
              `aria-label`. */}
          <CanaryButton
            type={ButtonType.ICON_SECONDARY}
            size={ButtonSize.COMPACT}
            onClick={onCancelComposing}
            className="icon-btn-neutral icon-btn-28 icon-btn-r6"
            icon={
              <Icon
                path={mdiClose}
                size={0.8}
                color={colors.colorBlack3}
                title="Cancel"
                id="compose-cancel"
              />
            }
          />
        </div>
      </div>

      {/* The body: an empty message area either way, and the composer only once
          the address is committed. The empty area keeps its instruction line
          BEFORE the commit and goes blank after, because after the commit the
          instruction has been followed and the composer below is the next
          thing to read. */}
      {/* ⚠ THE INSTRUCTION LINE MUTATES INTO THE ERROR (QA-2). It is the one
          piece of prose this pane has, it sits where the eye already is after
          a failed Enter, and it is the only place a full sentence fits — the
          header row is a single 40px line with a Cancel button on the end.
          Same slot, same type ramp, error colour: the empty state and the
          rejection are the same statement at two temperatures, so the pane
          never grows a second explanatory line. */}
      <div
        className="flex flex-1 min-h-0 items-center justify-center text-sm"
        style={{ color: error ? colors.error : colors.colorBlack4 }}
      >
        {!isOpen && (error ?? 'Enter a phone number to start a new conversation')}
      </div>

      {isOpen && (
        <div className="shrink-0">
          {/* No `topSlot`: there is no thread yet, so there is no band stack and
              no drafted response to hang above the box. */}
          <MessageComposer
            onSend={(content) => onSendFirstMessage?.(composingPhoneNumber, content)}
            placeholder="Type SMS message..."
            aiEnabled={isAiOn}
            onAiToggle={() => setIsAiOn((v) => !v)}
          />
        </div>
      )}
    </div>
  );
}
