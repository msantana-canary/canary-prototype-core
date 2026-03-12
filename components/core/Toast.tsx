'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { colors } from '@canary-ui/components';

type ToastVariant = 'success' | 'error' | 'info';

const variantStyles: Record<ToastVariant, { backgroundColor: string; color: string }> = {
  success: { backgroundColor: colors.colorLightGreen1, color: '#ffffff' },
  error: { backgroundColor: colors.colorPink1, color: '#ffffff' },
  info: { backgroundColor: '#333333', color: '#ffffff' },
};

interface ToastProps {
  message: string;
  isOpen: boolean;
  variant?: ToastVariant;
}

export function Toast({ message, isOpen, variant = 'success' }: ToastProps) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg font-['Roboto',sans-serif] text-[14px] font-medium shadow-lg animate-[toast-in_300ms_ease-out_forwards]"
      style={{ ...variantStyles[variant], opacity: 0 }}
    >
      {message}
    </div>,
    document.body
  );
}
