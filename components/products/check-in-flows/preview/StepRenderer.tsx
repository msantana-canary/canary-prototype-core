'use client';

/**
 * StepRenderer
 *
 * Dispatches to the appropriate per-step-type preview renderer, reading
 * step.config + PreviewContext from the store. Each sub-renderer is a
 * small, focused component mocking what the guest would see on mobile.
 *
 * These are prototype-quality mocks — not 1:1 replicas of the real
 * guest-facing Canary UI. They're calibrated to show CONFIGURATION
 * results (which fields, which options, which language, conditions).
 */

import React from 'react';
import Icon from '@mdi/react';
import {
  mdiShieldCheckOutline,
  mdiCardAccountDetailsOutline,
  mdiCreditCardOutline,
  mdiSafeSquareOutline,
  mdiStarOutline,
  mdiCheckCircleOutline,
  mdiScaleBalance,
  mdiLinkVariant,
  mdiAlertCircleOutline,
  mdiFaceManOutline,
  mdiCameraOutline,
} from '@mdi/js';

import type {
  StepInstance,
  FieldDef,
  IdCaptureConfig,
  IdConsentConfig,
  CreditCardConfig,
  DepositCollectionConfig,
  LoyaltyWelcomeConfig,
  ComplianceConfig,
  CompletionConfig,
  NestedFlowConfig,
  PreviewContext,
  SchemaFormConfig,
} from '@/lib/products/check-in-flows/types';
import { resolveText } from '@/lib/products/check-in-flows/types';
import { getFieldTypeMeta } from '@/lib/products/check-in-flows/field-types';
import { useFlowById } from '@/lib/products/check-in-flows/store';
import { COUNTRY_MAP } from '@/lib/products/check-in-flows/condition-meta';
import {
  shouldShow,
  isRequiredBecauseOfConditions,
} from '@/lib/products/check-in-flows/condition-evaluator';

interface Props {
  step: StepInstance;
  ctx: PreviewContext;
}

export function StepRenderer({ step, ctx }: Props) {
  // Don't render anything if the step itself is hidden by conditions
  if (!shouldShow(step.conditions, ctx)) {
    return <HiddenByConditions step={step} ctx={ctx} />;
  }

  const cfg = step.config;

  if (cfg.kind === 'schema-form') {
    return <SchemaFormPreview step={step} cfg={cfg} ctx={ctx} />;
  }
  if (cfg.kind === 'nested-flow') {
    return <NestedFlowPreview cfg={cfg} ctx={ctx} />;
  }
  if (cfg.kind === 'preset') {
    switch (cfg.presetType) {
      case 'id-consent': return <IdConsentPreview cfg={cfg} ctx={ctx} />;
      case 'id-capture': return <IdCapturePreview cfg={cfg} ctx={ctx} />;
      case 'id-verification': return <IdVerificationPreview step={step} ctx={ctx} />;
      case 'credit-card': return <CreditCardPreview cfg={cfg} ctx={ctx} />;
      case 'deposit-collection': return <DepositCollectionPreview cfg={cfg} ctx={ctx} />;
      case 'loyalty-welcome': return <LoyaltyWelcomePreview cfg={cfg} ctx={ctx} />;
      case 'stb-compliance':
      case 'alloggiati-compliance': return <CompliancePreview cfg={cfg as ComplianceConfig} ctx={ctx} />;
      case 'completion': return <CompletionPreview cfg={cfg} ctx={ctx} />;
    }
  }

  return (
    <div className="px-5 py-8 text-center text-[13px] text-[#888]">
      No preview for this step type.
    </div>
  );
}

// ── Hidden-by-conditions helper ──────────────────────────

function HiddenByConditions({ step, ctx }: { step: StepInstance; ctx: PreviewContext }) {
  const country = COUNTRY_MAP[ctx.guestNationalityCode]?.name ?? ctx.guestNationalityCode;
  return (
    <div className="px-5 py-8 flex flex-col items-center text-center">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
        style={{ backgroundColor: '#F4F4F5' }}
      >
        <Icon path={mdiAlertCircleOutline} size={1.2} color="#999" />
      </div>
      <h3 className="text-[15px] font-bold text-[#2B2B2B] mb-1">
        Step hidden by conditions
      </h3>
      <p className="text-[12px] text-[#888] max-w-[280px]">
        &ldquo;{step.name}&rdquo; is not shown for this simulated guest ({country},{' '}
        {ctx.loyaltyTier === 'none' ? 'non-member' : ctx.loyaltyTier.replace('-', ' ')}).
      </p>
    </div>
  );
}

