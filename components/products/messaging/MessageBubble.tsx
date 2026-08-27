/**
 * MessageBubble Component — REDESIGN: flat blocks, not bubbles
 * (Figma "Messaging" frame 2038:57666, "Chatlog" nodes)
 *
 * Everyone is left-aligned (Slack register — the email surface's block anatomy
 * ported back to messaging): 32px rounded-8 avatar · title row (name +
 * right-aligned 10px uppercase time) · 14px body · 10px uppercase footer.
 *
 * ── SENDER IDENTITY: THREE REGISTERS, ONE COLUMN ──────────────────────────
 * ⚠ SUPERSEDES the earlier "everyone's name is black; only the AI is special"
 * decision. Miguel 2026-08-20: **"staff is blue, guest is black, AI is all the
 * cool shit."** Three senders, three registers, read off one column:
 *
 *   GUEST → name in colorBlack1, gray initials tile / photo. The outside voice.
 *   STAFF → name in colorBlueDark1 (#2858C4) and a colorBlueDark5 initials tile
 *           with colorBlueDark1 glyphs (`Avatar tone="blue"`). Blue is already
 *           the product's "us" colour — actions, links, selection — so the
 *           property's own replies inherit it and stop reading as a third kind
 *           of guest. Black-for-everyone made the feed one undifferentiated
 *           voice: you had to READ the name to know which side sent it.
 *   AI    → "Canary" in the shared magenta→violet gradient
 *           (`.ai-gradient-text`) plus the animated orb tile. Not a colour, a
 *           whole register — the AI is the only sender that gets motion.
 *
 * The escalation is deliberate: neutral → brand → alive. Who-said-what reads
 * from the name column, per the redesign call ("Slack does this; it's clear").
 *
 * ── AI MESSAGE ANATOMY (the batch-2 addition) ─────────────────────────────
 * An AI message is not a staff message with a different name. It carries its
 * own work:
 *
 *   [orb]  Canary · Completed 6 Steps ⌄                            5:25 PM
 *          ┌──────────────────────────────────────────────────┐
 *          │ ✓ Search_for_reservation… · Found Emily Smith …   │  ← toggled
 *          │ ✓ Offer_upsells · Late Check-Out Is Available …   │
 *          └──────────────────────────────────────────────────┘
 *          Thanks for letting us know!
 *          DELIVERED  ( 3 SOURCES ⌄ )      ⓘ  👍  👎   ← on hover
 *
 * Steps are UNIVERSAL, not a hero-message garnish: every AI message in the mock
 * carries a trace, because the point is observability — a hotelier should be
 * able to ask "why did it say that?" of ANY answer, not just the interesting
 * one. The card is CLOSED BY DEFAULT everywhere; the caption is the toggle.
 *
 * Feedback (ⓘ / 👍 / 👎) appears on hover so a quiet feed stays quiet.
 *
 * ── WHERE EACH ONE GOES (batch 4 — the stubs are gone) ────────────────────
 *   ⓘ            → the AI Explanation SIDEBAR, success state.
 *   3 SOURCES ⌄  → the SAME sidebar. The chip's chevron once promised a popover
 *                  of source statements; the sidebar already lists them beside
 *                  the reasoning that chose them, so the chip stopped competing
 *                  with it. One source of truth, three doors.
 *   👍           → a local latch. There is still no pipeline behind a compliment
 *                  and inventing one would be the only unearned claim on this
 *                  surface.
 *   👎           → latches AND opens the standalone feedback MODAL. Disagreeing
 *                  is a verdict with a reason, and the reason is worth asking
 *                  for while the answer is still in front of you.
 *
 * ── FOOTER REGISTERS ──────────────────────────────────────────────────────
 * Three captions can sit under a message, all in the same 10px uppercase slot:
 *
 *   1. Delivery status (outbound) — production's ladder, unchanged.
 *   2. "AI CHOSE NOT TO RESPOND" (inbound, `aiDeclined`) — a blue underlined
 *      link after the channel caption. Silence from the agent is a decision,
 *      and an unexplained silence reads as a bug; naming it turns a gap into a
 *      fact. It opens the explanation sidebar at its non-response state.
 *   3. "MESSAGE FAILED TO SEND" (outbound, status `failed`) — a RED underlined
 *      link. This REPLACES the old failed register (red row + alert icon +
 *      "Learn more"); the state logic is untouched, only its dress. Collapsing
 *      three elements into one link makes the failure sit in the same rhythm as
 *      every other caption instead of shouting a whole extra row. It opens the
 *      carrier-error modal ("Message Not Delivered").
 *
 * Loyalty/status tag: removed from message blocks (Miguel 2026-07-20) — it
 * repeated on every message and was too loud. The tier lives in the thread list
 * row and thread header only.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Message, MessageStatus } from '@/lib/products/messaging/types';
import { Guest } from '@/lib/core/types/guest';
import { format } from 'date-fns';
import {
  ButtonColor,
  ButtonSize,
  ButtonType,
  CanaryButton,
  CanaryChip,
  ChipType,
  IconPosition,
  colors,
} from '@canary-ui/components';
import Icon from '@mdi/react';
import {
  mdiChevronDown,
  mdiChevronUp,
  mdiInformationOutline,
  mdiThumbUp,
  mdiThumbDown,
} from '@mdi/js';
import { Avatar } from './Avatar';
import { AiOrbTile } from './AiOrb';
import { AiStepsCard } from './AiStepsCard';
import { ExpandRegion, useMountedThrough } from './motion';
import { useMessagingStore } from '@/lib/products/messaging/store';

const STAFF_NAME = 'Theresa Webb';
const STAFF_INITIALS = 'TW';

// Production (MessageAtomBubble.vue): status renders on every outbound message
// from carrier receipts; Read>Delivered>Sent>Sending. We map the prototype's
// MessageStatus to the production English labels. (The prototype has no 'read'
// state yet; 'delivered' is the top of the ladder here.)
const STATUS_LABELS: Record<MessageStatus, string> = {
  sending: 'Sending',
  sent: 'Sent',
  delivered: 'Delivered',
  failed: 'Failed to send',
};

const CAPTION_CLASS = "font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase";

// Miguel 2026-08-25: "we'll resurface it later" — the sources chip is hidden,
// not removed. The component and its `sourceCount` data stay wired; only the
// render is gated. The explanation sidebar keeps its other two doors open
// (the ⓘ feedback icon, and the "AI chose not to respond" caption link), so
// flip this back to `true` when the chip itself is ready to return.
const SHOW_SOURCES_CHIP = false;

/**
 * An underlined caption link. The one interaction register for both footer
 * links — only the colour changes (blue for "declined", red for "failed").
 *
 * The library has no link primitive, so `ButtonType.TEXT` is the ancestor, and
 * TINY is already the ramp's 10px step. The colour arrives as a `ButtonColor`
 * rather than a hex: TEXT resolves its content colour FROM that enum, and
 * NORMAL → `colorBlueDark1` (#2858C4) and DANGER → #E40046 are exactly the two
 * values this file used to hardcode. That is the point of the swap — two hex
 * literals retired, including the `COLOR_RED_1` local that existed only because
 * the token was not reachable from here.
 *
 * `.text-btn-inline` takes the button chrome off: the size ramp's 24px height,
 * the 16px side padding, the medium weight and the hover wash. A link inside a
 * line of text may not carry a box.
 */
