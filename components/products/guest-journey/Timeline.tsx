'use client';

/**
 * Timeline
 *
 * Blue line connects first dot to last dot, measured via getBoundingClientRect().
 * Line starts at max-height:0 and animates to full height on mount.
 * Production: left:227px, translateY to first dot, max-height = last dot - first dot.
 */

import { useMemo, useRef, useEffect, useCallback } from 'react';
import {
  GuestJourneyMessage,
  JourneyStage,
  JOURNEY_STAGES,
} from '@/lib/products/guest-journey/types';
import { TimelineStage } from './TimelineStage';
import { TimelineItem } from './TimelineItem';

const LINE_LEFT = 227;

interface TimelineProps {
  messages: GuestJourneyMessage[];
  selectedMessageId: string | null;
  onSelectMessage: (messageId: string) => void;
  onToggleEnabled: (messageId: string) => void;
  onNewMessage: (stage: JourneyStage) => void;
}

export function Timeline({
  messages,
  selectedMessageId,
  onSelectMessage,
  onToggleEnabled,
  onNewMessage,
}: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  const messagesByStage = useMemo(() => {
    const grouped: Record<JourneyStage, GuestJourneyMessage[]> = {
      PRE_ARRIVAL: [],
      ARRIVAL: [],
      IN_HOUSE: [],
      DEPARTURE: [],
      POST_DEPARTURE: [],
    };
    messages.forEach((msg) => {
      grouped[msg.stage].push(msg);
    });
    return grouped;
  }, [messages]);

  // Measure dot positions and size the line from first to last dot
  const updateLine = useCallback(() => {
    if (!lineRef.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const dots = containerRef.current.querySelectorAll('.timeline-point');

    if (dots.length === 0) return;

    const firstDot = dots[0] as HTMLElement;
    const lastDot = dots[dots.length - 1] as HTMLElement;

    const firstRect = firstDot.getBoundingClientRect();
    const lastRect = lastDot.getBoundingClientRect();

    // Center of first and last dot relative to container
    const firstCenter = firstRect.top + firstRect.height / 2 - containerRect.top;
    const lastCenter = lastRect.top + lastRect.height / 2 - containerRect.top;

    // Position line horizontally at the center of the first dot
    const dotCenterX = firstRect.left + firstRect.width / 2 - containerRect.left;

    const sectionCount = JOURNEY_STAGES.length;
    const transitionDuration = sectionCount * 0.1;

    lineRef.current.style.left = `${dotCenterX}px`;
    lineRef.current.style.height = `${lastCenter - firstCenter}px`;
    lineRef.current.style.transform = `translateY(${Math.round(firstCenter)}px)`;
    lineRef.current.style.transition = `height ${transitionDuration}s linear`;
  }, []);

  useEffect(() => {
    // Wait for animations to settle, then measure
    const timer = setTimeout(updateLine, 600);
    return () => clearTimeout(timer);
  }, [messages, updateLine]);

  let globalAnimIdx = 0;

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto h-full timeline-container"
      style={{ padding: 24 }}
    >
      {/* Blue line — absolute, starts at max-height:0, animates to measured height */}
      <div
        ref={lineRef}
        className="absolute"
        style={{
          left: 0,
          top: 0,
          height: 0,
          borderLeft: '2px solid #2858C4',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      />

      {/* Section boxes */}
      <div className="relative flex flex-col" style={{ gap: 16 }}>
        {JOURNEY_STAGES.map((stage) => {
          const stageMessages = messagesByStage[stage];
          const stageAnimIdx = globalAnimIdx;
          globalAnimIdx += 1;

          const items = stageMessages.map((msg) => {
            const itemAnimIdx = globalAnimIdx;
            globalAnimIdx += 1;
            return (
              <TimelineItem
                key={msg.id}
                message={msg}
                isSelected={selectedMessageId === msg.id}
                onSelect={() => onSelectMessage(msg.id)}
                onToggleEnabled={() => onToggleEnabled(msg.id)}
                animationIndex={itemAnimIdx}
              />
            );
          });

          return (
            <TimelineStage
              key={stage}
              stage={stage}
              onNewMessage={() => onNewMessage(stage)}
              animationIndex={stageAnimIdx}
            >
              {items}
            </TimelineStage>
          );
        })}
      </div>

      {/* CSS animation */}
      <style>{`
        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .timeline-item-animate {
          opacity: 0;
          animation: fadeInSlide 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
