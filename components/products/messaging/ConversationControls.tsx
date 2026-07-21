/**
 * ConversationControls — the search + Filters + New-message row for the
 * Conversations tab, shared between BOTH top-row placements:
 *
 *  - FULL mode: rendered by AppLayout as a full-width row above the content
 *    (search is flex-1, Filters + a full "New message" button on the right).
 *  - COMPACT mode: rendered by the page INSIDE the left (thread-list) column,
 *    above the list. The whole row is column-scoped (it already spans exactly the
 *    35% thread-list width), so search is flex-1 within that column and Filters +
 *    New message shrink to 40px icon-only buttons. The conversation thread column
 *    then runs full height (there is no top row occupying the content area).
 *
 * FiltersControl is defined here so it stays reusable across both placements — its
 * VIEW radio group is the real, wired control (Inbox/Archived/Blocked → the
 * store's currentView); the rest are decorative placeholders.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiMagnify, mdiFilterVariant, mdiMessagePlusOutline } from '@mdi/js';
import { colors, CanaryButton, ButtonType, ButtonSize } from '@canary-ui/components';

export type CategoryFilter = 'inbox' | 'archived' | 'blocked';

const VIEW_OPTIONS: { id: CategoryFilter; label: string }[] = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'archived', label: 'Archived' },
  { id: 'blocked', label: 'Blocked' },
];

/** Decorative placeholder filters — visually present, disabled; they suggest the
 *  future Filters feature (assignment scoping etc. will land here). */
const PLACEHOLDER_FILTERS = ['Assigned to', 'Channel'];

/**
 * FiltersControl — the Filters button + its popover. The VIEW radio group is the
 * real, wired control (collapsed Inbox/Archived/Blocked); the rest are decorative
 * placeholders. Closes on outside click. `compact` swaps the trigger to a 40px
 * icon-only button with a corner count badge.
 */
