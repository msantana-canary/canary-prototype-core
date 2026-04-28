'use client';

import React, { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiChevronDown,
  mdiChevronUp,
  mdiCardAccountDetailsOutline,
  mdiCreditCardOutline,
  mdiSafeSquareOutline,
  mdiAccountGroupOutline,
  mdiCogOutline,
  mdiCalendarOutline,
  mdiEmailOutline,
  mdiWeb,
  mdiCellphone,
  mdiTabletCellphone,
  mdiMonitor,
  mdiApplicationOutline,
} from '@mdi/js';

const SURFACE_ICON: Record<string, string> = {
  'web': mdiWeb,
  'mobile-web': mdiCellphone,
  'tablet-reg': mdiTabletCellphone,
  'kiosk': mdiMonitor,
  'mobile-app': mdiApplicationOutline,
};
import {
  CanaryCard,
  CanarySelect,
  CanaryInput,
  CanarySwitch,
  CanaryTag,
  CanaryAlert,
  CanaryTextArea,
  InputSize,
  InputType,
  TagColor,
  TagSize,
  colors,
} from '@canary-ui/components';
import { useConfigStore, useGeneratedFlows } from '@/lib/products/check-in-flows/store';
import type {
  CheckInConfig,
  FieldVisibility,
  IdStepMode,
  CreditCardStepMode,
  CreditCardUploadPolicy,
  DepositStrategy,
  GuestStepMode,
  CutoffDay,
  FlowDefinition,
} from '@/lib/products/check-in-flows/types';
import { getStepTemplateMeta } from '@/lib/products/check-in-flows/step-templates';

// ── Constants ────────────────────────────────────────────

const VISIBILITY_OPTIONS = [
  { value: 'REQUIRED', label: 'Required' },
  { value: 'OPTIONAL', label: 'Optional' },
  { value: 'READONLY', label: 'Read-only' },
  { value: 'HIDDEN', label: 'Hidden' },
];

const OCR_FIELDS = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'secondLastName', label: 'Second Last Name' },
  { key: 'gender', label: 'Gender' },
  { key: 'dateOfBirth', label: 'Date of Birth' },
  { key: 'nationality', label: 'Nationality' },
  { key: 'country', label: 'Country' },
  { key: 'documentNumber', label: 'Document Number' },
  { key: 'personalNumber', label: 'Personal Number' },
  { key: 'countryOfIssue', label: 'Country of Issue' },
  { key: 'dateOfIssue', label: 'Date of Issue' },
  { key: 'dateOfExpiry', label: 'Date of Expiry' },
];

const ADDITIONAL_GUEST_FIELDS = [
  { key: 'fullName', label: 'Full Name' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'dob', label: 'Date of Birth' },
  { key: 'gender', label: 'Gender' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'nationality', label: 'Nationality' },
  { key: 'id', label: 'ID Upload' },
  { key: 'idNumber', label: 'ID Number' },
  { key: 'address', label: 'Address' },
  { key: 'postalCode', label: 'Postal Code' },
];

const ID_TYPE_OPTIONS = [
  { value: 'passport', label: 'Passport' },
  { value: 'drivers-license', label: "Driver's License" },
  { value: 'national-id', label: 'National ID' },
  { value: 'residence-permit', label: 'Residence Permit' },
];

const CARD_TYPE_OPTIONS = [
  { value: 'debit', label: 'Debit' },
  { value: 'credit', label: 'Credit' },
  { value: 'prepaid', label: 'Prepaid' },
  { value: 'unknown', label: 'Unknown' },
];

const CARD_NETWORK_OPTIONS = [
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' },
  { value: 'amex', label: 'Amex' },
  { value: 'discover', label: 'Discover' },
  { value: 'diners', label: 'Diners Club' },
  { value: 'jcb', label: 'JCB' },
];

// ── Helpers ──────────────────────────────────────────────

function toggleArrayItem(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item];
}

