/**
 * Default Flow Generator
 *
 * Produces a default FlowDefinition for a given property + surface, based on:
 * - The property's feature flags (determines which steps appear)
 * - The property's country (adds regional compliance steps)
 * - The property's brand (chooses provider variants, e.g., ENCODE for Wyndham)
 * - Surface-specific variations (e.g., tablet-reg skips estimated arrival)
 *
 * This is what engineers would wire up server-side. In the prototype it runs
 * client-side so the Landing view can preview what each property sees out-of-
 * the-box and the brand toggle can re-generate in real time.
 */

import type {
  FlowDefinition,
  Property,
  StepInstance,
  StepTemplateId,
  Surface,
  FieldDef,
  ElementTag,
  LocalizedText,
} from './types';
import { getStepTemplateMeta } from './step-templates';

// ── Helpers ───────────────────────────────────────────────

let stepCounter = 0;
function nextStepId(flowId: string): string {
  return `${flowId}-step-${++stepCounter}`;
}

function localize(en: string, it?: string, zh?: string, ms?: string, es?: string): LocalizedText {
  const result: LocalizedText = { en };
  if (it) result.it = it;
  if (zh) result.zh = zh;
  if (ms) result.ms = ms;
  if (es) result.es = es;
  return result;
}

function makeField(
  order: number,
  type: FieldDef['type'],
  semanticTag: ElementTag | undefined,
  label: LocalizedText,
  opts: Partial<FieldDef> = {}
): FieldDef {
  return {
    id: `field-${semanticTag ?? type}-${order}`,
    type,
    semanticTag,
    label,
    required: true,
    autoSkipIfFilled: true,
    order,
    ...opts,
  };
}

// ── Default step builders ─────────────────────────────────

function buildRegCardStep(flowId: string, property: Property, surface: Surface): StepInstance {
  const isTabletReg = surface === 'tablet-reg';
  const isKiosk = surface === 'kiosk';

  const fields: FieldDef[] = [
    makeField(1, 'text-input', 'guest-first-name', localize('First name', 'Nome', '名', 'Nama depan')),
    makeField(2, 'text-input', 'guest-last-name', localize('Last name', 'Cognome', '姓', 'Nama keluarga')),
    makeField(3, 'email', 'guest-email', localize('Email', 'Email', '邮箱', 'Emel'), {
      autoSkipIfFilled: true,
    }),
    makeField(4, 'phone', 'guest-phone', localize('Phone', 'Telefono', '电话', 'Telefon')),
    makeField(5, 'text-input', 'address-line-1', localize('Address', 'Indirizzo', '地址', 'Alamat')),
    makeField(6, 'text-input', 'city', localize('City', 'Città', '城市', 'Bandar')),
    makeField(7, 'country', 'country', localize('Country', 'Paese', '国家', 'Negara')),
  ];

  // Estimated arrival — only on web/mobile (guest is remote), not tablet/kiosk
  if (!isTabletReg && !isKiosk) {
    fields.push(makeField(8, 'time-select', 'estimated-arrival-time', localize('Estimated arrival time', 'Orario di arrivo previsto')));
  }

  fields.push(makeField(9, 'text-area', 'special-requests', localize('Special requests', 'Richieste speciali', '特别要求'), { required: false }));
  fields.push(makeField(10, 'signature', 'signature', localize('Signature', 'Firma', '签名'), { autoSkipIfFilled: false }));

  return {
    id: nextStepId(flowId),
    templateId: 'reg-card',
    name: 'Registration Card',
    kind: 'schema-form',
    isSkippable: false,
    order: 0,
    config: { kind: 'schema-form', fields },
  };
}

function buildOcrStep(flowId: string): StepInstance {
  const fields: FieldDef[] = [
    makeField(1, 'text-input', 'guest-first-name', localize('First name')),
    makeField(2, 'text-input', 'guest-last-name', localize('Last name')),
    makeField(3, 'date', 'guest-date-of-birth', localize('Date of birth')),
    makeField(4, 'country', 'guest-nationality', localize('Nationality')),
    makeField(5, 'text-input', 'id-number', localize('ID number')),
    makeField(6, 'date', 'id-expiry-date', localize('ID expiry date')),
  ];
  return {
    id: nextStepId(flowId),
    templateId: 'ocr',
    name: 'ID Scan',
    kind: 'schema-form',
    isSkippable: true,
    order: 0,
    config: { kind: 'schema-form', fields },
  };
}

