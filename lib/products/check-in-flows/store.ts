import { useMemo } from 'react';
import { create } from 'zustand';
import type {
  FlowDefinition,
  Property,
  PreviewContext,
  StepInstance,
  FieldDef,
  Condition,
  CheckInConfig,
  LocalizedText,
  Atom,
} from './types';
import { generateDefaultFlowsForProperty } from './default-flow-generator';
import { DEFAULT_ATOMS } from './default-atoms';

// ── Default config (Statler New York) ───────────────────

export const DEFAULT_CONFIG: CheckInConfig = {
  idStepWithOcr: 'REQUIRED_WITH_OCR',
  requireIdCardBack: false,
  idOptions: ['passport', 'drivers-license', 'national-id'],
  showIdConsent: true,
  idConsentText: 'I consent to identity verification and the collection of my ID document.',
  idRetentionDays: 181,
  ocrFields: {
    gender: 'OPTIONAL',
    firstName: 'REQUIRED',
    lastName: 'REQUIRED',
    secondLastName: 'HIDDEN',
    dateOfBirth: 'REQUIRED',
    nationality: 'REQUIRED',
    country: 'OPTIONAL',
    documentNumber: 'REQUIRED',
    personalNumber: 'HIDDEN',
    countryOfIssue: 'OPTIONAL',
    dateOfIssue: 'OPTIONAL',
    dateOfExpiry: 'REQUIRED',
  },
  creditCardStep: 'REQUIRED',
  creditCardUploadPolicy: 'NEVER',
  requireCreditCardPostalCode: false,
  blockedCardTypes: [],
  blockedCardNetworks: [],
  disableViewFullCardInfo: false,
  depositStrategy: 'AUTHORIZE',
  isCanaryProcessingDeposits: true,
  showDepositSurchargeDetail: false,
  shouldSkipDepositIfRoutingRulesExist: false,
  surchargeCredit: 0,
  surchargeDebit: 0,
  surchargePrepaid: 0,
  surchargeUnknown: 0,
  additionalGuestsStep: 'DISABLED',
  additionalGuestsFields: {
    fullName: 'REQUIRED',
    firstName: 'REQUIRED',
    lastName: 'REQUIRED',
    dob: 'OPTIONAL',
    gender: 'HIDDEN',
    email: 'OPTIONAL',
    phone: 'OPTIONAL',
    nationality: 'REQUIRED',
    id: 'OPTIONAL',
    idNumber: 'OPTIONAL',
    address: 'HIDDEN',
    postalCode: 'HIDDEN',
  },
  hasSequentialSubmissionStamp: true,
  sequentialSubmissionStampPrefix: '#C-',
  autoCheckInEnabled: false,
  autoCheckInTime: '15:00',
  autoCheckInWindow: 12,
  autoCheckInRequirePreReg: true,
  autoCheckInRequireIdVerification: true,
  autoCheckInRequireIdNameMatch: true,
  hasAppleWallet: false,
  hasGoogleWallet: false,
  hasCheckInMobile: true,
  hasTabletReg: true,
  hasKiosk: true,
  checkInCutOffHour: 3,
  checkInCutoffDay: 'NEXT_DAY',
  notificationEmails: 'frontdesk@thestatler.com',
  messageAfterSuccessfulCheckIn: 'Please come to the front desk to pick up your room key.',
};

// ── Config → Property derivation ────────────────────────

export function configToProperty(config: CheckInConfig): Property {
  const hasId = config.idStepWithOcr !== 'DISABLED';
  const hasOcr = config.idStepWithOcr === 'REQUIRED_WITH_OCR' || config.idStepWithOcr === 'OPTIONAL_WITH_OCR';
  return {
    id: 'statler-nyc',
    name: 'Statler New York',
    brand: 'independent',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    currency: 'USD',
    address: '151 West 54th St, New York, NY 10019',
    defaultLanguages: ['en'],
    features: {
      hasCheckIn: true,
      hasTabletReg: config.hasTabletReg,
      hasKiosk: config.hasKiosk,
      hasMobileApp: false,
      hasIdVerification: hasId,
      hasOcr,
      hasIdEncodeIntegration: false,
      hasDepositCollection: config.isCanaryProcessingDeposits,
      hasUpsells: true,
      hasMobileKey: false,
      hasAccompanyingGuests: config.additionalGuestsStep !== 'DISABLED',
      hasGuestProfile: false,
      hasLoyaltyProgram: true,
      hasStbCompliance: false,
      hasAlloggiatiCompliance: false,
    },
  };
}

// ── Upsells nested flow builder ─────────────────────────

let nestedIdCounter = 0;
function nestedStepId(flowId: string): string {
  return `${flowId}-step-${++nestedIdCounter}`;
}
function loc(en: string): LocalizedText { return { en }; }

