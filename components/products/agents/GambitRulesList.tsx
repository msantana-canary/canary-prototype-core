'use client';

/**
 * GambitRulesList — Priority-ordered IF/THEN rules list.
 *
 * Each rule is a row: priority number + condition + arrow + action + toggle.
 * "DEFAULT" rule always at bottom. Add rule button at bottom.
 * Disabled rules shown dimmed.
 */

import React, { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiDragVertical,
  mdiPlusOutline,
  mdiDeleteOutline,
} from '@mdi/js';
import {
  CanaryButton,
  CanarySwitch,
  CanaryInput,
  ButtonType,
  ButtonSize,
  InputSize,
  colors,
} from '@canary-ui/components';
import type { GambitRule } from '@/lib/products/agents/types';

interface GambitRulesListProps {
  rules: GambitRule[];
  onChange: (rules: GambitRule[]) => void;
  readOnly?: boolean;
}

export default function GambitRulesList({ rules, onChange, readOnly }: GambitRulesListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCondition, setNewCondition] = useState('');
  const [newAction, setNewAction] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Separate DEFAULT rule from the rest
  const defaultRule = rules.find((r) => r.condition === 'DEFAULT');
  const nonDefaultRules = rules.filter((r) => r.condition !== 'DEFAULT');

  const handleToggle = (ruleId: string) => {
    const updated = rules.map((r) =>
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    );
    onChange(updated);
  };

  const handleDelete = (ruleId: string) => {
    onChange(rules.filter((r) => r.id !== ruleId));
  };

  const handleAdd = () => {
    if (!newCondition.trim() || !newAction.trim()) return;
    const newRule: GambitRule = {
      id: `rule-${Date.now()}`,
      condition: newCondition.trim(),
      action: newAction.trim(),
      enabled: true,
    };
    // Insert before DEFAULT rule
    const idx = rules.findIndex((r) => r.condition === 'DEFAULT');
    const updated = [...rules];
    if (idx >= 0) {
      updated.splice(idx, 0, newRule);
    } else {
      updated.push(newRule);
    }
    onChange(updated);
    setNewCondition('');
    setNewAction('');
    setShowAddForm(false);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...nonDefaultRules];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onChange(defaultRule ? [...updated, defaultRule] : updated);
  };

  const handleMoveDown = (index: number) => {
    if (index >= nonDefaultRules.length - 1) return;
    const updated = [...nonDefaultRules];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onChange(defaultRule ? [...updated, defaultRule] : updated);
  };

  if (rules.length === 0) {
    return (
      <div
        style={{
          padding: 24,
          textAlign: 'center',
          border: `1px dashed ${colors.colorBlack6}`,
          borderRadius: 8,
          backgroundColor: colors.colorWhite,
        }}
      >
        <p style={{ fontSize: '0.875rem', color: colors.colorBlack4, margin: '0 0 12px' }}>
          No rules configured yet. Add rules to control how the agent responds to specific situations.
        </p>
        {!readOnly && (
          <CanaryButton
            type={ButtonType.SHADED}
            size={ButtonSize.COMPACT}
            icon={<Icon path={mdiPlusOutline} size={0.7} />}
            onClick={() => setShowAddForm(true)}
          >
            Add Rule
          </CanaryButton>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Rules list */}
      <div
        style={{
          borderRadius: 8,
          border: `1px solid ${colors.colorBlack6}`,
          backgroundColor: colors.colorWhite,
          overflow: 'hidden',
        }}
      >
        {nonDefaultRules.map((rule, index) => (
          <RuleRow
            key={rule.id}
            rule={rule}
            priority={index + 1}
            isEditing={editingId === rule.id}
            onEdit={() => setEditingId(editingId === rule.id ? null : rule.id)}
            onToggle={() => handleToggle(rule.id)}
            onDelete={() => handleDelete(rule.id)}
            onMoveUp={() => handleMoveUp(index)}
            onMoveDown={() => handleMoveDown(index)}
            canMoveUp={index > 0}
            canMoveDown={index < nonDefaultRules.length - 1}
            readOnly={readOnly}
            hasBorder={index > 0}
          />
        ))}

        {/* DEFAULT rule — always at bottom, can't be reordered */}
        {defaultRule && (
          <RuleRow
            rule={defaultRule}
            priority={nonDefaultRules.length + 1}
            isDefault
            isEditing={false}
            onToggle={() => handleToggle(defaultRule.id)}
            readOnly={readOnly}
            hasBorder={nonDefaultRules.length > 0}
          />
        )}
      </div>

      {/* Add rule form */}
      {showAddForm && !readOnly && (
        <div
          style={{
            marginTop: 12,
            padding: 16,
            borderRadius: 8,
            border: `1px solid ${colors.colorBlack6}`,
            backgroundColor: colors.colorWhite,
          }}
        >
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: colors.colorBlack2, marginBottom: 10 }}>
            New Rule
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <CanaryInput
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              placeholder="IF condition (e.g., IF guest mentions allergy)"
              size={InputSize.NORMAL}
            />
            <CanaryInput
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
              placeholder="THEN action (e.g., Flag for kitchen team review)"
              size={InputSize.NORMAL}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <CanaryButton
                type={ButtonType.TEXT}
                size={ButtonSize.COMPACT}
                onClick={() => {
                  setShowAddForm(false);
                  setNewCondition('');
                  setNewAction('');
                }}
              >
                Cancel
              </CanaryButton>
              <CanaryButton
                type={ButtonType.PRIMARY}
                size={ButtonSize.COMPACT}
                onClick={handleAdd}
                isDisabled={!newCondition.trim() || !newAction.trim()}
              >
                Add Rule
              </CanaryButton>
            </div>
          </div>
        </div>
      )}

      {/* Add rule button */}
      {!showAddForm && !readOnly && (
        <div style={{ marginTop: 12 }}>
          <CanaryButton
            type={ButtonType.SHADED}
            size={ButtonSize.COMPACT}
            icon={<Icon path={mdiPlusOutline} size={0.7} />}
            onClick={() => setShowAddForm(true)}
          >
            Add Rule
          </CanaryButton>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// RuleRow — single rule in the list
// ---------------------------------------------------------------------------

function RuleRow({
  rule,
  priority,
  isDefault,
  isEditing,
  onEdit,
  onToggle,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  readOnly,
  hasBorder,
}: {
  rule: GambitRule;
  priority: number;
  isDefault?: boolean;
  isEditing: boolean;
  onEdit?: () => void;
  onToggle: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  readOnly?: boolean;
  hasBorder?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 14px',
        borderTop: hasBorder ? `1px solid ${colors.colorBlack6}` : 'none',
        opacity: rule.enabled ? 1 : 0.45,
        transition: 'opacity 0.15s ease',
        backgroundColor: isDefault ? colors.colorBlack7 : 'transparent',
      }}
    >
      {/* Drag handle / priority indicator */}
      {!isDefault && !readOnly ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            cursor: 'grab',
            flexShrink: 0,
          }}
          title="Drag to reorder"
        >
          <Icon path={mdiDragVertical} size={0.7} color={colors.colorBlack4} />
        </div>
      ) : (
        <div style={{ width: 18, flexShrink: 0 }} />
      )}

      {/* Priority number */}
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          backgroundColor: isDefault ? colors.colorBlack5 : colors.colorBlueDark5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: isDefault ? colors.colorWhite : colors.colorBlueDark1,
          flexShrink: 0,
        }}
      >
        {priority}
      </div>

      {/* Rule content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: isDefault ? colors.colorBlack3 : colors.colorBlack2,
              fontFamily: isDefault ? 'inherit' : 'inherit',
            }}
          >
            {rule.condition}
          </span>
          <span style={{ fontSize: '0.8125rem', color: colors.colorBlack4 }}>
            {'\u2192'}
          </span>
          <span
            style={{
              fontSize: '0.8125rem',
              color: colors.colorBlack3,
              flex: 1,
              minWidth: 0,
            }}
          >
            {rule.action}
          </span>
        </div>
      </div>

      {/* Actions */}
      {!readOnly && !isDefault && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            opacity: 0.5,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5'; }}
          title="Delete rule"
        >
          <Icon path={mdiDeleteOutline} size={0.65} color={colors.colorBlack3} />
        </button>
      )}

      {/* Toggle */}
      <div style={{ flexShrink: 0 }}>
        <CanarySwitch
          checked={rule.enabled}
          onChange={() => onToggle()}
          disabled={readOnly}
        />
      </div>
    </div>
  );
}
