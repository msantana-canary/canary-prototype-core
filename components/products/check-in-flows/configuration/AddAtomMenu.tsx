'use client';

/**
 * AddAtomMenu — picker for creating new atoms in a domain.
 *
 * Click "+ Add" → menu with options: Input field, Preset, Copy block.
 * Picking creates the atom with sensible defaults and adds it to store.
 *
 * Used inside DomainSection.
 */

import React, { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiPlus,
  mdiTextBoxOutline,
  mdiPuzzleOutline,
  mdiFormTextbox,
} from '@mdi/js';
import {
  CanaryButton,
  ButtonType,
  ButtonSize,
  IconPosition,
  colors,
} from '@canary-ui/components';

import type {
  Atom,
  AtomDomain,
  InputAtom,
  CopyBlockAtom,
  DeviceVisibility,
} from '@/lib/products/check-in-flows/types';
import { DEFAULT_VISIBLE_ALL } from '@/lib/products/check-in-flows/types';
import { useCheckInFlowsStore } from '@/lib/products/check-in-flows/store';

interface Props {
  domain: AtomDomain;
}

let atomIdCounter = 0;
function newAtomId(prefix: string): string {
  return `atom-${prefix}-${Date.now()}-${++atomIdCounter}`;
}

export function AddAtomMenu({ domain }: Props) {
  const addAtom = useCheckInFlowsStore((s) => s.addAtom);
  const [open, setOpen] = useState(false);

  const visibleAll: DeviceVisibility = { ...DEFAULT_VISIBLE_ALL };

  const createInput = () => {
    const atom: InputAtom = {
      id: newAtomId('input'),
      kind: 'input',
      domain,
      fieldType: 'text-input',
      label: { en: 'New input' },
      required: false,
      deviceVisibility: visibleAll,
    };
    addAtom(atom);
    setOpen(false);
  };

  const createCopyBlock = () => {
    const atom: CopyBlockAtom = {
      id: newAtomId('copy'),
      kind: 'copy-block',
      domain,
      name: 'New copy block',
      content: { en: 'Add your text here…' },
      deviceVisibility: visibleAll,
    };
    addAtom(atom);
    setOpen(false);
  };

  return (
    <div className="relative inline-block">
      <CanaryButton
        type={ButtonType.OUTLINED}
        size={ButtonSize.NORMAL}
        icon={<Icon path={mdiPlus} size={0.7} />}
        iconPosition={IconPosition.LEFT}
        onClick={() => setOpen(!open)}
      >
        Add atom
      </CanaryButton>

      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-md z-40 py-1"
            style={{
              border: `1px solid ${colors.colorBlack6}`,
              minWidth: 220,
            }}
          >
            <MenuItem
              icon={mdiFormTextbox}
              label="Input field"
              description="A single data point collected from the guest"
              onClick={createInput}
            />
            <MenuItem
              icon={mdiTextBoxOutline}
              label="Copy block"
              description="Compliance / policy text"
              onClick={createCopyBlock}
            />
            <MenuItem
              icon={mdiPuzzleOutline}
              label="Preset"
              description="Coming in Phase 3"
              disabled
            />
          </div>
        </>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  description,
  onClick,
  disabled,
}: {
  icon: string;
  label: string;
  description: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors"
      style={{
        backgroundColor: 'transparent',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = colors.colorBlack8;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <div
        className="w-7 h-7 rounded flex items-center justify-center shrink-0"
        style={{ backgroundColor: '#F4F4F5' }}
      >
        <Icon path={icon} size={0.7} color="#555" />
      </div>
      <div className="min-w-0">
        <div className="text-[13px] font-semibold" style={{ color: colors.colorBlack2 }}>
          {label}
        </div>
        <div className="text-[11px]" style={{ color: colors.colorBlack5 }}>
          {description}
        </div>
      </div>
    </button>
  );
}
