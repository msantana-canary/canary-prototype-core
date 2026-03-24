'use client';

/**
 * GuestBottomSheet — Slide-up drawer from bottom
 *
 * Reusable across guest-facing flows.
 * Backdrop + slide-up animation + close on backdrop click.
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
  maxHeight = '70%',
}: GuestBottomSheetProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
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
        className="relative bg-white rounded-t-2xl shadow-2xl flex flex-col"
        style={{
          maxHeight,
          animation: 'bottom-sheet-up 250ms ease-out',
        }}
      >
        {/* Handle + header */}
        <div className="flex-shrink-0 pt-3 pb-2 px-4">
          {/* Drag handle */}
          <div className="w-10 h-1 bg-[#d1d5db] rounded-full mx-auto mb-3" />
          {title && (
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-[#111827]">{title}</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-[#f3f4f6] transition-colors"
              >
                <Icon path={mdiClose} size={0.7} color="#6b7280" />
              </button>
            </div>
          )}
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}
