'use client';

/**
 * KBSection — Collapsible section with title, optional progress bar, chevron.
 */

import { useState } from 'react';
import Icon from '@mdi/react';
import { mdiChevronDown, mdiChevronUp } from '@mdi/js';

interface KBSectionProps {
  title: string;
  count?: number;
  progress?: number; // 0-100
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function KBSection({ title, count, progress, defaultOpen = false, children }: KBSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const progressColor = progress === undefined ? undefined
    : progress >= 100 ? '#008040'
    : progress >= 50 ? '#FAB541'
    : '#E5E5E5';

  return (
    <div
      style={{
        backgroundColor: '#FFF',
        border: '1px solid #E5E5E5',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer"
        style={{ padding: '20px 24px' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 500, color: '#000', margin: 0 }}>
            {title}{count !== undefined ? ` (${count})` : ''}
          </h3>
          {progress !== undefined && (
            <div className="flex items-center" style={{ gap: 8, marginTop: 6 }}>
              {progress >= 100 && (
                <span style={{ fontSize: 12, color: '#008040', fontWeight: 500 }}>Complete!</span>
              )}
              <div
                style={{
                  width: 120,
                  height: 8,
                  backgroundColor: '#E5E5E5',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(progress, 100)}%`,
                    height: '100%',
                    backgroundColor: progressColor,
                    borderRadius: 4,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          )}
        </div>
        <Icon path={isOpen ? mdiChevronUp : mdiChevronDown} size={1} color="#333" />
      </div>

      {/* Content */}
      {isOpen && (
        <div style={{ padding: '0 24px 24px' }}>
          {children}
        </div>
      )}
    </div>
  );
}
