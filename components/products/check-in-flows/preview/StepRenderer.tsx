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
  mdiLinkVariant,
  mdiAlertCircleOutline,
} from '@mdi/js';

import type {
  StepInstance,
  FlowDefinition,
  IdCaptureConfig,
  IdConsentConfig,
  CreditCardConfig,
  DepositCollectionConfig,
  LoyaltyWelcomeConfig,
  CompletionConfig,
  NestedFlowConfig,
  PreviewContext,
  SchemaFormConfig,
} from '@/lib/products/check-in-flows/types';
import { resolveText } from '@/lib/products/check-in-flows/types';
import { useFlowById } from '@/lib/products/check-in-flows/store';
import { COUNTRY_MAP } from '@/lib/products/check-in-flows/condition-meta';
import { shouldShow } from '@/lib/products/check-in-flows/condition-evaluator';
import { GuestPreviewShell } from './GuestPreviewShell';
import { RegistrationCardPreview } from './RegistrationCardPreview';

interface Props {
  step: StepInstance;
  ctx: PreviewContext;
  flow?: FlowDefinition;
}

export function StepRenderer({ step, ctx, flow }: Props) {
  // Don't render anything if the step itself is hidden by conditions
  if (!shouldShow(step.conditions, ctx)) {
    return <HiddenByConditions step={step} ctx={ctx} />;
  }

  const cfg = step.config;

  if (cfg.kind === 'schema-form') {
    return <SchemaFormPreview step={step} cfg={cfg} ctx={ctx} flow={flow} />;
  }
  if (cfg.kind === 'nested-flow') {
    return <NestedFlowPreview cfg={cfg} ctx={ctx} />;
  }
  if (cfg.kind === 'preset') {
    switch (cfg.presetType) {
      case 'id-consent': return <IdConsentPreview cfg={cfg} ctx={ctx} />;
      case 'id-capture': return <IdCapturePreview cfg={cfg} ctx={ctx} />;
      case 'credit-card': return <CreditCardPreview cfg={cfg} ctx={ctx} />;
      case 'deposit-collection': return <DepositCollectionPreview cfg={cfg} ctx={ctx} />;
      case 'loyalty-welcome': return <LoyaltyWelcomePreview cfg={cfg} ctx={ctx} />;
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

// ── Schema form preview (production-faithful via GuestPreviewShell) ──

function SchemaFormPreview({
  step,
  cfg,
  ctx,
  flow,
}: {
  step: StepInstance;
  cfg: SchemaFormConfig;
  ctx: PreviewContext;
  flow?: FlowDefinition;
}) {
  const visibleFields = cfg.fields.filter((f) => shouldShow(f.conditions, ctx));
  const stepIndex = flow?.steps.findIndex((s) => s.id === step.id) ?? 0;
  const total = flow?.steps.length ?? 1;
  const isRegCard = step.templateId === 'reg-card';

  return (
    <GuestPreviewShell
      title={step.name}
      totalSegments={total}
      completedSegments={stepIndex + 1}
      ctaLabel="Submit"
    >
      {visibleFields.length === 0 ? (
        <p className="text-[12px] italic" style={{ padding: 24, color: '#888' }}>
          All fields hidden by conditions for this guest.
        </p>
      ) : (
        <RegistrationCardPreview
          fields={visibleFields}
          language={ctx.language}
          showReservationInfo={isRegCard}
          showHotelPolicies={isRegCard}
        />
      )}
    </GuestPreviewShell>
  );
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
