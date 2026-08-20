/**
 * AiOrb — the AI's living gradient blob, at whatever size you ask for.
 *
 * ONE component, TWO sizes on this surface (Miguel 2026-08-20 — parameterise,
 * do not duplicate):
 *
 *   32px `<AiOrbTile>`  the message-feed avatar. An 18px orb centred in a
 *                       rounded-8 gradient-bordered tile, so it drops into the
 *                       avatar slot beside the guest/staff squares without
 *                       changing the feed's rhythm.
 *   14px `<AiOrb>`      inside the composer's AI pill, left of the label.
 *
 * All the motion lives in `globals.css` (`.ai-orb*`). The only thing this file
 * parameterises is `--orb-size`: every internal layer is sized in PERCENT of
 * the orb, so one number scales the whole composition. Speed is the other
 * knob, `--orb-speed`, but that one is a STATE not a size — the pill's on /
 * hover / off / igniting classes set it, so it stays in CSS.
 *
 * The markup is a stack of spans rather than an SVG because the ribbons animate
 * `border-radius` as well as transform, which SVG cannot morph in pure CSS.
 * Always `aria-hidden` — the orb is decoration; the sender name and the pill
 * label carry the meaning.
 */

import React from 'react';

interface AiOrbProps {
  /** Rendered diameter in px. Defaults to the 18px the message tile uses. */
  size?: number;
  className?: string;
}

export function AiOrb({ size = 18, className = '' }: AiOrbProps) {
  return (
    <span
      className={`ai-orb ${className}`.trim()}
      aria-hidden="true"
      style={{ '--orb-size': `${size}px` } as React.CSSProperties}
    >
      <span className="ai-orb-base" />
      <span className="ai-orb-petal ai-orb-a" />
      <span className="ai-orb-petal ai-orb-b" />
      <span className="ai-orb-petal ai-orb-c" />
      <span className="ai-orb-petal ai-orb-d" />
      <span className="ai-orb-core" />
    </span>
  );
}

/** The AI's message avatar — an 18px orb in a 32px gradient-bordered tile. */
export function AiOrbTile({ className = '' }: { className?: string }) {
  return (
    <span className={`ai-orb-tile shrink-0 ${className}`.trim()} aria-hidden="true">
      <AiOrb size={18} />
    </span>
  );
}
