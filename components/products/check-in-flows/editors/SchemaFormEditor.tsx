'use client';

/**
 * SchemaFormEditor
 *
 * Drag-drop field builder for schema-form step templates (reg-card, OCR).
 * Mirrors production's EditorElementFactory concept — add fields from
 * a typed catalog, reorder, edit details in a side panel.
 */

import React, { useState, useMemo } from 'react';
import Icon from '@mdi/react';
import {
  mdiPlus,
  mdiDrag,
  mdiDelete,
  mdiPencilOutline,
  mdiInformationOutline,
  mdiTagOutline,
  mdiAsteriskCircleOutline,
  mdiSkipNextOutline,
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
  ButtonColor,
  ButtonSize,
  IconPosition,
  colors,
} from '@canary-ui/components';

import type {
  StepInstance,
  FlowDefinition,
  FieldDef,
  ElementTag,
  LocalizedText,
} from '@/lib/products/check-in-flows/types';
import { resolveText } from '@/lib/products/check-in-flows/types';
import {
  FIELD_TYPES,
  FIELD_TYPES_BY_CATEGORY,
  getFieldTypeMeta,
  type FieldTypeCategory,
} from '@/lib/products/check-in-flows/field-types';
import { ELEMENT_TAGS, getElementTagMeta } from '@/lib/products/check-in-flows/element-tags';
import { useCheckInFlowsStore } from '@/lib/products/check-in-flows/store';
import { FieldDetailPanel } from './FieldDetailPanel';

interface Props {
  step: StepInstance;
  flow: FlowDefinition;
  isReadOnly: boolean;
}

let fieldIdCounter = 0;
function makeFieldId(): string {
  return `field-${Date.now()}-${++fieldIdCounter}`;
}

function emptyField(type: FieldDef['type']): FieldDef {
  const meta = getFieldTypeMeta(type);
  const options =
    meta.supportsOptions
      ? [
          {
            id: `opt-${Date.now()}-1`,
            value: 'option-1',
            label: { en: 'Option 1' } as LocalizedText,
            order: 0,
          },
        ]
      : undefined;

  return {
    id: makeFieldId(),
    type,
    label: { en: meta.displayName } as LocalizedText,
    required: !meta.isStatic,
    autoSkipIfFilled: !meta.isStatic,
    order: 0,
    options,
  };
}