function idModeSummary(mode: IdStepMode): { label: string; color: TagColor } {
  switch (mode) {
    case 'REQUIRED_WITH_OCR': return { label: 'Required + OCR', color: TagColor.INFO };
    case 'REQUIRED': return { label: 'Required', color: TagColor.INFO };
    case 'OPTIONAL_WITH_OCR': return { label: 'Optional + OCR', color: TagColor.WARNING };
    case 'OPTIONAL': return { label: 'Optional', color: TagColor.WARNING };
    case 'DISABLED': return { label: 'Disabled', color: TagColor.DEFAULT };
  }
}

function stepModeSummary(mode: string): { label: string; color: TagColor } {
  switch (mode) {
    case 'REQUIRED': return { label: 'Required', color: TagColor.INFO };
    case 'OPTIONAL': return { label: 'Optional', color: TagColor.WARNING };
    case 'DISABLED': return { label: 'Disabled', color: TagColor.DEFAULT };
    case 'AUTHORIZE': return { label: 'Authorize', color: TagColor.INFO };
    case 'CHARGE': return { label: 'Charge', color: TagColor.WARNING };
    default: return { label: mode, color: TagColor.DEFAULT };
  }
}

// ── Section wrapper ──────────────────────────────────────

function Section({
  id,
  icon,
  title,
  description,
  summary,
  summaryColor = TagColor.INFO,
  children,
}: {
  id: string;
  icon: string;
  title: string;
  description: string;
  summary: string;
  summaryColor?: TagColor;
  children: React.ReactNode;
}) {
  const isExpanded = useConfigStore((s) => s.expandedSections.includes(id));
  const toggleSection = useConfigStore((s) => s.toggleSection);

  return (
    <CanaryCard padding="none" hasBorder>
      <button
        onClick={() => toggleSection(id)}
        className="w-full px-5 py-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: colors.colorBlueDark5 }}
          >
            <Icon path={icon} size={0.75} color={colors.colorBlueDark1} />
          </div>
          <div className="min-w-0">
            <h3 className="text-[14px] font-bold" style={{ color: colors.colorBlack2 }}>
              {title}
            </h3>
            <p className="text-[12px] truncate" style={{ color: colors.colorBlack4 }}>
              {description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <CanaryTag label={summary} color={summaryColor} size={TagSize.COMPACT} />
          <Icon
            path={isExpanded ? mdiChevronUp : mdiChevronDown}
            size={0.8}
            color={colors.colorBlack4}
          />
        </div>
      </button>
      {isExpanded && (
        <div className="px-5 pb-5 pt-3 border-t" style={{ borderColor: colors.colorBlack7 }}>
          {children}
        </div>
      )}
    </CanaryCard>
  );
}

// ── Field visibility grid ────────────────────────────────

function FieldGrid({
  fields,
  values,
  onChange,
}: {
  fields: { key: string; label: string }[];
  values: Record<string, FieldVisibility>;
  onChange: (key: string, value: FieldVisibility) => void;
}) {
  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: colors.colorBlack6 }}>
      <div
        className="flex items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wider"
        style={{ backgroundColor: colors.colorBlack7, color: colors.colorBlack4 }}
      >
        <span>Field</span>
        <span className="w-[160px]">Visibility</span>
      </div>
      {fields.map((field, idx) => (
        <div
          key={field.key}
          className="flex items-center justify-between px-3 py-2"
          style={{
            borderTop: idx > 0 ? `1px solid ${colors.colorBlack7}` : undefined,
          }}
        >
          <span className="text-[13px]" style={{ color: colors.colorBlack2 }}>
            {field.label}
          </span>
          <div className="w-[160px]">
            <CanarySelect
              size={InputSize.NORMAL}
              value={values[field.key] ?? 'REQUIRED'}
              onChange={(e) => onChange(field.key, e.target.value as FieldVisibility)}
              options={VISIBILITY_OPTIONS}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Checkbox group (for multi-select) ────────────────────

function CheckboxGroup({
  options,
  selected,
  onChange,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {options.map((opt) => (
        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={selected.includes(opt.value)}
            onChange={() => onChange(toggleArrayItem(selected, opt.value))}
            className="w-4 h-4 rounded border-gray-300 accent-[#2858C4]"
          />
          <span className="text-[13px]" style={{ color: colors.colorBlack2 }}>
            {opt.label}
          </span>
        </label>
      ))}
    </div>
  );
}

// ── Flow preview ─────────────────────────────────────────

function FlowPreview() {
  const [isExpanded, setIsExpanded] = useState(false);
  const flows = useGeneratedFlows();
  const mainFlows = flows.filter((f) => f.kind === 'main');

  return (
    <CanaryCard padding="none" hasBorder>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-3 flex items-center justify-between text-left"
      >
        <span className="text-[13px] font-semibold" style={{ color: colors.colorBlack2 }}>
          Generated Flows
        </span>
        <div className="flex items-center gap-2">
          {mainFlows.map((f) => (
            <CanaryTag
              key={f.id}
              label={`${f.name} · ${f.steps.length} steps`}
              color={TagColor.DEFAULT}
              size={TagSize.COMPACT}
            />
          ))}
          <Icon
            path={isExpanded ? mdiChevronUp : mdiChevronDown}
            size={0.7}
            color={colors.colorBlack4}
          />
        </div>
      </button>
      {isExpanded && (
        <div
          className="px-5 pb-4 pt-2 border-t"
          style={{ borderColor: colors.colorBlack7 }}
        >
          <p className="text-[12px] mb-3" style={{ color: colors.colorBlack4 }}>
            These flows are generated from your configuration. Step order is optimized per surface.
          </p>
          <div className="grid grid-cols-4 gap-4">
            {mainFlows.map((flow) => (
              <FlowColumn key={flow.id} flow={flow} />
            ))}
          </div>
        </div>
      )}
    </CanaryCard>
  );
}

function FlowColumn({ flow }: { flow: FlowDefinition }) {
  const surfaceIcon = SURFACE_ICON[flow.surface] ?? mdiWeb;
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon path={surfaceIcon} size={0.65} color={colors.colorBlueDark1} />
        <span className="text-[13px] font-semibold" style={{ color: colors.colorBlack2 }}>
          {flow.name}
        </span>
      </div>
      <div className="space-y-1">
        {flow.steps.map((step, idx) => {
          const template = getStepTemplateMeta(step.templateId);
          return (
            <div key={step.id} className="flex items-center gap-2 py-0.5">
              <span
                className="text-[11px] font-bold w-4 text-right shrink-0"
                style={{ color: colors.colorBlack5 }}
              >
                {idx + 1}
              </span>
              <Icon path={template.icon} size={0.5} color={colors.colorBlueDark2} />
              <span className="text-[12px]" style={{ color: colors.colorBlack3 }}>
                {step.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Section: Identity & Verification ─────────────────────

function IdentitySection() {
  const config = useConfigStore((s) => s.config);
  const updateConfig = useConfigStore((s) => s.updateConfig);
  const { label, color } = idModeSummary(config.idStepWithOcr);
  const hasOcr =
    config.idStepWithOcr === 'REQUIRED_WITH_OCR' ||
    config.idStepWithOcr === 'OPTIONAL_WITH_OCR';

  return (
    <Section
      id="identity"
      icon={mdiCardAccountDetailsOutline}
      title="Identity & Verification"
      description="ID capture, OCR scanning, document consent"
      summary={label}
      summaryColor={color}
    >
      <div className="space-y-5">
        <CanarySelect
          label="ID Verification Mode"
          size={InputSize.NORMAL}
          value={config.idStepWithOcr}
          onChange={(e) => updateConfig('idStepWithOcr', e.target.value as IdStepMode)}
          options={[
            { value: 'REQUIRED_WITH_OCR', label: 'Required with OCR' },
            { value: 'REQUIRED', label: 'Required' },
            { value: 'OPTIONAL_WITH_OCR', label: 'Optional with OCR' },
            { value: 'OPTIONAL', label: 'Optional' },
            { value: 'DISABLED', label: 'Disabled' },
          ]}
        />

        {config.idStepWithOcr !== 'DISABLED' && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold" style={{ color: colors.colorBlack2 }}>
                  Require back of ID
                </p>
                <p className="text-[12px]" style={{ color: colors.colorBlack4 }}>
                  Require photo of the back for driver&apos;s licenses
                </p>
              </div>
              <CanarySwitch
                checked={config.requireIdCardBack}
                onChange={() => updateConfig('requireIdCardBack', !config.requireIdCardBack)}
              />
            </div>

            <div>
              <p className="text-[13px] font-semibold mb-2" style={{ color: colors.colorBlack2 }}>
                Accepted ID Types
              </p>
              <CheckboxGroup
                options={ID_TYPE_OPTIONS}
                selected={config.idOptions}
                onChange={(v) => updateConfig('idOptions', v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold" style={{ color: colors.colorBlack2 }}>
                  Show ID consent
                </p>
                <p className="text-[12px]" style={{ color: colors.colorBlack4 }}>
                  Display consent text before capturing ID
                </p>
              </div>
              <CanarySwitch
                checked={config.showIdConsent}
                onChange={() => updateConfig('showIdConsent', !config.showIdConsent)}
              />
            </div>

            {config.showIdConsent && (
              <CanaryTextArea
                label="Consent Text"
                value={config.idConsentText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  updateConfig('idConsentText', e.target.value)
                }
              />
            )}

            <CanaryInput
              label="ID Retention (days)"
              type={InputType.NUMBER}
              size={InputSize.NORMAL}
              value={String(config.idRetentionDays)}
              onChange={(e) =>
                updateConfig('idRetentionDays', parseInt(e.target.value, 10) || 0)
              }
              helperText="Days to retain ID images after departure (max 1827)"
            />

            {hasOcr && (
              <div>
                <p className="text-[13px] font-semibold mb-2" style={{ color: colors.colorBlack2 }}>
                  OCR Extracted Fields
                </p>
                <p className="text-[12px] mb-3" style={{ color: colors.colorBlack4 }}>
                  Control which fields are extracted from scanned ID documents
                </p>
                <FieldGrid
                  fields={OCR_FIELDS}
                  values={config.ocrFields}
                  onChange={(key, value) =>
                    updateConfig('ocrFields', { ...config.ocrFields, [key]: value })
                  }
                />
              </div>
            )}
          </>
        )}
      </div>
    </Section>
  );
}

// ── Section: Payment ─────────────────────────────────────

function PaymentSection() {
  const config = useConfigStore((s) => s.config);
  const updateConfig = useConfigStore((s) => s.updateConfig);
  const { label, color } = stepModeSummary(config.creditCardStep);

  return (
    <Section
      id="payment"
      icon={mdiCreditCardOutline}
      title="Payment"
      description="Credit card collection and card policies"
      summary={label}
      summaryColor={color}
    >
      <div className="space-y-5">
        <CanarySelect
          label="Credit Card Step"
          size={InputSize.NORMAL}
          value={config.creditCardStep}
          onChange={(e) =>
            updateConfig('creditCardStep', e.target.value as CreditCardStepMode)
          }
          options={[
            { value: 'REQUIRED', label: 'Required' },
            { value: 'OPTIONAL', label: 'Optional' },
            { value: 'DISABLED', label: 'Disabled' },
          ]}
        />

        {config.creditCardStep !== 'DISABLED' && (
          <>
            <CanarySelect
              label="Card Photo Upload"
              size={InputSize.NORMAL}
              value={config.creditCardUploadPolicy}
              onChange={(e) =>
                updateConfig(
                  'creditCardUploadPolicy',
                  e.target.value as CreditCardUploadPolicy
                )
              }
              options={[
                { value: 'NEVER', label: 'Never' },
                { value: 'OPTIONAL', label: 'Optional' },
                { value: 'ALWAYS', label: 'Always' },
                { value: 'HIGH_RISK', label: 'High-risk only' },
              ]}
            />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold" style={{ color: colors.colorBlack2 }}>
                  Require postal code
                </p>
                <p className="text-[12px]" style={{ color: colors.colorBlack4 }}>
                  Make postal code mandatory on the card form
                </p>
              </div>
              <CanarySwitch
                checked={config.requireCreditCardPostalCode}
                onChange={() =>
                  updateConfig(
                    'requireCreditCardPostalCode',
                    !config.requireCreditCardPostalCode
                  )
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold" style={{ color: colors.colorBlack2 }}>
                  Hide full card info from staff
                </p>
                <p className="text-[12px]" style={{ color: colors.colorBlack4 }}>
                  Restrict hotel staff from viewing full card details
                </p>
              </div>
              <CanarySwitch
                checked={config.disableViewFullCardInfo}
                onChange={() =>
                  updateConfig('disableViewFullCardInfo', !config.disableViewFullCardInfo)
                }
              />
            </div>

            <div>
              <p className="text-[13px] font-semibold mb-2" style={{ color: colors.colorBlack2 }}>
                Blocked Card Types
              </p>
              <CheckboxGroup
                options={CARD_TYPE_OPTIONS}
                selected={config.blockedCardTypes}
                onChange={(v) => updateConfig('blockedCardTypes', v)}
              />
            </div>

            <div>
              <p className="text-[13px] font-semibold mb-2" style={{ color: colors.colorBlack2 }}>
                Blocked Card Networks
              </p>
              <CheckboxGroup
                options={CARD_NETWORK_OPTIONS}
                selected={config.blockedCardNetworks}
                onChange={(v) => updateConfig('blockedCardNetworks', v)}
              />
            </div>
          </>
        )}
      </div>
    </Section>
  );
}

// ── Section: Deposits ────────────────────────────────────

function DepositSection() {
  const config = useConfigStore((s) => s.config);
  const updateConfig = useConfigStore((s) => s.updateConfig);
  const active = config.isCanaryProcessingDeposits;

  return (
    <Section
      id="deposits"
      icon={mdiSafeSquareOutline}
      title="Deposits"
      description="Deposit strategy, surcharge processing"
      summary={active ? config.depositStrategy === 'AUTHORIZE' ? 'Authorize' : 'Charge' : 'Off'}
      summaryColor={active ? TagColor.INFO : TagColor.DEFAULT}
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold" style={{ color: colors.colorBlack2 }}>
              Canary processes deposits
            </p>
            <p className="text-[12px]" style={{ color: colors.colorBlack4 }}>
              Process deposit transactions via hotel payment gateway
            </p>
          </div>
          <CanarySwitch
            checked={config.isCanaryProcessingDeposits}
            onChange={() =>
              updateConfig('isCanaryProcessingDeposits', !config.isCanaryProcessingDeposits)
            }
          />
        </div>

        {active && (
          <>
            <CanarySelect
              label="Deposit Strategy"
              size={InputSize.NORMAL}
              value={config.depositStrategy}
              onChange={(e) =>
                updateConfig('depositStrategy', e.target.value as DepositStrategy)
              }
              options={[
                { value: 'AUTHORIZE', label: 'Authorize only (hold)' },
                { value: 'CHARGE', label: 'Charge (full capture)' },
              ]}
            />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold" style={{ color: colors.colorBlack2 }}>
                  Skip deposit if routing rules exist
                </p>
                <p className="text-[12px]" style={{ color: colors.colorBlack4 }}>
                  Avoid capturing deposit for reservations with routing rules
                </p>
              </div>
              <CanarySwitch
                checked={config.shouldSkipDepositIfRoutingRulesExist}
                onChange={() =>
                  updateConfig(
                    'shouldSkipDepositIfRoutingRulesExist',
                    !config.shouldSkipDepositIfRoutingRulesExist
                  )
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold" style={{ color: colors.colorBlack2 }}>
                  Show surcharge detail to guests
                </p>
                <p className="text-[12px]" style={{ color: colors.colorBlack4 }}>
                  Display surcharge breakdown during check-in
                </p>
              </div>
              <CanarySwitch
                checked={config.showDepositSurchargeDetail}
                onChange={() =>
                  updateConfig('showDepositSurchargeDetail', !config.showDepositSurchargeDetail)
                }
              />
            </div>

            {config.showDepositSurchargeDetail && (
              <div className="grid grid-cols-2 gap-3">
                <CanaryInput
                  label="Credit card %"
                  type={InputType.NUMBER}
                  size={InputSize.NORMAL}
                  value={String(config.surchargeCredit)}
                  onChange={(e) =>
                    updateConfig('surchargeCredit', parseFloat(e.target.value) || 0)
                  }
                />
                <CanaryInput
                  label="Debit card %"
                  type={InputType.NUMBER}
                  size={InputSize.NORMAL}
                  value={String(config.surchargeDebit)}
                  onChange={(e) =>
                    updateConfig('surchargeDebit', parseFloat(e.target.value) || 0)
                  }
                />
                <CanaryInput
                  label="Prepaid card %"
                  type={InputType.NUMBER}
                  size={InputSize.NORMAL}
                  value={String(config.surchargePrepaid)}
                  onChange={(e) =>
                    updateConfig('surchargePrepaid', parseFloat(e.target.value) || 0)
                  }
                />
                <CanaryInput
                  label="Unknown card %"
                  type={InputType.NUMBER}
                  size={InputSize.NORMAL}
                  value={String(config.surchargeUnknown)}
                  onChange={(e) =>
                    updateConfig('surchargeUnknown', parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            )}
          </>
        )}
      </div>
    </Section>
  );
}

// ── Section: Additional Guests ───────────────────────────

function AdditionalGuestsSection() {
  const config = useConfigStore((s) => s.config);
  const updateConfig = useConfigStore((s) => s.updateConfig);
  const { label, color } = stepModeSummary(config.additionalGuestsStep);

  return (
    <Section
      id="additional-guests"
      icon={mdiAccountGroupOutline}
      title="Additional Guests"
      description="Multi-guest check-in and field requirements"
      summary={label}
      summaryColor={color}
    >
      <div className="space-y-5">
        <CanarySelect
          label="Additional Guests Step"
          size={InputSize.NORMAL}
          value={config.additionalGuestsStep}
          onChange={(e) =>
            updateConfig('additionalGuestsStep', e.target.value as GuestStepMode)
          }
          options={[
            { value: 'REQUIRED', label: 'Required' },
            { value: 'OPTIONAL', label: 'Optional' },
            { value: 'DISABLED', label: 'Disabled' },
          ]}
        />

        {config.additionalGuestsStep !== 'DISABLED' && (
          <div>
            <p className="text-[13px] font-semibold mb-2" style={{ color: colors.colorBlack2 }}>
              Guest Data Fields
            </p>
            <p className="text-[12px] mb-3" style={{ color: colors.colorBlack4 }}>
              Configure which fields to collect for each additional guest
            </p>
            <FieldGrid
              fields={ADDITIONAL_GUEST_FIELDS}
              values={config.additionalGuestsFields}
              onChange={(key, value) =>
                updateConfig('additionalGuestsFields', {
                  ...config.additionalGuestsFields,
                  [key]: value,
                })
              }
            />
          </div>
        )}
      </div>
    </Section>
  );
}

// ── Section: Auto Check-In ───────────────────────────────

function AutoCheckInSection() {
  const config = useConfigStore((s) => s.config);
  const updateConfig = useConfigStore((s) => s.updateConfig);

  return (
    <Section
      id="auto-checkin"
      icon={mdiCogOutline}
      title="Auto Check-In"
      description="Skip-the-desk automated check-in"
      summary={config.autoCheckInEnabled ? 'Enabled' : 'Disabled'}
      summaryColor={config.autoCheckInEnabled ? TagColor.SUCCESS : TagColor.DEFAULT}
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold" style={{ color: colors.colorBlack2 }}>
              Enable auto check-in
            </p>
            <p className="text-[12px]" style={{ color: colors.colorBlack4 }}>
              Automatically check in guests who complete all required steps
            </p>
          </div>
          <CanarySwitch
            checked={config.autoCheckInEnabled}
            onChange={() => updateConfig('autoCheckInEnabled', !config.autoCheckInEnabled)}
          />
        </div>

        {config.autoCheckInEnabled && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <CanaryInput
                label="Check-in time"
                type={InputType.TIME}
                size={InputSize.NORMAL}
                value={config.autoCheckInTime}
                onChange={(e) => updateConfig('autoCheckInTime', e.target.value)}
                helperText="Time of day in hotel timezone"
              />
              <CanaryInput
                label="Window (hours)"
                type={InputType.NUMBER}
                size={InputSize.NORMAL}
                value={String(config.autoCheckInWindow)}
                onChange={(e) =>
                  updateConfig('autoCheckInWindow', parseInt(e.target.value, 10) || 0)
                }
                helperText="Hours after scheduled time"
              />
            </div>

            <div className="space-y-3">
              <p className="text-[13px] font-semibold" style={{ color: colors.colorBlack2 }}>
                Requirements
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[13px]" style={{ color: colors.colorBlack2 }}>
                  Require pre-registration
                </span>
                <CanarySwitch
                  checked={config.autoCheckInRequirePreReg}
                  onChange={() =>
                    updateConfig('autoCheckInRequirePreReg', !config.autoCheckInRequirePreReg)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px]" style={{ color: colors.colorBlack2 }}>
                  Require identity verification
                </span>
                <CanarySwitch
                  checked={config.autoCheckInRequireIdVerification}
                  onChange={() =>
                    updateConfig(
                      'autoCheckInRequireIdVerification',
                      !config.autoCheckInRequireIdVerification
                    )
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px]" style={{ color: colors.colorBlack2 }}>
                  Require ID name match
                </span>
                <CanarySwitch
                  checked={config.autoCheckInRequireIdNameMatch}
                  onChange={() =>
                    updateConfig(
                      'autoCheckInRequireIdNameMatch',
                      !config.autoCheckInRequireIdNameMatch
                    )
                  }
                />
              </div>
            </div>
          </>
        )}
      </div>
    </Section>
  );
}

// ── Section: General Settings ────────────────────────────

function GeneralSection() {
  const config = useConfigStore((s) => s.config);
  const updateConfig = useConfigStore((s) => s.updateConfig);

  const activeCount = [
    config.hasSequentialSubmissionStamp,
    config.hasAppleWallet,
    config.hasGoogleWallet,
    config.hasCheckInMobile,
    config.hasTabletReg,
    config.hasKiosk,
  ].filter(Boolean).length;

  return (
    <Section
      id="general"
      icon={mdiCalendarOutline}
      title="General & Access"
      description="Registration card, digital wallets, availability"
      summary={`${activeCount} active`}
      summaryColor={TagColor.DEFAULT}
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold" style={{ color: colors.colorBlack2 }}>
              Mobile check-in
            </p>
            <p className="text-[12px]" style={{ color: colors.colorBlack4 }}>
              Allow guests to check in via mobile web
            </p>
          </div>
          <CanarySwitch
            checked={config.hasCheckInMobile}
            onChange={() => updateConfig('hasCheckInMobile', !config.hasCheckInMobile)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold" style={{ color: colors.colorBlack2 }}>
              Tablet registration
            </p>
            <p className="text-[12px]" style={{ color: colors.colorBlack4 }}>
              Front desk tablet for walk-in registration
            </p>
          </div>
          <CanarySwitch
            checked={config.hasTabletReg}
            onChange={() => updateConfig('hasTabletReg', !config.hasTabletReg)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold" style={{ color: colors.colorBlack2 }}>
              Kiosk
            </p>
            <p className="text-[12px]" style={{ color: colors.colorBlack4 }}>
              Self-service kiosk check-in
            </p>
          </div>
          <CanarySwitch
            checked={config.hasKiosk}
            onChange={() => updateConfig('hasKiosk', !config.hasKiosk)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <CanaryInput
            label="Cutoff hour (0–23)"
            type={InputType.NUMBER}
            size={InputSize.NORMAL}
            value={String(config.checkInCutOffHour)}
            onChange={(e) =>
              updateConfig('checkInCutOffHour', parseInt(e.target.value, 10) || 0)
            }
            helperText="Hour when check-in becomes unavailable"
          />
          <CanarySelect
            label="Cutoff applies to"
            size={InputSize.NORMAL}
            value={config.checkInCutoffDay}
            onChange={(e) => updateConfig('checkInCutoffDay', e.target.value as CutoffDay)}
            options={[
              { value: 'SAME_DAY', label: 'Arrival day' },
              { value: 'NEXT_DAY', label: 'Next morning' },
            ]}
          />
        </div>

        <div
          className="h-px"
          style={{ backgroundColor: colors.colorBlack7 }}
        />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold" style={{ color: colors.colorBlack2 }}>
              Sequential submission stamp
            </p>
            <p className="text-[12px]" style={{ color: colors.colorBlack4 }}>
              Number each check-in submission sequentially
            </p>
          </div>
          <CanarySwitch
            checked={config.hasSequentialSubmissionStamp}
            onChange={() =>
              updateConfig(
                'hasSequentialSubmissionStamp',
                !config.hasSequentialSubmissionStamp
              )
            }
          />
        </div>

        {config.hasSequentialSubmissionStamp && (
          <CanaryInput
            label="Stamp prefix"
            size={InputSize.NORMAL}
            value={config.sequentialSubmissionStampPrefix}
            onChange={(e) =>
              updateConfig('sequentialSubmissionStampPrefix', e.target.value)
            }
          />
        )}

        <div
          className="h-px"
          style={{ backgroundColor: colors.colorBlack7 }}
        />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold" style={{ color: colors.colorBlack2 }}>
              Apple Wallet
            </p>
            <p className="text-[12px]" style={{ color: colors.colorBlack4 }}>
              Generate Apple Wallet pass for digital check-in
            </p>
          </div>
          <CanarySwitch
            checked={config.hasAppleWallet}
            onChange={() => updateConfig('hasAppleWallet', !config.hasAppleWallet)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold" style={{ color: colors.colorBlack2 }}>
              Google Wallet
            </p>
            <p className="text-[12px]" style={{ color: colors.colorBlack4 }}>
              Generate Google Wallet pass for digital check-in
            </p>
          </div>
          <CanarySwitch
            checked={config.hasGoogleWallet}
            onChange={() => updateConfig('hasGoogleWallet', !config.hasGoogleWallet)}
          />
        </div>
      </div>
    </Section>
  );
}

// ── Section: Notifications ───────────────────────────────

function NotificationsSection() {
  const config = useConfigStore((s) => s.config);
  const updateConfig = useConfigStore((s) => s.updateConfig);

  return (
    <Section
      id="notifications"
      icon={mdiEmailOutline}
      title="Notifications"
      description="Staff alerts and guest success messages"
      summary={config.notificationEmails ? 'Configured' : 'None'}
      summaryColor={config.notificationEmails ? TagColor.SUCCESS : TagColor.DEFAULT}
    >
      <div className="space-y-5">
        <CanaryInput
          label="Notification emails"
          size={InputSize.NORMAL}
          value={config.notificationEmails}
          onChange={(e) => updateConfig('notificationEmails', e.target.value)}
          helperText="Comma-separated emails for check-in submission alerts"
        />
        <CanaryTextArea
          label="Success message"
          value={config.messageAfterSuccessfulCheckIn}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            updateConfig('messageAfterSuccessfulCheckIn', e.target.value)
          }
        />
      </div>
    </Section>
  );
}

// ── Main page ────────────────────────────────────────────

export function CheckInConfigPage() {
  return (
    <div style={{ backgroundColor: colors.colorBlack8, padding: 24 }}>
      <div className="max-w-[960px] mx-auto">
        <div className="mb-4">
          <CanaryAlert
            type="info"
            message="Changes here control the check-in experience across all surfaces. The flow preview updates live as you configure."
          />
        </div>

        <div className="mb-5">
          <FlowPreview />
        </div>

        <div className="space-y-3">
          <IdentitySection />
          <PaymentSection />
          <DepositSection />
          <AdditionalGuestsSection />
          <AutoCheckInSection />
          <GeneralSection />
          <NotificationsSection />
        </div>
      </div>
    </div>
  );
}
