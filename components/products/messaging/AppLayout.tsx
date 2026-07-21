/**
 * Messaging AppLayout Component — REDESIGN (Figma "Messaging" frame 29:2099)
 *
 * MainNav (tabs + online status) → full-width Search + Filters + New-message row →
 * page content on a colorBlack8 canvas. The Inbox/Archived/Blocked scoping now
 * lives inside the Filters popover on the search row (the old thread-list
 * segmented control was removed — <1% of usage is Archived/Blocked). Broadcast
 * keeps its sub nav.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiMagnify, mdiFilterVariant } from '@mdi/js';
import { colors, CanaryButton, ButtonType, ButtonSize } from '@canary-ui/components';
import { MainNav } from './MainNav';
import { MainNavTab } from '@/lib/products/messaging/broadcast-types';
import { BroadcastSubNav } from './broadcast/BroadcastSubNav';

type CategoryFilter = 'inbox' | 'archived' | 'blocked';

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: MainNavTab;
  onTabChange: (tab: MainNavTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewMessage: () => void;
  currentView: CategoryFilter;
  onViewChange: (view: CategoryFilter) => void;
}

const VIEW_OPTIONS: { id: CategoryFilter; label: string }[] = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'archived', label: 'Archived' },
  { id: 'blocked', label: 'Blocked' },
];

/** Decorative placeholder filters — visually present, disabled; they suggest the
 *  future Filters feature (assignment scoping etc. will land here). */
const PLACEHOLDER_FILTERS = ['Assigned to', 'Channel'];

/**
 * FiltersControl — the search-row Filters button + its popover. The VIEW radio
 * group is the real, wired control (collapsed Inbox/Archived/Blocked); the rest
 * are decorative placeholders. Closes on outside click.
 */
function FiltersControl({
  currentView,
  onViewChange,
}: {
  currentView: CategoryFilter;
  onViewChange: (view: CategoryFilter) => void;
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
    <div className="relative" ref={rootRef}>
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

export function AppLayout({
  children,
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onNewMessage,
  currentView,
  onViewChange,
}: AppLayoutProps) {
  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: colors.colorBlack8 }}>
      {/* Main Navigation */}
      <MainNav activeTab={activeTab} onTabChange={onTabChange} />

      {/* Search + CTA row (Conversations only) */}
      {activeTab === 'conversations' && (
        <div
          className="flex items-center gap-3 shrink-0"
          style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 16, paddingBottom: 16 }}
        >
          <div
            className="flex-1 flex items-center gap-2 rounded-[6px]"
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
              className="flex-1 border-0 outline-none bg-transparent font-['Roboto',sans-serif] text-[14px] leading-[22px] placeholder:text-[#666666]"
              style={{ color: colors.colorBlack1 }}
            />
          </div>

          {/* Filters — collapsed Inbox/Archived/Blocked views + future filters */}
          <FiltersControl currentView={currentView} onViewChange={onViewChange} />

          <CanaryButton type={ButtonType.PRIMARY} size={ButtonSize.NORMAL} onClick={onNewMessage}>
            New message
          </CanaryButton>
        </div>
      )}

      {activeTab === 'broadcast' && <BroadcastSubNav />}

      {/* Page Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
