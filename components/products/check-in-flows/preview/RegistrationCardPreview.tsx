'use client';

/**
 * RegistrationCardPreview
 *
 * Production-faithful registration card body, driven by FieldDef[] from
 * the configurator. Ported from feature/guest-check-in's RegistrationCard
 * but takes config as props instead of reading from a guest-preview store.
 *
 * Chrome (Reservation info FormSection, Hotel policies FormSection, policy
 * bottom sheet) is hardcoded since it's not yet configurable in our model.
 */

import React, { useState } from 'react';
import {
  CanaryInputUnderline,
  CanaryInputDateUnderline,
  CanaryInputPhoneUnderline,
  CanaryInputCreditCardUnderline,
  CanarySelectUnderline,
  CanaryTextAreaUnderline,
  InputSize,
  InputType,
} from '@canary-ui/components';
import Icon from '@mdi/react';
import {
  mdiChevronRight,
  mdiCheckboxBlankOutline,
  mdiCheckboxMarked,
} from '@mdi/js';

import type { FieldDef } from '@/lib/products/check-in-flows/types';
import { resolveText } from '@/lib/products/check-in-flows/types';
import { getFieldTypeMeta } from '@/lib/products/check-in-flows/field-types';
import { GuestSignaturePad } from '@/components/core/GuestSignaturePad';
import { GuestBottomSheet } from '@/components/core/GuestBottomSheet';

interface Props {
  fields: FieldDef[];
  language?: string;
  primaryColor?: string;
  showReservationInfo?: boolean;
  showHotelPolicies?: boolean;
}

export function RegistrationCardPreview({
  fields,
  language = 'en',
  primaryColor = '#926e27',
  showReservationInfo = true,
  showHotelPolicies = true,
}: Props) {
  const [policyOpen, setPolicyOpen] = useState(false);
  const [reservationInfoOpen, setReservationInfoOpen] = useState(false);
  const [policyAgreed, setPolicyAgreed] = useState(false);

  const signatureField = fields.find((f) => f.type === 'signature');
  const bodyFields = fields.filter((f) => f.type !== 'signature');

  return (
    <>
      <div className="flex flex-col guest-form" style={{ padding: 24, gap: 16 }}>
        {showReservationInfo && (
          <FormSection
            label="Reservation info"
            onClick={() => setReservationInfoOpen(true)}
          />
        )}

        {bodyFields.map((field) => (
          <FieldRenderer
            key={field.id}
            field={field}
            language={language}
            primaryColor={primaryColor}
          />
        ))}
      </div>

      {showHotelPolicies && (
        <div className="flex flex-col" style={{ padding: '8px 24px', gap: 0 }}>
          <FormSection
            label="Hotel policies"
            onClick={() => setPolicyOpen(true)}
          />
          <ThemedCheckbox
            checked={policyAgreed}
            onChange={() => setPolicyAgreed(!policyAgreed)}
            primaryColor={primaryColor}
          >
            I have read and agree to the{' '}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPolicyOpen(true);
              }}
              className="underline"
              style={{ background: 'transparent' }}
            >
              hotel policies
            </button>
          </ThemedCheckbox>
        </div>
      )}

      {signatureField && (
        <div style={{ padding: '16px 24px' }}>
          <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.5)', marginBottom: 8 }}>
            {resolveText(signatureField.label, language) || 'Signature'}
          </p>
          <GuestSignaturePad borderRadius="8px" />
        </div>
      )}

      <GuestBottomSheet
        isOpen={policyOpen}
        onClose={() => setPolicyOpen(false)}
        title="Policies"
      >
        <div className="flex flex-col" style={{ gap: 24 }}>
          <PolicySection
            title="Smoking"
            body="Statler New York maintains a smoke-free environment, ensuring the comfort and well-being of all guests. Smoking is prohibited throughout the property, including public areas, guestrooms, suites and patios. If this policy is violated, a fee will be applied with a minimum charge of $500."
          />
          <PolicySection
            title="Photography & Drones"
            body="For reasons of safety and privacy, the use of drones or any other remote-controlled aircraft is strictly forbidden at Statler New York. If you wish to capture professional photography during your stay, please contact our management team in advance."
          />
          <PolicySection
            title="Rate & Taxes"
            body="Rates are in U.S. dollars (USD) and are subject to availability and change. Additionally, rates are subject to a nightly 14.75% occupancy tax, a 5.875% state sales tax, and a $2.00 daily City Tourism Assessment Fee."
          />
          <PolicySection
            title="Cancellation"
            body="Reservations may be cancelled up to 48 hours prior to the scheduled arrival date without penalty. Cancellations made within 48 hours of arrival will be charged one night's room rate plus applicable taxes. No-shows will be charged the full reservation amount."
          />
          <PolicySection
            title="Check-In & Check-Out"
            body="Check-in time is 3:00 PM. Check-out time is 11:00 AM. Early check-in and late check-out are available upon request and subject to availability. An additional fee may apply for late check-out requests after 2:00 PM."
          />
          <PolicySection
            title="Pet Policy"
            body="Statler New York welcomes well-behaved dogs weighing 50 lbs or less. A non-refundable pet fee of $150 per stay applies. Pets must be leashed in all public areas and may not be left unattended in guest rooms. Service animals are welcome at no additional charge."
          />
          <PolicySection
            title="Parking"
            body="Valet parking is available at $75 per night with in-and-out privileges. Self-parking is not available at this location. Electric vehicle charging stations are available on a first-come, first-served basis at no additional charge for hotel guests."
          />
        </div>
      </GuestBottomSheet>

      <GuestBottomSheet
        isOpen={reservationInfoOpen}
        onClose={() => setReservationInfoOpen(false)}
        title="Reservation info"
      >
        <div className="flex flex-col" style={{ gap: 24 }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 500, lineHeight: '28px', color: '#000' }}>
              Statler New York
            </p>
            <p style={{ fontSize: 18, lineHeight: '28px', color: '#000' }}>
              151 West 54th Street, New York, NY 10019
            </p>
            <p style={{ fontSize: 18, lineHeight: '28px', color: '#000' }}>
              United States of America
            </p>
            <p style={{ fontSize: 18, lineHeight: '28px', color: '#000' }}>
              +1 (212) 555-0100
            </p>
          </div>
          <div
            style={{
              border: '1px solid rgba(0,0,0,0.15)',
              borderRadius: 8,
              padding: '12px 16px',
            }}
          >
            <ReservationRow label="Guest" value="Emily Smith" />
            <ReservationRow label="Check-in" value="Mar 16, 2026" />
            <ReservationRow label="Checkout" value="Mar 19, 2026" />
          </div>
        </div>
      </GuestBottomSheet>
    </>
  );
}

