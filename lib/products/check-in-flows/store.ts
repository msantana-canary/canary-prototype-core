/**
 * Check-In Flow Configuration Store (Zustand)
 *
 * Global state for the configurator:
 * - Which property (and brand variant) is being configured
 * - The flows for that property
 * - Navigation state (drill-down: landing → flow → step → field)
 * - Preview context (simulated guest nationality, loyalty, etc.)
 * - Current role (CS vs Hotel)
 *
 * Edits persist in Zustand for the session. Saving to backend is theater
 * (this is a prototype); the structure is production-shaped.
 */

import { useMemo } from 'react';
import { create } from 'zustand';
import type {
  FlowDefinition,
  Property,
  PreviewContext,
  UserRole,
  Surface,
  StepInstance,
  FieldDef,
  Condition,
  Brand,
} from './types';
import { PROPERTIES } from './properties';
import { INITIAL_FLOWS } from './mock-data';
import { generateDefaultFlowsForProperty } from './default-flow-generator';

// ── Navigation state ─────────────────────────────────────

export type NavLevel = 'landing' | 'flow' | 'step';

export interface NavState {
  level: NavLevel;
  flowId: string | null;
  stepId: string | null;
  editorTab: 'configuration' | 'conditions' | 'preview';
}

// ── Store shape ───────────────────────────────────────────

interface CheckInFlowsState {
  // Data
  properties: Property[];
  flows: FlowDefinition[];

  // Current selection
  currentPropertyId: string;

  // Brand override (Statler can toggle between Wyndham and Best Western)
  brandOverride: Partial<Record<string, Brand>>;  // { propertyId: brand }

  // Navigation
  nav: NavState;

  // Preview context (simulated guest)
  previewContext: PreviewContext;
  previewSurface: Surface;
  previewLanguage: string;

  // Role
  role: UserRole;

  // ── Property / brand ────────────────────────────────────
  setCurrentProperty: (propertyId: string) => void;
  setBrandOverride: (propertyId: string, brand: Brand) => void;
  resetBrandOverride: (propertyId: string) => void;
  togglePropertyFeature: (propertyId: string, feature: keyof Property['features']) => void;

  // ── Navigation ──────────────────────────────────────────
  goToLanding: () => void;
  goToFlow: (flowId: string) => void;
  goToStep: (flowId: string, stepId: string) => void;
  setEditorTab: (tab: NavState['editorTab']) => void;

  // ── Flow CRUD ───────────────────────────────────────────
  regenerateFlowsForProperty: (propertyId: string) => void;

  // ── Step CRUD ───────────────────────────────────────────
  addStep: (flowId: string, step: StepInstance) => void;
  removeStep: (flowId: string, stepId: string) => void;
  reorderSteps: (flowId: string, orderedIds: string[]) => void;
  updateStep: (flowId: string, stepId: string, updates: Partial<StepInstance>) => void;
  updateStepConfig: (flowId: string, stepId: string, updater: (cfg: StepInstance['config']) => StepInstance['config']) => void;
  updateStepConditions: (flowId: string, stepId: string, conditions: Condition[]) => void;

  // ── Field CRUD (schema-form steps) ──────────────────────
  addField: (flowId: string, stepId: string, field: FieldDef) => void;
  removeField: (flowId: string, stepId: string, fieldId: string) => void;
  reorderFields: (flowId: string, stepId: string, orderedIds: string[]) => void;
  updateField: (flowId: string, stepId: string, fieldId: string, updates: Partial<FieldDef>) => void;

  // ── Preview ────────────────────────────────────────────
  setPreviewContext: (updates: Partial<PreviewContext>) => void;
  setPreviewSurface: (surface: Surface) => void;
  setPreviewLanguage: (lang: string) => void;

  // ── Role ───────────────────────────────────────────────
  setRole: (role: UserRole) => void;
}

// ── Default preview context ──────────────────────────────

const DEFAULT_PREVIEW: PreviewContext = {
  guestNationalityCode: 'US',
  guestAge: 34,
  loyaltyTier: 'none',
  isReturningGuest: false,
  reservationSource: 'direct',
  rateCode: 'BAR',
  lengthOfStay: 2,
  language: 'en',
};

// ── Store ─────────────────────────────────────────────────