function buildIdConsentStep(flowId: string): StepInstance {
  return {
    id: nextStepId(flowId),
    templateId: 'id-consent',
    name: 'ID Consent',
    kind: 'preset',
    isSkippable: false,
    order: 0,
    config: {
      kind: 'preset',
      presetType: 'id-consent',
      heading: localize('Identity verification', 'Verifica identità', '身份验证'),
      body: localize(
        'To complete check-in securely, we need to verify your identity using a government-issued ID.',
        'Per completare il check-in in modo sicuro, dobbiamo verificare la tua identità utilizzando un documento di identità rilasciato dal governo.'
      ),
      ctaLabel: localize('Continue', 'Continua', '继续'),
      acknowledgment: localize(
        'I consent to identity verification and the collection of my ID document.',
        'Acconsento alla verifica dell\'identità e alla raccolta del mio documento di identità.'
      ),
    },
  };
}

function buildIdCaptureStep(flowId: string, _property: Property): StepInstance {
  // Default ID type options. The Driver's License + National ID options
  // ship with nationality conditions attached as demo examples of the
  // per-option conditional gating. Passport is always visible.
  return {
    id: nextStepId(flowId),
    templateId: 'id-capture',
    name: 'ID Capture',
    kind: 'preset',
    isSkippable: false,
    order: 0,
    config: {
      kind: 'preset',
      presetType: 'id-capture',
      allowMultipleIds: false,
      idTypeOptions: [
        {
          id: 'opt-passport',
          value: 'passport',
          label: localize('Passport'),
          order: 0,
        },
        {
          id: 'opt-drivers-license',
          value: 'drivers-license',
          label: localize('Driver\'s License'),
          order: 1,
          conditions: [
            {
              id: 'cond-it-dl',
              parameter: 'nationality',
              operator: 'equals',
              value: 'IT',
              action: 'show-option',
            },
          ],
        },
        {
          id: 'opt-national-id',
          value: 'national-id',
          label: localize('National ID'),
          order: 2,
          conditions: [
            {
              id: 'cond-eu-nid',
              parameter: 'nationality',
              operator: 'in',
              value: ['IT', 'FR', 'DE', 'ES', 'NL', 'BE', 'AT', 'PT', 'IE', 'FI', 'SE', 'DK', 'PL', 'CZ'],
              action: 'show-option',
            },
          ],
        },
      ],
    },
  };
}

function buildCreditCardStep(flowId: string, property: Property): StepInstance {
  return {
    id: nextStepId(flowId),
    templateId: 'credit-card',
    name: 'Payment Card',
    kind: 'preset',
    isSkippable: false,
    order: 0,
    config: {
      kind: 'preset',
      presetType: 'credit-card',
      requireBillingAddress: true,
      requireCvc: true,
      linkedDeposit: property.features.hasDepositCollection,
    },
  };
}

function buildDepositStep(flowId: string, property: Property): StepInstance {
  return {
    id: nextStepId(flowId),
    templateId: 'deposit-collection',
    name: 'Deposit',
    kind: 'preset',
    isSkippable: false,
    order: 0,
    config: {
      kind: 'preset',
      presetType: 'deposit-collection',
      amount: property.currency === 'EUR' ? 200 : property.currency === 'SGD' ? 300 : 250,
      currency: property.currency,
      refundable: true,
      description: localize(
        'A deposit hold will be authorized on your card and released at checkout.',
        'Verrà autorizzata una cauzione sulla tua carta e rilasciata al checkout.'
      ),
    },
  };
}

