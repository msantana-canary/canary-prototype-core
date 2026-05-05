'use client';

/**
 * AtomDetailModal — sliding side panel that wraps AtomDetailPane for the
 * flow-first authoring path.
 *
 * Mounted in ConfiguratorShell when nav.tab === 'flows' and an atom is
 * selected (via selectAtom from the store). Clicking an atom slot in the
 * flow editor sets selectedAtomId, this opens. Click backdrop or X in
 * the AtomDetailPane header to close.
 *
 * The Library tab keeps its own inline right-pane AtomDetailPane via
 * CheckInConfigPage — this modal is the flow-first entry point only.
 */

import React, { useEffect } from 'react';
import { colors } from '@canary-ui/components';

import { useCheckInFlowsStore } from '@/lib/products/check-in-flows/store';
import { AtomDetailPane } from './AtomDetailPane';

export function AtomDetailModal() {
  const selectedAtomId = useCheckInFlowsStore((s) => s.selectedAtomId);
  const deselectAtom = useCheckInFlowsStore((s) => s.deselectAtom);
  const isOpen = !!selectedAtomId;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') deselectAtom();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, deselectAtom]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(0,0,0,0.32)' }}
        onClick={deselectAtom}
      />
      <div
        className="fixed right-0 top-0 bottom-0 z-50 bg-white flex flex-col"
        style={{
          width: 560,
          maxWidth: '92vw',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.18)',
          borderLeft: `1px solid ${colors.colorBlack7}`,
        }}
      >
        <AtomDetailPane />
      </div>
    </>
  );
}
