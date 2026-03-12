'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { colors } from '@canary-ui/components';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  isOpen: boolean;
  onClose?: () => void;
  variant?: ToastVariant;
  duration?: number;
}

const variantColors: Record<ToastVariant, string> = {
  success: colors.success,
  error: colors.danger,
  info: colors.colorBlack2,
};

export function Toast({
  message,
  isOpen,
  onClose,
  variant = 'info',
  duration = 3000,
}: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [isOpen, duration, onClose]);

  if (!visible || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-[14px] font-medium text-white z-[9999] animate-[toast-in_300ms_ease-out_forwards]"
      style={{ backgroundColor: variantColors[variant], opacity: 0 }}
    >
      {message}
    </div>,
    document.body,
  );
}
