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

function MessagesConfig() {
  const [channels, setChannels] = useState({
    sms: true,
    whatsapp: true,
    bookingCom: false,
    expedia: false,
    webchat: true,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 14, color: '#666', margin: 0 }}>
        Select which messaging channels this agent can respond on.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <CanarySwitch label="SMS" checked={channels.sms} onChange={(v: boolean) => setChannels({ ...channels, sms: v })} />
        <CanarySwitch label="WhatsApp" checked={channels.whatsapp} onChange={(v: boolean) => setChannels({ ...channels, whatsapp: v })} />
        <CanarySwitch label="Booking.com" checked={channels.bookingCom} onChange={(v: boolean) => setChannels({ ...channels, bookingCom: v })} />
        <CanarySwitch label="Expedia" checked={channels.expedia} onChange={(v: boolean) => setChannels({ ...channels, expedia: v })} />
        <CanarySwitch label="Webchat" checked={channels.webchat} onChange={(v: boolean) => setChannels({ ...channels, webchat: v })} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Calls Config — Transfer Categories, Welcome Message, Follow-up SMS
// ---------------------------------------------------------------------------

function CallsConfig() {
  const [followUpSms, setFollowUpSms] = useState(true);
  const [pushBackTransfer, setPushBackTransfer] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState(
    'Thank you for calling {{hotel_name}}. How can I help you today?'
  );
  const [transfers, setTransfers] = useState({
    frontDesk: true,
    restaurant: true,
    bar: false,
    sales: true,
    maintenance: true,
    shuttle: false,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
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

      <div>
        <p style={{ fontSize: 14, fontWeight: 500, color: '#000', margin: '0 0 8px 0' }}>Transfer Categories</p>
        <p style={{ fontSize: 13, color: '#666', margin: '0 0 12px 0' }}>
          Which departments can this agent transfer calls to?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <CanarySwitch label="Front Desk" checked={transfers.frontDesk} onChange={(v: boolean) => setTransfers({ ...transfers, frontDesk: v })} />
          <CanarySwitch label="Restaurant" checked={transfers.restaurant} onChange={(v: boolean) => setTransfers({ ...transfers, restaurant: v })} />
          <CanarySwitch label="Bar" checked={transfers.bar} onChange={(v: boolean) => setTransfers({ ...transfers, bar: v })} />
          <CanarySwitch label="Sales" checked={transfers.sales} onChange={(v: boolean) => setTransfers({ ...transfers, sales: v })} />
          <CanarySwitch label="Maintenance" checked={transfers.maintenance} onChange={(v: boolean) => setTransfers({ ...transfers, maintenance: v })} />
          <CanarySwitch label="Shuttle" checked={transfers.shuttle} onChange={(v: boolean) => setTransfers({ ...transfers, shuttle: v })} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <CanarySwitch label="Send follow-up SMS after calls" checked={followUpSms} onChange={setFollowUpSms} />
        <CanarySwitch label="Push back on immediate transfer requests" checked={pushBackTransfer} onChange={setPushBackTransfer} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Upsells Config — Offer Types, Approval Threshold
// ---------------------------------------------------------------------------

function UpsellsConfig() {
  const [approvalThreshold, setApprovalThreshold] = useState('50');
  const [offers, setOffers] = useState({
    roomUpgrade: true,
    earlyCheckIn: true,
    lateCheckout: true,
    amenityPackage: false,
    dining: false,
    spa: false,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <p style={{ fontSize: 14, fontWeight: 500, color: '#000', margin: '0 0 8px 0' }}>Available Offer Types</p>
        <p style={{ fontSize: 13, color: '#666', margin: '0 0 12px 0' }}>
          Which upsell types can this agent offer to guests?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <CanarySwitch label="Room Upgrade" checked={offers.roomUpgrade} onChange={(v: boolean) => setOffers({ ...offers, roomUpgrade: v })} />
          <CanarySwitch label="Early Check-in" checked={offers.earlyCheckIn} onChange={(v: boolean) => setOffers({ ...offers, earlyCheckIn: v })} />
          <CanarySwitch label="Late Checkout" checked={offers.lateCheckout} onChange={(v: boolean) => setOffers({ ...offers, lateCheckout: v })} />
          <CanarySwitch label="Amenity Package" checked={offers.amenityPackage} onChange={(v: boolean) => setOffers({ ...offers, amenityPackage: v })} />
          <CanarySwitch label="Dining Credit" checked={offers.dining} onChange={(v: boolean) => setOffers({ ...offers, dining: v })} />
          <CanarySwitch label="Spa Package" checked={offers.spa} onChange={(v: boolean) => setOffers({ ...offers, spa: v })} />
        </div>
      </div>

      <div>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
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
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <CanarySwitch label="Auto-send contracts after proposal acceptance" checked={autoSend} onChange={setAutoSend} />
        <CanarySwitch label="Require staff review before sending" checked={requireReview} onChange={setRequireReview} />
        <CanarySwitch label="Enable multi-signer support (e.g., bride + parents)" checked={multiSigner} onChange={setMultiSigner} />
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
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
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <CanarySwitch label="Require ID verification by default" checked={requireId} onChange={setRequireId} />
        <CanarySwitch label="Require amount verification by default" checked={requireAmount} onChange={setRequireAmount} />
        <CanarySwitch label="Enable generic link (public, no reservation attached)" checked={genericLink} onChange={setGenericLink} />
      </div>
    </div>
  );
}
