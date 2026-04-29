'use client';

/**
 * SchemaFormEditor — Phase 5d
 *
 * Step composition editor: arrange which atoms (from Global Config)
 * appear in this step, in what order. Read-only on atom properties —
 * atom-level editing happens in the Configuration tab per Phase 2.
 *
 * Operations:
 * - Drag-reorder atom slots within a step
 * - Remove atom from step (does NOT delete the atom from Global)
 * - Add atom from Global picker (shows atoms not yet in any step)
 *
 * Data path:
 *   step.atomIds (string[]) → resolved against Global atoms → rendered as slots.
 */

import React, { useState, useMemo } from 'react';
import Icon from '@mdi/react';
import {
  mdiPlus,
  mdiDrag,
  mdiClose,
  mdiTagOutline,
  mdiTextBoxOutline,
  mdiPuzzleOutline,
  mdiOpenInNew,
} from '@mdi/js';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  CanaryButton,
  ButtonType,
  ButtonSize,
  IconPosition,
  colors,
} from '@canary-ui/components';

import type {
  StepInstance,
  FlowDefinition,
  Atom,
  InputAtom,
  PresetAtom,
  CopyBlockAtom,
} from '@/lib/products/check-in-flows/types';
import { resolveText } from '@/lib/products/check-in-flows/types';
import { getFieldTypeMeta } from '@/lib/products/check-in-flows/field-types';
import { ELEMENT_TAGS } from '@/lib/products/check-in-flows/element-tags';
import { useCheckInFlowsStore } from '@/lib/products/check-in-flows/store';

interface Props {
  step: StepInstance;
  flow: FlowDefinition;
  isReadOnly: boolean;
}

