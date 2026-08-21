/**
 * The context band's shared anatomy.
 *
 * Four different things sit in the slot above the composer input — a fact the
 * AI wants to learn, a ticket it thinks should exist, a clock saying a guest has
 * been left waiting, and a notice that the property is away. They say different
 * things in three different colour registers, but they are the SAME OBJECT:
 * full-width, one line tall, an icon on the left, actions on the right, and the
 * composer directly underneath.
 *
 * ── THREE REGISTERS, AND WHY THEY ARE THREE ───────────────────────────────
 *   AI     gradient border, whisper fill. The AI is PROPOSING something and
 *          wants permission. It is the only register that carries the agent's
 *          own colours, because it is the only one where the agent is speaking.
 *   BLUE   the product's utility register. The recommended ticket is a Canary
 *          feature reporting a detection — the same blue as every other "here
 *          is a thing you can act on" in the app. Deliberately NOT the AI
 *          gradient, per the frame: a service ticket is a hotel object, and
 *          dressing it as an AI artefact would make hoteliers file it under
 *          "the robot's stuff" rather than under "my work".
 *   AMBER  a state of the world you did not choose and cannot accept or reject.
 *          Away, and unanswered-for-24-minutes. Warning colour, and — see the
 *          stack rule in `ThreadAiSlot` — always nearest the composer.
 *
 * The dismiss × is a bare glyph outside the button pair, exactly as drawn: it is
 * the lowest-emphasis exit on a row whose two buttons are the point.
 */

'use client';

import React from 'react';
import { ButtonSize, ButtonType, CanaryButton, colors } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiClose } from '@mdi/js';

/** The pink the AI overlines are drawn in — flat, not the gradient. A four-stop
 *  ramp across an eleven-character overline is a ramp nobody can see. */
export const AI_OVERLINE = '#D6379F';

/** Amber: border, ground, and glyph. Not tokens — @canary-ui has no warning
 *  family yet, and these three are the frames'. Logged for promotion. */
export const AMBER_BORDER = '#F2B95C';
export const AMBER_BG = '#FEF9F0';
export const AMBER_ICON = '#E8A317';

export type BandTone = 'ai' | 'blue' | 'amber';

const TONE_CHROME: Record<Exclude<BandTone, 'ai'>, { border: string; background: string }> = {
  blue: { border: colors.colorBlueDark4, background: colors.colorBlueDark5 },
  amber: { border: AMBER_BORDER, background: AMBER_BG },
};

/**
 * The band shell. `ai` takes the gradient class; the other two take a flat
 * border and ground. One component so the four bands can never disagree about
 * height, radius, padding or where the dismiss sits.
 */
export function ContextBand({
  tone,
  icon,
  children,
  actions,
  onDismiss,
  dismissLabel = 'Dismiss',
}: {
  tone: BandTone;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
}) {
  const chrome = tone === 'ai' ? undefined : TONE_CHROME[tone];

  return (
    <div
      className={`flex items-center w-full ${tone === 'ai' ? 'ai-gradient-band' : 'rounded-[8px]'}`}
      style={{
        gap: 12,
        minHeight: 52,
        paddingLeft: 14,
        paddingRight: 12,
        paddingTop: 8,
        paddingBottom: 8,
        ...(chrome ? { border: `1px solid ${chrome.border}`, backgroundColor: chrome.background } : {}),
      }}
    >
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      <div className="flex-1 min-w-0">{children}</div>
      {actions && <div className="flex items-center shrink-0" style={{ gap: 8 }}>{actions}</div>}
      {onDismiss && <BandDismiss label={dismissLabel} onClick={onDismiss} />}
    </div>
  );
}

/**
 * The band's dismiss ×, once. It was written twice — here and on the draft card —
 * and the two copies were the same call, so they are now the same component.
 *
 * `CanaryButton` ICON_SECONDARY at TINY is an exact geometry match: h-6 w-6 is
 * the 24px box the frames draw and `rounded-[4px]` is the radius, both from the
 * base with nothing overridden. `.icon-btn-neutral` repaints the wash layer
 * black, because the library keys its hover to `ButtonColor` and every
 * non-status colour resolves to blue — and this × is the lowest-emphasis exit on
 * the row, not a blue affordance.
 *
 * ⚠ ONE DELTA, DELIBERATE: the wash moves from the hand-rolled rgba(0,0,0,0.06)
 * to the library's 8% / 16% opacity ladder. Every neutral icon button on this
 * surface now rides that one ladder rather than three hand-tuned values nobody
 * could tell apart.
 *
 * ── THE ACCESSIBLE NAME RIDES THE GLYPH ───────────────────────────────────
 * `CanaryButton` has no `aria-label`, spreads no rest props, and renders no
 * children for icon types, so the name goes on the mdi `Icon`'s `title` — which
 * `@mdi/react` exposes as an `aria-labelledby` on the `<svg>`. The explicit `id`
 * is not optional: without it the library derives the `<title>` element's id
 * from a MODULE-LEVEL COUNTER, which differs between the server and client
 * renders and trips hydration (the same failure documented in `ThreadListItem`).
 * The id is slugged from the label, so it is stable across renders — which also
 * means two dismisses on screen at once must carry DIFFERENT labels. They do:
 * "Skip this suggestion" on the fact band, "Dismiss draft" on the draft card.
 */
