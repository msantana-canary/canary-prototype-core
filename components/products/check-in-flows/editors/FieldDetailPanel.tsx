'use client';

/**
 * FieldDetailPanel
 *
 * Right-side slide-over for editing a single field's configuration.
 * Covers: label (multi-language), placeholder, helper text, required,
 * auto-skip-if-filled, semantic tag, and options (for dropdown/radio/
 * checkbox-group).
 *
 * Field-level conditions are NOT built here in Phase 4 — Phase 7
 * builds the ConditionRuleEditor and this panel will embed it.
 */

import React, { useEffect, useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiClose,
  mdiDrag,
  mdiPlus,
  mdiDelete,
  mdiTagOutline,
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
  CanaryButton,
  ButtonType,
  ButtonColor,
  ButtonSize,
  CanaryInput,
  CanaryTextArea,
  CanarySwitch,
  InputSize,
  InputType,
  colors,
} from '@canary-ui/components';

import type {
  FieldDef,
  FieldOption,
  FlowDefinition,
  StepInstance,
  ElementTag,
  LocalizedText,
  Condition,
} from '@/lib/products/check-in-flows/types';
import { ConditionRuleEditor } from './ConditionRuleEditor';
import { resolveText } from '@/lib/products/check-in-flows/types';
import { getFieldTypeMeta } from '@/lib/products/check-in-flows/field-types';
import { ELEMENT_TAGS_BY_CATEGORY, getElementTagMeta, type TagCategory } from '@/lib/products/check-in-flows/element-tags';
import { useCheckInFlowsStore } from '@/lib/products/check-in-flows/store';

interface Props {
  field: FieldDef;
  flow: FlowDefinition;
  step: StepInstance;
  isReadOnly: boolean;
  onClose: () => void;
}