export function SchemaFormEditor({ step, flow, isReadOnly }: Props) {
  const allAtoms = useCheckInFlowsStore((s) => s.atoms);
  const addAtomToStep = useCheckInFlowsStore((s) => s.addAtomToStep);
  const removeAtomFromStep = useCheckInFlowsStore((s) => s.removeAtomFromStep);
  const reorderStepAtoms = useCheckInFlowsStore((s) => s.reorderStepAtoms);

  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  const atomIds = step.atomIds ?? [];

  // Resolve atom slots in step order; skip missing
  const slots = useMemo(() => {
    const byId = new Map<string, Atom>(allAtoms.map((a) => [a.id, a]));
    return atomIds
      .map((id) => byId.get(id))
      .filter((a): a is Atom => !!a);
  }, [atomIds, allAtoms]);

  // Atoms in Global not currently in this step (available to add)
  const availableAtoms = useMemo(() => {
    const inStep = new Set(atomIds);
    return allAtoms.filter((a) => !inStep.has(a.id));
  }, [atomIds, allAtoms]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = atomIds.findIndex((id) => id === active.id);
    const newIndex = atomIds.findIndex((id) => id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = [...atomIds];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    reorderStepAtoms(flow.id, step.id, reordered);
  };

  return (
    <div>
      <div className="px-6 pb-6 pt-4">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h3 className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: colors.colorBlack5 }}>
            Atoms in this step
          </h3>
          {!isReadOnly && (
            <AddAtomToStepButton
              available={availableAtoms}
              onPick={(id) => {
                addAtomToStep(flow.id, step.id, id);
                setIsAddMenuOpen(false);
              }}
              isOpen={isAddMenuOpen}
              setOpen={setIsAddMenuOpen}
            />
          )}
        </div>

        <p className="text-[11px] mb-3" style={{ color: colors.colorBlack5 }}>
          Drag to reorder. Atom properties (label, validation, conditions) are
          edited in the Configuration tab.
        </p>

        {slots.length === 0 ? (
          <div
            className="p-10 rounded-lg border border-dashed bg-white text-center"
            style={{ borderColor: colors.colorBlack6 }}
          >
            <p className="text-[14px] mb-3" style={{ color: colors.colorBlack5 }}>
              No atoms in this step yet.
            </p>
            {!isReadOnly && (
              <CanaryButton
                type={ButtonType.PRIMARY}
                size={ButtonSize.NORMAL}
                icon={<Icon path={mdiPlus} size={0.7} />}
                iconPosition={IconPosition.LEFT}
                onClick={() => setIsAddMenuOpen(true)}
              >
                Add first atom
              </CanaryButton>
            )}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={atomIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-1.5">
                {slots.map((atom) => (
                  <SortableAtomSlot
                    key={atom.id}
                    atom={atom}
                    isReadOnly={isReadOnly}
                    onRemove={() => removeAtomFromStep(flow.id, step.id, atom.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}

// ── Sortable atom slot ─────────────────────────────────

function SortableAtomSlot({
  atom,
  isReadOnly,
  onRemove,
}: {
  atom: Atom;
  isReadOnly: boolean;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: atom.id, disabled: isReadOnly });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.7 : 1,
  };

  const display = describeAtom(atom);

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        borderColor: colors.colorBlack7,
      }}
      className="group bg-white rounded-md border shadow-sm"
    >
      <div className="flex items-center">
        <button
          className={`w-9 self-stretch flex items-center justify-center ${
            isReadOnly ? 'cursor-not-allowed text-[#CCC]' : 'cursor-grab active:cursor-grabbing text-[#BBB] hover:text-[#666]'
          }`}
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <Icon path={mdiDrag} size={0.75} />
        </button>

        <div className="flex-1 flex items-center gap-3 py-2.5 pr-3 min-w-0">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#F4F4F5' }}
          >
            <Icon path={display.icon} size={0.75} color="#555" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[13px] font-semibold truncate" style={{ color: colors.colorBlack2 }}>
                {display.title}
              </span>
              {display.kindLabel && (
                <span
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: colors.colorBlack8,
                    color: colors.colorBlack4,
                    border: `1px solid ${colors.colorBlack7}`,
                  }}
                >
                  {display.kindLabel}
                </span>
              )}
            </div>
            {display.subtitle && (
              <div className="flex items-center gap-1 mt-0.5 text-[11px]" style={{ color: colors.colorBlack5 }}>
                <Icon path={mdiTagOutline} size={0.45} color={colors.colorBlack5} />
                <code className="font-mono">{display.subtitle}</code>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-0.5 pr-2 shrink-0">
          {!isReadOnly && (
            <button
              className="w-7 h-7 rounded flex items-center justify-center text-[#888] hover:text-[#D00] hover:bg-[#FDECEF]"
              onClick={onRemove}
              title="Remove from step (atom stays in Global)"
            >
              <Icon path={mdiClose} size={0.65} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function describeAtom(atom: Atom): {
  icon: string;
  title: string;
  subtitle?: string;
  kindLabel?: string;
} {
  if (atom.kind === 'input') {
    const meta = getFieldTypeMeta(atom.fieldType);
    const tagMeta = atom.pmsTag ? ELEMENT_TAGS.find((t) => t.id === atom.pmsTag) : null;
    return {
      icon: meta.icon,
      title: resolveText(atom.label) || meta.displayName,
      subtitle: tagMeta?.pmsField,
    };
  }
  if (atom.kind === 'preset') {
    return {
      icon: mdiPuzzleOutline,
      title: resolveText(atom.label),
      kindLabel: 'PRESET',
    };
  }
  return {
    icon: mdiTextBoxOutline,
    title: atom.name,
    kindLabel: 'COPY',
  };
}

// ── Add atom picker ─────────────────────────────────────

function AddAtomToStepButton({
  available,
  onPick,
  isOpen,
  setOpen,
}: {
  available: Atom[];
  onPick: (atomId: string) => void;
  isOpen: boolean;
  setOpen: (v: boolean) => void;
}) {
  return (
    <div className="relative">
      <CanaryButton
        type={ButtonType.OUTLINED}
        size={ButtonSize.NORMAL}
        icon={<Icon path={mdiPlus} size={0.7} />}
        iconPosition={IconPosition.LEFT}
        onClick={() => setOpen(!isOpen)}
      >
        Add atom
      </CanaryButton>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-lg shadow-lg z-40 p-2 max-h-[480px] overflow-auto"
            style={{ border: `1px solid ${colors.colorBlack6}` }}
          >
            {available.length === 0 ? (
              <div className="p-4 text-center text-[13px]" style={{ color: colors.colorBlack5 }}>
                All atoms are already in this step. Define more atoms in the Configuration tab.
              </div>
            ) : (
              <div className="space-y-0.5">
                <div
                  className="px-2 py-1.5 text-[11px] flex items-center gap-1"
                  style={{ color: colors.colorBlack5 }}
                >
                  <Icon path={mdiOpenInNew} size={0.45} color={colors.colorBlack5} />
                  Atoms from Global Config — pick to add to this step
                </div>
                {available.map((atom) => {
                  const display = describeAtom(atom);
                  return (
                    <button
                      key={atom.id}
                      onClick={() => onPick(atom.id)}
                      className="w-full text-left px-2 py-1.5 rounded hover:bg-[#F4F4F5] flex items-center gap-2.5"
                    >
                      <div
                        className="w-7 h-7 rounded flex items-center justify-center shrink-0"
                        style={{ backgroundColor: '#F4F4F5' }}
                      >
                        <Icon path={display.icon} size={0.65} color="#555" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold truncate" style={{ color: colors.colorBlack2 }}>
                          {display.title}
                        </div>
                        {display.subtitle && (
                          <div className="text-[11px] font-mono truncate" style={{ color: colors.colorBlack5 }}>
                            {display.subtitle}
                          </div>
                        )}
                      </div>
                      {display.kindLabel && (
                        <span
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0"
                          style={{
                            backgroundColor: colors.colorBlack8,
                            color: colors.colorBlack4,
                            border: `1px solid ${colors.colorBlack7}`,
                          }}
                        >
                          {display.kindLabel}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