export function BandDismiss({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <CanaryButton
      type={ButtonType.ICON_SECONDARY}
      size={ButtonSize.TINY}
      onClick={onClick}
      className="icon-btn-neutral"
      icon={
        <Icon
          path={mdiClose}
          size={0.7}
          color={colors.colorBlack4}
          title={label}
          id={`band-dismiss-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
        />
      }
    />
  );
}

/**
 * The band's two buttons — Edit / Add to AI on the fact band, Dismiss / Review
 * on the ticket band, Edit / Send on the draft card.
 *
 * `CanaryButton` carries this. `ButtonSize.COMPACT` is h-8 — exactly the 32px
 * the frames draw — and OUTLINED and PRIMARY are already the frames' two
 * registers: a `colorBlueDark1` hairline with a blue label, and a solid
 * `colorBlueDark1` fill with a white one. What is left is dress, and it all
 * lives in `.band-button` (8px radius, 13px label, 14px side padding, no
 * shadow) plus the two register classes.
 *
 * ── THREE DELTAS WORTH NAMING ─────────────────────────────────────────────
 *   HOVER IS A FILL, NOT AN OPACITY. The library expresses hover as an opacity
 *   move — 8% of the button colour washed over OUTLINED, and a fade of the
 *   LABEL on PRIMARY — where the frames tint the FILL and leave the label
 *   alone. `.band-button-outline` / `.band-button-primary` restore
 *   colorBlueDark5 and colorBlueDark2 respectively, so the hover state is
 *   unchanged from what Miguel signed off. That is why there is no `isHovered`
 *   state here any more: the hover is CSS.
 *
 *   `!bg-white` IS LOAD-BEARING. The base's OUTLINED is TRANSPARENT at rest —
 *   its wash layer sits at opacity 0 — and these buttons sit on coloured
 *   grounds: the AI band's pink-lavender whisper and the ticket band's
 *   `colorBlueDark5`. Without an opaque white ground the outline button would
 *   read as a hollow ring cut out of the band. The frames draw a white pill.
 *
 *   PRIMARY IS 2px NARROWER. The hand-roll drew a 1px border on the primary in
 *   the SAME blue as its fill — invisible ink that nonetheless bought 2px of
 *   width. `ButtonType.PRIMARY` renders `border: none`. Restoring the border
 *   would put a visible ring around the button the moment the hover tint lands
 *   on the fill and not on the border, so the 2px is given up instead: the
 *   painted geometry is identical, the outer box is 2px tighter.
 *
 * `leading-[20px]` and `whitespace-nowrap` are the hand-roll's, kept: the base
 * sets neither, and a band button that wraps is a band that changes height.
 */
export function BandButton({
  label,
  variant,
  onClick,
}: {
  label: string;
  variant: 'outline' | 'primary';
  onClick: () => void;
}) {
  const isPrimary = variant === 'primary';

  return (
    <CanaryButton
      type={isPrimary ? ButtonType.PRIMARY : ButtonType.OUTLINED}
      size={ButtonSize.COMPACT}
      onClick={onClick}
      className={[
        'band-button',
        isPrimary ? 'band-button-primary' : 'band-button-outline !bg-white',
        'leading-[20px] whitespace-nowrap',
      ].join(' ')}
    >
      {label}
    </CanaryButton>
  );
}

/** The 10px letterspaced caps that name an AI band. */
export function BandOverline({ label }: { label: string }) {
  return (
    <span
      className="block font-['Roboto',sans-serif] font-medium text-[10px] leading-[16px] uppercase"
      style={{ color: AI_OVERLINE, letterSpacing: '0.04em' }}
    >
      {label}
    </span>
  );
}

/** The band's body line. */
export function BandText({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-['Roboto',sans-serif] text-[14px] leading-[22px]"
      style={{ color: colors.colorBlack1 }}
    >
      {children}
    </p>
  );
}
