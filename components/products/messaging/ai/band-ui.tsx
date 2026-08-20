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

import React, { useState } from 'react';
import { colors } from '@canary-ui/components';
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
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label={dismissLabel}
          className="shrink-0 flex items-center justify-center rounded-[4px] transition-colors hover:bg-[rgba(0,0,0,0.06)] cursor-pointer"
          style={{ width: 24, height: 24, padding: 0 }}
        >
          <Icon path={mdiClose} size={0.7} color={colors.colorBlack4} />
        </button>
      )}
    </div>
  );
}

/**
 * The band's two buttons. Hand-rolled rather than `CanaryButton` for one
 * reason: the frames draw them at 32px with an 8px radius, and `CanaryButton`'s
 * NORMAL is 40px/rounded-4 with neither exposed as a prop. A 40px button turns a
 * 52px band into a 56px one and the whole slot's rhythm goes with it.
 * (Logged with the other library asks in REDESIGN_NOTES.)
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
  const [isHovered, setIsHovered] = useState(false);
  const isPrimary = variant === 'primary';

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="rounded-[8px] font-['Roboto',sans-serif] font-medium text-[13px] leading-[20px] whitespace-nowrap transition-colors cursor-pointer"
      style={{
        height: 32,
        paddingLeft: 14,
        paddingRight: 14,
        border: `1px solid ${colors.colorBlueDark1}`,
        backgroundColor: isPrimary
          ? isHovered
            ? colors.colorBlueDark2
            : colors.colorBlueDark1
          : isHovered
            ? colors.colorBlueDark5
            : colors.colorWhite,
        borderColor: isPrimary && isHovered ? colors.colorBlueDark2 : colors.colorBlueDark1,
        color: isPrimary ? colors.colorWhite : colors.colorBlueDark1,
      }}
    >
      {label}
    </button>
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
