'use client';

/**
 * EditorMessageCard
 *
 * Uses CanaryTabs (text variant) for channel tabs with checkbox icons.
 * Uses CanaryCheckbox for "Customize HTML".
 * Merge tag chips are hand-rolled (no CanaryChip in library) with hover states.
 */

import { useState, useCallback } from 'react';
import Icon from '@mdi/react';
import {
  mdiChevronUp,
  mdiChevronDown,
  mdiPlus,
  mdiCheckboxMarkedOutline,
  mdiCheckboxBlankOutline,
  mdiHelpCircleOutline,
  mdiOpenInNew,
} from '@mdi/js';
import {
  CanaryButton,
  CanaryInput,
  CanaryTextArea,
  CanaryTabs,
  CanaryTag,
  CanaryCheckbox,
  ButtonType,
  ButtonSize,
  TagColor,
  TagVariant,
  TagSize,
  InputSize,
  IconPosition,
} from '@canary-ui/components';
import {
  GuestJourneyMessage,
  MessageType,
  Channel,
  CHANNEL_LABELS,
  ChannelContent,
  WHATSAPP_STATUS_CONFIG,
} from '@/lib/products/guest-journey/types';

interface EditorMessageCardProps {
  message: GuestJourneyMessage;
  onActiveChannelChange?: (channel: Channel) => void;
  onChannelContentChange: (channel: Channel, updates: Partial<ChannelContent>) => void;
  onChannelToggle: (channel: Channel, enabled: boolean) => void;
}

const BASE_MERGE_TAGS: { label: string; value: string }[] = [
  { label: 'Guest Full Name', value: '{{guest_full_name}}' },
  { label: 'Guest Formal Name', value: '{{guest_formal_name}}' },
  { label: 'Guest First Name', value: '{{guest_first_name}}' },
  { label: 'Guest Last Name', value: '{{guest_last_name}}' },
  { label: 'Guest Loyalty', value: '{{guest_loyalty}}' },
  { label: 'Hotel Name', value: '{{hotel_name}}' },
  { label: 'Arrival Date', value: '{{arrival_date}}' },
  { label: 'Departure Date', value: '{{departure_date}}' },
  { label: 'Confirmation ID', value: '{{confirmation_id}}' },
  { label: 'Room Type', value: '{{room_type}}' },
  { label: 'Reservation Amount', value: '{{reservation_amount}}' },
];

const EMAIL_MERGE_TAG = { label: 'Guest Email', value: '{{guest_email}}' };
const QR_CODE_TAG = { label: 'QR Code Image', value: '{{kiosk_qr_lookup_image}}' };

const URL_TAGS: Record<string, { label: string; variants: { label: string; value: string }[] }> = {
  CHECK_IN: {
    label: 'Check-in URL',
    variants: [
      { label: 'Button Link', value: '{{guest_url_button}}' },
      { label: 'Text Link', value: '{{guest_url}}' },
    ],
  },
  CHECK_OUT: {
    label: 'Check-out URL',
    variants: [
      { label: 'Button Link', value: '{{guest_url_button}}' },
      { label: 'Text Link', value: '{{guest_url}}' },
    ],
  },
  UPSELL: {
    label: 'Upsell URL',
    variants: [
      { label: 'Button Link', value: '{{guest_url_button}}' },
      { label: 'Text Link', value: '{{guest_url}}' },
    ],
  },
  CUSTOM: {
    label: 'Guest URL',
    variants: [
      { label: 'Button Link', value: '{{guest_url_button}}' },
      { label: 'Text Link', value: '{{guest_url}}' },
    ],
  },
};

function getUrlTag(type: MessageType) {
  return URL_TAGS[type] || URL_TAGS.CUSTOM;
}

const ALL_CHANNELS: Channel[] = ['email', 'sms', 'whatsapp', 'booking', 'expedia'];

