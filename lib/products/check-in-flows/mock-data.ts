/**
 * Mock Data
 *
 * Seeds for the prototype: all properties get default-generated flows,
 * plus richer nested-flow definitions (upsells, mobile key, accompanying
 * guest, guest profile) so the configurator can drill into them and
 * reveal meaningful step structure.
 */

import type {
  FlowDefinition,
  Property,
  StepInstance,
  FieldDef,
  LocalizedText,
} from './types';
import { PROPERTIES } from './properties';
import { generateDefaultFlowsForProperty } from './default-flow-generator';

let nestedIdCounter = 0;
function nestedStepId(flowId: string): string {
  return `${flowId}-step-${++nestedIdCounter}`;
}

function localize(en: string, it?: string, zh?: string): LocalizedText {
  const result: LocalizedText = { en };
  if (it) result.it = it;
  if (zh) result.zh = zh;
  return result;
}

// ── Nested flow definitions ──────────────────────────────

function buildUpsellsFlow(property: Property): FlowDefinition {
  const flowId = `${property.id}-upsells`;
  const steps: StepInstance[] = [
    {
      id: nestedStepId(flowId),
      templateId: 'completion',
      name: 'Upgrade Your Stay',
      kind: 'preset',
      isSkippable: true,
      order: 0,
      config: {
        kind: 'preset',
        presetType: 'completion',
        heading: localize('Enhance your stay'),
        body: localize(
          'Explore room upgrades, amenities, and early check-in options — all available now at a discounted rate.'
        ),
        ctaLabel: localize('Browse offers'),
      },
    },
    {
      id: nestedStepId(flowId),
      templateId: 'completion',
      name: 'Add-Ons Browse',
      kind: 'preset',
      isSkippable: true,
      order: 1,
      config: {
        kind: 'preset',
        presetType: 'completion',
        heading: localize('Available upgrades'),
        body: localize('Tap any item to add it to your reservation.'),
        ctaLabel: localize('Add to stay'),
      },
    },
    {
      id: nestedStepId(flowId),
      templateId: 'completion',
      name: 'Review Cart',
      kind: 'preset',
      isSkippable: false,
      order: 2,
      config: {
        kind: 'preset',
        presetType: 'completion',
        heading: localize('Review your additions'),
        body: localize('These charges will be added to your folio at checkout.'),
        ctaLabel: localize('Confirm'),
      },
    },
  ];

  return {
    id: flowId,
    propertyId: property.id,
    name: 'Upsells',
    description: 'Upgrade offers, add-ons, and early check-in. Slotted into main flows.',
    surface: 'web',
    kind: 'nested',
    steps,
    isDefault: true,
    isCustomized: false,
    updatedAt: new Date('2026-04-21'),
  };
}

function buildMobileKeyFlow(property: Property): FlowDefinition {
  const flowId = `${property.id}-mobile-key`;
  const steps: StepInstance[] = [
    {
      id: nestedStepId(flowId),
      templateId: 'completion',
      name: 'Request Mobile Key',
      kind: 'preset',
      isSkippable: true,
      order: 0,
      config: {
        kind: 'preset',
        presetType: 'completion',
        heading: localize('Skip the front desk'),
        body: localize('Get a secure mobile key sent to your phone. Unlock your room with a tap.'),
        ctaLabel: localize('Send me a key'),
      },
    },
    {
      id: nestedStepId(flowId),
      templateId: 'completion',
      name: 'Key Sent',
      kind: 'preset',
      isSkippable: false,
      order: 1,
      config: {
        kind: 'preset',
        presetType: 'completion',
        heading: localize('Check your phone'),
        body: localize('We sent your mobile key to the number on file. It will activate at check-in.'),
        ctaLabel: localize('Done'),
      },
    },
  ];

  return {
    id: flowId,
    propertyId: property.id,
    name: 'Mobile Key',
    description: 'Send a secure mobile key link to the guest\'s phone.',
    surface: 'web',
    kind: 'nested',
    steps,
    isDefault: true,
    isCustomized: false,
    updatedAt: new Date('2026-04-21'),
  };
}

