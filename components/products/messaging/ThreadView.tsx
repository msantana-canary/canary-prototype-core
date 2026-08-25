/**
 * ThreadView Component — REDESIGN (Figma "Messaging" frame 2038:57666)
 *
 * The conversation card: white rounded-12 bordered container holding the
 * thread header (guest identity · archive / info / kebab), the flat-block
 * message feed, and the composer. The guest info panel is NO LONGER rendered
 * inside this component — it's a sibling column (push) or overlay (drawer)
 * composed at the page level.
 *
 * Header: avatar · name + loyalty tag on line 1; line 2 is bed-icon room +
 * calendar-icon stay dates. Right actions are three BARE icons in order —
 * archive, ⓘ, kebab. Archive was a TEXT button in the previous canon and the
 * info button carried a blue tonal pressed fill; both are gone (see IconAction
 * below). The kebab keeps Block/Unblock + Mark as Unread; the standalone "Link
 * reservation" text button is gone (linking lives in the info panel).
 */

'use client';

import React from 'react';
import { Avatar } from './Avatar';
import { MessageFeed } from './MessageFeed';
import { MessageComposer } from './MessageComposer';
import { ThreadAiSlot } from './ai/ThreadAiSlot';
import { useMessagingStore } from '@/lib/products/messaging/store';
import { Thread, Message } from '@/lib/products/messaging/types';
import { DEMO_PROPERTY_NAME } from '@/lib/products/messaging/message-templates';
import { Guest } from '@/lib/core/types/guest';
import { Reservation } from '@/lib/core/types/reservation';
import {
  colors,
  ButtonSize,
  ButtonType,
  CanaryButton,
  CanaryCard,
  CanaryOverflowMenu,
  CanaryTag,
  CardPadding,
  TagSize,
  TagVariant,
} from '@canary-ui/components';
import Icon from '@mdi/react';
import {
  mdiBedOutline,
  mdiCalendarOutline,
  mdiInformationOutline,
  mdiDotsHorizontal,
  mdiArchiveArrowDownOutline,
} from '@mdi/js';

/**
 * A bare header icon button: a 28px square with ZERO padding, transparent at
 * rest, neutral 8%-black wash on hover and while pressed. Deliberately NOT a
 * blue tonal fill — the surface already spends blue on selection and on links.
 *
 * It is a `CanaryButton` (ICON_SECONDARY / COMPACT). The base already draws the
 * wash as an 8%-hover / 16%-press opacity ladder on its own `.button-bg` layer;
 * `.icon-btn-neutral` only repaints that layer black, because the library keys
 * the colour to `ButtonColor` and every non-status colour resolves to blue. The
 * 8% the library lands on is EXACTLY the `rgba(0,0,0,0.08)` this header used to
 * hand-roll, so the rest/hover register is unchanged to the pixel.
 * `.icon-btn-28` and `.icon-btn-r6` supply the two bits of geometry the size
 * ramp stops short of (it bottoms out at 24px / 4px), and `.icon-btn-latched`
 * pins the wash on for a control whose panel is open.
 *
 * ⚠ `aria-pressed` IS LOST. `CanaryButton` declares no ARIA props and spreads no
 * rest props, so the info button's toggle now announces as a plain button and
 * its "open" state is visual only. Logged as a foundation ask; do not paper over
 * it by wrapping the button in a labelled span, which would double the name.
 *
 * The accessible name rides the mdi `Icon`'s `title` — the library gives icon
 * buttons no `aria-label` — with an EXPLICIT, STABLE `id` beside it. Without one
 * `@mdi/react` numbers the `<title>` element off a module-level counter, which
 * is the SSR/client hydration mismatch documented in `ThreadListItem`.
 */