export function FiltersControl({
  currentView,
  onViewChange,
  compact = false,
}: {
  currentView: CategoryFilter;
  onViewChange: (view: CategoryFilter) => void;
  compact?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative shrink-0" ref={rootRef}>
      {compact ? (
        /* Compact: 40px icon-only button with a small applied-count badge */
        <button
          onClick={() => setIsOpen((v) => !v)}
          aria-label="Filters"
          className="relative flex items-center justify-center rounded-[6px] cursor-pointer transition-colors hover:bg-[#f9fafb]"
          style={{ width: 40, height: 40, backgroundColor: colors.colorWhite, border: `1px solid ${colors.colorBlack5}` }}
        >
          <Icon path={mdiFilterVariant} size={0.83} color={colors.colorBlack1} />
          <span
            className="absolute flex items-center justify-center rounded-full font-['Roboto',sans-serif] font-medium"
            style={{ top: -6, right: -6, minWidth: 16, height: 16, paddingLeft: 4, paddingRight: 4, fontSize: 10, lineHeight: '16px', color: colors.colorWhite, backgroundColor: colors.colorBlueDark1 }}
          >
            2
          </span>
        </button>
      ) : (
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="flex items-center gap-2 rounded-[6px] cursor-pointer transition-colors hover:bg-[#f9fafb]"
          style={{
            height: 40,
            paddingLeft: 12,
            paddingRight: 12,
            backgroundColor: colors.colorWhite,
            border: `1px solid ${colors.colorBlack5}`,
          }}
        >
          <Icon path={mdiFilterVariant} size={0.83} color={colors.colorBlack1} />
          <span className="font-['Roboto',sans-serif]" style={{ fontSize: 14, lineHeight: '22px', color: colors.colorBlack1 }}>
            Filters
          </span>
          {/* Blue count badge — filters applied */}
          <span
            className="flex items-center justify-center rounded-full font-['Roboto',sans-serif] font-medium"
            style={{ minWidth: 18, height: 18, paddingLeft: 5, paddingRight: 5, fontSize: 11, lineHeight: '18px', color: colors.colorWhite, backgroundColor: colors.colorBlueDark1 }}
          >
            2
          </span>
        </button>
      )}

      {isOpen && (
        <div
          className="absolute right-0 mt-2 z-50 animate-fade-in"
          style={{
            width: 260,
            backgroundColor: colors.colorWhite,
            border: `1px solid ${colors.colorBlack6}`,
            borderRadius: 8,
            boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
            padding: 16,
          }}
        >
          {/* VIEW radio group — the real, wired control */}
          <p className="font-['Roboto',sans-serif] font-medium uppercase mb-2" style={{ fontSize: 10, letterSpacing: '0.4px', color: colors.colorBlack3 }}>
            View
          </p>
          <div className="flex flex-col gap-0.5 mb-4">
            {VIEW_OPTIONS.map((opt) => {
              const active = currentView === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onViewChange(opt.id)}
                  className="flex items-center gap-2.5 rounded-[6px] cursor-pointer transition-colors hover:bg-[#f9fafb]"
                  style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 7, paddingBottom: 7 }}
                >
                  <span
                    className="rounded-full flex items-center justify-center shrink-0"
                    style={{ width: 16, height: 16, border: `2px solid ${active ? colors.colorBlueDark1 : colors.colorBlack5}` }}
                  >
                    {active && <span className="rounded-full" style={{ width: 8, height: 8, backgroundColor: colors.colorBlueDark1 }} />}
                  </span>
                  <span className="font-['Roboto',sans-serif]" style={{ fontSize: 14, lineHeight: '22px', color: colors.colorBlack1 }}>
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Decorative placeholder filters — disabled, suggest the future feature */}
          <div style={{ borderTop: `1px solid ${colors.colorBlack6}`, paddingTop: 12 }}>
            {PLACEHOLDER_FILTERS.map((label) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-[6px] cursor-not-allowed"
                style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 7, paddingBottom: 7, opacity: 0.5 }}
              >
                <span className="font-['Roboto',sans-serif]" style={{ fontSize: 14, lineHeight: '22px', color: colors.colorBlack1 }}>
                  {label}
                </span>
                <span className="font-['Roboto',sans-serif]" style={{ fontSize: 13, lineHeight: '20px', color: colors.colorBlack3 }}>
                  Any
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface ConversationControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewMessage: () => void;
  currentView: CategoryFilter;
  onViewChange: (view: CategoryFilter) => void;
  /** compact = column-scoped placement (icon-only Filters + New message). */
  compact?: boolean;
}

export function ConversationControls({
  searchQuery,
  onSearchChange,
  onNewMessage,
  currentView,
  onViewChange,
  compact = false,
}: ConversationControlsProps) {
  const searchField = (
    <div
      className="flex items-center gap-2 rounded-[6px]"
      style={{
        backgroundColor: colors.colorWhite,
        border: `1px solid ${colors.colorBlack5}`,
        height: 40,
        paddingLeft: 8,
        paddingRight: 16,
      }}
    >
      <Icon path={mdiMagnify} size={0.83} color={colors.colorBlack3} />
      <input
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search"
        className="flex-1 min-w-0 border-0 outline-none bg-transparent font-['Roboto',sans-serif] text-[14px] leading-[22px] placeholder:text-[#666666]"
        style={{ color: colors.colorBlack1 }}
      />
    </div>
  );

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0">{searchField}</div>
      <FiltersControl currentView={currentView} onViewChange={onViewChange} compact={compact} />
      {compact ? (
        /* New message — 40px icon-only PRIMARY button */
        <button
          onClick={onNewMessage}
          aria-label="New message"
          className="flex items-center justify-center rounded-[6px] shrink-0 cursor-pointer transition-opacity hover:opacity-90"
          style={{ width: 40, height: 40, backgroundColor: colors.colorBlueDark1 }}
        >
          <Icon path={mdiMessagePlusOutline} size={0.83} color={colors.colorWhite} />
        </button>
      ) : (
        <CanaryButton type={ButtonType.PRIMARY} size={ButtonSize.NORMAL} onClick={onNewMessage}>
          New message
        </CanaryButton>
      )}
    </div>
  );
}