function buildUpsellsFlow(property: Property): FlowDefinition {
  const flowId = `${property.id}-upsells`;
  nestedIdCounter = 0;
  return {
    id: flowId,
    propertyId: property.id,
    name: 'Upsells',
    description: 'Upgrade offers, add-ons, and early check-in.',
    surface: 'web',
    kind: 'nested',
    steps: [
      { id: nestedStepId(flowId), templateId: 'completion', name: 'Upgrade Your Stay', kind: 'preset', isSkippable: true, order: 0, atomIds: [],
        config: { kind: 'preset', presetType: 'completion', heading: loc('Enhance your stay'), body: loc('Explore room upgrades, amenities, and early check-in options.'), ctaLabel: loc('Browse offers') } },
      { id: nestedStepId(flowId), templateId: 'completion', name: 'Add-Ons Browse', kind: 'preset', isSkippable: true, order: 1, atomIds: [],
        config: { kind: 'preset', presetType: 'completion', heading: loc('Available upgrades'), body: loc('Tap any item to add it to your reservation.'), ctaLabel: loc('Add to stay') } },
      { id: nestedStepId(flowId), templateId: 'completion', name: 'Review Cart', kind: 'preset', isSkippable: false, order: 2, atomIds: [],
        config: { kind: 'preset', presetType: 'completion', heading: loc('Review your additions'), body: loc('These charges will be added to your folio at checkout.'), ctaLabel: loc('Confirm') } },
    ],
    isDefault: true,
    isCustomized: false,
    updatedAt: new Date('2026-04-23'),
  };
}

// ── Build initial flows from config ─────────────────────

function buildFlowsFromConfig(config: CheckInConfig): FlowDefinition[] {
  const property = configToProperty(config);
  const mainFlows = generateDefaultFlowsForProperty(property);
  const nested: FlowDefinition[] = [];
  if (property.features.hasUpsells) nested.push(buildUpsellsFlow(property));
  return [...mainFlows, ...nested];
}

// ── Navigation state ────────────────────────────────────

export interface NavState {
  tab: 'configuration' | 'flows';
  flowId: string | null;
  stepId: string | null;
  isEditingStep: boolean;
  fieldId: string | null;
}

const DEFAULT_NAV: NavState = {
  tab: 'configuration',
  flowId: null,
  stepId: null,
  isEditingStep: false,
  fieldId: null,
};

// ── Preview context ─────────────────────────────────────

const DEFAULT_PREVIEW: PreviewContext = {
  guestNationalityCode: 'US',
  guestAge: 34,
  loyaltyTier: 'none',
  isReturningGuest: false,
  reservationSource: 'direct',
  rateCode: 'BAR',
  lengthOfStay: 2,
  language: 'en',
  formResponses: {},
};

// ── Store shape ─────────────────────────────────────────

interface CheckInFlowsState {
  config: CheckInConfig;
  expandedSections: string[];
  flows: FlowDefinition[];
  atoms: Atom[];                                            // Phase 1: Global Config atoms
  selectedAtomId: string | null;                            // Phase 6: split-pane selection
  nav: NavState;
  previewContext: PreviewContext;
  previewSurface: 'web' | 'mobile-web';

  // Config
  updateConfig: <K extends keyof CheckInConfig>(key: K, value: CheckInConfig[K]) => void;
  toggleSection: (sectionId: string) => void;

  // Atom CRUD (Phase 1 — Global Config)
  addAtom: (atom: Atom) => void;
  updateAtom: (atomId: string, updates: Partial<Atom>) => void;
  removeAtom: (atomId: string) => void;

  // Navigation
  setTab: (tab: NavState['tab']) => void;
  selectFlow: (flowId: string) => void;
  deselectFlow: () => void;
  selectStep: (stepId: string) => void;
  deselectStep: () => void;
  editStep: (stepId: string) => void;
  stopEditingStep: () => void;
  selectField: (fieldId: string) => void;
  deselectField: () => void;

  // Step CRUD
  addStep: (flowId: string, step: StepInstance) => void;
  removeStep: (flowId: string, stepId: string) => void;
  reorderSteps: (flowId: string, orderedIds: string[]) => void;
  updateStep: (flowId: string, stepId: string, updates: Partial<StepInstance>) => void;
  updateStepConfig: (flowId: string, stepId: string, updater: (cfg: StepInstance['config']) => StepInstance['config']) => void;
  updateStepConditions: (flowId: string, stepId: string, conditions: Condition[]) => void;

  // Atom slot management (Phase 5d — atomIds in step refs Global atoms)
  addAtomToStep: (flowId: string, stepId: string, atomId: string) => void;
  removeAtomFromStep: (flowId: string, stepId: string, atomId: string) => void;
  reorderStepAtoms: (flowId: string, stepId: string, orderedAtomIds: string[]) => void;

