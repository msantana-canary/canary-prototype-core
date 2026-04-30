'use client';

/**
 * AtomPreview — inline guest-facing preview of a single InputAtom.
 *
 * Lives at the top of AtomDetailPane so CS can see how their label /
 * placeholder / helper / options manifest in the guest-facing UI without
 * jumping to the Flows tab. Uses the same underline-styled primitives as
 * RegistrationCardPreview and the same Statler theme variables, so the
 * preview matches the live flow exactly.
 *
 * v1 scope: InputAtom only. Preset + CopyBlock atoms get inline previews
 * later. Variant simulation deferred — preview always shows the default
 * variant. Atom-level visibility conditions are ignored (we preview
 * appearance, not whether the field appears).
 */

import React from 'react';
import {
  CanaryInputUnderline,
  CanaryInputDateUnderline,
  CanaryInputPhoneUnderline,
  CanarySelectUnderline,
  CanaryTextAreaUnderline,
  InputSize,
  InputType,
  colors,
} from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiCheckboxBlankOutline } from '@mdi/js';

import type { InputAtom } from '@/lib/products/check-in-flows/types';
import { resolveText } from '@/lib/products/check-in-flows/types';
import { GuestSignaturePad } from '@/components/core/GuestSignaturePad';

interface Props {
  atom: InputAtom;
}

// Match RegistrationCardPreview's hardcoded country list so the preview
// renders identically to the live flow.
const PREVIEW_COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'IT', label: 'Italy' },
  { value: 'FR', label: 'France' },
  { value: 'DE', label: 'Germany' },
  { value: 'ES', label: 'Spain' },
  { value: 'JP', label: 'Japan' },
  { value: 'AU', label: 'Australia' },
  { value: 'BR', label: 'Brazil' },
];

const PRIMARY = '#926e27';
const PAGE_BG = '#fcf9f4';

export function AtomPreview({ atom }: Props) {
  const language = 'en';
  const label = resolveText(atom.label, language);
  const placeholder = resolveText(atom.placeholder, language);
  const helper = resolveText(atom.helperText, language);
  const labelText = atom.required ? `${label} (required)` : label || 'Untitled field';

  // Default variant only. Variant simulation is a future enhancement.
  const defaultOptions =
    atom.optionVariants?.find((v) => !v.conditions || v.conditions.length === 0)
      ?.options ?? [];

  return (
    <div
      className="guest-theme rounded-md"
      style={
        {
          backgroundColor: PAGE_BG,
          border: `1px solid ${colors.colorBlack7}`,
          fontFamily: 'Roboto, sans-serif',
          '--canaryThemeHeaderColor': PRIMARY,
          '--canaryThemeButtonColor': PRIMARY,
          '--canaryThemeBackgroundColor': PAGE_BG,
          '--canaryThemeFontColor': '#000000',
          '--canaryThemeFontColorButton': '#ffffff',
          '--canaryThemeFontColorHeader': '#ffffff',
          '--canaryThemeCardBackgroundColor': '#ffffff',
        } as React.CSSProperties
      }
    >
      {/* Strip header — small, unobtrusive */}
      <div
        className="px-4 py-2 flex items-center justify-between"
        style={{
          borderBottom: `1px solid rgba(0,0,0,0.06)`,
          backgroundColor: 'rgba(146,110,39,0.06)',
        }}
      >
        <span
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{ color: PRIMARY }}
        >
          Guest preview
        </span>
        <span className="text-[10px]" style={{ color: 'rgba(0,0,0,0.5)' }}>
          How this looks in the flow
        </span>
      </div>

      {/* Field rendering — matches RegistrationCardPreview output */}
      <div className="px-5 py-4">
        <FieldPreview
          atom={atom}
          labelText={labelText}
          placeholder={placeholder}
          helper={helper}
          defaultOptions={defaultOptions}
          language={language}
        />
      </div>
    </div>
  );
}

