/**
 * CallDetailsModal Component
 *
 * Modal for viewing call details including summary and transcript.
 */

'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  CanaryButton,
  CanaryTag,
  CanaryTabs,
  ButtonType,
  TagSize,
  TagVariant,
  colors,
} from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiClose } from '@mdi/js';
import type { CallSummary, CallTerminalState, CallTranscriptEntry } from '@/lib/products/calls/dashboard-types';
import type { Message } from '@/lib/products/messaging/types';
import { formatCallDate } from '@/lib/products/calls/dashboard-mock-data';
import { CallTranscriptBubble } from './CallTranscriptBubble';

interface CallDetailsModalProps {
  call: CallSummary;
  isOpen: boolean;
  onClose: () => void;
}

function getStatusTagColors(state?: CallTerminalState): { backgroundColor: string; fontColor: string } {
  switch (state) {
    case 'transferred':
      return { backgroundColor: colors.colorBlueDark5, fontColor: colors.colorBlueDark1 };
    case 'handled':
      return { backgroundColor: colors.colorLightGreen5, fontColor: colors.colorLightGreen1 };
    case 'failed':
    case 'abandoned':
      return { backgroundColor: colors.colorRed5, fontColor: colors.colorRed1 };
    case 'voicemail':
    case 'blocked':
      return { backgroundColor: colors.colorBlack6, fontColor: colors.colorBlack3 };
    default:
      return { backgroundColor: colors.colorBlack6, fontColor: colors.colorBlack3 };
  }
}

function getStatusLabel(state?: CallTerminalState): string {
  if (!state) return 'IN PROGRESS';
  return state.toUpperCase();
}

function transcriptEntryToMessage(entry: CallTranscriptEntry, index: number, callStartDate: string): Message {
  // Parse the call start date and use entry timestamp to create a proper Date
  const baseDate = new Date(callStartDate);

  return {
    id: `transcript-${index}`,
    threadId: 'call-transcript',
    sender: entry.speaker === 'agent' ? 'ai' : 'guest',
    content: entry.text,
    timestamp: baseDate,
  };
}

export function CallDetailsModal({ call, isOpen, onClose }: CallDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<string>('summary');

  if (!isOpen) return null;

  const callDate = formatCallDate(call.call_start_date);
  const statusColors = getStatusTagColors(call.terminal_state);
  const statusLabel = getStatusLabel(call.terminal_state);
  const callReason = call.call?.forward_category || 'General Inquiry';
  const summary = call.call?.summary || 'No summary available.';
  const transcript = call.transcript || [];

  const tabs = [
    { id: 'summary', label: 'Summary', content: <></> },
    { id: 'additional', label: 'Additional Information', content: <></> },
    { id: 'transcript', label: 'Transcript', content: <></> },
  ];

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: `1px solid ${colors.colorBlack6}` }}
        >
          <h2
            className="font-['Roboto',sans-serif] font-medium text-[18px]"
            style={{ color: colors.colorBlack1 }}
          >
            Call Details
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <Icon path={mdiClose} size={1} color={colors.colorBlack3} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Call Info Section */}
          <div className="flex gap-8 mb-6">
            <div>
              <span
                className="font-['Roboto',sans-serif] text-[12px] block mb-1"
                style={{ color: colors.colorBlack3 }}
              >
                Time of Call
              </span>
              <span
                className="font-['Roboto',sans-serif] text-[14px]"
                style={{ color: colors.colorBlack1 }}
              >
                {callDate}
              </span>
            </div>

            <div>
              <span
                className="font-['Roboto',sans-serif] text-[12px] block mb-1"
                style={{ color: colors.colorBlack3 }}
              >
                Call Status
              </span>
              <CanaryTag
                label={statusLabel}
                size={TagSize.COMPACT}
                variant={TagVariant.FILLED}
                customColor={statusColors}
              />
            </div>

            <div>
              <span
                className="font-['Roboto',sans-serif] text-[12px] block mb-1"
                style={{ color: colors.colorBlack3 }}
              >
                Call Reason
              </span>
              <span
                className="font-['Roboto',sans-serif] text-[14px]"
                style={{ color: colors.colorBlack1 }}
              >
                {callReason}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4">
            <CanaryTabs
              variant="text"
              size="compact"
              tabs={tabs}
              defaultTab={activeTab}
              onChange={(tabId) => setActiveTab(tabId)}
            />
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'summary' && (
              <div
                className="font-['Roboto',sans-serif] text-[14px] leading-[22px]"
                style={{ color: colors.colorBlack1 }}
              >
                {summary}
              </div>
            )}

            {activeTab === 'transcript' && (
              <div className="flex flex-col">
                {transcript.length === 0 ? (
                  <div
                    className="font-['Roboto',sans-serif] text-[14px] text-center py-8"
                    style={{ color: colors.colorBlack3 }}
                  >
                    No transcript available for this call.
                  </div>
                ) : (
                  transcript.map((entry, index) => (
                    <CallTranscriptBubble
                      key={index}
                      message={transcriptEntryToMessage(entry, index, call.call_start_date)}
                    />
                  ))
                )}
              </div>
            )}

            {activeTab === 'additional' && (
              <div>
                {call.answeredQuestions && call.answeredQuestions.length > 0 ? (
                  <div
                    className="rounded-lg overflow-hidden"
                    style={{ border: `1px solid ${colors.colorBlack6}` }}
                  >
                    {call.answeredQuestions.map((qa, index) => (
                      <div
                        key={qa.questionId}
                        className="px-4 py-3"
                        style={{
                          borderTop: index > 0 ? `1px solid ${colors.colorBlack6}` : 'none',
                        }}
                      >
                        <div
                          className="font-['Roboto',sans-serif] text-[10px] font-medium uppercase tracking-wider mb-1"
                          style={{ color: colors.colorBlack3 }}
                        >
                          {qa.question}
                        </div>
                        <div
                          className="font-['Roboto',sans-serif] text-[14px]"
                          style={{ color: colors.colorBlack1 }}
                        >
                          {qa.answer}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="font-['Roboto',sans-serif] text-[14px] text-center py-8"
                    style={{ color: colors.colorBlack3 }}
                  >
                    No additional information gathered for this call.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex justify-end"
          style={{ borderTop: `1px solid ${colors.colorBlack6}` }}
        >
          <CanaryButton type={ButtonType.OUTLINED}>
            Download transcript
          </CanaryButton>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
