/**
 * NewCheckoutModal Component
 *
 * Modal dialog for creating a new checkout.
 * Contains: Confirmation Number, First/Last name, Date range, Email/Phone.
 */

'use client';

import React, { useState } from 'react';
import {
  CanaryModal,
  CanaryInput,
  CanaryInputDateRange,
  CanaryButton,
  ButtonType,
  InputSize,
  colors,
} from '@canary-ui/components';

interface NewCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewCheckoutModal({ isOpen, onClose }: NewCheckoutModalProps) {
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleClose = () => {
    setConfirmationNumber('');
    setFirstName('');
    setLastName('');
    setStartDate('');
    setEndDate('');
    setEmail('');
    setPhone('');
    onClose();
  };

  return (
    <CanaryModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create new checkout"
      size="medium"
      closeOnOverlayClick
      footer={
        <div className="flex items-center justify-end gap-2">
          <CanaryButton
            type={ButtonType.TEXT}
            onClick={handleClose}
          >
            Cancel
          </CanaryButton>
          <CanaryButton
            type={ButtonType.PRIMARY}
            onClick={handleClose}
          >
            Create
          </CanaryButton>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Confirmation Number */}
        <CanaryInput
          label="Confirmation Number"
          placeholder="Confirmation Number"
          value={confirmationNumber}
          onChange={(e) => setConfirmationNumber(e.target.value)}
          size={InputSize.NORMAL}
        />

        {/* First name / Last name */}
        <div className="flex gap-3">
          <div className="flex-1">
            <CanaryInput
              label="First name"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              size={InputSize.NORMAL}
            />
          </div>
          <div className="flex-1">
            <CanaryInput
              label="Last name"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              size={InputSize.NORMAL}
            />
          </div>
        </div>

        {/* Arrival and departure */}
        <CanaryInputDateRange
          label="Arrival and departure"
          startDate={startDate}
          endDate={endDate}
          onChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
          }}
          size={InputSize.NORMAL}
        />

        {/* Helper text */}
        <p
          className="text-[13px]"
          style={{ color: colors.colorBlack4 }}
        >
          Enter a phone number or email to send guest a checkout link via SMS or email.
        </p>

        {/* Email / Mobile phone */}
        <div className="flex gap-3">
          <div className="flex-1">
            <CanaryInput
              label="Email"
              placeholder="Email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              size={InputSize.NORMAL}
            />
          </div>
          <div className="flex-1">
            <CanaryInput
              label="Mobile phone"
              placeholder="Mobile phone (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              size={InputSize.NORMAL}
            />
          </div>
        </div>
      </div>
    </CanaryModal>
  );
}
