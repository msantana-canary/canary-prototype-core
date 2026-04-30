'use client';

/**
 * StepRenderer
 *
 * Dispatches to the appropriate per-step-type preview renderer, reading
 * step.config + PreviewContext from the store. All step types render
 * inside GuestPreviewShell (gold header + iOS status bar + progress bar
 * + Submit button), so the preview matches the production guest-facing
 * check-in look.
 */

import React from 'react';
import Icon from '@mdi/react';
import {
  mdiShieldCheckOutline,
  mdiCardAccountDetailsOutline,
  mdiCameraOutline,
  mdiCheckCircleOutline,
  mdiSafeSquareOutline,
  mdiStarOutline,
  mdiLinkVariant,
  mdiAlertCircleOutline,
} from '@mdi/js';
import {
  CanaryInputUnderline,
  CanaryInputCreditCardUnderline,
  CanarySelectUnderline,
  InputSize,
} from '@canary-ui/components';

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
  InputAtom,
  FieldDef,
} from '@/lib/products/check-in-flows/types';
import {
  resolveText,
  resolveStepAtoms,
  resolveOptionsForGuest,
} from '@/lib/products/check-in-flows/types';
import { useFlowById, useCheckInFlowsStore } from '@/lib/products/check-in-flows/store';
import { COUNTRY_MAP } from '@/lib/products/check-in-flows/condition-meta';
import { shouldShow } from '@/lib/products/check-in-flows/condition-evaluator';
import { GuestPreviewShell } from './GuestPreviewShell';
import { RegistrationCardPreview } from './RegistrationCardPreview';

const GOLD = '#926e27';

interface Props {
  step: StepInstance;
  ctx: PreviewContext;
  flow?: FlowDefinition;
}

export function StepRenderer({ step, ctx, flow }: Props) {
  if (!shouldShow(step.conditions, ctx)) {
    return <HiddenByConditions step={step} ctx={ctx} />;
  }

  const cfg = step.config;
  const stepIndex = flow?.steps.findIndex((s) => s.id === step.id) ?? 0;
  const total = flow?.steps.length ?? 1;

  if (cfg.kind === 'schema-form') {
    return (
      <SchemaFormPreview
        step={step}
        cfg={cfg}
        ctx={ctx}
        stepIndex={stepIndex}
        total={total}
        flow={flow}
      />
    );
  }
  if (cfg.kind === 'nested-flow') {
    return (
      <NestedFlowPreview
        step={step}
        cfg={cfg}
        ctx={ctx}
        stepIndex={stepIndex}
        total={total}
      />
    );
  }
  if (cfg.kind === 'preset') {
    const shellProps = {
      step,
      ctx,
      stepIndex,
      total,
    };
    switch (cfg.presetType) {
      case 'id-consent':
        return <IdConsentPreview cfg={cfg} {...shellProps} />;
      case 'id-capture':
        return <IdCapturePreview cfg={cfg} {...shellProps} />;
      case 'credit-card':
        return <CreditCardPreview cfg={cfg} {...shellProps} />;
      case 'deposit-collection':
        return <DepositCollectionPreview cfg={cfg} {...shellProps} />;
      case 'loyalty-welcome':
        return <LoyaltyWelcomePreview cfg={cfg} {...shellProps} />;
      case 'completion':
        return <CompletionPreview cfg={cfg} {...shellProps} />;
    }
  }

  return (
    <div className="px-5 py-8 text-center text-[13px] text-[#888]">
      No preview for this step type.
    </div>
  );
}

