'use client';

/**
 * EditorMessageCard
 *
 * Message card with segment accordion support.
 * - "Add Segment" → shows dropdown to pick from existing segments
 * - Each segment becomes its own accordion section with independent channel content
 * - "All Guests" always at bottom, can't be toggled off
 * - Only one section open at a time (accordion)
 */

import { useState, useCallback } from 'react';
import Icon from '@mdi/react';
import {
  mdiChevronUp,
  mdiChevronDown,
  mdiPlus,
  mdiHelpCircleOutline,
  mdiOpenInNew,
  mdiDotsHorizontal,
} from '@mdi/js';
import {
  CanaryButton,
  CanaryInput,
  CanaryTextArea,
  CanarySelect,
  CanaryTabs,
  CanaryTag,
  CanaryChip,
  CanarySwitch,
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
  MessageSegmentVariant,
  Channel,
  CHANNEL_LABELS,
  ChannelContent,
  Segment,
  WHATSAPP_STATUS_CONFIG,
} from '@/lib/products/guest-journey/types';
import { useGuestJourneyStore } from '@/lib/products/guest-journey/store';

interface EditorMessageCardProps {
  message: GuestJourneyMessage;
  onActiveChannelChange?: (channel: Channel) => void;
  onChannelContentChange: (channel: Channel, updates: Partial<ChannelContent>) => void;
  onChannelToggle: (channel: Channel, enabled: boolean) => void;
  onSegmentVariantsChange?: (variants: MessageSegmentVariant[]) => void;
}

// ── Merge Tags ──────────────────────────────────────────────────────

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
  CHECK_IN: { label: 'Check-in URL', variants: [{ label: 'Button Link', value: '{{guest_url_button}}' }, { label: 'Text Link', value: '{{guest_url}}' }] },
  CHECK_OUT: { label: 'Check-out URL', variants: [{ label: 'Button Link', value: '{{guest_url_button}}' }, { label: 'Text Link', value: '{{guest_url}}' }] },
  UPSELL: { label: 'Upsell URL', variants: [{ label: 'Button Link', value: '{{guest_url_button}}' }, { label: 'Text Link', value: '{{guest_url}}' }] },
  CUSTOM: { label: 'Guest URL', variants: [{ label: 'Button Link', value: '{{guest_url_button}}' }, { label: 'Text Link', value: '{{guest_url}}' }] },
};

function getUrlTag(type: MessageType) { return URL_TAGS[type] || URL_TAGS.CUSTOM; }

const ALL_CHANNELS: Channel[] = ['email', 'sms', 'whatsapp', 'booking', 'expedia'];

// ── Channel Content Section (reusable for each accordion section) ───

