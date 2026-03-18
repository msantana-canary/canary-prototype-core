'use client';

/**
 * EditorTitleCard
 *
 * Title input card in the message editor.
 * System messages: read-only. Custom messages: editable.
 */

import { CanaryInput, InputSize } from '@canary-ui/components';
import { GuestJourneyMessage, isSystemMessage } from '@/lib/products/guest-journey/types';

interface EditorTitleCardProps {
  message: GuestJourneyMessage;
  onChange: (title: string) => void;
}

export function EditorTitleCard({ message, onChange }: EditorTitleCardProps) {
  const isSystem = isSystemMessage(message.type) && !message.parentId;

  return (
    <div
      style={{
        backgroundColor: '#FFF',
        border: '1px solid #E5E5E5',
        borderRadius: 8,
        padding: 16,
      }}
    >
      <CanaryInput
        label="Title"
        size={InputSize.NORMAL}
        value={message.title}
        onChange={(e) => onChange(e.target.value)}
        isReadonly={isSystem}
      />
    </div>
  );
}
