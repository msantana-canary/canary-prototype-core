'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageChannel, ChannelSelectorVariant } from '@/lib/products/messaging/types';
import Icon from '@mdi/react';
import {
  mdiMessageTextOutline,
  mdiWhatsapp,
  mdiEmailOutline,
  mdiChevronDown,
  mdiBedOutline,
  mdiAirplane,
  mdiWeb,
} from '@mdi/js';

interface ChannelSelectorProps {
  variant: ChannelSelectorVariant;
  selectedChannel: MessageChannel | 'all';
  availableChannels: MessageChannel[];
  unreadChannels?: MessageChannel[];
  onChannelChange: (channel: MessageChannel | 'all') => void;
}

const channelConfig: Record<MessageChannel, { label: string; shortLabel: string; icon: string; color: string }> = {
  SMS: { label: 'SMS', shortLabel: 'SMS', icon: mdiMessageTextOutline, color: '#2858c4' },
  WhatsApp: { label: 'WhatsApp', shortLabel: 'WA', icon: mdiWhatsapp, color: '#25D366' },
  Email: { label: 'Email', shortLabel: 'Email', icon: mdiEmailOutline, color: '#EA4335' },
  OTA: { label: 'OTA', shortLabel: 'OTA', icon: mdiBedOutline, color: '#003580' },
  Web: { label: 'Web', shortLabel: 'Web', icon: mdiWeb, color: '#666666' },
};

function PillsVariant({
  selectedChannel,
  availableChannels,
  unreadChannels = [],
  onChannelChange,
}: Omit<ChannelSelectorProps, 'variant'>) {
  const colorBlueDark1 = '#2858c4';
  const colorBlueDark5 = '#eaeef9';

  return (
    <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ backgroundColor: '#f5f5f5' }}>
      {availableChannels.map((channel) => {
        const isSelected = selectedChannel === channel;
        const hasUnread = unreadChannels.includes(channel);
        const config = channelConfig[channel];

        return (
          <button
            key={channel}
            onClick={() => onChannelChange(channel)}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
            style={{
              backgroundColor: isSelected ? '#ffffff' : 'transparent',
              color: isSelected ? colorBlueDark1 : '#666666',
              boxShadow: isSelected ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <Icon path={config.icon} size={0.58} color={isSelected ? colorBlueDark1 : '#999999'} />
            <span className="font-['Roboto',sans-serif]">{config.label}</span>
            {hasUnread && !isSelected && (
              <span
                className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                style={{ backgroundColor: '#f16682' }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function DropdownVariant({
  selectedChannel,
  availableChannels,
  unreadChannels = [],
  onChannelChange,
}: Omit<ChannelSelectorProps, 'variant'>) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const currentConfig = selectedChannel === 'all'
    ? { label: 'All channels', icon: mdiMessageTextOutline, color: '#666666' }
    : channelConfig[selectedChannel];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors hover:bg-gray-50"
        style={{ borderColor: '#e5e5e5' }}
      >
        <Icon path={currentConfig.icon} size={0.58} color={currentConfig.color} />
        <span className="font-['Roboto',sans-serif] text-xs font-medium" style={{ color: '#000000' }}>
          {currentConfig.label}
        </span>
        <Icon path={mdiChevronDown} size={0.58} color="#999999" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 left-0 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[160px]">
          {availableChannels.map((channel) => {
            const config = channelConfig[channel];
            const isSelected = selectedChannel === channel;
            const hasUnread = unreadChannels.includes(channel);

            return (
              <button
                key={channel}
                onClick={() => { onChannelChange(channel); setIsOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                style={{ backgroundColor: isSelected ? '#f5f8ff' : undefined }}
              >
                <Icon path={config.icon} size={0.58} color={config.color} />
                <span
                  className="font-['Roboto',sans-serif] text-xs flex-1"
                  style={{ color: '#000000', fontWeight: isSelected ? 500 : 400 }}
                >
                  {config.label}
                </span>
                {hasUnread && (
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#f16682' }} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function IconTabsVariant({
  selectedChannel,
  availableChannels,
  unreadChannels = [],
  onChannelChange,
}: Omit<ChannelSelectorProps, 'variant'>) {
  const colorBlueDark1 = '#2858c4';

  return (
    <div className="flex items-center gap-0.5">
      {availableChannels.map((channel) => {
        const isSelected = selectedChannel === channel;
        const hasUnread = unreadChannels.includes(channel);
        const config = channelConfig[channel];

        return (
          <button
            key={channel}
            onClick={() => onChannelChange(channel)}
            className="relative flex items-center justify-center w-8 h-8 rounded-md transition-all"
            style={{
              backgroundColor: isSelected ? '#eaeef9' : 'transparent',
            }}
            title={config.label}
          >
            <Icon
              path={config.icon}
              size={0.67}
              color={isSelected ? colorBlueDark1 : '#999999'}
            />
            {hasUnread && !isSelected && (
              <span
                className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: '#f16682' }}
              />
            )}
            {isSelected && (
              <span
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                style={{ backgroundColor: colorBlueDark1 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function ChannelSelector(props: ChannelSelectorProps) {
  switch (props.variant) {
    case 'pills':
      return <PillsVariant {...props} />;
    case 'dropdown':
      return <DropdownVariant {...props} />;
    case 'icon-tabs':
      return <IconTabsVariant {...props} />;
  }
}
