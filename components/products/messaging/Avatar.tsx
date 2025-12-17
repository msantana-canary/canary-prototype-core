/**
 * Avatar Component
 *
 * Displays either a profile image, initials, or account icon in a circular container.
 * Used in thread list items and message bubbles.
 */

import React from 'react';
import Icon from '@mdi/react';
import { mdiAccount } from '@mdi/js';

interface AvatarProps {
  /** URL to profile image (optional) */
  src?: string;
  /** Fallback initials (e.g., "ES" for Emily Smith). If empty, shows icon instead */
  initials: string;
  /** Size variant */
  size?: 'small' | 'medium';
  /** Optional CSS classes */
  className?: string;
}

export function Avatar({ src, initials, size = 'medium', className = '' }: AvatarProps) {
  const sizeClasses = {
    small: 'w-8 h-8 text-xs',
    medium: 'w-10 h-10 text-sm',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={initials}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center font-medium text-gray-700 ${className}`}
    >
      {initials ? (
        initials
      ) : (
        <Icon path={mdiAccount} size={0.67} color="#666666" />
      )}
    </div>
  );
}