function CaptionLink({
  label,
  color,
  onClick,
}: {
  label: string;
  color: ButtonColor;
  onClick: () => void;
}) {
  return (
    <CanaryButton
      type={ButtonType.TEXT}
      size={ButtonSize.TINY}
      color={color}
      onClick={onClick}
      className={`${CAPTION_CLASS} text-btn-inline [&_span]:underline [text-underline-offset:2px]`}
    >
      {label}
    </CanaryButton>
  );
}

/**
 * A bare feedback icon. NO box, ever — not at rest, not on hover (the gray
 * chip that used to appear on hover boxed three icons that the frame draws
 * naked, and it made the quietest row in the message the busiest).
 *
 * The whole state ladder is the ICON's own colour: gray at rest →
 * colorBlueDark1 on its own hover. That is the same gray→blue transition the
 * composer's tool icons use (`MessageComposer.ToolIcon`), so every bare icon on
 * this surface answers the pointer the same way. Thumbs-up additionally LATCHES
 * blue on click (local visual toggle only — no feedback pipeline behind it).
 *
 * `CanaryButton` ICON_SECONDARY at TINY, shrunk from 24px to 20px by
 * `.icon-btn-20` (which also releases the library's fixed 20px glyph box).
 * `.icon-btn-bare` deletes the `.button-bg` wash layer outright — that IS this
 * register: no box, ever, at any state.
 *
 * ⚠ `aria-pressed` IS LOST on the thumbs-up/-down latch. `CanaryButton` declares
 * no ARIA props and spreads no rest props, so "I rated this" is now visual only.
 * Logged as a foundation ask alongside the same loss on the thread header.
 *
 * ⚠ The wrapping span exists ONLY to carry the mouse handlers the base has
 * nowhere to put — same as `MessageComposer.ToolIcon`.
 */