export function EditorMessageCard({
  message,
  onActiveChannelChange,
  onChannelContentChange,
  onChannelToggle,
}: EditorMessageCardProps) {
  const [activeChannel, setActiveChannel] = useState<Channel>(
    message.channels.find((c) => c.isEnabled)?.channel || 'email'
  );
  const [isExpanded, setIsExpanded] = useState(true);
  const [urlDropdownOpen, setUrlDropdownOpen] = useState(false);
  const [showWaTooltip, setShowWaTooltip] = useState(false);
  const [activeField, setActiveField] = useState<'subject' | 'body'>('body');

  // Get or create a virtual content entry for the active channel
  const existingContent = message.channels.find((c) => c.channel === activeChannel);
  const activeContent = existingContent || {
    channel: activeChannel,
    isEnabled: false,
    body: '',
    language: 'en',
    ...(activeChannel === 'email' ? { subject: '' } : {}),
  } as ChannelContent;
  const isChannelEnabled = (ch: Channel) => message.channels.some((c) => c.channel === ch && c.isEnabled);
  const urlTag = getUrlTag(message.type);

  const mergeTags = [
    ...BASE_MERGE_TAGS,
    ...(activeChannel === 'email' ? [EMAIL_MERGE_TAG] : []),
  ];

  const insertMergeTag = useCallback((tagValue: string) => {
    const channel = activeChannel;
    const content = message.channels.find((c) => c.channel === channel);
    if (!content) return;

    if (activeField === 'subject' && channel === 'email') {
      onChannelContentChange(channel, { subject: (content.subject || '') + tagValue });
    } else {
      onChannelContentChange(channel, { body: content.body + tagValue });
    }
  }, [activeField, activeChannel, message.channels, onChannelContentChange]);

  // Build CanaryTabs with checkbox icons per channel
  const channelTabs = ALL_CHANNELS.map((ch) => {
    const enabled = isChannelEnabled(ch);
    return {
      id: ch,
      label: CHANNEL_LABELS[ch],
      content: <></>,
      icon: (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onChannelToggle(ch, !enabled);
          }}
          style={{ display: 'inline-flex', cursor: 'pointer' }}
        >
          <Icon
            path={enabled ? mdiCheckboxMarkedOutline : mdiCheckboxBlankOutline}
            size={0.9}
            color={enabled ? '#2858C4' : '#999'}
          />
        </div>
      ),
    };
  });

  return (
    <div
      style={{
        backgroundColor: '#FFF',
        border: '1px solid #E5E5E5',
        borderRadius: 8,
        padding: 16,
      }}
    >
      {/* Header: "Message" + "Add Segment" */}
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 500, color: '#000', margin: 0 }}>
          Message
        </h3>
        <CanaryButton
          type={ButtonType.SHADED}
          size={ButtonSize.COMPACT}
          icon={<Icon path={mdiPlus} size={0.75} />}
          iconPosition={IconPosition.RIGHT}
          onClick={() => {}}
        >
          Add Segment
        </CanaryButton>
      </div>

      {/* Segment container — "All Guests" */}
      <div
        style={{
          border: '1px solid #E5E5E5',
          borderRadius: 8,
        }}
      >
        {/* Segment header — no divider between header and content */}
        <div
          className="flex items-center justify-between"
          style={{ padding: 16 }}
        >
          <h4 style={{ fontSize: 16, fontWeight: 500, color: '#000', margin: 0 }}>
            All Guests
          </h4>
          <div className="flex items-center" style={{ gap: 4 }}>
            {isExpanded && (
              <CanaryButton type={ButtonType.TEXT} size={ButtonSize.COMPACT} onClick={() => {}}>
                Send Test
              </CanaryButton>
            )}
            <CanaryButton
              type={ButtonType.ICON_SECONDARY}
              size={ButtonSize.COMPACT}
              icon={<Icon path={isExpanded ? mdiChevronUp : mdiChevronDown} size={0.85} />}
              onClick={() => setIsExpanded(!isExpanded)}
            />
          </div>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div style={{ padding: '0 16px 16px 16px' }}>
            {/* Channel tabs — CanaryTabs text variant with checkbox icons */}
            <CanaryTabs
              tabs={channelTabs}
              variant="text"
              size="compact"
              defaultTab={activeChannel}
              onChange={(tabId) => {
                setActiveChannel(tabId as Channel);
                onActiveChannelChange?.(tabId as Channel);
              }}
            />

            {/* Channel content fields — varies by channel */}
            {activeContent && (
              <div className="flex flex-col" style={{ gap: 16, marginTop: 16 }}>
                {/* WhatsApp: approval status badge */}
                {activeChannel === 'whatsapp' && message.whatsappStatus && (() => {
                  const waConfig = WHATSAPP_STATUS_CONFIG[message.whatsappStatus!];
                  const tagColor = waConfig.color === 'success' ? TagColor.SUCCESS
                    : waConfig.color === 'error' ? TagColor.ERROR
                    : TagColor.WARNING;
                  return (
                    <div>
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
                                zIndex: 50,
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

                {/* Email: Subject + Body */}
                {activeChannel === 'email' && (
                  <CanaryInput
                    label="Subject (EN)"
                    size={InputSize.NORMAL}
                    value={activeContent.subject || ''}
                    onChange={(e) =>
                      onChannelContentChange(activeChannel, { subject: e.target.value })
                    }
                    onFocus={() => setActiveField('subject')}
                  />
                )}

                {/* Content textarea — all channels */}
                <div>
                  <CanaryTextArea
                    label={activeChannel === 'email' ? 'Body content (EN)' : 'Content (EN)'}
                    size={InputSize.NORMAL}
                    value={activeContent.body}
                    onChange={(e) =>
                      onChannelContentChange(activeChannel, { body: e.target.value })
                    }
                    onFocus={() => setActiveField('body')}
                  />
                  {/* WhatsApp: character count */}
                  {activeChannel === 'whatsapp' && (
                    <div style={{ textAlign: 'right', fontSize: 12, color: '#666', marginTop: 4 }}>
                      {activeContent.body.length}/1024
                    </div>
                  )}
                </div>

                {/* Merge tags */}
                <div>
                  <p style={{ fontSize: 14, color: '#000', margin: '0 0 8px 0' }}>Insert:</p>
                  <div className="flex flex-wrap" style={{ gap: 8 }}>
                    {mergeTags.map((tag) => (
                      <button
                        key={tag.value}
                        onClick={() => insertMergeTag(tag.value)}
                        className="merge-tag-chip"
                        style={{
                          height: 32,
                          padding: '0 16px',
                          border: '1px solid #2858C4',
                          borderRadius: 120,
                          background: 'none',
                          color: '#2858C4',
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'background-color 0.15s, color 0.15s',
                        }}
                      >
                        {tag.label}
                      </button>
                    ))}

                    {/* URL tag with dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setUrlDropdownOpen(!urlDropdownOpen)}
                        className="flex items-center merge-tag-chip"
                        style={{
                          height: 32,
                          padding: '0 12px 0 16px',
                          border: '1px solid #2858C4',
                          borderRadius: 120,
                          background: 'none',
                          color: '#2858C4',
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: 'pointer',
                          gap: 4,
                          whiteSpace: 'nowrap',
                          transition: 'background-color 0.15s, color 0.15s',
                        }}
                      >
                        {urlTag.label}
                        <Icon path={mdiChevronDown} size={0.65} color="#2858C4" />
                      </button>
                      {urlDropdownOpen && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 36,
                            left: 0,
                            backgroundColor: '#FFF',
                            border: '1px solid #E5E5E5',
                            borderRadius: 8,
                            padding: 8,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                            zIndex: 50,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                          }}
                        >
                          {urlTag.variants.map((v) => (
                            <button
                              key={v.value}
                              onClick={() => {
                                insertMergeTag(v.value);
                                setUrlDropdownOpen(false);
                              }}
                              className="merge-tag-chip"
                              style={{
                                height: 32,
                                padding: '0 16px',
                                border: '1px solid #2858C4',
                                borderRadius: 120,
                                background: 'none',
                                color: '#2858C4',
                                fontSize: 12,
                                fontWeight: 500,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'background-color 0.15s, color 0.15s',
                              }}
                            >
                              {v.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* QR Code Image */}
                    <button
                      onClick={() => insertMergeTag(QR_CODE_TAG.value)}
                      className="merge-tag-chip"
                      style={{
                        height: 32,
                        padding: '0 16px',
                        border: '1px solid #2858C4',
                        borderRadius: 120,
                        background: 'none',
                        color: '#2858C4',
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'background-color 0.15s, color 0.15s',
                      }}
                    >
                      {QR_CODE_TAG.label}
                    </button>
                  </div>
                </div>

                {/* Customize HTML — CanaryCheckbox, normal size */}
                <CanaryCheckbox
                  label="Customize HTML"
                  size="normal"
                  onChange={() => {}}
                />
              </div>
            )}

            {!activeContent && (
              <p style={{ fontSize: 14, color: '#999', padding: '16px 0' }}>
                Enable this channel to add content.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Chip hover styles */}
      <style>{`
        .merge-tag-chip:hover {
          background-color: #2858C4 !important;
          color: #FFF !important;
        }
      `}</style>
    </div>
  );
}
