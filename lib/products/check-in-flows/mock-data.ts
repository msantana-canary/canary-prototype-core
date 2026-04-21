/**
 * Mock Data
 *
 * Seeds for the prototype: all properties get default-generated flows,
 * plus a couple of nested-flow stubs (upsells, accompanying-guest) so the
 * configurator can drill into them.
 */

import type { FlowDefinition, Property } from './types';
import { PROPERTIES } from './properties';
import { generateDefaultFlowsForProperty } from './default-flow-generator';

// ── Nested flow stubs ─────────────────────────────────────

function buildUpsellsFlowStub(property: Property): FlowDefinition {
  return {
    id: `${property.id}-upsells`,
    propertyId: property.id,
    name: 'Upsells Flow',
    description: 'Slotted into main check-in flows as a nested step. Configured centrally.',
    surface: 'web',
    kind: 'nested',
    steps: [
      {
        id: `${property.id}-upsells-step-1`,
        templateId: 'upsells',
        name: 'Browse add-ons',
        kind: 'preset',
        isSkippable: true,
        order: 0,
        config: { kind: 'nested-flow', nestedFlowId: `${property.id}-upsells` },
      },
    ],
    isDefault: true,
    isCustomized: false,
    updatedAt: new Date('2026-04-21'),
  };
}

function buildMobileKeyFlowStub(property: Property): FlowDefinition {
  return {
    id: `${property.id}-mobile-key`,
    propertyId: property.id,
    name: 'Mobile Key Flow',
    description: 'Send a secure mobile key link to the guest\'s phone.',
    surface: 'web',
    kind: 'nested',
    steps: [
      {
        id: `${property.id}-mobile-key-step-1`,
        templateId: 'mobile-key',
        name: 'Request mobile key',
        kind: 'preset',
        isSkippable: true,
        order: 0,
        config: { kind: 'nested-flow', nestedFlowId: `${property.id}-mobile-key` },
      },
    ],
    isDefault: true,
    isCustomized: false,
    updatedAt: new Date('2026-04-21'),
  };
}

function buildAccompanyingGuestFlowStub(property: Property): FlowDefinition {
  return {
    id: `${property.id}-accompanying-guest`,
    propertyId: property.id,
    name: 'Accompanying Guest Flow',
    description: 'Loops per additional guest. Each iteration collects: name, DOB, nationality, ID.',
    surface: 'web',
    kind: 'nested',
    steps: [
      {
        id: `${property.id}-accompanying-guest-step-1`,
        templateId: 'accompanying-guest',
        name: 'Add guest info',
        kind: 'preset',
        isSkippable: false,
        order: 0,
        config: { kind: 'nested-flow', nestedFlowId: `${property.id}-accompanying-guest`, loopUntilComplete: true },
      },
    ],
    isDefault: true,
    isCustomized: false,
    updatedAt: new Date('2026-04-21'),
  };
}

function buildGuestProfileFlowStub(property: Property): FlowDefinition {
  return {
    id: `${property.id}-guest-profile`,
    propertyId: property.id,
    name: 'Guest Profile Flow',
    description: 'Shown when a returning guest is recognized by email match.',
    surface: 'web',
    kind: 'nested',
    steps: [
      {
        id: `${property.id}-guest-profile-step-1`,
        templateId: 'guest-profile',
        name: 'Recognize returning guest',
        kind: 'preset',
        isSkippable: true,
        order: 0,
        config: { kind: 'nested-flow', nestedFlowId: `${property.id}-guest-profile` },
      },
    ],
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

    if (property.features.hasUpsells) nested.push(buildUpsellsFlowStub(property));
    if (property.features.hasMobileKey) nested.push(buildMobileKeyFlowStub(property));
    if (property.features.hasAccompanyingGuests) nested.push(buildAccompanyingGuestFlowStub(property));
    if (property.features.hasGuestProfile) nested.push(buildGuestProfileFlowStub(property));

    return [...mainFlows, ...nested];
  });
}

export const INITIAL_FLOWS = buildInitialFlows();