function FieldRenderer({
  field,
  language,
  primaryColor,
}: {
  field: FieldDef;
  language: string;
  primaryColor: string;
}) {
  const meta = getFieldTypeMeta(field.type);
  const label = resolveText(field.label, language);
  const placeholder = resolveText(field.placeholder, language);
  const required = field.required;

  if (meta.isStatic) {
    const content = resolveText(field.staticContent, language);
    if (field.type === 'header') {
      return (
        <h3 style={{ fontSize: 18, fontWeight: 500, lineHeight: '28px', color: '#000' }}>
          {content}
        </h3>
      );
    }
    if (field.type === 'list') {
      const items = content.split('\n').filter(Boolean);
      return (
        <ul style={{ paddingLeft: 20, fontSize: 16, lineHeight: '24px', color: '#000' }}>
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    }
    return (
      <p style={{ fontSize: 16, lineHeight: '24px', color: '#000' }}>{content}</p>
    );
  }

  const labelText = required ? `${label} (required)` : label;

  switch (field.type) {
    case 'text-input':
      return <CanaryInputUnderline label={labelText} size={InputSize.LARGE} />;
    case 'email':
      return (
        <CanaryInputUnderline
          label={labelText}
          type={InputType.EMAIL}
          size={InputSize.LARGE}
        />
      );
    case 'phone':
      return <CanaryInputPhoneUnderline label={labelText} size={InputSize.LARGE} />;
    case 'number':
      return (
        <CanaryInputUnderline
          label={labelText}
          type={InputType.NUMBER}
          size={InputSize.LARGE}
        />
      );
    case 'date':
      return <CanaryInputDateUnderline label={labelText} size={InputSize.LARGE} />;
    case 'time-select':
      return (
        <CanarySelectUnderline
          label={labelText}
          placeholder={placeholder || labelText}
          options={[
            { value: '12pm', label: '12:00 PM' },
            { value: '1pm', label: '1:00 PM' },
            { value: '2pm', label: '2:00 PM' },
            { value: '3pm', label: '3:00 PM' },
            { value: '4pm', label: '4:00 PM' },
            { value: '5pm', label: '5:00 PM' },
            { value: '6pm', label: '6:00 PM' },
            { value: 'after7', label: 'After 7:00 PM' },
          ]}
          size={InputSize.LARGE}
        />
      );
    case 'text-area':
      return <CanaryTextAreaUnderline label={labelText} size={InputSize.LARGE} />;
    case 'dropdown':
      return (
        <CanarySelectUnderline
          label={labelText}
          placeholder={placeholder || labelText}
          options={
            field.options?.map((o) => ({
              value: o.value,
              label: resolveText(o.label, language),
            })) ?? []
          }
          size={InputSize.LARGE}
        />
      );
    case 'country':
      return (
        <CanarySelectUnderline
          label={labelText}
          placeholder="Select country"
          options={[
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
          ]}
          size={InputSize.LARGE}
        />
      );
    case 'credit-card':
      return (
        <CanaryInputCreditCardUnderline label={labelText} size={InputSize.LARGE} />
      );
    case 'string-radio':
    case 'boolean-radio': {
      const opts =
        field.type === 'boolean-radio'
          ? [
              { id: 'yes', value: 'yes', label: 'Yes' },
              { id: 'no', value: 'no', label: 'No' },
            ]
          : (field.options ?? []).map((o) => ({
              id: o.id,
              value: o.value,
              label: resolveText(o.label, language),
            }));
      return (
        <div>
          <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.6)', marginBottom: 8 }}>
            {labelText}
          </p>
          {opts.map((opt) => (
            <label
              key={opt.id}
              className="flex items-center gap-2"
              style={{ padding: '8px 0', fontSize: 16, color: '#000' }}
            >
              <input type="radio" name={field.id} disabled />
              {opt.label}
            </label>
          ))}
        </div>
      );
    }
    case 'checkbox':
      return (
        <ThemedCheckbox
          checked={false}
          onChange={() => {}}
          primaryColor={primaryColor}
        >
          {labelText}
        </ThemedCheckbox>
      );
    case 'checkbox-group':
      return (
        <div>
          <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.6)', marginBottom: 8 }}>
            {labelText}
          </p>
          {field.options?.map((opt) => (
            <ThemedCheckbox
              key={opt.id}
              checked={false}
              onChange={() => {}}
              primaryColor={primaryColor}
            >
              {resolveText(opt.label, language)}
            </ThemedCheckbox>
          ))}
        </div>
      );
    default:
      return <CanaryInputUnderline label={labelText} size={InputSize.LARGE} />;
  }
}

