'use client';

/**
 * FieldDetailPanel
 *
 * Inline editor for a single field. Lives in the left pane of FlowEditorView
 * — when a field is selected from the field list, this view replaces the
 * list (right-pane phone preview stays live the whole time).
 *
 * Edits: label (multi-language), placeholder, helper text, required,
 * auto-skip-if-filled, semantic tag, options (for selection fields), and
 * field-level conditions.
 */

import React from 'react';
import Icon from '@mdi/react';
import {
  mdiArrowLeft,
  mdiDrag,
  mdiPlus,
  mdiDelete,
  mdiTagOutline,
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
  CanaryInput,
  CanaryTextArea,
  CanarySwitch,
  InputSize,
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
import { useCheckInFlowsStore, useCurrentProperty } from '@/lib/products/check-in-flows/store';

interface Props {
  field: FieldDef;
  flow: FlowDefinition;
  step: StepInstance;
  isReadOnly: boolean;
  onClose: () => void;
}

export function FieldDetailPanel({ field, flow, step, isReadOnly, onClose }: Props) {
  const updateField = useCheckInFlowsStore((s) => s.updateField);
  const property = useCurrentProperty();
  const languages = property.defaultLanguages;

  const typeMeta = getFieldTypeMeta(field.type);
  const tagMeta = field.semanticTag ? getElementTagMeta(field.semanticTag) : null;

  // Working draft kept local for debounced updates (save on change for prototype)
  const patch = (updates: Partial<FieldDef>) => {
    if (!isReadOnly) updateField(flow.id, step.id, field.id, updates);
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-6 pt-4 pb-4" style={{ borderBottom: `1px solid ${colors.colorBlack7}` }}>
        <button
          onClick={onClose}
          className="text-[12px] font-medium flex items-center gap-1 mb-3"
          style={{ color: colors.colorBlack4 }}
        >
          <Icon path={mdiArrowLeft} size={0.55} />
          Back to fields
        </button>

        <div className="flex items-start gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ backgroundColor: colors.colorBlueDark5 }}
          >
            <Icon path={typeMeta.icon} size={0.95} color={colors.colorBlueDark1} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[18px] font-bold leading-tight" style={{ color: colors.colorBlack1 }}>
              {resolveText(field.label) || typeMeta.displayName}
            </h2>
            <p className="mt-1 text-[12px]" style={{ color: colors.colorBlack4 }}>
              {typeMeta.displayName} field
            </p>
          </div>
        </div>
      </div>

      {/* Body sections */}
      <div className="px-6 py-5 space-y-6">
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
              <SemanticTagSelect
                value={field.semanticTag}
                onChange={(tag) => patch({ semanticTag: tag })}
                disabled={isReadOnly}
              />
              {tagMeta && (
                <div className="mt-2 flex items-center gap-1 text-[11px]" style={{ color: colors.colorBlack5 }}>
                  <Icon path={mdiTagOutline} size={0.5} color={colors.colorBlack5} />
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
            <Section title="Visibility">
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
    </div>
  );
}

// ── Building blocks ───────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: colors.colorBlack5 }}>
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
        <div className="text-[13px] font-medium" style={{ color: colors.colorBlack2 }}>{label}</div>
        {hint && <div className="text-[11px]" style={{ color: colors.colorBlack5 }}>{hint}</div>}
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
      className="w-full h-10 px-3 rounded-md border bg-white text-[13px] disabled:opacity-60"
      style={{ borderColor: colors.colorBlack7, color: colors.colorBlack2 }}
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
          className="mt-2 w-full py-2 rounded-md border border-dashed text-[12px] font-semibold transition-colors flex items-center justify-center gap-1.5"
          style={{ borderColor: colors.colorBlack6, color: colors.colorBlack5 }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = colors.colorBlueDark1;
            e.currentTarget.style.color = colors.colorBlueDark1;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = colors.colorBlack6;
            e.currentTarget.style.color = colors.colorBlack5;
          }}
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
      style={{ ...style, borderColor: colors.colorBlack7 }}
      className="flex items-center gap-1.5 bg-white rounded-md border"
    >
      <button
        {...attributes}
        {...listeners}
        className="px-1.5 self-stretch"
        style={{ color: disabled ? colors.colorBlack6 : colors.colorBlack5, cursor: disabled ? 'not-allowed' : 'grab' }}
        aria-label="Drag option"
      >
        <Icon path={mdiDrag} size={0.6} />
      </button>
      <div className="flex-1 py-1.5 pr-2 grid grid-cols-[1fr_140px] gap-2">
        <input
          type="text"
          value={option.label?.['en'] ?? ''}
          onChange={(e) => onChange({ label: { ...(option.label ?? {}), en: e.target.value } })}
          disabled={disabled}
          placeholder="Label"
          className="text-[12px] bg-white border rounded px-2 py-1 outline-none disabled:opacity-60"
          style={{ borderColor: colors.colorBlack7, color: colors.colorBlack2 }}
        />
        <input
          type="text"
          value={option.value}
          onChange={(e) => onChange({ value: e.target.value })}
          disabled={disabled}
          placeholder="value"
          className="text-[12px] font-mono border rounded px-2 py-1 outline-none disabled:opacity-60"
          style={{ borderColor: colors.colorBlack7, color: colors.colorBlack2, backgroundColor: colors.colorBlack8 }}
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
          className="w-7 h-7 mr-1 rounded flex items-center justify-center"
          style={{ color: colors.colorBlack5 }}
          aria-label="Remove option"
        >
          <Icon path={mdiDelete} size={0.55} />
        </button>
      )}
    </div>
  );
}