export function SchemaFormEditor({ step, flow, isReadOnly }: Props) {
  const addField = useCheckInFlowsStore((s) => s.addField);
  const removeField = useCheckInFlowsStore((s) => s.removeField);
  const reorderFields = useCheckInFlowsStore((s) => s.reorderFields);

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  if (step.config.kind !== 'schema-form') {
    return <div className="p-8 text-center text-[#888]">Not a schema-form step.</div>;
  }

  const fields = step.config.fields;
  const fieldIds = useMemo(() => fields.map((f) => f.id), [fields]);
  const selectedField = fields.find((f) => f.id === selectedFieldId) ?? null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = [...fields];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    reorderFields(flow.id, step.id, reordered.map((f) => f.id));
  };

  const handleAddField = (type: FieldDef['type']) => {
    const field = emptyField(type);
    addField(flow.id, step.id, field);
    setIsAddMenuOpen(false);
    setSelectedFieldId(field.id);
  };

  return (
    <>
      <div className="h-full overflow-auto">
        <div className="max-w-[1000px] mx-auto px-8 py-6">
          {/* Header info */}
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[14px] font-bold text-[#2B2B2B] mb-1">Fields</h2>
              <p className="text-[12px] text-[#666]">
                Drag to reorder. Click a field to edit its label, validation, and
                options.
              </p>
            </div>
            {!isReadOnly && <AddFieldButton onPick={handleAddField} isOpen={isAddMenuOpen} setOpen={setIsAddMenuOpen} />}
          </div>

          {/* Field list */}
          {fields.length === 0 ? (
            <div className="p-10 rounded-lg border border-dashed border-[#C5C5C5] bg-white text-center">
              <p className="text-[14px] text-[#888] mb-3">No fields yet.</p>
              {!isReadOnly && (
                <CanaryButton
                  type={ButtonType.PRIMARY}
                  size={ButtonSize.NORMAL}
                  icon={<Icon path={mdiPlus} size={0.7} />}
                  iconPosition={IconPosition.LEFT}
                  onClick={() => setIsAddMenuOpen(true)}
                >
                  Add first field
                </CanaryButton>
              )}
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={fieldIds} strategy={verticalListSortingStrategy}>
                <div className="space-y-1.5">
                  {fields.map((field) => (
                    <SortableFieldRow
                      key={field.id}
                      field={field}
                      isSelected={field.id === selectedFieldId}
                      isReadOnly={isReadOnly}
                      onSelect={() => setSelectedFieldId(field.id)}
                      onRemove={() => {
                        removeField(flow.id, step.id, field.id);
                        if (selectedFieldId === field.id) setSelectedFieldId(null);
                      }}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {/* Info banner about PMS mapping */}
          {fields.length > 0 && !isReadOnly && (
            <div
              className="mt-5 flex items-start gap-2 px-4 py-3 rounded-md border"
              style={{ borderColor: colors.colorBlueDark4, backgroundColor: colors.colorBlueDark5 }}
            >
              <Icon path={mdiInformationOutline} size={0.7} color={colors.colorBlueDark1} className="mt-0.5 shrink-0" />
              <p className="text-[12px]" style={{ color: colors.colorBlueDark1 }}>
                Attach a <strong>semantic tag</strong> to each field to map it to a PMS
                property (e.g. <code>guest.email</code>). Tagged fields auto-skip on
                subsequent flows if already collected.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right side panel for field detail */}
      {selectedField && (
        <FieldDetailPanel
          key={selectedField.id}
          field={selectedField}
          flow={flow}
          step={step}
          isReadOnly={isReadOnly}
          onClose={() => setSelectedFieldId(null)}
        />
      )}
    </>
  );
}

// ── Sortable row ──────────────────────────────────────────

function SortableFieldRow({
  field,
  isSelected,
  isReadOnly,
  onSelect,
  onRemove,
}: {
  field: FieldDef;
  isSelected: boolean;
  isReadOnly: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const typeMeta = getFieldTypeMeta(field.type);
  const tagMeta = field.semanticTag ? getElementTagMeta(field.semanticTag) : null;
  const hasConditions = (field.conditions?.length ?? 0) > 0;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id, disabled: isReadOnly });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-white rounded-md border transition-colors ${
        isSelected
          ? 'border-[#2858C4] shadow-sm'
          : 'border-[#E5E5E5] hover:border-[#BBB]'
      }`}
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

        <button
          className="flex-1 flex items-center gap-3 py-2.5 pr-3 text-left min-w-0"
          onClick={onSelect}
        >
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#F4F4F5' }}
          >
            <Icon path={typeMeta.icon} size={0.75} color="#555" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] font-semibold text-[#2B2B2B] truncate">
                {resolveText(field.label) || typeMeta.displayName}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-[#888]">
                {typeMeta.displayName}
              </span>
              {field.required && (
                <span
                  className="inline-flex items-center gap-0.5 text-[10px] font-semibold"
                  title="Required"
                  style={{ color: colors.danger }}
                >
                  <Icon path={mdiAsteriskCircleOutline} size={0.45} />
                  Required
                </span>
              )}
              {field.autoSkipIfFilled && (
                <span
                  className="inline-flex items-center gap-0.5 text-[10px] text-[#666]"
                  title="Auto-skips if already collected in a prior flow"
                >
                  <Icon path={mdiSkipNextOutline} size={0.5} />
                  Auto-skip
                </span>
              )}
              {hasConditions && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: colors.colorBlueDark5, color: colors.colorBlueDark1 }}
                >
                  {field.conditions!.length} condition{field.conditions!.length === 1 ? '' : 's'}
                </span>
              )}
            </div>
            {tagMeta && (
              <div className="flex items-center gap-1 mt-0.5 text-[11px] text-[#888]">
                <Icon path={mdiTagOutline} size={0.5} color="#888" />
                <code className="font-mono">{tagMeta.pmsField}</code>
              </div>
            )}
          </div>
        </button>

        <div className="flex items-center gap-0.5 pr-2 shrink-0">
          {!isReadOnly && (
            <button
              className="w-7 h-7 rounded flex items-center justify-center text-[#888] hover:text-[#2B2B2B] hover:bg-[#F4F4F5]"
              onClick={onSelect}
              title="Edit"
            >
              <Icon path={mdiPencilOutline} size={0.65} />
            </button>
          )}
          {!isReadOnly && (
            <button
              className="w-7 h-7 rounded flex items-center justify-center text-[#888] hover:text-[#D00] hover:bg-[#FDECEF]"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Remove field "${resolveText(field.label) || typeMeta.displayName}"?`)) {
                  onRemove();
                }
              }}
              title="Remove field"
            >
              <Icon path={mdiDelete} size={0.65} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Add field menu ────────────────────────────────────────

const CATEGORY_LABELS: Record<FieldTypeCategory, string> = {
  input: 'Input',
  selection: 'Selection',
  specialized: 'Specialized',
  static: 'Static Content',
};

function AddFieldButton({
  onPick,
  isOpen,
  setOpen,
}: {
  onPick: (type: FieldDef['type']) => void;
  isOpen: boolean;
  setOpen: (v: boolean) => void;
}) {
  return (
    <div className="relative">
      <CanaryButton
        type={ButtonType.PRIMARY}
        size={ButtonSize.NORMAL}
        icon={<Icon path={mdiPlus} size={0.7} />}
        iconPosition={IconPosition.LEFT}
        onClick={() => setOpen(!isOpen)}
      >
        Add field
      </CanaryButton>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-lg border border-[#E5E5E5] shadow-lg z-40 p-3 max-h-[560px] overflow-auto">
            {(Object.keys(FIELD_TYPES_BY_CATEGORY) as FieldTypeCategory[]).map((cat) => (
              <div key={cat} className="mb-3 last:mb-0">
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#888] px-1 mb-1.5">
                  {CATEGORY_LABELS[cat]}
                </h4>
                <div className="space-y-0.5">
                  {FIELD_TYPES_BY_CATEGORY[cat].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => onPick(t.id)}
                      className="w-full text-left px-2 py-1.5 rounded hover:bg-[#F4F4F5] flex items-center gap-2.5"
                    >
                      <div
                        className="w-7 h-7 rounded flex items-center justify-center shrink-0"
                        style={{ backgroundColor: '#F4F4F5' }}
                      >
                        <Icon path={t.icon} size={0.7} color="#555" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-[#2B2B2B]">
                          {t.displayName}
                        </div>
                        <div className="text-[11px] text-[#888] truncate">
                          {t.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
