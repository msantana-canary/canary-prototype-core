'use client';

/**
 * GuestProgressBar — Segmented pill progress indicator
 *
 * Matches production CanaryProgressBar: 3px tall pills, 8px gaps.
 * Filled segments use themed primary color.
 */

import React from 'react';

interface GuestProgressBarProps {
  totalSegments: number;
  completedSegments: number;
  primaryColor?: string;
}

export function GuestProgressBar({
  totalSegments,
  completedSegments,
  primaryColor = '#4481e6',
}: GuestProgressBarProps) {
  if (totalSegments <= 0) return null;

  return (
    <div className="flex gap-[8px] w-full" role="progressbar" aria-valuenow={completedSegments} aria-valuemax={totalSegments}>
      {Array.from({ length: totalSegments }, (_, i) => (
        <div
          key={i}
          className="flex-1 rounded-full transition-colors duration-300"
          style={{
            height: 3,
            backgroundColor: i < completedSegments ? primaryColor : '#e0e0e0',
          }}
        />
      ))}
    </div>
  );
}
