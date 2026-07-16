/**
 * EmailThreadList
 *
 * Left column of the Email surface: the Inbox/Archived segmented control
 * (built locally — the library has no CanarySegmentedControl) stacked over
 * the scrollable thread-list card. Reads/writes the email store.
 */

'use client';

import React from 'react';
import { colors } from '@canary-ui/components';
import { useEmailStore } from '@/lib/products/email/store';
import { EmailView } from '@/lib/products/email/types';
import { EmailThreadListItem } from './EmailThreadListItem';

const TABS: { id: EmailView; label: string }[] = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'archived', label: 'Archived' },
];

export function EmailThreadList() {
  const threads = useEmailStore((s) => s.threads);
  const view = useEmailStore((s) => s.view);
  const searchQuery = useEmailStore((s) => s.searchQuery);
  const selectedThreadId = useEmailStore((s) => s.selectedThreadId);
  const setView = useEmailStore((s) => s.setView);
  const selectThread = useEmailStore((s) => s.selectThread);

  const query = searchQuery.trim().toLowerCase();

  const visibleThreads = threads
    .filter((t) => t.status === view)
    .filter((t) => {
      if (!query) return true;
      return (
        t.senderName.toLowerCase().includes(query) ||
        t.senderEmail.toLowerCase().includes(query) ||
        t.subject.toLowerCase().includes(query) ||
        t.preview.toLowerCase().includes(query)
      );
    })
    // Newest activity first; re-sorts automatically when a reply bumps lastActivityAt.
    .sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime());

  return (
    <div className="flex flex-col gap-4 min-h-0" style={{ width: 434 }}>
      {/* Segmented control */}
      <div
        className="flex gap-1 rounded-[6px] shrink-0"
        style={{ backgroundColor: colors.colorWhite, border: `1px solid ${colors.colorBlack6}`, padding: 4 }}
      >
        {TABS.map((tab) => {
          const isActive = view === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className="flex-1 flex items-center justify-center rounded-[6px] font-['Roboto',sans-serif] font-medium text-[14px] leading-[22px] transition-colors"
              style={{
                paddingLeft: 24,
                paddingRight: 24,
                paddingTop: 8,
                paddingBottom: 8,
                backgroundColor: isActive ? colors.colorBlueDark1 : 'transparent',
                color: isActive ? colors.colorWhite : colors.colorBlack3,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Thread list card */}
      <div
        className="flex-1 flex flex-col gap-2 overflow-y-auto rounded-[12px] min-h-0"
        style={{
          backgroundColor: colors.colorWhite,
          border: `1px solid ${colors.colorBlack6}`,
          paddingLeft: 8,
          paddingRight: 8,
          paddingTop: 16,
          paddingBottom: 16,
        }}
      >
        {visibleThreads.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <p
              className="font-['Roboto',sans-serif] text-[14px] text-center"
              style={{ color: colors.colorBlack4 }}
            >
              {query ? 'No emails match your search.' : `No ${view} emails.`}
            </p>
          </div>
        ) : (
          visibleThreads.map((thread) => (
            <EmailThreadListItem
              key={thread.id}
              thread={thread}
              isSelected={thread.id === selectedThreadId}
              onClick={() => selectThread(thread.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