function FeedbackIcon({
  path,
  label,
  id,
  active,
  onClick,
}: {
  path: string;
  label: string;
  /** Stable DOM id for the mdi `<title>`; suffixed with the message id by the
   *  caller, because this control renders once per message. */
  id: string;
  active?: boolean;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <span
      className="inline-flex"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CanaryButton
        type={ButtonType.ICON_SECONDARY}
        size={ButtonSize.TINY}
        onClick={onClick}
        className="icon-btn-bare icon-btn-20"
        icon={
          <Icon
            path={path}
            size={0.6}
            color={active || isHovered ? colors.colorBlueDark1 : colors.colorBlack4}
            title={label}
            id={id}
          />
        }
      />
    </span>
  );
}

/**
 * The "Completed N Steps ⌄" caption — the steps trace's toggle. Unchanged by the
 * 8/21 review: only the OPEN state lost its box.
 *
 * It sits INSIDE the title row, inline with the sender name, so a hover
 * background would draw a chip in the middle of a line of text. The hover
 * state is the text itself: gray → black, and nothing else moves.
 *
 * `ButtonType.TEXT` with the chevron in the base's own `icon` slot at
 * `IconPosition.RIGHT`. `.text-btn-inline` strips the button chrome and
 * `.text-btn-quiet` carries the grey→black ladder on `.button-content` — which
 * is where the library paints TEXT's content colour, inline, keyed to
 * `ButtonColor` with no grey option (HEADING_TEXT and FONT_SECONDARY are
 * unimplemented in the compiled switch and fall through to blue). The chevron is
 * passed with NO `color` so it inherits `currentColor` and follows the label;
 * that is what retired this component's `isHovered` state.
 *
 * The three `[&_.button-content>div]:` overrides are the base's icon slot: it
 * reserves a fixed 20px box for the glyph and puts an 8px margin between label
 * and icon, where this caption draws a hugging 14px glyph 4px away.
 *
 * ⚠ `aria-expanded` IS LOST — `CanaryButton` has no ARIA passthrough — so the
 * toggle no longer announces whether the trace is open. Logged as a foundation
 * ask. `CanaryExpand` was checked and rejected for this control in the audit
 * (its header and panel are one unit with baked padding and a hairline); it is
 * not revisited here.
 */
function StepsToggle({
  count,
  isOpen,
  onToggle,
}: {
  count: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <CanaryButton
      type={ButtonType.TEXT}
      onClick={onToggle}
      icon={<Icon path={isOpen ? mdiChevronUp : mdiChevronDown} size={0.6} />}
      iconPosition={IconPosition.RIGHT}
      className="text-btn-inline text-btn-quiet shrink-0 whitespace-nowrap font-['Roboto',sans-serif] !text-[12px] leading-[18px] [&_.button-content>div]:!ml-1 [&_.button-content>div]:!w-auto [&_.button-content>div]:!h-auto"
    >
      Completed {count} Steps
    </CanaryButton>
  );
}

