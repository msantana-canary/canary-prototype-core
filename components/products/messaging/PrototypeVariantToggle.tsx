'use client';

import React, { useState } from 'react';
import { ChannelSelectorVariant, EmailComposerVariant, ChannelSelectorPosition } from '@/lib/products/messaging/types';
import Icon from '@mdi/react';
import { mdiTuneVariant, mdiClose } from '@mdi/js';

interface PrototypeVariantToggleProps {
  channelVariant: ChannelSelectorVariant;
  emailComposerVariant: EmailComposerVariant;
  channelPosition: ChannelSelectorPosition;
  onChannelVariantChange: (v: ChannelSelectorVariant) => void;
  onEmailComposerVariantChange: (v: EmailComposerVariant) => void;
  onChannelPositionChange: (v: ChannelSelectorPosition) => void;
}

const channelOptions: { value: ChannelSelectorVariant; label: string; desc: string }[] = [
  { value: 'pills', label: 'A: Inline Pills', desc: 'Segmented buttons, always visible' },
  { value: 'dropdown', label: 'B: Dropdown', desc: 'Compact select, one click to reveal' },
  { value: 'icon-tabs', label: 'C: Icon Tabs', desc: 'Channel icons, minimal footprint' },
];

const positionOptions: { value: ChannelSelectorPosition; label: string; desc: string }[] = [
  { value: 'below-header', label: 'A: Below Header', desc: 'Own row under guest info' },
  { value: 'above-composer', label: 'B: Above Composer', desc: 'Near the send action' },
];

const composerOptions: { value: EmailComposerVariant; label: string; desc: string }[] = [
  { value: 'inline', label: 'Minimal', desc: 'Same compose area, button changes' },
  { value: 'full', label: 'Rich Compose', desc: 'Taller area with formatting toolbar' },
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
  channelVariant,
  emailComposerVariant,
  channelPosition,
  onChannelVariantChange,
  onEmailComposerVariantChange,
  onChannelPositionChange,
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
              Selector Position
            </p>
            <div className="mb-4">
              <RadioGroup options={positionOptions} value={channelPosition} onChange={onChannelPositionChange} />
            </div>

            <p className="font-['Roboto',sans-serif] text-[10px] uppercase font-medium text-gray-400 mb-2 tracking-wide">
              Selector Style
            </p>
            <div className="mb-4">
              <RadioGroup options={channelOptions} value={channelVariant} onChange={onChannelVariantChange} />
            </div>

            <p className="font-['Roboto',sans-serif] text-[10px] uppercase font-medium text-gray-400 mb-2 tracking-wide">
              Email Composer
            </p>
            <RadioGroup options={composerOptions} value={emailComposerVariant} onChange={onEmailComposerVariantChange} />
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
