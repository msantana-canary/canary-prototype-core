'use client';

/**
 * EditorScheduledTimeCard
 *
 * Scheduled time configuration for campaigns.
 * - Send at: 30-min interval dropdown
 * - Repeat every: number + Weeks/Months
 * - Repeat on:
 *   - Weekly: day-of-week dropdown
 *   - Monthly: CanaryInputDate → then "Repeat monthly on day X" vs "Repeat monthly on the Nth Weekday"
 */

import { useState, useMemo } from 'react';
import {
  CanarySelect,
  CanaryInput,
  CanaryInputDate,
  InputSize,
  InputType,
} from '@canary-ui/components';
import { ScheduledCampaign, WeekDay } from '@/lib/products/guest-journey/types';

interface EditorScheduledTimeCardProps {
  campaign: ScheduledCampaign;
  onChange: (updates: Partial<ScheduledCampaign>) => void;
}

// 30-minute intervals from 7:00 AM to 10:00 PM
const TIME_OPTIONS: { value: string; label: string }[] = [];
for (let h = 7; h <= 22; h++) {
  for (const m of [0, 30]) {
    if (h === 22 && m === 30) continue;
    const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const label = `${hour}:${m === 0 ? '00' : '30'} ${ampm}`;
    TIME_OPTIONS.push({ value: label, label });
  }
}

const CADENCE_OPTIONS = [
  { value: 'weekly', label: 'Weeks' },
  { value: 'monthly', label: 'Months' },
];

const WEEKDAY_OPTIONS: { value: WeekDay; label: string }[] = [
  { value: 'Sunday', label: 'Sunday' },
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday', label: 'Thursday' },
  { value: 'Friday', label: 'Friday' },
  { value: 'Saturday', label: 'Saturday' },
];

