'use client';

/**
 * Messages Product Page
 *
 * Main entry point for the Messaging product.
 * Uses the canonical data layer and messaging-specific components.
 * Supports tab switching between Conversations and Broadcast.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '@/components/products/messaging/AppLayout';
import { ThreadList } from '@/components/products/messaging/ThreadList';
import { ThreadView } from '@/components/products/messaging/ThreadView';
import { GuestInfoSidebar } from '@/components/products/messaging/GuestInfoSidebar';
import { ComposeHeader } from '@/components/products/messaging/ComposeHeader';
import { UnlinkReservationModal } from '@/components/products/messaging/UnlinkReservationModal';
import { PrototypeVariantToggle } from '@/components/products/messaging/PrototypeVariantToggle';
import { ConversationControls } from '@/components/products/messaging/ConversationControls';
import { BroadcastView } from '@/components/products/messaging/broadcast/BroadcastView';
import { useMessagingStore } from '@/lib/products/messaging/store';
import { guests } from '@/lib/core/data/guests';
import { reservations } from '@/lib/core/data/reservations';
import { LinkedReservation } from '@/lib/products/messaging/types';
import { LinkReservationModal } from '@/components/products/messaging/LinkReservationModal';
import { generateGuestResponse, generateStaffResponse } from '@/lib/products/messaging/services/claude-api';
import { MainNavTab } from '@/lib/products/messaging/broadcast-types';

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState<MainNavTab>('conversations');

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
    topRowStyle,
  } = useMessagingStore();

  // Compact moves the search + Filters + New-message controls INTO the left
  // (thread-list) column, floating above the card. In-card takes that one step
  // further: the same controls become the card's OWN header zone, inside the
  // border, and the list column widens to 45% so they aren't cramped.
  // Both drop AppLayout's full-width row, so the thread column runs full height.
  const isCompact = topRowStyle === 'compact';
  const isInCard = topRowStyle === 'in-card';
  const isColumnScoped = isCompact || isInCard;

  // Get the selected thread
  const selectedThread = useMemo(() => {
    if (!selectedThreadId) return null;
    return threads.find((t) => t.id === selectedThreadId) || null;
  }, [threads, selectedThreadId]);

  // Resolve all linked reservations with their guests and auto-link status
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

  // Primary guest: first auto-linked, or first linked, or null
  const primaryLinked = useMemo(() => {
    return linkedReservations.find((lr) => lr.isAutoLinked) || linkedReservations[0] || null;
  }, [linkedReservations]);

  const selectedGuest = primaryLinked?.guest || null;
  const selectedReservation = primaryLinked?.reservation || null;

  // Get messages for selected thread
  const selectedMessages = selectedThreadId ? messages[selectedThreadId] || [] : [];

  // Filter threads by current view and search query
  const filteredThreads = useMemo(() => {
    let filtered = threads.filter((t) => t.status === currentView);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((thread) => {
        // Match on contact number
        if (thread.contactNumber.toLowerCase().includes(query)) return true;
        // Match on any linked reservation's guest info
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

    // Sort by recency (newest lastMessageAt first) so the most recent thread
    // renders at the top — also makes the auto-select-first effect land on it.
    return [...filtered].sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
  }, [threads, currentView, searchQuery]);

  // Handle sending a message
  const handleSendMessage = async (content: string) => {
    if (!selectedThreadId) return;

    // Send staff message
    await sendMessage(selectedThreadId, content, 'staff');

    // If AI is enabled, trigger auto-response
    if (aiEnabled && selectedGuest) {
      // Show typing indicator
      setTimeout(() => setGuestTyping(selectedThreadId), 500);

      // Generate AI response
      setTimeout(async () => {
        try {
          const response = await generateStaffResponse(
            selectedGuest,
            selectedReservation || undefined,
            [...selectedMessages, { id: 'temp', threadId: selectedThreadId, sender: 'staff', content, timestamp: new Date() }]
          );
          setGuestTyping(null);

          // Simulate guest response after staff
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

  // Unlink modal state — tracks which reservation row was clicked
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

  // Auto-select first thread on mount (conversations only).
  // Skip while composing — startNewConversation nulls selectedThreadId, and without
  // this guard the effect would instantly re-select thread #1 (spurious mark-as-read +
  // clobbers the compose pane). On cancel, isComposingNew flips false and this re-runs,
  // landing the user back on the inbox's first thread.
  useEffect(() => {
    if (activeTab === 'conversations' && !selectedThreadId && !isComposingNew && filteredThreads.length > 0) {
      selectThread(filteredThreads[0].id);
    }
  }, [activeTab, selectedThreadId, isComposingNew, filteredThreads, selectThread]);

  return (
    <AppLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onNewMessage={startNewConversation}
      currentView={currentView}
      onViewChange={setCurrentView}
    >
      {activeTab === 'conversations' && (
        <div
          className="flex h-full gap-4 min-h-0"
          style={{ paddingLeft: 24, paddingRight: 24, paddingBottom: 24, paddingTop: isColumnScoped ? 16 : 0 }}
        >
          {/* Thread List column — 35% of the content row (scales to any width).
              In compact mode the search + Filters + New-message controls sit at the
              top of THIS column (column-scoped), above the list card. */}
          <div
            className="min-w-0 h-full flex flex-col gap-3"
            style={{ flexBasis: isInCard ? '45%' : '35%', flexGrow: 0, flexShrink: 1 }}
          >
            {isCompact && (
              <div className="shrink-0">
                <ConversationControls
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onNewMessage={startNewConversation}
                  currentView={currentView}
                  onViewChange={setCurrentView}
                  compact
                />
              </div>
            )}
            <div className="flex-1 min-h-0">
              <ThreadList
                threads={filteredThreads}
                selectedThreadId={selectedThreadId}
                onSelectThread={selectThread}
                typingThreadId={typingThreadId}
                header={
                  isInCard ? (
                    <ConversationControls
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      onNewMessage={startNewConversation}
                      currentView={currentView}
                      onViewChange={setCurrentView}
                      compact
                    />
                  ) : undefined
                }
              />
            </div>
          </div>

          {/* Thread View / Compose — 65% of the content row */}
          <div
            className="min-w-0 h-full flex"
            style={{ flexBasis: isInCard ? '55%' : '65%', flexGrow: 1, flexShrink: 1 }}
          >
            {isComposingNew ? (
              <div
                className="flex-1 min-w-0 overflow-clip rounded-[12px]"
                style={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e5' }}
              >
                <ComposeHeader
                  composingPhoneNumber={composingPhoneNumber}
                  onComposingPhoneChange={updateComposingPhone}
                  onCreateThread={createThreadFromPhone}
                  onCancelComposing={cancelComposing}
                />
              </div>
            ) : selectedThread ? (
              <ThreadView
                thread={selectedThread}
                guest={selectedGuest}
                reservation={selectedReservation}
                messages={selectedMessages}
                onSendMessage={handleSendMessage}
                aiEnabled={aiEnabled}
                onAiToggle={() => setAiEnabled(!aiEnabled)}
                isGuestInfoOpen={isGuestInfoOpen}
                onToggleGuestInfo={toggleGuestInfo}
                onArchive={() => archiveThread(selectedThread.id)}
                onBlock={() => blockThread(selectedThread.id)}
                onUnblock={() => unblockThread(selectedThread.id)}
                onMarkUnread={() => markThreadAsUnread(selectedThread.id)}
                typingThreadId={typingThreadId}
              />
            ) : (
              <div
                className="flex-1 min-w-0 flex items-center justify-center rounded-[12px] text-gray-500"
                style={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e5' }}
              >
                Select a conversation to start messaging
              </div>
            )}
          </div>

          {/* Conversation Details — floating panel + scrim (fixed; out of flow) */}
          {selectedThread && !isComposingNew && (
            <GuestInfoSidebar
              contactNumber={selectedThread.contactNumber}
              linkedReservations={linkedReservations}
              isOpen={isGuestInfoOpen}
              onClose={closeGuestInfo}
              onOpenLinkModal={openLinkReservationModal}
              onUnlinkReservation={handleRequestUnlink}
            />
          )}
        </div>
      )}

      {activeTab === 'broadcast' && (
        <BroadcastView />
      )}

      {/* Link Reservation Modal */}
      <LinkReservationModal
        isOpen={isLinkReservationModalOpen}
        onClose={closeLinkReservationModal}
        onLink={(resId) => {
          if (selectedThreadId) linkReservation(selectedThreadId, resId);
        }}
        alreadyLinkedIds={selectedThread?.linkedReservationIds || []}
      />

      {/* Unlink Reservation Modal */}
      <UnlinkReservationModal
        isOpen={!!unlinkTarget}
        onClose={() => setUnlinkTarget(null)}
        onConfirmUnlink={handleConfirmUnlink}
        guestName={unlinkTarget?.guest.name || ''}
        contactNumber={selectedThread?.contactNumber || ''}
        isAutoLinked={unlinkTarget?.isAutoLinked || false}
      />

      {/* Prototype control — renders the option group for the surface you're on
          (Conversations: top-row layout; Broadcast: the filter-modal A/B). It
          sits bottom-LEFT so it can never overlap either composer's Send. */}
      <PrototypeVariantToggle surface={activeTab} />
    </AppLayout>
  );
}
