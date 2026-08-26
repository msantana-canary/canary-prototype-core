/**
 * MessageComposer Component — REDESIGN (Figma "Messaging" frame 2038:57666)
 *
 * One quiet card: white rounded-12 with a colorBlack6 hairline (blue
 * focus-within — the Figma draws no focus state, so the product's focus
 * treatment carries over). No internal divider: the textarea and the toolbar
 * share one field, so the composer reads as a single place to type rather than
 * a form with a footer.
 *
 * Toolbar (left): emoji / attachment / translate / templates / service-ticket /
 * upsells as BARE 16px icons — zero padding, no background boxes, gray at rest,
 * blue on hover. The smaller/tighter treatment is what keeps a row of quiet
 * affordances from out-weighing the two live controls on the right.
 *
 * ── THREE OF THEM ARE LIVE NOW (2026-08-25) ───────────────────────────────
 * TEMPLATES opens `<MessageTemplatesModal>`; TRANSLATE opens the in-composer
 * translate row below; SERVICE TICKET opens the Conversation Details panel's
 * create-task drill-in, prefilled with the thread's room (same mechanism as
 * the recommended-ticket band's Review — see `requestCreateTask` below). All
 * three keep the same bare `ToolIcon` dress as their three still-inert
 * siblings — a tool that does something and a tool that does not should not
 * look like two different kinds of control, because which is which is a fact
 * about this BRANCH, not about the product. The translate icon does gain one
 * state the others have no use for: it stays BLUE while its row is open,
 * because that row is the only toolbar affordance that leaves something on
 * screen behind it.
 *
 * Right cluster: the AI pill, then a single square blue send button.
 *
 * ── WHAT DIED HERE ────────────────────────────────────────────────────────
 *  - The "Send via SMS" split button + channel chevron. The channel is already
 *    named twice (the placeholder says "Type SMS message...", every inbound
 *    message is captioned SMS) and the picker had nothing to pick — production
 *    routes on the thread, not on a per-send choice. It is now one send icon.
 *  - The `CanarySwitch`-in-a-gray-pill AI toggle → the AI pill below.
 *
 * ── THE AI PILL ───────────────────────────────────────────────────────────
 * ⚠ SUPERSEDES the label-only pill. Miguel 2026-08-20 approved the orb version
 * ("try it"). The pill now carries a **14px `<AiOrb>` left of its label in both
 * states** — the same component as the 32px message avatar, scaled by
 * `--orb-size`, so the control you flip is visibly the thing that speaks. A
 * toggle that only says "AI On" describes a state; one that shows the agent
 * breathing IS the state.
 *
 * ON:   calm orb + "AI On" in the shared AI gradient + a quiet pearl hairline.
 *       The agent is working; it does not need to ask for attention.
 * HOVER (on): the orb speeds up and the border tint deepens. Nothing else — no
 *       fill, no lift, no shadow. It answers the pointer by getting more alive.
 * OFF:  the orb is DORMANT — desaturated to gray and barely drifting, alive but
 *       asleep — beside a plain gray "AI Off", while the 1px border keeps its
 *       slowly REVOLVING hue wheel (`.ai-pill-off`). Colour moves, geometry
 *       does not. It reads as "this is off, and it would like to be on" without
 *       becoming the loudest thing on the screen.
 *
 * OFF → ON is an **ignition**: ~650ms in which the orb wakes (saturation blooms
 * back, one scale pulse, one fast revolution) while a spark sweeps the border
 * outward FROM the orb and settles into the quiet on-border. Three effects, one
 * window, so it reads as a single gesture rather than a pile-up. ON → OFF gets
 * no fanfare at all: a quick desaturate, then the dormant drift.
 *
 * The whole state model lives in `globals.css` next to `.ai-orb*`; this
 * component only owns WHEN the ignition class is on, and it hangs that on the
 * CLICK rather than on a prop diff — switching to a thread whose agent happens
 * to be on is not an activation and must not fire the animation.
 * `prefers-reduced-motion` reduces all of it to the orb's crossfade.
 */

'use client';

