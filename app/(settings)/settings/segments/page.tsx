'use client';

/**
 * Segments Management Page
 *
 * Global segments settings — list, create, edit segments.
 * Builder slides over the list (like GJ message editor / check-in detail panel).
 */

import { useState } from 'react';
import { SegmentList } from '@/components/products/segments/SegmentList';
import { SegmentBuilder } from '@/components/products/segments/SegmentBuilder';
import { GuestJourneyToast } from '@/components/products/guest-journey/GuestJourneyToast';
import { useGuestJourneyStore } from '@/lib/products/guest-journey/store';

export default function SegmentsPage() {
  const {
    segments,
    createSegment,
    updateSegment,
    deleteSegment,
  } = useGuestJourneyStore();

  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  const editingSegment = editingSegmentId
    ? segments.find((s) => s.id === editingSegmentId)
    : undefined;

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      <SegmentList
        segments={segments}
        onEdit={(id) => {
          setEditingSegmentId(id);
          setIsBuilderOpen(true);
        }}
        onDelete={(id) => {
          deleteSegment(id);
          useGuestJourneyStore.getState().showToast('Segment deleted');
        }}
        onCreate={() => {
          setEditingSegmentId(null);
          setIsBuilderOpen(true);
        }}
      />

      {/* Segment builder slide-over */}
      <GuestJourneyToast />
      <SegmentBuilder
        isOpen={isBuilderOpen}
        segment={editingSegment}
        onSave={(segment) => {
          if (editingSegment) {
            updateSegment(segment.id, segment);
            useGuestJourneyStore.getState().showToast('Segment updated');
          } else {
            createSegment(segment);
            useGuestJourneyStore.getState().showToast('Segment created');
          }
          setIsBuilderOpen(false);
          setEditingSegmentId(null);
        }}
        onClose={() => {
          setIsBuilderOpen(false);
          setEditingSegmentId(null);
        }}
      />
    </div>
  );
}
