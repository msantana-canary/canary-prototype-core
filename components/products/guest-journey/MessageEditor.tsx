'use client';

/**
 * MessageEditor
 *
 * Full-page overlay editor with internal navigation stack (parent ↔ reminder).
 * Two-panel layout: left = editor content, right = channel-aware preview.
 *
 * Transitions:
 * - Outer: slides in/out from right (like check-in detail panel)
 * - Inner: parent cards slide left/fade out, reminder cards slide in from right/fade in
 * - Preview: shows loading spinner briefly during inner transitions
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import Icon from '@mdi/react';
import { mdiArrowLeft, mdiLoading } from '@mdi/js';
import {
  CanaryButton,
  CanaryModal,
  ButtonType,
  ButtonColor,
} from '@canary-ui/components';
import { useGuestJourneyStore } from '@/lib/products/guest-journey/store';
import { isSystemMessage, isDeletable, Channel, GuestJourneyMessage } from '@/lib/products/guest-journey/types';
import { PhonePreview } from './PhonePreview';
import { EditorTitleCard } from './EditorTitleCard';
import { EditorSendTimeCard } from './EditorSendTimeCard';
import { EditorTranslationsCard } from './EditorTranslationsCard';
import { EditorMessageCard } from './EditorMessageCard';
import { EditorRemindersCard } from './EditorRemindersCard';

interface MessageEditorProps {
  isOpen: boolean;
}

// Shared channel content change handler
function handleChannelContentChange(
  message: GuestJourneyMessage,
  channel: Channel,
  updates: Partial<GuestJourneyMessage['channels'][0]>,
  updateMessage: (id: string, updates: Partial<GuestJourneyMessage>) => void,
) {
  const exists = message.channels.some((c) => c.channel === channel);
  const updatedChannels = exists
    ? message.channels.map((c) => (c.channel === channel ? { ...c, ...updates } : c))
    : [...message.channels, { channel, isEnabled: false, body: '', language: 'en', ...updates }];
  updateMessage(message.id, { channels: updatedChannels });
}

function handleChannelToggle(
  message: GuestJourneyMessage,
  channel: Channel,
  enabled: boolean,
  updateMessage: (id: string, updates: Partial<GuestJourneyMessage>) => void,
) {
  const exists = message.channels.some((c) => c.channel === channel);
  const updatedChannels = exists
    ? message.channels.map((c) => (c.channel === channel ? { ...c, isEnabled: enabled } : c))
    : [...message.channels, { channel, isEnabled: enabled, body: '', language: 'en' }];
  updateMessage(message.id, { channels: updatedChannels });
}

export function MessageEditor({ isOpen }: MessageEditorProps) {
  const {
    messages,
    selectedMessageId,
    isCreatingNew,
    closeEditor,
    updateMessage,
  } = useGuestJourneyStore();

  const leftPanelRef = useRef<HTMLDivElement>(null);
  const [activePreviewChannel, setActivePreviewChannel] = useState<Channel>('email');
  const [shouldRender, setShouldRender] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  // Internal navigation: null = parent message, string = reminder ID
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [innerTransition, setInnerTransition] = useState<'idle' | 'exit' | 'enter'>('idle');
  const [navDirection, setNavDirection] = useState<'forward' | 'back'>('forward');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteButtonVisible, setDeleteButtonVisible] = useState(false);

  // Outer slide animation
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setEditingReminderId(null);
      setInnerTransition('idle');
      const timer = setTimeout(() => setAnimateIn(true), 10);
      return () => clearTimeout(timer);
    } else if (shouldRender) {
      setAnimateIn(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setEditingReminderId(null);
        // Clear selectedMessageId after slide-out animation completes
        useGuestJourneyStore.getState().clearSelection();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  // Navigate to reminder (forward: exit left, enter from right)
  const navigateToReminder = useCallback((reminderId: string) => {
    setNavDirection('forward');
    setPreviewLoading(true);
    setInnerTransition('exit');
    setTimeout(() => {
      setEditingReminderId(reminderId);
      setDeleteButtonVisible(true);
      setInnerTransition('enter');
      leftPanelRef.current?.scrollTo({ top: 0 });
      setTimeout(() => {
        setInnerTransition('idle');
        setPreviewLoading(false);
      }, 300);
    }, 250);
  }, []);

  // Navigate back to parent (back: exit right, enter from left)
  const navigateToParent = useCallback(() => {
    setNavDirection('back');
    setPreviewLoading(true);
    setDeleteButtonVisible(false);
    setInnerTransition('exit');
    setTimeout(() => {
      setEditingReminderId(null);
      setInnerTransition('enter');
      leftPanelRef.current?.scrollTo({ top: 0 });
      setTimeout(() => {
        setInnerTransition('idle');
        setPreviewLoading(false);
      }, 300);
    }, 250);
  }, []);

  const parentMessage = selectedMessageId
    ? messages.find((m) => m.id === selectedMessageId)
    : null;

  const activeMessage = editingReminderId
    ? messages.find((m) => m.id === editingReminderId)
    : parentMessage;

  if (!shouldRender) return null;
  if (!activeMessage && !isCreatingNew) return null;

  const isReminder = !!editingReminderId;
  const reminderIndex = isReminder && parentMessage
    ? messages.filter((m) => m.parentId === parentMessage.id).findIndex((m) => m.id === editingReminderId) + 1
    : 0;

  const headerTitle = isReminder
    ? `Reminder ${reminderIndex}`
    : activeMessage?.title || 'New Message';

  const canDelete = activeMessage ? isDeletable(activeMessage) : false;

  // Inner transition CSS classes — direction-aware
  const exitTranslate = navDirection === 'forward' ? '-translate-x-8' : 'translate-x-8';
  const enterAnim = navDirection === 'forward' ? 'animate-inner-enter-forward' : 'animate-inner-enter-back';

  const innerClass = innerTransition === 'exit'
    ? `opacity-0 ${exitTranslate} transition-all duration-250 ease-out`
    : innerTransition === 'enter'
    ? `opacity-0 ${enterAnim}`
    : '';

  return (
    <div
      className={`absolute inset-0 flex flex-col bg-white shadow-2xl
        transition-transform duration-500 ease-out
        ${animateIn ? 'translate-x-0' : 'translate-x-full'}`}
      style={{ zIndex: 20 }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between bg-white shrink-0"
        style={{ padding: '16px 24px', borderBottom: '1px solid #E5E5E5' }}
      >
        <div className="flex items-center" style={{ gap: 16 }}>
          <CanaryButton
            type={ButtonType.ICON_SECONDARY}
            icon={<Icon path={mdiArrowLeft} size={0.85} />}
            onClick={isReminder ? navigateToParent : closeEditor}
          />
          <h1 style={{ fontSize: 18, fontWeight: 500, color: '#000', margin: 0 }}>
            {headerTitle}
          </h1>
        </div>
        <div className="flex items-center" style={{ gap: 8 }}>
          {activeMessage && canDelete && (
            <div
              className={deleteButtonVisible ? 'animate-fade-in' : ''}
              style={{
                transition: 'opacity 0.3s ease-out',
                opacity: isReminder && !deleteButtonVisible ? 0 : 1,
              }}
            >
              <CanaryButton
                type={ButtonType.PRIMARY}
                color={ButtonColor.DANGER}
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete
              </CanaryButton>
            </div>
          )}
          <CanaryButton
            type={ButtonType.PRIMARY}
            onClick={() => {
              useGuestJourneyStore.getState().showToast(isReminder ? 'Reminder saved' : 'Message saved');
              if (isReminder) navigateToParent(); else closeEditor();
            }}
          >
            Save
          </CanaryButton>
        </div>
      </div>

      {/* Two-panel content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div
          ref={leftPanelRef}
          className="flex-1 overflow-auto"
          style={{ backgroundColor: '#FAFAFA', padding: 24 }}
        >
          <div className={`flex flex-col ${innerClass}`} style={{ gap: 16, maxWidth: 662 }}>
            {activeMessage && (
              <>
                {/* Title card — only for parent messages */}
                {!isReminder && (
                  <EditorTitleCard
                    message={activeMessage}
                    onChange={(title) => updateMessage(activeMessage.id, { title })}
                  />
                )}

                <EditorSendTimeCard
                  message={activeMessage}
                  isReminder={isReminder}
                  onTimingChange={(timingUpdates) =>
                    updateMessage(activeMessage.id, {
                      timing: { ...activeMessage.timing, ...timingUpdates },
                    })
                  }
                />
                <EditorTranslationsCard message={activeMessage} />
                <EditorMessageCard
                  message={activeMessage}
                  onActiveChannelChange={setActivePreviewChannel}
                  onChannelContentChange={(channel, updates) =>
                    handleChannelContentChange(activeMessage, channel, updates, updateMessage)
                  }
                  onChannelToggle={(channel, enabled) =>
                    handleChannelToggle(activeMessage, channel, enabled, updateMessage)
                  }
                  onSegmentVariantsChange={(variants) =>
                    updateMessage(activeMessage.id, { segmentVariants: variants })
                  }
                />

                {/* Reminders — only for parent messages that support them */}
                {!isReminder && !activeMessage.parentId && (
                  <EditorRemindersCard
                    parentMessage={activeMessage}
                    reminders={messages.filter((m) => m.parentId === activeMessage.id)}
                    onEditReminder={navigateToReminder}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Right panel — preview */}
        <div
          className="flex-1 flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: '#F0F0F0', borderLeft: '1px solid #E5E5E5' }}
        >
          {previewLoading ? (
            <div
              style={{
                width: 320,
                height: 660,
                backgroundColor: '#FFF',
                borderRadius: 32,
                boxShadow: '0 6px 12px rgba(0,0,0,0.16)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon path={mdiLoading} size={1.5} color="#999" spin />
            </div>
          ) : (
            <PhonePreview message={activeMessage} activeChannel={activePreviewChannel} />
          )}
        </div>
      </div>

      {/* Inner transition animations — direction-aware */}
      <style>{`
        @keyframes innerEnterForward {
          from { opacity: 0; transform: translateX(16px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes innerEnterBack {
          from { opacity: 0; transform: translateX(-16px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-inner-enter-forward {
          animation: innerEnterForward 0.3s ease-out forwards;
        }
        .animate-inner-enter-back {
          animation: innerEnterBack 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>

      {/* Delete confirmation modal */}
      <CanaryModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete message"
        size="small"
      >
        <p style={{ fontSize: 14, color: '#333', margin: '0 0 24px', lineHeight: '1.5' }}>
          Are you sure you want to delete this {isReminder ? 'reminder' : 'message'}? This action cannot be undone. You can always create a new one later.
        </p>
        <div className="flex justify-end" style={{ gap: 8 }}>
          <CanaryButton
            type={ButtonType.OUTLINED}
            onClick={() => setShowDeleteConfirm(false)}
          >
            Cancel
          </CanaryButton>
          <CanaryButton
            type={ButtonType.PRIMARY}
            color={ButtonColor.DANGER}
            onClick={() => {
              if (activeMessage) {
                useGuestJourneyStore.getState().deleteMessage(activeMessage.id);
                useGuestJourneyStore.getState().showToast(isReminder ? 'Reminder deleted' : 'Message deleted');
              }
              setShowDeleteConfirm(false);
              if (isReminder) {
                navigateToParent();
              } else {
                closeEditor();
              }
            }}
          >
            Delete
          </CanaryButton>
        </div>
      </CanaryModal>
    </div>
  );
}
