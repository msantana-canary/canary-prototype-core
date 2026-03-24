'use client';

/**
 * ParameterSection — Collapsible section within the parameter sidebar
 */

import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiChevronDown, mdiChevronUp } from '@mdi/js';

interface ParameterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  visible?: boolean;
}

export function ParameterSection({
  title,
  children,
  defaultOpen = true,
  visible = true,
}: ParameterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!visible) return null;

  return (
    <div className="border-b border-[#e5e7eb]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#f9fafb] transition-colors"
      >
        <span className="text-[13px] font-semibold text-[#374151] uppercase tracking-wide">
          {title}
        </span>
        <Icon
          path={isOpen ? mdiChevronUp : mdiChevronDown}
          size={0.7}
          color="#9ca3af"
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 flex flex-col gap-3">
          {children}
        </div>
      )}
    </div>
  );
}
