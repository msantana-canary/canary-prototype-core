'use client';

import React from 'react';
import { EmailThread } from '@/lib/products/messaging/types';
import { CanarySelect, InputSize } from '@canary-ui/components';

interface EmailThreadSelectorProps {
  emailThreads: EmailThread[];
  selectedEmailThreadId: string | null;
  onSelect: (emailThreadId: string | null) => void;
}

export function EmailThreadSelector({
  emailThreads,
  selectedEmailThreadId,
  onSelect,
}: EmailThreadSelectorProps) {
  if (emailThreads.length <= 1) return null;

  const options = emailThreads.map((t) => ({
    label: `Re: ${t.subject}`,
    value: t.id,
  }));

  const currentValue = selectedEmailThreadId || emailThreads[0]?.id;

  return (
    <div className="max-w-[320px]">
      <CanarySelect
        options={options}
        value={currentValue}
        onChange={(e) => onSelect(e.target.value)}
        size={InputSize.COMPACT}
      />
    </div>
  );
}
