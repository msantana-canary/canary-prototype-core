/**
 * Check-In Configurator Store
 *
 * Zustand store for all configurator parameters + flow navigation state.
 * Sidebar toggles write to config; flow engine reads config to determine steps.
 */

import { create } from 'zustand';
import {
  CheckInConfigState,
  CheckInStep,
  OptionalStep,
  DepositStrategy,
  BorderRadius,
  FlowDirection,
  ViewMode,
  RegCardFieldGroups,
  IdOptions,
  PaymentOptions,
  AdditionalGuestFields,
  ReservationHeaderDisplay,
  ThemeConfig,
} from './types';
import { DEFAULT_CHECK_IN_CONFIG } from './default-config';
import { resolveIncludedSteps, clampStepIndex } from './check-in-flow-engine';

// ── Store Interface ─────────────────────────────────────────────────────

interface CheckInConfigStore extends CheckInConfigState {
  // Navigation state
  currentStepIndex: number;
  flowDirection: FlowDirection;
  viewMode: ViewMode;

  // ── Flow Step Actions ──
  setAddonsEnabled: (enabled: boolean) => void;
  setIdMode: (mode: OptionalStep) => void;
  setIdWithOCR: (enabled: boolean) => void;
  setCreditCardMode: (mode: OptionalStep) => void;
  setCreditCardPhotosEnabled: (enabled: boolean) => void;
  setAdditionalGuestsEnabled: (enabled: boolean) => void;

  // ── Registration Card Field Actions ──
  setRegCardField: (field: keyof RegCardFieldGroups, value: boolean) => void;

  // ── ID Options Actions ──
  setIdAcceptedType: (type: keyof IdOptions['acceptedTypes'], value: boolean) => void;
  setRequireBackPhoto: (value: boolean) => void;
  setRequireSelfie: (value: boolean) => void;

  // ── Payment Actions ──
  setDepositStrategy: (strategy: DepositStrategy) => void;
  setDepositAmount: (amount: number) => void;
  setSurchargeEnabled: (enabled: boolean) => void;
  setSurchargePercent: (percent: number) => void;
  setRequirePostalCode: (value: boolean) => void;

  // ── Additional Guest Fields Actions ──
  setAdditionalGuestField: (field: keyof AdditionalGuestFields, value: boolean) => void;

  // ── Reservation Header Actions ──
  setReservationHeaderField: (field: keyof ReservationHeaderDisplay, value: boolean) => void;

  // ── Theme Actions ──
  setThemeField: <K extends keyof ThemeConfig>(field: K, value: ThemeConfig[K]) => void;

  // ── Navigation Actions ──
  goToNextStep: () => void;
  goToPrevStep: () => void;
  goToStep: (index: number) => void;
  resetFlow: () => void;
  setViewMode: (mode: ViewMode) => void;

  // ── Reset ──
  resetConfig: () => void;
}

// ── Helper: update config and clamp step index ──────────────────────────

function withClamp(
  state: CheckInConfigState & { currentStepIndex: number },
  updates: Partial<CheckInConfigState>
): { currentStepIndex: number } {
  const newConfig = { ...state, ...updates };
  return {
    currentStepIndex: clampStepIndex(newConfig, state.currentStepIndex),
  };
}

// ── Store Creation ──────────────────────────────────────────────────────

