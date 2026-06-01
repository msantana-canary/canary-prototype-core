'use client';

/**
 * Compact inbox header (SPIKE — Option D)
 *
 * Ported from the vaporware ThreadListHeader (two rows): mailbox chips + functional
 * filter dropdown + compose, then search. It HOSTS the real existing controls —
 * the Inbox/Archived/Blocked tabs, the All/My/Unassigned filter (relocated up from
 * ThreadList), compose, and search — consolidated, nothing duplicated.
 * Note: the assignment filter is decorative today (matches the prior ThreadList behavior).
 */

import { useEffect, useRef, useState } from 'react';
import Icon from '@mdi/react';
import { mdiPencilOutline, mdiFilterVariant, mdiCheck } from '@mdi/js';
import { CanaryInputSearch, InputSize, colors } from '@canary-ui/components';

type CategoryFilter = 'inbox' | 'archived' | 'blocked';

const TABS: { id: CategoryFilter; label: string }[] = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'archived', label: 'Archived' },
  { id: 'blocked', label: 'Blocked' },
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
}: {
  currentView?: CategoryFilter;
  onViewChange?: (v: CategoryFilter) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onNewMessage?: () => void;
  filterValue?: string;
  onFilterChange?: (v: string) => void;
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFilterOpen) return;
    const onDown = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setIsFilterOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [isFilterOpen]);

  const selectedLabel = FILTER_OPTIONS.find((o) => o.value === filterValue)?.label ?? 'All conversations';

  return (
    <div className="border-b border-gray-200 bg-white">
      {/* Row 1: mailbox chips + filter + compose */}
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <div className="flex gap-2">
          {TABS.map((t) => {
            const active = t.id === currentView;
            return (
              <button
                key={t.id}
                onClick={() => onViewChange?.(t.id)}
                className="rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
                style={{
                  backgroundColor: active ? colors.colorBlueDark1 : 'transparent',
                  color: active ? 'white' : colors.colorBlack3,
                  border: active ? 'none' : '1px solid #CCCCCC',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          {/* Filter dropdown */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen((v) => !v)}
              title={`Filter: ${selectedLabel}`}
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

          {/* Compose */}
          <button
            onClick={onNewMessage}
            aria-label="New message"
            title="New message"
            className="flex h-8 w-8 items-center justify-center rounded"
            style={{ backgroundColor: colors.colorBlueDark1 }}
          >
            <Icon path={mdiPencilOutline} size={0.75} color="white" />
          </button>
        </div>
      </div>

      {/* Row 2: search (CanaryInputSearch handles its own icon alignment) */}
      <div className="px-4 pb-4">
        <CanaryInputSearch
          placeholder="Search guests..."
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          size={InputSize.COMPACT}
        />
      </div>
    </div>
  );
}
