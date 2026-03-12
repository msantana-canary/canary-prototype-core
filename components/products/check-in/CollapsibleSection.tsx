'use client';

import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiChevronDown, mdiChevronRight } from '@mdi/js';
import { colors } from '@canary-ui/components';

interface CollapsibleSectionProps {
  title: string;
  count: number;
  defaultCollapsed?: boolean;
  children: React.ReactNode;
}

export function CollapsibleSection({
  title,
  count,
  defaultCollapsed = false,
  children,
}: CollapsibleSectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div>
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-1 mb-2 cursor-pointer"
      >
        <Icon
          path={collapsed ? mdiChevronRight : mdiChevronDown}
          size={0.7}
          color={colors.colorBlack3}
        />
        <span
          className="text-[13px] font-medium"
          style={{ color: colors.colorBlack3 }}
        >
          {title} ({count})
        </span>
      </button>
      {!collapsed && children}
    </div>
  );
}