function ChannelContentSection({
  channels,
  activeChannel,
  setActiveChannel,
  onChannelContentChange,
  onChannelToggle,
  messageType,
  whatsappStatus,
  supportedLanguages,
  onActiveChannelChange,
}: {
  channels: ChannelContent[];
  activeChannel: Channel;
  setActiveChannel: (ch: Channel) => void;
  onChannelContentChange: (channel: Channel, updates: Partial<ChannelContent>) => void;
  onChannelToggle: (channel: Channel, enabled: boolean) => void;
  messageType: MessageType;
  whatsappStatus?: string;
  supportedLanguages: string[];
  onActiveChannelChange?: (channel: Channel) => void;
}) {
  const [activeField, setActiveField] = useState<'subject' | 'body'>('body');
  const [urlDropdownOpen, setUrlDropdownOpen] = useState(false);
  const [showWaTooltip, setShowWaTooltip] = useState(false);

  const existingContent = channels.find((c) => c.channel === activeChannel);
  const activeContent = existingContent || {
    channel: activeChannel, isEnabled: false, body: '', language: 'en',
  } as ChannelContent;

  const isChannelEnabled = (ch: Channel) => channels.some((c) => c.channel === ch && c.isEnabled);
  const urlTag = getUrlTag(messageType);
  const mergeTags = [...BASE_MERGE_TAGS, ...(activeChannel === 'email' ? [EMAIL_MERGE_TAG] : [])];

  const insertMergeTag = useCallback((tagValue: string) => {
    const content = channels.find((c) => c.channel === activeChannel);
    if (!content) return;
    if (activeField === 'subject' && activeChannel === 'email') {
      onChannelContentChange(activeChannel, { subject: (content.subject || '') + tagValue });
    } else {
      onChannelContentChange(activeChannel, { body: content.body + tagValue });
    }
  }, [activeField, activeChannel, channels, onChannelContentChange]);

  const channelTabs = ALL_CHANNELS.map((ch) => ({
    id: ch, label: CHANNEL_LABELS[ch], content: <></>, checked: isChannelEnabled(ch),
  }));

  return (
    <div style={{ padding: '0 16px 16px 16px' }}>
      <CanaryTabs
        tabs={channelTabs}
        variant="text-checkbox"
        size="compact"
        defaultTab={activeChannel}
        onChange={(tabId) => { setActiveChannel(tabId as Channel); onActiveChannelChange?.(tabId as Channel); }}
        onCheckboxChange={(tabId, checked) => onChannelToggle(tabId as Channel, checked)}
      />

      {activeContent && (
        <div className="flex flex-col" style={{ gap: 16, marginTop: 16 }}>
          {/* WhatsApp approval status */}
          {activeChannel === 'whatsapp' && whatsappStatus && (() => {
            const waConfig = WHATSAPP_STATUS_CONFIG[whatsappStatus as keyof typeof WHATSAPP_STATUS_CONFIG];
            if (!waConfig) return null;
            const tagColor = waConfig.color === 'success' ? TagColor.SUCCESS : waConfig.color === 'error' ? TagColor.ERROR : TagColor.WARNING;
            return (
              <div>
                <p style={{ fontSize: 12, lineHeight: '18px', color: '#666', margin: '0 0 8px 0' }}>WhatsApp approval status</p>
                <div className="flex items-center" style={{ gap: 8 }}>
                  <CanaryTag label={waConfig.label} color={tagColor} variant={TagVariant.OUTLINE} size={TagSize.COMPACT} />
                  <div className="relative inline-flex" onMouseEnter={() => setShowWaTooltip(true)} onMouseLeave={() => setShowWaTooltip(false)}>
                    <Icon path={mdiHelpCircleOutline} size={0.8} color="#999" />
                    {showWaTooltip && (
                      <div style={{ position: 'absolute', left: 28, top: -8, width: 280, fontSize: 14, lineHeight: '20px', color: '#333', backgroundColor: '#fff', border: '1px solid #E5E5E5', borderRadius: 4, padding: '8px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', zIndex: 50, pointerEvents: 'none' }}>
                        {waConfig.tooltip}
                      </div>
                    )}
                  </div>
                  <Icon path={mdiOpenInNew} size={0.8} color="#2858C4" />
                </div>
              </div>
            );
          })()}

          {activeChannel === 'email' && (
            <CanaryInput label="Subject (EN)" size={InputSize.NORMAL} value={activeContent.subject || ''} onChange={(e) => onChannelContentChange(activeChannel, { subject: e.target.value })} onFocus={() => setActiveField('subject')} />
          )}

          <div>
            <CanaryTextArea label={activeChannel === 'email' ? 'Body content (EN)' : 'Content (EN)'} size={InputSize.NORMAL} value={activeContent.body} onChange={(e) => onChannelContentChange(activeChannel, { body: e.target.value })} onFocus={() => setActiveField('body')} />
            {activeChannel === 'whatsapp' && (
              <div style={{ textAlign: 'right', fontSize: 12, color: '#666', marginTop: 4 }}>{activeContent.body.length}/1024</div>
            )}
          </div>

          {/* Merge tags */}
          <div>
            <p style={{ fontSize: 14, color: '#000', margin: '0 0 8px 0' }}>Insert:</p>
            <div className="flex flex-wrap" style={{ gap: 8 }}>
              {mergeTags.map((tag) => (
                <CanaryChip key={tag.value} label={tag.label} size="compact" isRounded onClick={() => insertMergeTag(tag.value)} />
              ))}
              <div className="relative">
                <CanaryChip label={urlTag.label} size="compact" isRounded trailingIcon={<Icon path={mdiChevronDown} size={0.65} />} onClick={() => setUrlDropdownOpen(!urlDropdownOpen)} />
                {urlDropdownOpen && (
                  <div style={{ position: 'absolute', top: 36, left: 0, backgroundColor: '#FFF', border: '1px solid #E5E5E5', borderRadius: 8, padding: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', zIndex: 50, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {urlTag.variants.map((v) => (
                      <CanaryChip key={v.value} label={v.label} size="compact" isRounded onClick={() => { insertMergeTag(v.value); setUrlDropdownOpen(false); }} />
                    ))}
                  </div>
                )}
              </div>
              <CanaryChip label={QR_CODE_TAG.label} size="compact" isRounded onClick={() => insertMergeTag(QR_CODE_TAG.value)} />
            </div>
          </div>

          <CanaryCheckbox label="Customize HTML" size="normal" onChange={() => {}} />
        </div>
      )}

      {!activeContent && (
        <p style={{ fontSize: 14, color: '#999', padding: '16px 0' }}>Enable this channel to add content.</p>
      )}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────

export function EditorMessageCard({
  message,
  onActiveChannelChange,
  onChannelContentChange,
  onChannelToggle,
  onSegmentVariantsChange,
}: EditorMessageCardProps) {
  const segments = useGuestJourneyStore((s) => s.segments);
  const [expandedSection, setExpandedSection] = useState<string>('all-guests');
  const [activeChannel, setActiveChannel] = useState<Channel>(
    message.channels.find((c) => c.isEnabled)?.channel || 'email'
  );
  const [showSegmentPicker, setShowSegmentPicker] = useState(false);

  const variants = message.segmentVariants || [];
  const assignedSegmentIds = variants.map((v) => v.segmentId);
  const availableSegments = segments.filter((s) => !assignedSegmentIds.includes(s.id));

  const addSegment = (segmentId: string) => {
    const newVariant: MessageSegmentVariant = {
      segmentId,
      isEnabled: false,
      channels: [{ channel: 'email', isEnabled: true, subject: '', body: '', language: 'en' }],
    };
    const updated = [...variants, newVariant];
    onSegmentVariantsChange?.(updated);
    setShowSegmentPicker(false);
    setExpandedSection(segmentId);
  };

  const toggleSegmentVariant = (segmentId: string) => {
    const updated = variants.map((v) =>
      v.segmentId === segmentId ? { ...v, isEnabled: !v.isEnabled } : v
    );
    onSegmentVariantsChange?.(updated);
  };

  const removeSegmentVariant = (segmentId: string) => {
    const updated = variants.filter((v) => v.segmentId !== segmentId);
    onSegmentVariantsChange?.(updated);
    if (expandedSection === segmentId) setExpandedSection('all-guests');
  };

  const updateVariantChannel = (segmentId: string, channel: Channel, updates: Partial<ChannelContent>) => {
    const updated = variants.map((v) => {
      if (v.segmentId !== segmentId) return v;
      const exists = v.channels.some((c) => c.channel === channel);
      const channels = exists
        ? v.channels.map((c) => c.channel === channel ? { ...c, ...updates } : c)
        : [...v.channels, { channel, isEnabled: false, body: '', language: 'en', ...updates }];
      return { ...v, channels };
    });
    onSegmentVariantsChange?.(updated);
  };

  const toggleVariantChannel = (segmentId: string, channel: Channel, enabled: boolean) => {
    const updated = variants.map((v) => {
      if (v.segmentId !== segmentId) return v;
      const exists = v.channels.some((c) => c.channel === channel);
      const channels = exists
        ? v.channels.map((c) => c.channel === channel ? { ...c, isEnabled: enabled } : c)
        : [...v.channels, { channel, isEnabled: enabled, body: '', language: 'en' }];
      return { ...v, channels };
    });
    onSegmentVariantsChange?.(updated);
  };

  const getSegmentName = (segmentId: string) => segments.find((s) => s.id === segmentId)?.name || 'Unknown';

  return (
    <div style={{ backgroundColor: '#FFF', border: '1px solid #E5E5E5', borderRadius: 8, padding: 16 }}>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 500, color: '#000', margin: 0 }}>Message</h3>
        <CanaryButton
          type={ButtonType.SHADED}
          size={ButtonSize.COMPACT}
          icon={<Icon path={mdiPlus} size={0.75} />}
          iconPosition={IconPosition.RIGHT}
          onClick={() => setShowSegmentPicker(!showSegmentPicker)}
        >
          Add Segment
        </CanaryButton>
      </div>

      {/* Segment container */}
      <div style={{ border: '1px solid #E5E5E5', borderRadius: 8 }}>
        {/* Segment picker dropdown */}
        {showSegmentPicker && (
          <div style={{ padding: 16, borderBottom: '1px solid #E5E5E5' }}>
            <CanarySelect
              size={InputSize.NORMAL}
              placeholder="Select segment"
              value=""
              options={availableSegments.map((s) => ({ value: s.id, label: s.name }))}
              onChange={(e) => addSegment(e.target.value)}
            />
          </div>
        )}

        {/* Segment variant sections */}
        {variants.map((variant) => {
          const isExpanded = expandedSection === variant.segmentId;
          const segName = getSegmentName(variant.segmentId);

          return (
            <div key={variant.segmentId} style={{ borderBottom: '1px solid #E5E5E5' }}>
              {/* Section header */}
              <div className="flex items-center justify-between" style={{ padding: 16 }}>
                <h4 style={{ fontSize: 16, fontWeight: 500, color: '#000', margin: 0 }}>{segName}</h4>
                <div className="flex items-center" style={{ gap: 4 }}>
                  {isExpanded && (
                    <CanaryButton type={ButtonType.TEXT} size={ButtonSize.COMPACT} onClick={() => {}}>
                      Send Test
                    </CanaryButton>
                  )}
                  <CanarySwitch checked={variant.isEnabled} onChange={() => toggleSegmentVariant(variant.segmentId)} />
                  <CanaryButton
                    type={ButtonType.ICON_SECONDARY}
                    size={ButtonSize.COMPACT}
                    icon={<Icon path={mdiDotsHorizontal} size={0.75} />}
                    onClick={() => removeSegmentVariant(variant.segmentId)}
                  />
                  <CanaryButton
                    type={ButtonType.ICON_SECONDARY}
                    size={ButtonSize.COMPACT}
                    icon={<Icon path={isExpanded ? mdiChevronUp : mdiChevronDown} size={0.85} />}
                    onClick={() => setExpandedSection(isExpanded ? '' : variant.segmentId)}
                  />
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <ChannelContentSection
                  channels={variant.channels}
                  activeChannel={activeChannel}
                  setActiveChannel={(ch) => { setActiveChannel(ch); onActiveChannelChange?.(ch); }}
                  onChannelContentChange={(ch, updates) => updateVariantChannel(variant.segmentId, ch, updates)}
                  onChannelToggle={(ch, enabled) => toggleVariantChannel(variant.segmentId, ch, enabled)}
                  messageType={message.type}
                  whatsappStatus={message.whatsappStatus}
                  supportedLanguages={message.supportedLanguages}
                  onActiveChannelChange={onActiveChannelChange}
                />
              )}
            </div>
          );
        })}

        {/* All Guests section — always at bottom, no toggle */}
        <div>
          <div className="flex items-center justify-between" style={{ padding: 16 }}>
            <h4 style={{ fontSize: 16, fontWeight: 500, color: '#000', margin: 0 }}>All Guests</h4>
            <div className="flex items-center" style={{ gap: 4 }}>
              {expandedSection === 'all-guests' && (
                <CanaryButton type={ButtonType.TEXT} size={ButtonSize.COMPACT} onClick={() => {}}>
                  Send Test
                </CanaryButton>
              )}
              <CanaryButton
                type={ButtonType.ICON_SECONDARY}
                size={ButtonSize.COMPACT}
                icon={<Icon path={expandedSection === 'all-guests' ? mdiChevronUp : mdiChevronDown} size={0.85} />}
                onClick={() => setExpandedSection(expandedSection === 'all-guests' ? '' : 'all-guests')}
              />
            </div>
          </div>

          {expandedSection === 'all-guests' && (
            <ChannelContentSection
              channels={message.channels}
              activeChannel={activeChannel}
              setActiveChannel={(ch) => { setActiveChannel(ch); onActiveChannelChange?.(ch); }}
              onChannelContentChange={onChannelContentChange}
              onChannelToggle={onChannelToggle}
              messageType={message.type}
              whatsappStatus={message.whatsappStatus}
              supportedLanguages={message.supportedLanguages}
              onActiveChannelChange={onActiveChannelChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
