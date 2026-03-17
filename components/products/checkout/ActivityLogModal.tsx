/**
 * ActivityLogModal Component
 *
 * Displays a reverse-chronological list of system and staff events
 * for a checkout submission. Opened via the history button in CheckOutDetailPanel.
 */

'use client';

import React from 'react';
import { CanaryModal, colors } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiAccountOutline } from '@mdi/js';
import { ActivityLogEntry } from '@/lib/products/checkout/types';

interface ActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ActivityLogEntry[];
}

function formatLogTimestamp(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) + ' at ' + date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }) + ' EDT';
}

export function ActivityLogModal({ isOpen, onClose, logs }: ActivityLogModalProps) {
  return (
    <CanaryModal
      isOpen={isOpen}
      onClose={onClose}
      title="Activity Log"
      size="medium"
      closeOnOverlayClick
    >
      <div className="flex flex-col" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {logs.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <span className="text-[14px]" style={{ color: colors.colorBlack4 }}>
              No activity recorded.
            </span>
          </div>
        ) : (
          logs.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3 py-3">
              {/* Gray circle avatar with person icon */}
              <div
                className="shrink-0 flex items-center justify-center rounded-full"
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: colors.colorBlack7,
                }}
              >
                <Icon path={mdiAccountOutline} size={0.7} color={colors.colorBlack4} />
              </div>

              {/* Description + timestamp */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-[14px] leading-snug"
                  style={{ color: colors.colorBlack1 }}
                >
                  {entry.description}
                </p>
                <p
                  className="text-[13px] mt-0.5"
                  style={{ color: colors.colorBlack4 }}
                >
                  {formatLogTimestamp(entry.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </CanaryModal>
  );
}
