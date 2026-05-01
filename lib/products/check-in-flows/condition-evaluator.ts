/**
 * Condition Evaluator
 *
 * Evaluates Condition[] arrays against a simulated PreviewContext.
 * Used by the live preview to determine which steps/fields/options
 * should be shown for a given guest context.
 *
 * Semantics:
 * - An empty condition list means "always show" (step/field) or
 *   "always visible" (option).
 * - Conditions are evaluated as implicit AND. All must match for the
 *   aggregate decision.
 * - For step/field: show action wins over hide; hide/require only
 *   apply when condition is met.
 * - For option: show-option/hide-option similarly.
 */

import type {
  Condition,
  PreviewContext,
  ConditionOperator,
} from './types';

// ── Core evaluator for a single condition ────────────────

export function evaluateCondition(
  condition: Condition,
  ctx: PreviewContext
): boolean {
  // Incomplete conditions (no parameter or operator chosen yet) are
  // treated as no-ops so they don't block visibility while the user
  // is still building the rule.
  if (!condition.parameter || !condition.operator) return true;
  // Form-response without a chosen gate atom is also a no-op — the user
  // is still authoring.
  if (condition.parameter === 'form-response' && !condition.formAtomId) return true;
  const actual = resolveParameter(condition, ctx);
  return evaluateOperator(actual, condition.operator, condition.value);
}

function resolveParameter(condition: Condition, ctx: PreviewContext): any {
  // Form-state: read the simulated guest answer for the gate atom.
  if (condition.parameter === 'form-response') {
    if (!condition.formAtomId) return undefined;
    return ctx.formResponses[condition.formAtomId];
  }
  switch (condition.parameter) {
    case 'nationality': return ctx.guestNationalityCode;
    case 'age': return ctx.guestAge;
    case 'loyalty-tier': return ctx.loyaltyTier;
    case 'loyalty-member': return ctx.loyaltyTier !== 'none';
    case 'returning-guest': return ctx.isReturningGuest;
    case 'reservation-source': return ctx.reservationSource;
    case 'rate-code': return ctx.rateCode;
    case 'length-of-stay': return ctx.lengthOfStay;
    default: return undefined;
  }
}

function evaluateOperator(actual: any, op: ConditionOperator, expected: any): boolean {
  switch (op) {
    case 'equals': return actual === expected;
    case 'not-equals': return actual !== expected;
    case 'in': return Array.isArray(expected) && expected.includes(actual);
    case 'not-in': return Array.isArray(expected) && !expected.includes(actual);
    case 'greater-than': return typeof actual === 'number' && typeof expected === 'number' && actual > expected;
    case 'less-than': return typeof actual === 'number' && typeof expected === 'number' && actual < expected;
    case 'is-true': return actual === true;
    case 'is-false': return actual === false;
  }
}

// ── Aggregation helpers ──────────────────────────────────

/** Should a step or field be rendered given its conditions and the context? */
export function shouldShow(conditions: Condition[] | undefined, ctx: PreviewContext): boolean {
  if (!conditions || conditions.length === 0) return true;

  // Split by action.
  const showConds = conditions.filter((c) => c.action === 'show' || c.action === 'show-option');
  const hideConds = conditions.filter((c) => c.action === 'hide' || c.action === 'hide-option');

  // If there are show-conditions, ALL must match.
  if (showConds.length > 0) {
    const allShowMatch = showConds.every((c) => evaluateCondition(c, ctx));
    if (!allShowMatch) return false;
  }

  // Any hide-condition that matches hides.
  if (hideConds.some((c) => evaluateCondition(c, ctx))) return false;

  return true;
}

/** Should a field be "required" given field-level require conditions? */
export function isRequiredBecauseOfConditions(
  conditions: Condition[] | undefined,
  ctx: PreviewContext
): boolean {
  if (!conditions) return false;
  const requireConds = conditions.filter((c) => c.action === 'require');
  if (requireConds.length === 0) return false;
  return requireConds.some((c) => evaluateCondition(c, ctx));
}