import React, { useEffect, useRef, useState, KeyboardEvent } from 'react';
import {
  ButtonSize,
  ButtonType,
  CanaryButton,
  CanaryCard,
  CanarySelect,
  CanaryTextArea,
  CardPadding,
  InputSize,
  colors,
} from '@canary-ui/components';
import Icon from '@mdi/react';
import {
  mdiEmoticonOutline,
  mdiPaperclip,
  mdiTranslate,
  mdiFormatListBulleted,
  mdiRoomServiceOutline,
  mdiCashMultiple,
  mdiSend,
  mdiArrowRight,
} from '@mdi/js';
import { AiOrb } from './AiOrb';
import { ToolIcon } from './composer-ui';
import { MessageTemplatesModal } from './MessageTemplatesModal';
import { useMessagingStore } from '@/lib/products/messaging/store';
import {
  MergeTagContext,
  interpolateMergeTags,
} from '@/lib/products/messaging/message-templates';
import {
  DEFAULT_TARGET,
  SOURCE_LANGUAGES,
  TRANSLATE_LANGUAGES,
  TranslateLanguage,
  translatePreview,
} from '@/lib/products/messaging/translate';

/** Ignition window. Must match `ai-orb-wake` / `ai-pill-spark` in globals.css. */
const AI_IGNITE_MS = 650;

interface MessageComposerProps {
  onSend: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
  aiEnabled?: boolean;
  onAiToggle?: () => void;
  onFocus?: () => void;
  /**
   * THE TOP SLOT — the AI's drafted-response card and the context band stack,
   * rendered above the input card and inside the composer's own 16px padding so
   * they share its left and right edges exactly.
   *
   * The composer owns the slot rather than the thread view because the slot's
   * whole meaning is proximity to the cursor: an away band eight pixels above
   * the box you are typing into is a condition on the message; the same band
   * pinned under the message feed is a page header.
   */
  topSlot?: React.ReactNode;
  /**
   * Text pushed in from outside — the draft card's "Edit". Keyed by `nonce`
   * rather than by the text itself, so injecting the same draft twice injects
   * twice, and so a re-render can never re-fire an injection the user has since
   * typed over.
   */
  injection?: { text: string; nonce: number } | null;
  onInjectionConsumed?: () => void;
  /**
   * THE THREAD'S KEPT DRAFT — text this conversation was left holding.
   *
   * The box seeds itself from this on mount and reports every keystroke back
   * through `onDraftChange`, so switching conversations no longer destroys what
   * was typed. It matters most for the AI draft card's "Edit": that consumes
   * the card, which makes the composer the ONLY copy of the drafted reply.
   *
   * Optional: the compose pane ("New message") has no thread yet, so it takes
   * neither prop and keeps the old throwaway behaviour.
   */
  draft?: string;
  onDraftChange?: (text: string) => void;
  /**
   * The facts this conversation can fill a template's merge tags with. Absent
   * on the compose pane, which has no thread and therefore no guest.
   */
  mergeContext?: MergeTagContext;
  /**
   * Whether this conversation has a live Apple Messages for Business session —
   * the ONLY thing that may show the Apple Message Templates tab. Passed
   * straight through from the thread's channel; see `Thread.channel`.
   */
  isAppleBusiness?: boolean;
  /**
   * The current thread's room — prefilled into the service-ticket drill-in
   * (see `ToolIcon`'s "Service ticket" wiring below). Absent on the compose
   * pane ("New message"), which has no thread and therefore no room to
   * prefill; the drill-in still opens, just blank, same as any other
   * hand-started ticket.
   */
  room?: string;
}

/**
 * `ToolIcon` MOVED to `./composer-ui` (batch, 2026-08-26) so `BroadcastComposer`
 * could use the same bare-icon register instead of its own hand-rolled button.
 * Every call site below is unchanged — see that module for the full anatomy
 * note (the wrapping span, the missing `title` prop, the optional `onClick`).
 */

