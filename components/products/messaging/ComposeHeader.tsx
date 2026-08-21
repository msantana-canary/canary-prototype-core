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
import {
  ButtonSize,
  ButtonType,
  CanaryButton,
  CanaryInput,
  colors,
} from '@canary-ui/components';

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
      {/* "To:" header — sits in the same slot as the normal thread header while
          composing. The hairline was a raw `border-gray-200`; it is the
          `colorBlack6` token now, like every other hairline on this surface. */}
      <div className="bg-white px-6 py-4" style={{ borderBottom: `1px solid ${colors.colorBlack6}` }}>
        <div className="flex items-center gap-2">
          <span className="text-base font-medium" style={{ color: colors.colorBlack1 }}>
            To:
          </span>
          {/* An EMBEDDED field: the header row owns the chrome, so the base has
              to contribute its behaviour and none of its paint. `CanaryInput`
              (not `CanaryInputPhone` — that one adds country formatting this
              flow does not want) spreads `autoFocus` / `placeholder` /
              `onKeyDown` straight onto the native input, so Enter still creates
              the thread and Escape still cancels.
              `.field-chromeless` strips the base's border, its 8px padding, its
              40px height, its white fill and its 2px focus outline — all of
              which are set INLINE by the component, which is why the class does
              it with `!important`. The base already paints text `colorBlack1`;
              only the 16px type and the placeholder grey are ours. */}
          <div className="flex-1 min-w-0">
            <CanaryInput
              autoFocus
              placeholder="Enter phone number"
              value={composingPhoneNumber}
              onChange={(e) => onComposingPhoneChange?.(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onCreateThread?.(composingPhoneNumber);
                if (e.key === 'Escape') onCancelComposing?.();
              }}
              /* `!h-auto` is not in `.field-chromeless`: that class is shared
                 with the composer's textarea, whose autosize writes an INLINE
                 height an `!important` height would silently kill. An input
                 sizes itself with an `h-[40px]` CLASS, so it says so here. */
              className="field-chromeless !h-auto !text-[16px] placeholder:!text-[#999999]"
            />
          </div>
          {/* Cancel. Same neutral 28px/6px icon register as the thread header's
              three actions — it was a ~27px, 4px-radius button with a
              `gray-100` hover, which was the only place on this surface still
              spending a raw Tailwind grey on a wash. The name rides the mdi
              `Icon`'s `title` + a stable `id`; `CanaryButton` has no
              `aria-label`. */}
          <CanaryButton
            type={ButtonType.ICON_SECONDARY}
            size={ButtonSize.COMPACT}
            onClick={onCancelComposing}
            className="icon-btn-neutral icon-btn-28 icon-btn-r6"
            icon={
              <Icon
                path={mdiClose}
                size={0.8}
                color={colors.colorBlack3}
                title="Cancel"
                id="compose-cancel"
              />
            }
          />
        </div>
      </div>

      {/* Empty body while composing */}
      <div className="flex flex-1 items-center justify-center text-sm" style={{ color: colors.colorBlack4 }}>
        Enter a phone number to start a new conversation
      </div>
    </div>
  );
}
