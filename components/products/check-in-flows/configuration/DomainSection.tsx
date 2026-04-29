'use client';

/**
 * DomainSection — collapsible group of atoms by domain.
 *
 * Renders all atoms with a given AtomDomain as a list of <AtomRow>.
 * Includes an "+ Add" affordance at the bottom (drops via AddAtomMenu).
 *
 * Used by CheckInConfigPage in Configuration tab.
 */

import React, { useState, useMemo } from 'react';
import Icon from '@mdi/react';
import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
import {
  CanaryCard,
  CanaryTag,
  TagColor,
  TagSize,
  colors,
} from '@canary-ui/components';

import type { Atom, AtomDomain } from '@/lib/products/check-in-flows/types';
import { ATOM_DOMAIN_LABELS } from '@/lib/products/check-in-flows/types';
import { useCheckInFlowsStore } from '@/lib/products/check-in-flows/store';
import { AtomRow } from './AtomRow';
import { AddAtomMenu } from './AddAtomMenu';

interface Props {
  domain: AtomDomain;
  description?: string;
  defaultExpanded?: boolean;
}

export function DomainSection({ domain, description, defaultExpanded = true }: Props) {
  const allAtoms = useCheckInFlowsStore((s) => s.atoms);
  const updateAtom = useCheckInFlowsStore((s) => s.updateAtom);
  const removeAtom = useCheckInFlowsStore((s) => s.removeAtom);

  const atoms = useMemo(
    () => allAtoms.filter((a) => a.domain === domain),
    [allAtoms, domain]
  );

  const [expanded, setExpanded] = useState(defaultExpanded);

  const title = ATOM_DOMAIN_LABELS[domain];
  const count = atoms.length;

  return (
    <CanaryCard padding="none" hasBorder>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <h3 className="text-[14px] font-bold" style={{ color: colors.colorBlack1 }}>
            {title}
          </h3>
          <CanaryTag
            label={`${count} atom${count === 1 ? '' : 's'}`}
            color={count > 0 ? TagColor.INFO : TagColor.DEFAULT}
            size={TagSize.COMPACT}
          />
        </div>
        <Icon
          path={expanded ? mdiChevronUp : mdiChevronDown}
          size={0.75}
          color={colors.colorBlack4}
        />
      </button>

      {expanded && (
        <div
          className="px-5 pb-5 pt-1"
          style={{ borderTop: `1px solid ${colors.colorBlack8}` }}
        >
          {description && (
            <p
              className="text-[12px] mb-3 mt-3"
              style={{ color: colors.colorBlack4 }}
            >
              {description}
            </p>
          )}

          {count === 0 ? (
            <div
              className="rounded-md border border-dashed py-6 text-center"
              style={{ borderColor: colors.colorBlack6 }}
            >
              <p className="text-[13px]" style={{ color: colors.colorBlack5 }}>
                No atoms in this domain yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2 mt-3">
              {atoms.map((atom) => (
                <AtomRow
                  key={atom.id}
                  atom={atom}
                  onUpdate={(updates) => updateAtom(atom.id, updates)}
                  onRemove={() => {
                    if (confirm(`Remove "${atomDisplayName(atom)}"?`)) {
                      removeAtom(atom.id);
                    }
                  }}
                />
              ))}
            </div>
          )}

          <div className="mt-3">
            <AddAtomMenu domain={domain} />
          </div>
        </div>
      )}
    </CanaryCard>
  );
}

function atomDisplayName(atom: Atom): string {
  if (atom.kind === 'copy-block') return atom.name;
  return atom.label?.['en'] ?? atom.id;
}
