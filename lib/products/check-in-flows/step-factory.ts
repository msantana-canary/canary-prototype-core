/**
 * Step Factory
 *
 * Creates a fresh StepInstance from a template. Each template has
 * sensible defaults so a CS can add a step and immediately see it
 * appear in the flow; they can then customize via the step editor.
 */

import type {
  StepInstance,
  StepTemplateId,
  Property,
  LocalizedText,
  FieldDef,
} from './types';
import { getStepTemplateMeta } from './step-templates';

let idCounter = 0;
function nextId(prefix: string): string {
  return `${prefix}-${Date.now()}-${++idCounter}`;
}

function localize(en: string, it?: string, zh?: string): LocalizedText {
  const out: LocalizedText = { en };
  if (it) out.it = it;
  if (zh) out.zh = zh;
  return out;
}

export function createBlankStepFromTemplate(
  templateId: StepTemplateId,
  flowId: string,
  property: Property
): StepInstance {
  const template = getStepTemplateMeta(templateId);
  const stepId = nextId(`${flowId}-${templateId}`);

  const base = {
    id: stepId,
    templateId,
    name: template.displayName,
    kind: template.kind,
    isSkippable: false,
    order: 0,
    atomIds: [] as string[],
  };

  switch (templateId) {
    case 'reg-card':
    case 'ocr': {
      const fields: FieldDef[] = [
        {
          id: nextId('field'),
          type: 'text-input',
          semanticTag: 'guest-first-name',
          label: localize('First name'),
          required: true,
          autoSkipIfFilled: true,
          order: 0,
        },
        {
          id: nextId('field'),
          type: 'text-input',
          semanticTag: 'guest-last-name',
          label: localize('Last name'),
          required: true,
          autoSkipIfFilled: true,
          order: 1,
        },
        {
          id: nextId('field'),
          type: 'email',
          semanticTag: 'guest-email',
          label: localize('Email'),
          required: true,
          autoSkipIfFilled: true,
          order: 2,
        },
      ];
      return { ...base, config: { kind: 'schema-form', fields } };
    }

    case 'id-consent':
      return {
        ...base,
        config: {
          kind: 'preset',
          presetType: 'id-consent',
          heading: localize('Identity verification'),
          body: localize('We\'ll verify your identity using a government-issued ID.'),
          ctaLabel: localize('Continue'),
          acknowledgment: localize('I consent to identity verification.'),
        },
      };

    case 'id-capture':
      return {
        ...base,
        config: {
          kind: 'preset',
          presetType: 'id-capture',
          allowMultipleIds: false,
          idTypeOptions: [
            {
              id: nextId('opt'),
              value: 'passport',
              label: localize('Passport'),
              order: 0,
            },
          ],
        },
      };

    case 'credit-card':
      return {
        ...base,
        config: {
          kind: 'preset',
          presetType: 'credit-card',
          requireBillingAddress: true,
          requireCvc: true,
          linkedDeposit: property.features.hasDepositCollection,
        },
      };

    case 'deposit-collection':
      return {
        ...base,
        config: {
          kind: 'preset',
          presetType: 'deposit-collection',
          amount: 250,
          currency: property.currency,
          refundable: true,
          description: localize('A deposit hold will be placed on your card.'),
        },
      };

    case 'loyalty-welcome':
      return {
        ...base,
        isSkippable: true,
        config: {
          kind: 'preset',
          presetType: 'loyalty-welcome',
          heading: localize('Welcome, member'),
          body: localize('Enjoy your stay with us.'),
          programName: 'Loyalty Program',
        },
      };

    case 'completion':
      return {
        ...base,
        config: {
          kind: 'preset',
          presetType: 'completion',
          heading: localize('All set'),
          body: localize('Your information has been submitted.'),
          ctaLabel: localize('Done'),
        },
      };

    case 'upsells':
      return {
        ...base,
        isSkippable: true,
        config: {
          kind: 'nested-flow',
          nestedFlowId: `${property.id}-upsells`,
        },
      };

    case 'custom':
      return {
        ...base,
        name: 'New step',
        config: { kind: 'schema-form', fields: [] },
      };
  }
}