const DAY_NAMES: WeekDay[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ORDINALS_SPELLED = ['', 'first', 'second', 'third', 'fourth', 'fifth'];

function getWeekdayFromDate(date: Date): WeekDay {
  return DAY_NAMES[date.getDay()];
}

function getOccurrenceFromDate(date: Date): number {
  return Math.ceil(date.getDate() / 7);
}

export function EditorScheduledTimeCard({ campaign, onChange }: EditorScheduledTimeCardProps) {
  const isWeekly = campaign.cadence === 'weekly';
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');

  // Parse the date string to generate monthly options
  const parsedDate = useMemo(() => {
    if (!selectedDateStr) return null;
    const d = new Date(selectedDateStr);
    return isNaN(d.getTime()) ? null : d;
  }, [selectedDateStr]);

  // Generate monthly repeat options from selected date
  const monthlyOptions = useMemo(() => {
    if (!parsedDate) return [];
    const dayOfMonth = parsedDate.getDate();
    const weekday = getWeekdayFromDate(parsedDate);
    const occurrence = getOccurrenceFromDate(parsedDate);
    const ordinalSpelled = ORDINALS_SPELLED[occurrence] || `${occurrence}th`;

    return [
      { value: `day-${dayOfMonth}`, label: `Repeat monthly on day ${dayOfMonth}` },
      { value: `weekday-${occurrence}-${weekday}`, label: `Repeat monthly on the ${ordinalSpelled} ${weekday}` },
    ];
  }, [parsedDate]);

  // Current monthly option value
  const currentMonthlyValue = campaign.monthlyWeekday
    ? `weekday-${campaign.monthlyWeekdayOccurrence}-${campaign.monthlyWeekday}`
    : campaign.monthlyDay
    ? `day-${campaign.monthlyDay}`
    : '';

  const handleDateChange = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      // Auto-set to "On day X" by default
      onChange({
        monthlyDay: d.getDate(),
        monthlyWeekday: undefined,
        monthlyWeekdayOccurrence: undefined,
      });
    }
  };

  const handleMonthlyOptionChange = (value: string) => {
    if (value.startsWith('day-')) {
      const day = parseInt(value.replace('day-', ''));
      onChange({
        monthlyDay: day,
        monthlyWeekday: undefined,
        monthlyWeekdayOccurrence: undefined,
      });
    } else if (value.startsWith('weekday-')) {
      const parts = value.split('-');
      const occurrence = parseInt(parts[1]);
      const weekday = parts[2] as WeekDay;
      onChange({
        monthlyDay: undefined,
        monthlyWeekday: weekday,
        monthlyWeekdayOccurrence: occurrence,
      });
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#FFF',
        border: '1px solid #E5E5E5',
        borderRadius: 8,
        padding: 16,
      }}
    >
      <h3 style={{ fontSize: 18, fontWeight: 500, color: '#000', margin: '0 0 4px 0' }}>
        Scheduled time
      </h3>
      <p style={{ fontSize: 14, color: '#666', margin: '0 0 16px 0' }}>
        Choose a schedule to send messages to in-house guests and same-day arrivals
      </p>

      <div className="flex flex-col" style={{ gap: 12 }}>
        {/* Send at */}
        <div className="flex items-center" style={{ gap: 16 }}>
          <div style={{ width: 120, flexShrink: 0, fontSize: 14, color: '#000' }}>
            Send at
          </div>
          <div style={{ flex: 1 }}>
            <CanarySelect
              size={InputSize.NORMAL}
              value={campaign.sendTime}
              options={TIME_OPTIONS}
              onChange={(e) => onChange({ sendTime: e.target.value })}
            />
          </div>
        </div>

        {/* Repeat every */}
        <div className="flex items-center" style={{ gap: 16 }}>
          <div style={{ width: 120, flexShrink: 0, fontSize: 14, color: '#000' }}>
            Repeat every
          </div>
          <div className="flex items-center" style={{ gap: 8, flex: 1 }}>
            <div style={{ width: 80 }}>
              <CanaryInput
                type={InputType.NUMBER}
                size={InputSize.NORMAL}
                value={String(campaign.repeatEvery)}
                onChange={(e) => onChange({ repeatEvery: Math.max(1, parseInt(e.target.value) || 1) })}
              />
            </div>
            <div style={{ flex: 1 }}>
              <CanarySelect
                size={InputSize.NORMAL}
                value={campaign.cadence}
                options={CADENCE_OPTIONS}
                onChange={(e) => onChange({
                  cadence: e.target.value as 'weekly' | 'monthly',
                  ...(e.target.value === 'weekly'
                    ? { weeklyDay: 'Monday', monthlyDay: undefined, monthlyWeekday: undefined, monthlyWeekdayOccurrence: undefined }
                    : { weeklyDay: undefined, monthlyDay: 1 }),
                })}
              />
            </div>
          </div>
        </div>

        {/* Repeat on */}
        <div className="flex items-start" style={{ gap: 16 }}>
          <div style={{ width: 120, flexShrink: 0, fontSize: 14, color: '#000', paddingTop: 8 }}>
            Repeat on
          </div>
          <div style={{ flex: 1 }}>
            {isWeekly ? (
              <CanarySelect
                size={InputSize.NORMAL}
                value={campaign.weeklyDay || 'Monday'}
                options={WEEKDAY_OPTIONS}
                onChange={(e) => onChange({ weeklyDay: e.target.value as WeekDay })}
              />
            ) : (
              <div className="flex flex-col" style={{ gap: 8 }}>
                {/* Date input with calendar */}
                <CanaryInputDate
                  size={InputSize.NORMAL}
                  value={selectedDateStr}
                  onChange={handleDateChange}
                />

                {/* Monthly repeat option — appears after date is selected */}
                {monthlyOptions.length > 0 && (
                  <CanarySelect
                    size={InputSize.NORMAL}
                    value={currentMonthlyValue || monthlyOptions[0].value}
                    options={monthlyOptions}
                    onChange={(e) => handleMonthlyOptionChange(e.target.value)}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
