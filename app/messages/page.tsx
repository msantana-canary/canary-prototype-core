'use client';

/**
 * Messages Product Page
 *
 * Main entry point for the Messaging product.
 * Uses the canonical data layer and messaging-specific components.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '@/components/products/messaging/AppLayout';
import { ThreadList } from '@/components/products/messaging/ThreadList';
import { ThreadView } from '@/components/products/messaging/ThreadView';
import { UnlinkReservationModal } from '@/components/products/messaging/UnlinkReservationModal';
import { useMessagingStore } from '@/lib/products/messaging/store';
import { guests } from '@/lib/core/data/guests';
import { reservations } from '@/lib/core/data/reservations';
import { LinkedReservation } from '@/lib/products/messaging/types';
import { LinkReservationModal } from '@/components/products/messaging/LinkReservationModal';
import { generateGuestResponse, generateStaffResponse } from '@/lib/products/messaging/services/claude-api';

export default function MessagesPage() {
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
  } = useMessagingStore();

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

    return filtered;
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

  // Auto-select first thread on mount
  useEffect(() => {
    if (!selectedThreadId && filteredThreads.length > 0) {
      selectThread(filteredThreads[0].id);
    }
  }, [selectedThreadId, filteredThreads, selectThread]);

  return (
    <AppLayout
      currentView={currentView}
      onViewChange={setCurrentView}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onNewMessage={startNewConversation}
      threads={threads}
    >
      <div className="flex h-full">
        {/* Thread List */}
        <div className="w-[320px] border-r border-gray-200">
          <ThreadList
            threads={filteredThreads}
            selectedThreadId={selectedThreadId}
            onSelectThread={selectThread}
            isComposingNew={isComposingNew}
            composingPhoneNumber={composingPhoneNumber}
            onComposingPhoneChange={updateComposingPhone}
            onCreateThread={createThreadFromPhone}
            onCancelComposing={cancelComposing}
            typingThreadId={typingThreadId}
          />
        </div>

        {/* Thread View */}
        <div className="flex-1">
          {selectedThread ? (
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
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>

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
    </AppLayout>
  );
}
