'use client';

/**
 * SettingsHandledElsewhere — read-only disclosure of settings that don't
 * appear in Manage app's Configuration tab.
 *
 * Three categories:
 * 1. Managed in Django (engineering-set, rarely changed): integration
 *    plumbing, payment gateway, webhooks, hotel-level operational defaults
 * 2. Deprecated (will be removed)
 * 3. Demo / internal
 *
 * Pulls from a hardcoded list for prototype. Production would source from
 * a metadata registry. Transparency surface only — no edit affordance.
 *
 * See spec doc: docs/CHECK_IN_CONFIGURATOR_ARCHITECTURE.md
 */

import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiChevronDown, mdiChevronUp, mdiInformationOutline } from '@mdi/js';
import { CanaryCard, colors } from '@canary-ui/components';

interface Entry {
  field: string;
  description: string;
}

interface Group {
  title: string;
  description?: string;
  entries: Entry[];
}

const DJANGO_GROUPS: Group[] = [
  {
    title: 'Product enablement (feature flags)',
    description: 'Whether each product/surface is on for this hotel.',
    entries: [
      { field: 'has_check_in_mobile', description: 'Mobile check-in enabled for this hotel.' },
      { field: 'has_apple_wallet', description: 'Apple Wallet integration for digital passes.' },
      { field: 'has_google_wallet', description: 'Google Wallet integration for digital passes.' },
      { field: 'has_id_document_ocr', description: 'OCR extraction from uploaded ID documents.' },
      { field: 'has_e_folio', description: 'E-folio product enabled.' },
      { field: 'has_auto_checkout', description: 'Auto-checkout product enabled.' },
      { field: 'has_ai_checkout', description: 'AI checkout via departure message reply.' },
      { field: 'has_onsite_booking', description: 'Allow guests to book rooms on-site.' },
    ],
  },
  {
    title: 'Step availability switches',
    description: 'Whether each step type is required / optional / disabled. Configures presence; configuration of an enabled step lives in Configuration tab.',
    entries: [
      { field: 'id_step / id_step_with_ocr', description: 'ID upload step + OCR mode.' },
      { field: 'credit_card_step', description: 'Credit card step required / optional / disabled.' },
      { field: 'additional_guests_step', description: 'Multi-guest check-in mode.' },
    ],
  },
  {
    title: 'PMS / payment plumbing',
    description: 'Engineering-owned integration settings. Changing these requires engineering judgment and may affect billing or integrations.',
    entries: [
      { field: 'pms_payment_slot_identifier', description: 'Folio window identifier for pushing payments to PMS.' },
      { field: 'pms_payment_slot_rate_code_mapping', description: 'Rate-code-to-payment-slot mappings.' },
      { field: 'pms_checkin_deposit_payment_slot_identifier', description: 'Folio window for deposits.' },
      { field: 'payment_gateway_config_id', description: 'Payment gateway UUID for check-in.' },
      { field: 'detect_funding_type_gateway_config_id', description: 'Gateway UUID for BIN lookup.' },
      { field: 'funding_type_detection_strategy', description: 'How card funding type is detected.' },
      { field: 'surcharge_calculation_strategy', description: 'Whether surcharge calculated at check-in or payment.' },
      { field: 'is_tokenizing_with_hotel_payment_gateway', description: 'Tokenize cards with hotel gateway.' },
      { field: 'disable_stripe_validation', description: 'Skip Stripe validation when submitting cards.' },
      { field: 'override_payment_gateway_to_post_raw_credit_card_to_pms', description: 'Post raw card data to PMS even when tokenizing.' },
      { field: 'pms_prepopulate_additional_guests', description: 'Prepopulate additional guests from PMS at ingestion.' },
      { field: 'require_preexisting_reservations', description: 'Require all check-ins to have an integration reservation.' },
    ],
  },
  {
    title: 'Surcharge rates',
    description: 'In Django for MVP — typo on these directly affects what hotels charge guests. Will move to Manage app once we have audit-logged confirmation guards.',
    entries: [
      { field: 'surcharge_credit_card_percentage', description: '% surcharge applied to credit cards.' },
      { field: 'surcharge_debit_card_percentage', description: '% surcharge applied to debit cards.' },
      { field: 'surcharge_prepaid_card_percentage', description: '% surcharge applied to prepaid cards.' },
      { field: 'surcharge_unknown_card_percentage', description: '% surcharge applied to unknown card types.' },
    ],
  },
  {
    title: 'Webhooks & credentials',
    description: 'Integration endpoint and auth credentials. Credentials are not exposed in Manage app for security.',
    entries: [
      { field: 'notification_webhook_url', description: 'Webhook called on check-in submission.' },
      { field: 'notification_webhook_auth_credentials', description: 'Auth credentials for notification webhook (Basic auth format).' },
    ],
  },
  {
    title: 'Hotel-level operational',
    description: 'Set at onboarding. Rare changes.',
    entries: [
      { field: 'default_guest_language_tablet', description: 'Default tablet language.' },
      { field: 'check_in_cut_off_hour', description: 'Hour after which check-in is unavailable.' },
      { field: 'check_in_cutoff_day', description: 'Same-day vs next-day cutoff behavior.' },
    ],
  },
];

