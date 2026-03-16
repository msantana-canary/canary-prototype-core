/**
 * BroadcastView Component
 *
 * Top-level container for the broadcast feature.
 * 3-column layout: GroupList | GuestList | Thread
 */

'use client';

import React, { useEffect } from 'react';
import { BroadcastGroupList } from './BroadcastGroupList';
import { BroadcastGuestList } from './BroadcastGuestList';
import { BroadcastThread } from './BroadcastThread';
import { CreateGroupModal } from './CreateGroupModal';
import { FilterGuestsModal } from './FilterGuestsModal';
import { ManageFiltersModal } from './ManageFiltersModal';
import { useBroadcastStore } from '@/lib/products/messaging/broadcast-store';
import { Toast } from '@/components/core/Toast';

export function BroadcastView() {
  const {
    isCreateGroupModalOpen,
    closeCreateGroupModal,
    createGroup,
    isFilterModalOpen,
    closeFilterModal,
    isManageFiltersModalOpen,
    closeManageFiltersModal,
  } = useBroadcastStore();

  // Toast for filter saved
  const [showSaveToast, setShowSaveToast] = React.useState(false);
  const savedFiltersCount = useBroadcastStore(s => s.savedFilters.length);
  const prevCountRef = React.useRef(savedFiltersCount);

  useEffect(() => {
    if (savedFiltersCount > prevCountRef.current) {
      setShowSaveToast(true);
      const timer = setTimeout(() => setShowSaveToast(false), 3000);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = savedFiltersCount;
  }, [savedFiltersCount]);

  return (
    <>
      <div className="flex h-full overflow-hidden">
        {/* Left: Group List */}
        <div className="w-[240px] shrink-0 overflow-hidden">
          <BroadcastGroupList />
        </div>

        {/* Middle: Guest List */}
        <div className="w-[260px] shrink-0 overflow-hidden">
          <BroadcastGuestList />
        </div>

        {/* Right: Thread */}
        <div className="flex-1 overflow-hidden">
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

      {/* Manage Saved Filters Modal */}
      <ManageFiltersModal
        isOpen={isManageFiltersModalOpen}
        onClose={closeManageFiltersModal}
      />

      {/* Toast: Filter saved */}
      <Toast message="Filter successfully saved" isOpen={showSaveToast} variant="success" />
    </>
  );
}