export const useCheckInConfigStore = create<CheckInConfigStore>((set, get) => ({
  // Spread default config
  ...DEFAULT_CHECK_IN_CONFIG,

  // Navigation defaults
  currentStepIndex: 0,
  flowDirection: 'forward' as FlowDirection,
  viewMode: ViewMode.PHONE,

  // ── Flow Step Actions ──────────────────────────────────────────────

  setAddonsEnabled: (enabled) =>
    set((state) => ({
      addonsEnabled: enabled,
      ...withClamp(state, { addonsEnabled: enabled }),
    })),

  setIdMode: (mode) =>
    set((state) => {
      const updates: Partial<CheckInConfigState> = { idMode: mode };
      // If disabling ID, also disable OCR
      if (mode === OptionalStep.DISABLED) {
        updates.idWithOCR = false;
      }
      return { ...updates, ...withClamp(state, updates) };
    }),

  setIdWithOCR: (enabled) =>
    set((state) => ({
      idWithOCR: enabled,
      ...withClamp(state, { idWithOCR: enabled }),
    })),

  setCreditCardMode: (mode) =>
    set((state) => {
      const updates: Partial<CheckInConfigState> = { creditCardMode: mode };
      // If disabling CC, also disable CC photos
      if (mode === OptionalStep.DISABLED) {
        updates.creditCardPhotosEnabled = false;
      }
      return { ...updates, ...withClamp(state, updates) };
    }),

  setCreditCardPhotosEnabled: (enabled) =>
    set((state) => ({
      creditCardPhotosEnabled: enabled,
      ...withClamp(state, { creditCardPhotosEnabled: enabled }),
    })),

  setAdditionalGuestsEnabled: (enabled) =>
    set((state) => ({
      additionalGuestsEnabled: enabled,
      ...withClamp(state, { additionalGuestsEnabled: enabled }),
    })),

  // ── Registration Card Field Actions ────────────────────────────────

  setRegCardField: (field, value) =>
    set((state) => ({
      regCardFields: { ...state.regCardFields, [field]: value },
    })),

  // ── ID Options Actions ─────────────────────────────────────────────

  setIdAcceptedType: (type, value) =>
    set((state) => ({
      idOptions: {
        ...state.idOptions,
        acceptedTypes: { ...state.idOptions.acceptedTypes, [type]: value },
      },
    })),

  setRequireBackPhoto: (value) =>
    set((state) => ({
      idOptions: { ...state.idOptions, requireBackPhoto: value },
    })),

  setRequireSelfie: (value) =>
    set((state) => ({
      idOptions: { ...state.idOptions, requireSelfie: value },
    })),

  // ── Payment Actions ────────────────────────────────────────────────

  setDepositStrategy: (strategy) =>
    set({ paymentOptions: { ...get().paymentOptions, depositStrategy: strategy } }),

  setDepositAmount: (amount) =>
    set({ paymentOptions: { ...get().paymentOptions, depositAmount: amount } }),

  setSurchargeEnabled: (enabled) =>
    set({ paymentOptions: { ...get().paymentOptions, surchargeEnabled: enabled } }),

  setSurchargePercent: (percent) =>
    set({ paymentOptions: { ...get().paymentOptions, surchargePercent: percent } }),

  setRequirePostalCode: (value) =>
    set({ paymentOptions: { ...get().paymentOptions, requirePostalCode: value } }),

  // ── Additional Guest Fields Actions ────────────────────────────────

  setAdditionalGuestField: (field, value) =>
    set((state) => ({
      additionalGuestFields: { ...state.additionalGuestFields, [field]: value },
    })),

  // ── Reservation Header Actions ─────────────────────────────────────

  setReservationHeaderField: (field, value) =>
    set((state) => ({
      reservationHeader: { ...state.reservationHeader, [field]: value },
    })),

  // ── Theme Actions ──────────────────────────────────────────────────

  setThemeField: (field, value) =>
    set((state) => ({
      theme: { ...state.theme, [field]: value },
    })),

  // ── Navigation Actions ─────────────────────────────────────────────

  goToNextStep: () =>
    set((state) => {
      const included = resolveIncludedSteps(state);
      const nextIndex = Math.min(state.currentStepIndex + 1, included.length - 1);
      return { currentStepIndex: nextIndex, flowDirection: 'forward' as FlowDirection };
    }),

  goToPrevStep: () =>
    set((state) => {
      const prevIndex = Math.max(state.currentStepIndex - 1, 0);
      return { currentStepIndex: prevIndex, flowDirection: 'backward' as FlowDirection };
    }),

  goToStep: (index) =>
    set((state) => {
      const included = resolveIncludedSteps(state);
      const clamped = Math.max(0, Math.min(index, included.length - 1));
      return {
        currentStepIndex: clamped,
        flowDirection: clamped > state.currentStepIndex ? 'forward' : 'backward',
      };
    }),

  resetFlow: () => set({ currentStepIndex: 0, flowDirection: 'forward' as FlowDirection }),

  setViewMode: (mode) => set({ viewMode: mode }),

  // ── Reset ──────────────────────────────────────────────────────────

  resetConfig: () =>
    set({
      ...DEFAULT_CHECK_IN_CONFIG,
      currentStepIndex: 0,
      flowDirection: 'forward' as FlowDirection,
    }),
}));
