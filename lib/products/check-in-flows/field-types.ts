/**
 * Field Type Catalog
 *
 * Metadata for each supported FieldType, modeled after production's
 * EditorElementFactory. Used by the field-picker UI in the schema-form
 * editor.
 */

import {
  mdiFormTextbox,
  mdiFormTextarea,
  mdiEmailOutline,
  mdiPhoneOutline,
  mdiPound,
  mdiCalendarOutline,
  mdiEarth,
  mdiFormDropdown,
  mdiRadioboxMarked,
  mdiCheckboxMarkedOutline,
  mdiCheckboxMultipleMarkedOutline,
  mdiPenPlus,
  mdiToggleSwitchOutline,
} from '@mdi/js';

import type { FieldType } from './types';

export type FieldTypeCategory = 'input' | 'selection' | 'specialized';

export interface FieldTypeMeta {
  id: FieldType;
  displayName: string;
  description: string;
  icon: string;      // @mdi/js path
  category: FieldTypeCategory;
  supportsOptions: boolean;     // has user-editable options array
}

export const FIELD_TYPES: FieldTypeMeta[] = [
  // Input
  { id: 'text-input', displayName: 'Text Input', description: 'Single-line text', icon: mdiFormTextbox, category: 'input', supportsOptions: false },
  { id: 'text-area', displayName: 'Text Area', description: 'Multi-line text', icon: mdiFormTextarea, category: 'input', supportsOptions: false },
  { id: 'email', displayName: 'Email', description: 'Email with validation', icon: mdiEmailOutline, category: 'input', supportsOptions: false },
  { id: 'phone', displayName: 'Phone', description: 'International phone number', icon: mdiPhoneOutline, category: 'input', supportsOptions: false },
  { id: 'number', displayName: 'Number', description: 'Numeric input', icon: mdiPound, category: 'input', supportsOptions: false },
  { id: 'date', displayName: 'Date', description: 'Date picker', icon: mdiCalendarOutline, category: 'input', supportsOptions: false },

  // Selection
  { id: 'country', displayName: 'Country', description: 'Country dropdown (ISO list)', icon: mdiEarth, category: 'selection', supportsOptions: false },
  { id: 'dropdown', displayName: 'Dropdown', description: 'Custom dropdown with hotel-provided options', icon: mdiFormDropdown, category: 'selection', supportsOptions: true },
  { id: 'boolean-radio', displayName: 'Yes/No', description: 'Two-option radio', icon: mdiToggleSwitchOutline, category: 'selection', supportsOptions: false },
  { id: 'string-radio', displayName: 'Radio Group', description: 'Single-select radio buttons', icon: mdiRadioboxMarked, category: 'selection', supportsOptions: true },
  { id: 'checkbox', displayName: 'Checkbox', description: 'Single checkbox', icon: mdiCheckboxMarkedOutline, category: 'selection', supportsOptions: false },
  { id: 'checkbox-group', displayName: 'Checkbox Group', description: 'Multi-select checkboxes', icon: mdiCheckboxMultipleMarkedOutline, category: 'selection', supportsOptions: true },

  // Specialized
  { id: 'signature', displayName: 'Signature', description: 'Digital signature pad', icon: mdiPenPlus, category: 'specialized', supportsOptions: false },
];

export const FIELD_TYPE_MAP: Record<FieldType, FieldTypeMeta> = FIELD_TYPES.reduce(
  (acc, meta) => ({ ...acc, [meta.id]: meta }),
  {} as Record<FieldType, FieldTypeMeta>
);

export function getFieldTypeMeta(id: FieldType): FieldTypeMeta {
  return FIELD_TYPE_MAP[id];
}

export const FIELD_TYPES_BY_CATEGORY: Record<FieldTypeCategory, FieldTypeMeta[]> = {
  input: FIELD_TYPES.filter((f) => f.category === 'input'),
  selection: FIELD_TYPES.filter((f) => f.category === 'selection'),
  specialized: FIELD_TYPES.filter((f) => f.category === 'specialized'),
};
