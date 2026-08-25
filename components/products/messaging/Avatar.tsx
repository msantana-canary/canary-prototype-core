/**
 * Avatar Component
 *
 * Displays either a profile image, initials, or account icon.
 * REDESIGN: rounded-8 square (Figma "Messaging" frame 29:2099) — was circular.
 * Initials render 12px Roboto Bold on colorBlack6, per the Figma guest rows.
 *
 * TONE (frame 2038:57666): the initials tile carries WHO, not just what.
 * `neutral` is the gray guest/default tile; `blue` is the STAFF tile —
 * colorBlueDark5 ground, colorBlueDark1 glyphs — so a staff message reads as
 * "one of us" from the avatar column alone, matching the blue staff sender
 * name beside it. Photo avatars ignore tone (the photo is the identity).
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠ WHY THIS IS NOT `<CanaryProfileImage>` — a documented, deliberate exception
 * ═══════════════════════════════════════════════════════════════════════════
 * The nearest base IS `CanaryProfileImage`, and its size ramp even lines up
 * (32 / 40 / 48 = small / medium / profile). Every other axis this component
 * carries is one the base cannot express, and none of them are decoration:
 *
 *   1. SHAPE. The base bakes `rounded-full`. Every avatar on this surface is a
 *      rounded-8 SQUARE — no exceptions (see SHAPE below).
 *   2. TONE. The base's initials tile hardcodes `colorBlueDark1` on white as
 *      INLINE styles with no prop to reach them. The neutral/blue split above is
 *      how a staff message is told from a guest message in the avatar column.
 *   3. ICON FALLBACK. With empty initials the base renders a literal "?".
 *      Phone-only threads have no initials, and a question mark reads as
 *      "we don't know who this is" rather than "nobody has a name yet".
 *   4. IMAGE TRANSFORM. The avatar PNGs are pre-cropped CIRCLES with transparent
 *      corners, so a square tile needs the ~1.45x re-crop applied below. The
 *      base exposes no hook on the `<img>`.
 *
 * Forcing it would mean `!important` warfare on four or five inline properties
 * per tone AND still hand-building the icon fallback outside it — the base would
 * contribute a div. So it stays hand-rolled, and the four gaps (a `shape` axis,
 * a `tone`/custom colour on the initials tile, an icon fallback, an image
 * transform hook) are logged as foundation asks. Revisit when they land: at that
 * point this file should shrink to a thin wrapper, not be rewritten.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * SHAPE — ONE SHAPE, EVERYWHERE (Miguel, 2026-08-25)
 * ═══════════════════════════════════════════════════════════════════════════
 * Rounded-8 square, with no per-surface escape hatch. This component briefly
 * carried a `shape` prop so the Conversation Details panel's 48px portrait
 * could be a CIRCLE, because that is how every panel frame draws it, and the
 * build had an argument for it: in the feed an avatar is a row marker in a
 * column of many, in the panel it is a portrait of the one person the surface
 * is about — furniture vs. subject.
 *
 * Miguel's call: the cross-cutting avatar rule wins. One person's face should
 * not change shape depending on which pane you are looking at them in, and the
 * square is what the rest of the product has already agreed to. The prop is
 * gone rather than defaulted, so the exception cannot quietly come back.
 *
 * ★ FIGMA PASS: the panel frames still draw a circle here. That is a frame to
 * CORRECT, not a spec to match — same class of note as the other frame-drawn
 * details the build overrode rather than reproduced.
 */

import React from 'react';
import Icon from '@mdi/react';
import { mdiAccount } from '@mdi/js';
import { colors } from '@canary-ui/components';

export type AvatarTone = 'neutral' | 'blue';

interface AvatarProps {
  /** URL to profile image (optional) */
  src?: string;
  /** Fallback initials (e.g., "ES" for Emily Smith). If empty, shows icon instead */
  initials: string;
  /** Size variant */
  size?: 'small' | 'medium' | 'large' | 'profile';
  /** Initials-tile colour register — gray by default, blue for staff. */
  tone?: AvatarTone;
  /** Optional CSS classes */
  className?: string;
}

const TONES: Record<AvatarTone, { backgroundColor: string; color: string }> = {
  neutral: { backgroundColor: colors.colorBlack6, color: colors.colorBlack3 },
  blue: { backgroundColor: colors.colorBlueDark5, color: colors.colorBlueDark1 },
};

export function Avatar({
  src,
  initials,
  size = 'medium',
  tone = 'neutral',
  className = '',
}: AvatarProps) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-14 h-14',
    profile: 'w-12 h-12',
  };
  const radius = 'rounded-[8px]';
  const textSize = size === 'profile' ? 'text-[16px] leading-[24px]' : 'text-[12px] leading-[18px]';

  if (src) {
    // The avatar PNGs are pre-cropped CIRCLES with transparent corners, so
    // border-radius alone can't square them. Scale the image ~1.45x inside a
    // clipped square container: the visible crop comes from inside the circle
    // (its inscribed square), which reads as a true rounded-8 square avatar.
    return (
      <div className={`${sizeClasses[size]} ${radius} overflow-clip shrink-0 ${className}`} style={{ backgroundColor: colors.colorBlack6 }}>
        <img
          src={src}
          alt={initials}
          className="w-full h-full object-cover"
          style={{ transform: 'scale(1.45)' }}
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} ${radius} flex items-center justify-center font-['Roboto',sans-serif] font-bold ${textSize} tracking-[0.24px] shrink-0 ${className}`}
      style={TONES[tone]}
    >
      {initials ? (
        initials
      ) : (
        <Icon path={mdiAccount} size={size === 'profile' ? 1 : 0.67} color={TONES[tone].color} />
      )}
    </div>
  );
}