/**
 * THE TRANSLATE ROW — a band INSIDE the composer card, not a drawer.
 *
 * Frames `translate-1` (empty) / `translate-2` (with a draft). It sits between
 * the input and the toolbar, which is the whole argument for it being a row:
 * translation is a property of the message being typed, and a panel or a popover
 * would have separated the setting from the sentence it applies to. It is a
 * COMPOSE AID — nothing about it changes what Send does (see the note on
 * `handleSend`).
 *
 * ── ANATOMY ───────────────────────────────────────────────────────────────
 * • The PREVIEW, above the selects and only once there is a draft: the original
 *   text is already on screen (it is the textarea), so the row adds only the
 *   translated line, in a small `colorBlack7` chip. A chip rather than a plain
 *   line because this text is NOT the message — it is a rendering of it — and
 *   an unboxed second sentence under the first would read as two paragraphs of
 *   one draft.
 * • FROM → TO, two plain `CanarySelect`s at COMPACT with an arrow between them.
 *   Flat single-selects with no sections and no check rows, which is exactly
 *   what the base is for; this is NOT the `ScopeSelect` / `AssignSelect` gap.
 *
 * ⚠ ONE SANCTIONED DELTA: the FROM select is GRAY-FILLED (`#E5E5E5` fill and
 * border) where the base draws white with a `#666666` hairline. The frame draws
 * it that way and the reason holds up — From reports a DETECTED fact and To is
 * the choice being made, so the two must not look like a matched pair of
 * decisions. It stays enabled (an agent writing in Spanish to a Japanese guest
 * is a real case, and `isDisabled` would also dim the label to unreadable), so
 * the fill is doing the work `isReadonly` would do if the field were inert.
 */
function TranslateRow({
  draft,
  source,
  onSourceChange,
  target,
  onTargetChange,
}: {
  draft: string;
  source: string;
  onSourceChange: (value: string) => void;
  target: TranslateLanguage;
  onTargetChange: (value: TranslateLanguage) => void;
}) {
  const preview = translatePreview(draft, target);

  return (
    <div className="flex flex-col" style={{ marginTop: 8, gap: 8 }}>
      {preview && (
        <span
          className="self-start font-['Roboto',sans-serif] text-[14px] leading-[22px] rounded-[4px]"
          style={{
            backgroundColor: colors.colorBlack7,
            color: colors.colorBlack1,
            paddingLeft: 6,
            paddingRight: 6,
            paddingTop: 2,
            paddingBottom: 2,
          }}
        >
          {preview}
        </span>
      )}

      <div className="flex items-center" style={{ gap: 12 }}>
        <div style={{ width: 200 }}>
          <CanarySelect
            aria-label="Translate from"
            size={InputSize.COMPACT}
            value={source}
            onChange={(e) => onSourceChange(e.target.value)}
            options={SOURCE_LANGUAGES}
            className="!bg-[#E5E5E5] !border-[#E5E5E5]"
          />
        </div>

        <Icon path={mdiArrowRight} size={0.75} color={colors.colorBlack1} />

        <div style={{ width: 200 }}>
          <CanarySelect
            aria-label="Translate to"
            size={InputSize.COMPACT}
            value={target}
            onChange={(e) => onTargetChange(e.target.value as TranslateLanguage)}
            options={TRANSLATE_LANGUAGES}
          />
        </div>
      </div>
    </div>
  );
}

