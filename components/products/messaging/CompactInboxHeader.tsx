'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from '@mdi/react';
import { mdiPencilOutline, mdiFilterVariant, mdiCheck, mdiMagnify, mdiClose } from '@mdi/js';
import { CanaryInputSearch, CanarySelect, InputSize, colors } from '@canary-ui/components';

type CategoryFilter = 'inbox' | 'archived' | 'blocked';
type SearchMode = 'hidden' | 'slide-down' | 'takeover';

const MAILBOX_OPTIONS = [
  { label: 'Inbox', value: 'inbox' },
  { label: 'Archived', value: 'archived' },
  { label: 'Blocked', value: 'blocked' },
];

const FILTER_OPTIONS = [
  { value: 'all-conversations', label: 'All conversations' },
  { value: 'my-conversations', label: 'My conversations' },
  { value: 'unassigned', label: 'Unassigned' },
];

export function CompactInboxHeader({
  currentView = 'inbox',
  onViewChange,
  searchQuery = '',
  onSearchChange,
  onNewMessage,
  filterValue = 'all-conversations',
  onFilterChange,
  searchVariant = 'slide-down',
}: {
  currentView?: CategoryFilter;
  onViewChange?: (v: CategoryFilter) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onNewMessage?: () => void;
  filterValue?: string;
  onFilterChange?: (v: string) => void;
  searchVariant?: 'slide-down' | 'takeover';
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isFilterOpen) return;
    const onDown = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setIsFilterOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [isFilterOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      onSearchChange?.('');
    }
  }, [isSearchOpen]);

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  const isTakeover = searchVariant === 'takeover' && isSearchOpen;

  return (
    <div className="border-b border-gray-200 bg-white">
      {/* Row 1 */}
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        {isTakeover ? (
          /* Takeover mode: search replaces Row 1 controls */
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1">
              <CanaryInputSearch
                ref={searchInputRef}
                placeholder="Search guests..."
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                size={InputSize.COMPACT}
              />
            </div>
            <button
              onClick={handleCloseSearch}
              aria-label="Close search"
              className="flex h-8 w-8 items-center justify-center rounded transition-opacity hover:opacity-80 shrink-0"
              style={{ backgroundColor: '#EAEEF9' }}
            >
              <Icon path={mdiClose} size={0.75} color={colors.colorBlueDark1} />
            </button>
          </div>
        ) : (
          /* Standard: mailbox dropdown + icons */
          <>
            <div className="flex-1 max-w-[140px]">
              <CanarySelect
                options={MAILBOX_OPTIONS}
                value={currentView}
                onChange={(e) => onViewChange?.(e.target.value as CategoryFilter)}
                size={InputSize.COMPACT}
              />
            </div>

            <div className="flex gap-2">
              {/* Filter dropdown */}
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setIsFilterOpen((v) => !v)}
                  aria-label="Filter conversations"
                  className="flex h-8 w-8 items-center justify-center rounded transition-opacity hover:opacity-80"
                  style={{ backgroundColor: '#EAEEF9' }}
                >
                  <Icon path={mdiFilterVariant} size={0.75} color={colors.colorBlueDark1} />
                </button>
                {isFilterOpen && (
                  <div
                    className="absolute right-0 top-full z-[9999] mt-1 overflow-hidden rounded bg-white"
                    style={{ minWidth: 180, boxShadow: '0 8px 24px rgba(0,0,0,0.16)' }}
                  >
                    {FILTER_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        onClick={() => {
                          onFilterChange?.(o.value);
                          setIsFilterOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-50"
                      >
                        <span className="flex-1 text-[14px]" style={{ color: colors.colorBlack1 }}>{o.label}</span>
                        {filterValue === o.value && <Icon path={mdiCheck} size={0.8} color={colors.colorBlack1} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search guests"
                className="flex h-8 w-8 items-center justify-center rounded transition-opacity hover:opacity-80"
                style={{ backgroundColor: '#EAEEF9' }}
              >
                <Icon path={mdiMagnify} size={0.75} color={colors.colorBlueDark1} />
              </button>

              {/* Compose */}
              <button
                onClick={onNewMessage}
                aria-label="New message"
                className="flex h-8 w-8 items-center justify-center rounded"
                style={{ backgroundColor: colors.colorBlueDark1 }}
              >
                <Icon path={mdiPencilOutline} size={0.75} color="white" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Row 2: slide-down search (only in slide-down variant) */}
      {searchVariant === 'slide-down' && isSearchOpen && (
        <div className="px-4 pb-3 flex items-center gap-2">
          <div className="flex-1">
            <CanaryInputSearch
              ref={searchInputRef}
              placeholder="Search guests..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              size={InputSize.COMPACT}
            />
          </div>
          <button
            onClick={handleCloseSearch}
            aria-label="Close search"
            className="flex h-6 w-6 items-center justify-center rounded transition-opacity hover:opacity-80"
          >
            <Icon path={mdiClose} size={0.6} color={colors.colorBlack3} />
          </button>
        </div>
      )}
    </div>
  );
}