function buildAccompanyingGuestFlow(property: Property): FlowDefinition {
  const flowId = `${property.id}-accompanying-guest`;
  const fields: FieldDef[] = [
    {
      id: `${flowId}-field-first-name`,
      type: 'text-input',
      semanticTag: 'guest-first-name',
      label: localize('First name'),
      required: true,
      autoSkipIfFilled: false,
      order: 0,
    },
    {
      id: `${flowId}-field-last-name`,
      type: 'text-input',
      semanticTag: 'guest-last-name',
      label: localize('Last name'),
      required: true,
      autoSkipIfFilled: false,
      order: 1,
    },
    {
      id: `${flowId}-field-dob`,
      type: 'date',
      semanticTag: 'guest-date-of-birth',
      label: localize('Date of birth'),
      required: true,
      autoSkipIfFilled: false,
      order: 2,
    },
    {
      id: `${flowId}-field-nationality`,
      type: 'country',
      semanticTag: 'guest-nationality',
      label: localize('Nationality'),
      required: true,
      autoSkipIfFilled: false,
      order: 3,
    },
  ];

  const steps: StepInstance[] = [
    {
      id: nestedStepId(flowId),
      templateId: 'reg-card',
      name: 'Guest Details',
      kind: 'schema-form',
      isSkippable: false,
      order: 0,
      config: { kind: 'schema-form', fields },
    },
    {
      id: nestedStepId(flowId),
      templateId: 'id-capture',
      name: 'Guest ID',
      kind: 'preset',
      isSkippable: false,
      order: 1,
      config: {
        kind: 'preset',
        presetType: 'id-capture',
        allowMultipleIds: false,
        idTypeOptions: [
          {
            id: `${flowId}-idtype-passport`,
            value: 'passport',
            label: localize('Passport'),
            order: 0,
          },
        ],
      },
    },
  ];

  return {
    id: flowId,
    propertyId: property.id,
    name: 'Accompanying Guest',
    description: 'Loops per additional guest. Each iteration collects name, DOB, nationality, ID.',
    surface: 'web',
    kind: 'nested',
    steps,
    isDefault: true,
    isCustomized: false,
    updatedAt: new Date('2026-04-21'),
  };
}

function buildGuestProfileFlow(property: Property): FlowDefinition {
  const flowId = `${property.id}-guest-profile`;
  const steps: StepInstance[] = [
    {
      id: nestedStepId(flowId),
      templateId: 'loyalty-welcome',
      name: 'Welcome Back',
      kind: 'preset',
      isSkippable: false,
      order: 0,
      config: {
        kind: 'preset',
        presetType: 'loyalty-welcome',
        heading: localize('Welcome back'),
        body: localize(
          'We have your details from your last visit. Confirm they\'re still accurate and we\'ll skip the rest.'
        ),
        programName: 'Guest Profile',
      },
    },
    {
      id: nestedStepId(flowId),
      templateId: 'completion',
      name: 'Confirm Profile',
      kind: 'preset',
      isSkippable: false,
      order: 1,
      config: {
        kind: 'preset',
        presetType: 'completion',
        heading: localize('Is everything still correct?'),
        body: localize(
          'Your contact info, address, and payment method on file. Tap to update anything that\'s changed.'
        ),
        ctaLabel: localize('Looks good'),
      },
    },
  ];

  return {
    id: flowId,
    propertyId: property.id,
    name: 'Guest Profile',
    description: 'Shown when a returning guest is recognized by email match.',
    surface: 'web',
    kind: 'nested',
    steps,
    isDefault: true,
    isCustomized: false,
    updatedAt: new Date('2026-04-21'),
  };
}

// ── Build initial state ───────────────────────────────────

export function buildInitialFlows(): FlowDefinition[] {
  return PROPERTIES.flatMap((property) => {
    const mainFlows = generateDefaultFlowsForProperty(property);
    const nested: FlowDefinition[] = [];

    if (property.features.hasUpsells) nested.push(buildUpsellsFlow(property));
    if (property.features.hasMobileKey) nested.push(buildMobileKeyFlow(property));
    if (property.features.hasAccompanyingGuests) nested.push(buildAccompanyingGuestFlow(property));
    if (property.features.hasGuestProfile) nested.push(buildGuestProfileFlow(property));

    return [...mainFlows, ...nested];
  });
}

export const INITIAL_FLOWS = buildInitialFlows();