// ── Shared primitives ────────────────────────────────────

const STATLER_GOLD = '#8B6914';

function PreviewHeader({ step, ctx, icon }: { step: StepInstance; ctx: PreviewContext; icon?: string }) {
  return (
    <div className="px-5 pt-6 pb-4">
      {icon && (
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
          style={{ backgroundColor: '#F4E9D8' }}
        >
          <Icon path={icon} size={1.3} color={STATLER_GOLD} />
        </div>
      )}
      <h1 className="text-[20px] font-bold text-[#2B2B2B] leading-tight">{step.name}</h1>
    </div>
  );
}

function PrimaryCTA({ label }: { label: string }) {
  return (
    <div className="px-5 pb-6 pt-3 mt-auto">
      <button
        className="w-full h-11 rounded-md font-semibold text-white text-[14px]"
        style={{ backgroundColor: STATLER_GOLD }}
        disabled
      >
        {label}
      </button>
    </div>
  );
}

// ── Schema form preview (reg-card / OCR) ─────────────────

function SchemaFormPreview({
  step,
  cfg,
  ctx,
}: {
  step: StepInstance;
  cfg: SchemaFormConfig;
  ctx: PreviewContext;
}) {
  const visibleFields = cfg.fields.filter((f) => shouldShow(f.conditions, ctx));

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <PreviewHeader step={step} ctx={ctx} icon={mdiCardAccountDetailsOutline} />
        <div className="px-5 pb-4 space-y-3">
          {visibleFields.length === 0 && (
            <p className="text-[12px] text-[#888] italic">
              All fields hidden by conditions for this guest.
            </p>
          )}
          {visibleFields.map((field) => (
            <FieldPreview key={field.id} field={field} ctx={ctx} />
          ))}
        </div>
      </div>
      <PrimaryCTA label="Continue" />
    </div>
  );
}

