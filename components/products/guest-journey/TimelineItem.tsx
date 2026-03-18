'use client';

/**
 * TimelineItem
 *
 * Single timeline row inside a section box.
 * Layout: timing label (184px right-aligned) → dot (vertically centered to card) → card (600px).
 *
 * Since the section has 24px padding, the row content is already inset.
 * The timing label + dot + card are laid out relative to the section's internal space.
 */

import { GuestJourneyMessage } from '@/lib/products/guest-journey/types';
import { timingToLabel } from '@/lib/products/guest-journey/utils';
import { TimelineCard } from './TimelineCard';

// Layout: inside the section (which has 24px padding from section box)
// The blue line is at 227px from the canvas edge = 227 - 24 (canvas padding) - 24 (section padding) = 179px from section content edge
// Label: 160px wide, right-aligned, then 16px gap to dot, then 16px gap to card
const LABEL_WIDTH = 160;
const GAP = 16;

interface TimelineItemProps {
  message: GuestJourneyMessage;
  isSelected: boolean;
  onSelect: () => void;
  onToggleEnabled: () => void;
  animationIndex: number;
}

export function TimelineItem({
  message,
  isSelected,
  onSelect,
  onToggleEnabled,
  animationIndex,
}: TimelineItemProps) {
  const label = timingToLabel(message.timing);

  return (
    <div
      className="flex items-start timeline-item-animate"
      style={{
        animationDelay: `${animationIndex * 0.1}s`,
      }}
    >
      {/* Timing label — right aligned */}
      <div
        className="flex-shrink-0 text-right"
        style={{
          width: LABEL_WIDTH,
          fontSize: 14,
          fontWeight: 400,
          color: '#000',
          paddingTop: 24,
          paddingRight: 0,
          lineHeight: '1.4',
        }}
      >
        <h3 style={{ margin: 0, fontSize: 'inherit', fontWeight: 'inherit' }}>
          {label.lines.map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </h3>
      </div>

      {/* Dot — centered vertically to the card */}
      <div
        className="flex-shrink-0 flex items-center justify-center"
        style={{
          width: GAP * 2 + 8, // 16px gap + 8px dot + 16px gap
          paddingTop: 28,
        }}
      >
        <div
          className="timeline-point"
          style={{
            width: 8,
            height: 8,
            borderRadius: '100%',
            backgroundColor: '#2858C4',
          }}
        />
      </div>

      {/* Card */}
      <div className="flex-shrink-0">
        <TimelineCard
          message={message}
          isSelected={isSelected}
          onSelect={onSelect}
          onToggleEnabled={onToggleEnabled}
        />
      </div>
    </div>
  );
}
