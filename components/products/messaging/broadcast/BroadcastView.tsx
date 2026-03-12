/**
 * BroadcastView Component
 *
 * Top-level container for the broadcast feature.
 * 3-column layout: GroupList | GuestList | Thread
 */

'use client';

import React from 'react';
import { BroadcastGroupList } from './BroadcastGroupList';
import { BroadcastGuestList } from './BroadcastGuestList';
import { BroadcastThread } from './BroadcastThread';
import { CreateGroupModal } from './CreateGroupModal';
import { useBroadcastStore } from '@/lib/products/messaging/broadcast-store';

export function BroadcastView() {
  const {
    isCreateGroupModalOpen,
    closeCreateGroupModal,
    createGroup,
  } = useBroadcastStore();

  return (
    <>
      <div className="flex h-full">
        {/* Left: Group List */}
        <div className="w-[240px] shrink-0">
          <BroadcastGroupList />
        </div>

        {/* Middle: Guest List */}
        <div className="w-[260px] shrink-0">
          <BroadcastGuestList />
        </div>

        {/* Right: Thread */}
        <div className="flex-1">
          <BroadcastThread />
        </div>
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={closeCreateGroupModal}
        onCreate={createGroup}
      />
    </>
  );
}
