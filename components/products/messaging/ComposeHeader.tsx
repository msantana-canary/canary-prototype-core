'use client';

/**
 * ComposeHeader — new-message compose lives in the THREAD PANE (right side),
 * matching the real product and the vaporware (ThreadView "To:" header), NOT in
 * the thread list. Rendered in the right pane when isComposingNew.
 *
 * Flow: enter a phone number → Enter creates the thread (via createThreadFromPhone),
 * which exits compose mode and opens the new conversation. No message composer is
 * shown here — there is no thread to send into until the number is submitted.
 */

import Icon from '@mdi/react';
import { mdiClose } from '@mdi/js';
import { colors } from '@canary-ui/components';

export function ComposeHeader({
  composingPhoneNumber = '',
  onComposingPhoneChange,
  onCreateThread,
  onCancelComposing,
}: {
  composingPhoneNumber?: string;
  onComposingPhoneChange?: (value: string) => void;
  onCreateThread?: (phone: string) => string | null;
  onCancelComposing?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-white">
      {/* "To:" header — sits in the same slot as the normal thread header while composing */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-base font-medium" style={{ color: colors.colorBlack1 }}>
            To:
          </span>
          <input
            type="text"
            autoFocus
            placeholder="Enter phone number"
            value={composingPhoneNumber}
            onChange={(e) => onComposingPhoneChange?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onCreateThread?.(composingPhoneNumber);
              if (e.key === 'Escape') onCancelComposing?.();
            }}
            className="flex-1 border-0 bg-transparent text-base outline-none placeholder:text-[#999999]"
            style={{ color: colors.colorBlack1 }}
          />
          <button onClick={onCancelComposing} className="rounded p-1 hover:bg-gray-100" aria-label="Cancel">
            <Icon path={mdiClose} size={0.8} color={colors.colorBlack3} />
          </button>
        </div>
      </div>

      {/* Empty body while composing */}
      <div className="flex flex-1 items-center justify-center text-sm" style={{ color: colors.colorBlack4 }}>
        Enter a phone number to start a new conversation
      </div>
    </div>
  );
}
