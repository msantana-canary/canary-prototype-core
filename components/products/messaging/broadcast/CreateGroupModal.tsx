/**
 * CreateGroupModal Component
 *
 * Modal to create a new custom broadcast group.
 * Matches production layout: group title, add-contact row
 * (name + phone + channel dropdown + Add button), upload contacts link.
 */

'use client';

import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiInformationOutline } from '@mdi/js';
import {
  CanaryModal,
  CanaryInput,
  CanaryInputPhone,
  CanarySelect,
  CanaryButton,
  ButtonType,
  InputSize,
} from '@canary-ui/components';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

const channelOptions = [
  { value: 'sms', label: 'SMS' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'apple', label: 'Apple Messages' },
];

export function CreateGroupModal({ isOpen, onClose, onCreate }: CreateGroupModalProps) {
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (name.trim()) {
      onCreate(name.trim());
      setName('');
    }
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  return (
    <CanaryModal
      isOpen={isOpen}
      onClose={handleClose}
      title="New group"
      size="large"
      className="!max-w-[800px]"
      footer={
        <div className="flex items-center justify-between">
          {/* Upload contacts link */}
          <div className="flex items-center gap-1.5">
            <span
              className="font-['Roboto',sans-serif] text-[14px] font-medium cursor-pointer"
              style={{ color: '#2858c4' }}
            >
              Upload contacts
            </span>
            <Icon path={mdiInformationOutline} size={0.67} color="#999999" />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <CanaryButton
              type={ButtonType.OUTLINED}
              onClick={handleClose}
            >
              Cancel
            </CanaryButton>
            <CanaryButton
              type={ButtonType.PRIMARY}
              onClick={handleCreate}
              isDisabled={!name.trim()}
            >
              Save
            </CanaryButton>
          </div>
        </div>
      }
    >
      <div className="py-2 flex flex-col gap-5">
        {/* Group title */}
        <CanaryInput
          label="Group title"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Title"
          size={InputSize.NORMAL}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCreate();
          }}
        />

        {/* Add contact row (decorative) */}
        <div>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <CanaryInput
                label="Add contact"
                placeholder="Full name (Optional)"
                size={InputSize.NORMAL}
              />
            </div>
            <div className="flex-1">
              <CanaryInputPhone
                placeholder="Phone number"
                defaultCountry="US"
                size={InputSize.NORMAL}
              />
            </div>
            <div className="w-[120px]">
              <CanarySelect
                options={channelOptions}
                value="sms"
                onChange={() => {}}
                size={InputSize.NORMAL}
              />
            </div>
            <CanaryButton type={ButtonType.PRIMARY}>
              Add
            </CanaryButton>
          </div>
        </div>
      </div>
    </CanaryModal>
  );
}
