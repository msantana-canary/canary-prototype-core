/**
 * Team Chat (SPIKE) — shared state
 *
 * One tiny Zustand store shared by the header pill, the panel, the variant
 * container, and the dev variant-switcher. Lets you flip A/B/C/D live over the
 * same real product page and compare the container mechanic side by side.
 */

import { create } from 'zustand';
import type { GroupId } from './types';

export type ChatVariant = 'A' | 'B' | 'C' | 'D';

export const MIN_PANEL_WIDTH = 320;
export const MAX_PANEL_WIDTH = 560;
export const DEFAULT_PANEL_WIDTH = 384;
export const FOOTER_BAR_HEIGHT = 44;

interface SpikeStore {
  variant: ChatVariant;
  panelOpen: boolean;
  panelWidth: number;        // used by push variants (B/C)
  activeGroupId: GroupId;
  setVariant: (v: ChatVariant) => void;
  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;
  setPanelWidth: (w: number) => void;
  setActiveGroup: (id: GroupId) => void;
}

const clampWidth = (w: number) =>
  Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, w));

export const useSpikeStore = create<SpikeStore>((set) => ({
  variant: 'A',
  panelOpen: false,
  panelWidth: DEFAULT_PANEL_WIDTH,
  activeGroupId: 'front-desk',
  setVariant: (variant) => set({ variant }),
  togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
  openPanel: () => set({ panelOpen: true }),
  closePanel: () => set({ panelOpen: false }),
  setPanelWidth: (w) => set({ panelWidth: clampWidth(w) }),
  setActiveGroup: (activeGroupId) => set({ activeGroupId }),
}));

/** Human-readable descriptions shown in the dev variant-switcher. */
export const VARIANT_META: Record<
  ChatVariant,
  { label: string; mechanic: string; ref: string }
> = {
  A: {
    label: 'Overlay float',
    mechanic: 'Floats over the page — nothing reflows. Page stays put underneath.',
    ref: 'Salesforce Utility Bar / Messenger',
  },
  B: {
    label: 'Push + reflow',
    mechanic: 'Reserves a right gutter — the page compresses into the remaining width.',
    ref: 'Slack single-slot panel',
  },
  C: {
    label: 'Push + resize',
    mechanic: 'Push, but drag the left edge to resize. Find the width where both survive.',
    ref: 'OpenPhone drag-to-resize',
  },
  D: {
    label: 'Footer launcher',
    mechanic: 'Persistent bottom bar; panel pops up bottom-right. Watch it hit the Messages composer.',
    ref: 'Salesforce footer / Intercom',
  },
};