export function FieldDetailPanel({ field, flow, step, isReadOnly, onClose }: Props) {
  const updateField = useCheckInFlowsStore((s) => s.updateField);
  const property = useCheckInFlowsStore((s) => s.properties.find((p) => p.id === s.currentPropertyId));
  const languages = property?.defaultLanguages ?? ['en'];

  const typeMeta = getFieldTypeMeta(field.type);
  const tagMeta = field.semanticTag ? getElementTagMeta(field.semanticTag) : null;

  // Working draft kept local for debounced updates (save on change for prototype)
  const patch = (updates: Partial<FieldDef>) => {
    if (!isReadOnly) updateField(flow.id, step.id, field.id, updates);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <aside className="fixed right-0 top-0 bottom-0 w-[480px] bg-white border-l border-[#E5E5E5] z-50 shadow-xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E5E5] flex items-start justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
              style={{ backgroundColor: colors.colorBlueDark5 }}
            >
              <Icon path={typeMeta.icon} size={0.8} color={colors.colorBlueDark1} />
            </div>
            <div className="min-w-0">
              <h2 className="text-[15px] font-bold text-[#2B2B2B] truncate">
                {resolveText(field.label) || typeMeta.displayName}
              </h2>
              <p className="text-[11px] text-[#888]">{typeMeta.displayName} field</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded hover:bg-[#F4F4F5] flex items-center justify-center text-[#666]"
            aria-label="Close"
          >
            <Icon path={mdiClose} size={0.8} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-auto px-5 py-5 space-y-6">
          {/* Localized labels */}
          <Section title="Label">
            {languages.map((lang) => (
              <CanaryInput
                key={lang}
                size={InputSize.NORMAL}
                label={`Label (${lang.toUpperCase()})`}
                placeholder={`Label in ${lang.toUpperCase()}`}
                value={field.label?.[lang] ?? ''}
                onChange={(e) => patch({ label: { ...field.label, [lang]: e.target.value } })}
                isDisabled={isReadOnly}
              />
            ))}
          </Section>

          {/* Placeholder + helper */}
          {!typeMeta.isStatic && (
            <Section title="Helper Text">
              <CanaryInput
                size={InputSize.NORMAL}
                label="Placeholder"
                placeholder="e.g. Enter your email"
                value={field.placeholder?.['en'] ?? ''}
                onChange={(e) =>
                  patch({ placeholder: { ...(field.placeholder ?? {}), en: e.target.value } })
                }
                isDisabled={isReadOnly}
              />
              <CanaryInput
                size={InputSize.NORMAL}
                label="Helper text"
                placeholder="Optional hint displayed under the field"
                value={field.helperText?.['en'] ?? ''}
                onChange={(e) =>
                  patch({ helperText: { ...(field.helperText ?? {}), en: e.target.value } })
                }
                isDisabled={isReadOnly}
              />
            </Section>
          )}

          {/* Static content for paragraph/header/list */}
          {typeMeta.isStatic && (
            <Section title="Content">
              {field.type === 'list' ? (
                <CanaryTextArea
                  label="Bullet list (one per line)"
                  placeholder="Item one&#10;Item two&#10;Item three"
                  value={field.staticContent?.['en'] ?? ''}
                  onChange={(e) =>
                    patch({ staticContent: { ...(field.staticContent ?? {}), en: e.target.value } })
                  }
                  isDisabled={isReadOnly}
                  rows={5}
                />
              ) : (
                <CanaryTextArea
                  label={field.type === 'header' ? 'Heading text' : 'Paragraph text'}
                  value={field.staticContent?.['en'] ?? ''}
                  onChange={(e) =>
                    patch({ staticContent: { ...(field.staticContent ?? {}), en: e.target.value } })
                  }
                  isDisabled={isReadOnly}
                  rows={field.type === 'paragraph' ? 4 : 2}
                />
              )}
            </Section>
          )}

          {/* Validation toggles */}
          {!typeMeta.isStatic && (
            <Section title="Validation">
              <ToggleRow
                label="Required"
                hint="Guest must complete this field before continuing"
                checked={field.required}
                onChange={(v) => patch({ required: v })}
                disabled={isReadOnly}
              />
              <ToggleRow
                label="Auto-skip if already filled"
                hint="Skip this field if it's been collected in a prior flow (e.g. mobile web → kiosk)"
                checked={field.autoSkipIfFilled}
                onChange={(v) => patch({ autoSkipIfFilled: v })}
                disabled={isReadOnly}
              />
            </Section>
          )}

          {/* Semantic tag */}
          {!typeMeta.isStatic && (
            <Section title="PMS Mapping">
              <div className="text-[11px] text-[#666] mb-2">
                Link this field to a PMS property. Tagged fields carry over to other flows
                automatically.
              </div>
              <SemanticTagSelect
                value={field.semanticTag}
                onChange={(tag) => patch({ semanticTag: tag })}
                disabled={isReadOnly}
              />
              {tagMeta && (
                <div className="mt-2 flex items-center gap-1 text-[11px] text-[#888]">
                  <Icon path={mdiTagOutline} size={0.5} color="#888" />
                  maps to <code className="font-mono">{tagMeta.pmsField}</code>
                </div>
              )}
            </Section>
          )}

          {/* Options (for selection fields) */}
          {typeMeta.supportsOptions && (
            <Section title="Options">
              <OptionsEditor
                options={field.options ?? []}
                onChange={(options) => patch({ options })}
                disabled={isReadOnly}
              />
            </Section>
          )}

          {/* Field-level conditions */}
          {!typeMeta.isStatic && (
            <Section title="Field-Level Conditions">
              <ConditionRuleEditor
                conditions={field.conditions ?? []}
                onChange={(next) => patch({ conditions: next.length > 0 ? next : undefined })}
                scope="field"
                disabled={isReadOnly}
                emptyLabel="Always visible"
                emptyHint="Add a condition to show, hide, or require this field based on guest context."
              />
            </Section>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E5E5E5] flex items-center justify-between">
          <span className="text-[11px] text-[#888]">Changes save automatically</span>
          <CanaryButton type={ButtonType.OUTLINED} size={ButtonSize.NORMAL} onClick={onClose}>
            Close
          </CanaryButton>
        </div>
      </aside>
    </>
  );
}

// ── Building blocks ───────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#888] mb-2">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="text-[13px] text-[#2B2B2B] font-medium">{label}</div>
        {hint && <div className="text-[11px] text-[#888]">{hint}</div>}
      </div>
      <CanarySwitch checked={checked} onChange={onChange} isDisabled={disabled} />
    </div>
  );
}

const TAG_CATEGORY_LABELS: Record<TagCategory, string> = {
  'guest-info': 'Guest Info',
  'contact': 'Contact',
  'address': 'Address',
  'stay': 'Stay',
  'identification': 'Identification',
  'loyalty': 'Loyalty',
  'other': 'Other',
};