function buildLoyaltyWelcomeStep(flowId: string, property: Property): StepInstance {
  const programName =
    property.brand === 'wyndham' ? 'Wyndham Rewards' :
    property.brand === 'ihg' ? 'IHG One Rewards' :
    property.brand === 'marriott' ? 'Marriott Bonvoy' :
    'Loyalty';
  return {
    id: nextStepId(flowId),
    templateId: 'loyalty-welcome',
    name: 'Loyalty Welcome',
    kind: 'preset',
    isSkippable: true,
    order: 0,
    conditions: [
      {
        id: 'cond-loyalty',
        parameter: 'loyalty-member',
        operator: 'is-true',
        action: 'show',
      },
    ],
    config: {
      kind: 'preset',
      presetType: 'loyalty-welcome',
      heading: localize(`Welcome back, ${programName} member`),
      body: localize('As a valued loyalty member, you\'ll enjoy complimentary room upgrades when available.'),
      programName,
    },
  };
}

function buildUpsellsNestedStep(flowId: string, nestedFlowId: string): StepInstance {
  const template = getStepTemplateMeta('upsells');
  return {
    id: nextStepId(flowId),
    templateId: 'upsells',
    name: template.displayName,
    kind: 'nested-flow',
    isSkippable: true,
    order: 0,
    config: {
      kind: 'nested-flow',
      nestedFlowId,
    },
  };
}

function buildCompletionStep(flowId: string): StepInstance {
  return {
    id: nextStepId(flowId),
    templateId: 'completion',
    name: 'All Set',
    kind: 'preset',
    isSkippable: false,
    order: 0,
    config: {
      kind: 'preset',
      presetType: 'completion',
      heading: localize('You\'re all set', 'Tutto pronto', '完成', 'Siap', 'Todo listo'),
      body: localize('Your information has been submitted. We look forward to welcoming you.'),
      ctaLabel: localize('Done', 'Fatto', '完成'),
    },
  };
}

// ── The main generator ────────────────────────────────────

export function generateDefaultFlow(
  property: Property,
  surface: Surface,
  flowId: string,
  flowName: string
): FlowDefinition {
  const steps: StepInstance[] = [];
  const { features } = property;
  const isMobile = surface === 'mobile-web' || surface === 'mobile-app';

  // Reset counter so IDs are predictable per flow
  stepCounter = 0;

  // Registration card always comes first — collect guest identity
  steps.push(buildRegCardStep(flowId, property, surface));

  // Loyalty welcome (conditional — only for recognized members, after we know who they are)
  if (features.hasLoyaltyProgram) {
    steps.push(buildLoyaltyWelcomeStep(flowId, property));
  }

  // ID verification block
  if (features.hasOcr && features.hasIdVerification) {
    steps.push(buildOcrStep(flowId));
  }
  if (features.hasIdVerification) {
    steps.push(buildIdConsentStep(flowId));
    steps.push(buildIdCaptureStep(flowId, property));
  }

  // Credit card
  steps.push(buildCreditCardStep(flowId, property));

  // Deposit if enabled
  if (features.hasDepositCollection) {
    steps.push(buildDepositStep(flowId, property));
  }

  // Upsells (nested)
  if (features.hasUpsells) {
    steps.push(buildUpsellsNestedStep(flowId, `${property.id}-upsells`));
  }

  // Completion
  steps.push(buildCompletionStep(flowId));

  // Reorder
  steps.forEach((s, idx) => { s.order = idx; });

  return {
    id: flowId,
    propertyId: property.id,
    name: flowName,
    surface,
    kind: 'main',
    steps,
    isDefault: true,
    isCustomized: false,
    updatedAt: new Date('2026-04-21'),
  };
}

/** Generates the default main flows for a property: web + mobile-web (+ kiosk + tablet if enabled). */
export function generateDefaultFlowsForProperty(property: Property): FlowDefinition[] {
  const flows: FlowDefinition[] = [
    generateDefaultFlow(property, 'web', `${property.id}-web`, 'Web Check-In'),
    generateDefaultFlow(property, 'mobile-web', `${property.id}-mobile-web`, 'Mobile Check-In'),
  ];
  if (property.features.hasTabletReg) {
    flows.push(generateDefaultFlow(property, 'tablet-reg', `${property.id}-tablet-reg`, 'Tablet Registration'));
  }
  if (property.features.hasKiosk) {
    flows.push(generateDefaultFlow(property, 'kiosk', `${property.id}-kiosk`, 'Kiosk Check-In'));
  }
  return flows;
}
