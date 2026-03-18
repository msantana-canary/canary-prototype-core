'use client';

/**
 * TimelineCard
 *
 * Message card in the timeline. Matches production exactly.
 *
 * Production specs:
 * - Width: 600px, padding: 24px, border: 1px solid $color-black-6, radius: 8px
 * - Title (h4): 18px/500wt/28px line-height
 * - Disabled: opacity 70%, no content section
 * - Hover: translateX(16px), Selected: bg #EAEEF9 + translateX(16px)
 * - Content section: border 1px solid $color-black-6, radius 8px, padding 16px 16px 8px 16px
 * - Content labels: "Subject (English)", "Body content (English)", "Content (English)"
 * - Content description: 14px, line-height 18px, max-height 90px, 5-line clamp
 * - Info row: reminders → send time → segment, gap 16px
 * - Tag colors: system types = gray, custom = blue tint
 */

import { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiClockOutline,
  mdiRepeat,
  mdiAccountGroupOutline,
  mdiAccountOutline,
  mdiHelpCircleOutline,
  mdiOpenInNew,
} from '@mdi/js';
import {
  CanaryTag,
  CanaryTabs,
  CanarySwitch,
  CanarySelect,
  TagColor,
  TagSize,
  TagVariant,
  InputSize,
} from '@canary-ui/components';
import {
  GuestJourneyMessage,
  MessageType,
  Channel,
  CHANNEL_LABELS,
  getMessageTagLabel,
  isCustomMessageType,
  WHATSAPP_STATUS_CONFIG,
} from '@/lib/products/guest-journey/types';

interface TimelineCardProps {
  message: GuestJourneyMessage;
  isSelected: boolean;
  onSelect: () => void;
  onToggleEnabled: () => void;
}

// Production tag colors: CUSTOM → blue (INFO), system → gray (DARK)
const CUSTOM_TAG_COLOR = {
  fontColor: '#2858C4',
  backgroundColor: '#EAEEF9',
  borderColor: '#93ABE1',
};
const SYSTEM_TAG_COLOR = {
  fontColor: '#2D2D2D',
  backgroundColor: '#EAEAEA',
  borderColor: '#9F9F9F',
};

const LANG_MAP: Record<string, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
};