/**
 * The header's live status label, DEMO ONLY (Maya Patel's scripted "AI
 * thinking" sequence — see `useThreadDemoSequence`). Sits in the exact slot
 * `StepsToggle` normally occupies, both stacked in one grid cell so the
 * transition between them is an OPACITY crossfade rather than a layout swap —
 * see `MessageBubble`'s render for how the two trade places.
 *
 * `.ai-thinking-label` is a slow, quiet sweep across the SAME AI ramp tokens
 * `.ai-gradient-text` uses for the "Canary" name (`.ai-gradient-quiet` pins it
 * to the 40% structural-rail strength, same as the steps trace's own rail) —
 * one ramp, everywhere the agent is "moving," never a private gradient.
 */
function AiThinkingLabel({ label }: { label: string }) {
  return (
    <span
      className="ai-thinking-label ai-gradient-quiet font-['Roboto',sans-serif] text-[12px] leading-[18px] whitespace-nowrap"
    >
      {label}
    </span>
  );
}

interface MessageBubbleProps {
  message: Message;
  guest?: Guest | null;
  /**
   * DEMO ONLY. Non-empty while THIS message is still "thinking" (Maya's
   * scripted sequence, mid-flight): the header shows this crossfading status
   * label instead of the Completed-N-Steps toggle, the reply body and the
   * whole footer (delivery caption, feedback) stay withheld, and none of it
   * animates in until the sequence hands back `undefined`. Every other
   * message on the surface — which is every message, outside that one demo
   * beat — never receives this prop and renders exactly as it always has.
   */
  thinkingLabel?: string;
}

