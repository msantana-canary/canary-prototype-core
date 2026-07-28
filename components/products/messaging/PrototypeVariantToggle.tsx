/**
 * PrototypeVariantToggle — Messaging Redesign
 *
 * The repo's "decide-in-the-room" idiom: a small floating control for flipping a
 * prototype variant live. Renders the option group that belongs to the surface
 * you're on:
 *
 *   Conversations — "Top row": FULL (search + Filters + New-message across the
 *                   width) vs COMPACT (sized to the thread-list column, icon-only
 *                   buttons). Wired to `topRowStyle`.
 *   Broadcast     — TWO stacked groups, because two experiments run at once:
 *                   "Left panel" (Baseline / To-strip / Ledger, the step-5
 *                   paradigms) and "Filter modal" (Classic / Builder, step 3).
 *
 * POSITION: bottom-LEFT. Both surfaces put their composer's Send button at the
 * bottom-right of the right-hand card, so a bottom-right FAB sits on top of it —
 * which is exactly what happened on broadcast. Bottom-left can never collide
 * with a Send button on either surface, and needs no per-surface special-casing.
 */

'use client';

import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiTuneVariant, mdiClose } from '@mdi/js';
import { useMessagingStore } from '@/lib/products/messaging/store';
import { useBroadcastStore } from '@/lib/products/messaging/broadcast-store';

const TOP_ROW_OPTIONS: { value: 'full' | 'compact'; label: string; desc: string }[] = [
  { value: 'full', label: 'Full', desc: 'Search fills the row; Filters + New message are full buttons' },
  { value: 'compact', label: 'Compact', desc: 'Search matches the list column; icon-only Filters + New message' },
];

const FILTER_MODAL_OPTIONS: { value: 'classic' | 'builder'; label: string; desc: string }[] = [
  { value: 'classic', label: 'Classic', desc: 'The shipped modal — every attribute at once' },
  { value: 'builder', label: 'Builder', desc: 'Start from a segment, add rules, live match preview' },
];

const LEFT_PANEL_OPTIONS: { value: 'baseline' | 'to-strip' | 'ledger'; label: string; desc: string }[] = [
  { value: 'baseline', label: 'Baseline', desc: 'Audience + recipients side by side (control arm)' },
  { value: 'to-strip', label: 'To-strip', desc: 'Addressing: audience list only; recipients in a To strip' },
  { value: 'ledger', label: 'Ledger', desc: 'Confidence: ledger header over rail + roster' },
];

export function PrototypeVariantToggle({
  surface = 'conversations',
}: {
  surface?: 'conversations' | 'broadcast';
}) {
  const [isOpen, setIsOpen] = useState(false);
  const topRowStyle = useMessagingStore((s) => s.topRowStyle);
  const setTopRowStyle = useMessagingStore((s) => s.setTopRowStyle);
  const filterModalVariant = useBroadcastStore((s) => s.filterModalVariant);
  const setFilterModalVariant = useBroadcastStore((s) => s.setFilterModalVariant);

  const leftPanelVariant = useBroadcastStore((s) => s.leftPanelVariant);
  const setLeftPanelVariant = useBroadcastStore((s) => s.setLeftPanelVariant);

  const isBroadcast = surface === 'broadcast';

  /**
   * One or more option groups per surface. Broadcast carries two live
   * experiments at once — the left-panel paradigm A/B/C and the filter-modal
   * A/B — so they render stacked rather than one replacing the other.
   */
  const groups: {
    label: string;
    options: { value: string; label: string; desc: string }[];
    active: string;
    onSelect: (value: string) => void;
  }[] = isBroadcast
    ? [
        {
          label: 'Left panel',
          options: LEFT_PANEL_OPTIONS,
          active: leftPanelVariant,
          onSelect: (v) => setLeftPanelVariant(v as 'baseline' | 'to-strip' | 'ledger'),
        },
        {
          label: 'Filter modal',
          options: FILTER_MODAL_OPTIONS,
          active: filterModalVariant,
          onSelect: (v) => setFilterModalVariant(v as 'classic' | 'builder'),
        },
      ]
    : [
        {
          label: 'Top row',
          options: TOP_ROW_OPTIONS,
          active: topRowStyle,
          onSelect: (v) => setTopRowStyle(v as 'full' | 'compact'),
        },
      ];

  return (
    <div className="fixed bottom-6 left-6 z-[100]">
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

          <div className="p-4 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
            {groups.map((group) => (
            <div key={group.label}>
            <p className="font-['Roboto',sans-serif] text-[10px] uppercase font-medium text-gray-400 mb-2 tracking-wide">
              {group.label}
            </p>
            <div className="flex flex-col gap-1.5">
              {group.options.map((opt) => {
                const isActive = group.active === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => group.onSelect(opt.value)}
                    className="flex items-start gap-3 px-3 py-2 rounded-lg text-left transition-colors"
                    style={{
                      backgroundColor: isActive ? '#eaeef9' : '#fafafa',
                      border: isActive ? '1px solid #2858c4' : '1px solid transparent',
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center"
                      style={{ borderColor: isActive ? '#2858c4' : '#cccccc' }}
                    >
                      {isActive && (
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
            ))}
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