  // Atom selection (Phase 6 — split-pane Configuration tab)
  selectAtom: (atomId: string) => void;
  deselectAtom: () => void;

  // Preview
  setPreviewContext: (updates: Partial<PreviewContext>) => void;
  setPreviewSurface: (surface: 'web' | 'mobile-web') => void;

  // Flow regeneration
  regenerateFlowsForProperty: (propertyId: string) => void;
}

// ── Store ───────────────────────────────────────────────

export const useCheckInFlowsStore = create<CheckInFlowsState>((set, get) => ({
  config: DEFAULT_CONFIG,
  expandedSections: ['identity'],
  flows: buildFlowsFromConfig(DEFAULT_CONFIG),
  atoms: DEFAULT_ATOMS,
  selectedAtomId: null,
  nav: DEFAULT_NAV,
  previewContext: DEFAULT_PREVIEW,
  previewSurface: 'mobile-web' as const,

  // ── Atom CRUD (Phase 1 — Global Config) ───────────────
  addAtom: (atom) => set((state) => ({ atoms: [...state.atoms, atom] })),
  updateAtom: (atomId, updates) => set((state) => ({
    atoms: state.atoms.map((a) => (a.id === atomId ? ({ ...a, ...updates } as Atom) : a)),
  })),
  removeAtom: (atomId) => set((state) => ({
    atoms: state.atoms.filter((a) => a.id !== atomId),
    selectedAtomId: state.selectedAtomId === atomId ? null : state.selectedAtomId,
  })),

  // Atom selection (Phase 6)
  selectAtom: (atomId) => set({ selectedAtomId: atomId }),
  deselectAtom: () => set({ selectedAtomId: null }),

  // ── Config ────────────────────────────────────────────
  updateConfig: (key, value) => {
    set((state) => {
      const newConfig = { ...state.config, [key]: value };
      const newFlows = buildFlowsFromConfig(newConfig);
      return {
        config: newConfig,
        flows: newFlows,
        nav: { ...state.nav, stepId: null, isEditingStep: false, fieldId: null },
      };
    });
  },

  toggleSection: (sectionId) => {
    set((state) => ({
      expandedSections: state.expandedSections.includes(sectionId)
        ? state.expandedSections.filter((s) => s !== sectionId)
        : [...state.expandedSections, sectionId],
    }));
  },

  // ── Navigation ────────────────────────────────────────
  setTab: (tab) => set((state) => ({
    nav: { ...state.nav, tab, flowId: null, stepId: null, isEditingStep: false, fieldId: null },
  })),

  selectFlow: (flowId) => set((state) => {
    const flow = state.flows.find((f) => f.id === flowId);
    const firstStepId = flow?.steps[0]?.id ?? null;
    return {
      nav: { ...state.nav, flowId, stepId: firstStepId, isEditingStep: false, fieldId: null },
    };
  }),

  deselectFlow: () => set((state) => ({
    nav: { ...state.nav, flowId: null, stepId: null, isEditingStep: false, fieldId: null },
  })),

  selectStep: (stepId) => set((state) => ({
    nav: { ...state.nav, stepId, isEditingStep: false, fieldId: null },
  })),

  deselectStep: () => set((state) => ({
    nav: { ...state.nav, stepId: null, isEditingStep: false, fieldId: null },
  })),

  editStep: (stepId) => set((state) => ({
    nav: { ...state.nav, stepId, isEditingStep: true, fieldId: null },
  })),

  stopEditingStep: () => set((state) => ({
    nav: { ...state.nav, isEditingStep: false, fieldId: null },
  })),

  selectField: (fieldId) => set((state) => ({
    nav: { ...state.nav, fieldId },
  })),

  deselectField: () => set((state) => ({
    nav: { ...state.nav, fieldId: null },
  })),

  // ── Flow regeneration ─────────────────────────────────
  regenerateFlowsForProperty: () => {
    set((state) => ({
      flows: buildFlowsFromConfig(state.config),
    }));
  },

  // ── Step CRUD ─────────────────────────────────────────
  addStep: (flowId, step) => {
    set((state) => ({
      flows: state.flows.map((f) =>
        f.id === flowId
          ? { ...f, steps: [...f.steps, { ...step, order: f.steps.length }], isCustomized: true, updatedAt: new Date() }
          : f
      ),
    }));
  },

  removeStep: (flowId, stepId) => {
    set((state) => ({
      flows: state.flows.map((f) =>
        f.id === flowId
          ? { ...f, steps: f.steps.filter((s) => s.id !== stepId).map((s, idx) => ({ ...s, order: idx })), isCustomized: true, updatedAt: new Date() }
          : f
      ),
    }));
  },

  reorderSteps: (flowId, orderedIds) => {
    set((state) => ({
      flows: state.flows.map((f) => {
        if (f.id !== flowId) return f;
        const byId = Object.fromEntries(f.steps.map((s) => [s.id, s]));
        const reordered = orderedIds.map((id, idx) => ({ ...byId[id], order: idx }));
        return { ...f, steps: reordered, isCustomized: true, updatedAt: new Date() };
      }),
    }));
  },

  updateStep: (flowId, stepId, updates) => {
    set((state) => ({
      flows: state.flows.map((f) =>
        f.id === flowId
          ? { ...f, steps: f.steps.map((s) => (s.id === stepId ? { ...s, ...updates } : s)), isCustomized: true, updatedAt: new Date() }
          : f
      ),
    }));
  },

  updateStepConfig: (flowId, stepId, updater) => {
    set((state) => ({
      flows: state.flows.map((f) =>
        f.id === flowId
          ? { ...f, steps: f.steps.map((s) => (s.id === stepId ? { ...s, config: updater(s.config) } : s)), isCustomized: true, updatedAt: new Date() }
          : f
      ),
    }));
  },

  updateStepConditions: (flowId, stepId, conditions) => {
    get().updateStep(flowId, stepId, { conditions });
  },

  // ── Field CRUD ────────────────────────────────────────
  // ── Atom slot management (Phase 5d) ───────────────────
  addAtomToStep: (flowId, stepId, atomId) => {
    set((state) => ({
      flows: state.flows.map((flow) => {
        if (flow.id !== flowId) return flow;
        return {
          ...flow,
          steps: flow.steps.map((step) => {
            if (step.id !== stepId) return step;
            const current = step.atomIds ?? [];
            if (current.includes(atomId)) return step;
            return { ...step, atomIds: [...current, atomId] };
          }),
        };
      }),
    }));
  },

  removeAtomFromStep: (flowId, stepId, atomId) => {
    set((state) => ({
      flows: state.flows.map((flow) => {
        if (flow.id !== flowId) return flow;
        return {
          ...flow,
          steps: flow.steps.map((step) => {
            if (step.id !== stepId) return step;
            const current = step.atomIds ?? [];
            return { ...step, atomIds: current.filter((id) => id !== atomId) };
          }),
        };
      }),
    }));
  },

  reorderStepAtoms: (flowId, stepId, orderedAtomIds) => {
    set((state) => ({
      flows: state.flows.map((flow) => {
        if (flow.id !== flowId) return flow;
        return {
          ...flow,
          steps: flow.steps.map((step) => {
            if (step.id !== stepId) return step;
            return { ...step, atomIds: orderedAtomIds };
          }),
        };
      }),
    }));
  },

  // ── Preview ───────────────────────────────────────────
  setPreviewContext: (updates) => set((state) => ({
    previewContext: { ...state.previewContext, ...updates },
  })),
  setPreviewSurface: (surface) => set({ previewSurface: surface }),
}));