export function MessageBubble({ message, guest, thinkingLabel }: MessageBubbleProps) {
  const isGuest = message.sender === 'guest';
  const isAI = message.sender === 'ai';
  const formattedTime = format(message.timestamp, 'h:mm a').toUpperCase();
  const isThinking = !!thinkingLabel;

  // Steps stay CLOSED on mount — every AI message has them, so defaulting open
  // would bury the conversation under its own audit trail.
  const [isStepsOpen, setIsStepsOpen] = useState(false);
  // …and stay in the DOM through their own close animation. See the trace below.
  const isStepsMounted = useMountedThrough(isStepsOpen);
  const [isHovered, setIsHovered] = useState(false);
  const [isHelpful, setIsHelpful] = useState(false);
  const [isNotHelpful, setIsNotHelpful] = useState(false);

  /**
   * DEMO ONLY — the crossfade's two halves.
   *
   * `lastThinkingLabel` keeps the OUTGOING label on screen while it fades:
   * the moment `thinkingLabel` goes from a string to `undefined` (sequence
   * complete), this still holds the last one shown, so the fading-out layer
   * below has something to fade FROM instead of going blank a frame early.
   *
   * `isBodyRevealed` gates the reply paragraph's own fade-in the same way
   * `ExpandRegion` gates its height: mount closed, then flip on the next
   * frame so the browser has an `opacity: 0` to transition away from. For
   * every non-demo message `thinkingLabel` is always `undefined`, so this
   * starts (and stays) `true` with no transition ever run — zero regression.
   */
  const [lastThinkingLabel, setLastThinkingLabel] = useState(thinkingLabel);
  const [isBodyRevealed, setIsBodyRevealed] = useState(!isThinking);
  useEffect(() => {
    if (thinkingLabel) setLastThinkingLabel(thinkingLabel);
  }, [thinkingLabel]);
  useEffect(() => {
    if (isThinking) {
      setIsBodyRevealed(false);
      return;
    }
    const frame = window.requestAnimationFrame(() => setIsBodyRevealed(true));
    return () => window.cancelAnimationFrame(frame);
  }, [isThinking]);

  /**
   * THE THREE ENTRY POINTS INTO THE AI LOOP, taken one at a time from the store
   * rather than by prop-drilling three callbacks through MessageFeed and
   * ThreadView. A message block is the only thing that knows which message it
   * is; making the page know as well would mean the page re-rendering every
   * time a caption is clicked.
   */
  const openAiExplanation = useMessagingStore((s) => s.openAiExplanation);
  const openFeedbackModal = useMessagingStore((s) => s.openFeedbackModal);
  const openCarrierErrors = useMessagingStore((s) => s.openCarrierErrors);

  const displayName = isGuest ? guest?.name ?? 'Guest' : isAI ? 'Canary' : STAFF_NAME;

  // Guest black / staff blue. The AI never reads this — it takes the gradient
  // class instead of a flat colour.
  const nameColor = isGuest ? colors.colorBlack1 : colors.colorBlueDark1;

  const steps = isAI ? message.aiSteps ?? [] : [];
  const sourceCount = isAI ? message.sourceCount : undefined;

  // Footer: inbound (guest) shows the channel; outbound (staff/AI) shows the
  // real delivery status mapped to production labels. Undefined status falls
  // back to "Delivered" (the prior default behavior).
  const outboundStatus: MessageStatus = message.status ?? 'delivered';
  const isFailed = !isGuest && outboundStatus === 'failed';
  const deliveryCaption = isGuest ? message.channel : STATUS_LABELS[outboundStatus];

  // Feedback controls persist once used, so a rating doesn't vanish on mouse-out.
  const showFeedback = isAI && (isHovered || isHelpful || isNotHelpful);

  return (
    <div
      className="flex items-start gap-3"
      /* Full-block hover wash (Figma): `colorBlack8` (#FAFAFA) across the whole
       * row, not just the footer, so the footer's hover-only icons read as
       * sitting on one surface instead of floating over nothing. Painted as an
       * inline value driven by `isHovered` rather than a `hover:bg-*` class —
       * the known trap in this codebase (see `ThreadListItem`'s `hoverColor`
       * note): this same div already carries an inline `style` object for its
       * padding, and any inline `backgroundColor` set elsewhere would out-rank
       * a Tailwind hover class outright. State-driven inline is the only door
       * that reliably wins.
       */
      style={{
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: isHovered ? colors.colorBlack8 : 'transparent',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar — staff gets the blue tile, guest the neutral one. */}
      {isAI ? (
        <AiOrbTile />
      ) : (
        <Avatar
          src={isGuest ? guest?.avatar : undefined}
          initials={isGuest ? guest?.initials ?? '' : STAFF_INITIALS}
          size="small"
          tone={isGuest ? 'neutral' : 'blue'}
          className="shrink-0"
        />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col pt-1">
        {/* Title row — name (+ the AI steps toggle) and a right-aligned time. */}
        <div className="flex items-center gap-2">
          <span
            className={`font-['Roboto',sans-serif] font-medium text-[14px] leading-[22px] truncate ${
              isAI ? 'ai-gradient-text' : ''
            }`}
            style={isAI ? undefined : { color: nameColor }}
          >
            {displayName}
          </span>

          {isAI && (steps.length > 0 || isThinking) && (
            <>
              <span
                aria-hidden="true"
                className="font-['Roboto',sans-serif] text-[12px] leading-[18px] shrink-0"
                style={{ color: colors.colorBlack3 }}
              >
                ·
              </span>
              {/* DEMO CROSSFADE — both layers always mounted, stacked in one
                  grid cell, trading opacity over 250ms. This is what makes
                  "the status label crossfades into the real chip" a single
                  continuous animation rather than one thing vanishing and
                  another popping in. Every non-demo message has `isThinking`
                  permanently false, so only the (already-populated) steps
                  layer ever paints — no grid, no transition, no change.

                  ── VERTICAL CENTERING (Miguel's polish-pass fix #4, measured
                  2026-08-27) ── The title row is `flex items-center`, which
                  centers this whole grid span against "Canary"'s midline —
                  but a CSS grid ITEM with an inline-level child (a bare
                  `<span>`) gets BLOCKIFIED to `display: block`, and a plain
                  block box has no `align-items` of its own: whatever sits
                  inside it just falls to normal inline baseline layout. The
                  completed chip reads centered anyway because `CanaryButton`
                  wraps ITSELF in a flex row internally; `AiThinkingLabel` is a
                  bare span with no such wrapper, so it landed 2px low — its
                  OWN 12px/18px text metrics baseline-aligning inside a block
                  box, rather than being centered against the row's cross-axis
                  the way a flex child would be.

                  The fix: give EACH stacked cell `display: flex; alignItems:
                  center` — the same "flex items-center row anatomy" the
                  completed chip already gets for free — rather than patching
                  `AiThinkingLabel` alone. Both cells stretch to the grid
                  span's own height (CSS Grid's `align-items: stretch`
                  default, since neither this span nor its parent overrides
                  it) and now both center their content inside that stretched
                  box the same way, so there is nothing left for the crossfade
                  to jump between — thinking and completed states measure
                  delta 0 against "Canary"'s midline alike. */}
              {isThinking || lastThinkingLabel ? (
                <span className="relative inline-grid shrink-0">
                  <span
                    aria-hidden={!isThinking}
                    style={{
                      gridArea: '1 / 1',
                      display: 'flex',
                      alignItems: 'center',
                      opacity: isThinking ? 1 : 0,
                      transition: 'opacity 250ms ease',
                      pointerEvents: isThinking ? 'auto' : 'none',
                    }}
                  >
                    <AiThinkingLabel label={thinkingLabel ?? lastThinkingLabel ?? ''} />
                  </span>
                  <span
                    style={{
                      gridArea: '1 / 1',
                      display: 'flex',
                      alignItems: 'center',
                      opacity: isThinking ? 0 : 1,
                      transition: 'opacity 250ms ease',
                      pointerEvents: isThinking ? 'none' : 'auto',
                    }}
                  >
                    {steps.length > 0 && (
                      <StepsToggle
                        count={steps.length}
                        isOpen={isStepsOpen}
                        onToggle={() => setIsStepsOpen((v) => !v)}
                      />
                    )}
                  </span>
                </span>
              ) : (
                <StepsToggle
                  count={steps.length}
                  isOpen={isStepsOpen}
                  onToggle={() => setIsStepsOpen((v) => !v)}
                />
              )}
            </>
          )}

          <span className="flex-1" />
          <span
            className={`${CAPTION_CLASS} whitespace-nowrap shrink-0`}
            style={{ color: colors.colorBlack3 }}
          >
            {formattedTime}
          </span>
        </div>

        {/* Steps trace — sits ABOVE the answer, because it is what produced it.
            Shared with the call-details transcript.

            ⚠ NO BOX (design review 2026-08-21, frame 2090:37167). The rows sit
            directly on the message ground under a 2px AI-gradient rail; see
            AiStepsCard for why the bordered card lost. The inset here is the
            frame's, measured off it:

              • FLUSH LEFT — the rail lands on the content column's own left
                edge, i.e. exactly under the "C" of Canary, so it reads as the
                name bleeding downward rather than as a second margin.
              • paddingLeft 10 — the check glyphs start ~8px clear of the rail.
              • NO vertical padding ON THE RAIL — its extent is still the ROWS'
                extent, top and bottom, which is what keeps it looking like a
                bracket on the trace instead of a bar beside it.

            ── IT ANIMATES NOW (2026-08-24) ────────────────────────────────
            It used to appear and vanish on the frame. Everything else on this
            surface that opens in place — the reservation-details band, Linked
            Reservations — grows, and a trace that SNAPS shoves the answer down
            the screen with no motion to follow, which reads as the feed
            re-laying-out rather than as one block opening.

            `ExpandRegion` is the surface's one expand register, moved down to
            `motion.tsx` so the thread can use it without importing the panel's
            vocabulary. `animateOnMount` because the trace is rendered under a
            `&&` here, so its body arrives already open and would otherwise snap;
            `useMountedThrough` holds it in the DOM for the 160ms it is still
            closing, since there is nothing to animate out of an unmounted node.
            220ms open / 160ms close, instant under `prefers-reduced-motion` —
            all of it the register's, none of it restated.

            ── AND IT BREATHES (Miguel, 2026-08-24: "a little tight") ──────
            The margins are the trace's clearances, and they sit OUTSIDE the
            rail on purpose: 10px above (between the name row and the first
            step) and 10px below (between the last step and the answer), where
            the batch-6 build had 0 and 8. Putting the air in `AiStepsCard`'s
            own padding instead would have stretched the rail past its rows and
            turned the bracket back into a bar. */}
        {isAI && isStepsMounted && (
          <ExpandRegion isOpen={isStepsOpen} animateOnMount>
            <div style={{ marginTop: 10, marginBottom: 10 }}>
              <AiStepsCard
                steps={steps}
                style={{ paddingLeft: 10, paddingRight: 0, paddingTop: 0, paddingBottom: 0 }}
              />
            </div>
          </ExpandRegion>
        )}

        {/* Body — withheld entirely while `isThinking` (DEMO ONLY: there is no
            reply yet), then fades in over 250ms once the sequence lands. See
            `isBodyRevealed` above; every non-demo message renders here
            immediately, same as always. */}
        {!isThinking && (
          <p
            className="font-['Roboto',sans-serif] text-[14px] leading-[22px] whitespace-pre-wrap"
            style={{
              color: colors.colorBlack1,
              opacity: isBodyRevealed ? 1 : 0,
              transition: 'opacity 250ms ease-out',
            }}
          >
            {message.content}
          </p>
        )}

        {/* Footer row — caption(s), the sources chip, and hover feedback.
            DEMO ONLY: withheld while `isThinking` — there is no delivery
            status, no sources and nothing to rate yet, so hover ⓘ/👍/👎 stay
            off the surface until the sequence actually lands them. */}
        {!isThinking && (
        <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 6, minHeight: 20 }}>
          {isFailed ? (
            <CaptionLink
              label="Message failed to send"
              color={ButtonColor.DANGER}
              onClick={() => openCarrierErrors(message.id)}
            />
          ) : (
            <>
              {deliveryCaption && (
                <span className={CAPTION_CLASS} style={{ color: colors.colorBlack3 }}>
                  {deliveryCaption}
                </span>
              )}
              {isGuest && message.aiDeclined && (
                <CaptionLink
                  label="AI chose not to respond"
                  color={ButtonColor.NORMAL}
                  /* Same sidebar as the ⓘ, opened at its non-response state. The
                     absence of a reply is an answer, and it gets the same page
                     the replies get. */
                  onClick={() => openAiExplanation(message.id)}
                />
              )}
            </>
          )}

          {/* Sources chip — a bordered pill, no fill, no shadow.
              It opens the SAME explanation sidebar as the ⓘ. The chevron once
              promised its own popover of source statements; that would have
              been a second, thinner copy of a list the sidebar already prints
              with the reasoning that selected it. One list, one place. */}
          {/* `CanaryChip` is the right interactive-pill primitive — it brings
              `role="button"`, Enter/Space handling, the rounded-full geometry
              and a trailing-icon slot. What it does NOT bring is this register:
              both of its own (blue SELECTABLE, grey-filled REMOVABLE) paint
              their colours INLINE and re-write them on hover and press, so the
              frames' neutral caption-weight outline can only be pinned from
              outside. That is all `.chip-source` is, stated across every one of
              those states. Logged as the `customColor` ask, for parity with
              `CanaryTag.customColor`.
              `label` is typed `string`, so the count is interpolated rather than
              passed as children. */}
          {SHOW_SOURCES_CHIP && isAI && !!sourceCount && (
            <CanaryChip
              chipType={ChipType.SELECTABLE}
              label={`${sourceCount} Sources`}
              onClick={() => openAiExplanation(message.id)}
              trailingIcon={
                <Icon path={mdiChevronDown} size={0.55} color={colors.colorBlack3} />
              }
              className={`${CAPTION_CLASS} chip-source`}
            />
          )}

          {showFeedback && (
            <div className="flex items-center gap-1">
              <FeedbackIcon
                path={mdiInformationOutline}
                label="About this answer"
                id={`fb-about-${message.id}`}
                onClick={() => openAiExplanation(message.id)}
              />
              <FeedbackIcon
                path={mdiThumbUp}
                label="Helpful"
                id={`fb-up-${message.id}`}
                active={isHelpful}
                onClick={() => {
                  setIsHelpful((v) => !v);
                  setIsNotHelpful(false);
                }}
              />
              {/* 👎 LATCHES AND ASKS. The latch is the verdict — it survives the
                  modal being cancelled, because you did disagree whether or not
                  you explained why. The modal is where the verdict gets a
                  reason. Un-latching does not re-open it. */}
              <FeedbackIcon
                path={mdiThumbDown}
                label="Not helpful"
                id={`fb-down-${message.id}`}
                active={isNotHelpful}
                onClick={() => {
                  const next = !isNotHelpful;
                  setIsNotHelpful(next);
                  if (next) {
                    setIsHelpful(false);
                    openFeedbackModal(message.id);
                  }
                }}
              />
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
