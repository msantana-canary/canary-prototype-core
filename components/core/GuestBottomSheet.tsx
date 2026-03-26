'use client';

/**
 * GuestBottomSheet — Slide-up drawer matching Figma (5:2433)
 *
 * Figma spec:
 *   bg: #fcf9f4, rounded-tl/tr-8, shadow 0 -8 12 rgba(0,0,0,0.16)
 *   Header: centered title (24px SemiBold), X close button on right
 *   Content: p-24, gap-24
 */

import React, { useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiClose } from '@mdi/js';

interface GuestBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: string;
}

export function GuestBottomSheet({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = '90%',
}: GuestBottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          maxHeight,
          backgroundColor: '#fcf9f4',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          boxShadow: '0px -8px 12px rgba(0,0,0,0.16)',
          animation: 'bottom-sheet-up 250ms ease-out',
        }}
      >
        {/* Header — centered title, X on right */}
        <div className="flex-shrink-0 flex items-center justify-between" style={{ padding: 24, paddingBottom: 0 }}>
          {/* Invisible spacer to center title */}
          <div style={{ width: 48, height: 48 }} />
          {title && (
            <h3 style={{ fontSize: 24, fontWeight: 600, lineHeight: '36px', color: '#000', textAlign: 'center' }}>
              {title}
            </h3>
          )}
          <button
            onClick={onClose}
            className="flex items-center justify-center"
            style={{ width: 48, height: 48 }}
          >
            <Icon path={mdiClose} size={1} color="#000" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ padding: 24, paddingTop: 32, paddingBottom: 64 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