const DEPRECATED_GROUPS: Group[] = [
  {
    title: 'Deprecated (will be removed)',
    entries: [
      { field: 'rollout_check_in_v2_level', description: 'V2 rollout flag — deprecate once V3 launches.' },
      { field: 'has_registration_card_canary_ui', description: 'Reg card UI rollout flag.' },
      { field: 'has_registration_card_settings', description: 'Reg card settings rollout flag.' },
      { field: 'theme', description: 'Use hotels.theme instead.' },
      { field: 'show_estimated_total', description: 'Legacy estimated total display.' },
      { field: 'hide_id_section_dashboard', description: 'Legacy dashboard ID section toggle.' },
      { field: 'integration_auto_post_to_pms', description: 'Legacy auto-post toggle.' },
      { field: 'integration_precheckin_method', description: 'Legacy precheckin method choice.' },
      { field: 'integration_auto_post_to_pms_* (multiple)', description: 'Per-field auto-post flags — superseded by reg card builder mappings.' },
    ],
  },
];

const DEMO_GROUPS: Group[] = [
  {
    title: 'Demo / internal',
    entries: [
      { field: 'has_id_card_recognition', description: 'Demo-only ID image validation.' },
      { field: 'demo_pane_has_additional_fields', description: 'Demo pane: additional fields toggle.' },
      { field: 'demo_room_numbers', description: 'Demo room numbers list.' },
    ],
  },
];

export function SettingsHandledElsewhere() {
  const [expanded, setExpanded] = useState(false);

  return (
    <CanaryCard padding="none" hasBorder>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-3 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <Icon path={mdiInformationOutline} size={0.65} color={colors.colorBlack4} />
          <span
            className="text-[13px] font-semibold"
            style={{ color: colors.colorBlack3 }}
          >
            Settings handled outside Manage app
          </span>
          <span className="text-[11px]" style={{ color: colors.colorBlack5 }}>
            (transparency only — no edit affordance)
          </span>
        </div>
        <Icon
          path={expanded ? mdiChevronUp : mdiChevronDown}
          size={0.7}
          color={colors.colorBlack4}
        />
      </button>

      {expanded && (
        <div
          className="px-5 pb-5"
          style={{ borderTop: `1px solid ${colors.colorBlack7}` }}
        >
          <p className="text-[12px] mt-3 mb-4" style={{ color: colors.colorBlack4 }}>
            These settings exist for this product but are not editable here.
            Either they live in Django admin (engineering-set), are deprecated
            and pending removal, or they're demo / internal-only.
          </p>

          <CategoryHeader label="Managed in Django" />
          {DJANGO_GROUPS.map((group) => (
            <GroupBlock key={group.title} group={group} />
          ))}

          <div className="mt-6">
            <CategoryHeader label="Deprecated" />
            {DEPRECATED_GROUPS.map((group) => (
              <GroupBlock key={group.title} group={group} />
            ))}
          </div>

          <div className="mt-6">
            <CategoryHeader label="Demo / internal" />
            {DEMO_GROUPS.map((group) => (
              <GroupBlock key={group.title} group={group} />
            ))}
          </div>
        </div>
      )}
    </CanaryCard>
  );
}

function CategoryHeader({ label }: { label: string }) {
  return (
    <h4
      className="text-[11px] font-bold uppercase tracking-wider mb-2"
      style={{ color: colors.colorBlack4 }}
    >
      {label}
    </h4>
  );
}

function GroupBlock({ group }: { group: Group }) {
  return (
    <div className="mb-4 last:mb-0">
      <h5
        className="text-[12px] font-semibold mb-1"
        style={{ color: colors.colorBlack2 }}
      >
        {group.title}
      </h5>
      {group.description && (
        <p className="text-[11px] mb-2" style={{ color: colors.colorBlack5 }}>
          {group.description}
        </p>
      )}
      <ul className="space-y-1">
        {group.entries.map((entry) => (
          <li
            key={entry.field}
            className="flex items-start gap-2 text-[11px]"
          >
            <code
              className="font-mono shrink-0"
              style={{
                color: colors.colorBlack3,
                backgroundColor: colors.colorBlack8,
                padding: '1px 6px',
                borderRadius: 3,
              }}
            >
              {entry.field}
            </code>
            <span style={{ color: colors.colorBlack5 }}>{entry.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
