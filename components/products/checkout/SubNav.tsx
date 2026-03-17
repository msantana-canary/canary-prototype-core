/**
 * Checkout SubNav Component
 *
 * Top bar with search and action buttons.
 * Same pattern as check-in SubNav.
 */

'use client';

import React from 'react';
import {
  CanaryInputSearch,
  CanaryButton,
  InputSize,
  ButtonSize,
  ButtonType,
} from '@canary-ui/components';

interface SubNavProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onInsightsClick?: () => void;
  onExportClick?: () => void;
  onNewCheckout?: () => void;
}

export function SubNav({
  searchQuery = '',
  onSearchChange,
  onInsightsClick,
  onExportClick,
  onNewCheckout,
}: SubNavProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      {/* Left Side - Search */}
      <div className="flex-1">
        <CanaryInputSearch
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          size={InputSize.NORMAL}
        />
      </div>

      {/* Right Side - Action Buttons */}
      <div className="flex items-center gap-2">
        <CanaryButton
          type={ButtonType.TEXT}
          size={ButtonSize.NORMAL}
          onClick={onInsightsClick}
        >
          Insights
        </CanaryButton>

        <CanaryButton
          type={ButtonType.TEXT}
          size={ButtonSize.NORMAL}
          onClick={onExportClick}
        >
          Export
        </CanaryButton>

        <CanaryButton
          type={ButtonType.PRIMARY}
          size={ButtonSize.NORMAL}
          onClick={onNewCheckout}
        >
          New checkout
        </CanaryButton>
      </div>
    </div>
  );
}
