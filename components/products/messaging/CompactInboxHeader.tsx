'use client';

/**
 * Compact inbox header (SPIKE — Option D)
 *
 * Compresses the messaging SubNav (Inbox/Archived/Blocked + search + New message)
 * INTO the thread-list column header, freeing the full-width top strip.
 * Vaporware pattern. Same handlers as SubNav.
 */

import Icon from '@mdi/react';
import { mdiMagnify, mdiPencilOutline, mdiFilterVariant } from '@mdi/js';
import { colors } from '@canary-ui/components';

type CategoryFilter = 'inbox' | 'archived' | 'blocked';

const TABS: { id: CategoryFilter; label: string }[] = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'archived', label: 'Archived' },
  { id: 'blocked', label: 'Blocked' },
];

export function CompactInboxHeader({
  currentView = 'inbox',
  onViewChange,
  searchQuery = '',
  onSearchChange,
  onNewMessage,
}: {
  currentView?: CategoryFilter;
  onViewChange?: (v: CategoryFilter) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onNewMessage?: () => void;
}) {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <div className="flex gap-1.5">
          {TABS.map((t) => {
            const active = t.id === currentView;
            return (
              <button
                key={t.id}
                onClick={() => onViewChange?.(t.id)}
                className="rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors"
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
          <button
            aria-label="Filter conversations"
            title="Filter: All conversations"
            className="flex h-8 w-8 items-center justify-center rounded"
            style={{ backgroundColor: '#EAEEF9' }}
          >
            <Icon path={mdiFilterVariant} size={0.75} color={colors.colorBlueDark1} />
          </button>
          <button
            onClick={onNewMessage}
            aria-label="New message"
            className="flex h-8 w-8 items-center justify-center rounded"
            style={{ backgroundColor: colors.colorBlueDark1 }}
          >
            <Icon path={mdiPencilOutline} size={0.75} color="white" />
          </button>
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center">
            <Icon path={mdiMagnify} size={0.8} color={colors.colorBlack4} />
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search guests..."
            className="h-[40px] w-full rounded border pl-[40px] pr-2 text-[14px] outline-none"
            style={{ borderColor: '#666666' }}
          />
        </div>
      </div>
    </div>
  );
}
