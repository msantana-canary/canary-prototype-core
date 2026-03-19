'use client';

/**
 * KBSection — Collapsible section with title, optional progress bar, CanaryButton chevron.
 * Managed Context variant: description always visible even when collapsed.
 */

import { useState } from 'react';
import Icon from '@mdi/react';
import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
import { CanaryButton, ButtonType, ButtonSize } from '@canary-ui/components';

interface KBSectionProps {
  title: string;
  count?: number;
  progress?: number; // 0-100
  description?: string; // Always visible even when collapsed (Managed Context)
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function KBSection({ title, count, progress, description, defaultOpen = false, children }: KBSectionProps) {
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
        className="flex items-start justify-between cursor-pointer"
        style={{ padding: '20px 24px' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 18, fontWeight: 500, color: '#000', margin: 0 }}>
            {title}{count !== undefined ? ` (${count})` : ''}
          </h3>
          {progress !== undefined && (
            <div className="flex items-center" style={{ gap: 8, marginTop: 6 }}>
              <span style={{ fontSize: 12, color: '#666', whiteSpace: 'nowrap' }}>
                {progress >= 100 ? '100' : progress}% complete
              </span>
              <div
                style={{
                  width: 160,
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
          {/* Description always visible (Managed Context pattern) */}
          {description && (
            <p style={{ fontSize: 14, color: '#333', margin: '12px 0 0 0', lineHeight: '1.5' }}>
              {description}
            </p>
          )}
        </div>
        <CanaryButton
          type={ButtonType.ICON_SECONDARY}
          size={ButtonSize.COMPACT}
          icon={<Icon path={isOpen ? mdiChevronUp : mdiChevronDown} size={0.85} />}
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        />
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
