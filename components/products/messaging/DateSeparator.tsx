/**
 * DateSeparator Component
 *
 * Displays a date divider between message groups
 */

import React from 'react';

interface DateSeparatorProps {
  /** Formatted date string (e.g., "Today", "Yesterday", "Nov. 14") */
  label: string;
}

export function DateSeparator({ label }: DateSeparatorProps) {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="font-['Roboto',sans-serif] text-[10px] leading-[16px] text-[#999999]">
        {label}
      </div>
    </div>
  );
}