export const useCheckInFlowsStore = create<CheckInFlowsState>((set, get) => ({
  properties: PROPERTIES,
  flows: INITIAL_FLOWS,

  currentPropertyId: 'statler-nyc',
  brandOverride: {},

  nav: { level: 'landing', flowId: null, stepId: null, editorTab: 'configuration' },

  previewContext: DEFAULT_PREVIEW,
  previewSurface: 'web',
  previewLanguage: 'en',

  role: 'cs',

  // ── Property / brand ───────────────────────────────────
  setCurrentProperty: (propertyId) => {
    set({
      currentPropertyId: propertyId,
      nav: { level: 'landing', flowId: null, stepId: null, editorTab: 'configuration' },
    });
  },

  setBrandOverride: (propertyId, brand) => {
    set((state) => ({
      brandOverride: { ...state.brandOverride, [propertyId]: brand },
    }));
    // Regenerate flows for this property so ENCODE provider updates
    get().regenerateFlowsForProperty(propertyId);
  },

  resetBrandOverride: (propertyId) => {
    set((state) => {
      const next = { ...state.brandOverride };
      delete next[propertyId];
      return { brandOverride: next };
    });
    get().regenerateFlowsForProperty(propertyId);
  },

  togglePropertyFeature: (propertyId, feature) => {
    set((state) => ({
      properties: state.properties.map((p) =>
        p.id === propertyId
          ? { ...p, features: { ...p.features, [feature]: !p.features[feature] } }
          : p
      ),
    }));
    // Regenerate flows so the toggle affects the default flow
    get().regenerateFlowsForProperty(propertyId);
  },

  // ── Navigation ─────────────────────────────────────────
  goToLanding: () => set({ nav: { level: 'landing', flowId: null, stepId: null, editorTab: 'configuration' } }),
  goToFlow: (flowId) => set({ nav: { level: 'flow', flowId, stepId: null, editorTab: 'configuration' } }),
  goToStep: (flowId, stepId) => set({ nav: { level: 'step', flowId, stepId, editorTab: 'configuration' } }),
  setEditorTab: (tab) => set((state) => ({ nav: { ...state.nav, editorTab: tab } })),

  // ── Flow CRUD ──────────────────────────────────────────
  regenerateFlowsForProperty: (propertyId) => {
    set((state) => {
      const property = state.properties.find((p) => p.id === propertyId);
      if (!property) return state;
      // Use the getCurrentProperty logic (with brand override) only when this is the current property
      const brand = state.brandOverride[propertyId] ?? property.brand;
      const propWithBrand: Property =
        brand === property.brand
          ? property
          : { ...property, brand, features: { ...property.features, hasIdEncodeIntegration: brand === 'wyndham' } };

      // Keep flows from other properties, regenerate this one's
      const otherFlows = state.flows.filter((f) => f.propertyId !== propertyId);
      const newFlows = generateDefaultFlowsForProperty(propWithBrand);
      return { flows: [...otherFlows, ...newFlows] };
    });
  },

  // ── Step CRUD ──────────────────────────────────────────
  addStep: (flowId, step) => {
    set((state) => ({
      flows: state.flows.map((f) =>
        f.id === flowId
          ? {
              ...f,
              steps: [...f.steps, { ...step, order: f.steps.length }],
              isCustomized: true,
              updatedAt: new Date(),
            }
          : f
      ),
    }));
  },

  removeStep: (flowId, stepId) => {
    set((state) => ({
      flows: state.flows.map((f) =>
        f.id === flowId
          ? {
              ...f,
              steps: f.steps.filter((s) => s.id !== stepId).map((s, idx) => ({ ...s, order: idx })),
              isCustomized: true,
              updatedAt: new Date(),
            }
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
          ? {
              ...f,
              steps: f.steps.map((s) => (s.id === stepId ? { ...s, ...updates } : s)),
              isCustomized: true,
              updatedAt: new Date(),
            }
          : f
      ),
    }));
  },

  updateStepConfig: (flowId, stepId, updater) => {
    set((state) => ({
      flows: state.flows.map((f) =>
        f.id === flowId
          ? {
              ...f,
              steps: f.steps.map((s) => (s.id === stepId ? { ...s, config: updater(s.config) } : s)),
              isCustomized: true,
              updatedAt: new Date(),
            }
          : f
      ),
    }));
  },

  updateStepConditions: (flowId, stepId, conditions) => {
    get().updateStep(flowId, stepId, { conditions });
  },

  // ── Field CRUD (schema-form steps) ─────────────────────
  addField: (flowId, stepId, field) => {
    get().updateStepConfig(flowId, stepId, (cfg) => {
      if (cfg.kind !== 'schema-form') return cfg;
      return { ...cfg, fields: [...cfg.fields, { ...field, order: cfg.fields.length }] };
    });
  },

  removeField: (flowId, stepId, fieldId) => {
    get().updateStepConfig(flowId, stepId, (cfg) => {
      if (cfg.kind !== 'schema-form') return cfg;
      return {
        ...cfg,
        fields: cfg.fields.filter((f) => f.id !== fieldId).map((f, idx) => ({ ...f, order: idx })),
      };
    });
  },

  reorderFields: (flowId, stepId, orderedIds) => {
    get().updateStepConfig(flowId, stepId, (cfg) => {
      if (cfg.kind !== 'schema-form') return cfg;
      const byId = Object.fromEntries(cfg.fields.map((f) => [f.id, f]));
      return { ...cfg, fields: orderedIds.map((id, idx) => ({ ...byId[id], order: idx })) };
    });
  },

  updateField: (flowId, stepId, fieldId, updates) => {
    get().updateStepConfig(flowId, stepId, (cfg) => {
      if (cfg.kind !== 'schema-form') return cfg;
      return {
        ...cfg,
        fields: cfg.fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)),
      };
    });
  },

  // ── Preview ────────────────────────────────────────────
  setPreviewContext: (updates) => set((state) => ({ previewContext: { ...state.previewContext, ...updates } })),
  setPreviewSurface: (surface) => set({ previewSurface: surface }),
  setPreviewLanguage: (lang) => set((state) => ({
    previewContext: { ...state.previewContext, language: lang },
    previewLanguage: lang,
  })),

  // ── Role ───────────────────────────────────────────────
  setRole: (role) => set({ role }),
}));

