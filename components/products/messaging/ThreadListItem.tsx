/**
 * ThreadListItem Component — REDESIGN (Figma "Messaging" frame 29:2099, "Guest" rows)
 *
 * Row anatomy: 32px rounded-8 avatar · name (14 Medium) + time (10 uppercase) ·
 * room line (bed icon + number, "(RESERVED)"-style status as plain text, and a
 * concierge request-count chip) · preview (14 Regular colorBlack3) with two
 * independent trailing indicators — the attention dot AND the red anger flag.
 * They are siblings, not alternatives: neither replaces the other. The flag
 * means AI-detected guest frustration (AI paused). The dot shows for unread OR
 * escalated (production parity): plain unread = pink, escalated = amber
 * (warning), the `.isEscalated` variant — the ONLY difference is the dot color.
 *
 * ── INDICATORS ARE A RIGHT-HUGGING CLUSTER (frame 2038:57666) ─────────────
 * ⚠ SUPERSEDES the reserved-slot rule. The dot used to render an always-present
 * 10px box (transparent when idle) so the row "never shifted". What that
 * actually bought was a hole: a flagged-but-read row (Miguel-Andre) parked its
 * flag 10px + a gap short of the right edge, floating against nothing.
 *
 * Both indicators are now conditional and sit in one shrink-0 cluster pinned to
 * the row's right edge by the preview's `flex-1`. Order is the frame's: DOT,
 * then FLAG. Whichever indicators exist, the LAST one lands on the right
 * margin — one, the other, or both. There is no phantom slot, so there is
 * nothing to leave a gap.
 *
 * Selection = soft colorBlueDark5 fill + colorBlueDark3 border + rounded-6
 * (was: solid blue with white text). HOVER is the neutral 8%-black wash this
 * branch uses for every transient row/control state (thread-header IconAction,
 * the scope-select trigger), NOT the old near-white #f9fafb — at 2% over white
 * that was invisible next to the blue selected row, and the two states have to
 * be told apart at a glance. Neutral vs. blue also keeps "where my pointer is"
 * and "what is open" in different colour families. Unread = dot only.
 */

import React from 'react';
import { Avatar } from './Avatar';
import { Thread } from '@/lib/products/messaging/types';
import { Guest } from '@/lib/core/types/guest';
import { Reservation } from '@/lib/core/types/reservation';
import { format } from 'date-fns';
import { colors, CanaryListItem, CanaryTag, CanaryTooltip, TagSize, TagVariant, TooltipPosition } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiBedOutline, mdiRoomServiceOutline, mdiFlag } from '@mdi/js';
import { useRowKeyActivation } from '@/lib/products/messaging/useRowKeyActivation';
import { formatPhoneForDisplay } from '@/lib/products/messaging/phone';

interface ThreadListItemProps {
  thread: Thread;
  guest?: Guest;
  reservation?: Reservation;
  isSelected?: boolean;
  onClick?: () => void;
  isTyping?: boolean;
}

