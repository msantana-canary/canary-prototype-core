'use client';

import React, { useState, useMemo } from 'react';
import { useCommandCenterStore } from '@/lib/products/command-center/store';
import { digestStats } from '@/lib/products/command-center/mock-data';
import { CommandCenterHeader } from '@/components/products/command-center/CommandCenterHeader';
import { AIDigestBanner } from '@/components/products/command-center/AIDigestBanner';
import { PrioritizedInbox } from '@/components/products/command-center/PrioritizedInbox';
import { ConversationView } from '@/components/products/command-center/ConversationView';
import { ContextPanel } from '@/components/products/command-center/ContextPanel';
import Icon from '@mdi/react';
import { mdiMessageTextOutline } from '@mdi/js';

export default function CommandCenterPage() {
  const [showDigest, setShowDigest] = useState(true);

  const {
    threads,
    messages,
    selectedThreadId,
    searchQuery,
    expandedSections,
    selectThread,
    markAsCompleted,
    setSearchQuery,
    toggleSection,
    sendMessage,
  } = useCommandCenterStore();

  const selectedThread = useMemo(() => {
    if (!selectedThreadId) return null;
    return threads.find((t) => t.id === selectedThreadId) || null;
  }, [threads, selectedThreadId]);

  const threadMessages = useMemo(() => {
    if (!selectedThreadId) return [];
    return messages[selectedThreadId] || [];
  }, [messages, selectedThreadId]);

  return (
    <>
      <CommandCenterHeader />

      {showDigest && (
        <AIDigestBanner stats={digestStats} onDismiss={() => setShowDigest(false)} />
      )}

      <div className="flex-1 flex overflow-hidden">
        <PrioritizedInbox
          threads={threads}
          selectedThreadId={selectedThreadId}
          searchQuery={searchQuery}
          expandedSections={expandedSections}
          onSelectThread={selectThread}
          onSearchChange={setSearchQuery}
          onToggleSection={toggleSection}
        />

        {selectedThread ? (
          <>
            <ConversationView
              thread={selectedThread}
              messages={threadMessages}
              onSendMessage={(content) => sendMessage(selectedThread.id, content)}
              onMarkAsDone={() => markAsCompleted(selectedThread.id)}
            />
            <ContextPanel thread={selectedThread} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Icon path={mdiMessageTextOutline} size={1.3} className="text-gray-300" />
              </div>
              <p className="text-[15px] font-medium text-gray-500">Select a conversation</p>
              <p className="text-[13px] text-gray-400 mt-1">Choose a thread from the inbox to view details</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
