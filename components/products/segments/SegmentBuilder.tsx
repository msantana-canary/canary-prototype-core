'use client';

/**
 * SegmentBuilder
 *
 * Slide-over page for creating/editing segments.
 * Two cards: "Basic Information" (name) and "Filter Rules" (rule builder).
 * Cards span full width. AND/OR uses CanaryTabs rounded variant.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Icon from '@mdi/react';
import { mdiArrowLeft, mdiPlus, mdiClose, mdiAccountGroupOutline } from '@mdi/js';
import {
  CanaryButton,
  CanaryInput,
  CanarySelect,
  CanaryTabs,
  CanaryInputMultiple,
  ButtonType,
  InputSize,
} from '@canary-ui/components';
import {
  Segment,
  SegmentRule,
  SegmentProperty,
  SEGMENT_PROPERTIES,
  MULTI_VALUE_PROPERTIES,
  DROPDOWN_PROPERTIES,
  DROPDOWN_VALUE_OPTIONS,
} from '@/lib/products/guest-journey/types';
import { countSegmentGuests } from '@/lib/products/guest-journey/segment-evaluator';

interface SegmentBuilderProps {
  isOpen: boolean;
  segment?: Segment;
  onSave: (segment: Segment) => void;
  onClose: () => void;
}

const CONDITION_OPTIONS_INCLUDES = [
  { value: 'includes', label: 'includes' },
  { value: 'excludes', label: 'excludes' },
];

const CONDITION_OPTIONS_EQUAL = [
  { value: 'is equal to', label: 'is equal to' },
  { value: 'is not equal to', label: 'is not equal to' },
];

function getConditionOptions(property: string) {
  if (DROPDOWN_PROPERTIES.includes(property as SegmentProperty)) {
    return CONDITION_OPTIONS_EQUAL;
  }
  return CONDITION_OPTIONS_INCLUDES;
}

function getDefaultCondition(property: string) {
  if (DROPDOWN_PROPERTIES.includes(property as SegmentProperty)) {
    return 'is equal to';
  }
  return 'includes';
}

function createEmptyRule(operator?: 'And' | 'Or'): SegmentRule {
  return {
    id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    guestProperty: '',
    condition: 'includes',
    values: [],
    dropdownValue: '',
    operator,
  };
}

function generateDescription(rules: SegmentRule[]): string {
  const parts: string[] = [];
  for (const rule of rules) {
    if (!rule.guestProperty) continue;
    const vals = rule.values.length > 0 ? rule.values.join(', ') : rule.dropdownValue;
    if (rule.guestProperty === 'Loyalty Status') {
      parts.push(`Targets ${vals} loyalty members`);
    } else if (rule.guestProperty === 'Rate Code') {
      parts.push(`guests with ${vals} rate codes`);
    } else if (rule.guestProperty === 'Room Type') {
      parts.push(`guests in ${vals} rooms`);
    } else if (rule.guestProperty === 'Room Number') {
      parts.push(`guests in rooms ${vals}`);
    } else if (rule.guestProperty === 'Number of Nights Staying') {
      parts.push(rule.dropdownValue === 'Multiple Nights' ? 'guests staying multiple nights' : 'guests with one-night stays');
    } else if (rule.guestProperty === 'Guest Recurrence') {
      parts.push(rule.dropdownValue === 'Return Guest' ? 'returning guests' : 'first-time visitors');
    }
  }
  return parts.join(' and ') || 'Custom segment';
}

// AND/OR tabs for CanaryTabs rounded variant
const OPERATOR_TABS = [
  { id: 'And', label: 'And', content: <></> },
  { id: 'Or', label: 'Or', content: <></> },
];

export function SegmentBuilder({ isOpen, segment, onSave, onClose }: SegmentBuilderProps) {
  const isEditing = !!segment;
  const [name, setName] = useState(segment?.name || '');
  const [rules, setRules] = useState<SegmentRule[]>(
    segment?.rules.length ? segment.rules : [createEmptyRule()]
  );

  const [shouldRender, setShouldRender] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  // Live guest count from real data
  const liveGuestCount = useMemo(() => {
    const validRules = rules.filter((r) => r.guestProperty);
    if (validRules.length === 0) return 0;
    return countSegmentGuests({
      id: 'temp',
      name: '',
      rules: validRules,
      createdAt: 0,
    });
  }, [rules]);

  // Slide animation
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setName(segment?.name || '');
      setRules(segment?.rules.length ? segment.rules : [createEmptyRule()]);
      const timer = setTimeout(() => setAnimateIn(true), 10);
      return () => clearTimeout(timer);
    } else if (shouldRender) {
      setAnimateIn(false);
      const timer = setTimeout(() => setShouldRender(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender, segment]);

  const updateRule = useCallback((ruleId: string, updates: Partial<SegmentRule>) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, ...updates } : r))
    );
  }, []);

  const addRule = useCallback(() => {
    setRules((prev) => [...prev, createEmptyRule('And')]);
  }, []);

  const removeRule = useCallback((ruleId: string) => {
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
  }, []);

  const handleSave = () => {
    if (!name.trim()) return;

    const validRules = rules
      .filter((rule) => rule.guestProperty)
      .map((rule, index) => {
        if (index === 0) {
          const { operator, ...rest } = rule;
          return rest as SegmentRule;
        }
        return { ...rule, operator: rule.operator || 'And' } as SegmentRule;
      });

    onSave({
      id: segment?.id || `seg-${Date.now()}`,
      name: name.trim(),
      rules: validRules,
      description: generateDescription(validRules),
      estimatedGuests: liveGuestCount,
      createdAt: segment?.createdAt || Date.now(),
    });
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`absolute inset-0 flex flex-col bg-white shadow-2xl
        transition-transform duration-500 ease-out
        ${animateIn ? 'translate-x-0' : 'translate-x-full'}`}
      style={{ zIndex: 20 }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between bg-white shrink-0"
        style={{ padding: '16px 24px', borderBottom: '1px solid #E5E5E5' }}
      >
        <div className="flex items-center" style={{ gap: 16 }}>
          <CanaryButton
            type={ButtonType.ICON_SECONDARY}
            icon={<Icon path={mdiArrowLeft} size={0.85} />}
            onClick={onClose}
          />
          <h1 style={{ fontSize: 18, fontWeight: 500, color: '#000', margin: 0 }}>
            {isEditing ? segment.name : 'Create Segment'}
          </h1>
        </div>
        <CanaryButton type={ButtonType.PRIMARY} onClick={handleSave}>
          Save
        </CanaryButton>
      </div>

      {/* Builder content */}
      <div className="flex-1 overflow-auto" style={{ backgroundColor: '#FAFAFA', padding: 24 }}>
        {/* Basic Information card */}
        <div
          style={{
            backgroundColor: '#FFF',
            border: '1px solid #E5E5E5',
            borderRadius: 8,
            padding: 24,
            marginBottom: 16,
          }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 500, color: '#000', margin: '0 0 16px 0' }}>
            Basic Information
          </h3>
          <CanaryInput
            label="Segment name"
            size={InputSize.NORMAL}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., VIP Loyalty Members"
            isRequired
          />
        </div>

        {/* Filter Rules card */}
        <div
          style={{
            backgroundColor: '#FFF',
            border: '1px solid #E5E5E5',
            borderRadius: 8,
            padding: 24,
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
            <h3 style={{ fontSize: 18, fontWeight: 500, color: '#000', margin: 0 }}>
              Filter Rules
            </h3>
            <CanaryButton
              type={ButtonType.ICON_SECONDARY}
              icon={<Icon path={mdiPlus} size={0.85} />}
              onClick={addRule}
            />
          </div>
          <p style={{ fontSize: 14, color: '#000', margin: '0 0 16px 0' }}>
            Define criteria to identify guests for this segment
          </p>

          <div className="flex flex-col" style={{ gap: 0 }}>
            {rules.map((rule, index) => {
              const isMultiInput = MULTI_VALUE_PROPERTIES.includes(rule.guestProperty as SegmentProperty);
              const isDropdown = DROPDOWN_PROPERTIES.includes(rule.guestProperty as SegmentProperty);
              const conditionOptions = rule.guestProperty ? getConditionOptions(rule.guestProperty) : CONDITION_OPTIONS_INCLUDES;
              const dropdownOptions = rule.guestProperty && isDropdown
                ? (DROPDOWN_VALUE_OPTIONS[rule.guestProperty] || []).map((v) => ({ value: v, label: v }))
                : [];

              return (
                <div key={rule.id}>
                  {/* AND/OR toggle — CanaryTabs rounded */}
                  {index > 0 && (
                    <div className="flex items-center justify-center" style={{ padding: '12px 0' }}>
                      <CanaryTabs
                        tabs={OPERATOR_TABS}
                        variant="rounded"
                        size="compact"
                        defaultTab={rule.operator || 'And'}
                        onChange={(tabId) => updateRule(rule.id, { operator: tabId as 'And' | 'Or' })}
                      />
                    </div>
                  )}

                  {/* Rule card */}
                  <div
                    style={{
                      border: '1px solid #E5E5E5',
                      borderRadius: 8,
                      padding: 16,
                    }}
                  >
                    {/* Rule header */}
                    <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                      <span style={{ fontSize: 16, fontWeight: 500, color: '#000', lineHeight: '1.5' }}>
                        Rule {index + 1}
                      </span>
                      {rules.length > 1 && (
                        <CanaryButton
                          type={ButtonType.ICON_SECONDARY}
                          icon={<Icon path={mdiClose} size={0.75} />}
                          onClick={() => removeRule(rule.id)}
                        />
                      )}
                    </div>

                    {/* Property + Condition selects */}
                    <div className="flex items-start" style={{ gap: 16, marginBottom: rule.guestProperty ? 16 : 0 }}>
                      <div style={{ flex: 1 }}>
                        <CanarySelect
                          label="Segment type"
                          size={InputSize.NORMAL}
                          value={rule.guestProperty}
                          placeholder="Select property"
                          options={SEGMENT_PROPERTIES.map((p) => ({ value: p, label: p }))}
                          onChange={(e) => {
                            const prop = e.target.value as SegmentProperty;
                            updateRule(rule.id, {
                              guestProperty: prop,
                              condition: getDefaultCondition(prop),
                              values: [],
                              dropdownValue: '',
                            });
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <CanarySelect
                          label="Condition"
                          size={InputSize.NORMAL}
                          value={rule.condition}
                          placeholder="Condition"
                          options={conditionOptions}
                          isDisabled={!rule.guestProperty}
                          onChange={(e) => updateRule(rule.id, { condition: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Value input */}
                    {rule.guestProperty && isMultiInput && (
                      <CanaryInputMultiple
                        label="Values"
                        size={InputSize.NORMAL}
                        values={rule.values}
                        onChange={(values) => updateRule(rule.id, { values })}
                        placeholder="Type and press Enter"
                      />
                    )}
                    {rule.guestProperty && isDropdown && (
                      <CanarySelect
                        label="Value"
                        size={InputSize.NORMAL}
                        value={rule.dropdownValue}
                        options={dropdownOptions}
                        onChange={(e) => updateRule(rule.id, { dropdownValue: e.target.value })}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