function FieldPreview({ field, ctx }: { field: FieldDef; ctx: PreviewContext }) {
  const meta = getFieldTypeMeta(field.type);
  const label = resolveText(field.label, ctx.language);
  const placeholder = resolveText(field.placeholder, ctx.language);
  const helper = resolveText(field.helperText, ctx.language);
  const required = field.required || isRequiredBecauseOfConditions(field.conditions, ctx);
  const staticContent = resolveText(field.staticContent, ctx.language);

  // Static content
  if (meta.isStatic) {
    if (field.type === 'header') {
      return <h3 className="text-[14px] font-bold text-[#2B2B2B] mt-2">{staticContent}</h3>;
    }
    if (field.type === 'list') {
      const items = staticContent.split('\n').filter(Boolean);
      return (
        <ul className="list-disc ml-5 text-[12px] text-[#555] space-y-0.5">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    }
    return <p className="text-[12px] text-[#555]">{staticContent}</p>;
  }

  // Field wrapper
  return (
    <div>
      <label className="text-[11px] font-semibold text-[#555]">
        {label}
        {required && <span className="ml-0.5 text-[#D00]">*</span>}
      </label>
      <FieldInput field={field} placeholder={placeholder || label} lang={ctx.language} />
      {helper && <p className="text-[10px] text-[#888] mt-0.5">{helper}</p>}
    </div>
  );
}

function FieldInput({ field, placeholder, lang }: { field: FieldDef; placeholder: string; lang: string }) {
  const baseCls = 'mt-1 w-full h-9 px-2.5 rounded-md border border-[#DDD] bg-white text-[12px] text-[#2B2B2B] outline-none';

  switch (field.type) {
    case 'text-input':
    case 'email':
    case 'phone':
    case 'number':
      return (
        <input
          type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
          placeholder={placeholder}
          className={baseCls}
          disabled
        />
      );
    case 'text-area':
      return <textarea placeholder={placeholder} className={`${baseCls} h-20 py-2 resize-none`} disabled />;
    case 'date':
    case 'time-select':
      return (
        <input
          type={field.type === 'date' ? 'date' : 'time'}
          className={baseCls}
          disabled
        />
      );
    case 'signature':
      return (
        <div className="mt-1 h-20 rounded-md border border-dashed border-[#CCC] bg-[#FAFAFA] flex items-center justify-center text-[11px] text-[#888]">
          Tap to sign
        </div>
      );
    case 'country':
      return (
        <select className={baseCls} disabled defaultValue="US">
          <option>Select country…</option>
        </select>
      );
    case 'credit-card':
      return (
        <input type="text" placeholder="1234 1234 1234 1234" className={baseCls} disabled />
      );
    case 'boolean-radio':
      return (
        <div className="mt-1 flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-[12px] text-[#555]">
            <input type="radio" name={field.id} disabled /> Yes
          </label>
          <label className="flex items-center gap-1.5 text-[12px] text-[#555]">
            <input type="radio" name={field.id} disabled /> No
          </label>
        </div>
      );
    case 'dropdown': {
      return (
        <select className={baseCls} disabled>
          <option>{placeholder}</option>
          {field.options?.map((o) => (
            <option key={o.id} value={o.value}>{resolveText(o.label, lang)}</option>
          ))}
        </select>
      );
    }
    case 'string-radio':
      return (
        <div className="mt-1 space-y-1.5">
          {field.options?.map((o) => (
            <label key={o.id} className="flex items-center gap-1.5 text-[12px] text-[#555]">
              <input type="radio" name={field.id} disabled /> {resolveText(o.label, lang)}
            </label>
          ))}
        </div>
      );
    case 'checkbox':
      return (
        <label className="flex items-center gap-2 mt-1 text-[12px] text-[#555]">
          <input type="checkbox" disabled /> {placeholder}
        </label>
      );
    case 'checkbox-group':
      return (
        <div className="mt-1 space-y-1.5">
          {field.options?.map((o) => (
            <label key={o.id} className="flex items-center gap-1.5 text-[12px] text-[#555]">
              <input type="checkbox" disabled /> {resolveText(o.label, lang)}
            </label>
          ))}
        </div>
      );
    default:
      return null;
  }
}

// ── Preset previews ──────────────────────────────────────

function IdConsentPreview({ cfg, ctx }: { cfg: IdConsentConfig; ctx: PreviewContext }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto px-5 pt-6 pb-4 flex flex-col gap-3">
        <div
          className="w-14 h-14 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: '#F4E9D8' }}
        >
          <Icon path={mdiShieldCheckOutline} size={1.4} color={STATLER_GOLD} />
        </div>
        <h1 className="text-[22px] font-bold text-[#2B2B2B] leading-tight">
          {resolveText(cfg.heading, ctx.language)}
        </h1>
        <p className="text-[13px] text-[#555] leading-snug whitespace-pre-wrap">
          {resolveText(cfg.body, ctx.language)}
        </p>

        <div className="mt-2 flex items-start gap-2.5 py-3 px-3 rounded bg-[#FAFAFA] border border-[#EEE]">
          <div className="w-4 h-4 rounded border-2 border-[#AAA] mt-0.5 shrink-0" />
          <p className="text-[11px] text-[#555] leading-snug">
            {resolveText(cfg.acknowledgment, ctx.language)}
          </p>
        </div>
      </div>
      <PrimaryCTA label={resolveText(cfg.ctaLabel, ctx.language) || 'Continue'} />
    </div>
  );
}

function IdCapturePreview({ cfg, ctx }: { cfg: IdCaptureConfig; ctx: PreviewContext }) {
  const visible = cfg.idTypeOptions.filter((o) => shouldShow(o.conditions, ctx));
  const country = COUNTRY_MAP[ctx.guestNationalityCode]?.name ?? ctx.guestNationalityCode;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto px-5 pt-6 pb-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
          style={{ backgroundColor: '#F4E9D8' }}
        >
          <Icon path={mdiCardAccountDetailsOutline} size={1.3} color={STATLER_GOLD} />
        </div>
        <h1 className="text-[20px] font-bold text-[#2B2B2B] leading-tight mb-1">
          What ID will you use?
        </h1>
        <p className="text-[12px] text-[#888] mb-4">
          We accept the following IDs for guests from {country}.
        </p>

        <div className="space-y-2">
          {visible.map((opt) => (
            <button
              key={opt.id}
              className="w-full text-left px-3 py-3 rounded-md border border-[#DDD] bg-white hover:border-[#999] flex items-center gap-2 text-[13px] text-[#2B2B2B]"
              disabled
            >
              <Icon path={mdiCardAccountDetailsOutline} size={0.75} color="#666" />
              {resolveText(opt.label, ctx.language)}
            </button>
          ))}
          {visible.length === 0 && (
            <p className="text-[12px] text-[#D00] italic">
              No ID types available for this nationality. Configure at least one unconditional option.
            </p>
          )}
        </div>
      </div>
      <PrimaryCTA label="Continue" />
    </div>
  );
}