function FieldPreview({
  atom,
  labelText,
  placeholder,
  helper,
  defaultOptions,
  language,
}: {
  atom: InputAtom;
  labelText: string;
  placeholder: string;
  helper: string;
  defaultOptions: { value: string; label: { [k: string]: string } }[];
  language: string;
}) {
  const helperProp = helper || undefined;

  switch (atom.fieldType) {
    case 'text-input':
      return (
        <CanaryInputUnderline
          label={labelText}
          placeholder={placeholder || undefined}
          helperText={helperProp}
          size={InputSize.LARGE}
        />
      );
    case 'email':
      return (
        <CanaryInputUnderline
          label={labelText}
          type={InputType.EMAIL}
          placeholder={placeholder || undefined}
          helperText={helperProp}
          size={InputSize.LARGE}
        />
      );
    case 'phone':
      return (
        <CanaryInputPhoneUnderline
          label={labelText}
          helperText={helperProp}
          size={InputSize.LARGE}
        />
      );
    case 'number':
      return (
        <CanaryInputUnderline
          label={labelText}
          type={InputType.NUMBER}
          placeholder={placeholder || undefined}
          helperText={helperProp}
          size={InputSize.LARGE}
        />
      );
    case 'date':
      return (
        <CanaryInputDateUnderline
          label={labelText}
          helperText={helperProp}
          size={InputSize.LARGE}
        />
      );
    case 'text-area':
      return (
        <CanaryTextAreaUnderline
          label={labelText}
          placeholder={placeholder || undefined}
          helperText={helperProp}
          size={InputSize.LARGE}
        />
      );
    case 'country':
      return (
        <CanarySelectUnderline
          label={labelText}
          placeholder="Select country"
          helperText={helperProp}
          options={PREVIEW_COUNTRIES}
          size={InputSize.LARGE}
        />
      );
    case 'dropdown':
      return (
        <CanarySelectUnderline
          label={labelText}
          placeholder={placeholder || labelText}
          helperText={helperProp}
          options={defaultOptions.map((o) => ({
            value: o.value,
            label: resolveText(o.label, language),
          }))}
          size={InputSize.LARGE}
        />
      );
    case 'string-radio':
    case 'boolean-radio': {
      const opts =
        atom.fieldType === 'boolean-radio'
          ? [
              { id: 'yes', value: 'yes', label: 'Yes' },
              { id: 'no', value: 'no', label: 'No' },
            ]
          : defaultOptions.map((o) => ({
              id: o.value,
              value: o.value,
              label: resolveText(o.label, language),
            }));
      return (
        <div>
          <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.6)', marginBottom: 8 }}>
            {labelText}
          </p>
          {opts.length === 0 ? (
            <p className="text-[12px] italic" style={{ color: 'rgba(0,0,0,0.4)' }}>
              Add options to see them previewed.
            </p>
          ) : (
            opts.map((opt) => (
              <label
                key={opt.id}
                className="flex items-center gap-2"
                style={{ padding: '12px 4px', fontSize: 16, color: '#000' }}
              >
                <input type="radio" name={`preview-${atom.id}`} disabled />
                {opt.label}
              </label>
            ))
          )}
          {helper && (
            <p className="text-[12px] mt-2" style={{ color: 'rgba(0,0,0,0.5)' }}>
              {helper}
            </p>
          )}
        </div>
      );
    }
    case 'checkbox':
      return (
        <div>
          <div
            className="flex items-start gap-2"
            style={{ padding: '12px 4px' }}
          >
            <Icon
              path={mdiCheckboxBlankOutline}
              size={1}
              color="#999"
            />
            <span style={{ fontSize: 16, lineHeight: '24px', color: '#000' }}>
              {labelText}
            </span>
          </div>
          {helper && (
            <p className="text-[12px]" style={{ color: 'rgba(0,0,0,0.5)' }}>
              {helper}
            </p>
          )}
        </div>
      );
    case 'checkbox-group':
      return (
        <div>
          <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.6)', marginBottom: 8 }}>
            {labelText}
          </p>
          {defaultOptions.length === 0 ? (
            <p className="text-[12px] italic" style={{ color: 'rgba(0,0,0,0.4)' }}>
              Add options to see them previewed.
            </p>
          ) : (
            defaultOptions.map((opt) => (
              <div
                key={opt.value}
                className="flex items-start gap-2"
                style={{ padding: '12px 4px' }}
              >
                <Icon
                  path={mdiCheckboxBlankOutline}
                  size={1}
                  color="#999"
                />
                <span
                  style={{ fontSize: 16, lineHeight: '24px', color: '#000' }}
                >
                  {resolveText(opt.label, language)}
                </span>
              </div>
            ))
          )}
          {helper && (
            <p className="text-[12px] mt-2" style={{ color: 'rgba(0,0,0,0.5)' }}>
              {helper}
            </p>
          )}
        </div>
      );
    case 'signature':
      return (
        <div>
          <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.6)', marginBottom: 8 }}>
            {labelText}
          </p>
          <GuestSignaturePad />
          {helper && (
            <p className="text-[12px] mt-2" style={{ color: 'rgba(0,0,0,0.5)' }}>
              {helper}
            </p>
          )}
        </div>
      );
    default:
      return (
        <CanaryInputUnderline
          label={labelText}
          helperText={helperProp}
          size={InputSize.LARGE}
        />
      );
  }
}
