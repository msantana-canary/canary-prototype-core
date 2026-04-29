/**
 * Mock Data
 *
 * Seeds for the prototype: default-generated main flows per property,
 * plus an Upsells nested flow that slots into the main flow as a
 * reference — proof of the "flows can contain flows" composability
 * pattern without the weight of multiple nested demos.
 */

import type {
  FlowDefinition,
  Property,
  StepInstance,
  LocalizedText,
} from './types';
import { PROPERTIES } from './properties';
import { generateDefaultFlowsForProperty } from './default-flow-generator';

let nestedIdCounter = 0;
function nestedStepId(flowId: string): string {
  return `${flowId}-step-${++nestedIdCounter}`;
}

function localize(en: string): LocalizedText {
  return { en };
}

// ── Upsells nested flow ──────────────────────────────────

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
      atomIds: [],
      config: {
        kind: 'preset',
        presetType: 'completion',
        heading: localize('Enhance your stay'),
        body: localize(
          'Explore room upgrades, amenities, and early check-in options — available now at a discounted rate.'
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
      atomIds: [],
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
      atomIds: [],
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
    description: 'Upgrade offers, add-ons, and early check-in. Slotted into main flows as a nested step.',
    surface: 'web',
    kind: 'nested',
    steps,
    isDefault: true,
    isCustomized: false,
    updatedAt: new Date('2026-04-23'),
  };
}

// ── Build initial state ───────────────────────────────────

export function buildInitialFlows(): FlowDefinition[] {
  return PROPERTIES.flatMap((property) => {
    const mainFlows = generateDefaultFlowsForProperty(property);
    const nested: FlowDefinition[] = [];
    if (property.features.hasUpsells) nested.push(buildUpsellsFlow(property));
    return [...mainFlows, ...nested];
  });
}

export const INITIAL_FLOWS = buildInitialFlows();