// ── Derived hooks ───────────────────────────────────────

export function useCurrentProperty(): Property {
  const config = useCheckInFlowsStore((s) => s.config);
  return useMemo(() => configToProperty(config), [config]);
}

export function useFlowsForCurrentProperty(): FlowDefinition[] {
  const flows = useCheckInFlowsStore((s) => s.flows);
  return useMemo(() => flows, [flows]);
}

export function useFlowById(flowId: string | null): FlowDefinition | undefined {
  const flows = useCheckInFlowsStore((s) => s.flows);
  return useMemo(() => (flowId ? flows.find((f) => f.id === flowId) : undefined), [flows, flowId]);
}

export function useStepById(flowId: string | null, stepId: string | null): StepInstance | undefined {
  const flow = useFlowById(flowId);
  return useMemo(() => (stepId ? flow?.steps.find((s) => s.id === stepId) : undefined), [flow, stepId]);
}

export function useGeneratedFlows(): FlowDefinition[] {
  const flows = useFlowsForCurrentProperty();
  return useMemo(() => flows.filter((f) => f.kind === 'main'), [flows]);
}

export const useConfigStore = useCheckInFlowsStore;

export const getCurrentPropertyImperative = (): Property => {
  return configToProperty(useCheckInFlowsStore.getState().config);
};

export const getFlowByIdImperative = (flowId: string): FlowDefinition | undefined =>
  useCheckInFlowsStore.getState().flows.find((f) => f.id === flowId);

export const getStepByIdImperative = (flowId: string, stepId: string): StepInstance | undefined =>
  useCheckInFlowsStore.getState().flows.find((f) => f.id === flowId)?.steps.find((s) => s.id === stepId);