export function ThreadListItem({
  thread,
  guest,
  reservation,
  isSelected = false,
  onClick,
  isTyping = false,
}: ThreadListItemProps) {
  const formattedTime = format(thread.lastMessageAt, 'h:mm a').toUpperCase();

  // For phone-only threads, display the contact number — FORMATTED (QA-2). The
  // row used to echo raw digits back at the hotelier, and sat beside fixture
  // rows carrying raw E.164, so one list held two registers for one concept.
  // `formatPhoneForDisplay` is display-only; `thread.contactNumber` is
  // untouched, so identity and matching still run on digits.
  const contactLabel = formatPhoneForDisplay(thread.contactNumber);
  const guestName = guest?.name || contactLabel;
  const firstName = guest ? guestName.split(' ')[0] : contactLabel;
  const initials = guest?.initials || '';

  // Note: canonical room strings already carry reservation status where
  // relevant ("112 (RESERVED)") — the Figma's plain-text status treatment.
  // guest.statusTag is the LOYALTY tier — shown as a tag beside the name.
  const room = reservation?.room;
  const loyalty = guest?.statusTag;
  const requestCount = reservation?.requestCount;

  // Production parity: `unread_count > 0 || is_escalated`.
  const showDot = !!(thread.isUnread || thread.isEscalated);
  const rowRef = useRowKeyActivation(onClick);

  return (
    /**
     * The row is a `CanaryListItem` — the base ships exactly the escape hatches
     * this anatomy needs: `children` (so the avatar / name / tag / indicator
     * cluster below is untouched), `isSelected` + `selectedBackgroundColor`,
     * `hoverColor`, and `onClick`.
     *
     * ⚠ IT IS NOT WRAPPED IN `CanaryList`, on purpose. That component draws a
     * `colorBlack6` hairline between every pair of children and fades each row
     * in on mount; these rows are separated 6px-radius cards with no dividers.
     * The `<ul>` they sit in belongs to `ThreadList`.
     *
     * ⚠ WHY THE BORDER IS `!important` AND NOT INLINE. The library's own
     * stylesheet gives every `.canary-list-item` a `border-bottom: 1px solid
     * #D9D9D9` (exempting `:last-child`) — a divider it expects `CanaryList` to
     * absorb. Outside a `CanaryList` it renders, so the row's own border has to
     * outrank it on all four sides. `!border !border-solid !border-<color>` does
     * that; `!border-b-0` would too, but it would also take the bottom edge off
     * the SELECTED row's blue outline.
     *
     * ⚠ HOVER IS A PROP, NOT A CLASS — and this is the same trap the hand-rolled
     * row documented. The base applies its hover fill by writing
     * `style.backgroundColor` in `onMouseEnter`, and an inline style outranks
     * any class, so a `hover:bg-*` utility could never win. `hoverColor` is the
     * only door. (Historically this row set `backgroundColor: 'transparent'`
     * inline and its hover silently never rendered — which read as "the wash is
     * too weak" rather than "the wash is absent".)
     *
     * Padding, gap and the selected row's hover-dim reach the base's INNER div
     * through `[&>*]:` variants: `padding="compact"` is the 8px vertical the
     * frame draws but its horizontal is 16px, the base's gap is 16px where this
     * row wants 12px, and the base fades a SELECTED row to 90% opacity on hover,
     * which this row does not do.
     *
     * ⚠ AND IT NEEDS ITS KEYBOARD BACK. The base puts `role="button"` and
     * `tabIndex={0}` on the `<li>` and the click handler on the inner div, with
     * no key handler anywhere — so every row becomes a tab stop that announces
     * itself as a button and then ignores Enter and Space. The hand-rolled row
     * was a bare `<div onClick>`: not focusable, but at least it promised
     * nothing. `useRowKeyActivation` keeps the base's focusability and makes the
     * promise true. Delete it when the library handles its own keys.
     */
    <CanaryListItem
      ref={rowRef}
      onClick={onClick}
      isSelected={isSelected}
      selectedBackgroundColor={colors.colorBlueDark5}
      hoverColor="rgba(0,0,0,0.08)"
      padding="compact"
      alignment="start"
      className={`shrink-0 rounded-[6px] overflow-clip !border !border-solid ${
        isSelected ? '!border-[#93ABE1]' : '!border-transparent'
      } [&>*]:!px-3 [&>*]:!gap-3 [&>*]:hover:!opacity-100`}
    >
      {/* Avatar */}
      <div className="pt-1 shrink-0">
        <Avatar src={guest?.avatar} initials={initials} size="small" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Name + loyalty tier + Timestamp */}
        <div className="flex items-center gap-2">
          <p
            className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[22px] truncate min-w-0 shrink"
            style={{ color: colors.colorBlack1 }}
          >
            {guestName}
          </p>
          {loyalty && (
            <span className="shrink-0">
              <CanaryTag
                label={loyalty.label}
                size={TagSize.COMPACT}
                variant={TagVariant.FILLED}
                uppercase
                customColor={{
                  backgroundColor: loyalty.color,
                  fontColor: loyalty.textColor || 'white',
                }}
              />
            </span>
          )}
          <span className="flex-1" />
          <span
            className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase whitespace-nowrap shrink-0"
            style={{ color: colors.colorBlack3 }}
          >
            {formattedTime}
          </span>
        </div>

        {/* Room + status (plain text, not a tag) + request count */}
        {(room || (requestCount && requestCount > 0)) && (
          <div className="flex items-center gap-3">
            {room && (
              <div className="flex items-center gap-1">
                <Icon path={mdiBedOutline} size={0.67} color={colors.colorBlack3} />
                <span
                  className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase"
                  style={{ color: colors.colorBlack3 }}
                >
                  {room}
                </span>
              </div>
            )}
            {requestCount && requestCount > 0 ? (
              <div className="flex items-center gap-1">
                <Icon path={mdiRoomServiceOutline} size={0.67} color={colors.colorBlack3} />
                <span
                  className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase"
                  style={{ color: colors.colorBlack3 }}
                >
                  {requestCount}
                </span>
              </div>
            ) : null}
          </div>
        )}

        {/* Preview + the right-hugging indicator cluster (siblings, not
            alternatives — see the header note). */}
        <div className="flex items-center gap-2">
          <p
            className={`flex-1 min-w-0 font-['Roboto',sans-serif] text-[14px] leading-[22px] truncate ${isTyping ? 'italic' : ''}`}
            style={{ color: colors.colorBlack3 }}
          >
            {isTyping ? `${firstName} is typing...` : thread.lastMessage}
          </p>

          {(showDot || thread.isFlagged) && (
            <div className="flex items-center gap-[6px] shrink-0">
              {/* Attention dot — unread OR escalated (production parity:
                  `unread_count > 0 || is_escalated`). Escalated turns amber
                  (warning), matching production's `.isEscalated` variant;
                  plain unread stays pink. Rendered only when it applies: an
                  always-present transparent box would push a lone flag off the
                  right margin. */}
              {showDot && (
                <div
                  className="w-[10px] h-[10px] rounded-full shrink-0"
                  style={{
                    backgroundColor: thread.isEscalated ? colors.warning : colors.colorPink1,
                  }}
                />
              )}
              {/* The flag's explanation is a `CanaryTooltip`, not the native
                  `title` attribute it used to be, and not @mdi/react's `title`
                  prop — that one auto-generates an `aria-labelledby` id from a
                  module-level counter, which differs between the server and
                  client renders and trips React hydration. CanaryTooltip touches
                  no ids, so that hazard does not reach it.
                  (The same hydration note still governs the failure icon in the
                  Conversation Details panel.)

                  TWO THINGS THE BASE MADE US DO, both measured rather than
                  assumed:

                  1. THE SPAN CARRIES NO `aria-label` ANY MORE. The base renders
                     its bubble ALWAYS — hidden by `opacity: 0`, which does not
                     remove a node from the accessibility tree — and never marks
                     it `aria-hidden`. So the bubble's sentence is folded into
                     the accessible name of every ancestor, this row's button
                     included. With the old `aria-label` still on the span the
                     row announced the sentence TWICE. Deleting the label leaves
                     the bubble as the single source of it, which is exactly what
                     the row said before.
                  2. NO SHADOW. The base's bubble ships Tailwind's `shadow`;
                     this branch draws none, anywhere.

                  The bubble is `position: absolute` and `whitespace-nowrap`, so
                  it lives or dies by its ancestors' overflow. Measured here: the
                  bubble is 370×26 inside a 405×80 row and clears all eight
                  clipping ancestors with zero cut on every side. It sits ABOVE
                  the flag and to its LEFT — which is the only reason a 370px
                  bubble fits beside an indicator 20px from the row's right edge.
                  Both facts are contingent on this row's size; a shorter or
                  narrower row would clip it. Logged as a foundation ask
                  (portal the bubble / let it wrap / flip on collision). */}
              {thread.isFlagged && (
                <CanaryTooltip
                  content="Potential guest frustration detected. AI paused to avoid escalation."
                  position={TooltipPosition.TOP}
                  className="shrink-0 [&>div]:!shadow-none"
                >
                  <span className="flex items-center shrink-0 cursor-help">
                    <Icon path={mdiFlag} size={0.83} color="#E40046" />
                  </span>
                </CanaryTooltip>
              )}
            </div>
          )}
        </div>
      </div>
    </CanaryListItem>
  );
}
