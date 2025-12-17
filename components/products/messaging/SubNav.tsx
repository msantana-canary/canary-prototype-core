/**
 * SubNav Component
 *
 * Sub-navigation bar with category filters (Inbox/Archived/Blocked),
 * search input, and new message button.
 */

'use client';

import React from 'react';
import {
  CanaryTabs,
  CanaryInputSearch,
  CanaryButton,
  InputSize,
  ButtonSize,
  ButtonType,
} from '@canary-ui/components';

type CategoryFilter = 'inbox' | 'archived' | 'blocked';

interface SubNavProps {
  onNewMessage?: () => void;
  currentView?: CategoryFilter;
  onViewChange?: (view: CategoryFilter) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function SubNav({ onNewMessage, currentView = 'inbox', onViewChange, searchQuery = '', onSearchChange }: SubNavProps) {

  const tabs = [
    {
      id: 'inbox',
      label: 'Inbox',
      content: <></>,
    },
    {
      id: 'archived',
      label: 'Archived',
      content: <></>,
    },
    {
      id: 'blocked',
      label: 'Blocked',
      content: <></>,
    },
  ];

  return (
    <div className="bg-white border-t border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      {/* Pill Tabs */}
      <CanaryTabs
        tabs={tabs}
        variant="rounded"
        defaultTab={currentView}
        onChange={(tabId) => onViewChange?.(tabId as CategoryFilter)}
        className="mb-0"
      />

      {/* Search and Actions */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="w-[400px]">
          <CanaryInputSearch
            placeholder="Search guests (must have phone number)"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            size={InputSize.NORMAL}
          />
        </div>

        {/* New Message Button */}
        <CanaryButton
          type={ButtonType.PRIMARY}
          size={ButtonSize.NORMAL}
          onClick={onNewMessage}
        >
          New message
        </CanaryButton>
      </div>
    </div>
  );
}
