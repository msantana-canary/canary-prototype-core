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
import { ConversationDetailsPanel } from '@/components/products/messaging/panel/ConversationDetailsPanel';
import { AiExplanationPanel } from '@/components/products/messaging/ai/AiExplanationPanel';
import { AiFeedbackModal } from '@/components/products/messaging/ai/AiFeedbackModal';
import { CarrierErrorModal } from '@/components/products/messaging/ai/CarrierErrorModal';
import { Toast } from '@/components/core/Toast';
import { ComposeHeader } from '@/components/products/messaging/ComposeHeader';
import { ConversationControls } from '@/components/products/messaging/ConversationControls';
import {
  FolderSelect,
  AssignmentSelect,
  AssignmentScope,
} from '@/components/products/messaging/ThreadScopeMenu';
import { BroadcastView } from '@/components/products/messaging/broadcast/BroadcastView';
import { sortByRecency, useMessagingStore } from '@/lib/products/messaging/store';
import { guests } from '@/lib/core/data/guests';
import { reservations } from '@/lib/core/data/reservations';
import { panelIdentity } from '@/lib/products/messaging/panel-selectors';
import { generateGuestResponse, generateStaffResponse } from '@/lib/products/messaging/services/claude-api';
import { MainNavTab } from '@/lib/products/messaging/broadcast-types';

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState<MainNavTab>('conversations');

  /**
   * TWO scope axes, exactly production's: folder (currentView) and assignment.
   * They are independent and AND together, so "Archived + Housekeeping" is
   * reachable. Assignment itself is single-select — production's setters null
   * each other, so a department replaces "Assigned" and a person replaces the
   * department. There is no channel axis; production has none.
   */
  const [assignmentScope, setAssignmentScope] = useState<AssignmentScope>({ kind: 'all' });

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
    isThreadAiEnabled,
    toggleThreadAi,
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
    threadPrimaryReservationId,
  } = useMessagingStore();


  // Get the selected thread
  const selectedThread = useMemo(() => {
    if (!selectedThreadId) return null;
    return threads.find((t) => t.id === selectedThreadId) || null;
  }, [threads, selectedThreadId]);

  /**
   * The thread's PRIMARY person — the same spotlight the Conversation Details
   * panel puts in its profile header, so the thread header and the panel can
   * never name two different people for one conversation. Honours the
   * per-thread display preference; falls back to the in-house auto-linked stay.
   */
  const primaryLinked = useMemo(
    () => panelIdentity(selectedThread, selectedThread ? threadPrimaryReservationId[selectedThread.id] : undefined).primary,
    [selectedThread, threadPrimaryReservationId]
  );

  const selectedGuest = primaryLinked?.guest || null;
  const selectedReservation = primaryLinked?.reservation || null;

  // Get messages for selected thread
  const selectedMessages = selectedThreadId ? messages[selectedThreadId] || [] : [];

  // Filter threads by current view and search query
  const filteredThreads = useMemo(() => {
    let filtered = threads.filter((t) => t.status === currentView);

    // Assignment axis — exactly one predicate, production's if/else-if chain.
    if (assignmentScope.kind === 'assigned') {
      filtered = filtered.filter((t) => !!t.assignedTo);
    } else if (assignmentScope.kind === 'unassigned') {
      filtered = filtered.filter((t) => !t.assignedTo);
    } else if (assignmentScope.kind === 'department') {
      // TRANSITIVE, as production is: the department itself, OR a user in it.
      filtered = filtered.filter(
        (t) =>
          (t.assignedTo?.type === 'department' && t.assignedTo.id === assignmentScope.id) ||
          (t.assignedTo?.type === 'user' && t.assignedTo.departmentId === assignmentScope.id)
      );
    } else if (assignmentScope.kind === 'user') {
      // Exact match only — never transitive.
      filtered = filtered.filter(
        (t) => t.assignedTo?.type === 'user' && t.assignedTo.id === assignmentScope.id
      );
    }


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

    /* Sort by recency (newest lastMessageAt first) so the most recent thread
       renders at the top — also makes the auto-select-first effect land on it.
       The comparator is the STORE's, shared: the store lands the selection on
       the "top" row after a folder switch / archive / block, and if the two
       sorts ever disagreed that landing would highlight a row in the middle of
       the list. (It did, until QA-1.) */
    return sortByRecency(filtered);
  }, [threads, currentView, searchQuery, assignmentScope]);

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

  /**
   * The compose pane's send. The thread is created HERE rather than on the
   * "To:" field's commit, so a number typed and abandoned never leaves an empty
   * conversation in the inbox — see the gate note in `ComposeHeader`.
   *
   * `createThreadFromPhone` already selects the thread and drops compose mode,
   * so by the time `sendMessage` runs the user is looking at the thread the
   * message lands in.
   *
   * ⚠ It may hand back an EXISTING thread. One number is one SMS conversation,
   * so composing to a number the inbox already carries drops the message into
   * that conversation rather than forking a parallel one — the compose pane
   * closes onto the named thread, message included.
   */
  const handleSendFirstMessage = (phone: string, content: string) => {
    const threadId = createThreadFromPhone(phone);
    if (!threadId) return;
    void sendMessage(threadId, content, 'staff');
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
    <AppLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'conversations' && (
        <div
          className="flex h-full gap-4 min-h-0"
          style={{ paddingLeft: 24, paddingRight: 24, paddingBottom: 24, paddingTop: 16 }}
        >
          {/* Thread List column — 35% of the content row (scales to any width).
              Search + New message are INSIDE the list card now (they scope the
              list, not the page), so this column is one card top to bottom and
              the 16px that used to sit under the old full-width band is now the
              content row's own top padding. */}
          <div
            className="min-w-0 h-full flex flex-col gap-3"
            style={{ flexBasis: '35%', flexGrow: 0, flexShrink: 1 }}
          >
            <div className="flex-1 min-h-0">
              <ThreadList
                threads={filteredThreads}
                selectedThreadId={selectedThreadId}
                onSelectThread={selectThread}
                typingThreadId={typingThreadId}
                header={
                  /* TWO selects, one per axis (frame 2112:26219, the 8/21 design
                     review's swap of 2038:57666). FOLDER takes the slot the
                     "Conversations" card title used to hold — the card is called
                     what it IS, and "Inbox" holds still for a whole shift —
                     while ASSIGNMENT sits right in the blue control register,
                     its label always reporting the live scope. See the
                     arrangement history in ThreadScopeMenu. */
                  <div className="flex items-center justify-between gap-2">
                    <FolderSelect folder={currentView} onFolderChange={setCurrentView} />
                    <AssignmentSelect
                      assignment={assignmentScope}
                      onAssignmentChange={setAssignmentScope}
                    />
                  </div>
                }
                search={
                  <ConversationControls
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onNewMessage={startNewConversation}
                  />
                }
              />
            </div>
          </div>

          {/* Thread View / Compose — 65% of the content row */}
          <div
            className="min-w-0 h-full flex"
            style={{ flexBasis: '65%', flexGrow: 1, flexShrink: 1 }}
          >
            {isComposingNew ? (
              <div
                className="flex-1 min-w-0 overflow-clip rounded-[12px]"
                style={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e5' }}
              >
                <ComposeHeader
                  composingPhoneNumber={composingPhoneNumber}
                  onComposingPhoneChange={updateComposingPhone}
                  onSendFirstMessage={handleSendFirstMessage}
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
                /* The composer pill is the AI AGENT's per-conversation switch —
                   not the demo auto-response simulation, which is the separate
                   global `aiEnabled` still read by handleSendMessage below. */
                aiEnabled={isThreadAiEnabled(selectedThread.id)}
                onAiToggle={() => toggleThreadAi(selectedThread.id)}
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

          {/* Conversation Details — the floating panel + scrim (fixed; out of
              flow). It owns its own navigation, flows and confirm modal; the
              page hands it a thread and a way to close. */}
          {selectedThread && !isComposingNew && (
            <ConversationDetailsPanel
              thread={selectedThread}
              isOpen={isGuestInfoOpen}
              onClose={closeGuestInfo}
            />
          )}
        </div>
      )}

      {activeTab === 'broadcast' && (
        <BroadcastView />
      )}

      {/* ── THE AI LOOP'S SURFACES ───────────────────────────────────────────
          All four mount at the PAGE, not inside the thread card, and all four
          are addressed by message id through the store. They outlive the thing
          that opened them: the explanation must survive a re-render of the feed
          it explains, and a modal parented to a message block would unmount the
          moment that block scrolled out of the list.

          They sit outside the `activeTab` branch on purpose — closing one must
          not depend on which tab you were on when it opened. */}
      <AiExplanationPanel />
      <AiFeedbackModal />
      <CarrierErrorModal />
      <AiToast />

    </AppLayout>
  );
}

/**
 * The surface's ONE toast. Every AI-loop receipt lands here — feedback
 * submitted, a fact added, a draft sent — because a toast is a statement about
 * the whole screen, and three components each owning their own would stack
 * three of them in the same corner.
 */
function AiToast() {
  const toast = useMessagingStore((s) => s.toast);
  const clearToast = useMessagingStore((s) => s.clearToast);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(clearToast, 3000);
    return () => window.clearTimeout(timer);
  }, [toast, clearToast]);

  return <Toast message={toast ?? ''} isOpen={!!toast} variant="success" />;
}