interface ShellProps {
  step: StepInstance;
  ctx: PreviewContext;
  stepIndex: number;
  total: number;
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

// ── Schema form preview (production-faithful via RegistrationCardPreview) ──

function SchemaFormPreview({
  step,
  cfg,
  ctx,
  stepIndex,
  total,
  flow,
}: ShellProps & { cfg: SchemaFormConfig; flow?: FlowDefinition }) {
  // Phase 5c: prefer atom resolution from Global Config over legacy cfg.fields.
  // Edits to atoms in Configuration tab now propagate live to the Flow preview.
  const allAtoms = useCheckInFlowsStore((s) => s.atoms);
  const surface = flow?.surface;

  // Phase 5e: atom-only path. Resolve atoms from Global, filter by surface
  // visibility + guest-attribute conditions, convert to FieldDef shape for
  // RegistrationCardPreview. Legacy cfg.fields path fully retired.
  const visibleFields: FieldDef[] = resolveStepAtoms(step, allAtoms, surface)
    .filter((a): a is InputAtom => a.kind === 'input')
    .map((a, idx) => atomToFieldDef(a, ctx, idx))
    .filter((f) => shouldShow(f.conditions, ctx));

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

// ── ID Consent ───────────────────────────────────────────

function IdConsentPreview({
  step,
  cfg,
  ctx,
  stepIndex,
  total,
}: ShellProps & { cfg: IdConsentConfig }) {
  return (
    <GuestPreviewShell
      title={step.name}
      totalSegments={total}
      completedSegments={stepIndex + 1}
      ctaLabel={resolveText(cfg.ctaLabel, ctx.language) || 'Continue'}
    >
      <div className="flex flex-col gap-6" style={{ padding: '32px 24px 24px' }}>
        <div className="flex flex-col items-center gap-4 text-center">
          <Icon path={mdiShieldCheckOutline} size={2} color={GOLD} />
          <h2
            style={{
              fontSize: 24,
              fontWeight: 600,
              lineHeight: '36px',
              color: '#000',
              margin: 0,
            }}
          >
            {resolveText(cfg.heading, ctx.language) || 'Identity verification'}
          </h2>
          <p
            style={{
              fontSize: 18,
              lineHeight: '28px',
              color: '#000',
              whiteSpace: 'pre-wrap',
            }}
          >
            {resolveText(cfg.body, ctx.language)}
          </p>
        </div>
        <p style={{ fontSize: 14, lineHeight: '22px', color: '#666' }}>
          {resolveText(cfg.acknowledgment, ctx.language)}
        </p>
      </div>
    </GuestPreviewShell>
  );
}

// ── ID Capture ───────────────────────────────────────────

function IdCapturePreview({
  step,
  cfg,
  ctx,
  stepIndex,
  total,
}: ShellProps & { cfg: IdCaptureConfig }) {
  const visibleOptions = cfg.idTypeOptions.filter((o) => shouldShow(o.conditions, ctx));
  const country = COUNTRY_MAP[ctx.guestNationalityCode]?.name ?? ctx.guestNationalityCode;

  const typeOptions = visibleOptions.map((o) => ({
    value: o.value,
    label: resolveText(o.label, ctx.language),
  }));

  return (
    <GuestPreviewShell
      title={step.name}
      totalSegments={total}
      completedSegments={stepIndex + 1}
      ctaLabel="Continue"
    >
      <div className="flex flex-col" style={{ padding: '32px 24px 24px', gap: 24 }}>
        <p style={{ fontSize: 18, lineHeight: '28px', color: '#000' }}>
          Please take a photo of your government-issued ID. We accept the
          following IDs for guests from {country}.
        </p>

        {typeOptions.length > 0 ? (
          <CanarySelectUnderline
            label="ID type"
            options={typeOptions}
            size={InputSize.LARGE}
          />
        ) : (
          <p style={{ fontSize: 14, color: '#D00', fontStyle: 'italic' }}>
            No ID types available for this nationality. Configure at least one
            unconditional option.
          </p>
        )}

        <CaptureBox label="Take photo of your ID" />
      </div>
    </GuestPreviewShell>
  );
}

function CaptureBox({ label }: { label: string }) {
  return (
    <div
      className="w-full rounded-lg flex flex-col items-center justify-center gap-8"
      style={{
        aspectRatio: '382/248',
        backgroundColor: `${GOLD}1A`,
        border: `1px solid ${GOLD}1A`,
      }}
    >
      <Icon path={mdiCameraOutline} size={1.2} color={GOLD} />
      <span style={{ fontSize: 18, fontWeight: 500, color: GOLD }}>{label}</span>
    </div>
  );
}

// ── Credit Card ──────────────────────────────────────────

function CreditCardPreview({
  step,
  cfg,
  ctx,
  stepIndex,
  total,
}: ShellProps & { cfg: CreditCardConfig }) {
  const intro = cfg.linkedDeposit
    ? 'We need your credit card to authorize a deposit hold for your stay.'
    : 'We need your credit card to authorize hotel charges and incidentals.';

  return (
    <GuestPreviewShell
      title={step.name}
      totalSegments={total}
      completedSegments={stepIndex + 1}
      ctaLabel="Add payment"
    >
      <div className="flex flex-col" style={{ padding: '32px 24px 24px', gap: 24 }}>
        <p style={{ fontSize: 18, lineHeight: '28px', color: '#000' }}>{intro}</p>

        <div className="flex flex-col" style={{ gap: 16 }}>
          <CanaryInputUnderline label="Name on card" size={InputSize.LARGE} />
          <CanaryInputCreditCardUnderline
            label="Credit card number"
            size={InputSize.LARGE}
          />
          <div className="flex" style={{ gap: 24 }}>
            <div className="flex-1">
              <CanaryInputUnderline
                label="Expiration date"
                size={InputSize.LARGE}
              />
            </div>
            {cfg.requireCvc && (
              <div className="flex-1">
                <CanaryInputUnderline label="CVV" size={InputSize.LARGE} />
              </div>
            )}
          </div>

          {cfg.requireBillingAddress && (
            <>
              <CanaryInputUnderline
                label="Billing address"
                size={InputSize.LARGE}
              />
              <div className="flex" style={{ gap: 24 }}>
                <div className="flex-1">
                  <CanaryInputUnderline label="City" size={InputSize.LARGE} />
                </div>
                <div className="flex-1">
                  <CanaryInputUnderline
                    label="Postal code"
                    size={InputSize.LARGE}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <p style={{ fontSize: 18, lineHeight: '28px', color: '#000' }}>
          We are{' '}
          <span style={{ fontWeight: 500, textDecoration: 'underline' }}>
            PCI-DSS Level-1 compliant
          </span>
          . Your information is safe and secure.
        </p>

        {cfg.linkedDeposit && (
          <p style={{ fontSize: 14, color: '#666', lineHeight: '22px' }}>
            A deposit authorization will be placed on this card at the next step.
          </p>
        )}
      </div>
    </GuestPreviewShell>
  );
}

// ── Deposit Collection ───────────────────────────────────

function DepositCollectionPreview({
  step,
  cfg,
  ctx,
  stepIndex,
  total,
}: ShellProps & { cfg: DepositCollectionConfig }) {
  return (
    <GuestPreviewShell
      title={step.name}
      totalSegments={total}
      completedSegments={stepIndex + 1}
      ctaLabel="Authorize hold"
    >
      <div className="flex flex-col" style={{ padding: '32px 24px 24px', gap: 24 }}>
        <div className="flex justify-center">
          <Icon path={mdiSafeSquareOutline} size={2} color={GOLD} />
        </div>
        <h2
          style={{
            fontSize: 24,
            fontWeight: 600,
            lineHeight: '36px',
            color: '#000',
            textAlign: 'center',
            margin: 0,
          }}
        >
          Deposit authorization
        </h2>
        <div
          style={{
            border: `1px solid ${GOLD}33`,
            borderRadius: 8,
            padding: '20px 16px',
            backgroundColor: `${GOLD}0A`,
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#666',
              margin: 0,
            }}
          >
            Hold amount
          </p>
          <p
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: '#000',
              margin: '4px 0 0',
            }}
          >
            {cfg.currency} {cfg.amount.toFixed(2)}
          </p>
          <p
            style={{
              fontSize: 14,
              color: '#666',
              margin: '4px 0 0',
            }}
          >
            {cfg.refundable ? 'Refundable at checkout' : 'Non-refundable'}
          </p>
        </div>
        <p style={{ fontSize: 18, lineHeight: '28px', color: '#000' }}>
          {resolveText(cfg.description, ctx.language)}
        </p>
      </div>
    </GuestPreviewShell>
  );
}

// ── Loyalty Welcome ──────────────────────────────────────

function LoyaltyWelcomePreview({
  step,
  cfg,
  ctx,
  stepIndex,
  total,
}: ShellProps & { cfg: LoyaltyWelcomeConfig }) {
  return (
    <GuestPreviewShell
      title={step.name}
      totalSegments={total}
      completedSegments={stepIndex + 1}
      ctaLabel="Continue"
    >
      <div className="flex flex-col" style={{ padding: '32px 24px 24px', gap: 24 }}>
        <div className="flex flex-col items-center gap-4 text-center">
          <Icon path={mdiStarOutline} size={2} color={GOLD} />
          <h2
            style={{
              fontSize: 24,
              fontWeight: 600,
              lineHeight: '36px',
              color: '#000',
              margin: 0,
            }}
          >
            {resolveText(cfg.heading, ctx.language)}
          </h2>
          <p style={{ fontSize: 18, lineHeight: '28px', color: '#000' }}>
            {resolveText(cfg.body, ctx.language)}
          </p>
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: GOLD,
            textAlign: 'center',
          }}
        >
          {cfg.programName}
        </div>
      </div>
    </GuestPreviewShell>
  );
}

