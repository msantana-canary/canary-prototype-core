/**
 * Avatar Component
 *
 * Displays either a profile image, initials, or account icon.
 * REDESIGN: rounded-8 square (Figma "Messaging" frame 29:2099) — was circular.
 * Initials render 12px Roboto Bold on colorBlack6, per the Figma guest rows.
 */

import React from 'react';
import Icon from '@mdi/react';
import { mdiAccount } from '@mdi/js';
import { colors } from '@canary-ui/components';

interface AvatarProps {
  /** URL to profile image (optional) */
  src?: string;
  /** Fallback initials (e.g., "ES" for Emily Smith). If empty, shows icon instead */
  initials: string;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Optional CSS classes */
  className?: string;
}

export function Avatar({ src, initials, size = 'medium', className = '' }: AvatarProps) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-14 h-14',
  };

  if (src) {
    // The avatar PNGs are pre-cropped CIRCLES with transparent corners, so
    // border-radius alone can't square them. Scale the image ~1.45x inside a
    // clipped square container: the visible crop comes from inside the circle
    // (its inscribed square), which reads as a true rounded-8 square avatar.
    return (
      <div className={`${sizeClasses[size]} rounded-[8px] overflow-clip shrink-0 ${className}`} style={{ backgroundColor: colors.colorBlack6 }}>
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
      className={`${sizeClasses[size]} rounded-[8px] flex items-center justify-center font-['Roboto',sans-serif] font-bold text-[12px] leading-[18px] tracking-[0.24px] ${className}`}
      style={{ backgroundColor: colors.colorBlack6, color: colors.colorBlack3 }}
    >
      {initials ? (
        initials
      ) : (
        <Icon path={mdiAccount} size={0.67} color={colors.colorBlack3} />
      )}
    </div>
  );
}
