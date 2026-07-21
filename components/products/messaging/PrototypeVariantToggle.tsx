/**
 * PrototypeVariantToggle — Messaging Redesign (v4)
 *
 * The repo's "decide-in-the-room" idiom: a small floating control (bottom-right)
 * for flipping a prototype variant live. Recreated for the v4 top-row experiment —
 * one option group, "Top row": FULL (the current search + Filters + New-message
 * layout) vs COMPACT (search sized to the thread-list column, Filters + New
 * message shrunk to 40px icon buttons). Wired to the store's `topRowStyle`.
 */

'use client';

import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiTuneVariant, mdiClose } from '@mdi/js';
import { useMessagingStore } from '@/lib/products/messaging/store';

const OPTIONS: { value: 'full' | 'compact'; label: string; desc: string }[] = [
  { value: 'full', label: 'Full', desc: 'Search fills the row; Filters + New message are full buttons' },
  { value: 'compact', label: 'Compact', desc: 'Search matches the list column; icon-only Filters + New message' },
];

export function PrototypeVariantToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const topRowStyle = useMessagingStore((s) => s.topRowStyle);
  const setTopRowStyle = useMessagingStore((s) => s.setTopRowStyle);

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {isOpen && (
        <div
          className="mb-3 bg-white rounded-xl border border-gray-200 overflow-hidden"
          style={{ width: 280, boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 border-b border-gray-100"
            style={{ backgroundColor: '#1a1a2e' }}
          >
            <span className="font-['Roboto',sans-serif] text-sm font-medium text-white">
              Prototype
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white"
              aria-label="Close prototype controls"
            >
              <Icon path={mdiClose} size={0.67} />
            </button>
          </div>

          <div className="p-4">
            <p className="font-['Roboto',sans-serif] text-[10px] uppercase font-medium text-gray-400 mb-2 tracking-wide">
              Top row
            </p>
            <div className="flex flex-col gap-1.5">
              {OPTIONS.map((opt) => {
                const active = topRowStyle === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTopRowStyle(opt.value)}
                    className="flex items-start gap-3 px-3 py-2 rounded-lg text-left transition-colors"
                    style={{
                      backgroundColor: active ? '#eaeef9' : '#fafafa',
                      border: active ? '1px solid #2858c4' : '1px solid transparent',
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center"
                      style={{ borderColor: active ? '#2858c4' : '#cccccc' }}
                    >
                      {active && (
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2858c4' }} />
                      )}
                    </div>
                    <div>
                      <p className="font-['Roboto',sans-serif] text-xs font-medium text-black">
                        {opt.label}
                      </p>
                      <p className="font-['Roboto',sans-serif] text-[10px] text-gray-500">
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105"
        style={{ backgroundColor: '#1a1a2e' }}
        aria-label="Prototype controls"
      >
        <Icon path={isOpen ? mdiClose : mdiTuneVariant} size={0.83} color="#ffffff" />
      </button>
    </div>
  );
}