function ThemedCheckbox({
  checked,
  onChange,
  primaryColor,
  children,
}: {
  checked: boolean;
  onChange: () => void;
  primaryColor: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-start gap-2 cursor-pointer"
      style={{ padding: '16px 4px' }}
      onClick={onChange}
    >
      <div className="flex-shrink-0 mt-0.5">
        <Icon
          path={checked ? mdiCheckboxMarked : mdiCheckboxBlankOutline}
          size={1}
          color={checked ? primaryColor : '#999'}
        />
      </div>
      <span style={{ fontSize: 18, lineHeight: '28px', color: '#000' }}>
        {children}
      </span>
    </div>
  );
}

function FormSection({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between overflow-hidden"
      style={{
        border: '1px solid rgba(0,0,0,0.25)',
        borderRadius: 4,
        padding: '12px 16px',
        backgroundColor: 'transparent',
      }}
    >
      <span
        style={{
          fontSize: 18,
          fontWeight: 500,
          lineHeight: '28px',
          color: '#000',
        }}
      >
        {label}
      </span>
      <div className="p-3 -mr-3">
        <Icon path={mdiChevronRight} size={1} color="#000" />
      </div>
    </button>
  );
}

function PolicySection({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p
        style={{
          fontSize: 20,
          fontWeight: 500,
          lineHeight: '30px',
          color: '#000',
        }}
      >
        {title}
      </p>
      <p style={{ fontSize: 18, lineHeight: '28px', color: '#000' }}>{body}</p>
    </div>
  );
}

function ReservationRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between" style={{ padding: '8px 0' }}>
      <span style={{ fontSize: 16, color: '#000' }}>{label}</span>
      <span style={{ fontSize: 16, fontWeight: 500, color: '#000' }}>{value}</span>
    </div>
  );
}
