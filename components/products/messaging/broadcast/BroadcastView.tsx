/**
 * BroadcastView Component — REDESIGN (broadcast step 1 baseline)
 *
 * TWO cards on the colorBlack8 canvas, spaced/margined like the Conversations
 * surface: the combined Audience card (content-sized — two equal 212px internal
 * columns) and the broadcast Thread card (all the remaining width).
 * The old three-column flush layout and the Active/Archived + Manage-segments
 * control band are gone — Active is simply the default state, Archived lives in
 * the GROUPS kebab, and "Manage segments" is reachable only from the filter
 * modal's Guest Segments mode.
 */

'use client';

import React, { useEffect } from 'react';
import { BroadcastAudienceCard } from './BroadcastAudienceCard';
import { BroadcastThread } from './BroadcastThread';
import { CreateGroupModal } from './CreateGroupModal';
import { FilterGuestsModal } from './FilterGuestsModal';
import { BroadcastDeliveryPanel } from './BroadcastDeliveryPanel';
import { useBroadcastStore } from '@/lib/products/messaging/broadcast-store';
import { Toast } from '@/components/core/Toast';

export function BroadcastView() {
  const {
    isCreateGroupModalOpen,
    closeCreateGroupModal,
    createGroup,
    isFilterModalOpen,
    closeFilterModal,
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
        {/* Audience card — CONTENT-SIZED, not a share of the canvas. Its two
            internal columns are equal (212 + 1px divider + 212), so the card is
            as wide as they make it and no wider. */}
        <div className="h-full flex shrink-0">
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

      {/* Filter Guests Modal */}
      <FilterGuestsModal
        isOpen={isFilterModalOpen}
        onClose={closeFilterModal}
      />

      {/* Per-recipient delivery panel — rides the shared floating-panel shell.
          Its z-index (40 / scrim 39) sits below @canary-ui's modal layer (50),
          so the filters-applied and send-confirm modals stack above it. */}
      <BroadcastDeliveryPanel />

      {/* Toast: guest segment saved */}
      <Toast message="Guest segment saved" isOpen={!!segmentSavedToast} variant="success" />
    </>
  );
}
