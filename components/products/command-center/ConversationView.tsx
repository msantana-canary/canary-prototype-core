'use client';

import React, { useRef, useEffect, useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiSendOutline,
  mdiRobotOutline,
  mdiCheckCircleOutline,
  mdiMessageTextOutline,
  mdiWhatsapp,
  mdiEmailOutline,
  mdiEarth,
  mdiWeb,
} from '@mdi/js';
import { CommandCenterThread, CommandCenterMessage, SuggestedAction } from '@/lib/products/command-center/types';
import { guests } from '@/lib/core/data/guests';
import { reservations } from '@/lib/core/data/reservations';
import { format } from 'date-fns';
import { CanaryButton, ButtonType, ButtonSize, ButtonColor } from '@canary-ui/components';
import { MessageChannel } from '@/lib/products/messaging/types';

const channelIcons: Record<MessageChannel, string> = {
  'SMS': mdiMessageTextOutline,
  'WhatsApp': mdiWhatsapp,
  'Email': mdiEmailOutline,
  'Booking.com': mdiEarth,
  'Expedia': mdiEarth,
  'Web': mdiWeb,
};

interface ConversationViewProps {
  thread: CommandCenterThread;
  messages: CommandCenterMessage[];
  onSendMessage: (content: string) => void;
  onMarkAsDone: () => void;
}

export function ConversationView({ thread, messages, onSendMessage, onMarkAsDone }: ConversationViewProps) {
  const guest = guests[thread.guestId];
  const reservation = reservations[thread.reservationId];
  const feedRef = useRef<HTMLDivElement>(null);
  const [composerText, setComposerText] = useState('');

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!composerText.trim()) return;
    onSendMessage(composerText.trim());
    setComposerText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!guest) return null;

  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      {/* Thread header */}
      <div className="h-[56px] px-4 border-b border-gray-200 flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-3">
          {guest.avatar ? (
            <img src={guest.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
              {guest.initials}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-semibold text-gray-900">{guest.name}</span>
              {guest.statusTag && (
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase"
                  style={{ backgroundColor: guest.statusTag.color, color: guest.statusTag.textColor || 'white' }}
                >
                  {guest.statusTag.label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <Icon path={channelIcons[thread.channel]} size={0.5} />
              <span>{thread.channel}</span>
              {reservation?.room && (
                <>
                  <span>•</span>
                  <span>Rm {reservation.room}</span>
                </>
              )}
              {reservation && (
                <>
                  <span>•</span>
                  <span>{reservation.checkInDate} – {reservation.checkOutDate}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <CanaryButton
          type={ButtonType.PRIMARY}
          size={ButtonSize.COMPACT}
          onClick={onMarkAsDone}
          icon={<Icon path={mdiCheckCircleOutline} size={0.7} />}
        >
          Mark as done
        </CanaryButton>
      </div>

      {/* AI Summary banner */}
      {thread.aiSummary && (
        <div className="mx-4 mt-3 px-3.5 py-2.5 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2.5">
          <Icon path={mdiRobotOutline} size={0.65} className="text-blue-500 mt-0.5 shrink-0" />
          <div>
            <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wide">AI Summary</span>
            <p className="text-[12px] text-blue-800 mt-0.5 leading-relaxed">{thread.aiSummary}</p>
          </div>
        </div>
      )}

      {/* Message feed */}
      <div ref={feedRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg) => {
          if (msg.sender === 'system') {
            return (
              <div key={msg.id} className="flex justify-center">
                <span className="text-[11px] text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                  {msg.content}
                </span>
              </div>
            );
          }

          const isStaff = msg.sender === 'staff';
          const isAI = msg.sender === 'ai';

          return (
            <div key={msg.id} className={`flex ${isStaff ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] ${isStaff ? 'order-1' : ''}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-medium text-gray-500 uppercase">
                    {isStaff ? 'You' : isAI ? 'Canary AI' : guest.name.split(' ')[0]}
                  </span>
                  {isAI && <Icon path={mdiRobotOutline} size={0.45} className="text-blue-400" />}
                  <span className="text-[10px] text-gray-400">
                    {format(msg.timestamp, 'h:mm a')}
                  </span>
                </div>
                <div
                  className={`px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed ${
                    isStaff
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : isAI
                        ? 'bg-blue-50 text-gray-800 border border-blue-100 rounded-bl-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Suggested actions */}
      {thread.suggestedActions && thread.suggestedActions.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100 bg-amber-50/50 flex items-center gap-2">
          <Icon path={mdiRobotOutline} size={0.6} className="text-amber-600 shrink-0" />
          <span className="text-[11px] text-amber-700 font-medium shrink-0">AI suggests:</span>
          <div className="flex gap-2 overflow-x-auto">
            {thread.suggestedActions.map((action: SuggestedAction, i: number) => (
              <button
                key={i}
                className="text-[11px] font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-md whitespace-nowrap transition-colors"
                title={action.description}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Composer */}
      <div className="px-4 py-3 border-t border-gray-200 bg-white shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            value={composerText}
            onChange={(e) => setComposerText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Reply via ${thread.channel}...`}
            rows={1}
            className="flex-1 resize-none px-3.5 py-2.5 text-[13px] rounded-xl border border-gray-200 focus:border-blue-400 focus:outline-none transition-colors bg-gray-50 focus:bg-white placeholder:text-gray-400"
          />
          <button
            onClick={handleSend}
            disabled={!composerText.trim()}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
              composerText.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            <Icon path={mdiSendOutline} size={0.75} />
          </button>
        </div>
      </div>
    </div>
  );
}
