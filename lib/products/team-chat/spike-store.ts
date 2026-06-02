/**
 * Team Chat (SPIKE) — shared state
 *
 * Container is a CONSISTENT GLOBAL LAYER over the whole suite — it never knows
 * what product is underneath. Two product-agnostic models under test:
 *   A — overlay layer : floats on top of any product; reflows nothing.
 *   B — shell gutter   : reserves a right gutter at the shell level; the product
 *                        reflows into the narrower viewport by its OWN rules.
 * (C resize and D footer were dropped — see git history.)
 *
 * Panel IA is group-list-first: open → list of groups → tap → thread → back.
 */

import { create } from 'zustand';
import type { GroupId } from './types';

export type ChatVariant = 'A' | 'B' | 'C' | 'D' | 'E';
export const PANEL_WIDTH = 384;

type PanelView = 'list' | 'thread';

interface SpikeStore {
  variant: ChatVariant;
  panelOpen: boolean;
  view: PanelView;
  activeGroupId: GroupId | null;
  setVariant: (v: ChatVariant) => void;
  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;
  openThread: (id: GroupId) => void;
  backToList: () => void;
}

export const useSpikeStore = create<SpikeStore>((set) => ({
  variant: 'A',
  panelOpen: false,
  view: 'list',
  activeGroupId: null,
  setVariant: (variant) => set({ variant }),
  togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen, view: s.panelOpen ? s.view : 'list' })),
  openPanel: () => set({ panelOpen: true, view: 'list' }),
  closePanel: () => set({ panelOpen: false }),
  openThread: (activeGroupId) => set({ activeGroupId, view: 'thread' }),
  backToList: () => set({ view: 'list', activeGroupId: null }),
}));

/** Descriptions shown in the dev variant-switcher. */
export const VARIANT_META: Record<ChatVariant, { label: string; mechanic: string; ref: string }> = {
  A: {
    label: 'Overlay layer',
    mechanic: 'Floats on top of any product — demands nothing, reflows nothing. Covers content while open.',
    ref: 'Salesforce Utility Bar / Messenger',
  },
  B: {
    label: 'Shell gutter',
    mechanic: 'Reserves a right gutter at the shell level; the product reflows into the narrower viewport by its own rules.',
    ref: 'Slack single-slot / shell push',
  },
  C: {
    label: 'Collapse nav to rail',
    mechanic: 'Hides the main sidebar and shows a collapsed icon rail (real products/icons from standardMainSidebarSections; hover to peek labels) so opening chat reclaims the nav width instead of squeezing the product.',
    ref: 'CanarySidebar MAIN, collapsed',
  },
  D: {
    label: 'D · overlay (compact)',
    mechanic: 'Compact messaging chrome (toolbar → sidebar header) + overlay panel. Compare vs A.',
    ref: 'vaporware compact inbox',
  },
  E: {
    label: 'D · gutter (compact)',
    mechanic: 'Compact messaging chrome (toolbar → sidebar header) + shell-gutter push. Compare vs B.',
    ref: 'vaporware compact inbox',
  },
};
