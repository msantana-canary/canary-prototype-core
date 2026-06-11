'use client';

import React, { useState } from 'react';
import { InboxLayout, EmailViewVariant, ChannelTabMode } from '@/lib/products/messaging/types';
import Icon from '@mdi/react';
import { mdiTuneVariant, mdiClose } from '@mdi/js';

type SearchVariant = 'slide-down' | 'takeover';

interface PrototypeVariantToggleProps {
  inboxLayout: InboxLayout;
  onInboxLayoutChange: (v: InboxLayout) => void;
  searchVariant: SearchVariant;
  onSearchVariantChange: (v: SearchVariant) => void;
  emailViewVariant: EmailViewVariant;
  onEmailViewVariantChange: (v: EmailViewVariant) => void;
  channelTabMode: ChannelTabMode;
  onChannelTabModeChange: (v: ChannelTabMode) => void;
}

const layoutOptions: { value: InboxLayout; label: string; desc: string }[] = [
  { value: 'standard', label: 'Standard', desc: 'Full-width SubNav bar (current production)' },
  { value: 'compact', label: 'Compact', desc: 'Controls above thread list, more vertical space' },
];

const searchOptions: { value: SearchVariant; label: string; desc: string }[] = [
  { value: 'slide-down', label: 'Slide Down', desc: 'Search bar appears below controls' },
  { value: 'takeover', label: 'Takeover', desc: 'Search replaces Row 1 controls' },
];

// Unified was cut after the 2026-06-10 group review ("Unified sux so get it out")
// — code stays dormant, just unreachable from this panel.
const emailViewOptions: { value: EmailViewVariant; label: string; desc: string }[] = [
  { value: 'dropdown', label: 'Dropdown', desc: 'CanarySelect below Email tab switches threads' },
  { value: 'dropdown-rich', label: 'Dropdown rich', desc: 'Select-style trigger, opens to List-style rows (preview + unread dots)' },
  { value: 'list', label: 'List', desc: 'Email tab opens to a thread list, click to drill in' },
];

const channelTabOptions: { value: ChannelTabMode; label: string; desc: string }[] = [
  { value: 'channels', label: 'Per-channel', desc: 'SMS / WhatsApp / Email / OTA tabs' },
  { value: 'two-tab', label: 'Two-tab', desc: 'Messages + Email; non-email channels interleaved chronologically' },
];

function RadioGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; desc: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="flex items-start gap-3 px-3 py-2 rounded-lg text-left transition-colors"
          style={{
            backgroundColor: value === opt.value ? '#eaeef9' : '#fafafa',
            border: value === opt.value ? '1px solid #2858c4' : '1px solid transparent',
          }}
        >
          <div
            className="w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center"
            style={{ borderColor: value === opt.value ? '#2858c4' : '#cccccc' }}
          >
            {value === opt.value && (
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2858c4' }} />
            )}
          </div>
          <div>
            <p className="font-['Roboto',sans-serif] text-xs font-medium text-black">{opt.label}</p>
            <p className="font-['Roboto',sans-serif] text-[10px] text-gray-500">{opt.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

export function PrototypeVariantToggle({
  inboxLayout,
  onInboxLayoutChange,
  searchVariant,
  onSearchVariantChange,
  emailViewVariant,
  onEmailViewVariantChange,
  channelTabMode,
  onChannelTabModeChange,
}: PrototypeVariantToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {isOpen && (
        <div
          className="mb-3 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden max-h-[80vh] overflow-y-auto"
          style={{ width: 320 }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 sticky top-0" style={{ backgroundColor: '#1a1a2e' }}>
            <span className="font-['Roboto',sans-serif] text-sm font-medium text-white">
              Prototype Variants
            </span>
            <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white">
              <Icon path={mdiClose} size={0.67} />
            </button>
          </div>

          <div className="p-4">
            <p className="font-['Roboto',sans-serif] text-[10px] uppercase font-medium text-gray-400 mb-2 tracking-wide">
              Inbox Layout
            </p>
            <div className="mb-4">
              <RadioGroup options={layoutOptions} value={inboxLayout} onChange={onInboxLayoutChange} />
            </div>

            {inboxLayout === 'compact' && (
              <>
                <p className="font-['Roboto',sans-serif] text-[10px] uppercase font-medium text-gray-400 mb-2 tracking-wide">
                  Search Behavior
                </p>
                <div className="mb-4">
                  <RadioGroup options={searchOptions} value={searchVariant} onChange={onSearchVariantChange} />
                </div>
              </>
            )}

            <p className="font-['Roboto',sans-serif] text-[10px] uppercase font-medium text-gray-400 mb-2 tracking-wide">
              Channel Tabs
            </p>
            <div className="mb-4">
              <RadioGroup options={channelTabOptions} value={channelTabMode} onChange={onChannelTabModeChange} />
            </div>

            <p className="font-['Roboto',sans-serif] text-[10px] uppercase font-medium text-gray-400 mb-2 tracking-wide">
              Email View
            </p>
            <RadioGroup options={emailViewOptions} value={emailViewVariant} onChange={onEmailViewVariantChange} />
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105"
        style={{ backgroundColor: '#1a1a2e' }}
      >
        <Icon path={isOpen ? mdiClose : mdiTuneVariant} size={0.83} color="#ffffff" />
      </button>
    </div>
  );
}
