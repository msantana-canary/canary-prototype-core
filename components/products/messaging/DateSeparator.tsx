/**
 * DateSeparator Component — REDESIGN (Figma "Messaging" frame 29:2099)
 *
 * Full-width hairline rule + LEFT-aligned 10px Medium uppercase label
 * ("TODAY" / "YESTERDAY" / "JUL 14"). Was: centered 10px gray text, no rule.
 */

import React from 'react';
import { colors } from '@canary-ui/components';

interface DateSeparatorProps {
  /** Formatted date string (e.g., "Today", "Yesterday", "Nov. 14") */
  label: string;
}

export function DateSeparator({ label }: DateSeparatorProps) {
  return (
    <div className="flex flex-col w-full">
      <div className="w-full" style={{ height: 1, backgroundColor: colors.colorBlack6 }} />
      <div style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 4 }}>
        <span
          className="font-['Roboto',sans-serif] font-medium text-[10px] leading-[16px] uppercase"
          style={{ color: colors.colorBlack1 }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
