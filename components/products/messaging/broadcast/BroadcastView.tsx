/**
 * BroadcastView Component — REDESIGN (broadcast step 1 baseline)
 *
 * TWO cards on the colorBlack8 canvas, spaced/margined like the Conversations
 * surface: the combined Audience card (content-sized — two equal 212px internal
 * columns) and the broadcast Thread card (all the remaining width).
 * The old three-column flush layout and the Active/Archived + Manage-segments
 * control band are gone — Active is simply the default state, Archived lives in
 * the GROUPS kebab. "Manage segments" is NOT currently reachable from anywhere:
 * the filter modal's "Start from a segment" section (its only door) is hidden
 * behind `SHOW_START_FROM_SEGMENT` in `BroadcastFilterPanel.tsx` (Miguel,
 * 2026-08-26 — not in the Figma frame; the segments feature resurfaces later).
 */

'use client';

import React, { useEffect } from 'react';
import { BroadcastAudienceCard } from './BroadcastAudienceCard';
import { BroadcastThread } from './BroadcastThread';
import { CreateGroupModal } from './CreateGroupModal';
import { BroadcastDeliveryPanel } from './BroadcastDeliveryPanel';
import { BroadcastScheduledPanel } from './BroadcastScheduledPanel';
import { useBroadcastStore } from '@/lib/products/messaging/broadcast-store';
import { Toast } from '@/components/core/Toast';

export function BroadcastView() {
  const {
    isCreateGroupModalOpen,
    closeCreateGroupModal,
    createGroup,
    segmentSavedToast,
    dismissSegmentSavedToast,
  } = useBroadcastStore();

  // Save-as-segment toast — wired to the real save action (it used to watch a
  // broadcast-local saved-filter list that the save flow never wrote to).
  useEffect(() => {
    if (!segmentSavedToast) return;
    const timer = setTimeout(dismissSegmentSavedToast, 3000);
    return () => clearTimeout(timer);
  }, [segmentSavedToast, dismissSegmentSavedToast]);


  return (
    <>
      <div
        className="flex h-full gap-4 min-h-0"
        style={{ paddingLeft: 24, paddingRight: 24, paddingBottom: 24, paddingTop: 16 }}
      >
        {/* Audience card — 35% of the content row, the SAME share the
            Conversations thread list takes (page.tsx), so the two surfaces'
            left pillars align at any viewport width (Miguel 2026-08-26;
            supersedes the content-sized 320px card). */}
        <div className="h-full flex" style={{ flexBasis: '35%', flexGrow: 0, flexShrink: 1 }}>
          <BroadcastAudienceCard />
        </div>

        {/* Broadcast thread card — takes ALL the remaining canvas */}
        <div className="min-w-0 h-full flex flex-1">
          <BroadcastThread />
        </div>
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={closeCreateGroupModal}
        onCreate={createGroup}
      />


      {/* Per-recipient delivery panel — rides the shared floating-panel shell.
          Its z-index (40 / scrim 39) sits below @canary-ui's modal layer (50),
          so the filters-applied and send-confirm modals stack above it. */}
      <BroadcastDeliveryPanel />

      {/* Scheduled-broadcast detail — edit text / edit time / send now / delete */}
      <BroadcastScheduledPanel />

      {/* Toast: guest segment saved */}
      <Toast message="Guest segment saved" isOpen={!!segmentSavedToast} variant="success" />

    </>
  );
}