function IdVerificationPreview({ step, ctx }: { step: StepInstance; ctx: PreviewContext }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <PreviewHeader step={step} ctx={ctx} icon={mdiShieldCheckOutline} />
        <div className="px-5 pb-4 space-y-3">
          <div className="rounded-lg border border-[#DDD] bg-[#FAFAFA] p-4 flex items-center gap-3">
            <Icon path={mdiFaceManOutline} size={1.4} color={STATLER_GOLD} />
            <div>
              <div className="text-[13px] font-semibold text-[#2B2B2B]">Take a selfie</div>
              <div className="text-[11px] text-[#666]">So we can match your face to your ID</div>
            </div>
          </div>
          <div className="rounded-lg border border-[#DDD] bg-[#FAFAFA] p-4 flex items-center gap-3">
            <Icon path={mdiCameraOutline} size={1.4} color={STATLER_GOLD} />
            <div>
              <div className="text-[13px] font-semibold text-[#2B2B2B]">Capture front of ID</div>
              <div className="text-[11px] text-[#666]">Photo of the side with your name</div>
            </div>
          </div>
          <div className="rounded-lg border border-[#DDD] bg-[#FAFAFA] p-4 flex items-center gap-3">
            <Icon path={mdiCameraOutline} size={1.4} color={STATLER_GOLD} />
            <div>
              <div className="text-[13px] font-semibold text-[#2B2B2B]">Capture back of ID</div>
              <div className="text-[11px] text-[#666]">Photo of the reverse side</div>
            </div>
          </div>
        </div>
      </div>
      <PrimaryCTA label="Start verification" />
    </div>
  );
}

function CreditCardPreview({ cfg, ctx }: { cfg: CreditCardConfig; ctx: PreviewContext }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto px-5 pt-6 pb-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
          style={{ backgroundColor: '#F4E9D8' }}
        >
          <Icon path={mdiCreditCardOutline} size={1.3} color={STATLER_GOLD} />
        </div>
        <h1 className="text-[20px] font-bold text-[#2B2B2B] leading-tight mb-4">Payment card</h1>
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-[#555]">Card number</label>
            <input type="text" className="mt-1 w-full h-9 px-2.5 rounded-md border border-[#DDD] bg-white text-[12px]" placeholder="1234 1234 1234 1234" disabled />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-[#555]">Expiry</label>
              <input type="text" className="mt-1 w-full h-9 px-2.5 rounded-md border border-[#DDD] bg-white text-[12px]" placeholder="MM / YY" disabled />
            </div>
            {cfg.requireCvc && (
              <div>
                <label className="text-[11px] font-semibold text-[#555]">CVC</label>
                <input type="text" className="mt-1 w-full h-9 px-2.5 rounded-md border border-[#DDD] bg-white text-[12px]" placeholder="123" disabled />
              </div>
            )}
          </div>
          {cfg.requireBillingAddress && (
            <div className="space-y-2 pt-2 border-t border-[#EEE]">
              <p className="text-[11px] font-semibold text-[#555] uppercase tracking-wider">Billing address</p>
              <input type="text" className="w-full h-9 px-2.5 rounded-md border border-[#DDD] bg-white text-[12px]" placeholder="Address line 1" disabled />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" className="h-9 px-2.5 rounded-md border border-[#DDD] bg-white text-[12px]" placeholder="City" disabled />
                <input type="text" className="h-9 px-2.5 rounded-md border border-[#DDD] bg-white text-[12px]" placeholder="Postal code" disabled />
              </div>
            </div>
          )}
          {cfg.linkedDeposit && (
            <div className="text-[11px] text-[#666] bg-[#FAFAFA] border border-[#EEE] rounded p-2">
              A deposit authorization will be placed on this card at the next step.
            </div>
          )}
        </div>
      </div>
      <PrimaryCTA label="Add payment" />
    </div>
  );
}

function DepositCollectionPreview({ cfg, ctx }: { cfg: DepositCollectionConfig; ctx: PreviewContext }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto px-5 pt-6 pb-4 flex flex-col gap-3">
        <div
          className="w-14 h-14 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: '#F4E9D8' }}
        >
          <Icon path={mdiSafeSquareOutline} size={1.4} color={STATLER_GOLD} />
        </div>
        <h1 className="text-[22px] font-bold text-[#2B2B2B] leading-tight">Deposit authorization</h1>
        <div className="rounded-lg border border-[#DDD] bg-[#FAFAFA] p-4">
          <p className="text-[11px] uppercase tracking-wider text-[#888] font-semibold">
            Hold amount
          </p>
          <p className="text-[28px] font-bold text-[#2B2B2B] mt-1">
            {cfg.currency} {cfg.amount.toFixed(2)}
          </p>
          <p className="text-[11px] text-[#666] mt-1">
            {cfg.refundable ? 'Refundable at checkout' : 'Non-refundable'}
          </p>
        </div>
        <p className="text-[12px] text-[#555] leading-snug">
          {resolveText(cfg.description, ctx.language)}
        </p>
      </div>
      <PrimaryCTA label="Authorize hold" />
    </div>
  );
}

function LoyaltyWelcomePreview({ cfg, ctx }: { cfg: LoyaltyWelcomeConfig; ctx: PreviewContext }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto px-5 pt-6 pb-4 flex flex-col gap-3">
        <div
          className="w-14 h-14 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: '#F4E9D8' }}
        >
          <Icon path={mdiStarOutline} size={1.4} color={STATLER_GOLD} />
        </div>
        <h1 className="text-[22px] font-bold text-[#2B2B2B] leading-tight">
          {resolveText(cfg.heading, ctx.language)}
        </h1>
        <p className="text-[13px] text-[#555] leading-snug">
          {resolveText(cfg.body, ctx.language)}
        </p>
        <div className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[#888]">
          {cfg.programName}
        </div>
      </div>
      <PrimaryCTA label="Continue" />
    </div>
  );
}

function CompliancePreview({ cfg, ctx }: { cfg: ComplianceConfig; ctx: PreviewContext }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto px-5 pt-6 pb-4 flex flex-col gap-3">
        <div
          className="w-14 h-14 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: '#F4E9D8' }}
        >
          <Icon path={mdiScaleBalance} size={1.4} color={STATLER_GOLD} />
        </div>
        <h1 className="text-[22px] font-bold text-[#2B2B2B] leading-tight">
          {resolveText(cfg.heading, ctx.language)}
        </h1>
        <p className="text-[13px] text-[#555] leading-snug whitespace-pre-wrap">
          {resolveText(cfg.body, ctx.language)}
        </p>
        <div className="mt-auto text-[10px] uppercase tracking-wider text-[#888]">
          Regulation: {cfg.regulationRef}
        </div>
      </div>
      <PrimaryCTA label="I understand" />
    </div>
  );
}

