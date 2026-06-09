'use client';

import React, { useMemo } from 'react';
import Icon from '@mdi/react';
import {
  mdiChevronDown,
  mdiChevronRight,
  mdiAlertCircleOutline,
  mdiEyeOutline,
  mdiCheckCircleOutline,
  mdiMagnify,
} from '@mdi/js';
import { CommandCenterThread, AIThreadStatus } from '@/lib/products/command-center/types';
import { CommandThreadItem } from './CommandThreadItem';
import { guests } from '@/lib/core/data/guests';

const sectionConfig: Record<AIThreadStatus, { label: string; icon: string; color: string; emptyLabel: string }> = {
  needs_response: {
    label: 'Needs Response',
    icon: mdiAlertCircleOutline,
    color: '#EF4444',
    emptyLabel: 'All caught up — no threads need a response',
  },
  needs_attention: {
    label: 'Needs Attention',
    icon: mdiEyeOutline,
    color: '#F59E0B',
    emptyLabel: 'No threads need attention',
  },
  ai_handled: {
    label: 'AI Handled',
    icon: mdiCheckCircleOutline,
    color: '#10B981',
    emptyLabel: 'No AI-handled threads',
  },
  escalated: {
    label: 'Escalated',
    icon: mdiAlertCircleOutline,
    color: '#DC2626',
    emptyLabel: 'No escalations',
  },
};

interface PrioritizedInboxProps {
  threads: CommandCenterThread[];
  selectedThreadId: string | null;
  searchQuery: string;
  expandedSections: Record<AIThreadStatus, boolean>;
  onSelectThread: (threadId: string) => void;
  onSearchChange: (query: string) => void;
  onToggleSection: (section: AIThreadStatus) => void;
}

export function PrioritizedInbox({
  threads,
  selectedThreadId,
  searchQuery,
  expandedSections,
  onSelectThread,
  onSearchChange,
  onToggleSection,
}: PrioritizedInboxProps) {
  const filteredThreads = useMemo(() => {
    if (!searchQuery.trim()) return threads.filter((t) => !t.isCompleted);
    const q = searchQuery.toLowerCase();
    return threads.filter((t) => {
      if (t.isCompleted) return false;
      const guest = guests[t.guestId];
      if (!guest) return false;
      return (
        guest.name.toLowerCase().includes(q) ||
        t.lastMessage.toLowerCase().includes(q) ||
        t.channel.toLowerCase().includes(q)
      );
    });
  }, [threads, searchQuery]);

  const groupedThreads = useMemo(() => {
    const groups: Record<AIThreadStatus, CommandCenterThread[]> = {
      needs_response: [],
      escalated: [],
      needs_attention: [],
      ai_handled: [],
    };
    filteredThreads.forEach((t) => {
      if (groups[t.aiStatus]) {
        groups[t.aiStatus].push(t);
      }
    });
    return groups;
  }, [filteredThreads]);

  const statusOrder: AIThreadStatus[] = ['needs_response', 'needs_attention', 'ai_handled'];

  return (
    <div className="w-[340px] h-full border-r border-gray-200 bg-white flex flex-col shrink-0">
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Icon
            path={mdiMagnify}
            size={0.7}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search guests, messages..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-[13px] rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {statusOrder.map((status) => {
          const section = sectionConfig[status];
          const sectionThreads = groupedThreads[status];
          const isExpanded = expandedSections[status];

          if (sectionThreads.length === 0 && status === 'escalated') return null;

          return (
            <div key={status}>
              <button
                onClick={() => onToggleSection(status)}
                className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100 hover:bg-gray-100 transition-colors"
              >
                <Icon
                  path={isExpanded ? mdiChevronDown : mdiChevronRight}
                  size={0.65}
                  className="text-gray-400"
                />
                <Icon path={section.icon} size={0.6} style={{ color: section.color }} />
                <span className="text-[12px] font-semibold text-gray-700 uppercase tracking-wide">
                  {section.label}
                </span>
                <span
                  className="text-[11px] font-bold px-1.5 py-0.5 rounded-full leading-none ml-auto"
                  style={{
                    backgroundColor: section.color + '15',
                    color: section.color,
                  }}
                >
                  {sectionThreads.length}
                </span>
              </button>

              {isExpanded && (
                <div>
                  {sectionThreads.length === 0 ? (
                    <div className="px-4 py-3 text-[12px] text-gray-400 italic">
                      {section.emptyLabel}
                    </div>
                  ) : (
                    sectionThreads.map((thread) => (
                      <CommandThreadItem
                        key={thread.id}
                        thread={thread}
                        isSelected={selectedThreadId === thread.id}
                        onClick={() => onSelectThread(thread.id)}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
