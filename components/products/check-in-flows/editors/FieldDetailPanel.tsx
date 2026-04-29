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
  mdiTuneVariant,
  mdiOpenInNew,
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
  CanarySelect,
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

      {/* Read-only body — atom data lives in Global Config */}
      <div className="px-6 py-5 space-y-5">
        <EditInGlobalCTA />

        <ReadOnlySection title="Label">
          {languages.map((lang) => (
            <ReadOnlyValue
              key={lang}
              label={`Label (${lang.toUpperCase()})`}
              value={field.label?.[lang] ?? '—'}
            />
          ))}
        </ReadOnlySection>

        {!typeMeta.isStatic && (
          <ReadOnlySection title="Hints">
            <ReadOnlyValue
              label="Placeholder"
              value={field.placeholder?.['en'] || '—'}
            />
            <ReadOnlyValue
              label="Helper text"
              value={field.helperText?.['en'] || '—'}
            />
          </ReadOnlySection>
        )}

        {typeMeta.isStatic && (
          <ReadOnlySection title="Content">
            <ReadOnlyValue
              label={field.type === 'header' ? 'Heading text' : field.type === 'list' ? 'Bullet list' : 'Paragraph text'}
              value={field.staticContent?.['en'] || '—'}
              multiline
            />
          </ReadOnlySection>
        )}

        {!typeMeta.isStatic && (
          <ReadOnlySection title="Validation">
            <ReadOnlyBadge label="Required" enabled={field.required} />
            <ReadOnlyBadge label="Auto-skip if already filled" enabled={field.autoSkipIfFilled} />
          </ReadOnlySection>
        )}

        {!typeMeta.isStatic && (
          <ReadOnlySection title="PMS Mapping">
            {tagMeta ? (
              <div className="flex items-center gap-2 text-[12px]" style={{ color: colors.colorBlack3 }}>
                <Icon path={mdiTagOutline} size={0.55} color={colors.colorBlack4} />
                <span>{tagMeta.displayName}</span>
                <code
                  className="font-mono text-[11px] px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: colors.colorBlack8,
                    color: colors.colorBlack4,
                    border: `1px solid ${colors.colorBlack7}`,
                  }}
                >
                  {tagMeta.pmsField}
                </code>
              </div>
            ) : (
              <p className="text-[12px] italic" style={{ color: colors.colorBlack5 }}>
                Not mapped to a PMS field.
              </p>
            )}
          </ReadOnlySection>
        )}

        {typeMeta.supportsOptions && (
          <ReadOnlySection title="Options">
            {(field.options ?? []).length === 0 ? (
              <p className="text-[12px] italic" style={{ color: colors.colorBlack5 }}>
                No options defined.
              </p>
            ) : (
              <ul className="space-y-1">
                {field.options!.map((opt) => (
                  <li
                    key={opt.id}
                    className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded text-[12px]"
                    style={{
                      backgroundColor: '#FFF',
                      border: `1px solid ${colors.colorBlack7}`,
                    }}
                  >
                    <span style={{ color: colors.colorBlack3 }}>
                      {resolveText(opt.label) || '—'}
                    </span>
                    <code
                      className="font-mono text-[11px]"
                      style={{ color: colors.colorBlack5 }}
                    >
                      {opt.value}
                    </code>
                  </li>
                ))}
              </ul>
            )}
          </ReadOnlySection>
        )}

        {!typeMeta.isStatic && (
          <ReadOnlySection title="Visibility">
            <GlobalConditionsIndicator
              count={field.conditions?.length ?? 0}
            />
          </ReadOnlySection>
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

/**
 * Read-only conditions indicator for Flow context.
 *
 * Per architecture: conditions live in Global Config only. Flow shows
 * the resolved state but cannot edit. Click navigates to the atom in
 * Configuration tab (Phase 2 wires the navigation; for now it's a
 * static indicator).
 */
/**
 * Read-only section title (matches old Section visually).
 */
function ReadOnlySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: colors.colorBlack5 }}>
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

/**
 * Top-of-panel CTA explaining that atom-level config is owned by Global.
 */