function IconAction({
  path,
  label,
  id,
  onClick,
  isPressed = false,
}: {
  path: string;
  label: string;
  /** Stable DOM id for the mdi `<title>`. See the hydration note above. */
  id: string;
  /** Omitted for the kebab: CanaryOverflowMenu wraps the trigger in its own
   *  click handler, so a second one here would toggle the menu twice. */
  onClick?: () => void;
  isPressed?: boolean;
}) {
  return (
    <CanaryButton
      type={ButtonType.ICON_SECONDARY}
      size={ButtonSize.COMPACT}
      onClick={onClick}
      className={`icon-btn-neutral icon-btn-28 icon-btn-r6${isPressed ? ' icon-btn-latched' : ''}`}
      icon={<Icon path={path} size={0.83} color={colors.colorBlack3} title={label} id={id} />}
    />
  );
}

interface ThreadViewProps {
  thread: Thread;
  guest: Guest | null;
  reservation: Reservation | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
  aiEnabled: boolean;
  onAiToggle: () => void;
  isGuestInfoOpen: boolean;
  onToggleGuestInfo: () => void;
  onArchive: () => void;
  onBlock: () => void;
  onUnblock: () => void;
  onMarkUnread: () => void;
  typingThreadId: string | null;
}

export function ThreadView({
  thread,
  guest,
  reservation,
  messages,
  onSendMessage,
  aiEnabled,
  onAiToggle,
  isGuestInfoOpen,
  onToggleGuestInfo,
  onArchive,
  onBlock,
  onUnblock,
  onMarkUnread,
  typingThreadId,
}: ThreadViewProps) {
  // The draft card's hand-over to the composer. Scoped to THIS thread — a draft
  // edited on one conversation must not land in another one's box.
  const injection = useMessagingStore((s) => s.composerInjection);
  const clearComposerInjection = useMessagingStore((s) => s.clearComposerInjection);

  // The thread's kept composer text. Selected per-thread so a keystroke in one
  // conversation can't re-render the others' rows.
  const draft = useMessagingStore((s) => s.composerDrafts[thread.id] ?? '');
  const setComposerDraft = useMessagingStore((s) => s.setComposerDraft);

  /**
   * What a template's merge tags resolve to on THIS conversation.
   *
   * Assembled from the spotlight guest and stay the header is already naming,
   * so a template inserted into the composer can never introduce a third
   * account of who this is. Every field is optional and a tag with nothing
   * behind it stays literal — see `interpolateMergeTags`.
   */
  const mergeContext = React.useMemo(
    () => ({
      guest_first_name: guest?.name?.trim().split(/\s+/)[0],
      hotel_name: DEMO_PROPERTY_NAME,
      arrival_date: reservation?.checkInDate,
      confirmation_id: reservation?.confirmationCode,
    }),
    [guest?.name, reservation?.checkInDate, reservation?.confirmationCode]
  );

  const isGuestTyping = typingThreadId === thread.id;

  /**
   * The kebab's items, as `CanaryOverflowMenu` models them. The component owns
   * open/closed state and click-outside itself, which is why this file no longer
   * carries either — the hand-rolled version's `mousedown` listener and its two
   * refs are gone.
   *
   * ⚠ TWO COLOURS CHANGE HERE, deliberately. The base sets item colour inline
   * from one flag: `danger` when `isDanger`, `colorBlack2` (#333) otherwise, with
   * no per-item hook. So "Unblock" loses its blue (#2858C4 → #333333) and "Mark
   * as Unread" moves off pure black (#000000 → #333333); the hover wash moves
   * from Tailwind `gray-50` to `colorBlack7` (#F0F0F0). Blue "Unblock" was the
   * odd one out anyway — a menu row is not a link — and taking the component's
   * colour model whole is the point of the exercise. Logged as a foundation ask
   * (per-item colour / `customColor` on overflow-menu items).
   */
  const menuItems =
    thread.status === 'blocked'
      ? [
          { id: 'unblock', label: 'Unblock', onClick: onUnblock },
          { id: 'markUnread', label: 'Mark as Unread', onClick: onMarkUnread },
        ]
      : [
          { id: 'block', label: 'Block', isDanger: true, onClick: onBlock },
          { id: 'markUnread', label: 'Mark as Unread', onClick: onMarkUnread },
        ];

  return (
    /* The conversation card. `CanaryCard` with no padding and a border is
       already white / `colorBlack6` / bordered; only the radius is ours (the
       base bakes `rounded-lg` = 8px, this surface draws 12px).

       ⚠ The base nests its children in a SECOND div, so the flex column and the
       `min-h-0` that lets the message feed scroll instead of pushing the card
       open both have to be re-established on that child — hence the `[&>div]:`
       run. Without it the feed's `flex-1 overflow-y-auto` has no bounded parent
       and the composer is pushed off the bottom of the card. */
    <CanaryCard
      cardPadding={CardPadding.NONE}
      hasBorder
      className="flex-1 min-w-0 flex flex-col h-full overflow-clip !rounded-[12px] [&>div]:flex-1 [&>div]:min-h-0 [&>div]:flex [&>div]:flex-col"
    >
      {/* Thread Header */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{ minHeight: 70, borderBottom: `1px solid ${colors.colorBlack6}`, paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8 }}
      >
        {/* Guest Info / Contact Number */}
        <div className="flex items-center min-w-0">
          <Avatar src={guest?.avatar} initials={guest?.initials || ''} size="medium" />
          <div className="min-w-0" style={{ paddingLeft: 8 }}>
            <div className="flex items-center gap-2">
              <h2 className="font-['Roboto',sans-serif] font-medium text-[16px] leading-[24px] truncate" style={{ color: colors.colorBlack1 }}>
                {guest?.name || thread.contactNumber}
              </h2>
              {/* Loyalty tier — moved here from message blocks (Miguel 2026-07-20).
                  Renders in the thread list row and thread header only. */}
              {guest?.statusTag && (
                <CanaryTag
                  label={guest.statusTag.label}
                  size={TagSize.COMPACT}
                  variant={TagVariant.FILLED}
                  uppercase
                  customColor={{
                    backgroundColor: guest.statusTag.color,
                    fontColor: guest.statusTag.textColor || 'white',
                  }}
                />
              )}
              {thread.status === 'archived' && (
                <CanaryTag
                  label="Archived"
                  size={TagSize.COMPACT}
                  variant={TagVariant.FILLED}
                  customColor={{ backgroundColor: '#e5e5e5', fontColor: '#666666' }}
                />
              )}
              {thread.status === 'blocked' && (
                <CanaryTag
                  label="Blocked"
                  size={TagSize.COMPACT}
                  variant={TagVariant.FILLED}
                  customColor={{ backgroundColor: '#FCE6ED', fontColor: '#E40046' }}
                />
              )}
            </div>
            <div className="flex items-center gap-3">
              {reservation?.room && (
                <div className="flex items-center gap-1">
                  <Icon path={mdiBedOutline} size={0.67} color={colors.colorBlack3} />
                  <span className="font-['Roboto',sans-serif] text-[14px] leading-[22px]" style={{ color: colors.colorBlack3 }}>
                    {reservation.room}
                  </span>
                </div>
              )}
              {reservation?.checkInDate && reservation?.checkOutDate && (
                <div className="flex items-center gap-1">
                  <Icon path={mdiCalendarOutline} size={0.67} color={colors.colorBlack3} />
                  <span className="font-['Roboto',sans-serif] text-[14px] leading-[22px]" style={{ color: colors.colorBlack3 }}>
                    {reservation.checkInDate} - {reservation.checkOutDate}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons — archive · ⓘ · kebab (frame 2038:57666).
            All three are BARE icons: zero padding, no background box at rest, a
            neutral 8%-black wash on hover, and no blue pressed tint (the info
            button's tonal-blue pressed fill is gone — it read as a fourth
            selection register on a surface that already has two). */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Archive — an icon in the landed frame; it was a text button before. */}
          {thread.status === 'inbox' && (
            <IconAction
              onClick={onArchive}
              label="Archive conversation"
              id="thread-archive"
              path={mdiArchiveArrowDownOutline}
            />
          )}

          <IconAction
            onClick={onToggleGuestInfo}
            label="Conversation details"
            id="thread-details"
            path={mdiInformationOutline}
            isPressed={isGuestInfoOpen}
          />

          {/* Kebab menu.
              `--overflow-menu-w` rides a wrapper because `CanaryOverflowMenu`
              takes a `className` but no `style`; `.overflow-menu-w` reads it off
              an ancestor and re-widths the popover past the base's hardcoded
              180px floor to the 192px this header drew. The wrapper is `flex` so
              the menu's `inline-block` root can't pick up a text baseline and
              sit a couple of pixels off the other two icons.

              Three more deltas ride `className`. `.overflow-menu-flat` removes
              the base's inline `shadows.lg` (this branch draws no shadows), and
              the `mt-1` restores the 4px the hand-rolled popover left between
              the trigger and the menu — the base's popover has no offset at all.
              The `flex` on the FIRST child is the base's trigger wrapper: it is
              a plain block, so an inline-flex trigger inside it grows a ~2.5px
              baseline descender, which measured as the kebab sitting 1.2px above
              the other two header icons and the menu opening 6.5px below it
              instead of 4px.

              The `:has()` rule is the kebab's own pressed LATCH. The base keeps
              `isOpen` private, so "menu is open" can only be read off the DOM:
              the popover is the root's second child and exists only while open.
              That is the same 8% wash `.icon-btn-latched` paints, applied from a
              state we cannot otherwise see. */}
          <div className="flex" style={{ ['--overflow-menu-w' as string]: '192px' } as React.CSSProperties}>
            <CanaryOverflowMenu
              items={menuItems}
              placement="bottom-end"
              className="overflow-menu-flat overflow-menu-w [&>div:first-child]:flex [&>div:nth-child(2)]:!mt-1 [&:has(>div:nth-child(2))_.button-bg]:!opacity-[0.08]"
              trigger={
                <IconAction label="More actions" id="thread-more" path={mdiDotsHorizontal} />
              }
            />
          </div>
        </div>
      </div>

      {/* Messages */}
      <MessageFeed messages={messages} guest={guest} />

      {/* Typing Indicator */}
      {isGuestTyping && (
        <div className="px-4 pb-1">
          <p className="font-['Roboto',sans-serif] text-[10px] leading-[16px]" style={{ color: colors.colorBlack4 }}>
            Guest is typing
          </p>
        </div>
      )}

      {/* Composer — plus the AI's top slot (drafted response, then the band
          stack). The slot is handed to the composer rather than rendered here
          so it inherits the composer's own padding and edges. */}
      <div className="shrink-0">
        <MessageComposer
          /* KEYED BY THREAD. The composer holds its text in local state, so
             without this the box carries its contents from one conversation to
             the next. That was survivable when the only way to fill it was to
             type; it stopped being survivable the moment the draft card could
             put an AI's reply to Chloe into Lucia's composer.

             ── AND THE DRAFT IS KEPT NOW (QA-1) ───────────────────────────
             The key still guarantees no bleed; `draft` / `onDraftChange` are
             what stop the switch from DESTROYING the text on the way out.
             Production keeps per-thread drafts, and the Edit-an-AI-draft path
             made the old behaviour lossy in the worst place: Edit consumes the
             card, so the composer was the only surviving copy of the reply and
             one stray click erased it with no undo. */
          key={thread.id}
          draft={draft}
          onDraftChange={(text) => setComposerDraft(thread.id, text)}
          mergeContext={mergeContext}
          /* Apple Message Templates need an Apple session. Absent ⇒ SMS, which
             is every thread here, so the tab stays closed. */
          isAppleBusiness={thread.channel === 'AMB'}
          onSend={onSendMessage}
          placeholder="Type SMS message..."
          aiEnabled={aiEnabled}
          onAiToggle={onAiToggle}
          topSlot={<ThreadAiSlot threadId={thread.id} />}
          injection={injection?.threadId === thread.id ? injection : null}
          onInjectionConsumed={clearComposerInjection}
        />
      </div>
    </CanaryCard>
  );
}
