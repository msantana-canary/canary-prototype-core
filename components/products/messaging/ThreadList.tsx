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
import { CanarySelect, CanaryInput, InputSize } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiClose } from '@mdi/js';

interface ThreadListProps {
  threads: Thread[];
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  isComposingNew?: boolean;
  composingPhoneNumber?: string;
  onComposingPhoneChange?: (phone: string) => void;
  onCreateThread?: (phone: string) => string | null;
  onCancelComposing?: () => void;
  typingThreadId?: string | null;
}

export function ThreadList({
  threads,
  selectedThreadId,
  onSelectThread,
  isComposingNew = false,
  composingPhoneNumber = '',
  onComposingPhoneChange,
  onCreateThread,
  onCancelComposing,
  typingThreadId,
}: ThreadListProps) {
  const [filter, setFilter] = useState('all-conversations');

  const filterOptions = [
    { label: 'All conversations', value: 'all-conversations' },
    { label: 'My conversations', value: 'my-conversations' },
    { label: 'Unassigned', value: 'unassigned' },
  ];

  // Handle phone number submission
  const handlePhoneKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onCreateThread) {
      onCreateThread(composingPhoneNumber);
    }
  };

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

      {/* New Conversation Phone Input */}
      {isComposingNew && (
        <div className="bg-blue-50 border-b border-blue-200 p-4 flex items-center gap-2">
          <CanaryInput
            placeholder="Enter phone number..."
            value={composingPhoneNumber}
            onChange={(e) => onComposingPhoneChange?.(e.target.value)}
            onKeyDown={handlePhoneKeyDown}
            size={InputSize.NORMAL}
          />
          <button
            onClick={onCancelComposing}
            className="p-1 hover:bg-blue-100 rounded"
          >
            <Icon path={mdiClose} size={0.8} color="#666" />
          </button>
        </div>
      )}

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto">
        {threads.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No conversations
          </div>
        ) : (
          threads.map((thread) => {
            const guest = guests[thread.guestId];
            const reservation = reservations[thread.reservationId];

            return (
              <ThreadListItem
                key={thread.id}
                thread={thread}
                guest={guest}
                reservation={reservation}
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
