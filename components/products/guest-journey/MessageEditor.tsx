'use client';

/**
 * MessageEditor
 *
 * Full-page overlay editor for Guest Journey messages.
 * Two-panel layout: left = editor content, right = channel-aware preview.
 * Slides in/out like the check-in detail panel (two-state: shouldRender + animateIn).
 */

import { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiArrowLeft } from '@mdi/js';
import {
  CanaryButton,
  ButtonType,
  ButtonColor,
} from '@canary-ui/components';
import { useGuestJourneyStore } from '@/lib/products/guest-journey/store';
import { isSystemMessage, Channel } from '@/lib/products/guest-journey/types';
import { PhonePreview } from './PhonePreview';
import { EditorTitleCard } from './EditorTitleCard';
import { EditorSendTimeCard } from './EditorSendTimeCard';
import { EditorTranslationsCard } from './EditorTranslationsCard';
import { EditorMessageCard } from './EditorMessageCard';
import { EditorRemindersCard } from './EditorRemindersCard';

interface MessageEditorProps {
  isOpen: boolean;
}

export function MessageEditor({ isOpen }: MessageEditorProps) {
  const {
    messages,
    selectedMessageId,
    isCreatingNew,
    closeEditor,
    openEditor,
    updateMessage,
  } = useGuestJourneyStore();

  const [activePreviewChannel, setActivePreviewChannel] = useState<Channel>('email');
  const [shouldRender, setShouldRender] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  // Two-state animation: mount first, then animate in
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => setAnimateIn(true), 10);
      return () => clearTimeout(timer);
    } else if (shouldRender) {
      setAnimateIn(false);
      const timer = setTimeout(() => setShouldRender(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  const message = selectedMessageId
    ? messages.find((m) => m.id === selectedMessageId)
    : null;

  if (!shouldRender) return null;
  if (!message && !isCreatingNew) return null;

  const isSystem = message ? isSystemMessage(message.type) : false;
  const title = message?.title || 'New Message';

  return (
    <div
      className={`absolute inset-0 flex flex-col bg-white shadow-2xl
        transition-transform duration-500 ease-out
        ${animateIn ? 'translate-x-0' : 'translate-x-full'}`}
      style={{ zIndex: 20 }}
    >
      {/* Header — back arrow + title + Save button */}
      <div
        className="flex items-center justify-between bg-white shrink-0"
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid #E5E5E5',
        }}
      >
        <div className="flex items-center" style={{ gap: 16 }}>
          <CanaryButton
            type={ButtonType.ICON_SECONDARY}
            icon={<Icon path={mdiArrowLeft} size={0.85} />}
            onClick={closeEditor}
          />
          <h1
            style={{
              fontSize: 18,
              fontWeight: 500,
              color: '#000',
              margin: 0,
            }}
          >
            {title}
          </h1>
        </div>
        <div className="flex items-center" style={{ gap: 8 }}>
          {message && !isSystem && !message.parentId && (
            <CanaryButton
              type={ButtonType.PRIMARY}
              color={ButtonColor.DANGER}
              onClick={() => {
                useGuestJourneyStore.getState().deleteMessage(message.id);
                closeEditor();
              }}
            >
              Delete
            </CanaryButton>
          )}
          <CanaryButton
            type={ButtonType.PRIMARY}
            onClick={closeEditor}
          >
            Save
          </CanaryButton>
        </div>
      </div>

      {/* Two-panel content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — editor content */}
        <div
          className="flex-1 overflow-auto"
          style={{
            backgroundColor: '#FAFAFA',
            padding: 24,
          }}
        >
          <div className="flex flex-col" style={{ gap: 16, maxWidth: 662 }}>
            {message && (
              <>
                <EditorTitleCard
                  message={message}
                  onChange={(title) => updateMessage(message.id, { title })}
                />
                <EditorSendTimeCard
                  message={message}
                  onTimingChange={(timingUpdates) =>
                    updateMessage(message.id, {
                      timing: { ...message.timing, ...timingUpdates },
                    })
                  }
                />
                <EditorTranslationsCard message={message} />
                <EditorMessageCard
                  message={message}
                  onActiveChannelChange={setActivePreviewChannel}
                  onChannelContentChange={(channel, updates) => {
                    const exists = message.channels.some((c) => c.channel === channel);
                    let updatedChannels;
                    if (exists) {
                      updatedChannels = message.channels.map((c) =>
                        c.channel === channel ? { ...c, ...updates } : c
                      );
                    } else {
                      updatedChannels = [
                        ...message.channels,
                        { channel, isEnabled: false, body: '', language: 'en', ...updates },
                      ];
                    }
                    updateMessage(message.id, { channels: updatedChannels });
                  }}
                  onChannelToggle={(channel, enabled) => {
                    const exists = message.channels.some((c) => c.channel === channel);
                    let updatedChannels;
                    if (exists) {
                      updatedChannels = message.channels.map((c) =>
                        c.channel === channel ? { ...c, isEnabled: enabled } : c
                      );
                    } else {
                      updatedChannels = [
                        ...message.channels,
                        { channel, isEnabled: enabled, body: '', language: 'en' },
                      ];
                    }
                    updateMessage(message.id, { channels: updatedChannels });
                  }}
                />
                {/* Reminders — only for parent messages, not for reminders themselves */}
                {!message.parentId && (
                  <EditorRemindersCard
                    parentMessage={message}
                    reminders={messages.filter((m) => m.parentId === message.id)}
                    onEditReminder={(reminderId) => {
                      closeEditor();
                      setTimeout(() => openEditor(reminderId), 100);
                    }}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Right panel — preview: flex-1 fills remaining height, overflow-hidden prevents gap */}
        <div
          className="flex-1 flex items-center justify-center overflow-hidden"
          style={{
            backgroundColor: '#F0F0F0',
            borderLeft: '1px solid #E5E5E5',
          }}
        >
          <PhonePreview message={message} activeChannel={activePreviewChannel} />
        </div>
      </div>
    </div>
  );
}