export function MessageComposer({
  onSend,
  placeholder = 'Type SMS message...',
  disabled = false,
  aiEnabled = true,
  onAiToggle,
  onFocus,
  topSlot,
  injection,
  onInjectionConsumed,
  draft,
  onDraftChange,
  mergeContext,
  isAppleBusiness = false,
  room,
}: MessageComposerProps) {
  const requestCreateTask = useMessagingStore((s) => s.requestCreateTask);

  /**
   * The text still lives in local state, and the component is still KEYED BY
   * THREAD by its parent — that is what makes one guest's words structurally
   * unable to appear in another's box. What changed in QA-1 is where the text
   * GOES when the box unmounts: it is seeded from the thread's kept draft and
   * written back on every change, instead of being dropped on the floor.
   */
  const [message, setMessageState] = useState(draft ?? '');
  const setMessage = (next: string) => {
    setMessageState(next);
    onDraftChange?.(next);
  };
  const [isFocused, setIsFocused] = useState(false);
  const [isIgniting, setIsIgniting] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isTranslateOpen, setIsTranslateOpen] = useState(false);
  const [translateSource, setTranslateSource] = useState('en');
  const [translateTarget, setTranslateTarget] = useState<TranslateLanguage>(DEFAULT_TARGET);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const igniteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (igniteTimer.current) clearTimeout(igniteTimer.current);
  }, []);

  /**
   * Only a CLICK ignites. Driving this off an `aiEnabled` prop diff would fire
   * the animation every time the user opened a thread whose agent was already
   * on — the pill would appear to switch itself.
   */
  const handleAiToggle = () => {
    if (!aiEnabled) {
      if (igniteTimer.current) clearTimeout(igniteTimer.current);
      setIsIgniting(true);
      igniteTimer.current = setTimeout(() => setIsIgniting(false), AI_IGNITE_MS);
    }
    onAiToggle?.();
  };

  /**
   * A draft handed over from the card above. It REPLACES whatever is in the box
   * rather than appending: the card is gone by the time this runs, so appending
   * would fuse a half-typed sentence to the AI's and leave no way back to
   * either. Focus lands at the end so the first keystroke edits rather than
   * overwrites.
   */
  useEffect(() => {
    if (!injection) return;
    setMessage(injection.text);
    const el = textareaRef.current;
    if (el) {
      el.focus();
      const end = injection.text.length;
      window.requestAnimationFrame(() => el.setSelectionRange(end, end));
    }
    onInjectionConsumed?.();
    // Only the nonce may re-fire this. Depending on the text would replay the
    // injection on every unrelated re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [injection?.nonce]);

  /**
   * Autosize: collapse to one row, then grow to content, capped so the composer
   * can't swallow the feed.
   *
   * ⚠ THIS IS THE ONE THING THE BASE COULD NOT TAKE OVER. `CanaryTextArea` does
   * ship an `autoExpand` that does exactly this shape — and it is not usable
   * here, because it FLOORS the height at a hardcoded 40px (`Math.max(
   * scrollHeight, AUTO_EXPAND_MIN_HEIGHT[size])`, 40 at NORMAL and 32 at
   * COMPACT) with no prop to lower it. This composer's resting input is a
   * SINGLE 22px line — the frames draw a one-line field under a toolbar, not a
   * box — so the base's floor would make the card 18px taller at rest and
   * change the composer's whole proportion.
   *
   * Everything else about the field is the base's; only the measuring is ours.
   * Logged as the foundation ask: an overridable `autoExpand` minimum, ideally
   * alongside the chromeless variant that would retire `.field-chromeless`.
   */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [message]);

  /**
   * ⚠ SEND IS UNCHANGED BY THE TRANSLATE ROW, deliberately.
   *
   * The row is a compose aid: it shows the agent what the guest is about to
   * read. What actually goes down the wire is a PRODUCTION question, and
   * production sends the TRANSLATED body (the guest reads their own language;
   * the thread keeps the original for staff). Wiring that here would mean the
   * prototype's feed printed Japanese under "Theresa Webb" with no way to see
   * what she typed — a per-message original/translation pair is a data-model
   * change this branch has not been asked for.
   *
   * So: the row previews, Send sends what is in the box, and the gap is
   * enumerated rather than faked. If the demo needs the translated send, the
   * work is a `translatedBody` on `Message` plus a caption in `MessageBubble`,
   * not a change here.
   */
  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setMessage('');
    }
  };

  /**
   * A PRESET template. Same contract as the draft card's hand-over: it REPLACES
   * the box rather than appending — the modal is gone by the time this runs, so
   * appending would fuse a half-typed sentence onto the hotel's copy with no
   * way back to either. Focus lands at the end so the first keystroke edits.
   */
  const handleUseTemplate = (body: string) => {
    setMessage(body);
    const el = textareaRef.current;
    if (el) {
      el.focus();
      window.requestAnimationFrame(() => el.setSelectionRange(body.length, body.length));
    }
  };

  /**
   * An APPLE template. It goes as-is, and it does NOT touch the box: an agent
   * with a half-written message who fires an Apple template has sent one thing
   * and is still writing another, and clearing her draft would be the picker
   * eating work it never owned.
   */
  const handleSendTemplate = (body: string) => {
    if (!disabled) onSend(body);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = !disabled && !!message.trim();

  // `id` is the mdi `<title>` element's DOM id. It must be explicit and stable:
  // left to itself @mdi/react numbers it off a module-level counter, which
  // differs between the server and the client render and trips hydration.
  const toolIcons: {
    path: string;
    label: string;
    id: string;
    onClick?: () => void;
    isActive?: boolean;
  }[] = [
    { path: mdiEmoticonOutline, label: 'Emoji', id: 'composer-tool-emoji' },
    { path: mdiPaperclip, label: 'Attach file', id: 'composer-tool-attach' },
    {
      path: mdiTranslate,
      label: 'Translate',
      id: 'composer-tool-translate',
      onClick: () => setIsTranslateOpen((v) => !v),
      isActive: isTranslateOpen,
    },
    {
      path: mdiFormatListBulleted,
      label: 'Templates',
      id: 'composer-tool-templates',
      onClick: () => setIsTemplatesOpen(true),
    },
    /**
     * SERVICE TICKET — no longer a stub (QA-4, 2026-08-25). Opens the SAME
     * Conversation Details drill-in the recommended-ticket band's Review
     * button opens (`requestCreateTask`, the `panelIntent` mechanic — see
     * REDESIGN_NOTES §7): the panel is told to open at `create-task`, prefilled
     * with this thread's room. One entrance to that form rather than a second
     * one that could drift from it.
     */
    {
      path: mdiRoomServiceOutline,
      label: 'Service ticket',
      id: 'composer-tool-ticket',
      onClick: () => requestCreateTask(room),
    },
    /**
     * UPSELLS — production grew this one, so the prototype does too (design
     * review 2026-08-21). It sits AFTER the service ticket because the two are
     * the toolbar's only "do a thing to this stay" affordances and production
     * orders them that way.
     *
     * ⚠ `mdiCashMultiple`, and the outline rule does not apply: there is no
     * `mdiCashMultipleOutline` in @mdi/js, and this is the glyph the library's
     * own vocabulary already spends on money (`sidebarTabs.digitalTips`).
     * Verified against the reference at 10× — the front note (thick border,
     * white interior, filled centre circle) is identical. The reference stacks
     * its second note down-RIGHT and mdi stacks down-LEFT; mdi's whole
     * "Multiple" family stacks left (`mdiCreditCardMultipleOutline` too), so
     * that is the set's convention rather than a wrong pick, and the glyph is
     * used unflipped. NOT `sidebarTabs.upsells`'s `mdiTagOutline` — that mark
     * is the PRODUCT's nav identity, and reusing it as a composer tool would
     * read as "go to Upsells" rather than "attach an upsell here".
     */
    { path: mdiCashMultiple, label: 'Upsells', id: 'composer-tool-upsells' },
  ];

  return (
    <div style={{ padding: 16 }}>
      {/* The AI's top slot. Inside the composer's padding, so the draft card and
          every band share the input card's exact left and right edges — the
          frames draw one column, not a card with things floating near it. */}
      {topSlot && <div style={{ marginBottom: 12 }}>{topSlot}</div>}

      {/* The input card. `CanaryCard` at COMPACT padding is exactly this card's
          12px inset, and it already draws white / 1px / `colorBlack6`; the 12px
          radius and the blue focus-within border are the only two deltas. The
          base sets its border colour INLINE, so the focus swap has to be an
          `!important` utility — nothing else outranks an inline style. */}
      <CanaryCard
        cardPadding={CardPadding.COMPACT}
        hasBorder
        className={`transition-colors !rounded-[12px] ${isFocused ? '!border-[#2858C4]' : ''}`}
      >
        {/* Input.
            `CanaryTextArea`, forwarding its ref, so the injection effect above
            still reaches the real element to focus it and place the caret and
            the autosize effect can measure it.

            `.field-chromeless` strips every visual the base contributes — its
            border, its 12px padding, its white fill, its 2px focus outline —
            because the CARD owns all of that. `.textarea-composer` restores this
            composer's own metrics: a 22px floor over the base's `min-h-[80px]`,
            a 140px cap, and `overflow-y: auto` so a long draft SCROLLS past the
            cap rather than being clipped.

            ⚠ NO `autoExpand`. The base's autosize is the right shape but it
            floors the height at a hardcoded 40px, and this field rests at one
            22px line — see the effect above for the whole story. `rows={1}` and
            `resize="none"` are what `autoExpand` would otherwise have set. */}
        <CanaryTextArea
          ref={textareaRef}
          rows={1}
          resize="none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={1600}
          className="field-chromeless textarea-composer scrollbar-invisible !text-[14px] !leading-[22px] placeholder:!text-[#666666]"
          style={{ color: colors.colorBlack1 }}
        />

        {/* The translate band — between the input and the toolbar, because the
            setting belongs to the sentence above it and is operated from the
            tool below it. */}
        {isTranslateOpen && (
          <TranslateRow
            draft={message}
            source={translateSource}
            onSourceChange={setTranslateSource}
            target={translateTarget}
            onTargetChange={setTranslateTarget}
          />
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between" style={{ marginTop: 12 }}>
          {/* Left: bare tool icons */}
          <div className="flex items-center" style={{ gap: 12 }}>
            {toolIcons.map((tool) => (
              <ToolIcon
                key={tool.label}
                path={tool.path}
                label={tool.label}
                id={tool.id}
                onClick={tool.onClick}
                isActive={tool.isActive}
              />
            ))}
          </div>

          {/* Right: AI pill + send */}
          <div className="flex items-center" style={{ gap: 8 }}>
            <button
              onClick={handleAiToggle}
              aria-pressed={aiEnabled}
              aria-label={aiEnabled ? 'Turn the AI agent off for this conversation' : 'Turn the AI agent on for this conversation'}
              className={`${aiEnabled ? 'ai-pill-on' : 'ai-pill-off'} ${
                isIgniting ? 'ai-pill-ignite' : ''
              } flex items-center justify-center cursor-pointer`}
              style={{ height: 28, paddingLeft: 7, paddingRight: 10, gap: 5 }}
            >
              {/* The spark ring — inert and invisible except during ignition.
                  Kept mounted so the animation has something to run on the
                  instant the class lands. */}
              <span className="ai-pill-spark" aria-hidden="true" />
              <AiOrb size={14} />
              <span
                className={`font-['Roboto',sans-serif] font-medium text-[12px] leading-[18px] whitespace-nowrap ${
                  aiEnabled ? 'ai-gradient-text' : ''
                }`}
                style={aiEnabled ? undefined : { color: colors.colorBlack3 }}
              >
                {aiEnabled ? 'AI On' : 'AI Off'}
              </span>
            </button>

            {/* Send. `CanaryButton` ICON_PRIMARY already IS a solid
                `colorBlueDark1` square with a white glyph and no shadow (the
                drop shadow is PRIMARY-only), so only geometry and one state are
                ours: 28px instead of the ramp's 32px, an 8px radius instead of
                4px, and `.icon-btn-nodim`.

                That last class is the whole point of this control's odd state:
                it stays FULL-STRENGTH blue while disabled, where the library
                fades every disabled button to 50%. The frame draws it that way
                in the idle state, and it is the composer's only anchor on the
                right. It is still natively `disabled`, so an empty Enter or
                click is a no-op; only the cursor gives that away.

                The accessible name rides the mdi `Icon`'s `title` + a stable
                `id`, as everywhere else — `CanaryButton` has no `aria-label`. */}
            <CanaryButton
              type={ButtonType.ICON_PRIMARY}
              size={ButtonSize.COMPACT}
              onClick={handleSend}
              isDisabled={!canSend}
              className="icon-btn-28 icon-btn-r8 icon-btn-nodim"
              icon={
                <Icon
                  path={mdiSend}
                  size={0.7}
                  color={colors.colorWhite}
                  title="Send message"
                  id="composer-send"
                />
              }
            />
          </div>
        </div>
      </CanaryCard>

      {/* The templates picker. Mounted by the COMPOSER rather than by the page
          because every one of its exits writes to this component's own state or
          calls this component's own `onSend` — the modal has no business the
          composer is not already holding. (The AI loop's four surfaces mount at
          the page for the opposite reason: they outlive the message block that
          opened them.) */}
      <MessageTemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onUse={handleUseTemplate}
        onSendNow={handleSendTemplate}
        /* The Apple tab is the THREAD's fact, not this component's choice —
           an Apple-hosted payload has nowhere to go on an SMS conversation.
           No thread in this prototype carries an AMB session, so the tab does
           not render today; the gate is built on the real condition so it
           lights up on its own the day one does. */
        isAppleBusiness={isAppleBusiness}
        /* "Use" hands the copy to a human to edit, so she gets it RESOLVED —
           the picker's rows still show the literal tags (that is what tells
           her which facts the template fills in), but a sentence she is about
           to proofread should read the way the guest will read it. Absent the
           merge context (the compose pane has no thread) nothing is resolved
           and the literal goes in, which is the honest fallback. */
        resolveBody={
          mergeContext ? (body) => interpolateMergeTags(body, mergeContext) : undefined
        }
      />
    </div>
  );
}