function CompletionPreview({ cfg, ctx }: { cfg: CompletionConfig; ctx: PreviewContext }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto px-5 pt-8 pb-4 flex flex-col items-center text-center gap-3">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#F4E9D8' }}
        >
          <Icon path={mdiCheckCircleOutline} size={2.2} color={STATLER_GOLD} />
        </div>
        <h1 className="text-[24px] font-bold text-[#2B2B2B] leading-tight">
          {resolveText(cfg.heading, ctx.language)}
        </h1>
        <p className="text-[13px] text-[#555] leading-snug max-w-[280px]">
          {resolveText(cfg.body, ctx.language)}
        </p>
      </div>
      <PrimaryCTA label={resolveText(cfg.ctaLabel, ctx.language) || 'Done'} />
    </div>
  );
}

function NestedFlowPreview({ cfg, ctx }: { cfg: NestedFlowConfig; ctx: PreviewContext }) {
  const nested = useFlowById(cfg.nestedFlowId);
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto px-5 pt-6 pb-4 flex flex-col items-center text-center gap-3">
        <div
          className="w-14 h-14 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: '#F4F4F5' }}
        >
          <Icon path={mdiLinkVariant} size={1.4} color="#666" />
        </div>
        <h1 className="text-[18px] font-bold text-[#2B2B2B]">
          Nested flow entry point
        </h1>
        <p className="text-[12px] text-[#666] max-w-[280px]">
          At this point in the flow, the guest enters{' '}
          <strong>{nested?.name ?? cfg.nestedFlowId}</strong>. When finished, they return here.
        </p>
        {cfg.loopUntilComplete && (
          <p className="text-[11px] text-[#888] italic">
            Loops until all items are processed.
          </p>
        )}
      </div>
      <PrimaryCTA label="Enter sub-flow" />
    </div>
  );
}
