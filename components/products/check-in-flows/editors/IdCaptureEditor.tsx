'use client';

/**
 * IdCaptureEditor
 *
 * Configures the ID-capture step: which ID types the guest can choose
 * from, and per-option visibility conditions (e.g. "driver's license
 * only shown to Italian nationals").
 *
 * This is the demo centerpiece for the Italian-hotel example —
 * toggling property to Milano + switching the preview nationality
 * should flip the visible ID types.
 */

import React from 'react';
import Icon from '@mdi/react';
import {
  mdiPlus,
  mdiDelete,
  mdiDrag,
  mdiCardAccountDetailsOutline,
  mdiInformationOutline,
} from '@mdi/js';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  CanarySwitch,
  colors,
} from '@canary-ui/components';

import type {
  StepInstance,
  FlowDefinition,
  IdTypeOption,
  IdCaptureConfig,
  Condition,
  LocalizedText,
} from '@/lib/products/check-in-flows/types';
import { useCheckInFlowsStore, useCurrentProperty } from '@/lib/products/check-in-flows/store';
import { LocalizedTextEditor } from './LocalizedTextEditor';
import { ConditionRuleEditor } from './ConditionRuleEditor';

interface Props {
  step: StepInstance;
  flow: FlowDefinition;
  isReadOnly: boolean;
}

const ID_TYPE_VALUES: { value: IdTypeOption['value']; label: string; description: string }[] = [
  { value: 'passport', label: 'Passport', description: 'Internationally recognized travel document' },
  { value: 'drivers-license', label: "Driver's License", description: 'Photo-bearing driving permit' },
  { value: 'national-id', label: 'National ID', description: 'Country-issued identification card' },
  { value: 'residence-permit', label: 'Residence Permit', description: 'Foreign residency document' },
  { value: 'other', label: 'Other', description: 'Custom ID type' },
];

let idOptCounter = 0;
function newOptionId(): string {
  return `id-opt-${Date.now()}-${++idOptCounter}`;
}

