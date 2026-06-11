'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '@/components/products/messaging/AppLayout';
import { ThreadList } from '@/components/products/messaging/ThreadList';
import { ThreadView } from '@/components/products/messaging/ThreadView';
import { UnlinkReservationModal } from '@/components/products/messaging/UnlinkReservationModal';
import { BroadcastView } from '@/components/products/messaging/broadcast/BroadcastView';
import { PrototypeVariantToggle } from '@/components/products/messaging/PrototypeVariantToggle';
import { CompactInboxHeader } from '@/components/products/messaging/CompactInboxHeader';
import { ComposeHeader } from '@/components/products/messaging/ComposeHeader';
import { useMessagingStore } from '@/lib/products/messaging/store';
import { guests } from '@/lib/core/data/guests';
import { reservations } from '@/lib/core/data/reservations';
import { LinkedReservation } from '@/lib/products/messaging/types';
import { LinkReservationModal } from '@/components/products/messaging/LinkReservationModal';
import { generateGuestResponse, generateStaffResponse } from '@/lib/products/messaging/services/claude-api';
import { MainNavTab } from '@/lib/products/messaging/broadcast-types';
import { getEmailThreadsForThread } from '@/lib/products/messaging/mock-data';

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState<MainNavTab>('conversations');
  const [convFilter, setConvFilter] = useState('all-conversations');
  const [searchVariant, setSearchVariant] = useState<'slide-down' | 'takeover'>('slide-down');

  const {
    threads,
    messages,
    selectedThreadId,
    aiEnabled,
    isComposingNew,
    composingPhoneNumber,
    typingThreadId,
    isGuestInfoOpen,
    currentView,
    searchQuery,
    selectedChannel,
    selectedEmailThreadId,
    channelSelectorVariant,
    emailComposerVariant,
    channelSelectorPosition,
    inboxLayout,
    emailViewVariant,
    channelTabMode,
    simulateUnreadEmail,
    selectThread,
    setAiEnabled,
    sendMessage,
    startNewConversation,
    updateComposingPhone,
    createThreadFromPhone,
    cancelComposing,
    setGuestTyping,
    toggleGuestInfo,
    closeGuestInfo,
    setCurrentView,
    archiveThread,
    blockThread,
    unblockThread,
    markThreadAsUnread,
    setSearchQuery,
    isLinkReservationModalOpen,
    openLinkReservationModal,
    closeLinkReservationModal,
    linkReservation,
    unlinkReservation,
    setSelectedChannel,
    setSelectedEmailThreadId,
    setChannelSelectorVariant,
    setEmailComposerVariant,
    setChannelSelectorPosition,
    setInboxLayout,
    setEmailViewVariant,
    setChannelTabMode,
    setSimulateUnreadEmail,
  } = useMessagingStore();

  const isCompact = inboxLayout === 'compact';

  const selectedThread = useMemo(() => {
    if (!selectedThreadId) return null;
    return threads.find((t) => t.id === selectedThreadId) || null;
  }, [threads, selectedThreadId]);

  const linkedReservations: LinkedReservation[] = useMemo(() => {
    if (!selectedThread) return [];
    return selectedThread.linkedReservationIds
      .map((resId) => {
        const reservation = reservations[resId];
        if (!reservation) return null;
        const guest = guests[reservation.guestId];
        if (!guest) return null;
        return {
          reservation,
          guest,
          isAutoLinked: guest.phone === selectedThread.contactNumber,
        };
      })
      .filter((lr): lr is LinkedReservation => lr !== null);
  }, [selectedThread]);

  const primaryLinked = useMemo(() => {
    return linkedReservations.find((lr) => lr.isAutoLinked) || linkedReservations[0] || null;
  }, [linkedReservations]);

  const selectedGuest = primaryLinked?.guest || null;
  const selectedReservation = primaryLinked?.reservation || null;

  const selectedMessages = selectedThreadId ? messages[selectedThreadId] || [] : [];

  const emailThreads = useMemo(() => {
    if (!selectedThreadId) return [];
    return getEmailThreadsForThread(selectedThreadId);
  }, [selectedThreadId]);

  const filteredThreads = useMemo(() => {
    let filtered = threads.filter((t) => t.status === currentView);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((thread) => {
        if (thread.contactNumber.toLowerCase().includes(query)) return true;
        return thread.linkedReservationIds.some((resId) => {
          const res = reservations[resId];
          if (!res) return false;
          const guest = guests[res.guestId];
          if (!guest) return false;
          return (
            guest.name.toLowerCase().includes(query) ||
            guest.phone?.toLowerCase().includes(query) ||
            guest.email?.toLowerCase().includes(query)
          );
        });
      });
    }

    return filtered;
  }, [threads, currentView, searchQuery]);

  const handleSendMessage = async (content: string) => {
    if (!selectedThreadId) return;

    await sendMessage(selectedThreadId, content, 'staff');

    if (aiEnabled && selectedGuest) {
      setTimeout(() => setGuestTyping(selectedThreadId), 500);

      setTimeout(async () => {
        try {
          const response = await generateStaffResponse(
            selectedGuest,
            selectedReservation || undefined,
            [...selectedMessages, { id: 'temp', threadId: selectedThreadId, sender: 'staff', content, timestamp: new Date() }]
          );
          setGuestTyping(null);

          setTimeout(async () => {
            setGuestTyping(selectedThreadId);
            setTimeout(async () => {
              const guestResponse = await generateGuestResponse(
                selectedGuest,
                selectedReservation || undefined,
                [...selectedMessages, { id: 'temp2', threadId: selectedThreadId, sender: 'ai', content: response, timestamp: new Date() }]
              );
              setGuestTyping(null);
              await sendMessage(selectedThreadId, guestResponse, 'guest');
            }, 2000);
          }, 1500);
        } catch {
          setGuestTyping(null);
        }
      }, 1500);
    }
  };

  const [unlinkTarget, setUnlinkTarget] = useState<LinkedReservation | null>(null);

  const handleRequestUnlink = (reservationId: string) => {
    const lr = linkedReservations.find((r) => r.reservation.id === reservationId) || null;
    setUnlinkTarget(lr);
  };

  const handleConfirmUnlink = () => {
    if (unlinkTarget && selectedThreadId) {
      unlinkReservation(selectedThreadId, unlinkTarget.reservation.id);
    }
    setUnlinkTarget(null);
  };

  useEffect(() => {
    if (activeTab === 'conversations' && !selectedThreadId && !isComposingNew && filteredThreads.length > 0) {
      selectThread(filteredThreads[0].id);
    }
  }, [activeTab, selectedThreadId, isComposingNew, filteredThreads, selectThread]);

  return (
    <AppLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      currentView={currentView}
      onViewChange={setCurrentView}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onNewMessage={startNewConversation}
      hideSubNav={isCompact}
    >
      {activeTab === 'conversations' && (
        <div className="flex h-full">
          <div className="w-[320px] border-r border-gray-200 flex flex-col">
            {isCompact && (
              <CompactInboxHeader
                currentView={currentView}
                onViewChange={setCurrentView}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onNewMessage={startNewConversation}
                filterValue={convFilter}
                onFilterChange={setConvFilter}
                searchVariant={searchVariant}
              />
            )}
            <div className="flex-1 overflow-hidden">
              <ThreadList
                threads={filteredThreads}
                selectedThreadId={selectedThreadId}
                onSelectThread={selectThread}
                typingThreadId={typingThreadId}
                hideFilter={isCompact}
              />
            </div>
          </div>

          <div className="flex-1">
            {isComposingNew ? (
              <ComposeHeader
                composingPhoneNumber={composingPhoneNumber}
                onComposingPhoneChange={updateComposingPhone}
                onCreateThread={createThreadFromPhone}
                onCancelComposing={cancelComposing}
              />
            ) : selectedThread ? (
              <ThreadView
                thread={selectedThread}
                guest={selectedGuest}
                reservation={selectedReservation}
                linkedReservations={linkedReservations}
                messages={selectedMessages}
                onSendMessage={handleSendMessage}
                aiEnabled={aiEnabled}
                onAiToggle={() => setAiEnabled(!aiEnabled)}
                isGuestInfoOpen={isGuestInfoOpen}
                onToggleGuestInfo={toggleGuestInfo}
                onCloseGuestInfo={closeGuestInfo}
                onArchive={() => archiveThread(selectedThread.id)}
                onBlock={() => blockThread(selectedThread.id)}
                onUnblock={() => unblockThread(selectedThread.id)}
                onMarkUnread={() => markThreadAsUnread(selectedThread.id)}
                onOpenLinkModal={openLinkReservationModal}
                onUnlinkReservation={handleRequestUnlink}
                typingThreadId={typingThreadId}
                selectedChannel={selectedChannel}
                onChannelChange={setSelectedChannel}
                channelSelectorVariant={channelSelectorVariant}
                emailComposerVariant={emailComposerVariant}
                emailThreads={emailThreads}
                selectedEmailThreadId={selectedEmailThreadId}
                onEmailThreadChange={setSelectedEmailThreadId}
                channelSelectorPosition={channelSelectorPosition}
                emailViewVariant={emailViewVariant}
                channelTabMode={channelTabMode}
                simulateUnreadEmail={simulateUnreadEmail}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'broadcast' && (
        <BroadcastView />
      )}

      {activeTab === 'ai-answers' && (
        <div className="flex items-center justify-center h-full text-gray-400">
          AI Answers coming soon
        </div>
      )}

      <LinkReservationModal
        isOpen={isLinkReservationModalOpen}
        onClose={closeLinkReservationModal}
        onLink={(resId) => {
          if (selectedThreadId) linkReservation(selectedThreadId, resId);
        }}
        alreadyLinkedIds={selectedThread?.linkedReservationIds || []}
      />

      <UnlinkReservationModal
        isOpen={!!unlinkTarget}
        onClose={() => setUnlinkTarget(null)}
        onConfirmUnlink={handleConfirmUnlink}
        guestName={unlinkTarget?.guest.name || ''}
        contactNumber={selectedThread?.contactNumber || ''}
        isAutoLinked={unlinkTarget?.isAutoLinked || false}
      />

      <PrototypeVariantToggle
        inboxLayout={inboxLayout}
        onInboxLayoutChange={setInboxLayout}
        searchVariant={searchVariant}
        onSearchVariantChange={setSearchVariant}
        emailViewVariant={emailViewVariant}
        onEmailViewVariantChange={setEmailViewVariant}
        channelTabMode={channelTabMode}
        onChannelTabModeChange={setChannelTabMode}
        simulateUnreadEmail={simulateUnreadEmail}
        onSimulateUnreadEmailChange={setSimulateUnreadEmail}
      />
    </AppLayout>
  );
}