function SemanticTagSelect({
  value,
  onChange,
  disabled,
}: {
  value: ElementTag | undefined;
  onChange: (tag: ElementTag | undefined) => void;
  disabled: boolean;
}) {
  return (
    <select
      value={value ?? ''}
      disabled={disabled}
      onChange={(e) => onChange((e.target.value as ElementTag) || undefined)}
      className="w-full h-10 px-3 rounded-md border border-[#E5E5E5] bg-white text-[13px] text-[#2B2B2B] disabled:opacity-60"
    >
      <option value="">No semantic tag</option>
      {(Object.keys(ELEMENT_TAGS_BY_CATEGORY) as TagCategory[]).map((cat) => (
        <optgroup key={cat} label={TAG_CATEGORY_LABELS[cat]}>
          {ELEMENT_TAGS_BY_CATEGORY[cat].map((t) => (
            <option key={t.id} value={t.id}>
              {t.displayName}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

// ── Options editor ───────────────────────────────────────

function OptionsEditor({
  options,
  onChange,
  disabled,
}: {
  options: FieldOption[];
  onChange: (options: FieldOption[]) => void;
  disabled: boolean;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const optionIds = options.map((o) => o.id);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = options.findIndex((o) => o.id === active.id);
    const newIndex = options.findIndex((o) => o.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const copy = [...options];
    const [moved] = copy.splice(oldIndex, 1);
    copy.splice(newIndex, 0, moved);
    onChange(copy.map((o, idx) => ({ ...o, order: idx })));
  };

  const updateOption = (id: string, updates: Partial<FieldOption>) => {
    onChange(options.map((o) => (o.id === id ? { ...o, ...updates } : o)));
  };

  const removeOption = (id: string) => {
    onChange(options.filter((o) => o.id !== id).map((o, idx) => ({ ...o, order: idx })));
  };

  const addOption = () => {
    onChange([
      ...options,
      {
        id: `opt-${Date.now()}-${options.length + 1}`,
        value: `option-${options.length + 1}`,
        label: { en: `Option ${options.length + 1}` },
        order: options.length,
      },
    ]);
  };

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={optionIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {options.map((option) => (
              <SortableOptionRow
                key={option.id}
                option={option}
                disabled={disabled}
                onChange={(updates) => updateOption(option.id, updates)}
                onRemove={() => removeOption(option.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {!disabled && (
        <button
          onClick={addOption}
          className="mt-2 w-full py-2 rounded-md border border-dashed border-[#C5C5C5] text-[12px] font-semibold text-[#888] hover:border-[#2858C4] hover:text-[#2858C4] transition-colors flex items-center justify-center gap-1.5"
        >
          <Icon path={mdiPlus} size={0.6} />
          Add option
        </button>
      )}
    </div>
  );
}

function SortableOptionRow({
  option,
  disabled,
  onChange,
  onRemove,
}: {
  option: FieldOption;
  disabled: boolean;
  onChange: (updates: Partial<FieldOption>) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: option.id, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.7 : 1,
  };

  const hasConditions = (option.conditions?.length ?? 0) > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-1.5 bg-white rounded-md border border-[#E5E5E5]"
    >
      <button
        {...attributes}
        {...listeners}
        className={`px-1.5 self-stretch ${disabled ? 'text-[#CCC] cursor-not-allowed' : 'text-[#BBB] hover:text-[#666] cursor-grab'}`}
        aria-label="Drag option"
      >
        <Icon path={mdiDrag} size={0.6} />
      </button>
      <div className="flex-1 py-1.5 pr-2 grid grid-cols-[1fr,140px] gap-2">
        <input
          type="text"
          value={option.label?.['en'] ?? ''}
          onChange={(e) => onChange({ label: { ...(option.label ?? {}), en: e.target.value } })}
          disabled={disabled}
          placeholder="Label"
          className="text-[12px] bg-white border border-[#E5E5E5] rounded px-2 py-1 outline-none focus:border-[#2858C4] disabled:opacity-60"
        />
        <input
          type="text"
          value={option.value}
          onChange={(e) => onChange({ value: e.target.value })}
          disabled={disabled}
          placeholder="value"
          className="text-[12px] font-mono bg-[#FAFAFA] border border-[#E5E5E5] rounded px-2 py-1 outline-none focus:border-[#2858C4] disabled:opacity-60"
        />
      </div>
      {hasConditions && (
        <span
          className="text-[10px] px-1.5 py-0.5 rounded mr-1"
          style={{ backgroundColor: colors.colorBlueDark5, color: colors.colorBlueDark1 }}
          title="Visibility conditions attached"
        >
          {option.conditions!.length} cond
        </span>
      )}
      {!disabled && (
        <button
          onClick={onRemove}
          className="w-7 h-7 mr-1 rounded hover:bg-[#FDECEF] text-[#888] hover:text-[#D00] flex items-center justify-center"
          aria-label="Remove option"
        >
          <Icon path={mdiDelete} size={0.55} />
        </button>
      )}
    </div>
  );
}