// ── Derived hooks ─────────────────────────────────────────
// These select raw state and derive in useMemo — avoids the
// "getServerSnapshot should be cached" Zustand+React 19 trap.

/** The current property, with brand override applied. */
export function useCurrentProperty(): Property {
  const currentPropertyId = useCheckInFlowsStore((s) => s.currentPropertyId);
  const properties = useCheckInFlowsStore((s) => s.properties);
  const brandOverride = useCheckInFlowsStore((s) => s.brandOverride);
  return useMemo(() => {
    const base = properties.find((p) => p.id === currentPropertyId) ?? properties[0];
    const brand = brandOverride[currentPropertyId] ?? base.brand;
    if (brand !== base.brand) {
      return {
        ...base,
        brand,
        features: { ...base.features, hasIdEncodeIntegration: brand === 'wyndham' },
      };
    }
    return base;
  }, [properties, currentPropertyId, brandOverride]);
}

/** All flows belonging to the current property. */
export function useFlowsForCurrentProperty(): FlowDefinition[] {
  const currentPropertyId = useCheckInFlowsStore((s) => s.currentPropertyId);
  const flows = useCheckInFlowsStore((s) => s.flows);
  return useMemo(() => flows.filter((f) => f.propertyId === currentPropertyId), [flows, currentPropertyId]);
}

/** A single flow by ID (stable reference via useMemo). */
export function useFlowById(flowId: string | null): FlowDefinition | undefined {
  const flows = useCheckInFlowsStore((s) => s.flows);
  return useMemo(() => (flowId ? flows.find((f) => f.id === flowId) : undefined), [flows, flowId]);
}

/** A single step from a flow (stable reference via useMemo). */
export function useStepById(flowId: string | null, stepId: string | null): StepInstance | undefined {
  const flow = useFlowById(flowId);
  return useMemo(() => (stepId ? flow?.steps.find((s) => s.id === stepId) : undefined), [flow, stepId]);
}

// ── Imperative getters (for use outside render, e.g. in actions) ──

export const getCurrentPropertyImperative = (): Property => {
  const state = useCheckInFlowsStore.getState();
  const base = state.properties.find((p) => p.id === state.currentPropertyId) ?? state.properties[0];
  const brand = state.brandOverride[state.currentPropertyId] ?? base.brand;
  if (brand !== base.brand) {
    return {
      ...base,
      brand,
      features: { ...base.features, hasIdEncodeIntegration: brand === 'wyndham' },
    };
  }
  return base;
};

export const getFlowByIdImperative = (flowId: string): FlowDefinition | undefined =>
  useCheckInFlowsStore.getState().flows.find((f) => f.id === flowId);

export const getStepByIdImperative = (flowId: string, stepId: string): StepInstance | undefined =>
  useCheckInFlowsStore.getState().flows.find((f) => f.id === flowId)?.steps.find((s) => s.id === stepId);

