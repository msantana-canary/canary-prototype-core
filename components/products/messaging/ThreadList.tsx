/**
 * ThreadList Component
 *
 * Left panel showing conversation list with filter dropdown.
 * Width: ~370px fixed
 */

'use client';

import React, { useState } from 'react';
import { ThreadListItem } from './ThreadListItem';
import { Thread } from '@/lib/products/messaging/types';
import { guests } from '@/lib/core/data/guests';
import { reservations } from '@/lib/core/data/reservations';
import { CanarySelect, InputSize } from '@canary-ui/components';

interface ThreadListProps {
  threads: Thread[];
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  typingThreadId?: string | null;
}

export function ThreadList({
  threads,
  selectedThreadId,
  onSelectThread,
  typingThreadId,
}: ThreadListProps) {
  const [filter, setFilter] = useState('all-conversations');

  const filterOptions = [
    { label: 'All conversations', value: 'all-conversations' },
    { label: 'My conversations', value: 'my-conversations' },
    { label: 'Unassigned', value: 'unassigned' },
  ];

  return (
    <div className="w-full bg-neutral-50 flex flex-col h-full">
      {/* Filter Section */}
      <div className="bg-white border-b border-t border-neutral-200 h-[70px] px-4 py-4 flex items-center">
        <div className="flex-1">
          <CanarySelect
            options={filterOptions}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            size={InputSize.NORMAL}
          />
        </div>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto">
        {threads.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No conversations
          </div>
        ) : (
          threads.map((thread) => {
            // Derive primary guest/reservation from first linked reservation
            const primaryResId = thread.linkedReservationIds[0];
            const primaryRes = primaryResId ? reservations[primaryResId] : undefined;
            const primaryGuest = primaryRes ? guests[primaryRes.guestId] : undefined;

            return (
              <ThreadListItem
                key={thread.id}
                thread={thread}
                guest={primaryGuest}
                reservation={primaryRes}
                isSelected={thread.id === selectedThreadId}
                onClick={() => onSelectThread(thread.id)}
                isTyping={thread.id === typingThreadId}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
