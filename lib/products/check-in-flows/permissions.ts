/**
 * Hotel permissions helper
 *
 * Describes what a hotel user can edit when viewing the configurator.
 * Most structural edits are CS-only; specific per-step-template edits
 * are unlocked for hotels. The granted set is lightly editable by CS
 * in a production system — for the prototype we hardcode a reasonable
 * default.
 */

import type { StepTemplateId } from './types';

/**
 * Step templates whose CONTENT (copy, amount, etc.) can be edited by a
 * hotel user. Structure (fields, conditions, step order) is still
 * CS-only for these, but the preset content is theirs to tweak.
 */
const HOTEL_EDITABLE_TEMPLATES: ReadonlySet<StepTemplateId> = new Set([
  'id-consent',          // Localized consent copy + CTA — safe to customize
  'loyalty-welcome',      // Welcome greeting
  'completion',           // Thank-you message
]);

export function isStepContentEditableByHotel(templateId: StepTemplateId): boolean {
  return HOTEL_EDITABLE_TEMPLATES.has(templateId);
}

/**
 * Determine the effective read-only state for a given step given the
 * current role. Hotels get read-only by default; their content-editable
 * templates flip them back to editable for that step's content ONLY.
 *
 * Structural things (remove step, reorder, change field schema,
 * edit conditions) remain CS-only regardless.
 */
export function effectiveReadOnly(params: {
  role: 'cs' | 'hotel';
  templateId: StepTemplateId;
  scope: 'content' | 'structure';
}): boolean {
  if (params.role === 'cs') return false;
  // Hotel role
  if (params.scope === 'structure') return true;
  // content scope
  return !isStepContentEditableByHotel(params.templateId);
}
