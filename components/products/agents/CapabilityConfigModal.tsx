'use client';

/**
 * CapabilityConfigModal — Per-capability configuration modals.
 *
 * Opens when clicking the gear icon on a capability card.
 * Only shown for capabilities that have meaningful agent-level config:
 * Messages (channels), Calls (transfers, welcome, SMS), Upsells (offers, approval),
 * Contracts (template, auto-send), Authorizations (form template, verification).
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  CanaryButton,
  CanaryCheckbox,
  CanaryModal,
  CanarySwitch,
  CanarySelect,
  CanaryInput,
  CanaryTextArea,
  ButtonType,
  InputSize,
} from '@canary-ui/components';

// Which capabilities have config
export const CONFIGURABLE_CAPABILITIES = new Set([
  'prod-messages',
  'prod-calls',
  'prod-upsells',
  'prod-contracts',
  'prod-authorizations',
]);

interface CapabilityConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  capabilityId: string;
  capabilityName: string;
}

export default function CapabilityConfigModal({ isOpen, onClose, capabilityId, capabilityName }: CapabilityConfigModalProps) {
  const renderConfig = () => {
    switch (capabilityId) {
      case 'prod-messages':
        return <MessagesConfig />;
      case 'prod-calls':
        return <CallsConfig />;
      case 'prod-upsells':
        return <UpsellsConfig />;
      case 'prod-contracts':
        return <ContractsConfig />;
      case 'prod-authorizations':
        return <AuthorizationsConfig />;
      default:
        return <p style={{ fontSize: 14, color: '#666' }}>No configuration available for this capability.</p>;
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <CanaryModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Configure ${capabilityName}`}
      size="medium"
      closeOnOverlayClick
      footer={
        <div className="flex items-center justify-end gap-2">
          <CanaryButton type={ButtonType.TEXT} onClick={onClose}>
            Cancel
          </CanaryButton>
          <CanaryButton type={ButtonType.PRIMARY} onClick={onClose}>
            Save
          </CanaryButton>
        </div>
      }
    >
      {renderConfig()}
    </CanaryModal>,
    document.body,
  );
}

// ---------------------------------------------------------------------------
// Messages Config — Channel Selection
// ---------------------------------------------------------------------------

const CHANNEL_OPTIONS = [
  { id: 'sms', label: 'SMS' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'booking-com', label: 'Booking.com' },
  { id: 'expedia', label: 'Expedia' },
  { id: 'webchat', label: 'Webchat' },
  { id: 'email', label: 'Email' },
];

function ChannelChip({ label, isSelected, onClick }: { label: string; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 40,
        minWidth: 72,
        padding: '0 16px',
        borderRadius: 120,
        fontSize: 14,
        fontWeight: 500,
        lineHeight: '22px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        border: isSelected ? 'none' : '1px solid #2858C4',
        backgroundColor: isSelected ? '#2858C4' : '#fff',
        color: isSelected ? '#fff' : '#2858C4',
        fontFamily: "var(--font-roboto), 'Roboto', sans-serif",
      }}
    >
      {label}
    </button>
  );
}

function MessagesConfig() {
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(
    new Set(['sms', 'whatsapp', 'webchat'])
  );

  const toggleChannel = (id: string) => {
    setSelectedChannels((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div
        style={{
          border: '1px solid #E5E5E5',
          borderRadius: 8,
          padding: 20,
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 500, color: '#000', margin: '0 0 4px 0' }}>
          Active Channels
        </p>
        <p style={{ fontSize: 14, color: '#666', margin: '0 0 16px 0' }}>
          Select which messaging channels this agent can respond on.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CHANNEL_OPTIONS.map((ch) => (
            <ChannelChip
              key={ch.id}
              label={ch.label}
              isSelected={selectedChannels.has(ch.id)}
              onClick={() => toggleChannel(ch.id)}
            />
          ))}
        </div>
        <p style={{ fontSize: 13, color: '#999', margin: '16px 0 0 0' }}>
          {selectedChannels.size} of {CHANNEL_OPTIONS.length} channels active
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Calls Config — Transfer Categories, Welcome Message, Follow-up SMS
// ---------------------------------------------------------------------------

const TRANSFER_CATEGORIES = [
  { id: 'front-desk', label: 'Front Desk' },
  { id: 'restaurant', label: 'Restaurant' },
  { id: 'bar', label: 'Bar' },
  { id: 'sales', label: 'Sales' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'shuttle', label: 'Shuttle' },
  { id: 'accounting', label: 'Accounting' },
  { id: 'spa', label: 'Spa' },
];

const CALL_SETTINGS = [
  { id: 'follow-up-sms', label: 'Send follow-up SMS after calls' },
  { id: 'push-back-transfer', label: 'Push back on immediate transfer requests' },
  { id: 'use-previous-summaries', label: 'Reference previous call summaries' },
];

function CallsConfig() {
  const [welcomeMessage, setWelcomeMessage] = useState(
    'Thank you for calling {{hotel_name}}. How can I help you today?'
  );
  const [selectedTransfers, setSelectedTransfers] = useState<Set<string>>(
    new Set(['front-desk', 'restaurant', 'sales', 'maintenance'])
  );
  const [selectedSettings, setSelectedSettings] = useState<Set<string>>(
    new Set(['follow-up-sms', 'push-back-transfer'])
  );

  const toggleTransfer = (id: string) => {
    setSelectedTransfers((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSetting = (id: string) => {
    setSelectedSettings((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div
      style={{
        border: '1px solid #E5E5E5',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {/* Welcome Message */}
      <div style={{ padding: 20 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: '#000', margin: '0 0 8px 0' }}>Welcome Message</p>
        <CanaryTextArea
          value={welcomeMessage}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setWelcomeMessage(e.target.value)}
          rows={2}
          placeholder="Welcome message template..."
        />
        <p style={{ fontSize: 12, color: '#999', margin: '4px 0 0 0' }}>
          Variables: {'{{hotel_name}}'}, {'{{time_of_day}}'}, {'{{guest_first_name}}'}
        </p>
      </div>

      <div style={{ height: 1, backgroundColor: '#E5E5E5' }} />

      {/* Transfer Categories */}
      <div style={{ padding: 20 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: '#000', margin: '0 0 4px 0' }}>Transfer Categories</p>
        <p style={{ fontSize: 14, color: '#666', margin: '0 0 16px 0' }}>
          Which departments can this agent transfer calls to?
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {TRANSFER_CATEGORIES.map((cat) => (
            <ChannelChip
              key={cat.id}
              label={cat.label}
              isSelected={selectedTransfers.has(cat.id)}
              onClick={() => toggleTransfer(cat.id)}
            />
          ))}
        </div>
        <p style={{ fontSize: 13, color: '#999', margin: '16px 0 0 0' }}>
          {selectedTransfers.size} of {TRANSFER_CATEGORIES.length} departments enabled
        </p>
      </div>

      <div style={{ height: 1, backgroundColor: '#E5E5E5' }} />

      {/* Call Settings */}
      <div style={{ padding: 20 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: '#000', margin: '0 0 4px 0' }}>Call Settings</p>
        <p style={{ fontSize: 14, color: '#666', margin: '0 0 16px 0' }}>
          Additional behaviors for this agent during and after calls.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CALL_SETTINGS.map((setting) => (
            <ChannelChip
              key={setting.id}
              label={setting.label}
              isSelected={selectedSettings.has(setting.id)}
              onClick={() => toggleSetting(setting.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Upsells Config — Offer Types, Approval Threshold
// ---------------------------------------------------------------------------

const UPSELL_OFFER_TYPES = [
  { id: 'room-upgrade', label: 'Room Upgrade' },
  { id: 'early-checkin', label: 'Early Check-in' },
  { id: 'late-checkout', label: 'Late Checkout' },
  { id: 'amenity-package', label: 'Amenity Package' },
  { id: 'dining-credit', label: 'Dining Credit' },
  { id: 'spa-package', label: 'Spa Package' },
];

function UpsellsConfig() {
  const [approvalThreshold, setApprovalThreshold] = useState('50');
  const [selectedOffers, setSelectedOffers] = useState<Set<string>>(
    new Set(['room-upgrade', 'early-checkin', 'late-checkout'])
  );

  const toggleOffer = (id: string) => {
    setSelectedOffers((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div
      style={{
        border: '1px solid #E5E5E5',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {/* Offer Types */}
      <div style={{ padding: 20 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: '#000', margin: '0 0 4px 0' }}>Available Offer Types</p>
        <p style={{ fontSize: 14, color: '#666', margin: '0 0 16px 0' }}>
          Which upsell types can this agent offer to guests?
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {UPSELL_OFFER_TYPES.map((offer) => (
            <ChannelChip
              key={offer.id}
              label={offer.label}
              isSelected={selectedOffers.has(offer.id)}
              onClick={() => toggleOffer(offer.id)}
            />
          ))}
        </div>
        <p style={{ fontSize: 13, color: '#999', margin: '16px 0 0 0' }}>
          {selectedOffers.size} of {UPSELL_OFFER_TYPES.length} offer types active
        </p>
      </div>

      <div style={{ height: 1, backgroundColor: '#E5E5E5' }} />

      {/* Auto-Approval Threshold */}
      <div style={{ padding: 20 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: '#000', margin: '0 0 8px 0' }}>Auto-Approval Threshold</p>
        <CanaryInput
          size={InputSize.NORMAL}
          value={approvalThreshold}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApprovalThreshold(e.target.value)}
          label="Maximum auto-approve amount ($)"
          helperText="Upsells above this amount require staff approval"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Contracts Config — Template Selection, Auto-Send
// ---------------------------------------------------------------------------

function ContractsConfig() {
  const [template, setTemplate] = useState('standard-event');
  const [autoSend, setAutoSend] = useState(false);
  const [requireReview, setRequireReview] = useState(true);
  const [multiSigner, setMultiSigner] = useState(true);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <CanarySelect
        label="Contract Template"
        size={InputSize.NORMAL}
        value={template}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTemplate(e.target.value)}
        options={[
          { value: 'standard-event', label: 'Standard Event Contract' },
          { value: 'wedding-package', label: 'Wedding Package Agreement' },
          { value: 'corporate-master', label: 'Corporate Master Agreement' },
          { value: 'group-booking', label: 'Group Booking Contract' },
          { value: 'custom', label: 'Custom Template' },
        ]}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        <CanaryCheckbox size="normal" label="Auto-send contracts after proposal acceptance" checked={autoSend} onChange={() => setAutoSend(!autoSend)} />
        <CanaryCheckbox size="normal" label="Require staff review before sending" checked={requireReview} onChange={() => setRequireReview(!requireReview)} />
        <CanaryCheckbox size="normal" label="Enable multi-signer support (e.g., bride + parents)" checked={multiSigner} onChange={() => setMultiSigner(!multiSigner)} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Authorizations Config — Form Template, Verification Settings
// ---------------------------------------------------------------------------

function AuthorizationsConfig() {
  const [formTemplate, setFormTemplate] = useState('v2');
  const [requireId, setRequireId] = useState(true);
  const [requireAmount, setRequireAmount] = useState(true);
  const [genericLink, setGenericLink] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <CanarySelect
        label="Authorization Form Template"
        size={InputSize.NORMAL}
        value={formTemplate}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormTemplate(e.target.value)}
        options={[
          { value: 'v1', label: 'Standard Authorization Form (V1)' },
          { value: 'v2', label: 'Enhanced Authorization Form (V2)' },
          { value: 'voice-booking', label: 'Voice Booking Authorization' },
        ]}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        <CanaryCheckbox size="normal" label="Require ID verification by default" checked={requireId} onChange={() => setRequireId(!requireId)} />
        <CanaryCheckbox size="normal" label="Require amount verification by default" checked={requireAmount} onChange={() => setRequireAmount(!requireAmount)} />
        <CanaryCheckbox size="normal" label="Enable generic link (public, no reservation attached)" checked={genericLink} onChange={() => setGenericLink(!genericLink)} />
      </div>
    </div>
  );
}
