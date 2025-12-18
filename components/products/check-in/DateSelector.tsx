/**
 * DateSelector Component
 *
 * Date navigation with left/right arrows, calendar icon, and date label.
 * Sits at the top of the left pane.
 */

'use client';

import React from 'react';
import { format, addDays, subDays, isToday } from 'date-fns';
import { CanaryButton, ButtonType, ButtonSize, colors } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiChevronLeft, mdiChevronRight, mdiCalendarBlank } from '@mdi/js';

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const handlePrevDay = () => {
    onDateChange(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    onDateChange(addDays(selectedDate, 1));
  };

  // Format: "Today" or "Dec 18, 2024"
  const displayDate = isToday(selectedDate)
    ? 'Today'
    : format(selectedDate, 'MMM d, yyyy');

  return (
    <div className="flex items-center gap-1 px-6 py-6">
      {/* Left Arrow */}
      <CanaryButton
        type={ButtonType.ICON_SECONDARY}
        size={ButtonSize.COMPACT}
        onClick={handlePrevDay}
        icon={<Icon path={mdiChevronLeft} size={1} color={colors.colorBlack2} />}
      />

      {/* Calendar Icon */}
      <CanaryButton
        type={ButtonType.ICON_SECONDARY}
        size={ButtonSize.COMPACT}
        icon={<Icon path={mdiCalendarBlank} size={1} color={colors.colorBlack2} />}
      />

      {/* Right Arrow */}
      <CanaryButton
        type={ButtonType.ICON_SECONDARY}
        size={ButtonSize.COMPACT}
        onClick={handleNextDay}
        icon={<Icon path={mdiChevronRight} size={1} color={colors.colorBlack2} />}
      />

      {/* Date Label */}
      <span className="ml-2 text-[14px] font-medium text-gray-700">
        {displayDate}
      </span>
    </div>
  );
}