export function TimelineCard({
  message,
  isSelected,
  onSelect,
  onToggleEnabled,
}: TimelineCardProps) {
  const [showWaTooltip, setShowWaTooltip] = useState(false);
  const [activeChannel, setActiveChannel] = useState<Channel>(
    message.channels.find((c) => c.isEnabled)?.channel || 'email'
  );
  const [selectedLang] = useState('en');

  const enabledChannels = message.channels.filter((c) => c.isEnabled);
  const activeContent = message.channels.find((c) => c.channel === activeChannel);
  const isExpanded = message.isEnabled && enabledChannels.length > 0;
  const isReminder = !!message.parentId;

  const sendTimeLabel = message.timing.sendTime || '';
  const segmentLabel = message.segmentTarget === 'ALL_GUESTS' ? 'All Guests' : 'Multiple segment criteria';
  const segmentIcon = message.segmentTarget === 'ALL_GUESTS' ? mdiAccountGroupOutline : mdiAccountOutline;
  const langLabel = LANG_MAP[selectedLang] || selectedLang;

  // Tag logic: uses parentType for reminders, null = no tag shown
  const tagLabel = getMessageTagLabel(message.type, message.parentType);
  const isCustom = isCustomMessageType(message.type, message.parentType);

  return (
    <div
      onClick={onSelect}
      className="transition-all duration-200 cursor-pointer"
      style={{
        width: 600,
        padding: 24,
        backgroundColor: isSelected ? '#EAEEF9' : '#FFFFFF',
        border: '1px solid #E5E5E5',
        borderRadius: 8,
        opacity: message.isEnabled ? 1 : 0.7,
        transform: isSelected ? 'translateX(16px)' : 'translateX(0)',
        marginBottom: 0,
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.transform = 'translateX(16px)';
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      {/* Message heading — production: flex, align-items center, gap 8px, justify-content space-between */}
      <div className="flex items-center justify-between" style={{ gap: 8 }}>
        <div className="flex items-center" style={{ gap: 8 }}>
          {isReminder && (
            <Icon path={mdiRepeat} size={0.85} color="#000" style={{ width: 20, height: 20 }} />
          )}
          <h4 style={{ fontSize: 18, fontWeight: 500, lineHeight: '28px', color: '#000', margin: 0 }}>
            {message.title}
          </h4>
          {tagLabel && (
            <CanaryTag
              label={tagLabel}
              size={TagSize.COMPACT}
              customColor={isCustom ? CUSTOM_TAG_COLOR : SYSTEM_TAG_COLOR}
            />
          )}
        </div>
        <div onClick={(e) => e.stopPropagation()} style={{ marginLeft: 'auto' }}>
          <CanarySwitch
            checked={message.isEnabled}
            onChange={onToggleEnabled}
          />
        </div>
      </div>

      {/* Details row — production: margin-top 8px, flex-wrap, gap 16px */}
      <div
        className="flex flex-wrap items-center"
        style={{ marginTop: 8, gap: 16, color: '#666', fontSize: 14, lineHeight: '22px' }}
      >
        {message.reminderCount && message.reminderCount > 0 && (
          <div className="flex items-center" style={{ gap: 4 }}>
            <Icon path={mdiRepeat} size={0.85} color="#666" style={{ width: 20, height: 20 }} />
            <span>{message.reminderCount} reminder{message.reminderCount > 1 ? 's' : ''}</span>
          </div>
        )}
        {(sendTimeLabel || message.timing.delta === 'ASAP') && (
          <div className="flex items-center" style={{ gap: 4 }}>
            <Icon path={mdiClockOutline} size={0.85} color="#666" style={{ width: 20, height: 20 }} />
            <span>{message.timing.delta === 'ASAP' && !sendTimeLabel ? 'ASAP' : `send at ${sendTimeLabel}`}</span>
          </div>
        )}
        <div className="flex items-center" style={{ gap: 4 }}>
          <Icon path={segmentIcon} size={0.85} color="#666" style={{ width: 20, height: 20 }} />
          <span>{segmentLabel}</span>
        </div>
      </div>

      {/* Content section — only for enabled messages */}
      {isExpanded && (
        <div
          style={{
            border: '1px solid #E5E5E5',
            borderRadius: 8,
            padding: '16px 16px 8px 16px',
            marginTop: 16,
          }}
        >
          {/* Channel tabs + language selector */}
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: 8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <CanaryTabs
              tabs={enabledChannels.map((ch) => ({
                id: ch.channel,
                label: CHANNEL_LABELS[ch.channel],
                content: <></>,
              }))}
              variant="text"
              size="compact"
              defaultTab={activeChannel}
              onChange={(tabId) => setActiveChannel(tabId as Channel)}
            />
            <div style={{ width: 150, flexShrink: 0 }}>
              <CanarySelect
                value={selectedLang}
                size={InputSize.COMPACT}
                options={message.supportedLanguages.map((lang) => ({
                  value: lang,
                  label: LANG_MAP[lang] || lang,
                }))}
                onChange={() => {}}
              />
            </div>
          </div>

          {/* Content preview */}
          {activeContent && (
            <div>
              {activeContent.channel === 'email' ? (
                // Email: separate Subject + Body content
                <>
                  {activeContent.subject && (
                    <div style={{ marginBottom: 8 }}>
                      <p style={{ fontSize: 12, lineHeight: '18px', color: '#666', margin: '0 0 4px 0' }}>
                        Subject ({langLabel})
                      </p>
                      <div style={{ fontSize: 14, lineHeight: '18px', color: '#000' }}>
                        {activeContent.subject}
                      </div>
                    </div>
                  )}
                  <div style={{ marginBottom: 8 }}>
                    <p style={{ fontSize: 12, lineHeight: '18px', color: '#666', margin: '0 0 4px 0' }}>
                      Body content ({langLabel})
                    </p>
                    <div
                      style={{
                        fontSize: 14,
                        lineHeight: '18px',
                        color: '#000',
                        whiteSpace: 'pre-wrap',
                        display: '-webkit-box',
                        WebkitLineClamp: 5,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxHeight: 90,
                      }}
                    >
                      {activeContent.body}
                    </div>
                  </div>
                </>
              ) : (
                // SMS/WhatsApp: single "Content (English)" section
                <div style={{ marginBottom: 8 }}>
                  {/* WhatsApp approval status badge — driven by whatsappStatus field */}
                  {activeContent.channel === 'whatsapp' && message.whatsappStatus && (() => {
                    const waConfig = WHATSAPP_STATUS_CONFIG[message.whatsappStatus!];
                    const tagColor = waConfig.color === 'success' ? TagColor.SUCCESS
                      : waConfig.color === 'error' ? TagColor.ERROR
                      : TagColor.WARNING;
                    return (
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: 12, lineHeight: '18px', color: '#666', margin: '0 0 8px 0' }}>
                        WhatsApp approval status
                      </p>
                      <div className="flex items-center" style={{ gap: 8 }}>
                        <CanaryTag
                          label={waConfig.label}
                          color={tagColor}
                          variant={TagVariant.OUTLINE}
                          size={TagSize.COMPACT}
                        />
                        <div
                          className="relative inline-flex"
                          onMouseEnter={() => setShowWaTooltip(true)}
                          onMouseLeave={() => setShowWaTooltip(false)}
                        >
                          <Icon path={mdiHelpCircleOutline} size={0.8} color="#999" />
                          {showWaTooltip && (
                            <div
                              style={{
                                position: 'absolute',
                                left: 28,
                                top: -8,
                                width: 280,
                                fontSize: 14,
                                lineHeight: '20px',
                                color: '#333',
                                backgroundColor: '#fff',
                                border: '1px solid #E5E5E5',
                                borderRadius: 4,
                                padding: '8px 12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                                zIndex: 9999,
                                pointerEvents: 'none',
                              }}
                            >
                              {waConfig.tooltip}
                            </div>
                          )}
                        </div>
                        <Icon path={mdiOpenInNew} size={0.8} color="#2858C4" />
                      </div>
                    </div>
                    );
                  })()}
                  <p style={{ fontSize: 12, lineHeight: '18px', color: '#666', margin: '0 0 4px 0' }}>
                    Content ({langLabel})
                  </p>
                  <div
                    style={{
                      fontSize: 14,
                      lineHeight: '18px',
                      color: '#000',
                      whiteSpace: 'pre-wrap',
                      display: '-webkit-box',
                      WebkitLineClamp: 5,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxHeight: 90,
                    }}
                  >
                    {activeContent.body}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
