/**
 * ScheduleSendTimeModal — pick when a broadcast goes out.
 *
 * Mirrors production's EditScheduledGroupBroadcastTimeModal.vue: one component
 * serves both "schedule" and "reschedule", switched by a flag. Copy is
 * production's verbatim:
 *
 *   title    "Schedule send time" / "Reschedule send time"
 *   helper   "You can schedule a message to be sent at a later time." /
 *            "Reschedule this message to be sent at a later time."
 *   inputs   date + "Select time", side by side, 50/50
 *   actions  Cancel · Schedule send time (disabled until both are chosen)
 *
 * Behaviour ported from production: 15-minute slots, generated from NOW when the
 * chosen date is today (so a past time is never offered), and changing the date
 * clears the selected time.
 *
 * Built from @canary-ui: CanaryModal · CanaryInputDate · CanarySelect ·
 * CanaryButton.
 */

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  CanaryModal,
  CanaryInputDate,
  CanarySelect,
  CanaryButton,
  ButtonType,
  InputSize,
} from '@canary-ui/components';
import {
  buildTimeOptions,
  isBeforeToday,
  toDateInputValue,
  withExactOption,
} from '@/lib/products/messaging/broadcast-schedule';

interface ScheduleSendTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (sendAt: Date) => void;
  /** Reschedule mode retitles the modal (production keeps the same button label). */
  reschedule?: boolean;
  /** Pre-fills the fields when rescheduling an existing send. */
  initialSendAt?: Date;
}

export function ScheduleSendTimeModal({
  isOpen,
  onClose,
  onConfirm,
  reschedule = false,
  initialSendAt,
}: ScheduleSendTimeModalProps) {
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  // Seed from the existing send time on open; clear otherwise.
  useEffect(() => {
    if (!isOpen) return;
    if (initialSendAt) {
      setScheduledDate(toDateInputValue(initialSendAt));
      setScheduledTime(initialSendAt.toISOString());
    } else {
      setScheduledDate('');
      setScheduledTime('');
    }
  }, [isOpen, initialSendAt]);

  /**
   * The quarter-hour slots, PLUS the pending send time itself when that is not
   * one of them.
   *
   * Reschedule opens on a time somebody already picked — often a seeded one
   * that is not quarter-aligned. Without its own option the native select falls
   * back to displaying the first slot, so the modal contradicted the panel that
   * launched it. See `withExactOption` for why this injects rather than snaps.
   */
  const timeOptions = useMemo(
    () => withExactOption(buildTimeOptions(scheduledDate), scheduledTime),
    [scheduledDate, scheduledTime]
  );

  // Production watches the date and clears the time whenever it changes, so a
  // slot from a different day can never survive.
  const handleDateChange = (date: string) => {
    setScheduledDate(date);
    setScheduledTime('');
  };

  const complete = scheduledDate !== '' && scheduledTime !== '' && !isBeforeToday(scheduledDate);

  const handleConfirm = () => {
    if (!complete) return;
    const sendAt = new Date(scheduledTime);
    if (Number.isNaN(sendAt.getTime())) return;
    onConfirm(sendAt);
  };

  return (
    <CanaryModal
      isOpen={isOpen}
      onClose={onClose}
      title={reschedule ? 'Reschedule send time' : 'Schedule send time'}
      size="small"
      footer={
        <div className="flex justify-end gap-2">
          <CanaryButton type={ButtonType.OUTLINED} onClick={onClose}>
            Cancel
          </CanaryButton>
          <CanaryButton type={ButtonType.PRIMARY} onClick={handleConfirm} isDisabled={!complete}>
            Schedule send time
          </CanaryButton>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="font-['Roboto',sans-serif] text-[14px] leading-[22px]">
          {reschedule
            ? 'Reschedule this message to be sent at a later time.'
            : 'You can schedule a message to be sent at a later time.'}
        </p>

        {/* Date + time, 50/50 — production's `.inputs { display:flex; gap:16px }` */}
        <div className="flex gap-4">
          <div className="flex-1 min-w-0">
            <CanaryInputDate value={scheduledDate} onChange={handleDateChange} />
          </div>
          <div className="flex-1 min-w-0">
            <CanarySelect
              options={timeOptions}
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              placeholder="Select time"
              size={InputSize.NORMAL}
              isDisabled={!scheduledDate}
            />
          </div>
        </div>
      </div>
    </CanaryModal>
  );
}
