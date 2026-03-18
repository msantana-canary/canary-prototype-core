'use client';

/**
 * EditorSendTimeCard
 *
 * Send time configuration card.
 * Three selects in a row: delta (97px), direction+anchor (flex-1), time (106px).
 * Matches Figma: node 1:10166
 */

import { CanarySelect, InputSize } from '@canary-ui/components';
import {
  GuestJourneyMessage,
  TimingDelta,
  TimingDirection,
  TimingAnchor,
} from '@/lib/products/guest-journey/types';

interface EditorSendTimeCardProps {
  message: GuestJourneyMessage;
  isReminder?: boolean;
  onTimingChange: (updates: Partial<GuestJourneyMessage['timing']>) => void;
}

const DELTA_OPTIONS: { value: TimingDelta; label: string }[] = [
  { value: 'ASAP', label: 'ASAP' },
  { value: 'SAME_DAY', label: '0 Days' },
  { value: '1_DAY', label: '1 Day' },
  { value: '2_DAYS', label: '2 Days' },
  { value: '3_DAYS', label: '3 Days' },
  { value: '4_DAYS', label: '4 Days' },
  { value: '5_DAYS', label: '5 Days' },
  { value: '6_DAYS', label: '6 Days' },
  { value: '1_WEEK', label: '1 Week' },
  { value: '2_WEEKS', label: '2 Weeks' },
  { value: '3_WEEKS', label: '3 Weeks' },
  { value: '4_WEEKS', label: '4 Weeks' },
  { value: '2_MONTHS', label: '2 Months' },
  { value: '3_MONTHS', label: '3 Months' },
];

const DIRECTION_ANCHOR_OPTIONS: { value: string; label: string }[] = [
  { value: 'BEFORE_ARRIVAL', label: 'Before arrival' },
  { value: 'AFTER_ARRIVAL', label: 'After arrival' },
  { value: 'BEFORE_DEPARTURE', label: 'Before departure' },
  { value: 'AFTER_DEPARTURE', label: 'After departure' },
  { value: 'AFTER_CHECK_IN', label: 'After check-in' },
  { value: 'AFTER_CHECK_OUT', label: 'After checkout' },
];

const TIME_OPTIONS: { value: string; label: string }[] = [];
// Generate 7:00 AM – 10:00 PM hourly
for (let h = 7; h <= 22; h++) {
  const hour = h > 12 ? h - 12 : h;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const label = `${hour === 0 ? 12 : hour}:00 ${ampm}`;
  TIME_OPTIONS.push({ value: label, label });
}

function getDirectionAnchorValue(direction: TimingDirection, anchor: TimingAnchor): string {
  return `${direction}_${anchor}`;
}

function parseDirectionAnchor(value: string): { direction: TimingDirection; anchor: TimingAnchor } {
  const [direction, anchor] = value.split('_') as [TimingDirection, TimingAnchor];
  return { direction, anchor };
}

export function EditorSendTimeCard({ message, isReminder, onTimingChange }: EditorSendTimeCardProps) {
  const dirAnchorValue = getDirectionAnchorValue(message.timing.direction, message.timing.anchor);

  return (
    <div
      style={{
        backgroundColor: '#FFF',
        border: '1px solid #E5E5E5',
        borderRadius: 8,
        padding: 16,
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <h3 style={{ fontSize: 18, fontWeight: 500, color: '#000', margin: 0 }}>
          Send time
        </h3>
      </div>

      <div className="flex items-start" style={{ gap: 16 }}>
        {/* Delta */}
        <div style={{ width: 97, flexShrink: 0 }}>
          <CanarySelect
            size={InputSize.NORMAL}
            value={message.timing.delta}
            options={DELTA_OPTIONS}
            onChange={(e) => onTimingChange({ delta: e.target.value as TimingDelta })}
          />
        </div>

        {/* Direction + Anchor — disabled for reminders (locked to parent's anchor) */}
        <div style={{ flex: 1 }}>
          <CanarySelect
            size={InputSize.NORMAL}
            value={dirAnchorValue}
            isDisabled={!!isReminder}
            options={DIRECTION_ANCHOR_OPTIONS}
            onChange={(e) => {
              const { direction, anchor } = parseDirectionAnchor(e.target.value);
              onTimingChange({ direction, anchor });
            }}
          />
        </div>

        {/* Send time */}
        <div style={{ width: 106, flexShrink: 0 }}>
          <CanarySelect
            size={InputSize.NORMAL}
            value={message.timing.sendTime || '9:00 AM'}
            options={TIME_OPTIONS}
            onChange={(e) => onTimingChange({ sendTime: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