// ── Completion ───────────────────────────────────────────

function CompletionPreview({
  step,
  cfg,
  ctx,
  stepIndex,
  total,
}: ShellProps & { cfg: CompletionConfig }) {
  return (
    <GuestPreviewShell
      title={step.name}
      totalSegments={total}
      completedSegments={total}
      ctaLabel={resolveText(cfg.ctaLabel, ctx.language) || 'Done'}
    >
      <div
        className="flex flex-col items-center justify-center text-center"
        style={{ padding: '48px 24px 24px', gap: 16, minHeight: '60%' }}
      >
        <Icon path={mdiCheckCircleOutline} size={3} color={GOLD} />
        <h2
          style={{
            fontSize: 28,
            fontWeight: 600,
            lineHeight: '36px',
            color: GOLD,
            margin: 0,
          }}
        >
          {resolveText(cfg.heading, ctx.language)}
        </h2>
        <p
          style={{
            fontSize: 18,
            lineHeight: '28px',
            color: '#000',
            maxWidth: 320,
          }}
        >
          {resolveText(cfg.body, ctx.language)}
        </p>
      </div>
    </GuestPreviewShell>
  );
}

// ── Nested Flow ──────────────────────────────────────────

function NestedFlowPreview({
  step,
  cfg,
  ctx,
  stepIndex,
  total,
}: ShellProps & { cfg: NestedFlowConfig }) {
  const nested = useFlowById(cfg.nestedFlowId);
  return (
    <GuestPreviewShell
      title={step.name}
      totalSegments={total}
      completedSegments={stepIndex + 1}
      ctaLabel="Enter sub-flow"
    >
      <div
        className="flex flex-col items-center justify-center text-center"
        style={{ padding: '48px 24px 24px', gap: 16, minHeight: '60%' }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#F4F4F5' }}
        >
          <Icon path={mdiLinkVariant} size={1.5} color="#666" />
        </div>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 600,
            lineHeight: '32px',
            color: '#000',
            margin: 0,
          }}
        >
          Sub-flow entry
        </h2>
        <p style={{ fontSize: 16, lineHeight: '24px', color: '#666', maxWidth: 320 }}>
          The guest enters{' '}
          <strong>{nested?.name ?? cfg.nestedFlowId}</strong> here. When finished,
          they return to this flow.
        </p>
        {cfg.loopUntilComplete && (
          <p style={{ fontSize: 14, fontStyle: 'italic', color: '#888' }}>
            Loops until all items are processed.
          </p>
        )}
      </div>
    </GuestPreviewShell>
  );
}

// ── Phase 5c helper: convert InputAtom to FieldDef shape ──

function atomToFieldDef(atom: InputAtom, ctx: PreviewContext, order: number): FieldDef {
  // Resolve the guest-active option variant. Variant model: first variant
  // whose segment conditions match wins; otherwise the default variant.
  const options = resolveOptionsForGuest(
    atom.optionVariants,
    (conditions) => shouldShow(conditions, ctx)
  );
  return {
    id: atom.id,
    type: atom.fieldType,
    semanticTag: atom.pmsTag,
    label: atom.label,
    placeholder: atom.placeholder,
    helperText: atom.helperText,
    required: atom.required,
    autoSkipIfFilled: atom.autoSkipIfFilled ?? false,
    options: options.length > 0 ? options : undefined,
    conditions: atom.conditions,
    order,
  };
}
