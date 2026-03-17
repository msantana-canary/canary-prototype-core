'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CanaryButton, ButtonType, ButtonSize, colors } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiDotsHorizontal } from '@mdi/js';

export interface ActionMenuItem {
  label: string;
  danger?: boolean;
  onClick: () => void;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  /** Position the menu above or below the trigger */
  position?: 'above' | 'below';
  /** Icon size for the trigger button */
  iconSize?: number;
  /** Icon color for the trigger button */
  iconColor?: string;
  /** Minimum width of the dropdown */
  minWidth?: number;
}

export function ActionMenu({
  items,
  position = 'below',
  iconSize = 0.67,
  iconColor = colors.colorBlack3,
  minWidth = 200,
}: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <CanaryButton
        type={ButtonType.ICON_SECONDARY}
        size={ButtonSize.COMPACT}
        icon={<Icon path={mdiDotsHorizontal} size={iconSize} color={iconColor} />}
        onClick={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <div
          className={`absolute right-0 ${position === 'above' ? 'bottom-full mb-1' : 'top-full mt-1'} py-2 bg-white rounded-lg shadow-lg z-10`}
          style={{ minWidth, border: `1px solid ${colors.colorBlack6}` }}
        >
          {items.map((item) => (
            <button
              key={item.label}
              className="w-full text-left px-4 py-2 text-[14px] hover:bg-gray-50 transition-colors"
              style={{ color: item.danger ? colors.danger : colors.colorBlueDark1 }}
              onClick={() => {
                setIsOpen(false);
                item.onClick();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