export function IdCaptureEditor({ step, flow, isReadOnly }: Props) {
  const property = useCurrentProperty();
  const updateStepConfig = useCheckInFlowsStore((s) => s.updateStepConfig);

  if (step.config.kind !== 'preset' || step.config.presetType !== 'id-capture') {
    return <div className="p-8 text-center text-[#888]">Not an ID Capture step.</div>;
  }
  const cfg = step.config as IdCaptureConfig;

  const patch = (update: Partial<IdCaptureConfig>) => {
    if (isReadOnly) return;
    updateStepConfig(flow.id, step.id, (current) => ({ ...current, ...update }) as IdCaptureConfig);
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = cfg.idTypeOptions.findIndex((o) => o.id === active.id);
    const newIndex = cfg.idTypeOptions.findIndex((o) => o.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const copy = [...cfg.idTypeOptions];
    const [moved] = copy.splice(oldIndex, 1);
    copy.splice(newIndex, 0, moved);
    patch({ idTypeOptions: copy.map((o, idx) => ({ ...o, order: idx })) });
  };

  const updateOption = (id: string, update: Partial<IdTypeOption>) => {
    patch({
      idTypeOptions: cfg.idTypeOptions.map((o) => (o.id === id ? { ...o, ...update } : o)),
    });
  };

  const removeOption = (id: string) => {
    patch({
      idTypeOptions: cfg.idTypeOptions.filter((o) => o.id !== id).map((o, idx) => ({ ...o, order: idx })),
    });
  };

  const addOption = () => {
    const used = new Set(cfg.idTypeOptions.map((o) => o.value));
    const next = ID_TYPE_VALUES.find((v) => !used.has(v.value)) ?? ID_TYPE_VALUES[ID_TYPE_VALUES.length - 1];
    patch({
      idTypeOptions: [
        ...cfg.idTypeOptions,
        {
          id: newOptionId(),
          value: next.value,
          label: { en: next.label } as LocalizedText,
          order: cfg.idTypeOptions.length,
        },
      ],
    });
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-[1100px] mx-auto px-8 py-6 space-y-5">
        {/* Top settings */}
        <section className="bg-white rounded-lg border border-[#E5E5E5] p-5">
          <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#888] mb-3">
            ID Capture Settings
          </h3>
          <label className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[13px] font-medium text-[#2B2B2B]">Allow multiple IDs</div>
              <div className="text-[11px] text-[#666]">
                Let guests upload more than one ID document in this step (e.g., for
                Alloggiati family bookings).
              </div>
            </div>
            <CanarySwitch
              checked={cfg.allowMultipleIds}
              onChange={(v) => patch({ allowMultipleIds: v })}
              isDisabled={isReadOnly}
            />
          </label>
        </section>

        {/* ID type options */}
        <section className="bg-white rounded-lg border border-[#E5E5E5] p-5">
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#888]">
              Accepted ID Types
            </h3>
            <span className="text-[11px] text-[#AAA]">
              Attach conditions to gate options by guest nationality or loyalty
            </span>
          </div>

          {cfg.idTypeOptions.length === 0 ? (
            <div className="p-8 rounded-md border border-dashed border-[#C5C5C5] bg-[#FAFAFA] text-center text-[13px] text-[#888]">
              No ID types configured. Add at least one.
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={cfg.idTypeOptions.map((o) => o.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {cfg.idTypeOptions.map((option) => (
                    <SortableIdTypeRow
                      key={option.id}
                      option={option}
                      languages={property.defaultLanguages}
                      disabled={isReadOnly}
                      onChange={(update) => updateOption(option.id, update)}
                      onRemove={() => removeOption(option.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {!isReadOnly && cfg.idTypeOptions.length < ID_TYPE_VALUES.length && (
            <button
              onClick={addOption}
              className="mt-3 w-full py-2 rounded-md border border-dashed border-[#C5C5C5] text-[12px] font-semibold text-[#888] hover:border-[#2858C4] hover:text-[#2858C4] transition-colors flex items-center justify-center gap-1.5"
            >
              <Icon path={mdiPlus} size={0.6} />
              Add ID type
            </button>
          )}
        </section>

        {/* Info */}
        <div
          className="flex items-start gap-2 px-4 py-3 rounded-md border"
          style={{ borderColor: colors.colorBlueDark4, backgroundColor: colors.colorBlueDark5 }}
        >
          <Icon path={mdiInformationOutline} size={0.7} color={colors.colorBlueDark1} className="mt-0.5 shrink-0" />
          <p className="text-[12px]" style={{ color: colors.colorBlueDark1 }}>
            Options with no condition are always shown. When conditions exist, the option
            only appears for guests whose preview context matches (nationality, loyalty, etc.).
            Property <strong>{property.name}</strong> is in{' '}
            <strong>{property.country}</strong> — regional requirements (e.g., Alloggiati for
            Italy) are often modeled as nationality-gated options.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Sortable ID type row ─────────────────────────────────

function SortableIdTypeRow({
  option,
  languages,
  disabled,
  onChange,
  onRemove,
}: {
  option: IdTypeOption;
  languages: string[];
  disabled: boolean;
  onChange: (update: Partial<IdTypeOption>) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: option.id,
    disabled,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.7 : 1,
  };

  const [isExpanded, setIsExpanded] = React.useState((option.conditions?.length ?? 0) > 0);

  const updateConditions = (conditions: Condition[]) => {
    onChange({ conditions: conditions.length > 0 ? conditions : undefined });
  };

  const hasConditions = (option.conditions?.length ?? 0) > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-md border border-[#E5E5E5] bg-white overflow-hidden"
    >
      {/* Row header */}
      <div className="flex items-stretch">
        <button
          {...attributes}
          {...listeners}
          className={`w-9 self-stretch flex items-center justify-center ${
            disabled ? 'cursor-not-allowed text-[#CCC]' : 'cursor-grab active:cursor-grabbing text-[#BBB] hover:text-[#666]'
          }`}
          aria-label="Drag"
        >
          <Icon path={mdiDrag} size={0.75} />
        </button>

        <div className="flex-1 py-3 pr-3 min-w-0 grid grid-cols-[auto,1fr,auto] gap-3 items-center">
          <div
            className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: colors.colorBlueDark5 }}
          >
            <Icon path={mdiCardAccountDetailsOutline} size={0.8} color={colors.colorBlueDark1} />
          </div>

          <div className="min-w-0">
            <select
              value={option.value}
              disabled={disabled}
              onChange={(e) => onChange({ value: e.target.value as IdTypeOption['value'] })}
              className="w-full h-8 px-2 text-[13px] font-semibold text-[#2B2B2B] bg-transparent border border-transparent hover:border-[#E5E5E5] focus:border-[#2858C4] focus:bg-white rounded outline-none disabled:opacity-60"
            >
              {ID_TYPE_VALUES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <div className="text-[11px] text-[#888] px-2">
              {hasConditions ? (
                <span style={{ color: colors.colorBlueDark1 }}>
                  {option.conditions!.length} condition{option.conditions!.length === 1 ? '' : 's'} attached
                </span>
              ) : (
                'Always visible'
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 px-2.5 rounded text-[12px] font-semibold text-[#555] hover:bg-[#F4F4F5]"
            >
              {isExpanded ? 'Hide details' : 'Edit details'}
            </button>
            {!disabled && (
              <button
                onClick={onRemove}
                className="w-8 h-8 rounded hover:bg-[#FDECEF] text-[#888] hover:text-[#D00] flex items-center justify-center"
                aria-label="Remove"
              >
                <Icon path={mdiDelete} size={0.65} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="border-t border-[#EEE] p-4 space-y-5" style={{ backgroundColor: '#FAFAFA' }}>
          <LocalizedTextEditor
            label="Label"
            hint="Displayed to the guest as the option text"
            value={option.label}
            onChange={(v) => onChange({ label: v })}
            languages={languages}
            disabled={disabled}
          />

          <div>
            <h5 className="text-[11px] font-semibold uppercase tracking-wider text-[#888] mb-2">
              Visibility Conditions
            </h5>
            <ConditionRuleEditor
              conditions={option.conditions ?? []}
              onChange={updateConditions}
              scope="option"
              disabled={disabled}
              emptyLabel="No conditions"
              emptyHint="This option is always visible to all guests."
            />
          </div>
        </div>
      )}
    </div>
  );
}
