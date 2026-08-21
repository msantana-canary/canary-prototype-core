/**
 * MessageComposer Component — REDESIGN (Figma "Messaging" frame 2038:57666)
 *
 * One quiet card: white rounded-12 with a colorBlack6 hairline (blue
 * focus-within — the Figma draws no focus state, so the product's focus
 * treatment carries over). No internal divider: the textarea and the toolbar
 * share one field, so the composer reads as a single place to type rather than
 * a form with a footer.
 *
 * Toolbar (left): emoji / attachment / translate / templates / service-ticket
 * as BARE 16px icons — zero padding, no background boxes, gray at rest, blue on
 * hover. They are still decorative in this branch (no flows behind them), and
 * the smaller/tighter treatment is what keeps five inert affordances from
 * out-weighing the two live controls on the right.
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
  CanaryTextArea,
  CardPadding,
  colors,
} from '@canary-ui/components';
import Icon from '@mdi/react';
import {
  mdiEmoticonOutline,
  mdiPaperclip,
  mdiTranslate,
  mdiFormatListBulleted,
  mdiRoomServiceOutline,
  mdiSend,
} from '@mdi/js';
import { AiOrb } from './AiOrb';

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
}

/**
 * Bare toolbar icon — no box, no padding; gray → blue on hover.
 *
 * `CanaryButton` ICON_SECONDARY at TINY, shrunk from the ramp's 24px floor to
 * 18px by `.icon-btn-18` (which also releases the library's fixed 20px glyph
 * box so an 18px button doesn't carry a 20px child). `.icon-btn-bare` deletes
 * the `.button-bg` wash layer outright: this register has no box at rest, on
 * hover or on press, because its entire state ladder is the GLYPH's colour.
 *
 * That colour stays on a local hover flag rather than on `currentColor`,
 * deliberately — it keeps the exact rest/hover tints (`colorBlack3` →
 * `colorBlueDark1`) that the message feedback icons also use, with no dependence
 * on what the button happens to be painting its content.
 *
 * ⚠ THE WRAPPING SPAN EXISTS ONLY TO CARRY THE MOUSE HANDLERS. `CanaryButton`
 * declares no DOM event props beyond `onClick` and spreads no rest props, so
 * there is nowhere else to hang `onMouseEnter`/`onMouseLeave`. Logged as a
 * foundation ask.
 *
 * ⚠ The native `title` attribute is gone — `CanaryButton` has no `title` prop
 * either. Its OS tooltip is replaced by the mdi `Icon`'s `<title>` ELEMENT,
 * which browsers also surface on hover over the glyph, and which is what gives
 * the button its accessible name in the first place (see the stable-`id` note
 * on the thread header's IconAction). These controls remain inert in this
 * branch: there is no `onClick`, exactly as before.
 */
function ToolIcon({ path, label, id }: { path: string; label: string; id: string }) {
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
        className="icon-btn-bare icon-btn-18"
        icon={
          <Icon
            path={path}
            size={0.75}
            color={isHovered ? colors.colorBlueDark1 : colors.colorBlack3}
            title={label}
            id={id}
          />
        }
      />
    </span>
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
}: MessageComposerProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isIgniting, setIsIgniting] = useState(false);
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

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setMessage('');
    }
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
  const toolIcons = [
    { path: mdiEmoticonOutline, label: 'Emoji', id: 'composer-tool-emoji' },
    { path: mdiPaperclip, label: 'Attach file', id: 'composer-tool-attach' },
    { path: mdiTranslate, label: 'Translate', id: 'composer-tool-translate' },
    { path: mdiFormatListBulleted, label: 'Templates', id: 'composer-tool-templates' },
    { path: mdiRoomServiceOutline, label: 'Service ticket', id: 'composer-tool-ticket' },
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

        {/* Toolbar */}
        <div className="flex items-center justify-between" style={{ marginTop: 12 }}>
          {/* Left: bare tool icons */}
          <div className="flex items-center" style={{ gap: 12 }}>
            {toolIcons.map((tool) => (
              <ToolIcon key={tool.label} path={tool.path} label={tool.label} id={tool.id} />
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
    </div>
  );
}
