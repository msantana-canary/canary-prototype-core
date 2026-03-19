/**
 * TransferRulesSettings Component
 *
 * Main settings page for Calls Transfer Rules.
 * Contains all settings sections: Number, Voice, SMS, Booking Link, Forward Numbers, Additional.
 */

'use client';

import React, { useState } from 'react';
import {
  CanaryButton,
  CanaryInput,
  CanaryInputMultiple,
  CanaryTextArea,
  CanarySelect,
  CanarySwitch,
  ButtonType,
  InputSize,
  colors,
} from '@canary-ui/components';
import { useCallsSettingsStore } from '@/lib/products/calls/store';
import { voiceOptions } from '@/lib/products/calls/mock-data';
import { ForwardNumbersTable } from './ForwardNumbersTable';
import { ForwardNumberOverlay } from './ForwardNumberOverlay';


export function TransferRulesSettings() {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  // Get state from store
  const {
    voiceNumber,
    forwardCallNumber,
    bypassNumbers,
    selectedVoice,
    personalizedMessage,
    welcomeMessage,
    sendFollowUpSMS,
    defaultBookingLink,
    bookingLinkMessage,
    pushBackOnImmediateTransfer,
    forwardWithoutSummary,
    setForwardCallNumber,
    setBypassNumbers,
    setSelectedVoice,
    setPersonalizedMessage,
    setWelcomeMessage,
    setSendFollowUpSMS,
    setDefaultBookingLink,
    setBookingLinkMessage,
    setPushBackOnImmediateTransfer,
    setForwardWithoutSummary,
  } = useCallsSettingsStore();


  // Overlay handlers
  const handleAddNew = () => {
    setEditingRuleId(null);
    setIsOverlayOpen(true);
  };

  const handleEditRule = (ruleId: string) => {
    setEditingRuleId(ruleId);
    setIsOverlayOpen(true);
  };

  const handleCloseOverlay = () => {
    setIsOverlayOpen(false);
    setEditingRuleId(null);
  };

  return (
    <div className="relative h-full overflow-hidden">
      {/* Main Content */}
      <div
        className="absolute inset-0 overflow-y-auto"
        style={{ backgroundColor: colors.colorBlack7 }}
      >
        {/* Settings Header */}
        <div
          className="flex items-center justify-between bg-white"
          style={{ padding: '16px 24px', borderBottom: '1px solid #E5E5E5' }}
        >
          <h1 style={{ fontSize: 18, fontWeight: 500, color: '#000', margin: 0 }}>
            Calls Settings
          </h1>
        </div>

        {/* Settings Sections */}
        <div className="p-6 pb-8 flex flex-col gap-4">
          {/* Number Settings */}
          <div className="rounded-lg bg-white p-6">
            <h2
              className="font-['Roboto',sans-serif] font-medium text-[18px] leading-[28px] mb-4"
              style={{ color: colors.colorBlack1 }}
            >
              Number Settings
            </h2>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <CanaryInput
                  label="Voice number"
                  value={voiceNumber}
                  isDisabled
                  size={InputSize.NORMAL}
                />
                <CanaryInput
                  label="Forward call number"
                  value={forwardCallNumber}
                  onChange={(e) => setForwardCallNumber(e.target.value)}
                  size={InputSize.NORMAL}
                />
              </div>

              {/* Bypass Numbers */}
              <CanaryInputMultiple
                label="Bypass numbers"
                values={bypassNumbers}
                onChange={(values) => setBypassNumbers(values)}
                placeholder="Add phone number and press Enter"
                size={InputSize.NORMAL}
              />
            </div>
          </div>

          {/* Voice Settings */}
          <div className="rounded-lg bg-white p-6">
            <h2
              className="font-['Roboto',sans-serif] font-medium text-[18px] leading-[28px] mb-4"
              style={{ color: colors.colorBlack1 }}
            >
              Voice Settings
            </h2>
            <div className="flex flex-col gap-4">
              <CanarySelect
                label="Voice"
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                options={voiceOptions}
                size={InputSize.NORMAL}
              />

              <CanaryTextArea
                label="Personalized message"
                value={personalizedMessage}
                onChange={(e) => setPersonalizedMessage(e.target.value)}
                rows={4}
                size={InputSize.NORMAL}
              />

              <CanaryTextArea
                label="Welcome message"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                rows={4}
                size={InputSize.NORMAL}
              />
            </div>
          </div>

          {/* Send Follow-Up SMS */}
          <div className="rounded-lg bg-white p-6">
            <div className="flex justify-between gap-4">
              <div className="flex-1">
                <h2
                  className="font-['Roboto',sans-serif] font-medium text-[18px] leading-[28px]"
                  style={{ color: colors.colorBlack1 }}
                >
                  Send Follow-Up SMS
                </h2>
                <p
                  className="font-['Roboto',sans-serif] text-[14px] leading-[20px] mt-1"
                  style={{ color: colors.colorBlack1 }}
                >
                  When enabled, a follow-up message will be sent to the guest after the
                  call ends.
                </p>
              </div>
              <div className="flex-shrink-0 pt-1">
                <CanarySwitch
                  checked={sendFollowUpSMS}
                  onChange={() => setSendFollowUpSMS(!sendFollowUpSMS)}
                />
              </div>
            </div>
          </div>

          {/* Booking Link */}
          <div className="rounded-lg bg-white p-6">
            <h2
              className="font-['Roboto',sans-serif] font-medium text-[18px] leading-[28px] mb-4"
              style={{ color: colors.colorBlack1 }}
            >
              Booking link
            </h2>
            <p
              className="font-['Roboto',sans-serif] text-[14px] leading-[20px] mb-4"
              style={{ color: colors.colorBlack1 }}
            >
              Customize the message guests will receive when inviting them to book, and
              add the booking link you&apos;d like them to visit. This helps ensure guests
              are directed to the right place to complete their reservation.
            </p>
            <div className="flex flex-col gap-4">
              <CanaryInput
                label="Default booking link"
                value={defaultBookingLink}
                onChange={(e) => setDefaultBookingLink(e.target.value)}
                size={InputSize.NORMAL}
              />

              <CanaryTextArea
                label="Booking link message"
                value={bookingLinkMessage}
                onChange={(e) => setBookingLinkMessage(e.target.value)}
                rows={4}
                size={InputSize.NORMAL}
              />
            </div>
          </div>

          {/* Forward Numbers */}
          <div className="rounded-lg bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="font-['Roboto',sans-serif] font-medium text-[18px] leading-[28px]"
                style={{ color: colors.colorBlack1 }}
              >
                Forward numbers
              </h2>
              <CanaryButton type={ButtonType.SHADED} onClick={handleAddNew}>
                Add new
              </CanaryButton>
            </div>
            <ForwardNumbersTable onEdit={handleEditRule} />
          </div>

          {/* Additional Settings */}
          <div className="rounded-lg bg-white p-6">
            <h2
              className="font-['Roboto',sans-serif] font-medium text-[18px] leading-[28px] mb-4"
              style={{ color: colors.colorBlack1 }}
            >
              Additional settings
            </h2>
            <div
              className="rounded-lg overflow-hidden"
              style={{ border: `1px solid ${colors.colorBlack6}` }}
            >
              <div
                className="flex items-center p-4"
                style={{ backgroundColor: colors.colorWhite }}
              >
                <span
                  className="flex-1 font-['Roboto',sans-serif] text-[14px] leading-[22px]"
                  style={{ color: colors.colorBlack1 }}
                >
                  Push back on immediate transfer
                </span>
                <div className="flex-shrink-0 ml-4">
                  <CanarySwitch
                    checked={pushBackOnImmediateTransfer}
                    onChange={() =>
                      setPushBackOnImmediateTransfer(!pushBackOnImmediateTransfer)
                    }
                  />
                </div>
              </div>
              <div
                className="flex items-center p-4"
                style={{
                  backgroundColor: colors.colorWhite,
                  borderTop: `1px solid ${colors.colorBlack6}`,
                }}
              >
                <span
                  className="flex-1 font-['Roboto',sans-serif] text-[14px] leading-[22px]"
                  style={{ color: colors.colorBlack1 }}
                >
                  Forward without summary
                </span>
                <div className="flex-shrink-0 ml-4">
                  <CanarySwitch
                    checked={forwardWithoutSummary}
                    onChange={() => setForwardWithoutSummary(!forwardWithoutSummary)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forward Number Overlay */}
      <ForwardNumberOverlay
        isOpen={isOverlayOpen}
        editingRuleId={editingRuleId}
        onClose={handleCloseOverlay}
      />
    </div>
  );
}
