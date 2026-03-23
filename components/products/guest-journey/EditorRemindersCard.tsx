'use client';

/**
 * EditorRemindersCard
 *
 * Reminders section in the message editor.
 * Shows a list of reminder sub-messages with timing, content preview, edit/more actions.
 * "+" button to add new reminders.
 *
 * Matches Figma: node 1:10240 — "Reminders" card with bordered list of reminder items.
 */

import Icon from '@mdi/react';
import {
  mdiPlus,
  mdiPencil,
  mdiDotsHorizontal,
  mdiClockOutline,
} from '@mdi/js';
import {
  CanaryButton,
  CanaryTag,
  TagSize,
  ButtonType,
} from '@canary-ui/components';
import { GuestJourneyMessage } from '@/lib/products/guest-journey/types';
import { useGuestJourneyStore } from '@/lib/products/guest-journey/store';
import { timingToLabel } from '@/lib/products/guest-journey/utils';

interface EditorRemindersCardProps {
  parentMessage: GuestJourneyMessage;
  reminders: GuestJourneyMessage[];
  onEditReminder: (reminderId: string) => void;
}

export function EditorRemindersCard({
  parentMessage,
  reminders,
  onEditReminder,
}: EditorRemindersCardProps) {
  const { createMessage } = useGuestJourneyStore();

  const handleAddReminder = () => {
    const newId = `reminder-${Date.now()}`;
    const isUpsell = parentMessage.type === 'UPSELL';

    const newReminder: GuestJourneyMessage = {
      id: newId,
      title: parentMessage.title,
      type: parentMessage.type,
      stage: parentMessage.stage,
      timing: {
        delta: isUpsell ? '2_DAYS' : 'SAME_DAY',
        direction: parentMessage.timing.direction,
        anchor: parentMessage.timing.anchor,
        sendTime: isUpsell ? '10:00 AM' : '9:00 AM',
      },
      channels: [
        {
          channel: 'sms',
          isEnabled: true,
          body: '',
          language: 'en',
        },
      ],
      isEnabled: false,
      supportedLanguages: ['en'],
      segmentTarget: 'ALL_GUESTS',
      parentId: parentMessage.id,
      parentType: parentMessage.type,
    };

    createMessage(newReminder);
    onEditReminder(newId);
  };
  return (
    <div
      style={{
        backgroundColor: '#FFF',
        border: '1px solid #E5E5E5',
        borderRadius: 8,
        padding: 16,
      }}
    >
      {/* Header: "Reminders" + add button */}
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <h3 style={{ fontSize: 18, fontWeight: 500, color: '#000', margin: 0 }}>
          Reminders
        </h3>
        <CanaryButton
          type={ButtonType.ICON_SECONDARY}
          icon={<Icon path={mdiPlus} size={0.85} />}
          onClick={handleAddReminder}
        />
      </div>

      {/* Description */}
      <p style={{ fontSize: 14, color: '#000', margin: '0 0 8px 0' }}>
        Reminders will not be triggered if guest completed the check-in.
      </p>

      {/* Reminder list */}
      {reminders.length > 0 ? (
        <div
          style={{
            border: '1px solid #E5E5E5',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          {reminders.map((reminder, idx) => {
            const label = timingToLabel(reminder.timing);
            const timingStr = label.lines.join(' ');
            const sendTime = reminder.timing.sendTime ? ` at ${reminder.timing.sendTime}` : '';
            const emailContent = reminder.channels.find((c) => c.channel === 'email');
            const smsContent = reminder.channels.find((c) => c.channel === 'sms');
            const previewContent = emailContent || smsContent || reminder.channels[0];

            return (
              <div
                key={reminder.id}
                style={{
                  padding: 16,
                  borderBottom: idx < reminders.length - 1 ? '1px solid #E5E5E5' : 'none',
                  backgroundColor: '#FFF',
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1" style={{ minWidth: 0 }}>
                    {/* Reminder name + disabled badge */}
                    <div className="flex items-center" style={{ gap: 8, marginBottom: 8 }}>
                      <h4 style={{ fontSize: 16, fontWeight: 500, color: '#000', margin: 0 }}>
                        Reminder {idx + 1}
                      </h4>
                      {!reminder.isEnabled && (
                        <CanaryTag
                          label="disabled"
                          size={TagSize.COMPACT}
                          customColor={{
                            fontColor: '#999',
                            backgroundColor: '#E5E5E5',
                            borderColor: '#999',
                          }}
                        />
                      )}
                    </div>

                    {/* Timing */}
                    <div className="flex items-center" style={{ gap: 4, marginBottom: 8 }}>
                      <Icon path={mdiClockOutline} size={0.75} color="#666" />
                      <span style={{ fontSize: 14, color: '#666' }}>
                        send {timingStr}{sendTime}
                      </span>
                    </div>

                    {/* Content preview */}
                    {previewContent && (
                      <div>
                        <p style={{ fontSize: 12, color: '#666', margin: '0 0 0 0', lineHeight: '18px' }}>
                          Body content
                        </p>
                        <p
                          style={{
                            fontSize: 14,
                            color: '#000',
                            margin: 0,
                            lineHeight: '22px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {previewContent.body}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Edit action */}
                  <div className="flex items-start shrink-0" style={{ marginLeft: 16 }}>
                    <CanaryButton
                      type={ButtonType.ICON_SECONDARY}
                      icon={<Icon path={mdiPencil} size={0.75} />}
                      onClick={() => onEditReminder(reminder.id)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p style={{ fontSize: 14, color: '#999', margin: '8px 0 0 0' }}>
          No reminders configured.
        </p>
      )}
    </div>
  );
}