function EditInGlobalCTA() {
  return (
    <div
      className="flex items-start gap-2 px-3 py-2.5 rounded-md"
      style={{
        backgroundColor: colors.colorBlueDark5,
        border: `1px solid ${colors.colorBlueDark4}`,
      }}
    >
      <Icon path={mdiOpenInNew} size={0.6} color={colors.colorBlueDark1} className="mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[12px] font-semibold" style={{ color: colors.colorBlueDark1 }}>
          Field properties are managed in Global Config
        </p>
        <p className="text-[11px]" style={{ color: colors.colorBlueDark1, opacity: 0.8 }}>
          Open the Configuration tab to edit this atom's label, validation, PMS mapping, options, and conditions. Flow tab is for step composition only.
        </p>
      </div>
    </div>
  );
}

/**
 * Read-only single-line value (label + value).
 */
function ReadOnlyValue({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <div
        className="text-[11px] font-medium mb-0.5"
        style={{ color: colors.colorBlack5 }}
      >
        {label}
      </div>
      <div
        className={`px-2.5 py-1.5 rounded text-[12px] ${multiline ? 'whitespace-pre-wrap' : ''}`}
        style={{
          backgroundColor: '#FFF',
          border: `1px solid ${colors.colorBlack7}`,
          color: colors.colorBlack3,
          minHeight: multiline ? '4rem' : undefined,
        }}
      >
        {value}
      </div>
    </div>
  );
}

/**
 * Read-only boolean indicator.
 */
function ReadOnlyBadge({
  label,
  enabled,
}: {
  label: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-[12px]" style={{ color: colors.colorBlack3 }}>
      <span
        className="inline-flex items-center justify-center w-4 h-4 rounded"
        style={{
          backgroundColor: enabled ? colors.colorBlueDark5 : colors.colorBlack8,
          border: `1px solid ${enabled ? colors.colorBlueDark4 : colors.colorBlack7}`,
          color: enabled ? colors.colorBlueDark1 : colors.colorBlack5,
          fontSize: 10,
          fontWeight: 700,
        }}
      >
        {enabled ? '✓' : ''}
      </span>
      {label}
    </div>
  );
}

function GlobalConditionsIndicator({ count }: { count: number }) {
  return (
    <div
      className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-md"
      style={{
        backgroundColor: colors.colorBlack8,
        border: `1px solid ${colors.colorBlack7}`,
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Icon path={mdiTuneVariant} size={0.6} color={colors.colorBlack4} />
        <div className="min-w-0">
          <p className="text-[12px] font-medium" style={{ color: colors.colorBlack3 }}>
            {count === 0
              ? 'Always visible'
              : `${count} visibility condition${count === 1 ? '' : 's'} defined`}
          </p>
          <p className="text-[11px]" style={{ color: colors.colorBlack5 }}>
            Edit in Configuration tab → this atom in Global Config
          </p>
        </div>
      </div>
      <Icon path={mdiOpenInNew} size={0.55} color={colors.colorBlack5} />
    </div>
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
  const options: { value: string; label: string; disabled?: boolean }[] = [
    { value: '', label: 'No semantic tag' },
  ];
  (Object.keys(ELEMENT_TAGS_BY_CATEGORY) as TagCategory[]).forEach((cat) => {
    options.push({
      value: `__sep_${cat}`,
      label: `── ${TAG_CATEGORY_LABELS[cat]} ──`,
      disabled: true,
    });
    ELEMENT_TAGS_BY_CATEGORY[cat].forEach((t) => {
      options.push({ value: t.id, label: t.displayName });
    });
  });

  return (
    <CanarySelect
      size={InputSize.NORMAL}
      value={value ?? ''}
      isDisabled={disabled}
      onChange={(e) => onChange((e.target.value as ElementTag) || undefined)}
      options={options}
    />
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
        <CanaryInput
          size={InputSize.NORMAL}
          value={option.label?.['en'] ?? ''}
          onChange={(e) => onChange({ label: { ...(option.label ?? {}), en: e.target.value } })}
          isDisabled={disabled}
          placeholder="Label"
        />
        <CanaryInput
          size={InputSize.NORMAL}
          value={option.value}
          onChange={(e) => onChange({ value: e.target.value })}
          isDisabled={disabled}
          placeholder="value"
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
