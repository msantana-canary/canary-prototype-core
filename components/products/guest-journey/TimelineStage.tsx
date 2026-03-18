'use client';

/**
 * TimelineStage
 *
 * A section box containing a stage header + card rows.
 * Sits on the #FAFAFA canvas with 24px internal padding, bg #F0F0F0.
 *
 * Production:
 * - bg #F0F0F0, hover → #EAEEF9
 * - 24px padding all around
 * - Header: stage label left, "New message" button right (hidden until section hover)
 * - "New message": PRIMARY button, opacity 0 → 1 on section hover
 */

import { CanaryButton, ButtonType } from '@canary-ui/components';
import { JourneyStage, STAGE_LABELS } from '@/lib/products/guest-journey/types';

interface TimelineStageProps {
  stage: JourneyStage;
  onNewMessage: () => void;
  animationIndex: number;
  children: React.ReactNode;
}

export function TimelineStage({ stage, onNewMessage, animationIndex, children }: TimelineStageProps) {
  // Use stage as stable ID — unique per section, consistent between server and client
  const sectionId = stage.toLowerCase().replace(/_/g, '-');

  return (
    <div
      className={`timeline-section-${sectionId}`}
      style={{
        backgroundColor: '#F0F0F0',
        borderRadius: 4,
        padding: 24,
        transition: 'background-color 0.2s ease',
      }}
    >
      {/* Stage header — full section width, label left, button right */}
      <div
        className="flex items-center justify-between timeline-item-animate"
        style={{
          animationDelay: `${animationIndex * 0.1}s`,
          marginBottom: 16,
        }}
      >
        <h2
          style={{
            fontSize: 18,
            fontWeight: 500,
            color: '#2858C4',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: 0,
          }}
        >
          {STAGE_LABELS[stage]}
        </h2>

        <div className={`timeline-newmsg-${sectionId}`}>
          <CanaryButton
            type={ButtonType.PRIMARY}
            onClick={onNewMessage}
          >
            New message
          </CanaryButton>
        </div>
      </div>

      {/* Card rows */}
      <div className="flex flex-col gap-2">
        {children}
      </div>

      <style>{`
        .timeline-section-${sectionId}:hover {
          background-color: #EAEEF9 !important;
        }
        .timeline-newmsg-${sectionId} {
          opacity: 0;
          transform: translateX(-4px);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .timeline-section-${sectionId}:hover .timeline-newmsg-${sectionId} {
          opacity: 1;
          transform: translateX(0);
        }
      `}</style>
    </div>
  );
}
