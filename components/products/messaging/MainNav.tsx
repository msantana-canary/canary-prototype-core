/**
 * MainNav Component
 *
 * Navigation bar below the page header.
 * Contains segmented control for Conversations/Broadcast/AI answers
 * and online hours status.
 */

'use client';

import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiMessageProcessing, mdiVideoInputAntenna, mdiLayersOutline } from '@mdi/js';
import { CanarySelect, InputSize } from '@canary-ui/components';
import { MainNavTab } from '@/lib/products/messaging/broadcast-types';
import { useSpikeStore } from '@/lib/products/team-chat/spike-store';

interface MainNavProps {
  activeTab: MainNavTab;
  onTabChange: (tab: MainNavTab) => void;
}

export function MainNav({ activeTab, onTabChange }: MainNavProps) {
  const [onlineStatus, setOnlineStatus] = useState('online');
  // SPIKE Option D: compact chrome only when a D variant (overlay/gutter) is active.
  const compact = useSpikeStore((s) => s.variant === 'D' || s.variant === 'E');

  const segments = [
    {
      id: 'conversations' as const,
      label: 'Conversations',
      icon: mdiMessageProcessing,
    },
    {
      id: 'broadcast' as const,
      label: 'Broadcast',
      icon: mdiVideoInputAntenna,
    },
    {
      id: 'ai-answers' as const,
      label: 'AI answers',
      icon: mdiLayersOutline,
    },
  ];

  return (
    <div className={compact ? "h-[44px] bg-[#f0f0f0] border-b border-gray-200 px-6 py-1 flex items-center justify-between" : "h-[60px] bg-[#f0f0f0] border-b border-gray-200 px-6 py-2 flex items-center justify-between"}>
      {/* Text Tabs */}
      <div className="flex items-center">
        {segments.map((segment) => {
          const isActive = activeTab === segment.id;
          return (
            <button
              key={segment.id}
              onClick={() => onTabChange(segment.id)}
              className="flex flex-col items-start overflow-clip relative shrink-0 focus:outline-none transition-all duration-200"
            >
              <div className={compact ? "flex gap-1.5 items-center justify-center px-3 py-1 cursor-pointer transition-colors duration-200 hover:bg-black/5 focus-within:bg-black/5" : "flex gap-2 items-center justify-center px-4 py-2 cursor-pointer transition-colors duration-200 hover:bg-black/5 focus-within:bg-black/5"}>
                <Icon
                  path={segment.icon}
                  size={compact ? 0.6 : 0.67}
                  color={isActive ? '#2858c4' : '#333333'}
                />
                <span
                  className="font-medium font-['Roboto',sans-serif] text-center whitespace-nowrap"
                  style={{
                    fontSize: compact ? '13px' : '16px',
                    color: isActive ? '#2858c4' : '#333333',
                    lineHeight: compact ? '18px' : '24px',
                  }}
                >
                  {segment.label}
                </span>
              </div>
              <div
                className="w-full h-1"
                style={{
                  backgroundColor: isActive ? '#2858c4' : 'transparent',
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Online Hours Status */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div
            className="font-['Roboto',sans-serif] whitespace-nowrap"
            style={{
              fontSize: '12px',
              lineHeight: '18px',
              color: '#9f9f9f',
              marginBottom: '0',
            }}
          >
            Online hours:
          </div>
          <div
            className="font-['Roboto',sans-serif] whitespace-nowrap"
            style={{
              fontSize: '12px',
              lineHeight: '18px',
              color: '#9f9f9f',
            }}
          >
            8:00 AM – 11:00 PM EST
          </div>
        </div>
        <div className={compact ? "w-[112px] online-status-wrapper" : "w-[136px] online-status-wrapper"} data-status={onlineStatus}>
          <CanarySelect
            options={[
              { label: 'Online', value: 'online' },
              { label: 'Offline', value: 'offline' },
              { label: 'Away', value: 'away' },
            ]}
            value={onlineStatus}
            onChange={(e) => setOnlineStatus(e.target.value)}
            size={compact ? InputSize.COMPACT : InputSize.NORMAL}
          />
        </div>
      </div>
    </div>
  );
}
