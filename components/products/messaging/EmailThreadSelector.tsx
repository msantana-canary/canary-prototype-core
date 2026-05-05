'use client';

import React, { useState, useRef, useEffect } from 'react';
import { EmailThread } from '@/lib/products/messaging/types';
import Icon from '@mdi/react';
import { mdiChevronDown, mdiEmailOutline } from '@mdi/js';

interface EmailThreadSelectorProps {
  emailThreads: EmailThread[];
  selectedEmailThreadId: string | null;
  onSelect: (emailThreadId: string | null) => void;
}

export function EmailThreadSelector({
  emailThreads,
  selectedEmailThreadId,
  onSelect,
}: EmailThreadSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  if (emailThreads.length <= 1) return null;

  const selected = emailThreads.find((t) => t.id === selectedEmailThreadId) || emailThreads[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors hover:bg-gray-50 max-w-[300px]"
        style={{ borderColor: '#e5e5e5' }}
      >
        <Icon path={mdiEmailOutline} size={0.5} color="#EA4335" />
        <span
          className="font-['Roboto',sans-serif] text-xs text-black truncate"
          title={selected.subject}
        >
          {selected.subject}
        </span>
        <Icon path={mdiChevronDown} size={0.5} color="#999999" className="shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 left-0 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[280px] max-w-[400px]">
          <div className="px-3 py-1.5">
            <span className="font-['Roboto',sans-serif] text-[10px] uppercase text-gray-400 font-medium">
              Email threads
            </span>
          </div>
          {emailThreads.map((thread) => {
            const isSelected = thread.id === (selectedEmailThreadId || emailThreads[0]?.id);
            return (
              <button
                key={thread.id}
                onClick={() => { onSelect(thread.id); setIsOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                style={{ backgroundColor: isSelected ? '#f5f8ff' : undefined }}
              >
                <Icon path={mdiEmailOutline} size={0.5} color="#EA4335" className="shrink-0" />
                <span
                  className="font-['Roboto',sans-serif] text-xs truncate"
                  style={{ color: '#000000', fontWeight: isSelected ? 500 : 400 }}
                  title={thread.subject}
                >
                  {thread.subject}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
