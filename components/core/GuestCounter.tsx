'use client';

/**
 * GuestCounter — +/- numeric stepper
 *
 * Two buttons around a number display.
 * Used for addon quantities, guest counts, etc.
 */

import React from 'react';
import Icon from '@mdi/react';
import { mdiMinus, mdiPlus } from '@mdi/js';

interface GuestCounterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  primaryColor?: string;
}

export function GuestCounter({
  value,
  onChange,
  min = 0,
  max = 99,
  primaryColor = '#4481e6',
}: GuestCounterProps) {
  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <div className="flex items-center gap-0" style={{ height: 36 }}>
      <button
        onClick={() => canDecrement && onChange(value - 1)}
        className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors"
        style={{
          borderColor: canDecrement ? primaryColor : '#e5e7eb',
          opacity: canDecrement ? 1 : 0.4,
          cursor: canDecrement ? 'pointer' : 'default',
        }}
        disabled={!canDecrement}
      >
        <Icon path={mdiMinus} size={0.6} color={canDecrement ? primaryColor : '#9ca3af'} />
      </button>
      <span className="w-10 text-center text-[16px] font-semibold text-[#111827]">
        {value}
      </span>
      <button
        onClick={() => canIncrement && onChange(value + 1)}
        className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors"
        style={{
          borderColor: canIncrement ? primaryColor : '#e5e7eb',
          opacity: canIncrement ? 1 : 0.4,
          cursor: canIncrement ? 'pointer' : 'default',
        }}
        disabled={!canIncrement}
      >
        <Icon path={mdiPlus} size={0.6} color={canIncrement ? primaryColor : '#9ca3af'} />
      </button>
    </div>
  );
}
